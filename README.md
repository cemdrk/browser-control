# Browser Control

A containerized browser automation server built on Playwright's Model Context Protocol (MCP), 
designed for robust, real-time browser control.

---

## Features

- **Headful (Non-Headless) Chromium**: Runs a full-featured, visible browser in a container.
- **Playwright MCP**: Exposes automation capabilities via the Model Context Protocol.
- **Dockerized**: Easy to deploy, update, and manage.
- **Extensible**: Supports multiple automation capabilities (core, tabs, install, vision, pdf).

---

## Project Structure

```
browser-control/
  ├── compose.yml
  ├── Dockerfile
  ├── conf/
  │   └── autostart
  └── mcp/
      ├── main.ts
      ├── server.ts
      ├── transport.ts
      ├── dnsresolve.ts
      └── package.json
```

---

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### Build and Run

1. **Clone the repository:**
   ```sh
   git clone https://github.com/cemdrk/browser-control/
   cd browser-control
   ```

2. **Build and start the service:**
   ```sh
   docker compose up 
   ```

3. **Access the server:**
   - Chromium GUI [http://localhost:3000](http://localhost:300)
   - MCP HTTP API: [http://localhost:8000/mcp](http://localhost:8000/mcp)
   - SSE endpoint: [http://localhost:8000/sse](http://localhost:8000/sse)

---

## Configuration

- **Ports:**
  - `8000`: MCP server (Streamable, SSE)
  - `3000`: Chromium GUI

- **Environment Variables (see `compose.yml`):**
  - `TZ`: Timezone (default: Europe/Istanbul)
  - `CHROME_CLI`: Additional Chromium CLI flags (default: `--remote-debugging-port=9222`)

- **Startup Script (`conf/autostart`):**
  - Starts both the MCP server and Chromium browser on container launch.

---

## MCP Configuration

This project supports a configuration file for MCP clients, typically located at `.cursor/mcp.json` in your home directory or project root. 
This file allows you to define and manage connections to MCP servers.

### Example `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "browserControl": {
      "url": "http://127.0.0.1:8000/mcp"
    }
  }
}
```


## Development

### MCP Server

- **Entry Point:** `mcp/main.js`
- **Start Script:** `npm run start` (runs `node main.js`)
- **Dependencies:** See `mcp/package.json`

### Docker

- **Base Image:** `lscr.io/linuxserver/chromium:latest`
- **Node.js:** Installs Node 22 LTS
- **App Directory:** `/.app` inside the container


## References

- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [LinuxServer.io Chromium](https://docs.linuxserver.io/images/docker-chromium/)
