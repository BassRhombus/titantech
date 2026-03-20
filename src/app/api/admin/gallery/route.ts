import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAdmin } from '@/lib/auth-helpers';

// GET /api/admin/gallery - List all screenshots (admin)
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const screenshots = await prisma.screenshot.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(screenshots);
}
