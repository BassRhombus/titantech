import { NextResponse } from 'next/server';
import { fetchMods } from '@/lib/gsh-api';

// GET /api/gsh/mods - Get community mods (cached)
export async function GET() {
  try {
    const mods = await fetchMods();
    return NextResponse.json(mods);
  } catch (err) {
    console.error('Failed to fetch mods:', err);
    return NextResponse.json({ error: 'Failed to fetch mods' }, { status: 502 });
  }
}
