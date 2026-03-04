'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Calendar, AlertCircle, Server } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

export default function CreateEventPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [hasApprovedServer, setHasApprovedServer] = useState<boolean | null>(null);

  useEffect(() => {
    if (session) {
      fetch('/api/servers/mine')
        .then((r) => r.json())
        .then((servers) => {
          const approved = servers.some((s: any) => s.status === 'approved');
          setHasApprovedServer(approved || session.user.isAdmin);
        })
        .catch(() => setHasApprovedServer(false));
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Calendar size={64} className="text-text-secondary mx-auto mb-6" />
        <h1 className="font-heading text-3xl font-bold mb-4">Sign In Required</h1>
        <p className="text-text-secondary text-lg mb-8">
          You need to sign in with Discord to create events.
        </p>
        <Link href="/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  if (hasApprovedServer === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!hasApprovedServer) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Server size={64} className="text-text-secondary mx-auto mb-6" />
        <h1 className="font-heading text-3xl font-bold mb-4">Approved Server Required</h1>
        <p className="text-text-secondary text-lg mb-8">
          You need to have an approved server listing before you can create events. Submit your server first and wait for it to be approved.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/community/servers/submit" className="btn-primary inline-flex items-center gap-2">
            <Server size={18} />
            Submit a Server
          </Link>
          <Link href="/events" className="btn-outline">Back to Events</Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get('title'),
      description: fd.get('description'),
      dateTime: new Date(fd.get('dateTime') as string).toISOString(),
      endDateTime: fd.get('endDateTime') ? new Date(fd.get('endDateTime') as string).toISOString() : undefined,
      serverName: fd.get('serverName') || undefined,
      category: fd.get('category'),
      imageUrl: fd.get('imageUrl') || undefined,
      discordLink: fd.get('discordLink') || undefined,
    };

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        router.push('/events');
      } else {
        setError(data.message || 'Failed to create event');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors">
        <ArrowLeft size={16} />
        Back to Events
      </Link>

      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2 flex items-center gap-3">
          <Calendar size={28} className="text-secondary-light" />
          Create Event
        </h1>
        <p className="text-text-secondary">
          Share your event with the Path of Titans community.
        </p>
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
          <input id="title" name="title" required minLength={3} maxLength={100} className="input-field w-full" placeholder="Event name" />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1.5">Description *</label>
          <textarea id="description" name="description" required minLength={10} maxLength={2000} rows={5} className="input-field w-full resize-none" placeholder="What's this event about?" />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-text-primary mb-1.5">Category *</label>
          <select id="category" name="category" required className="input-field w-full">
            <option value="">Select category...</option>
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
            <input id="dateTime" name="dateTime" type="datetime-local" required className="input-field w-full" />
          </div>
          <div>
            <label htmlFor="endDateTime" className="block text-sm font-medium text-text-primary mb-1.5">End Date & Time</label>
            <input id="endDateTime" name="endDateTime" type="datetime-local" className="input-field w-full" />
          </div>
        </div>

        <div>
          <label htmlFor="serverName" className="block text-sm font-medium text-text-primary mb-1.5">Server Name</label>
          <input id="serverName" name="serverName" maxLength={100} className="input-field w-full" placeholder="Which server is this event on?" />
        </div>

        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-text-primary mb-1.5">Image URL</label>
          <input id="imageUrl" name="imageUrl" type="url" className="input-field w-full" placeholder="https://example.com/image.png" />
        </div>

        <div>
          <label htmlFor="discordLink" className="block text-sm font-medium text-text-primary mb-1.5">Discord Link</label>
          <input id="discordLink" name="discordLink" type="url" className="input-field w-full" placeholder="https://discord.gg/..." />
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {submitting ? <><Spinner size="sm" /> Creating...</> : <><Calendar size={18} /> Create Event</>}
          </button>
          <Link href="/events" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
