'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield, Server, Check, X, Trash2, Eye, AlertCircle, Pencil,
  ExternalLink, Calendar, ImageIcon, Save, CheckCircle, XCircle,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import type { ServerSubmission, Screenshot } from '@/types';

interface EventItem {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  endDateTime?: string | null;
  serverName?: string | null;
  category: string;
  status: string;
  creator: { username: string; discordId: string };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<'servers' | 'events' | 'gallery'>('servers');

  // Server state
  const [servers, setServers] = useState<ServerSubmission[]>([]);
  const [loadingServers, setLoadingServers] = useState(true);
  const [serverFilter, setServerFilter] = useState<string>('pending');
  const [selectedServer, setSelectedServer] = useState<ServerSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Server edit state
  const [editingServer, setEditingServer] = useState<ServerSubmission | null>(null);
  const [savingServer, setSavingServer] = useState(false);
  const [serverEditError, setServerEditError] = useState('');
  const [serverEditSuccess, setServerEditSuccess] = useState('');
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);

  // Event state
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventFilter, setEventFilter] = useState<string>('all');

  // Gallery state
  const [galleryShots, setGalleryShots] = useState<Screenshot[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [galleryFilter, setGalleryFilter] = useState<string>('pending');

  useEffect(() => {
    if (session?.user?.isAdmin) {
      fetchServers();
      fetchEvents();
      fetchGallery();
    }
  }, [session]);

  async function fetchServers() {
    setLoadingServers(true);
    try {
      const res = await fetch('/api/admin/servers');
      if (res.ok) setServers(await res.json());
    } catch {} finally {
      setLoadingServers(false);
    }
  }

  async function fetchEvents() {
    setLoadingEvents(true);
    try {
      const res = await fetch('/api/events');
      if (res.ok) setEvents(await res.json());
    } catch {} finally {
      setLoadingEvents(false);
    }
  }

  async function fetchGallery() {
    setLoadingGallery(true);
    try {
      const res = await fetch('/api/admin/gallery');
      if (res.ok) setGalleryShots(await res.json());
    } catch {} finally {
      setLoadingGallery(false);
    }
  }

  async function handleGalleryStatus(id: string, newStatus: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchGallery();
    } catch {} finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteScreenshot(id: string) {
    if (!confirm('Permanently delete this screenshot?')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) setGalleryShots((prev) => prev.filter((s) => s.id !== id));
    } catch {} finally {
      setActionLoading(null);
    }
  }

  async function handleStatusUpdate(id: string, newStatus: string, reason?: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/servers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, reason }),
      });
      if (res.ok) {
        fetchServers();
        setSelectedServer(null);
        setRejectReason('');
      }
    } catch {} finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteServer(id: string) {
    if (!confirm('Permanently delete this server submission?')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/servers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setServers((prev) => prev.filter((s) => s.id !== id));
        setSelectedServer(null);
      }
    } catch {} finally {
      setActionLoading(null);
    }
  }

  function startEditServer(server: ServerSubmission) {
    setEditingServer(server);
    setEditPreview(null);
    setEditFile(null);
    setServerEditError('');
    setSelectedServer(null);
  }

  async function handleSaveServer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingServer) return;
    setServerEditError('');
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
        setServerEditSuccess('Server updated successfully!');
        setEditingServer(null);
        fetchServers();
        setTimeout(() => setServerEditSuccess(''), 4000);
      } else {
        setServerEditError(data.message || 'Failed to update server');
      }
    } catch {
      setServerEditError('Network error. Please try again.');
    } finally {
      setSavingServer(false);
    }
  }

  async function handleEventStatusChange(id: string, newStatus: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) fetchEvents();
    } catch {} finally {
      setActionLoading(null);
    }
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm('Permanently delete this event?')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch {} finally {
      setActionLoading(null);
    }
  }

  if (status === 'loading') {
    return <div className="min-h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!session || !session.user.isAdmin) {
    redirect('/');
  }

  const filteredServers = serverFilter === 'all' ? servers : servers.filter((s) => s.status === serverFilter);
  const serverCounts = {
    all: servers.length,
    pending: servers.filter((s) => s.status === 'pending').length,
    approved: servers.filter((s) => s.status === 'approved').length,
    rejected: servers.filter((s) => s.status === 'rejected').length,
  };

  const filteredEvents = eventFilter === 'all' ? events : events.filter((e) => e.status === eventFilter);
  const eventCounts = {
    all: events.length,
    active: events.filter((e) => e.status === 'active').length,
    completed: events.filter((e) => e.status === 'completed').length,
    cancelled: events.filter((e) => e.status === 'cancelled').length,
  };

  const filteredGallery = galleryFilter === 'all' ? galleryShots : galleryShots.filter((s) => s.status === galleryFilter);
  const galleryCounts = {
    all: galleryShots.length,
    pending: galleryShots.filter((s) => s.status === 'pending').length,
    approved: galleryShots.filter((s) => s.status === 'approved').length,
    rejected: galleryShots.filter((s) => s.status === 'rejected').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2 flex items-center gap-3">
          <Shield size={28} className="text-primary-light" />
          Admin Panel
        </h1>
        <p className="text-text-secondary">Manage server submissions, events, and site content.</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 mb-8 border-b border-divider">
        <button
          onClick={() => setActiveTab('servers')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === 'servers'
              ? 'border-primary text-primary-light'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Server size={16} />
          Servers
          {serverCounts.pending > 0 && (
            <span className="bg-red-500/20 text-red-400 text-xs px-1.5 py-0.5 rounded-full">{serverCounts.pending}</span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === 'events'
              ? 'border-primary text-primary-light'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <Calendar size={16} />
          Events
          <span className="bg-surface text-text-secondary text-xs px-1.5 py-0.5 rounded-full">{eventCounts.all}</span>
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
            activeTab === 'gallery'
              ? 'border-primary text-primary-light'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          <ImageIcon size={16} />
          Gallery
          {galleryCounts.pending > 0 && (
            <span className="bg-red-500/20 text-red-400 text-xs px-1.5 py-0.5 rounded-full">{galleryCounts.pending}</span>
          )}
        </button>
      </div>

      {/* Success Messages */}
      {serverEditSuccess && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg p-3 mb-6 flex items-center gap-2 text-sm animate-fade-in">
          <CheckCircle size={16} />
          {serverEditSuccess}
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

          {serverEditError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              {serverEditError}
            </div>
          )}

          <form onSubmit={handleSaveServer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Server Image</label>
              <div className="flex items-center gap-4">
                {(editPreview || editingServer.imagePath) && (
                  /* eslint-disable-next-line @next/next/no-img-element */
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
                <label htmlFor="admin-edit-name" className="block text-sm font-medium text-text-primary mb-1">Server Name</label>
                <input id="admin-edit-name" name="name" defaultValue={editingServer.name} minLength={3} maxLength={100} className="input-field w-full text-sm" />
              </div>
              <div>
                <label htmlFor="admin-edit-ownerDiscord" className="block text-sm font-medium text-text-primary mb-1">Owner Discord</label>
                <input id="admin-edit-ownerDiscord" name="ownerDiscord" defaultValue={editingServer.ownerDiscord} className="input-field w-full text-sm" />
              </div>
            </div>

            <div>
              <label htmlFor="admin-edit-description" className="block text-sm font-medium text-text-primary mb-1">Description</label>
              <textarea id="admin-edit-description" name="description" defaultValue={editingServer.description} rows={3} minLength={10} maxLength={1000} className="input-field w-full text-sm resize-none" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="admin-edit-serverIP" className="block text-sm font-medium text-text-primary mb-1">Server IP</label>
                <input id="admin-edit-serverIP" name="serverIP" defaultValue={editingServer.serverIP} className="input-field w-full text-sm" />
              </div>
              <div>
                <label htmlFor="admin-edit-queryPort" className="block text-sm font-medium text-text-primary mb-1">Server Port</label>
                <input id="admin-edit-queryPort" name="queryPort" type="number" defaultValue={editingServer.queryPort} min={1} max={65535} className="input-field w-full text-sm" />
              </div>
              <div>
                <label htmlFor="admin-edit-discordInvite" className="block text-sm font-medium text-text-primary mb-1">Discord Invite</label>
                <input id="admin-edit-discordInvite" name="discordInvite" defaultValue={editingServer.discordInvite} className="input-field w-full text-sm" />
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

      {/* ===== SERVERS TAB ===== */}
      {activeTab === 'servers' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setServerFilter(key)}
                className={`card p-4 text-center transition-colors ${
                  serverFilter === key ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <p className="text-2xl font-bold text-text-primary">{serverCounts[key]}</p>
                <p className="text-xs text-text-secondary capitalize">{key}</p>
              </button>
            ))}
          </div>

          {/* Server List */}
          {loadingServers ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : filteredServers.length > 0 ? (
            <div className="space-y-3">
              {filteredServers.map((server) => (
                <div key={server.id} className="card p-4">
                  <div className="flex items-start gap-4">
                    {/* Image thumbnail */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-surface shrink-0">
                      {server.imagePath ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={server.imagePath} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Server size={24} className="text-text-secondary/30" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading font-semibold text-text-primary truncate">{server.name}</h3>
                        <StatusBadge status={server.status} />
                      </div>
                      <p className="text-text-secondary text-sm line-clamp-1 mb-1">{server.description}</p>
                      <div className="flex items-center gap-4 text-xs text-text-secondary">
                        <span>IP: {server.serverIP}:{server.queryPort}</span>
                        <span>By: {server.submittedBy}</span>
                        <span>{new Date(server.submittedAt).toLocaleDateString()}</span>
                      </div>
                      {server.rejectionReason && (
                        <p className="text-xs text-red-400 mt-1">Reason: {server.rejectionReason}</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedServer(server)}
                        className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                        title="View details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => startEditServer(server)}
                        className="p-2 rounded-lg text-text-secondary hover:text-primary-light hover:bg-primary/10 transition-colors"
                        title="Edit server"
                      >
                        <Pencil size={18} />
                      </button>
                      {server.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(server.id, 'approved')}
                            disabled={actionLoading === server.id}
                            className="p-2 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors"
                            title="Approve"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => { setSelectedServer(server); setRejectReason(''); }}
                            disabled={actionLoading === server.id}
                            className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Reject"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteServer(server.id)}
                        disabled={actionLoading === server.id}
                        className="p-2 rounded-lg text-text-secondary hover:text-error hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Server size={48} />}
              title="No Submissions"
              description={`No ${serverFilter === 'all' ? '' : serverFilter} server submissions found.`}
            />
          )}
        </>
      )}

      {/* ===== EVENTS TAB ===== */}
      {activeTab === 'events' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {(['all', 'active', 'completed', 'cancelled'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setEventFilter(key)}
                className={`card p-4 text-center transition-colors ${
                  eventFilter === key ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <p className="text-2xl font-bold text-text-primary">{eventCounts[key]}</p>
                <p className="text-xs text-text-secondary capitalize">{key}</p>
              </button>
            ))}
          </div>

          {/* Event List */}
          {loadingEvents ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : filteredEvents.length > 0 ? (
            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <div key={event.id} className="card p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-heading font-semibold text-text-primary truncate">{event.title}</h3>
                        <StatusBadge status={event.status} />
                        <span className="text-xs bg-surface px-2 py-0.5 rounded text-text-secondary capitalize">{event.category}</span>
                      </div>
                      <p className="text-text-secondary text-sm line-clamp-1 mb-1">{event.description}</p>
                      <div className="flex items-center gap-4 text-xs text-text-secondary">
                        <span>{new Date(event.dateTime).toLocaleDateString()} {new Date(event.dateTime).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</span>
                        {event.serverName && <span>Server: {event.serverName}</span>}
                        <span>By: {event.creator.username}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/events/${event.id}`}
                        className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
                        title="View event"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        href={`/events/${event.id}/edit`}
                        className="p-2 rounded-lg text-text-secondary hover:text-primary-light hover:bg-primary/10 transition-colors"
                        title="Edit event"
                      >
                        <Pencil size={18} />
                      </Link>
                      {event.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleEventStatusChange(event.id, 'completed')}
                            disabled={actionLoading === event.id}
                            className="p-2 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors"
                            title="Mark completed"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleEventStatusChange(event.id, 'cancelled')}
                            disabled={actionLoading === event.id}
                            className="p-2 rounded-lg text-orange-400 hover:bg-orange-500/10 transition-colors"
                            title="Cancel event"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        disabled={actionLoading === event.id}
                        className="p-2 rounded-lg text-text-secondary hover:text-error hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar size={48} />}
              title="No Events"
              description={`No ${eventFilter === 'all' ? '' : eventFilter} events found.`}
            />
          )}
        </>
      )}

      {/* ===== GALLERY TAB ===== */}
      {activeTab === 'gallery' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setGalleryFilter(key)}
                className={`card p-4 text-center transition-colors ${
                  galleryFilter === key ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <p className="text-2xl font-bold text-text-primary">{galleryCounts[key]}</p>
                <p className="text-xs text-text-secondary capitalize">{key}</p>
              </button>
            ))}
          </div>

          {/* Gallery List */}
          {loadingGallery ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : filteredGallery.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGallery.map((shot) => (
                <div key={shot.id} className="card overflow-hidden">
                  <div className="relative aspect-video bg-surface overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={shot.imagePath} alt={shot.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-semibold text-text-primary truncate flex-1">{shot.title}</h3>
                      <StatusBadge status={shot.status} />
                    </div>
                    {shot.description && (
                      <p className="text-text-secondary text-sm line-clamp-1 mb-1">{shot.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-text-secondary mb-3">
                      <span>By: {shot.username}</span>
                      <span>{new Date(shot.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {shot.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleGalleryStatus(shot.id, 'approved')}
                            disabled={actionLoading === shot.id}
                            className="p-2 rounded-lg text-green-400 hover:bg-green-500/10 transition-colors"
                            title="Approve"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => handleGalleryStatus(shot.id, 'rejected')}
                            disabled={actionLoading === shot.id}
                            className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Reject"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}
                      {shot.status !== 'pending' && (
                        <button
                          onClick={() => handleGalleryStatus(shot.id, 'pending')}
                          disabled={actionLoading === shot.id}
                          className="text-xs text-text-secondary hover:text-text-primary transition-colors"
                        >
                          Reset to Pending
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteScreenshot(shot.id)}
                        disabled={actionLoading === shot.id}
                        className="p-2 rounded-lg text-text-secondary hover:text-error hover:bg-red-500/10 transition-colors ml-auto"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<ImageIcon size={48} />}
              title="No Screenshots"
              description={`No ${galleryFilter === 'all' ? '' : galleryFilter} screenshots found.`}
            />
          )}
        </>
      )}

      {/* Server Detail Modal */}
      <Modal
        open={!!selectedServer}
        onClose={() => { setSelectedServer(null); setRejectReason(''); }}
        title="Server Submission Details"
      >
        {selectedServer && (
          <div className="space-y-4">
            {selectedServer.imagePath && (
              <div className="relative h-48 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={selectedServer.imagePath} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <p className="text-xs text-text-secondary mb-1">Server Name</p>
              <p className="font-medium">{selectedServer.name}</p>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">Description</p>
              <p className="text-sm text-text-secondary">{selectedServer.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-text-secondary mb-1">Server IP</p>
                <code className="text-sm bg-surface px-2 py-0.5 rounded">{selectedServer.serverIP}:{selectedServer.queryPort}</code>
              </div>
              <div>
                <p className="text-xs text-text-secondary mb-1">Owner Discord</p>
                <p className="text-sm">{selectedServer.ownerDiscord}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">Discord Invite</p>
              <a href={selectedServer.discordInvite} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-light hover:text-primary flex items-center gap-1">
                {selectedServer.discordInvite} <ExternalLink size={12} />
              </a>
            </div>
            <div>
              <p className="text-xs text-text-secondary mb-1">Status</p>
              <StatusBadge status={selectedServer.status} />
            </div>

            {/* Edit + Approve/Reject actions */}
            <div className="border-t border-divider pt-4 space-y-3">
              <button
                onClick={() => startEditServer(selectedServer)}
                className="btn-outline w-full flex items-center justify-center gap-2"
              >
                <Pencil size={16} /> Edit Server Details
              </button>

              {selectedServer.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(selectedServer.id, 'approved')}
                    disabled={!!actionLoading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Check size={16} /> Approve Server
                  </button>
                  <div>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Rejection reason (optional)"
                      maxLength={500}
                      rows={2}
                      className="input-field w-full resize-none text-sm mb-2"
                    />
                    <button
                      onClick={() => handleStatusUpdate(selectedServer.id, 'rejected', rejectReason)}
                      disabled={!!actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                    >
                      <X size={16} /> Reject Server
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
