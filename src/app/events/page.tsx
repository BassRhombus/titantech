'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Calendar, Search, Plus, Filter } from 'lucide-react';
import { EventCard } from '@/components/events/EventCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';

const categoryFilters = [
  { value: '', label: 'All' },
  { value: 'tournament', label: 'Tournament' },
  { value: 'community', label: 'Community' },
  { value: 'roleplay', label: 'Roleplay' },
  { value: 'pvp', label: 'PvP' },
  { value: 'other', label: 'Other' },
];

export default function EventsPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showPast, setShowPast] = useState(false);
  const [canCreateEvents, setCanCreateEvents] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [showPast]);

  useEffect(() => {
    if (session) {
      if (session.user.isAdmin) {
        setCanCreateEvents(true);
      } else {
        fetch('/api/servers/mine')
          .then((r) => r.json())
          .then((servers) => setCanCreateEvents(servers.some((s: any) => s.status === 'approved')))
          .catch(() => {});
      }
    }
  }, [session]);

  async function fetchEvents() {
    setLoading(true);
    try {
      const url = showPast ? '/api/events?status=' : '/api/events';
      const res = await fetch(url);
      if (res.ok) setEvents(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    let list = [...events];
    if (category) list = list.filter((e) => e.category === category);
    if (!showPast) list = list.filter((e) => new Date(e.dateTime) >= new Date() || e.status === 'active');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.serverName?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [events, search, category, showPast]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-secondary-light mb-2">
            <Calendar size={28} />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">Community Events</h1>
          <p className="text-text-secondary">
            Discover tournaments, community meetups, roleplay events, and more.
          </p>
        </div>
        {canCreateEvents && (
          <Link href="/events/create" className="btn-primary flex items-center gap-2 shrink-0">
            <Plus size={18} />
            Create Event
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categoryFilters.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                category === c.value
                  ? 'bg-primary text-white'
                  : 'bg-surface text-text-secondary hover:text-text-primary'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Show Past Toggle */}
      <div className="flex items-center gap-2 mb-6">
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={showPast}
            onChange={(e) => setShowPast(e.target.checked)}
            className="rounded border-divider bg-surface text-primary focus:ring-primary"
          />
          Show past events
        </label>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Calendar size={48} />}
          title="No Events"
          description={canCreateEvents ? 'No events found. Create one to get started!' : 'No events yet. Check back soon!'}
          actionLabel={canCreateEvents ? 'Create Event' : undefined}
          actionHref={canCreateEvents ? '/events/create' : undefined}
        />
      )}
    </div>
  );
}
