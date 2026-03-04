import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireModerator } from '@/lib/auth-helpers';

// DELETE /api/suggestions/[id] - Delete suggestion (moderator only)
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireModerator();
  if (error) return error;

  const { id } = await params;
  const suggestion = await prisma.suggestion.findUnique({ where: { id } });
  if (!suggestion) {
    return NextResponse.json({ success: false, message: 'Suggestion not found' }, { status: 404 });
  }

  await prisma.suggestion.delete({ where: { id } });
  console.log(`[Moderator ${session!.user.username}] Deleted suggestion ${id}`);

  return NextResponse.json({ success: true, message: 'Suggestion deleted successfully' });
}
