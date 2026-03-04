import { NextResponse } from 'next/server';
import { fetchCurveOverrides, fetchCurveOverridesByPath } from '@/lib/gsh-api';

// GET /api/gsh/curve-overrides/[[...params]] - Proxy curve override API
export async function GET(_request: Request, { params }: { params: Promise<{ params?: string[] }> }) {
  try {
    const { params: segments } = await params;

    // No segments = get all categories
    if (!segments || segments.length === 0) {
      const data = await fetchCurveOverrides();
      return NextResponse.json(data);
    }

    // Build path from segments
    const path = segments.join('/');
    const data = await fetchCurveOverridesByPath(path);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Failed to fetch curve overrides:', err);
    return NextResponse.json({ error: 'Failed to fetch curve overrides' }, { status: 502 });
  }
}
