'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type Phase = 'idle' | 'countdown' | 'restarting';

const RESTART_COUNTDOWN = 60;

export function ShutdownBanner() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(60);
  const phaseRef = useRef<Phase>('idle');
  const eventSourceRef = useRef<EventSource | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const healthPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shutdownReceivedRef = useRef(false);

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
      const es = new EventSource('/api/shutdown-status');
      eventSourceRef.current = es;

      es.addEventListener('shutdown', (e) => {
        shutdownReceivedRef.current = true;
        const data = JSON.parse(e.data);

        if (data.shutdownAt && data.duration > 0) {
          startCountdown(data.shutdownAt);
        } else {
          // Already in progress, go straight to restarting
          startHealthPolling();
        }
      });

      es.addEventListener('countdown', (e) => {
        const data = JSON.parse(e.data);
        if (phaseRef.current === 'countdown') {
          setSecondsLeft(data.remaining);
        }
      });

      es.addEventListener('shutdown_now', () => {
        startHealthPolling();
      });

      es.onerror = () => {
        es.close();

        if (shutdownReceivedRef.current) {
          // Server died after shutdown event — start health polling
          startHealthPolling();
        } else {
          // Normal disconnect (network blip, deploy) — silently reconnect
          setTimeout(connect, 3000);
        }
      };
    }

    connect();

    return () => {
      eventSourceRef.current?.close();
      clearTimers();
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
