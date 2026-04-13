'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type Phase = 'idle' | 'countdown' | 'restarting';

const RESTART_COUNTDOWN = 60;

export function ShutdownBanner() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(60);
  const phaseRef = useRef<Phase>('idle');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const setPhaseSync = useCallback((next: Phase) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const clearAllIntervals = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    pollRef.current = null;
    countdownRef.current = null;
  }, []);

  const startHealthPolling = useCallback(() => {
    clearAllIntervals();
    setPhaseSync('restarting');
    setSecondsLeft(RESTART_COUNTDOWN);

    const restartDeadline = Date.now() + RESTART_COUNTDOWN * 1000;

    countdownRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((restartDeadline - Date.now()) / 1000));
      setSecondsLeft(remaining);
    }, 250);

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        if (res.ok) {
          clearAllIntervals();
          window.location.reload();
        }
      } catch {
        // Server still down, keep polling
      }
    }, 3000);
  }, [clearAllIntervals, setPhaseSync]);

  const startCountdown = useCallback(
    (shutdownAt: number) => {
      setPhaseSync('countdown');

      countdownRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((shutdownAt - Date.now()) / 1000));
        setSecondsLeft(remaining);

        if (remaining <= 0) {
          startHealthPolling();
        }
      }, 250);
    },
    [startHealthPolling, setPhaseSync]
  );

  useEffect(() => {
    const checkShutdown = async () => {
      try {
        const res = await fetch('/api/shutdown-status', { cache: 'no-store' });
        if (!res.ok) {
          if (phaseRef.current === 'idle') startHealthPolling();
          return;
        }
        const data = await res.json();
        if (data.shuttingDown && data.shutdownAt && phaseRef.current === 'idle') {
          startCountdown(data.shutdownAt);
        }
      } catch {
        if (phaseRef.current === 'countdown') {
          startHealthPolling();
        }
      }
    };

    pollRef.current = setInterval(checkShutdown, 5000);
    checkShutdown();

    return clearAllIntervals;
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
