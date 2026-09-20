import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth } from '@/lib/auth-helpers';
import { validate, profileSchema, generatorTypeSchema } from '@/lib/validation';
import { uploadLimit } from '@/lib/rate-limit';

const MAX_PROFILES_PER_TYPE = 10;

// GET /api/profiles/[type] - List user's profiles for a generator type
export async function GET(_request: Request, { params }: { params: Promise<{ type: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { type } = await params;
  const typeResult = generatorTypeSchema.safeParse(type);
  if (!typeResult.success) {
    return NextResponse.json({ success: false, message: 'Invalid generator type. Must be one of: game-ini, commands-ini, rules-motd' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { discordId: session!.user.discordId } });
  if (!user) return NextResponse.json({ success: true, profiles: [], count: 0, maxProfiles: MAX_PROFILES_PER_TYPE });

  const profiles = await prisma.profile.findMany({
    where: { userId: user.id, generatorType: type },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json({ success: true, profiles, count: profiles.length, maxProfiles: MAX_PROFILES_PER_TYPE });
}

// POST /api/profiles/[type] - Create a new profile
export async function POST(request: Request, { params }: { params: Promise<{ type: string }> }) {
  const rateLimited = await uploadLimit();
  if (rateLimited) return rateLimited;

  const { error, session } = await requireAuth();
  if (error) return error;

  const { type } = await params;
  const typeResult = generatorTypeSchema.safeParse(type);
  if (!typeResult.success) {
    return NextResponse.json({ success: false, message: 'Invalid generator type' }, { status: 400 });
  }

  const body = await request.json();
  const result = validate(profileSchema, body);
  if (!result.success) {
    return NextResponse.json({ success: false, message: 'Validation failed', errors: result.errors }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { discordId: session!.user.discordId } });
  if (!user) return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });

  // Check profile limit
  const count = await prisma.profile.count({ where: { userId: user.id, generatorType: type } });
  if (count >= MAX_PROFILES_PER_TYPE) {
    return NextResponse.json({ success: false, message: 'Maximum number of profiles reached for this generator type' }, { status: 400 });
  }

  const profile = await prisma.profile.create({
    data: {
      userId: user.id,
      generatorType: type,
      name: result.data.name,
      data: result.data.data as any,
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Profile created successfully',
    profile: { id: profile.id, name: profile.name, generatorType: profile.generatorType, createdAt: profile.createdAt },
  }, { status: 201 });
}
