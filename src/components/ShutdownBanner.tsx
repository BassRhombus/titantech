'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type Phase = 'idle' | 'countdown' | 'restarting';

export function ShutdownBanner() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(60);
  const phaseRef = useRef<Phase>('idle');
  const shutdownReceivedRef = useRef(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let tickTimer: ReturnType<typeof setInterval> | null = null;
    let healthTimer: ReturnType<typeof setInterval> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function cleanup() {
      if (tickTimer) { clearInterval(tickTimer); tickTimer = null; }
      if (healthTimer) { clearInterval(healthTimer); healthTimer = null; }
      if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
    }

    function startCountdown(seconds: number) {
      if (phaseRef.current !== 'idle') return;
      cleanup();
      phaseRef.current = 'countdown';
      setPhase('countdown');
      setSecondsLeft(seconds);

      tickTimer = setInterval(() => {
        setSecondsLeft((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            startRestarting();
            return 0;
          }
          return next;
        });
      }, 1000);
    }

    function startRestarting() {
      cleanup();
      phaseRef.current = 'restarting';
      setPhase('restarting');
      setSecondsLeft(60);

      tickTimer = setInterval(() => {
        setSecondsLeft((prev) => Math.max(0, prev - 1));
      }, 1000);

      healthTimer = setInterval(async () => {
        try {
          const res = await fetch('/api/health', { cache: 'no-store' });
          if (res.ok) {
            cleanup();
            window.location.reload();
          }
        } catch {
          // still down
        }
      }, 3000);
    }

    function connect() {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${proto}//${window.location.host}/ws`);

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        if (data.type === 'shutdown') {
          shutdownReceivedRef.current = true;
          if (data.duration > 0) {
            startCountdown(data.duration);
          } else {
            startRestarting();
          }
        } else if (data.type === 'shutdown_now') {
          startRestarting();
        }
      };

      ws.onclose = () => {
        ws = null;
        if (phaseRef.current === 'countdown') return;
        if (shutdownReceivedRef.current) {
          startRestarting();
        } else {
          reconnectTimer = setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => {
        if (ws) ws.close();
      };
    }

    connect();

    return () => {
      cleanup();
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
    };
  }, []);

  if (phase === 'idle') return null;

  const urgency =
    secondsLeft <= 10 ? 'critical' : secondsLeft <= 30 ? 'warning' : 'notice';

  const bannerClass =
    urgency === 'critical'
      ? 'bg-red-600 text-white animate-pulse'
      : urgency === 'warning'
        ? 'bg-red-500 text-white'
        : 'bg-yellow-500 text-black';

  return (
    <div
      role="alert"
      className={`
        fixed top-0 inset-x-0 z-[9999] px-4 py-3 text-center text-sm font-semibold
        transition-colors duration-300 ${bannerClass}
      `}
    >
      {phase === 'countdown' ? (
        <span className="inline-flex items-center gap-2">
          <AlertTriangle size={16} />
          Server restarting in {secondsLeft}s &mdash; save your work!
        </span>
      ) : (
        <span className="inline-flex items-center gap-2">
          <RefreshCw size={16} className="animate-spin" />
          Server is restarting&hellip; {secondsLeft}s &mdash; Page will auto-refresh when ready.
        </span>
      )}
    </div>
  );
}
