'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Calendar, AlertCircle, Save } from 'lucide-react';
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
  creator: { discordId: string };
}

function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  if (authStatus === 'loading' || loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <AlertCircle size={64} className="text-error mx-auto mb-6" />
        <h1 className="font-heading text-3xl font-bold mb-4">Event Not Found</h1>
        <p className="text-text-secondary mb-8">{error || 'This event could not be found.'}</p>
        <Link href="/events" className="btn-primary">Browse Events</Link>
      </div>
    );
  }

  const isCreator = session.user.discordId === event.creator.discordId;
  const isAdmin = session.user.isAdmin;
  if (!isCreator && !isAdmin) {
    router.push(`/events/${id}`);
    return null;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = {
      title: fd.get('title'),
      description: fd.get('description'),
      category: fd.get('category'),
      dateTime: new Date(fd.get('dateTime') as string).toISOString(),
      serverName: fd.get('serverName') || undefined,
      imageUrl: fd.get('imageUrl') || undefined,
      discordLink: fd.get('discordLink') || undefined,
    };
    if (fd.get('endDateTime')) {
      body.endDateTime = new Date(fd.get('endDateTime') as string).toISOString();
    }

    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        router.push(`/events/${id}`);
      } else {
        setError(data.message || 'Failed to update event');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href={`/events/${id}`} className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors">
        <ArrowLeft size={16} />
        Back to Event
      </Link>

      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2 flex items-center gap-3">
          <Calendar size={28} className="text-secondary-light" />
          Edit Event
        </h1>
        <p className="text-text-secondary">Update your event details.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-4 mb-6 flex items-center gap-3">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-text-primary mb-1.5">Title *</label>
          <input id="title" name="title" required minLength={3} maxLength={100} defaultValue={event.title} className="input-field w-full" />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1.5">Description *</label>
          <textarea id="description" name="description" required minLength={10} maxLength={2000} rows={5} defaultValue={event.description} className="input-field w-full resize-none" />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-text-primary mb-1.5">Category *</label>
          <select id="category" name="category" required defaultValue={event.category} className="input-field w-full">
            <option value="tournament">Tournament</option>
            <option value="community">Community</option>
            <option value="roleplay">Roleplay</option>
            <option value="pvp">PvP</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dateTime" className="block text-sm font-medium text-text-primary mb-1.5">Start Date & Time *</label>
            <input id="dateTime" name="dateTime" type="datetime-local" required defaultValue={toLocalDatetime(event.dateTime)} className="input-field w-full" />
          </div>
          <div>
            <label htmlFor="endDateTime" className="block text-sm font-medium text-text-primary mb-1.5">End Date & Time</label>
            <input id="endDateTime" name="endDateTime" type="datetime-local" defaultValue={event.endDateTime ? toLocalDatetime(event.endDateTime) : ''} className="input-field w-full" />
          </div>
        </div>

        <div>
          <label htmlFor="serverName" className="block text-sm font-medium text-text-primary mb-1.5">Server Name</label>
          <input id="serverName" name="serverName" maxLength={100} defaultValue={event.serverName || ''} className="input-field w-full" placeholder="Which server is this event on?" />
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-text-primary mb-1.5">Image URL</label>
          <input id="imageUrl" name="imageUrl" type="url" defaultValue={event.imageUrl || ''} className="input-field w-full" placeholder="https://example.com/image.png" />
        </div>

        <div>
          <label htmlFor="discordLink" className="block text-sm font-medium text-text-primary mb-1.5">Discord Link</label>
          <input id="discordLink" name="discordLink" type="url" defaultValue={event.discordLink || ''} className="input-field w-full" placeholder="https://discord.gg/..." />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {submitting ? <><Spinner size="sm" /> Saving...</> : <><Save size={18} /> Save Changes</>}
          </button>
          <Link href={`/events/${id}`} className="text-sm text-text-secondary hover:text-text-primary transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
