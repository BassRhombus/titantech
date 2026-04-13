'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type Phase = 'idle' | 'countdown' | 'restarting';

export function ShutdownBanner() {
  const [display, setDisplay] = useState({ phase: 'idle' as Phase, seconds: 60 });
  const started = useRef(false);

  useEffect(() => {
    let countRef = 60;
    let tick: ReturnType<typeof setTimeout> | null = null;
    let health: ReturnType<typeof setInterval> | null = null;
    let ws: WebSocket | null = null;
    let reconnect: ReturnType<typeof setTimeout> | null = null;
    let gotShutdown = false;

    function render(phase: Phase, seconds: number) {
      setDisplay({ phase, seconds });
    }

    function stopTimers() {
      if (tick) { clearTimeout(tick); tick = null; }
      if (health) { clearInterval(health); health = null; }
      if (reconnect) { clearTimeout(reconnect); reconnect = null; }
    }

    function countdownTick() {
      countRef -= 1;
      render('countdown', countRef);
      if (countRef <= 0) {
        doRestart();
      } else {
        tick = setTimeout(countdownTick, 1000);
      }
    }

    function restartTick() {
      countRef -= 1;
      render('restarting', Math.max(0, countRef));
      if (countRef > 0) {
        tick = setTimeout(restartTick, 1000);
      }
    }

    function doCountdown(seconds: number) {
      if (started.current) return;
      started.current = true;
      stopTimers();
      countRef = seconds;
      render('countdown', countRef);
      tick = setTimeout(countdownTick, 1000);
    }

    function doRestart() {
      stopTimers();
      countRef = 60;
      render('restarting', 60);
      tick = setTimeout(restartTick, 1000);

      health = setInterval(async () => {
        try {
          const res = await fetch('/api/health', { cache: 'no-store' });
          if (res.ok) {
            stopTimers();
            window.location.reload();
          }
        } catch {}
      }, 3000);
    }

    function connect() {
      const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${proto}//${location.host}/ws`);

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'shutdown' && data.duration > 0) {
          gotShutdown = true;
          doCountdown(data.duration);
        } else if (data.type === 'shutdown' || data.type === 'shutdown_now') {
          gotShutdown = true;
          if (!started.current) {
            started.current = true;
            doRestart();
          }
        }
      };

      ws.onclose = () => {
        ws = null;
        if (started.current) return; // countdown/restart running, leave it alone
        if (gotShutdown) {
          started.current = true;
          doRestart();
        } else {
          reconnect = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => { if (ws) ws.close(); };
    }

    connect();

    return () => {
      stopTimers();
      if (ws) { ws.onclose = null; ws.close(); }
    };
  }, []);

  if (display.phase === 'idle') return null;

  const s = display.seconds;
  const bannerClass =
    s <= 10
      ? 'bg-red-600 text-white animate-pulse'
      : s <= 30
        ? 'bg-red-500 text-white'
        : 'bg-yellow-500 text-black';

  return (
    <div
      role="alert"
      className={`fixed top-0 inset-x-0 z-[9999] px-4 py-3 text-center text-sm font-semibold transition-colors duration-300 ${bannerClass}`}
    >
      {display.phase === 'countdown' ? (
        <span className="inline-flex items-center gap-2">
          <AlertTriangle size={16} />
          Server restarting in {s}s &mdash; save your work!
        </span>
      ) : (
        <span className="inline-flex items-center gap-2">
          <RefreshCw size={16} className="animate-spin" />
          Server is restarting&hellip; {s}s &mdash; Page will auto-refresh when ready.
        </span>
      )}
    </div>
  );
}
