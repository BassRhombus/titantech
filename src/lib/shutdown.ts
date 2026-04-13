type SseClient = {
  send: (event: string, data: unknown) => void;
  close: () => void;
};

// Use a global symbol to ensure singleton across multiple imports/bundles
const GLOBAL_KEY = Symbol.for('titantech.shutdown');

interface ShutdownGlobal {
  clients: Set<SseClient>;
  shuttingDown: boolean;
  registered: boolean;
}

function getGlobal(): ShutdownGlobal {
  const g = globalThis as Record<symbol, ShutdownGlobal | undefined>;
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = {
      clients: new Set(),
      shuttingDown: false,
      registered: false,
    };
  }
  return g[GLOBAL_KEY];
}

const SHUTDOWN_DELAY_MS = 60_000;

function broadcast(event: string, data: unknown) {
  const state = getGlobal();
  for (const client of state.clients) {
    try {
      client.send(event, data);
    } catch {
      state.clients.delete(client);
    }
  }
}

function handleShutdownSignal() {
  const state = getGlobal();
  if (state.shuttingDown) return;
  state.shuttingDown = true;

  const shutdownAt = Date.now() + SHUTDOWN_DELAY_MS;
  const totalSeconds = SHUTDOWN_DELAY_MS / 1000;

  console.log(`[shutdown] Signal received. Shutting down in ${totalSeconds}s...`);
  broadcast('shutdown', { shutdownAt, duration: totalSeconds });

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
    setTimeout(() => process.exit(0), 500);
  }, SHUTDOWN_DELAY_MS);
}

export function addSseClient(client: SseClient) {
  const state = getGlobal();
  state.clients.add(client);

  if (state.shuttingDown) {
    client.send('shutdown', { shutdownAt: Date.now(), duration: 0 });
  }
}

export function removeSseClient(client: SseClient) {
  getGlobal().clients.delete(client);
}

// Register signal handlers exactly once across all imports
if (typeof process !== 'undefined') {
  const state = getGlobal();
  if (!state.registered) {
    state.registered = true;
    process.on('SIGTERM', handleShutdownSignal);
    process.on('SIGINT', handleShutdownSignal);
  }
}
