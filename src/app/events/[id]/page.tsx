'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, Clock, MapPin, ExternalLink, Pencil, Trash2,
  AlertCircle, XCircle, CheckCircle,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';

interface EventDetail {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  endDateTime?: string | null;
  serverName?: string | null;
  category: string;
  imageUrl?: string | null;
  discordLink?: string | null;
  status: string;
  createdAt: string;
  creator: { username: string; avatar?: string | null; discordId: string };
}

const categoryColors: Record<string, string> = {
  tournament: 'bg-red-500/10 text-red-400',
  community: 'bg-primary/10 text-primary-light',
  roleplay: 'bg-purple-500/10 text-purple-400',
  pvp: 'bg-orange-500/10 text-orange-400',
  other: 'bg-surface text-text-secondary',
};

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isCreator = session?.user?.discordId === event?.creator?.discordId;
  const isAdmin = session?.user?.isAdmin;
  const canManage = isCreator || isAdmin;

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success === false) {
          setError(data.message || 'Event not found');
        } else {
          setEvent(data);
        }
      })
      .catch(() => setError('Failed to load event'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStatusChange(status: string) {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setEvent((prev) => prev ? { ...prev, status } : prev);
      }
    } catch {}
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) router.push('/events');
    } catch {}
  }

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  if (error || !event) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <AlertCircle size={64} className="text-error mx-auto mb-6" />
        <h1 className="font-heading text-3xl font-bold mb-4">Event Not Found</h1>
        <p className="text-text-secondary mb-8">{error || 'This event could not be found.'}</p>
        <Link href="/events" className="btn-primary">Browse Events</Link>
      </div>
    );
  }

  const startDate = new Date(event.dateTime);
  const endDate = event.endDateTime ? new Date(event.endDateTime) : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors">
        <ArrowLeft size={16} />
        Back to Events
      </Link>

      {/* Event Image */}
      {event.imageUrl && (
        <div className="relative h-64 sm:h-80 rounded-xl overflow-hidden mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={event.imageUrl} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColors[event.category] || categoryColors.other}`}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </span>
            <StatusBadge status={event.status} />
          </div>
          <h1 className="font-heading text-3xl font-bold mb-2">{event.title}</h1>
          <p className="text-text-secondary text-sm">
            Created by {event.creator.username}
          </p>
        </div>
      </div>

      {/* Event Details */}
      <div className="card p-6 mb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-text-secondary">
            <Calendar size={18} className="text-primary-light shrink-0" />
            <span>
              {startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-text-secondary">
            <Clock size={18} className="text-primary-light shrink-0" />
            <span>
              {startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              {endDate ? ` - ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : ''}
            </span>
          </div>
          {event.serverName && (
            <div className="flex items-center gap-3 text-text-secondary">
              <MapPin size={18} className="text-primary-light shrink-0" />
              <span>{event.serverName}</span>
            </div>
          )}
          {event.discordLink && (
            <div className="flex items-center gap-3">
              <ExternalLink size={18} className="text-primary-light shrink-0" />
              <a href={event.discordLink} target="_blank" rel="noopener noreferrer" className="text-primary-light hover:text-primary transition-colors">
                Discord Link
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="card p-6 mb-6">
        <h2 className="font-heading font-semibold text-lg mb-3">Description</h2>
        <div className="text-text-secondary whitespace-pre-wrap leading-relaxed">
          {event.description}
        </div>
      </div>

      {/* Management Actions */}
      {canManage && (
        <div className="card p-6">
          <h2 className="font-heading font-semibold text-lg mb-4">Manage Event</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/events/${event.id}/edit`}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Pencil size={16} />
              Edit Event
            </Link>
            {event.status === 'active' && (
              <>
                <button
                  onClick={() => handleStatusChange('completed')}
                  className="btn-outline flex items-center gap-2 text-sm"
                >
                  <CheckCircle size={16} />
                  Mark Completed
                </button>
                <button
                  onClick={() => handleStatusChange('cancelled')}
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <XCircle size={16} />
                  Cancel Event
                </button>
              </>
            )}
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
