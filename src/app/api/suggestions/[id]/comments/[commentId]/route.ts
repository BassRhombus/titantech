import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireModerator } from '@/lib/auth-helpers';

// DELETE /api/suggestions/[id]/comments/[commentId] - Delete comment (moderator only)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const { error, session } = await requireModerator();
  if (error) return error;

  const { id, commentId } = await params;

  const comment = await prisma.comment.findFirst({
    where: { id: commentId, suggestionId: id },
  });
  if (!comment) {
    return NextResponse.json({ success: false, message: 'Comment not found' }, { status: 404 });
  }

  await prisma.comment.delete({ where: { id: commentId } });
  console.log(`[Moderator ${session!.user.username}] Deleted comment ${commentId}`);

  return NextResponse.json({ success: true, message: 'Comment deleted successfully' });
}
