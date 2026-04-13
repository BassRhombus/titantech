type SseClient = {
  send: (event: string, data: unknown) => void;
  close: () => void;
};

const clients = new Set<SseClient>();
const SHUTDOWN_DELAY_MS = 60_000;
let shuttingDown = false;

function broadcast(event: string, data: unknown) {
  for (const client of clients) {
    try {
      client.send(event, data);
    } catch {
      clients.delete(client);
    }
  }
}

function handleShutdownSignal() {
  if (shuttingDown) return;
  shuttingDown = true;

  const shutdownAt = Date.now() + SHUTDOWN_DELAY_MS;
  const totalSeconds = SHUTDOWN_DELAY_MS / 1000;

  console.log(`[shutdown] Signal received. Shutting down in ${totalSeconds}s...`);
  broadcast('shutdown', { shutdownAt, duration: totalSeconds });

  // Countdown logs every 10s, broadcast every 5s, every 1s for last 10
  let remaining = totalSeconds;
  const ticker = setInterval(() => {
    remaining -= 1;

    if (remaining > 10 && remaining % 5 === 0) {
      broadcast('countdown', { remaining });
    } else if (remaining <= 10 && remaining > 0) {
      broadcast('countdown', { remaining });
    }

    if (remaining > 0 && remaining % 10 === 0) {
      console.log(`[shutdown] Restarting in ${remaining}s — save your work!`);
    }
  }, 1000);

  setTimeout(() => {
    clearInterval(ticker);
    console.log('[shutdown] Shutting down now.');
    broadcast('shutdown_now', {});
    // Give a moment for the final broadcast to flush
    setTimeout(() => process.exit(0), 500);
  }, SHUTDOWN_DELAY_MS);
}

export function addSseClient(client: SseClient) {
  clients.add(client);

  // If already shutting down, immediately inform the new client
  if (shuttingDown) {
    client.send('shutdown', {
      shutdownAt: Date.now(), // already in progress
      duration: 0,
    });
  }
}

export function removeSseClient(client: SseClient) {
  clients.delete(client);
}

// Register signal handlers once on module load
if (typeof process !== 'undefined') {
  process.on('SIGTERM', handleShutdownSignal);
  process.on('SIGINT', handleShutdownSignal);
}
