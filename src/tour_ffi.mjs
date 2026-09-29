import { execFile } from "node:child_process";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";
import { promisify } from "node:util";

const PORT = 8000;
const ROOT = "public";

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".wasm": "application/wasm",
  ".ico": "image/x-icon",
};

const LIVERELOAD_SCRIPT = `
<script>
(function() {
  const es = new EventSource('/__livereload');
  es.onerror = async function() {
    es.close();
    while (true) {
      try {
        const res = await fetch('/__livereload_ping');
        if (res.ok) { location.reload(); return; }
      } catch {}
      await new Promise(r => setTimeout(r, 250));
    }
  };
})();
</script>
`;

const execFileAsync = promisify(execFile);

async function runningUnderWatchexec() {
  let pid = process.ppid;
  for (let i = 0; i < 10 && pid > 1; i++) {
    try {
      const { stdout } = await execFileAsync("ps", [
        "-o",
        "ppid=,comm=",
        "-p",
        String(pid),
      ]);
      const [ppid, ...comm] = stdout.trim().split(/\s+/);
      if (comm.join(" ").includes("watchexec")) return true;
      pid = Number(ppid);
    } catch {
      return false;
    }
  }
  return false;
}

export function isCI() {
  return !!process.env.CI;
}

export async function startServer() {
  const liveReload = await runningUnderWatchexec();

  const server = createServer(async (req, res) => {
    let urlPath = req.url.split("?")[0];
    if (urlPath === "/") urlPath = "/index.html";

    if (liveReload && urlPath === "/__livereload") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      });
      res.write("data: connected\n\n");
      req.on("close", () => res.end());
      return;
    }

    if (liveReload && urlPath === "/__livereload_ping") {
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("ok");
      return;
    }

    let filePath = join(ROOT, urlPath);

    try {
      const stats = await stat(filePath);
      if (stats.isDirectory()) {
        filePath = join(filePath, "index.html");
      }

      const ext = extname(filePath);
      const mime = MIME_TYPES[ext] || "application/octet-stream";
      // Only HTML is decoded as text so the live-reload script can be injected.
      // Binary assets (especially the compiler .wasm) must be sent as raw bytes.
      const content =
        ext === ".html" && liveReload
          ? (await readFile(filePath, "utf-8")).replace(
              "</body>",
              LIVERELOAD_SCRIPT + "</body>",
            )
          : await readFile(filePath);

      res.writeHead(200, {
        "Content-Type": mime,
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
      });
      res.end(content);
    } catch {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    }
  });

  server.listen(PORT, () => {
    console.log(`\nServer running at http://localhost:${PORT}/`);
    if (liveReload) console.log("Live reload enabled (watchexec)\n");
  });
}
