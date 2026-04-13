interface ShutdownState {
  shuttingDown: boolean;
  shutdownAt: number | null;
}

const state: ShutdownState = {
  shuttingDown: false,
  shutdownAt: null,
};

const SHUTDOWN_DELAY_MS = 60_000;

function handleShutdownSignal() {
  if (state.shuttingDown) return;

  state.shuttingDown = true;
  state.shutdownAt = Date.now() + SHUTDOWN_DELAY_MS;

  const totalSeconds = SHUTDOWN_DELAY_MS / 1000;
  console.log(`[shutdown] Signal received. Shutting down in ${totalSeconds}s...`);

  let remaining = totalSeconds;
  const ticker = setInterval(() => {
    remaining -= 10;
    if (remaining > 0) {
      console.log(`[shutdown] Restarting in ${remaining}s — save your work!`);
    }
  }, 10_000);

  setTimeout(() => {
    clearInterval(ticker);
    console.log('[shutdown] Shutting down now.');
    process.exit(0);
  }, SHUTDOWN_DELAY_MS);
}

// Register signal handlers once on module load
if (typeof process !== 'undefined' && !state.shuttingDown) {
  process.on('SIGTERM', handleShutdownSignal);
  process.on('SIGINT', handleShutdownSignal);
}

export function getShutdownStatus(): ShutdownState {
  return { ...state };
}
