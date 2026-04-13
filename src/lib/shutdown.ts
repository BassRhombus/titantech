// Shutdown logic is now in server.js (custom server with WebSocket).
// This file is kept only for the /api/shutdown-status fallback endpoint.

export function getShutdownStatus() {
  return { shuttingDown: false, shutdownAt: null };
}
