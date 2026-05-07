import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { validate, serverSubmissionSchema } from '@/lib/validation';
import { uploadLimit } from '@/lib/rate-limit';
import { resolveQueryPort } from '@/lib/server-query';

// GET /api/servers - List approved servers
export async function GET() {
  const servers = await prisma.serverSubmission.findMany({
    where: { status: 'approved' },
    orderBy: { approvedAt: 'desc' },
  });
  return NextResponse.json(servers);
}

// POST /api/servers - Submit a new server (requires Discord login)
export async function POST(request: Request) {
  const rateLimited = await uploadLimit();
  if (rateLimited) return rateLimited;

  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const body = await request.json();

    const result = validate(serverSubmissionSchema, {
      ...body,
      queryPort: body.queryPort !== undefined ? Number(body.queryPort) : undefined,
      showIP: body.showIP === true || body.showIP === 'true',
    });
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: result.errors },
        { status: 400 }
      );
    }

    const resolvedPort = await resolveQueryPort(result.data.serverIP, result.data.queryPort);

    const server = await prisma.serverSubmission.create({
      data: {
        name: result.data.name,
        description: result.data.description,
        imagePath: result.data.imageUrl,
        discordInvite: result.data.discordInvite,
        ownerDiscord: result.data.ownerDiscord,
        serverIP: result.data.serverIP,
        queryPort: resolvedPort,
        showIP: result.data.showIP,
        submittedBy: session.user.username,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Your server has been submitted and is pending review by our team.',
      id: server.id,
    });
  } catch (err) {
    console.error('Server submission error:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to submit server' },
      { status: 500 }
    );
  }
}
