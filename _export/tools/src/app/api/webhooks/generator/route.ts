import { NextResponse } from 'next/server';
import { validate, webhookGameIniSchema } from '@/lib/validation';
import { sendGeneratorWebhook } from '@/lib/discord-webhook';
import { webhookLimit } from '@/lib/rate-limit';

// POST /api/webhooks/generator - Notify Discord when a config file is generated
export async function POST(request: Request) {
  const rateLimited = await webhookLimit();
  if (rateLimited) return rateLimited;

  const body = await request.json();
  const result = validate(webhookGameIniSchema, body);
  if (!result.success) {
    return NextResponse.json({ success: false, message: 'Validation failed', errors: result.errors }, { status: 400 });
  }

  if (!process.env.DISCORD_WEBHOOK_URL) {
    return NextResponse.json({ success: true, message: 'No webhook configured' });
  }

  const sent = await sendGeneratorWebhook(
    result.data.fileType,
    result.data.changedSettingsCount,
    result.data.timestamp
  );

  if (sent) {
    return NextResponse.json({ success: true, message: 'Webhook sent successfully' });
  } else {
    return NextResponse.json({ success: false, message: 'Webhook failed' }, { status: 500 });
  }
}
