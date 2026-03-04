'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Upload, ArrowLeft, Server, CheckCircle, AlertCircle, X, ImageIcon, LogIn } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

export default function SubmitServerPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Array<{ field: string; message: string }>>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
        <Server size={64} className="text-text-secondary mx-auto mb-6" />
        <h1 className="font-heading text-3xl font-bold mb-4">Sign In Required</h1>
        <p className="text-text-secondary text-lg mb-8">
          You need to sign in with Discord to submit a server.
        </p>
        <Link href="/login" className="btn-primary inline-flex items-center gap-2">
          <LogIn size={18} />
          Sign In
        </Link>
      </div>
    );
  }

  function handleFileSelect(file: File | undefined) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, GIF, or WebP)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB');
      return;
    }
    setSelectedFile(file);
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setFieldErrors([]);

    if (!selectedFile) {
      setError('Please upload a server logo or banner image');
      return;
    }

    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.set('imageFile', selectedFile);

    try {
      const res = await fetch('/api/servers', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Failed to submit server');
        if (data.errors) setFieldErrors(data.errors);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <CheckCircle size={64} className="text-secondary-light mx-auto mb-6" />
        <h1 className="font-heading text-3xl font-bold mb-4">Server Submitted!</h1>
        <p className="text-text-secondary text-lg mb-8">
          Your server has been submitted and is pending review by our team. You&apos;ll be able to see its status on your dashboard.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/community" className="btn-primary">
            Browse Servers
          </Link>
          <Link href="/dashboard" className="btn-outline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back link */}
      <Link href="/community" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-6 transition-colors">
        <ArrowLeft size={16} />
        Back to Servers
      </Link>

      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold mb-2 flex items-center gap-3">
          <Server size={28} className="text-primary-light" />
          Submit Your Server
        </h1>
        <p className="text-text-secondary">
          Fill out the form below to submit your Path of Titans server. All submissions are reviewed before being listed.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{error}</p>
            {fieldErrors.length > 0 && (
              <ul className="mt-2 text-sm space-y-1">
                {fieldErrors.map((fe, i) => (
                  <li key={i}>{fe.field}: {fe.message}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Server Logo / Banner *
          </label>
          {preview ? (
            <div className="relative rounded-lg overflow-hidden border border-divider">
              <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
              <button
                type="button"
                onClick={() => { setPreview(null); setSelectedFile(null); }}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary'); }}
              onDragLeave={(e) => { e.currentTarget.classList.remove('border-primary'); }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-primary');
                handleFileSelect(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-divider rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <ImageIcon size={40} className="text-text-secondary mx-auto mb-3" />
              <p className="text-sm text-text-secondary mb-1">
                Drag and drop an image, or <span className="text-primary-light font-medium">click to browse</span>
              </p>
              <p className="text-xs text-text-secondary">JPG, PNG, GIF, or WebP. Max 10MB.</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
            className="hidden"
          />
        </div>

        {/* Server Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1.5">
            Server Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            minLength={3}
            maxLength={100}
            placeholder="My Awesome Server"
            className="input-field w-full"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-text-primary mb-1.5">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            minLength={10}
            maxLength={1000}
            rows={4}
            placeholder="Tell people about your server..."
            className="input-field w-full resize-none"
          />
        </div>

        {/* Server IP & Port */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="serverIP" className="block text-sm font-medium text-text-primary mb-1.5">
              Server IP *
            </label>
            <input
              id="serverIP"
              name="serverIP"
              type="text"
              required
              placeholder="123.456.789.0"
              pattern="^(\d{1,3}\.){3}\d{1,3}$"
              className="input-field w-full"
            />
          </div>
          <div>
            <label htmlFor="queryPort" className="block text-sm font-medium text-text-primary mb-1.5">
              Server Port *
            </label>
            <input
              id="queryPort"
              name="queryPort"
              type="number"
              required
              min={1}
              max={65535}
              placeholder="25000"
              className="input-field w-full"
            />
            <p className="text-xs text-text-secondary mt-1">
              Enter your game port or query port — we&apos;ll detect the correct one automatically.
            </p>
          </div>
        </div>

        {/* Show IP Toggle */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="showIP"
              value="true"
              className="rounded border-divider w-4 h-4"
            />
            <div>
              <span className="text-sm font-medium text-text-primary">Show server IP publicly</span>
              <p className="text-xs text-text-secondary">If enabled, your game IP and port will be visible on the server listing.</p>
            </div>
          </label>
        </div>

        {/* Discord Invite */}
        <div>
          <label htmlFor="discordInvite" className="block text-sm font-medium text-text-primary mb-1.5">
            Discord Invite Link *
          </label>
          <input
            id="discordInvite"
            name="discordInvite"
            type="url"
            required
            placeholder="https://discord.gg/your-server"
            className="input-field w-full"
          />
        </div>

        {/* Owner Discord */}
        <div>
          <label htmlFor="ownerDiscord" className="block text-sm font-medium text-text-primary mb-1.5">
            Your Discord Username *
          </label>
          <input
            id="ownerDiscord"
            name="ownerDiscord"
            type="text"
            required
            minLength={2}
            maxLength={32}
            placeholder="username"
            defaultValue={session.user.username}
            className="input-field w-full"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Spinner size="sm" />
                Submitting...
              </>
            ) : (
              <>
                <Upload size={18} />
                Submit Server
              </>
            )}
          </button>
          <Link href="/community" className="text-sm text-text-secondary hover:text-text-primary transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
