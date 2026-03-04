import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { queryServer, type ServerQueryResult } from '@/lib/server-query';

// GET /api/servers/status - Query all approved servers for player counts
export async function GET() {
  const servers = await prisma.serverSubmission.findMany({
    where: { status: 'approved' },
    select: { id: true, serverIP: true, queryPort: true },
  });

  // Query all servers in parallel with a timeout
  const results: Record<string, ServerQueryResult | null> = {};
  const queries = servers.map(async (server) => {
    try {
      const result = await queryServer(server.serverIP, server.queryPort);
      results[server.id] = result;
    } catch {
      results[server.id] = null;
    }
  });

  await Promise.all(queries);

  return NextResponse.json(results);
}
