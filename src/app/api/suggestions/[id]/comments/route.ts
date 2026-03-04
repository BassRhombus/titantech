import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validate, commentSchema } from '@/lib/validation';
import { checkCommentCooldown } from '@/lib/rate-limit';

// POST /api/suggestions/[id]/comments - Add a comment
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const cooldown = checkCommentCooldown();
  if (cooldown) return cooldown;

  const { id } = await params;
  const suggestion = await prisma.suggestion.findUnique({ where: { id } });
  if (!suggestion) {
    return NextResponse.json({ success: false, message: 'Suggestion not found' }, { status: 404 });
  }

  const body = await request.json();
  const result = validate(commentSchema, body);
  if (!result.success) {
    return NextResponse.json({ success: false, message: 'Validation failed', errors: result.errors }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      text: result.data.text,
      author: result.data.author || 'Anonymous',
      suggestionId: id,
    },
  });

  return NextResponse.json({ success: true, message: 'Comment added successfully', comment }, { status: 201 });
}
