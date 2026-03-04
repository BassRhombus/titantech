import dgram from 'dgram';

export interface ServerQueryResult {
  online: boolean;
  players: number;
  maxPlayers: number;
  serverName: string;
  map: string;
  queryPort: number;
}

const A2S_INFO = Buffer.from([
  0xff, 0xff, 0xff, 0xff, 0x54,
  ...Buffer.from('Source Engine Query\0'),
]);

/**
 * Send an A2S_INFO query to a game server and parse the response.
 * Handles the challenge-response flow used by Path of Titans servers:
 * 1. Send A2S_INFO → server may respond with 0x41 (challenge) or 0x49 (info)
 * 2. If 0x41, resend A2S_INFO with 4-byte challenge appended → get 0x49 response
 */
function queryPort(ip: string, port: number, timeoutMs = 3000): Promise<ServerQueryResult | null> {
  return new Promise((resolve) => {
    const socket = dgram.createSocket('udp4');
    let settled = false;

    const cleanup = () => {
      if (!settled) {
        settled = true;
        socket.close();
      }
    };

    const timer = setTimeout(() => {
      cleanup();
      resolve(null);
    }, timeoutMs);

    socket.on('message', (msg) => {
      try {
        const type = msg.readUInt8(4);

        if (type === 0x41) {
          // Challenge response — extract 4-byte challenge and resend query with it
          const challenge = msg.slice(5, 9);
          const challengeQuery = Buffer.concat([A2S_INFO, challenge]);
          socket.send(challengeQuery, port, ip);
          return; // Don't close socket, wait for the real response
        }

        // Got actual info response (0x49)
        clearTimeout(timer);
        cleanup();
        const result = parseA2SResponse(msg, port);
        resolve(result);
      } catch {
        clearTimeout(timer);
        cleanup();
        resolve(null);
      }
    });

    socket.on('error', () => {
      clearTimeout(timer);
      cleanup();
      resolve(null);
    });

    socket.send(A2S_INFO, port, ip);
  });
}

/**
 * Parse an A2S_INFO response buffer.
 * Format: FF FF FF FF 49 <protocol> <name\0> <map\0> <folder\0> <game\0> <id:2> <players:1> <maxPlayers:1> ...
 * Some servers respond with a challenge first (FF FF FF FF 41 <challenge:4>), then we re-query.
 */
function parseA2SResponse(buf: Buffer, port: number): ServerQueryResult {
  let offset = 4; // skip FF FF FF FF header
  const type = buf.readUInt8(offset++);

  if (type !== 0x49) {
    throw new Error(`Unexpected response type: 0x${type.toString(16)}`);
  }

  // Protocol
  offset++; // skip protocol byte

  // Read null-terminated strings
  function readString(): string {
    const start = offset;
    while (offset < buf.length && buf[offset] !== 0) offset++;
    const str = buf.toString('utf8', start, offset);
    offset++; // skip null terminator
    return str;
  }

  const serverName = readString();
  const map = readString();
  readString(); // folder
  readString(); // game

  // Game ID (2 bytes)
  offset += 2;

  const players = buf.readUInt8(offset++);
  const maxPlayers = buf.readUInt8(offset++);

  return {
    online: true,
    players,
    maxPlayers,
    serverName,
    map,
    queryPort: port,
  };
}

/**
 * Smart port detection: try the given port, then ±1 through ±4.
 * Path of Titans query port is typically game port + 4.
 * Returns the query result with the correct port, or null if all fail.
 */
export async function queryServer(ip: string, port: number): Promise<ServerQueryResult | null> {
  // Try the exact port first
  const direct = await queryPort(ip, port, 2000);
  if (direct) return direct;

  // Try offsets: +1 to +5, then -1 to -5 (PoT query port can be game port + 4 or + 5)
  const offsets = [1, 2, 3, 4, 5, -1, -2, -3, -4, -5];
  for (const offset of offsets) {
    const tryPort = port + offset;
    if (tryPort < 1 || tryPort > 65535) continue;
    const result = await queryPort(ip, tryPort, 2000);
    if (result) return result;
  }

  return null;
}

/**
 * Resolve the correct query port for a given IP and user-entered port.
 * Returns the working query port, or the original port if none respond.
 */
export async function resolveQueryPort(ip: string, port: number): Promise<number> {
  const result = await queryServer(ip, port);
  return result ? result.queryPort : port;
}
