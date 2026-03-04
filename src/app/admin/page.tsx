'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Shield, Server, Check, X, Trash2, Eye, AlertCircle, ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import type { ServerSubmission } from '@/types';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [servers, setServers] = useState<ServerSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');
  const [selectedServer, setSelectedServer] = useState<ServerSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.isAdmin) fetchServers();
  }, [session]);

  async function fetchServers() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/servers');
      if (res.ok) setServers(await res.json());
    } catch {} finally {
      setLoading(false);
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

  async function handleDelete(id: string) {
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

  if (status === 'loading') {
    return <div className="min-h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!session || !session.user.isAdmin) {
    redirect('/');
  }

  const filtered = filter === 'all' ? servers : servers.filter((s) => s.status === filter);
  const counts = {
    all: servers.length,
    pending: servers.filter((s) => s.status === 'pending').length,
    approved: servers.filter((s) => s.status === 'approved').length,
    rejected: servers.filter((s) => s.status === 'rejected').length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2 flex items-center gap-3">
          <Shield size={28} className="text-primary-light" />
          Admin Panel
        </h1>
        <p className="text-text-secondary">Manage server submissions and site content.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`card p-4 text-center transition-colors ${
              filter === key ? 'border-primary bg-primary/5' : ''
            }`}
          >
            <p className="text-2xl font-bold text-text-primary">{counts[key]}</p>
            <p className="text-xs text-text-secondary capitalize">{key}</p>
          </button>
        ))}
      </div>

      {/* Server List */}
      <h2 className="font-heading text-xl font-semibold mb-4 flex items-center gap-2">
        <Server size={20} className="text-primary-light" />
        Server Submissions
      </h2>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((server) => (
            <div key={server.id} className="card p-4">
              <div className="flex items-start gap-4">
                {/* Image thumbnail */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-surface shrink-0">
                  {server.imagePath ? (
                    <Image src={server.imagePath} alt="" fill className="object-cover" />
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
                    onClick={() => handleDelete(server.id)}
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
          description={`No ${filter === 'all' ? '' : filter} server submissions found.`}
        />
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
                <Image src={selectedServer.imagePath} alt="" fill className="object-cover" />
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

            {/* Actions for pending servers */}
            {selectedServer.status === 'pending' && (
              <div className="border-t border-divider pt-4 space-y-3">
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
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
