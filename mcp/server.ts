import { createConnection } from '@playwright/mcp';

import type { MCPConfig } from './types.ts';

export class Server {
  config: MCPConfig;

  constructor(config: MCPConfig) {
    this.config = config;
  }

  async createConnection(transport: any): Promise<any> {
    const connection = await createConnection(this.config);

    await connection.server.connect(transport);
    return connection;
  }
}
