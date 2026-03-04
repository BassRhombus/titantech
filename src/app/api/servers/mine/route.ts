import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { optionalAuth } from '@/lib/auth-helpers';

// GET /api/servers/mine - Get user's submitted servers
export async function GET() {
  const { session } = await optionalAuth();

  if (!session) {
    return NextResponse.json([]);
  }

  const servers = await prisma.serverSubmission.findMany({
    where: {
      OR: [
        { userId: session.user.id },
        { submittedBy: session.user.username },
        { ownerDiscord: session.user.username },
      ],
    },
    orderBy: { submittedAt: 'desc' },
  });

  return NextResponse.json(servers);
}
