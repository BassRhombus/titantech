'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Server, Search, Plus, RefreshCw } from 'lucide-react';
import { ServerCard } from '@/components/servers/ServerCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import type { ServerSubmission } from '@/types';

interface ServerStatus {
  online: boolean;
  players: number;
  maxPlayers: number;
  serverName: string;
  map: string;
  queryPort: number;
}

export default function CommunityPage() {
  const [servers, setServers] = useState<ServerSubmission[]>([]);
  const [statuses, setStatuses] = useState<Record<string, ServerStatus | null>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchServers();
  }, []);

  async function fetchServers() {
    setLoading(true);
    try {
      const res = await fetch('/api/servers');
      if (res.ok) {
        setServers(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
    // Fetch statuses in background
    fetchStatuses();
  }

  async function fetchStatuses() {
    try {
      const res = await fetch('/api/servers/status');
      if (res.ok) {
        setStatuses(await res.json());
      }
    } catch {
      // silently fail
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return servers;
    const q = search.toLowerCase();
    return servers.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [servers, search]);

  // Sort: online servers first, then by player count descending
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const sa = statuses[a.id];
      const sb = statuses[b.id];
      const aOnline = sa?.online ? 1 : 0;
      const bOnline = sb?.online ? 1 : 0;
      if (aOnline !== bOnline) return bOnline - aOnline;
      return (sb?.players || 0) - (sa?.players || 0);
    });
  }, [filtered, statuses]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-primary-light mb-2">
            <Server size={28} />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">Community Servers</h1>
          <p className="text-text-secondary">
            Discover Path of Titans servers from the community.
          </p>
        </div>
        <Link href="/community/servers/submit" className="btn-primary flex items-center gap-2 shrink-0">
          <Plus size={18} />
          Submit Server
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search servers by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        <button
          onClick={fetchServers}
          className="btn-outline flex items-center gap-2"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Server Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : sorted.length > 0 ? (
        <>
          <p className="text-text-secondary text-sm mb-4">
            {sorted.length} server{sorted.length !== 1 ? 's' : ''} found
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((server) => (
              <ServerCard key={server.id} server={server} status={statuses[server.id]} />
            ))}
          </div>
        </>
      ) : search ? (
        <EmptyState
          icon={<Search size={48} />}
          title="No Results"
          description={`No servers match "${search}". Try a different search term.`}
        />
      ) : (
        <EmptyState
          icon={<Server size={48} />}
          title="No Servers Yet"
          description="Be the first to submit your Path of Titans server to the community!"
          actionLabel="Submit Server"
          actionHref="/community/servers/submit"
        />
      )}
    </div>
  );
}
