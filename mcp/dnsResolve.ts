import fs from 'fs';
import type { AddressInfo } from 'net';

export function getHostIP(): string | undefined {
    const hostsContent = fs.readFileSync('/etc/hosts', 'utf-8');
    const line = hostsContent
      .split('\n')
      .find(l => l.includes('host.docker.internal') && !l.trim().startsWith('#'));
    if (line) {
      const ip = line.trim().split(/\s+/)[0];
      return ip;
    }
    return undefined;
}

export function httpAddressToString(address: AddressInfo): string {
    const resolvedPort = address.port;
    let resolvedHost = address.family === 'IPv4' ? address.address : `[${address.address}]`;

    return `http://${resolvedHost}:${resolvedPort}`;
}
