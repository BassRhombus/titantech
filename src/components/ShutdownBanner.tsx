'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

type Phase = 'idle' | 'countdown' | 'restarting';

export function ShutdownBanner() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [secondsLeft, setSecondsLeft] = useState(60);

  const phaseRef = useRef<Phase>('idle');
  const deadlineRef = useRef<number>(0);
  const shutdownReceivedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const healthRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    function goToPhase(p: Phase) {
      phaseRef.current = p;
      setPhase(p);
    }

    function stopAllTimers() {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      if (healthRef.current) { clearInterval(healthRef.current); healthRef.current = null; }
    }

    function startCountdown(durationSeconds: number) {
      if (phaseRef.current === 'countdown') return; // already counting
      stopAllTimers();
      deadlineRef.current = Date.now() + durationSeconds * 1000;
      setSecondsLeft(durationSeconds);
      goToPhase('countdown');

      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
        setSecondsLeft(remaining);
        if (remaining <= 0) {
          startRestarting();
        }
      }, 250);
    }

    function startRestarting() {
      if (phaseRef.current === 'restarting') return; // already restarting
      stopAllTimers();
      goToPhase('restarting');

      const restartDeadline = Date.now() + 60_000;
      setSecondsLeft(60);

      timerRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((restartDeadline - Date.now()) / 1000));
        setSecondsLeft(remaining);
      }, 250);

      healthRef.current = setInterval(async () => {
        try {
          const res = await fetch('/api/health', { cache: 'no-store' });
          if (res.ok) {
            stopAllTimers();
            window.location.reload();
          }
        } catch {
          // still down
        }
      }, 3000);
    }

    function connect() {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${proto}//${window.location.host}/ws`);
      wsRef.current = ws;

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
        wsRef.current = null;
        if (phaseRef.current === 'countdown') {
          // WS dropped during countdown — let it keep running
          return;
        }
        if (shutdownReceivedRef.current) {
          startRestarting();
        } else {
          setTimeout(connect, 3000);
        }
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      stopAllTimers();
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
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
