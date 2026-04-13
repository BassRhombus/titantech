const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const port = parseInt(process.env.PORT || '25011', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const SHUTDOWN_DELAY_MS = 60_000;
const wsClients = new Set();
let shuttingDown = false;

function broadcast(data) {
  const msg = JSON.stringify(data);
  for (const ws of wsClients) {
    try {
      if (ws.readyState === 1) ws.send(msg);
    } catch {
      wsClients.delete(ws);
    }
  }
}

function handleShutdown() {
  if (shuttingDown) return;
  shuttingDown = true;

  const shutdownAt = Date.now() + SHUTDOWN_DELAY_MS;
  const totalSeconds = SHUTDOWN_DELAY_MS / 1000;

  console.log(`[shutdown] Signal received. Shutting down in ${totalSeconds}s...`);
  broadcast({ type: 'shutdown', shutdownAt, duration: totalSeconds });

  let remaining = totalSeconds;
  const ticker = setInterval(() => {
    remaining -= 1;

    // Broadcast every 5s, every 1s for last 10
    if (remaining > 10 && remaining % 5 === 0) {
      broadcast({ type: 'countdown', remaining });
    } else if (remaining <= 10 && remaining > 0) {
      broadcast({ type: 'countdown', remaining });
    }

    if (remaining > 0 && remaining % 10 === 0) {
      console.log(`[shutdown] Restarting in ${remaining}s — save your work!`);
    }
  }, 1000);

  setTimeout(() => {
    clearInterval(ticker);
    console.log('[shutdown] Shutting down now.');
    broadcast({ type: 'shutdown_now' });
    setTimeout(() => process.exit(0), 500);
  }, SHUTDOWN_DELAY_MS);
}

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  });

  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws) => {
    wsClients.add(ws);
    ws.send(JSON.stringify({ type: 'connected' }));

    // If already shutting down, inform immediately
    if (shuttingDown) {
      ws.send(JSON.stringify({ type: 'shutdown', shutdownAt: Date.now(), duration: 0 }));
    }

    ws.on('close', () => wsClients.delete(ws));
    ws.on('error', () => wsClients.delete(ws));

    // Keepalive ping every 30s
    const ping = setInterval(() => {
      if (ws.readyState === 1) {
        ws.ping();
      } else {
        clearInterval(ping);
        wsClients.delete(ws);
      }
    }, 30_000);

    ws.on('close', () => clearInterval(ping));
  });

  server.listen(port, () => {
    console.log(`Bot is Ready!`);
  });
});
