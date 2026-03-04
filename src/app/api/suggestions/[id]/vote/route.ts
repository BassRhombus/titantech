import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { standardLimit } from '@/lib/rate-limit';

// POST /api/suggestions/[id]/vote - Vote on a suggestion
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const rateLimited = await standardLimit();
  if (rateLimited) return rateLimited;

  const { id } = await params;
  const suggestion = await prisma.suggestion.findUnique({ where: { id } });
  if (!suggestion) {
    return NextResponse.json({ success: false, message: 'Suggestion not found' }, { status: 404 });
  }

  const updated = await prisma.suggestion.update({
    where: { id },
    data: { votes: { increment: 1 } },
  });

  return NextResponse.json({ success: true, message: 'Vote recorded', votes: updated.votes });
}
