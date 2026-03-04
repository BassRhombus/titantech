import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 }), session: null };
  }
  return { error: null, session };
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 }), session: null };
  }
  if (!session.user.isAdmin) {
    return { error: NextResponse.json({ success: false, message: 'Admin access required' }, { status: 403 }), session: null };
  }
  return { error: null, session };
}

export async function requireModerator() {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 }), session: null };
  }
  if (!session.user.isModerator && !session.user.isAdmin) {
    return { error: NextResponse.json({ success: false, message: 'Moderator access required' }, { status: 403 }), session: null };
  }
  return { error: null, session };
}

export async function optionalAuth() {
  const session = await getSession();
  return { session };
}
