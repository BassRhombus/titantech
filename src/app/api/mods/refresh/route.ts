import { NextResponse } from 'next/server';
import { clearModsCache, fetchMods } from '@/lib/gsh-api';

// GET /api/mods/refresh - Clear cache and re-fetch mods from GSH API
export async function GET() {
  try {
    clearModsCache();
    const mods = await fetchMods();
    return NextResponse.json({ success: true, message: `Refreshed mods data. Found ${mods.length} mods.` });
  } catch (err) {
    console.error('Failed to refresh mods:', err);
    return NextResponse.json({ success: false, message: 'Failed to refresh mods' }, { status: 500 });
  }
}
