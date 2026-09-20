'use client';

import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Copy, Server, Users, Wifi, WifiOff, ChevronDown, ChevronUp } from 'lucide-react';
import type { ServerSubmission } from '@/types';

interface ServerStatus {
  online: boolean;
  players: number;
  maxPlayers: number;
}

interface ServerCardProps {
  server: ServerSubmission;
  status?: ServerStatus | null;
}

export function ServerCard({ server, status }: ServerCardProps) {
  const gamePort = server.queryPort - 4;
  const isOnline = status?.online ?? null;
  const descRef = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = descRef.current;
    if (!el || expanded) return;
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [server.description, expanded]);

  return (
    <div className="card overflow-hidden group">
      {/* Server Image */}
      <div className="relative h-40 bg-surface overflow-hidden">
        {server.imagePath ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={server.imagePath}
            alt={server.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Server size={40} className="text-text-secondary/30" />
          </div>
        )}
        {/* Online status badge */}
        {isOnline !== null && (
          <div className={`absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
            isOnline
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}>
            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isOnline ? 'Online' : 'Offline'}
          </div>
        )}
      </div>

      {/* Server Info */}
      <div className="p-4">
        <h3 className="font-heading font-semibold text-text-primary mb-1 truncate">{server.name}</h3>
        <div className="mb-3">
          <p
            ref={descRef}
            className={`text-text-secondary text-sm whitespace-pre-line break-words ${expanded ? '' : 'line-clamp-2'}`}
          >
            {server.description}
          </p>
          {overflows && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="text-xs text-primary-light hover:text-primary inline-flex items-center gap-1 mt-1"
              aria-expanded={expanded}
            >
              {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* Server Details */}
        <div className="flex items-center gap-2 text-xs text-text-secondary mb-3 flex-wrap">
          {/* Player count */}
          {status?.online && (
            <span className="flex items-center gap-1 bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20">
              <Users size={12} />
              {status.players}/{status.maxPlayers}
            </span>
          )}
          {/* IP (only if showIP is true) */}
          {server.showIP && (
            <code className="bg-surface px-2 py-0.5 rounded font-mono">
              {server.serverIP}:{gamePort}
            </code>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <a
            href={server.discordInvite}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex-1 flex items-center justify-center gap-1.5 text-xs py-1.5"
          >
            <ExternalLink size={14} />
            Discord
          </a>
          {server.showIP && (
            <button
              onClick={() => navigator.clipboard.writeText(`${server.serverIP}:${gamePort}`)}
              className="btn-outline flex items-center gap-1.5 text-xs py-1.5"
              title="Copy server IP"
            >
              <Copy size={14} />
              Copy IP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
