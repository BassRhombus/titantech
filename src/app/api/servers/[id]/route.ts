import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { validate, serverEditSchema } from '@/lib/validation';
import { resolveQueryPort } from '@/lib/server-query';
import { parseFormData, validateImageFile, moveUpload, generateSecureFilename, deleteUpload } from '@/lib/upload';

// PUT /api/servers/[id] - Edit a server (owner or admin only)
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  // Find the server
  const server = await prisma.serverSubmission.findUnique({ where: { id } });
  if (!server) {
    return NextResponse.json({ success: false, message: 'Server not found' }, { status: 404 });
  }

  // Check ownership (owner by userId, username match, or admin)
  const isOwner =
    server.userId === session.user.id ||
    server.submittedBy === session.user.username ||
    server.ownerDiscord === session.user.username;
  const isAdmin = session.user.isAdmin;

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ success: false, message: 'You can only edit your own servers' }, { status: 403 });
  }

  try {
    const { fields, file } = await parseFormData(request);

    // Validate new image if provided
    let newImagePath: string | undefined;
    if (file) {
      const fileValidation = validateImageFile(file);
      if (!fileValidation.valid) {
        return NextResponse.json(
          { success: false, message: 'Invalid file', errors: fileValidation.errors },
          { status: 400 }
        );
      }
      const filename = generateSecureFilename(file.originalFilename);
      newImagePath = await moveUpload(file.filepath, 'servers', filename);
    }

    // Build update data from fields
    const updateFields: Record<string, unknown> = {};
    if (fields.name) updateFields.name = fields.name;
    if (fields.description) updateFields.description = fields.description;
    if (fields.discordInvite) updateFields.discordInvite = fields.discordInvite;
    if (fields.ownerDiscord) updateFields.ownerDiscord = fields.ownerDiscord;
    if (fields.serverIP) updateFields.serverIP = fields.serverIP;
    if (fields.queryPort) updateFields.queryPort = Number(fields.queryPort);
    if (fields.showIP !== undefined) updateFields.showIP = fields.showIP === 'true';

    // Validate the fields that were provided
    const result = validate(serverEditSchema, updateFields);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: result.errors },
        { status: 400 }
      );
    }

    // If IP or port changed, re-resolve query port
    if (result.data.serverIP || result.data.queryPort) {
      const ip = result.data.serverIP || server.serverIP;
      const port = result.data.queryPort || server.queryPort;
      result.data.queryPort = await resolveQueryPort(ip, port);
    }

    // Build the Prisma update payload
    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(result.data)) {
      if (value !== undefined) updateData[key] = value;
    }
    if (newImagePath) {
      // Delete old image
      if (server.imagePath) await deleteUpload(server.imagePath);
      updateData.imagePath = newImagePath;
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
