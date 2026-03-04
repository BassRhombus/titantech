import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validate, suggestionSchema } from '@/lib/validation';
import { uploadLimit } from '@/lib/rate-limit';

// GET /api/suggestions - List all suggestions
export async function GET() {
  const suggestions = await prisma.suggestion.findMany({
    include: { comments: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(suggestions);
}

// POST /api/suggestions - Submit a suggestion
export async function POST(request: Request) {
  const rateLimited = await uploadLimit();
  if (rateLimited) return rateLimited;

  const body = await request.json();
  const result = validate(suggestionSchema, body);
  if (!result.success) {
    return NextResponse.json({ success: false, message: 'Validation failed', errors: result.errors }, { status: 400 });
  }

  const suggestion = await prisma.suggestion.create({
    data: {
      title: result.data.title,
      category: result.data.category,
      description: result.data.description,
      author: result.data.author || 'Anonymous',
    },
  });

  return NextResponse.json({ success: true, message: 'Suggestion submitted successfully', suggestion }, { status: 201 });
}
