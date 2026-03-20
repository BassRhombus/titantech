import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { deleteUpload } from '@/lib/upload';

// DELETE /api/gallery/[id] - Delete a screenshot (owner or admin)
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const screenshot = await prisma.screenshot.findUnique({ where: { id } });

  if (!screenshot) {
    return NextResponse.json({ success: false, message: 'Screenshot not found' }, { status: 404 });
  }

  if (screenshot.userId !== session.user.id && !session.user.isAdmin) {
    return NextResponse.json({ success: false, message: 'Not authorized' }, { status: 403 });
  }

  await prisma.screenshot.delete({ where: { id } });
  if (screenshot.imagePath) await deleteUpload(screenshot.imagePath);

  return NextResponse.json({ success: true, message: 'Screenshot deleted' });
}
