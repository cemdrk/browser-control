export type MCPConfig = {
    browser: { cdpEndpoint: string };
    server: { host: string; port: number };
    capabilities: string[];
    saveTrace: boolean;
};
