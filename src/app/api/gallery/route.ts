import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { uploadLimit } from '@/lib/rate-limit';
import { parseFormData, validateImageFile, moveUpload, generateSecureFilename } from '@/lib/upload';

// GET /api/gallery - List all screenshots (newest first)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get('cursor');
  const limit = Math.min(Number(searchParams.get('limit')) || 24, 48);

  const screenshots = await prisma.screenshot.findMany({
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: 'desc' },
  });

  const hasMore = screenshots.length > limit;
  if (hasMore) screenshots.pop();

  return NextResponse.json({
    screenshots,
    nextCursor: hasMore ? screenshots[screenshots.length - 1].id : null,
  });
}

// POST /api/gallery - Upload a screenshot (requires login)
export async function POST(request: Request) {
  const rateLimited = await uploadLimit();
  if (rateLimited) return rateLimited;

  const { error, session } = await requireAuth();
  if (error) return error;

  try {
    const { fields, file } = await parseFormData(request);

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No image file provided.' },
        { status: 400 }
      );
    }

    const fileValidation = validateImageFile(file);
    if (!fileValidation.valid) {
      return NextResponse.json(
        { success: false, message: 'Invalid file', errors: fileValidation.errors },
        { status: 400 }
      );
    }

    const title = (fields.title || '').trim();
    if (!title || title.length < 1 || title.length > 100) {
      return NextResponse.json(
        { success: false, message: 'Title is required (1-100 characters).' },
        { status: 400 }
      );
    }

    const description = (fields.description || '').trim() || null;
    if (description && description.length > 500) {
      return NextResponse.json(
        { success: false, message: 'Description must be 500 characters or less.' },
        { status: 400 }
      );
    }

    const filename = generateSecureFilename(file.originalFilename);
    const imagePath = await moveUpload(file.filepath, 'gallery', filename);

    const screenshot = await prisma.screenshot.create({
      data: {
        title,
        description,
        imagePath,
        userId: session.user.id,
        username: session.user.username,
      },
    });

    return NextResponse.json({ success: true, screenshot });
  } catch (err) {
    console.error('Gallery upload error:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to upload screenshot' },
      { status: 500 }
    );
  }
}
