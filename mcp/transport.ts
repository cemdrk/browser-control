import { IncomingMessage, ServerResponse } from 'http';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { Server } from './server.ts';

type SessionMap = Map<string, any>;

export async function handleSSE(
  server: Server,
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  sessions: SessionMap
): Promise<void> {
  if (req.method === 'POST') {
    const sessionId = url.searchParams.get('sessionId');
    if (!sessionId) {
      res.statusCode = 400;
      res.end('Missing sessionId');
      return;
    }

    const transport = sessions.get(sessionId);
    if (!transport) {
      res.statusCode = 404;
      res.end('Session not found');
      return;
    }

    return await transport.handlePostMessage(req, res);
  } else if (req.method === 'GET') {
    const transport = new SSEServerTransport('/sse', res);
    sessions.set(transport.sessionId, transport);
    console.log(`create SSE session: ${transport.sessionId}`);
    const connection = await server.createConnection(transport);
    res.on('close', () => {
      console.log(`delete SSE session: ${transport.sessionId}`);
      sessions.delete(transport.sessionId);
      connection.close().catch((e: any) => console.log(e));
    });
    return;
  }

  res.statusCode = 405;
  res.end('Method not allowed');
}

export async function handleStreamable(
  server: Server,
  req: IncomingMessage,
  res: ServerResponse,
  sessions: SessionMap
): Promise<void> {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (sessionId) {
    const { transport } = sessions.get(sessionId) ?? {};
    if (!transport) {
      res.statusCode = 404;
      res.end('Session not found');
      return;
    }
    return await transport.handleRequest(req, res);
  }

  if (req.method === 'POST') {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => crypto.randomUUID(),
      onsessioninitialized: async (sessionId: string) => {
        console.log(`create http session: ${transport.sessionId}`);
        const connection = await server.createConnection(transport);
        sessions.set(sessionId, { transport, connection });
      }
    });

    transport.onclose = () => {
      const result = transport.sessionId ? sessions.get(transport.sessionId) : undefined;
      if (!result)
        return;

      try {
        sessions.delete(result.transport.sessionId);
      } catch (e) {
        console.log(e);
      }
      result.connection.close().catch((e: any) => console.log(e));
    };

    await transport.handleRequest(req, res);
    return;
  }

  res.statusCode = 400;
  res.end('Invalid request');
}
