'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Image from 'next/image';
import {
  Puzzle, Search, Download, Upload, RefreshCw, CheckSquare, Square,
  ChevronDown, ChevronUp, AlertCircle,
} from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { ProfileManager } from '@/components/generators/ProfileManager';

interface Mod {
  mod_id: string;
  name: string;
  creator?: string;
  description?: string;
  image_url?: string;
  sku?: string;
}

export default function ModManagerPage() {
  const [mods, setMods] = useState<Mod[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [invalidModIds, setInvalidModIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMods();
  }, []);

  async function fetchMods() {
    setLoading(true);
    try {
      const res = await fetch('/api/gsh/mods');
      if (res.ok) {
        const data = await res.json();
        const sorted = (data.mods || data || []).sort((a: Mod, b: Mod) =>
          (a.name || '').localeCompare(b.name || '')
        );
        setMods(sorted);
        setLastRefreshed(new Date());
      }
    } catch {} finally {
      setLoading(false);
    }
  }

  async function handleRefresh() {
    try {
      await fetch('/api/mods/refresh');
    } catch {}
    await fetchMods();
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return mods;
    const q = search.toLowerCase();
    return mods.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q) ||
        m.mod_id?.toLowerCase().includes(q)
    );
  }, [mods, search]);

  function toggleMod(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelectedIds(new Set(filtered.map((m) => m.mod_id)));
  }

  function deselectAll() {
    setSelectedIds(new Set());
    setInvalidModIds([]);
  }

  function generateConfig(): string {
    let output = '[PathOfTitans.Mods]\n';
    if (selectedIds.size === 0) {
      output += '; No mods selected\n';
    } else {
      const selected = mods.filter((m) => selectedIds.has(m.mod_id));
      selected.forEach((m) => {
        output += `EnabledMods=${m.mod_id}\n`;
        output += `#${m.name}\n`;
      });
    }
    return output;
  }

  async function handleDownload() {
    const content = generateConfig();
    // Send webhook
    try {
      await fetch('/api/webhooks/generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileType: 'GameUserSettings.ini (Mods)',
          changedSettingsCount: selectedIds.size,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {}

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GameUserSettings.ini';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const ids = extractModIdsFromIni(content);
      const knownIds = new Set(mods.map((m) => m.mod_id));
      const valid = ids.filter((id) => knownIds.has(id));
      const invalid = ids.filter((id) => !knownIds.has(id));
      setSelectedIds(new Set(valid));
      setInvalidModIds(invalid);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const getProfileData = useCallback(() => ({
    selectedModIds: Array.from(selectedIds),
  }), [selectedIds]);

  const loadProfileData = useCallback((data: Record<string, unknown>) => {
    if (Array.isArray(data.selectedModIds)) {
      const ids = data.selectedModIds as string[];
      const knownIds = new Set(mods.map((m) => m.mod_id));
      const valid = ids.filter((id) => knownIds.has(id));
      const invalid = ids.filter((id) => !knownIds.has(id));
      setSelectedIds(new Set(valid));
      setInvalidModIds(invalid);
    }
  }, [mods]);

  function extractModIdsFromIni(content: string): string[] {
    const ids: string[] = [];
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith(';') || trimmed.startsWith('#') || !trimmed) continue;
      const match = trimmed.match(/^EnabledMods\s*=\s*(.+)$/i);
      if (match) {
        ids.push(match[1].trim());
      }
    }
    return ids;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-primary-light mb-2">
          <Puzzle size={28} />
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">Mod Manager</h1>
        <p className="text-text-secondary">
          Browse, search, and select mods for your Path of Titans server.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search mods by name, description, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={selectAll} className="btn-outline flex items-center gap-1.5 text-sm">
            <CheckSquare size={16} /> Select All
          </button>
          <button onClick={deselectAll} className="btn-outline flex items-center gap-1.5 text-sm">
            <Square size={16} /> Deselect All
          </button>
          <button onClick={handleRefresh} className="btn-outline flex items-center gap-1.5 text-sm">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* Info Bar */}
      <div className="flex items-center justify-between mb-4 text-sm text-text-secondary">
        <span>{selectedIds.size} mod{selectedIds.size !== 1 ? 's' : ''} selected</span>
        {lastRefreshed && (
          <span>Last refreshed: {lastRefreshed.toLocaleTimeString()}</span>
        )}
      </div>

      {/* Invalid Mod IDs Warning */}
      {invalidModIds.length > 0 && (
        <div className="mb-4 card border-yellow-500/50 bg-yellow-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-yellow-500 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <h4 className="font-heading font-semibold text-yellow-400 text-sm mb-1">
                {invalidModIds.length} Invalid Mod ID{invalidModIds.length !== 1 ? 's' : ''} Found
              </h4>
              <p className="text-xs text-text-secondary mb-2">
                These mod IDs from your file don&apos;t match any mods in the API and won&apos;t be included in your config.
                They may have been removed, renamed, or not yet published.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {invalidModIds.map((id) => (
                  <code
                    key={id}
                    className="text-[11px] bg-yellow-500/10 border border-yellow-500/30 rounded px-1.5 py-0.5 text-yellow-300"
                  >
                    {id}
                  </code>
                ))}
              </div>
              <button
                onClick={() => setInvalidModIds([])}
                className="text-xs text-text-secondary hover:text-text-primary mt-2 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mod Grid */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((mod) => {
                const isSelected = selectedIds.has(mod.mod_id);
                return (
                  <button
                    key={mod.mod_id}
                    onClick={() => toggleMod(mod.mod_id)}
                    className={`card p-3 flex items-start gap-3 text-left transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : ''
                    }`}
                  >
                    {mod.image_url ? (
                      <Image
                        src={mod.image_url}
                        alt=""
                        width={64}
                        height={64}
                        className="rounded-lg object-cover shrink-0 w-16 h-16"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-surface flex items-center justify-center shrink-0">
                        <Puzzle size={24} className="text-text-secondary/30" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-text-primary truncate">{mod.name || mod.mod_id}</p>
                      {mod.creator && <p className="text-xs text-text-secondary">by {mod.creator}</p>}
                      {mod.description && (
                        <p className="text-xs text-text-secondary line-clamp-2 mt-0.5">{mod.description}</p>
                      )}
                      <code className="text-[10px] text-text-secondary/70 mt-1 block truncate">{mod.mod_id}</code>
                    </div>
                    <div className={`shrink-0 mt-1 ${isSelected ? 'text-primary-light' : 'text-text-secondary/30'}`}>
                      {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <Puzzle size={48} className="text-text-secondary mx-auto mb-4" />
              <h3 className="font-heading text-lg font-semibold mb-2">No Mods Found</h3>
              <p className="text-text-secondary text-sm">
                {search ? 'Try a different search term.' : 'No mods available. Try refreshing.'}
              </p>
            </div>
          )}
        </div>

        {/* Preview & Actions Panel */}
        <div className="space-y-4">
          {/* Profiles */}
          <ProfileManager
            generatorType="mod-manager"
            getCurrentData={getProfileData}
            onLoadData={loadProfileData}
          />

          {/* Actions */}
          <div className="card p-4 space-y-3">
            <h3 className="font-heading font-semibold flex items-center gap-2">
              <Download size={18} className="text-primary-light" />
              Generate Config
            </h3>
            <button
              onClick={handleDownload}
              disabled={selectedIds.size === 0}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download size={16} />
              Download GameUserSettings.ini ({selectedIds.size})
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-outline w-full flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              Upload Existing INI
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".ini,.txt"
              onChange={handleUpload}
              className="hidden"
            />
          </div>

          {/* Preview */}
          <div className="card overflow-hidden">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <h3 className="font-heading font-semibold text-sm">Config Preview</h3>
              {showPreview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showPreview && (
              <div className="px-4 pb-4">
                <pre className="bg-background rounded-lg p-3 text-xs font-mono text-text-secondary overflow-auto max-h-96 whitespace-pre-wrap">
                  {generateConfig()}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
