'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  TrendingUp, Download, Upload, Copy, RotateCcw, ChevronDown, ChevronUp,
  Check, Plus, Trash2, Pencil,
} from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { ProfileManager } from '@/components/generators/ProfileManager';

interface CurveOverride {
  creature: string;
  section: string;
  curveName: string;
  values: number[];
  defaults: number[];
}

interface CoCategory { name: string; creatureCount: number }
interface CoCreature { name: string; sections: string[] }
interface CoCreator { name: string }

const GROWTH_LABELS = ['Hatchling', 'Juvenile', 'Adolescent', 'Sub-Adult', 'Adult'];

export default function CurveOverridesPage() {
  const [curveOverrides, setCurveOverrides] = useState<CurveOverride[]>([]);
  const [coCategories, setCoCategories] = useState<CoCategory[]>([]);
  const [coCreatures, setCoCreatures] = useState<CoCreature[]>([]);
  const [coCreators, setCoCreators] = useState<CoCreator[]>([]);
  const [coSections, setCoSections] = useState<Record<string, Record<string, number[]>>>({});
  const [coSelectedCategory, setCoSelectedCategory] = useState('');
  const [coSelectedAuthor, setCoSelectedAuthor] = useState('');
  const [coSelectedCreature, setCoSelectedCreature] = useState('');
  const [coSelectedSection, setCoSelectedSection] = useState('');
  const [coSelectedCurve, setCoSelectedCurve] = useState('');
  const [coValues, setCoValues] = useState<number[]>([0, 0, 0, 0, 0]);
  const [coDefaults, setCoDefaults] = useState<number[]>([0, 0, 0, 0, 0]);
  const [coLoadingCreatures, setCoLoadingCreatures] = useState(false);
  const [coLoadingCurves, setCoLoadingCurves] = useState(false);
  const [coEditingIndex, setCoEditingIndex] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch curve override categories on mount
  useEffect(() => {
    fetch('/api/gsh/curve-overrides')
      .then((r) => r.json())
      .then((d) => { if (d.categories) setCoCategories(d.categories); })
      .catch(() => {});
  }, []);

  // Fetch creatures when category changes
  useEffect(() => {
    if (!coSelectedCategory) { setCoCreatures([]); setCoCreators([]); return; }
    setCoLoadingCreatures(true);
    setCoSelectedAuthor('');
    setCoSelectedCreature('');
    setCoSections({});
    setCoSelectedSection('');
    setCoSelectedCurve('');

    fetch(`/api/gsh/curve-overrides/${coSelectedCategory.toLowerCase()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.creatures) {
          const sorted = [...d.creatures].sort((a: CoCreature, b: CoCreature) => a.name.localeCompare(b.name));
          setCoCreatures(sorted);
        }
        if (d.creators) {
          const sorted = [...d.creators].sort((a: CoCreator, b: CoCreator) => a.name.localeCompare(b.name));
          setCoCreators(sorted);
        } else {
          setCoCreators([]);
        }
      })
      .catch(() => {})
      .finally(() => setCoLoadingCreatures(false));
  }, [coSelectedCategory]);

  // Fetch creatures for mod author
  useEffect(() => {
    if (!coSelectedAuthor || coSelectedCategory.toLowerCase() !== 'mod') return;
    setCoLoadingCreatures(true);
    setCoSelectedCreature('');
    setCoSections({});

    fetch(`/api/gsh/curve-overrides/mod/${encodeURIComponent(coSelectedAuthor)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.creatures) {
          const sorted = [...d.creatures].sort((a: CoCreature, b: CoCreature) => a.name.localeCompare(b.name));
          setCoCreatures(sorted);
        }
      })
      .catch(() => {})
      .finally(() => setCoLoadingCreatures(false));
  }, [coSelectedAuthor, coSelectedCategory]);

  // Fetch creature curves when creature selected
  useEffect(() => {
    if (!coSelectedCreature || !coSelectedCategory) return;
    setCoLoadingCurves(true);
    setCoSelectedSection('');
    setCoSelectedCurve('');
    setCoSections({});

    const basePath = coSelectedCategory.toLowerCase() === 'mod' && coSelectedAuthor
      ? `mod/${encodeURIComponent(coSelectedAuthor)}`
      : coSelectedCategory.toLowerCase();

    fetch(`/api/gsh/curve-overrides/${basePath}/${encodeURIComponent(coSelectedCreature)}`)
      .then((r) => r.json())
      .then((d) => { if (d.sections) setCoSections(d.sections); })
      .catch(() => {})
      .finally(() => setCoLoadingCurves(false));
  }, [coSelectedCreature, coSelectedCategory, coSelectedAuthor]);

  // When curve is selected, populate values
  useEffect(() => {
    if (!coSelectedSection || !coSelectedCurve || !coSections[coSelectedSection]) return;
    const vals = coSections[coSelectedSection][coSelectedCurve];
    if (vals) {
      setCoValues([...vals]);
      setCoDefaults([...vals]);
    }
  }, [coSelectedCurve, coSelectedSection, coSections]);

  const sectionNames = useMemo(
    () => Object.keys(coSections).sort((a, b) => a.localeCompare(b)),
    [coSections]
  );
  const curveNames = useMemo(() => {
    if (!coSelectedSection || !coSections[coSelectedSection]) return [];
    return Object.keys(coSections[coSelectedSection]).sort((a, b) => a.localeCompare(b));
  }, [coSelectedSection, coSections]);

  // Group overrides by creature, sorted alphabetically by creature then section
  const groupedOverrides = useMemo(() => {
    const indexed = curveOverrides.map((o, i) => ({ index: i, override: o }));
    indexed.sort((a, b) =>
      a.override.creature.localeCompare(b.override.creature) ||
      a.override.section.localeCompare(b.override.section) ||
      a.override.curveName.localeCompare(b.override.curveName)
    );
    const groups: Record<string, { index: number; override: CurveOverride }[]> = {};
    for (const item of indexed) {
      const key = item.override.creature;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    }
    return groups;
  }, [curveOverrides]);

  function addCurveOverride() {
    if (!coSelectedCreature || !coSelectedCurve || !coSelectedSection) return;
    const newOverride: CurveOverride = {
      creature: coSelectedCreature,
      section: coSelectedSection,
      curveName: coSelectedCurve,
      values: [...coValues],
      defaults: [...coDefaults],
    };

    if (coEditingIndex !== null) {
      setCurveOverrides((prev) => prev.map((o, i) => i === coEditingIndex ? newOverride : o));
      setCoEditingIndex(null);
    } else {
      // Check for duplicate
      const exists = curveOverrides.findIndex(
        (o) => o.creature === newOverride.creature && o.curveName === newOverride.curveName
      );
      if (exists >= 0) {
        setCurveOverrides((prev) => prev.map((o, i) => i === exists ? newOverride : o));
      } else {
        setCurveOverrides((prev) => [...prev, newOverride]);
      }
    }
  }

  function editCurveOverride(index: number) {
    const o = curveOverrides[index];
    setCoSelectedCurve(o.curveName);
    setCoValues([...o.values]);
    setCoDefaults([...o.defaults]);
    setCoEditingIndex(index);
  }

  function removeCurveOverride(index: number) {
    setCurveOverrides((prev) => prev.filter((_, i) => i !== index));
    if (coEditingIndex === index) setCoEditingIndex(null);
  }

  function generateConfig(): string {
    if (curveOverrides.length === 0) return '; No curve overrides configured\n';
    const sorted = [...curveOverrides].sort((a, b) =>
      a.creature.localeCompare(b.creature) || a.section.localeCompare(b.section) || a.curveName.localeCompare(b.curveName)
    );
    let output = '[/Script/PathOfTitans.IGameSession]\n';
    for (const co of sorted) {
      const valsStr = co.values.map((v) => v.toFixed(5).replace(/0+$/, '').replace(/\.$/, '.0')).join(',');
      output += `CurveOverrides=(CurveName="${co.creature}.${co.curveName}",Values=(${valsStr}))\n`;
    }
    return output;
  }

  function downloadFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleDownload() {
    const content = generateConfig();
    if (curveOverrides.length === 0) return;
    try {
      await fetch('/api/webhooks/generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileType: 'CurveOverrides.ini',
          changedSettingsCount: curveOverrides.length,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {}
    downloadFile(content, 'CurveOverrides.ini');
  }

  function handleCopy() {
    navigator.clipboard.writeText(generateConfig());
  }

  function handleReset() {
    if (!confirm('Remove all curve overrides?')) return;
    setCurveOverrides([]);
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      parseIni(ev.target?.result as string);
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function parseIni(content: string) {
    const parsedOverrides: CurveOverride[] = [];
    const lines = content.split('\n');

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith(';') || line.startsWith('#') || line.startsWith('[')) continue;

      const coMatch = line.match(/^CurveOverrides=\(CurveName="([^"]+)",\s*Values=\(([^)]+)\)\)/i);
      if (coMatch) {
        const fullName = coMatch[1];
        const vals = coMatch[2].split(',').map((v) => parseFloat(v.trim()));
        const dotIndex = fullName.indexOf('.');
        if (dotIndex > 0 && vals.length === 5) {
          const curveName = fullName.substring(dotIndex + 1);
          // Extract section from curve name (e.g. "Core.MaxHealth" → "Attributes")
          // Since we don't know the section from the INI, use the curve prefix
          const sectionDot = curveName.indexOf('.');
          const section = sectionDot > 0 ? curveName.substring(0, sectionDot) : 'Unknown';
          parsedOverrides.push({
            creature: fullName.substring(0, dotIndex),
            section,
            curveName,
            values: vals,
            defaults: vals,
          });
        }
      }
    }

    if (parsedOverrides.length > 0) setCurveOverrides(parsedOverrides);
  }

  const getProfileData = useCallback(() => ({
    curveOverrides,
  }), [curveOverrides]);

  const loadProfileData = useCallback((data: Record<string, unknown>) => {
    if (Array.isArray(data.curveOverrides)) {
      setCurveOverrides(data.curveOverrides as CurveOverride[]);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-accent-light mb-2">
          <TrendingUp size={28} />
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">Curve Overrides Generator</h1>
        <p className="text-text-secondary">
          Customize creature stats across 5 growth stages and generate your CurveOverrides.ini file.
        </p>
      </div>

      {/* Info Bar */}
      <div className="flex flex-wrap items-center justify-between mb-6 card p-3 gap-2">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-text-secondary">
            <strong className={curveOverrides.length > 0 ? 'text-accent-light' : 'text-text-primary'}>{curveOverrides.length}</strong> override{curveOverrides.length !== 1 ? 's' : ''} configured
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleDownload} disabled={curveOverrides.length === 0} className="btn-primary flex items-center gap-1.5 text-sm disabled:opacity-50">
            <Download size={16} /> Download
          </button>
          <button onClick={handleCopy} className="btn-outline flex items-center gap-1.5 text-sm">
            <Copy size={16} /> Copy
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="btn-outline flex items-center gap-1.5 text-sm">
            <Upload size={16} /> Upload
          </button>
          <button onClick={handleReset} disabled={curveOverrides.length === 0} className="btn-outline flex items-center gap-1.5 text-sm text-error border-red-500/30 hover:bg-red-500/10 disabled:opacity-50">
            <RotateCcw size={16} /> Clear All
          </button>
          <input ref={fileInputRef} type="file" accept=".ini,.txt" onChange={handleUpload} className="hidden" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Curve Override Selector */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-heading font-semibold text-lg mb-1 flex items-center gap-2">
              <TrendingUp size={20} className="text-accent-light" />
              Select Curve
            </h2>
            <p className="text-xs text-text-secondary mb-5">
              Select a category, creature, and curve to customize stat values across growth stages.
            </p>

            {/* Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Category</label>
                <select
                  value={coSelectedCategory}
                  onChange={(e) => setCoSelectedCategory(e.target.value)}
                  className="input-field w-full text-sm"
                >
                  <option value="">Select category...</option>
                  {coCategories.map((c) => (
                    <option key={c.name} value={c.name}>{c.name} ({c.creatureCount})</option>
                  ))}
                </select>
              </div>

              {/* Author (Mod only) */}
              {coSelectedCategory.toLowerCase() === 'mod' && coCreators.length > 0 && (
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1">Author</label>
                  <select
                    value={coSelectedAuthor}
                    onChange={(e) => setCoSelectedAuthor(e.target.value)}
                    className="input-field w-full text-sm"
                  >
                    <option value="">Select author...</option>
                    {coCreators.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Creature */}
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Creature</label>
                <div className="relative">
                  <select
                    value={coSelectedCreature}
                    onChange={(e) => setCoSelectedCreature(e.target.value)}
                    disabled={coCreatures.length === 0}
                    className="input-field w-full text-sm disabled:opacity-50"
                  >
                    <option value="">Select creature...</option>
                    {coCreatures.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  {coLoadingCreatures && <span className="absolute right-8 top-1/2 -translate-y-1/2"><Spinner size="sm" /></span>}
                </div>
              </div>

              {/* Section */}
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">Section</label>
                <div className="relative">
                  <select
                    value={coSelectedSection}
                    onChange={(e) => { setCoSelectedSection(e.target.value); setCoSelectedCurve(''); }}
                    disabled={sectionNames.length === 0}
                    className="input-field w-full text-sm disabled:opacity-50"
                  >
                    <option value="">Select section...</option>
                    {sectionNames.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {coLoadingCurves && <span className="absolute right-8 top-1/2 -translate-y-1/2"><Spinner size="sm" /></span>}
                </div>
              </div>
            </div>

            {/* Curve */}
            {curveNames.length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-text-primary mb-1">Curve</label>
                <select
                  value={coSelectedCurve}
                  onChange={(e) => setCoSelectedCurve(e.target.value)}
                  className="input-field w-full text-sm"
                >
                  <option value="">Select curve...</option>
                  {curveNames.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Value Inputs */}
            {coSelectedCurve && (
              <div className="mt-4">
                <label className="block text-xs font-medium text-text-primary mb-2">
                  Values — {coSelectedCreature} &rarr; {coSelectedCurve}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {GROWTH_LABELS.map((label, i) => (
                    <div key={i}>
                      <p className="text-[10px] text-text-secondary text-center mb-1">{label}</p>
                      <input
                        type="number"
                        step="any"
                        value={coValues[i]}
                        onChange={(e) => {
                          const next = [...coValues];
                          next[i] = parseFloat(e.target.value) || 0;
                          setCoValues(next);
                        }}
                        className="input-field w-full text-sm font-mono text-center"
                      />
                      <p className="text-[9px] text-text-secondary/50 text-center mt-0.5">
                        Def: {coDefaults[i]}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={addCurveOverride}
                  className="btn-primary flex items-center gap-1.5 text-sm mt-4"
                >
                  {coEditingIndex !== null ? (
                    <><Check size={16} /> Update Override</>
                  ) : (
                    <><Plus size={16} /> Add to Configuration</>
                  )}
                </button>
                {coEditingIndex !== null && (
                  <button
                    onClick={() => setCoEditingIndex(null)}
                    className="text-xs text-text-secondary hover:text-text-primary ml-3 transition-colors"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Added Overrides List */}
          {curveOverrides.length > 0 && (
            <div className="card p-6">
              <h3 className="font-heading font-semibold text-sm mb-4 flex items-center justify-between">
                <span>Added Overrides ({curveOverrides.length})</span>
              </h3>
              <div className="space-y-3">
                {Object.entries(groupedOverrides).map(([creature, items]) => (
                  <div key={creature}>
                    <p className="text-xs font-medium text-accent-light mb-1.5">{creature}</p>
                    <div className="space-y-1">
                      {items.map(({ index, override: o }) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs ${
                            coEditingIndex === index ? 'bg-accent/10 border border-accent/30' : 'bg-surface/50'
                          }`}
                        >
                          <div className="min-w-0">
                            <span className="font-mono text-text-primary">{o.curveName}</span>
                            <span className="text-text-secondary ml-2">
                              [{o.values.map((v) => Math.round(v * 100) / 100).join(', ')}]
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <button
                              onClick={() => editCurveOverride(index)}
                              className="p-1 rounded text-text-secondary hover:text-primary-light hover:bg-primary/10 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={12} />
                            </button>
                            <button
                              onClick={() => removeCurveOverride(index)}
                              className="p-1 rounded text-text-secondary hover:text-error hover:bg-red-500/10 transition-colors"
                              title="Remove"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Profiles & Preview */}
        <div className="space-y-4">
          {/* Profiles */}
          <ProfileManager
            generatorType="curve-overrides"
            getCurrentData={getProfileData}
            onLoadData={loadProfileData}
          />

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
