import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { validate, profileUpdateSchema, generatorTypeSchema } from '@/lib/validation';

// GET /api/profiles/[type]/[id] - Get a specific profile
export async function GET(_request: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { type, id } = await params;
  if (!generatorTypeSchema.safeParse(type).success) {
    return NextResponse.json({ success: false, message: 'Invalid generator type' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { discordId: session!.user.discordId } });
  if (!user) return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });

  const profile = await prisma.profile.findFirst({
    where: { id, userId: user.id, generatorType: type },
  });
  if (!profile) {
    return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, profile });
}

// PUT /api/profiles/[type]/[id] - Update a profile
export async function PUT(request: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { type, id } = await params;
  if (!generatorTypeSchema.safeParse(type).success) {
    return NextResponse.json({ success: false, message: 'Invalid generator type' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { discordId: session!.user.discordId } });
  if (!user) return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });

  const profile = await prisma.profile.findFirst({ where: { id, userId: user.id, generatorType: type } });
  if (!profile) {
    return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });
  }

  const body = await request.json();
  const result = validate(profileUpdateSchema, body);
  if (!result.success) {
    return NextResponse.json({ success: false, message: 'Validation failed', errors: result.errors }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {};
  if (result.data.name) updateData.name = result.data.name;
  if (result.data.data) updateData.data = result.data.data as any;

  const updated = await prisma.profile.update({ where: { id }, data: updateData as any });

  return NextResponse.json({
    success: true,
    message: 'Profile updated successfully',
    profile: { id: updated.id, name: updated.name, generatorType: updated.generatorType, updatedAt: updated.updatedAt },
  });
}

// DELETE /api/profiles/[type]/[id] - Delete a profile
export async function DELETE(_request: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { type, id } = await params;
  if (!generatorTypeSchema.safeParse(type).success) {
    return NextResponse.json({ success: false, message: 'Invalid generator type' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { discordId: session!.user.discordId } });
  if (!user) return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });

  const profile = await prisma.profile.findFirst({ where: { id, userId: user.id, generatorType: type } });
  if (!profile) {
    return NextResponse.json({ success: false, message: 'Profile not found' }, { status: 404 });
  }

  await prisma.profile.delete({ where: { id } });

  return NextResponse.json({ success: true, message: 'Profile deleted successfully' });
}
