import { NextResponse } from 'next/server';
import { fetchServers } from '@/lib/gsh-api';

// GET /api/gsh/servers - Get GSH community servers (cached)
export async function GET() {
  try {
    const servers = await fetchServers();
    return NextResponse.json(servers);
  } catch (err) {
    console.error('Failed to fetch GSH servers:', err);
    return NextResponse.json({ error: 'Failed to fetch servers' }, { status: 502 });
  }
}
