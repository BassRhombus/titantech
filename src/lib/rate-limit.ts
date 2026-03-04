import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

function getStore(name: string): Map<string, RateLimitEntry> {
  if (!stores.has(name)) {
    stores.set(name, new Map());
  }
  return stores.get(name)!;
}

function getClientIp(): string {
  const hdrs = headers();
  return (hdrs as any).get?.('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

interface RateLimitConfig {
  name: string;
  windowMs: number;
  max: number;
}

export function createRateLimiter(config: RateLimitConfig) {
  return async function checkRateLimit(): Promise<NextResponse | null> {
    const ip = getClientIp();
    const store = getStore(config.name);
    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now > entry.resetTime) {
      store.set(ip, { count: 1, resetTime: now + config.windowMs });
      return null; // allowed
    }

    if (entry.count >= config.max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return NextResponse.json(
        { success: false, message: 'Too many requests, please try again later.', retryAfter },
        { status: 429 }
      );
    }

    entry.count++;
    return null; // allowed
  };
}

// Pre-configured limiters
export const standardLimit = createRateLimiter({ name: 'standard', windowMs: 15 * 60 * 1000, max: 100 });
export const uploadLimit = createRateLimiter({ name: 'upload', windowMs: 60 * 60 * 1000, max: 10 });
export const webhookLimit = createRateLimiter({ name: 'webhook', windowMs: 60 * 1000, max: 30 });

// Comment cooldown (30 seconds per IP)
const commentCooldown = new Map<string, number>();

export function checkCommentCooldown(): NextResponse | null {
  const ip = getClientIp();
  const now = Date.now();
  const lastComment = commentCooldown.get(ip);

  if (lastComment && now - lastComment < 30000) {
    const remaining = Math.ceil((30000 - (now - lastComment)) / 1000);
    return NextResponse.json(
      { success: false, message: `Please wait ${remaining} seconds before posting another comment`, cooldown: remaining },
      { status: 429 }
    );
  }

  commentCooldown.set(ip, now);
  return null;
}

// Periodic cleanup (run every 10 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const store of stores.values()) {
      for (const [key, entry] of store.entries()) {
        if (now > entry.resetTime) store.delete(key);
      }
    }
    for (const [key, time] of commentCooldown.entries()) {
      if (now - time > 60000) commentCooldown.delete(key);
    }
  }, 10 * 60 * 1000);
}
