import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { validate, eventUpdateSchema } from '@/lib/validation';

// GET /api/events/[id] - Get event detail
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: { creator: { select: { username: true, avatar: true, discordId: true } } },
  });

  if (!event) {
    return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
  }

  return NextResponse.json(event);
}

// PUT /api/events/[id] - Update event (creator or admin only)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { creator: true },
  });

  if (!event) {
    return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
  }

  // Check ownership or admin
  if (event.creator.discordId !== session!.user.discordId && !session!.user.isAdmin) {
    return NextResponse.json({ success: false, message: 'Not authorized to edit this event' }, { status: 403 });
  }

  const body = await request.json();
  const result = validate(eventUpdateSchema, body);
  if (!result.success) {
    return NextResponse.json({ success: false, message: 'Validation failed', errors: result.errors }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (result.data.title) updateData.title = result.data.title;
  if (result.data.description) updateData.description = result.data.description;
  if (result.data.dateTime) updateData.dateTime = new Date(result.data.dateTime);
  if (result.data.endDateTime) updateData.endDateTime = new Date(result.data.endDateTime);
  if (result.data.serverName !== undefined) updateData.serverName = result.data.serverName || null;
  if (result.data.category) updateData.category = result.data.category;
  if (result.data.imageUrl !== undefined) updateData.imageUrl = result.data.imageUrl || null;
  if (result.data.discordLink !== undefined) updateData.discordLink = result.data.discordLink || null;
  if (result.data.status) updateData.status = result.data.status;

  const updated = await prisma.event.update({ where: { id }, data: updateData });

  return NextResponse.json({ success: true, message: 'Event updated', event: updated });
}

// DELETE /api/events/[id] - Delete event (creator or admin only)
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const event = await prisma.event.findUnique({
    where: { id },
    include: { creator: true },
  });

  if (!event) {
    return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
  }

  if (event.creator.discordId !== session!.user.discordId && !session!.user.isAdmin) {
    return NextResponse.json({ success: false, message: 'Not authorized to delete this event' }, { status: 403 });
  }

  await prisma.event.delete({ where: { id } });

  return NextResponse.json({ success: true, message: 'Event deleted' });
}
