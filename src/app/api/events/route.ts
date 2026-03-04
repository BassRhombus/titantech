import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, optionalAuth } from '@/lib/auth-helpers';
import { validate, eventSchema } from '@/lib/validation';
import { uploadLimit } from '@/lib/rate-limit';
import { sendEventWebhook } from '@/lib/discord-webhook';

// GET /api/events - List events with optional filters
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status') || 'active';

  const where: Record<string, unknown> = {};
  if (status) where.status = status; // empty string = no status filter (show all)
  if (category) where.category = category;

  const events = await prisma.event.findMany({
    where,
    include: { creator: { select: { username: true, avatar: true, discordId: true } } },
    orderBy: { dateTime: 'asc' },
  });

  return NextResponse.json(events);
}

// POST /api/events - Create a new event
export async function POST(request: Request) {
  const rateLimited = await uploadLimit();
  if (rateLimited) return rateLimited;

  const { error, session } = await requireAuth();
  if (error) return error;

  const body = await request.json();
  const result = validate(eventSchema, body);
  if (!result.success) {
    return NextResponse.json({ success: false, message: 'Validation failed', errors: result.errors }, { status: 400 });
  }

  // Find the user in DB by discordId
  const user = await prisma.user.findUnique({ where: { discordId: session!.user.discordId } });
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }

  // Only users with an approved server (or admins) can create events
  if (!session!.user.isAdmin) {
    const approvedServer = await prisma.serverSubmission.findFirst({
      where: { userId: user.id, status: 'approved' },
    });
    if (!approvedServer) {
      return NextResponse.json(
        { success: false, message: 'You must have an approved server to create events.' },
        { status: 403 }
      );
    }
  }

  const event = await prisma.event.create({
    data: {
      title: result.data.title,
      description: result.data.description,
      dateTime: new Date(result.data.dateTime),
      endDateTime: result.data.endDateTime ? new Date(result.data.endDateTime) : null,
      serverName: result.data.serverName || null,
      category: result.data.category,
      imageUrl: result.data.imageUrl || null,
      discordLink: result.data.discordLink || null,
      creatorId: user.id,
    },
    include: { creator: { select: { username: true } } },
  });

  // Send Discord webhook
  sendEventWebhook({
    title: event.title,
    description: event.description,
    dateTime: result.data.dateTime,
    category: event.category,
    serverName: event.serverName,
    creatorName: event.creator.username,
  }).catch(() => {}); // Fire and forget

  return NextResponse.json({ success: true, message: 'Event created successfully', event }, { status: 201 });
}
