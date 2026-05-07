import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { validate, serverEditSchema } from '@/lib/validation';
import { resolveQueryPort } from '@/lib/server-query';

// PUT /api/servers/[id] - Edit a server (owner or admin only)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const server = await prisma.serverSubmission.findUnique({ where: { id } });
  if (!server) {
    return NextResponse.json({ success: false, message: 'Server not found' }, { status: 404 });
  }

  const isOwner =
    server.userId === session.user.id ||
    server.submittedBy === session.user.username ||
    server.ownerDiscord === session.user.username;
  const isAdmin = session.user.isAdmin;

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ success: false, message: 'You can only edit your own servers' }, { status: 403 });
  }

  try {
    const body = await request.json();

    const updateFields: Record<string, unknown> = {};
    if (body.name) updateFields.name = body.name;
    if (body.description) updateFields.description = body.description;
    if (body.imageUrl) updateFields.imageUrl = body.imageUrl;
    if (body.discordInvite) updateFields.discordInvite = body.discordInvite;
    if (body.ownerDiscord) updateFields.ownerDiscord = body.ownerDiscord;
    if (body.serverIP) updateFields.serverIP = body.serverIP;
    if (body.queryPort !== undefined) updateFields.queryPort = Number(body.queryPort);
    if (body.showIP !== undefined) updateFields.showIP = body.showIP === true || body.showIP === 'true';

    const result = validate(serverEditSchema, updateFields);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: result.errors },
        { status: 400 }
      );
    }

    if (result.data.serverIP || result.data.queryPort) {
      const ip = result.data.serverIP || server.serverIP;
      const port = result.data.queryPort || server.queryPort;
      result.data.queryPort = await resolveQueryPort(ip, port);
    }

    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(result.data)) {
      if (value === undefined) continue;
      // imageUrl from input maps to imagePath column
      if (key === 'imageUrl') updateData.imagePath = value;
      else updateData[key] = value;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: false, message: 'No changes provided' }, { status: 400 });
    }

    const updated = await prisma.serverSubmission.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, message: 'Server updated successfully', server: updated });
  } catch (err) {
    console.error('Server edit error:', err);
    return NextResponse.json({ success: false, message: 'Failed to update server' }, { status: 500 });
  }
}
