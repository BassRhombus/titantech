import { addSseClient, removeSseClient } from '@/lib/shutdown';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const encoder = new TextEncoder();
  let keepalive: ReturnType<typeof setInterval> | null = null;
  let client: { send: (event: string, data: unknown) => void; close: () => void } | null = null;

  const stream = new ReadableStream({
    start(controller) {
      client = {
        send: (event: string, data: unknown) => {
          try {
            controller.enqueue(
              encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
            );
          } catch {
            // Stream closed
          }
        },
        close: () => {
          try {
            controller.close();
          } catch {
            // Already closed
          }
        },
      };

      // Send initial event so the client knows the connection is live
      controller.enqueue(encoder.encode(`event: connected\ndata: {}\n\n`));

      addSseClient(client);

      // Keepalive comment every 30s to prevent proxy timeout
      keepalive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keepalive\n\n`));
        } catch {
          if (keepalive) clearInterval(keepalive);
          if (client) removeSseClient(client);
        }
      }, 30_000);
    },
    cancel() {
      // Called when client disconnects
      if (keepalive) clearInterval(keepalive);
      if (client) removeSseClient(client);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
