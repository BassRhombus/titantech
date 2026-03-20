'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  ImageIcon, Upload, X, Trash2, AlertCircle, Plus, User, ZoomIn, CheckCircle,
} from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import type { Screenshot } from '@/types';

export default function GalleryPage() {
  const { data: session } = useSession();
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox state
  const [selectedShot, setSelectedShot] = useState<Screenshot | null>(null);

  const fetchScreenshots = useCallback(async (cursor?: string) => {
    if (cursor) setLoadingMore(true);
    else setLoading(true);

    try {
      const url = cursor ? `/api/gallery?cursor=${cursor}` : '/api/gallery';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (cursor) {
          setScreenshots((prev) => [...prev, ...data.screenshots]);
        } else {
          setScreenshots(data.screenshots);
        }
        setNextCursor(data.nextCursor);
      }
    } catch {} finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchScreenshots();
  }, [fetchScreenshots]);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(f);
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!uploadFile) return;
    setUploadError('');
    setUploading(true);

    const formData = new FormData(e.currentTarget);
    formData.set('imageFile', uploadFile);

    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setShowUpload(false);
        setUploadFile(null);
        setPreviewUrl(null);
        (e.target as HTMLFormElement).reset();
        setUploadSuccess('Screenshot uploaded! It will appear in the gallery after admin approval.');
        setTimeout(() => setUploadSuccess(''), 6000);
        fetchScreenshots();
      } else {
        setUploadError(data.message || 'Upload failed');
      }
    } catch {
      setUploadError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this screenshot?')) return;
    try {
      const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setScreenshots((prev) => prev.filter((s) => s.id !== id));
        setSelectedShot(null);
      }
    } catch {}
  }

  const canDelete = (shot: Screenshot) =>
    session?.user?.id === shot.userId || session?.user?.isAdmin;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-primary-light mb-2">
            <ImageIcon size={28} />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">Gallery</h1>
          <p className="text-text-secondary">
            Screenshots from the Path of Titans community.
          </p>
        </div>
        {session && (
          <button
            onClick={() => { setShowUpload(!showUpload); setUploadError(''); }}
            className="btn-primary flex items-center gap-2 shrink-0"
          >
            <Plus size={18} />
            Upload Screenshot
          </button>
        )}
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="card-static p-6 mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
              <Upload size={20} className="text-primary-light" />
              Upload Screenshot
            </h3>
            <button onClick={() => setShowUpload(false)} className="text-text-secondary hover:text-text-primary transition-colors">
              <X size={20} />
            </button>
          </div>

          {uploadError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm">
              <AlertCircle size={16} />
              {uploadError}
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            {/* Image Preview / Select */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1">Screenshot *</label>
              {previewUrl ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview" className="max-h-64 rounded-lg border border-divider" />
                  <button
                    type="button"
                    onClick={() => { setUploadFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-background/80 text-text-secondary hover:text-error transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-divider rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
                >
                  <ImageIcon size={32} className="mx-auto text-text-secondary/50 mb-2" />
                  <p className="text-sm text-text-secondary">Click to select an image</p>
                  <p className="text-xs text-text-secondary/60 mt-1">JPEG, PNG, GIF, or WebP up to 10MB</p>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div>
              <label htmlFor="gallery-title" className="block text-sm font-medium text-text-primary mb-1">Title *</label>
              <input id="gallery-title" name="title" required minLength={1} maxLength={100} className="input-field w-full text-sm" placeholder="Give your screenshot a title" />
            </div>

            <div>
              <label htmlFor="gallery-desc" className="block text-sm font-medium text-text-primary mb-1">Description</label>
              <textarea id="gallery-desc" name="description" maxLength={500} rows={2} className="input-field w-full text-sm resize-none" placeholder="Optional description..." />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={uploading || !uploadFile} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
                {uploading ? <><Spinner size="sm" /> Uploading...</> : <><Upload size={16} /> Upload</>}
              </button>
              <button type="button" onClick={() => setShowUpload(false)} className="text-sm text-text-secondary hover:text-text-primary transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Upload Success */}
      {uploadSuccess && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg p-3 mb-6 flex items-center gap-2 text-sm animate-fade-in">
          <CheckCircle size={16} />
          {uploadSuccess}
        </div>
      )}

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : screenshots.length > 0 ? (
        <>
          <p className="text-text-secondary text-sm mb-4">
            {screenshots.length} screenshot{screenshots.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {screenshots.map((shot) => (
              <div
                key={shot.id}
                className="card overflow-hidden group cursor-pointer"
                onClick={() => setSelectedShot(shot)}
              >
                <div className="relative aspect-video bg-surface overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shot.imagePath}
                    alt={shot.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-text-primary truncate">{shot.title}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-text-secondary">
                    <User size={12} />
                    <span>{shot.username}</span>
                    <span className="ml-auto">{new Date(shot.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          {nextCursor && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => fetchScreenshots(nextCursor)}
                disabled={loadingMore}
                className="btn-outline flex items-center gap-2 disabled:opacity-50"
              >
                {loadingMore ? <><Spinner size="sm" /> Loading...</> : 'Load More'}
              </button>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={<ImageIcon size={48} />}
          title="No Screenshots Yet"
          description="Be the first to share a screenshot from the Path of Titans!"
          actionLabel={session ? 'Upload Screenshot' : 'Sign in to Upload'}
          actionHref={session ? undefined : '/login'}
          onAction={session ? () => setShowUpload(true) : undefined}
        />
      )}

      {/* Lightbox Modal */}
      <Modal
        open={!!selectedShot}
        onClose={() => setSelectedShot(null)}
        title={selectedShot?.title || ''}
      >
        {selectedShot && (
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedShot.imagePath} alt={selectedShot.title} className="w-full" />
            </div>
            {selectedShot.description && (
              <p className="text-sm text-text-secondary">{selectedShot.description}</p>
            )}
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <div className="flex items-center gap-1.5">
                <User size={12} />
                <span>{selectedShot.username}</span>
              </div>
              <span>{new Date(selectedShot.createdAt).toLocaleDateString()}</span>
            </div>
            {canDelete(selectedShot) && (
              <button
                onClick={() => handleDelete(selectedShot.id)}
                className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
