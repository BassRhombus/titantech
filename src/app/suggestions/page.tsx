'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import {
  Lightbulb, Search, Plus, ThumbsUp, MessageCircle, Trash2, Send,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';

interface Comment {
  id: string;
  text: string;
  author: string;
  likes: number;
  createdAt: string;
}

interface Suggestion {
  id: string;
  title: string;
  category: string;
  description: string;
  author: string;
  votes: number;
  comments: Comment[];
  createdAt: string;
}

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'features', label: 'Features' },
  { value: 'map-changes', label: 'Map Changes' },
  { value: 'bugs', label: 'Bugs' },
  { value: 'other', label: 'Other' },
];

const categoryColors: Record<string, string> = {
  features: 'bg-primary/10 text-primary-light',
  'map-changes': 'bg-secondary/10 text-secondary-light',
  bugs: 'bg-red-500/10 text-red-400',
  other: 'bg-surface text-text-secondary',
};

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Votes' },
  { value: 'discussed', label: 'Most Discussed' },
];

export default function SuggestionsPage() {
  const { data: session } = useSession();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('recent');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  async function fetchSuggestions() {
    setLoading(true);
    try {
      const res = await fetch('/api/suggestions');
      if (res.ok) setSuggestions(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fd.get('title'),
          category: fd.get('category'),
          description: fd.get('description'),
          author: fd.get('author') || 'Anonymous',
        }),
      });
      if (res.ok) {
        setShowForm(false);
        fetchSuggestions();
      }
    } catch {} finally {
      setSubmitting(false);
    }
  }

  async function handleVote(id: string) {
    try {
      const res = await fetch(`/api/suggestions/${id}/vote`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSuggestions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, votes: data.votes } : s))
        );
      }
    } catch {}
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this suggestion?')) return;
    try {
      const res = await fetch(`/api/suggestions/${id}`, { method: 'DELETE' });
      if (res.ok) setSuggestions((prev) => prev.filter((s) => s.id !== id));
    } catch {}
  }

  async function handleComment(suggestionId: string, text: string, author: string) {
    try {
      const res = await fetch(`/api/suggestions/${suggestionId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, author: author || 'Anonymous' }),
      });
      if (res.ok) fetchSuggestions();
    } catch {}
  }

  async function handleLikeComment(suggestionId: string, commentId: string) {
    try {
      const res = await fetch(`/api/suggestions/${suggestionId}/comments/${commentId}/like`, { method: 'POST' });
      if (res.ok) fetchSuggestions();
    } catch {}
  }

  async function handleDeleteComment(suggestionId: string, commentId: string) {
    try {
      const res = await fetch(`/api/suggestions/${suggestionId}/comments/${commentId}`, { method: 'DELETE' });
      if (res.ok) fetchSuggestions();
    } catch {}
  }

  const filtered = useMemo(() => {
    let list = [...suggestions];
    if (category) list = list.filter((s) => s.category === category);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    if (sort === 'popular') list.sort((a, b) => b.votes - a.votes);
    else if (sort === 'discussed') list.sort((a, b) => b.comments.length - a.comments.length);
    else list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [suggestions, search, category, sort]);

  const isMod = session?.user?.isModerator || session?.user?.isAdmin;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 text-accent-light mb-2">
            <Lightbulb size={28} />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">Suggestions</h1>
          <p className="text-text-secondary">
            Submit ideas and vote on community suggestions.
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 shrink-0">
          <Plus size={18} />
          New Suggestion
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search suggestions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field">
          {sortOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Suggestions List */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((s) => (
            <SuggestionItem
              key={s.id}
              suggestion={s}
              expanded={expandedId === s.id}
              onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
              onVote={() => handleVote(s.id)}
              onDelete={isMod ? () => handleDelete(s.id) : undefined}
              onComment={(text, author) => handleComment(s.id, text, author)}
              onLikeComment={(commentId) => handleLikeComment(s.id, commentId)}
              onDeleteComment={isMod ? (commentId) => handleDeleteComment(s.id, commentId) : undefined}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Lightbulb size={48} />}
          title="No Suggestions"
          description="Be the first to share an idea with the community!"
        />
      )}

      {/* New Suggestion Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Suggestion">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Title *</label>
            <input name="title" required maxLength={100} className="input-field w-full" placeholder="Your suggestion title" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Category *</label>
            <select name="category" required className="input-field w-full">
              <option value="">Select category...</option>
              <option value="features">Features</option>
              <option value="map-changes">Map Changes</option>
              <option value="bugs">Bugs</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Description *</label>
            <textarea name="description" required maxLength={1000} rows={4} className="input-field w-full resize-none" placeholder="Describe your suggestion..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Your Name</label>
            <input name="author" maxLength={100} className="input-field w-full" placeholder="Anonymous" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              {submitting ? <Spinner size="sm" /> : <Send size={16} />}
              Submit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function SuggestionItem({
  suggestion: s,
  expanded,
  onToggle,
  onVote,
  onDelete,
  onComment,
  onLikeComment,
  onDeleteComment,
}: {
  suggestion: Suggestion;
  expanded: boolean;
  onToggle: () => void;
  onVote: () => void;
  onDelete?: () => void;
  onComment: (text: string, author: string) => void;
  onLikeComment: (commentId: string) => void;
  onDeleteComment?: (commentId: string) => void;
}) {
  const [commentText, setCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');

  return (
    <div className="card overflow-hidden">
      <div className="flex">
        {/* Vote Column */}
        <button
          onClick={onVote}
          className="flex flex-col items-center justify-center px-4 py-4 bg-surface/50 hover:bg-surface transition-colors gap-1 shrink-0"
        >
          <ThumbsUp size={18} className="text-primary-light" />
          <span className="text-sm font-semibold text-text-primary">{s.votes}</span>
        </button>

        {/* Content */}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-heading font-semibold text-text-primary">{s.title}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[s.category] || categoryColors.other}`}>
                {s.category.replace('-', ' ')}
              </span>
            </div>
            {onDelete && (
              <button onClick={onDelete} className="p-1 text-text-secondary hover:text-error transition-colors shrink-0">
                <Trash2 size={16} />
              </button>
            )}
          </div>
          <p className="text-text-secondary text-sm mb-3">{s.description}</p>
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span>by {s.author}</span>
            <span>{new Date(s.createdAt).toLocaleDateString()}</span>
            <button onClick={onToggle} className="flex items-center gap-1 text-primary-light hover:text-primary transition-colors">
              <MessageCircle size={14} />
              {s.comments.length} comment{s.comments.length !== 1 ? 's' : ''}
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {expanded && (
        <div className="border-t border-divider bg-background/50">
          {s.comments.length > 0 && (
            <div className="divide-y divide-divider">
              {s.comments.map((c) => (
                <div key={c.id} className="px-4 py-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs text-text-secondary mb-1">
                      <span className="font-medium text-text-primary">{c.author}</span>
                      <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-text-secondary">{c.text}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onLikeComment(c.id)}
                      className="flex items-center gap-1 text-xs text-text-secondary hover:text-primary-light transition-colors"
                    >
                      <ThumbsUp size={12} />
                      {c.likes}
                    </button>
                    {onDeleteComment && (
                      <button
                        onClick={() => onDeleteComment(c.id)}
                        className="text-text-secondary hover:text-error transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Comment */}
          <div className="p-4 border-t border-divider">
            <div className="flex gap-2">
              <input
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="Name"
                maxLength={100}
                className="input-field w-28 text-sm"
              />
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                maxLength={500}
                className="input-field flex-1 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && commentText.trim()) {
                    onComment(commentText.trim(), commentAuthor.trim());
                    setCommentText('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (commentText.trim()) {
                    onComment(commentText.trim(), commentAuthor.trim());
                    setCommentText('');
                  }
                }}
                disabled={!commentText.trim()}
                className="btn-primary px-3 disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
