import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';
import { validate, serverStatusUpdateSchema } from '@/lib/validation';
import { deleteUpload } from '@/lib/upload';

// PUT /api/admin/servers/[id] - Update server status
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await request.json();
  const result = validate(serverStatusUpdateSchema, body);
  if (!result.success) {
    return NextResponse.json({ success: false, message: 'Validation failed', errors: result.errors }, { status: 400 });
  }

  const server = await prisma.serverSubmission.findUnique({ where: { id } });
  if (!server) {
    return NextResponse.json({ success: false, message: 'Server submission not found' }, { status: 404 });
  }

  const updateData: Record<string, unknown> = { status: result.data.status };
  if (result.data.reason) updateData.rejectionReason = result.data.reason;
  if (result.data.status === 'approved') updateData.approvedAt = new Date();
  if (result.data.status === 'rejected') updateData.rejectedAt = new Date();

  const updated = await prisma.serverSubmission.update({ where: { id }, data: updateData });

  return NextResponse.json({ success: true, message: 'Server submission status updated', item: updated });
}

// DELETE /api/admin/servers/[id] - Delete server submission
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const server = await prisma.serverSubmission.findUnique({ where: { id } });
  if (!server) {
    return NextResponse.json({ success: false, message: 'Server submission not found' }, { status: 404 });
  }

  await prisma.serverSubmission.delete({ where: { id } });
  if (server.imagePath) await deleteUpload(server.imagePath);

  return NextResponse.json({ success: true, message: 'Server submission deleted' });
}
