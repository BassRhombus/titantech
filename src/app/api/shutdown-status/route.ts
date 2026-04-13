import { NextResponse } from 'next/server';
import { getShutdownStatus } from '@/lib/shutdown';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(getShutdownStatus());
}
