import { addSseClient, removeSseClient } from '@/lib/shutdown';

export const dynamic = 'force-dynamic';

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const client = {
        send: (event: string, data: unknown) => {
          try {
            controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
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

      addSseClient(client);

      // Send keepalive every 30s to prevent proxy/nginx timeout
      const keepalive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch {
          clearInterval(keepalive);
          removeSseClient(client);
        }
      }, 30_000);

      // Clean up when the client disconnects
      const check = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(''));
        } catch {
          clearInterval(check);
          clearInterval(keepalive);
          removeSseClient(client);
        }
      }, 5_000);
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
