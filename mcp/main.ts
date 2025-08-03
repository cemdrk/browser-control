import http, { IncomingMessage, ServerResponse, Server as HTTPServer } from 'http';

import { Server as MCPServer } from './server.ts';
import { handleSSE, handleStreamable } from './transport.ts';

import { getHostIP, httpAddressToString } from './dnsResolve.ts';

import type { MCPConfig } from './types.ts';
import type { AddressInfo } from 'net';

const PORT: number = Number(process.env.MCP_PORT) || 8000;
const HOST: string = process.env.MCP_HOST || '0.0.0.0';

let CDP_ENDPOINT: string = process.env.MCP_CDP_ENDPOINT || 'http://127.0.0.1:9222';

// replace host.docker.internal with the host ip
CDP_ENDPOINT = CDP_ENDPOINT.replace('://host.docker.internal', `://${getHostIP()}`);


async function startHttpServer(config: { host: string; port: number }): Promise<HTTPServer> {
  const { host, port } = config;

  const httpServer = http.createServer();
  await new Promise<void>((resolve, reject) => {
    httpServer.on('error', reject);
    httpServer.listen(port, host, () => {
      resolve();
      httpServer.removeListener('error', reject);
    });
  });
  return httpServer;
}

function startHttpTransport(
  httpServer: HTTPServer,
  mcpServer: MCPServer
): void {
  const sseSessions = new Map<string, any>();
  const streamableSessions = new Map<string, any>();
  httpServer.on('request', async (req: IncomingMessage, res: ServerResponse) => {
    const u = new URL(`http://localhost${req.url}`);
    if (u.pathname.startsWith('/sse'))
      await handleSSE(mcpServer, req, res, u, sseSessions);
    else
      await handleStreamable(mcpServer, req, res, streamableSessions);
  });
  const url = httpAddressToString(httpServer.address() as AddressInfo);

  console.log(`Listening on ${url}/sse ${url}/mcp `);
}

const config: MCPConfig = {
  browser: { cdpEndpoint: CDP_ENDPOINT },
  server: { host: HOST, port: PORT },
  capabilities: [
    'core',
    'core-tabs',
    'core-install',
    'vision',
    'pdf',
  ],
  saveTrace: true,
};

const mcpServer = new MCPServer(config);

const httpServer = await startHttpServer(config.server);

startHttpTransport(httpServer, mcpServer);
