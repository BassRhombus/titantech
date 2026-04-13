'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type Phase = 'idle' | 'countdown' | 'restarting';

const RESTART_COUNTDOWN = 60;

export function ShutdownBanner() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(60);
  const phaseRef = useRef<Phase>('idle');
  const wsRef = useRef<WebSocket | null>(null);
  const shutdownReceivedRef = useRef(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const healthPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setPhaseSync = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const clearTimers = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    if (healthPollRef.current) clearInterval(healthPollRef.current);
    countdownRef.current = null;
    healthPollRef.current = null;
  }, []);

  const startHealthPolling = useCallback(() => {
    clearTimers();
    setPhaseSync('restarting');
    setSecondsLeft(RESTART_COUNTDOWN);

    const restartDeadline = Date.now() + RESTART_COUNTDOWN * 1000;

    countdownRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((restartDeadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
    }, 250);

    healthPollRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        if (res.ok) {
          clearTimers();
          window.location.reload();
        }
      } catch {
        // Server still down
      }
    }, 3000);
  }, [clearTimers, setPhaseSync]);

  const startCountdown = useCallback(
    (shutdownAt: number) => {
      clearTimers();
      setPhaseSync('countdown');

      countdownRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((shutdownAt - Date.now()) / 1000));
        setSecondsLeft(remaining);

        if (remaining <= 0) {
          startHealthPolling();
        }
      }, 250);
    },
    [clearTimers, startHealthPolling, setPhaseSync]
  );

  useEffect(() => {
    function connect() {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${proto}//${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);

        switch (data.type) {
          case 'shutdown':
            shutdownReceivedRef.current = true;
            if (data.duration > 0) {
              // Calculate deadline from client clock, not server timestamp
              startCountdown(Date.now() + data.duration * 1000);
            } else {
              startHealthPolling();
            }
            break;

          case 'shutdown_now':
            startHealthPolling();
            break;
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (shutdownReceivedRef.current && phaseRef.current !== 'countdown') {
          // Server died after shutdown and countdown already finished
          startHealthPolling();
        } else if (!shutdownReceivedRef.current) {
          // Normal disconnect — silently reconnect
          setTimeout(connect, 3000);
        }
        // If in countdown phase, let it keep running — it'll call
        // startHealthPolling when it hits 0
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      clearTimers();
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on cleanup
        wsRef.current.close();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
