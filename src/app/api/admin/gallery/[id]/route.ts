import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';
import { deleteUpload } from '@/lib/upload';

// PUT /api/admin/gallery/[id] - Update screenshot status
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
  }

  const screenshot = await prisma.screenshot.findUnique({ where: { id } });
  if (!screenshot) {
    return NextResponse.json({ success: false, message: 'Screenshot not found' }, { status: 404 });
  }

  const updated = await prisma.screenshot.update({ where: { id }, data: { status } });

  return NextResponse.json({ success: true, screenshot: updated });
}

// DELETE /api/admin/gallery/[id] - Delete screenshot
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const screenshot = await prisma.screenshot.findUnique({ where: { id } });
  if (!screenshot) {
    return NextResponse.json({ success: false, message: 'Screenshot not found' }, { status: 404 });
  }

  await prisma.screenshot.delete({ where: { id } });
  if (screenshot.imagePath) await deleteUpload(screenshot.imagePath);

  return NextResponse.json({ success: true, message: 'Screenshot deleted' });
}
