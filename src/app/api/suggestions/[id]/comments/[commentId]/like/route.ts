import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { standardLimit } from '@/lib/rate-limit';

// POST /api/suggestions/[id]/comments/[commentId]/like - Like a comment
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const rateLimited = await standardLimit();
  if (rateLimited) return rateLimited;

  const { id, commentId } = await params;

  const comment = await prisma.comment.findFirst({
    where: { id: commentId, suggestionId: id },
  });
  if (!comment) {
    return NextResponse.json({ success: false, message: 'Comment not found' }, { status: 404 });
  }

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { likes: { increment: 1 } },
  });

  return NextResponse.json({ success: true, message: 'Like recorded', likes: updated.likes });
}
