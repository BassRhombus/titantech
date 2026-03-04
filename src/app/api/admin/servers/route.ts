import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';

// GET /api/admin/servers - List all server submissions
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const servers = await prisma.serverSubmission.findMany({
    orderBy: { submittedAt: 'desc' },
  });

  return NextResponse.json(servers);
}
