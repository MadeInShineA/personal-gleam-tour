# Personal Gleam Tour

[![Test](https://github.com/MadeInShineA/personal-gleam-tour/actions/workflows/test.yml/badge.svg)](https://github.com/MadeInShineA/personal-gleam-tour/actions/workflows/test.yml)
[![Website](https://img.shields.io/website-up-down-green-red/https/olivier.amacker.dev/personal-gleam-tour.svg)](https://olivier.amacker.dev/personal-gleam-tour)
[![Built With Nix](https://img.shields.io/badge/built_With-Nix-5277C3.svg?logo=nixos&labelColor=555555)](https://www.nixos.org/)
[![Built With Gleam](https://img.shields.io/badge/built_With-Gleam-E87FFF.svg?logo=gleam&labelColor=555555&logoColor=FFAFF3)](https://gleam.run/)

My personal interactive tour of the Gleam programming language.

> This project uses the structure and build system from the official [Gleam Language Tour](https://github.com/gleam-lang/language-tour) as a starting point.

## About

This is a personal learning project for exploring Gleam. The content is my own, but the project structure is based on the official Gleam Language Tour.

## Installation

### With Nix (Recommended)

```sh
nix develop
```

### Without Nix

Install the following dependencies:

- [Gleam](https://gleam.run/getting-started/installing/)
- [Erlang](https://www.erlang.org/downloads)
- [Bun](https://bun.sh/)

## Build and Run

A JavaScript runtime is required to run this program. Bun is used by default.

```sh
# Download a wasm version of the Gleam compiler (only needed once)
./bin/download-compiler

# Build the site and start a local server
gleam run
```

Then open http://localhost:8000/ in your browser.

> **Note:** A local HTTP server is required because browsers block ES modules on `file://` protocol for security reasons.

## Development with Live Reload

For automatic page reloads when editing Gleam files, use [watchexec](https://github.com/watchexec/watchexec) (included in the Nix flake):

```sh
watchexec --restart -e gleam -- gleam run
```

Page reload is enabled only when the server is started by watchexec. Saving a `.gleam` file restarts the process, and the page reloads when the server comes back. This works by:

1. Injecting a small script into HTML pages that maintains an SSE (Server-Sent Events) connection
2. When the server restarts, the connection drops
3. The script polls until the server is back, then reloads the page

The server also sets no-cache headers to prevent browser caching issues during development.
