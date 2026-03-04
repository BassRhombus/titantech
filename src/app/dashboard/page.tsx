'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Server, FileCode, Calendar, Puzzle, Terminal, FileText, TrendingUp,
  Plus, ExternalLink, AlertCircle, CheckCircle, Pencil, X, Save, ImageIcon,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import type { ServerSubmission } from '@/types';

interface EventItem {
  id: string;
  title: string;
  dateTime: string;
  category: string;
  status: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [servers, setServers] = useState<ServerSubmission[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingServers, setLoadingServers] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Server edit state
  const [editingServer, setEditingServer] = useState<ServerSubmission | null>(null);
  const [savingServer, setSavingServer] = useState(false);
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);

  // Event creator state
  const [showEventForm, setShowEventForm] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [eventError, setEventError] = useState('');
  const [eventSuccess, setEventSuccess] = useState('');

  const hasApprovedServer = servers.some((s) => s.status === 'approved') || session?.user?.isAdmin;

  const fetchServers = useCallback(() => {
    if (!session) return;
    fetch('/api/servers/mine')
      .then((r) => r.json())
      .then(setServers)
      .catch(() => {})
      .finally(() => setLoadingServers(false));
  }, [session]);

  function startEditServer(server: ServerSubmission) {
    setEditingServer(server);
    setEditPreview(null);
    setEditFile(null);
    setServerError('');
  }

  async function handleSaveServer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingServer) return;
    setServerError('');
    setSavingServer(true);

    const formData = new FormData(e.currentTarget);
    if (editFile) {
      formData.set('imageFile', editFile);
    }

    try {
      const res = await fetch(`/api/servers/${editingServer.id}`, {
        method: 'PUT',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setServerSuccess('Server updated successfully!');
        setEditingServer(null);
        setLoadingServers(true);
        fetchServers();
        setTimeout(() => setServerSuccess(''), 4000);
      } else {
        setServerError(data.message || 'Failed to update server');
      }
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setSavingServer(false);
    }
  }

  const fetchEvents = useCallback(() => {
    if (!session) return;
    fetch('/api/events')
      .then((r) => r.json())
      .then((data) => {
        const mine = data.filter((e: any) => e.creator?.discordId === session.user.discordId);
        setEvents(mine);
      })
      .catch(() => {})
      .finally(() => setLoadingEvents(false));
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchServers();
      fetchEvents();
    }
  }, [session, fetchServers, fetchEvents]);

  async function handleCreateEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEventError('');
    setEventSuccess('');
    setCreatingEvent(true);

    const fd = new FormData(e.currentTarget);
    const body = {
      title: fd.get('title'),
      description: fd.get('description'),
      dateTime: new Date(fd.get('dateTime') as string).toISOString(),
      endDateTime: fd.get('endDateTime') ? new Date(fd.get('endDateTime') as string).toISOString() : undefined,
      serverName: fd.get('serverName') || undefined,
      category: fd.get('category'),
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
        setEventSuccess('Event created successfully!');
        setShowEventForm(false);
        (e.target as HTMLFormElement).reset();
        setLoadingEvents(true);
        fetchEvents();
        setTimeout(() => setEventSuccess(''), 4000);
      } else {
        setEventError(data.message || 'Failed to create event');
      }
    } catch {
      setEventError('Network error. Please try again.');
    } finally {
      setCreatingEvent(false);
    }
  }

  if (status === 'loading') {
    return <div className="min-h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2">
          Welcome, {session.user.username}!
        </h1>
        <p className="text-text-secondary">Manage your servers, configurations, and events.</p>
      </div>

      {/* Quick Actions */}
      <h2 className="font-heading text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        <QuickAction icon={<Server size={22} />} label="Submit Server" href="/community/servers/submit" />
        {hasApprovedServer ? (
          <button
            onClick={() => setShowEventForm(!showEventForm)}
            className="card p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-all duration-200 text-left"
          >
            <div className="p-2 rounded-lg bg-secondary/10 text-secondary-light"><Calendar size={22} /></div>
            <span className="text-sm font-medium text-text-primary">Create Event</span>
          </button>
        ) : (
          <div className="card p-4 flex items-center gap-3 opacity-50 cursor-not-allowed" title="You need an approved server to create events">
            <div className="p-2 rounded-lg bg-surface text-text-secondary"><Calendar size={22} /></div>
            <div>
              <span className="text-sm font-medium text-text-secondary block">Create Event</span>
              <span className="text-[10px] text-text-secondary">Requires approved server</span>
            </div>
          </div>
        )}
        <QuickAction icon={<Puzzle size={22} />} label="Mod Manager" href="/tools/mod-manager" />
        <QuickAction icon={<FileCode size={22} />} label="Game.ini Generator" href="/tools/game-ini" />
      </div>

      {/* Inline Event Creator */}
      {showEventForm && (
        <div className="card-static p-6 mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
              <Calendar size={20} className="text-secondary-light" />
              Create Event
            </h3>
            <button
              onClick={() => setShowEventForm(false)}
              className="text-text-secondary hover:text-text-primary text-sm transition-colors"
            >
              Close
            </button>
          </div>

          {eventError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              {eventError}
            </div>
          )}

          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="evt-title" className="block text-sm font-medium text-text-primary mb-1">Title *</label>
                <input id="evt-title" name="title" required minLength={3} maxLength={100} className="input-field w-full text-sm" placeholder="Event name" />
              </div>
              <div>
                <label htmlFor="evt-category" className="block text-sm font-medium text-text-primary mb-1">Category *</label>
                <select id="evt-category" name="category" required className="input-field w-full text-sm">
                  <option value="">Select...</option>
                  <option value="tournament">Tournament</option>
                  <option value="community">Community</option>
                  <option value="roleplay">Roleplay</option>
                  <option value="pvp">PvP</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="evt-description" className="block text-sm font-medium text-text-primary mb-1">Description *</label>
              <textarea id="evt-description" name="description" required minLength={10} maxLength={2000} rows={3} className="input-field w-full text-sm resize-none" placeholder="What's this event about?" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="evt-dateTime" className="block text-sm font-medium text-text-primary mb-1">Start Date & Time *</label>
                <input id="evt-dateTime" name="dateTime" type="datetime-local" required className="input-field w-full text-sm" />
              </div>
              <div>
                <label htmlFor="evt-endDateTime" className="block text-sm font-medium text-text-primary mb-1">End Date & Time</label>
                <input id="evt-endDateTime" name="endDateTime" type="datetime-local" className="input-field w-full text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="evt-serverName" className="block text-sm font-medium text-text-primary mb-1">Server Name</label>
                <input id="evt-serverName" name="serverName" maxLength={100} className="input-field w-full text-sm" placeholder="Which server?" />
              </div>
              <div>
                <label htmlFor="evt-discordLink" className="block text-sm font-medium text-text-primary mb-1">Discord Link</label>
                <input id="evt-discordLink" name="discordLink" type="url" className="input-field w-full text-sm" placeholder="https://discord.gg/..." />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={creatingEvent} className="btn-secondary flex items-center gap-2 text-sm disabled:opacity-50">
                {creatingEvent ? <><Spinner size="sm" /> Creating...</> : <><Calendar size={16} /> Create Event</>}
              </button>
              <button type="button" onClick={() => setShowEventForm(false)} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Success message */}
      {eventSuccess && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg p-3 mb-6 flex items-center gap-2 text-sm animate-fade-in">
          <CheckCircle size={16} />
          {eventSuccess}
        </div>
      )}

      {/* Server edit success message */}
      {serverSuccess && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg p-3 mb-6 flex items-center gap-2 text-sm animate-fade-in">
          <CheckCircle size={16} />
          {serverSuccess}
        </div>
      )}

      {/* Server Edit Form (inline) */}
      {editingServer && (
        <div className="card-static p-6 mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
              <Pencil size={20} className="text-primary-light" />
              Edit Server: {editingServer.name}
            </h3>
            <button onClick={() => setEditingServer(null)} className="text-text-secondary hover:text-text-primary transition-colors">
              <X size={20} />
            </button>
          </div>

          {serverError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              {serverError}
            </div>
          )}

          <form onSubmit={handleSaveServer} className="space-y-4">
            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Server Image</label>
              <div className="flex items-center gap-4">
                {(editPreview || editingServer.imagePath) && (
                  <img
                    src={editPreview || editingServer.imagePath}
                    alt="Server"
                    className="w-24 h-16 object-cover rounded border border-divider"
                  />
                )}
                <label className="btn-outline flex items-center gap-1.5 text-xs cursor-pointer">
                  <ImageIcon size={14} />
                  Change Image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setEditFile(f);
                        const reader = new FileReader();
                        reader.onload = (ev) => setEditPreview(ev.target?.result as string);
                        reader.readAsDataURL(f);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-text-primary mb-1">Server Name</label>
                <input id="edit-name" name="name" defaultValue={editingServer.name} minLength={3} maxLength={100} className="input-field w-full text-sm" />
              </div>
              <div>
                <label htmlFor="edit-ownerDiscord" className="block text-sm font-medium text-text-primary mb-1">Owner Discord</label>
                <input id="edit-ownerDiscord" name="ownerDiscord" defaultValue={editingServer.ownerDiscord} className="input-field w-full text-sm" />
              </div>
            </div>

            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-text-primary mb-1">Description</label>
              <textarea id="edit-description" name="description" defaultValue={editingServer.description} rows={3} minLength={10} maxLength={1000} className="input-field w-full text-sm resize-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="edit-serverIP" className="block text-sm font-medium text-text-primary mb-1">Server IP</label>
                <input id="edit-serverIP" name="serverIP" defaultValue={editingServer.serverIP} className="input-field w-full text-sm" />
              </div>
              <div>
                <label htmlFor="edit-queryPort" className="block text-sm font-medium text-text-primary mb-1">Server Port</label>
                <input id="edit-queryPort" name="queryPort" type="number" defaultValue={editingServer.queryPort} min={1} max={65535} className="input-field w-full text-sm" />
              </div>
              <div>
                <label htmlFor="edit-discordInvite" className="block text-sm font-medium text-text-primary mb-1">Discord Invite</label>
                <input id="edit-discordInvite" name="discordInvite" defaultValue={editingServer.discordInvite} className="input-field w-full text-sm" />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="showIP" value="true" defaultChecked={editingServer.showIP} className="rounded border-divider w-4 h-4" />
              <span className="text-sm text-text-primary">Show server IP publicly</span>
            </label>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={savingServer} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
                {savingServer ? <><Spinner size="sm" /> Saving...</> : <><Save size={16} /> Save Changes</>}
              </button>
              <button type="button" onClick={() => setEditingServer(null)} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dashboard Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Servers */}
        <div className="card-static p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
              <Server size={20} className="text-primary-light" />
              My Servers
            </h3>
            <Link href="/community/servers/submit" className="text-xs text-primary-light hover:text-primary flex items-center gap-1">
              <Plus size={14} /> Add
            </Link>
          </div>
          {loadingServers ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : servers.length > 0 ? (
            <div className="space-y-3">
              {servers.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-surface/50">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{s.name}</p>
                    <p className="text-xs text-text-secondary">{s.serverIP}:{s.queryPort}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => startEditServer(s)}
                      className="p-1.5 rounded text-text-secondary hover:text-primary-light hover:bg-primary/10 transition-colors"
                      title="Edit server"
                    >
                      <Pencil size={14} />
                    </button>
                    <StatusBadge status={s.status} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-divider rounded-lg p-8 text-center">
              <p className="text-text-secondary text-sm mb-3">No servers submitted yet.</p>
              <Link href="/community/servers/submit" className="text-sm text-primary-light hover:text-primary font-medium">
                Submit your first server
              </Link>
            </div>
          )}
        </div>

        {/* My Events */}
        <div className="card-static p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
              <Calendar size={20} className="text-secondary-light" />
              My Events
            </h3>
            {hasApprovedServer && (
              <button
                onClick={() => setShowEventForm(true)}
                className="text-xs text-secondary-light hover:text-secondary flex items-center gap-1"
              >
                <Plus size={14} /> Create
              </button>
            )}
          </div>
          {loadingEvents ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : events.length > 0 ? (
            <div className="space-y-3">
              {events.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/events/${ev.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-surface/50 hover:bg-surface transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{ev.title}</p>
                    <p className="text-xs text-text-secondary">
                      {new Date(ev.dateTime).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={ev.status} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-divider rounded-lg p-8 text-center">
              <p className="text-text-secondary text-sm mb-3">
                {hasApprovedServer ? 'No events created yet.' : 'You need an approved server to create events.'}
              </p>
              {hasApprovedServer ? (
                <button
                  onClick={() => setShowEventForm(true)}
                  className="text-sm text-secondary-light hover:text-secondary font-medium"
                >
                  Create your first event
                </button>
              ) : (
                <Link href="/community/servers/submit" className="text-sm text-primary-light hover:text-primary font-medium">
                  Submit a server
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Saved Configurations */}
        <div className="card-static p-6 lg:col-span-2">
          <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
            <FileCode size={20} className="text-accent-light" />
            Configuration Tools
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <ToolLink icon={<Puzzle size={18} />} label="Mod Manager" href="/tools/mod-manager" />
            <ToolLink icon={<FileCode size={18} />} label="Game.ini Generator" href="/tools/game-ini" />
            <ToolLink icon={<Terminal size={18} />} label="Commands.ini Generator" href="/tools/commands-ini" />
            <ToolLink icon={<FileText size={18} />} label="Rules/MOTD Generator" href="/tools/rules-motd" />
            <ToolLink icon={<TrendingUp size={18} />} label="Curve Overrides" href="/tools/curve-overrides" />
          </div>
          <p className="text-text-secondary text-xs mt-4">
            Sign in to save and load your configurations across sessions.
          </p>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <Link href={href} className="card p-4 flex items-center gap-3 hover:-translate-y-0.5 transition-all duration-200">
      <div className="p-2 rounded-lg bg-primary/10 text-primary-light">{icon}</div>
      <span className="text-sm font-medium text-text-primary">{label}</span>
    </Link>
  );
}

function ToolLink({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 p-3 rounded-lg bg-surface/50 hover:bg-surface transition-colors">
      <div className="text-accent-light">{icon}</div>
      <span className="text-sm text-text-primary">{label}</span>
      <ExternalLink size={12} className="ml-auto text-text-secondary" />
    </Link>
  );
}
