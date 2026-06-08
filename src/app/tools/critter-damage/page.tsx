'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Swords, RotateCcw, AlertCircle, Copy, Download, Check } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

const GROWTH_LABELS = ['Hatchling', 'Juvenile', 'Adolescent', 'Sub-Adult', 'Adult'] as const;
const STAGES = [0, 1, 2, 3, 4] as const;

const ATTACKER_CATEGORY_PATTERNS = ['official', 'mod', 'alderon'];
const VICTIM_CATEGORY_PATTERNS = ['critter'];

function matchesAny(name: string, patterns: string[]): boolean {
  const lower = name.toLowerCase();
  return patterns.some((p) => lower.includes(p));
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (Math.abs(a[i] - b[i]) > 1e-9) return false;
  }
  return true;
}

function formatCurveValue(v: number): string {
  return v.toFixed(5).replace(/0+$/, '').replace(/\.$/, '.0');
}

function formatCurveLine(creature: string, curveName: string, values: number[]): string {
  return `CurveOverrides=(CurveName="${creature}.${curveName}",Values=(${values.map(formatCurveValue).join(',')}))`;
}

interface CoCategory { name: string; creatureCount: number }
interface CoCreature { name: string; sections: string[] }
interface CoCreator { name: string }
type Sections = Record<string, Record<string, number[]>>;

function findCurve(sections: Sections, name: string): number[] | null {
  for (const sec of Object.values(sections)) {
    const v = sec[name];
    if (v && v.length >= 5) return v.slice(0, 5);
  }
  return null;
}

interface HitsResult {
  hits: number | null;
  baseDmg: number;
  effDmg: number;
  capped: boolean;
}

function calcHits(cw: number, cwd: number, mhpa: number, htk: number): HitsResult {
  if (cwd <= 0) return { hits: null, baseDmg: 0, effDmg: 0, capped: false };
  const baseDmg = cw / cwd;
  const capped = mhpa > 0 && baseDmg > mhpa;
  const effDmg = capped ? mhpa : baseDmg;
  if (effDmg <= 0) return { hits: null, baseDmg, effDmg, capped };
  if (htk <= 0) return { hits: 0, baseDmg, effDmg, capped };
  return { hits: Math.ceil(htk / effDmg), baseDmg, effDmg, capped };
}

type SolveTarget = 'htk' | 'mhpa' | 'cwd' | 'cw';

interface SolveResult {
  value: number | null;
  feasible: boolean;
  reason?: string;
}

function solveFor(target: SolveTarget, desired: number, cw: number, cwd: number, mhpa: number, htk: number): SolveResult {
  if (!Number.isFinite(desired) || desired < 1) {
    return { value: null, feasible: false, reason: 'Desired hits must be at least 1.' };
  }
  const baseDmg = cwd > 0 ? cw / cwd : 0;

  if (target === 'htk') {
    const effDmg = mhpa > 0 ? Math.min(baseDmg, mhpa) : baseDmg;
    if (effDmg <= 0) return { value: null, feasible: false, reason: 'Effective damage is zero — set CW, CWD, and MHPA first.' };
    return { value: desired * effDmg, feasible: true };
  }

  if (target === 'mhpa') {
    if (htk <= 0) return { value: null, feasible: false, reason: 'Victim HTK must be > 0.' };
    if (baseDmg <= 0) return { value: null, feasible: false, reason: 'Attacker baseDmg is zero — set CW and CWD first.' };
    const needed = htk / desired;
    if (baseDmg < needed) {
      const minHits = Math.ceil(htk / baseDmg);
      return { value: null, feasible: false, reason: `BaseDmg ${baseDmg.toFixed(2)} is too low. Even uncapped, attacker needs ${minHits} hits. Raise CW or lower CWD.` };
    }
    return { value: needed, feasible: true };
  }

  if (target === 'cwd') {
    if (htk <= 0) return { value: null, feasible: false, reason: 'Victim HTK must be > 0.' };
    if (cw <= 0) return { value: null, feasible: false, reason: 'Attacker CW must be > 0.' };
    const neededEff = htk / desired;
    if (mhpa > 0 && neededEff > mhpa) {
      const minHits = Math.ceil(htk / mhpa);
      return { value: null, feasible: false, reason: `MHPA cap ${mhpa} blocks reaching ${desired} hits — minimum is ${minHits}. Raise MHPA or lower HTK.` };
    }
    return { value: cw / neededEff, feasible: true };
  }

  if (target === 'cw') {
    if (htk <= 0) return { value: null, feasible: false, reason: 'Victim HTK must be > 0.' };
    if (cwd <= 0) return { value: null, feasible: false, reason: 'Victim CWD must be > 0.' };
    const neededEff = htk / desired;
    if (mhpa > 0 && neededEff > mhpa) {
      const minHits = Math.ceil(htk / mhpa);
      return { value: null, feasible: false, reason: `MHPA cap ${mhpa} blocks reaching ${desired} hits — minimum is ${minHits}. Raise MHPA or lower HTK.` };
    }
    return { value: cwd * neededEff, feasible: true };
  }

  return { value: null, feasible: false };
}

const SOLVE_LABELS: Record<SolveTarget, string> = {
  htk: 'Victim HTK',
  mhpa: 'Victim MHPA',
  cwd: 'Victim CWD',
  cw: 'Attacker CW',
};

function formatSolved(v: number, _target: SolveTarget): string {
  return parseFloat(v.toFixed(4)).toString();
}

interface SideState {
  category: string;
  author: string;
  creature: string;
  sections: Sections;
  loadingCreatures: boolean;
  loadingCurves: boolean;
  notice: string;
}

const emptySide: SideState = {
  category: '',
  author: '',
  creature: '',
  sections: {},
  loadingCreatures: false,
  loadingCurves: false,
  notice: '',
};

interface SideValues {
  cw: number[];
  cwd: number[];
  mhpa: number[];
  htk: number[];
}

const zeroValues: SideValues = {
  cw: [0, 0, 0, 0, 0],
  cwd: [0, 0, 0, 0, 0],
  mhpa: [0, 0, 0, 0, 0],
  htk: [0, 0, 0, 0, 0],
};

export default function CritterDamagePage() {
  const [categories, setCategories] = useState<CoCategory[]>([]);
  const [atk, setAtk] = useState<SideState>(emptySide);
  const [tgt, setTgt] = useState<SideState>(emptySide);
  const [atkCreatures, setAtkCreatures] = useState<CoCreature[]>([]);
  const [atkCreators, setAtkCreators] = useState<CoCreator[]>([]);
  const [tgtCreatures, setTgtCreatures] = useState<CoCreature[]>([]);
  const [tgtCreators, setTgtCreators] = useState<CoCreator[]>([]);
  const [atkValues, setAtkValues] = useState<SideValues>(zeroValues);
  const [tgtValues, setTgtValues] = useState<SideValues>(zeroValues);
  const [atkDefaults, setAtkDefaults] = useState<SideValues>(zeroValues);
  const [tgtDefaults, setTgtDefaults] = useState<SideValues>(zeroValues);
  const [copied, setCopied] = useState(false);
  const [atkStage, setAtkStage] = useState(4);
  const [tgtStage, setTgtStage] = useState(4);
  const [loadError, setLoadError] = useState<string>('');
  const [desiredHits, setDesiredHits] = useState<number>(4);
  const [solveTarget, setSolveTarget] = useState<SolveTarget>('htk');

  useEffect(() => {
    fetch('/api/gsh/curve-overrides')
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (!r.ok) {
          setLoadError(`Failed to load categories (HTTP ${r.status}${d?.error ? `: ${d.error}` : ''})`);
          return;
        }
        if (Array.isArray(d.categories) && d.categories.length > 0) {
          setCategories(d.categories);
        } else {
          setLoadError('No categories returned by the GSH API.');
        }
      })
      .catch((e) => setLoadError(`Network error loading categories: ${e?.message ?? 'unknown'}`));
  }, []);

  const loadCreaturesForSide = useCallback(async (
    category: string,
    author: string,
    setCreatures: (c: CoCreature[]) => void,
    setCreators: (c: CoCreator[]) => void,
    setSide: (updater: (s: SideState) => SideState) => void,
  ) => {
    if (!category) { setCreatures([]); setCreators([]); return; }
    setSide((s) => ({ ...s, loadingCreatures: true }));
    const path = category.toLowerCase() === 'mod' && author
      ? `mod/${encodeURIComponent(author)}`
      : category.toLowerCase();
    try {
      const r = await fetch(`/api/gsh/curve-overrides/${path}`);
      const d = await r.json();
      const sortedCreatures: CoCreature[] = d.creatures
        ? [...d.creatures].sort((a: CoCreature, b: CoCreature) => a.name.localeCompare(b.name))
        : [];
      setCreatures(sortedCreatures);
      const sortedCreators: CoCreator[] = d.creators
        ? [...d.creators].sort((a: CoCreator, b: CoCreator) => a.name.localeCompare(b.name))
        : [];
      setCreators(sortedCreators);
    } catch {
      setCreatures([]);
      setCreators([]);
    } finally {
      setSide((s) => ({ ...s, loadingCreatures: false }));
    }
  }, []);

  useEffect(() => {
    loadCreaturesForSide(atk.category, atk.author, setAtkCreatures, setAtkCreators, setAtk);
  }, [atk.category, atk.author, loadCreaturesForSide]);

  useEffect(() => {
    loadCreaturesForSide(tgt.category, tgt.author, setTgtCreatures, setTgtCreators, setTgt);
  }, [tgt.category, tgt.author, loadCreaturesForSide]);

  const loadCurvesForSide = useCallback(async (
    side: SideState,
    setSide: (updater: (s: SideState) => SideState) => void,
    applyValues: (sections: Sections) => void,
  ) => {
    if (!side.creature || !side.category) return;
    setSide((s) => ({ ...s, loadingCurves: true, notice: '' }));
    const path = side.category.toLowerCase() === 'mod' && side.author
      ? `mod/${encodeURIComponent(side.author)}`
      : side.category.toLowerCase();
    try {
      const r = await fetch(`/api/gsh/curve-overrides/${path}/${encodeURIComponent(side.creature)}`);
      const d = await r.json();
      const sections: Sections = d.sections || {};
      setSide((s) => ({ ...s, sections }));
      applyValues(sections);
    } catch {
      setSide((s) => ({ ...s, notice: 'Failed to load curves' }));
    } finally {
      setSide((s) => ({ ...s, loadingCurves: false }));
    }
  }, []);

  const applyAtkDefaults = useCallback((sections: Sections) => {
    const cw = findCurve(sections, 'Core.CombatWeight');
    const cwd = findCurve(sections, 'Core.CombatWeightDivider');
    const mhpa = findCurve(sections, 'Core.MaximumHitsPerAttack');
    const htk = findCurve(sections, 'Core.HitsToKill');
    const next: SideValues = {
      cw: cw ?? [0, 0, 0, 0, 0],
      cwd: cwd ?? [0, 0, 0, 0, 0],
      mhpa: mhpa ?? [0, 0, 0, 0, 0],
      htk: htk ?? [0, 0, 0, 0, 0],
    };
    setAtkValues(next);
    setAtkDefaults({
      cw: [...next.cw],
      cwd: [...next.cwd],
      mhpa: [...next.mhpa],
      htk: [...next.htk],
    });
    if (!cw) setAtk((s) => ({ ...s, notice: 'No Core.CombatWeight curve found for this creature' }));
  }, []);

  const applyTgtDefaults = useCallback((sections: Sections) => {
    const cw = findCurve(sections, 'Core.CombatWeight');
    const cwd = findCurve(sections, 'Core.CombatWeightDivider');
    const mhpa = findCurve(sections, 'Core.MaximumHitsPerAttack');
    const htk = findCurve(sections, 'Core.HitsToKill');
    const next: SideValues = {
      cw: cw ?? [0, 0, 0, 0, 0],
      cwd: cwd ?? [0, 0, 0, 0, 0],
      mhpa: mhpa ?? [0, 0, 0, 0, 0],
      htk: htk ?? [0, 0, 0, 0, 0],
    };
    setTgtValues(next);
    setTgtDefaults({
      cw: [...next.cw],
      cwd: [...next.cwd],
      mhpa: [...next.mhpa],
      htk: [...next.htk],
    });
    const missing = [
      !cwd && 'CombatWeightDivider',
      !mhpa && 'MaximumHitsPerAttack',
      !htk && 'HitsToKill',
    ].filter(Boolean);
    if (missing.length > 0) {
      setTgt((s) => ({ ...s, notice: `Missing curves: ${missing.join(', ')}` }));
    }
  }, []);

  useEffect(() => {
    loadCurvesForSide(atk, setAtk, applyAtkDefaults);
  }, [atk.creature, atk.category, atk.author, loadCurvesForSide, applyAtkDefaults]);

  useEffect(() => {
    loadCurvesForSide(tgt, setTgt, applyTgtDefaults);
  }, [tgt.creature, tgt.category, tgt.author, loadCurvesForSide, applyTgtDefaults]);

  function resetAtk() { applyAtkDefaults(atk.sections); }
  function resetTgt() { applyTgtDefaults(tgt.sections); }
  function clearAtk() {
    setAtk(emptySide);
    setAtkValues(zeroValues);
    setAtkDefaults(zeroValues);
    setAtkCreatures([]);
    setAtkCreators([]);
  }
  function clearTgt() {
    setTgt(emptySide);
    setTgtValues(zeroValues);
    setTgtDefaults(zeroValues);
    setTgtCreatures([]);
    setTgtCreators([]);
  }

  const singleResult = useMemo(
    () => calcHits(
      atkValues.cw[atkStage],
      tgtValues.cwd[tgtStage],
      tgtValues.mhpa[tgtStage],
      tgtValues.htk[tgtStage],
    ),
    [atkValues, tgtValues, atkStage, tgtStage],
  );

  const matrix = useMemo(() => {
    return STAGES.map((a) => STAGES.map((t) => calcHits(
      atkValues.cw[a],
      tgtValues.cwd[t],
      tgtValues.mhpa[t],
      tgtValues.htk[t],
    )));
  }, [atkValues, tgtValues]);

  const solveResult = useMemo(
    () => solveFor(
      solveTarget,
      desiredHits,
      atkValues.cw[atkStage],
      tgtValues.cwd[tgtStage],
      tgtValues.mhpa[tgtStage],
      tgtValues.htk[tgtStage],
    ),
    [solveTarget, desiredHits, atkValues, tgtValues, atkStage, tgtStage],
  );

  const attackerCategories = useMemo(
    () => categories.filter((c) => matchesAny(c.name, ATTACKER_CATEGORY_PATTERNS)),
    [categories],
  );
  const victimCategories = useMemo(
    () => categories.filter((c) => matchesAny(c.name, VICTIM_CATEGORY_PATTERNS)),
    [categories],
  );

  const generatedConfig = useMemo(() => {
    const lines: string[] = [];
    if (tgt.creature) {
      if (!arraysEqual(tgtValues.cwd, tgtDefaults.cwd)) {
        lines.push(formatCurveLine(tgt.creature, 'Core.CombatWeightDivider', tgtValues.cwd));
      }
      if (!arraysEqual(tgtValues.mhpa, tgtDefaults.mhpa)) {
        lines.push(formatCurveLine(tgt.creature, 'Core.MaximumHitsPerAttack', tgtValues.mhpa));
      }
      if (!arraysEqual(tgtValues.htk, tgtDefaults.htk)) {
        lines.push(formatCurveLine(tgt.creature, 'Core.HitsToKill', tgtValues.htk));
      }
    }
    if (atk.creature && !arraysEqual(atkValues.cw, atkDefaults.cw)) {
      lines.push(formatCurveLine(atk.creature, 'Core.CombatWeight', atkValues.cw));
    }
    if (lines.length === 0) return '';
    return '[/Script/PathOfTitans.IGameSession]\n' + lines.join('\n') + '\n';
  }, [atk.creature, tgt.creature, atkValues, tgtValues, atkDefaults, tgtDefaults]);

  async function handleCopyConfig() {
    if (!generatedConfig) return;
    try {
      await navigator.clipboard.writeText(generatedConfig);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  function handleDownloadConfig() {
    if (!generatedConfig) return;
    const blob = new Blob([generatedConfig], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CurveOverrides.ini';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function applySolved() {
    if (!solveResult.feasible || solveResult.value === null) return;
    const v = solveResult.value;
    if (solveTarget === 'cw') {
      setAtkValues((prev) => {
        const cw = [...prev.cw];
        cw[atkStage] = v;
        return { ...prev, cw };
      });
    } else {
      setTgtValues((prev) => {
        const next = { ...prev, [solveTarget]: [...prev[solveTarget]] };
        next[solveTarget][tgtStage] = v;
        return next;
      });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary-light">
            <Swords size={28} />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-text-primary">Critter Damage Calculator</h1>
            <p className="text-text-secondary text-sm">Calculate hits-to-kill between any two creatures across all growth stages.</p>
          </div>
        </div>

        {loadError && (
          <div className="mb-6 flex items-start gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div>
              <div className="font-medium">Couldn&apos;t load creature data from GSH API.</div>
              <div className="text-xs text-amber-300/80 mt-0.5">{loadError}</div>
              <div className="text-xs text-text-secondary mt-1">You can still enter CW / CWD / MHPA / HTK by hand below.</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <SidePanel
            title="Attacker"
            side={atk}
            setSide={setAtk}
            categories={attackerCategories}
            creatures={atkCreatures}
            creators={atkCreators}
            values={atkValues}
            setValues={setAtkValues}
            onReset={resetAtk}
            onClear={clearAtk}
            showFields={['cw']}
          />
          <SidePanel
            title="Victim"
            side={tgt}
            setSide={setTgt}
            categories={victimCategories}
            creatures={tgtCreatures}
            creators={tgtCreators}
            values={tgtValues}
            setValues={setTgtValues}
            onReset={resetTgt}
            onClear={clearTgt}
            showFields={['cwd', 'mhpa', 'htk']}
          />
        </div>

        <div className="card-static p-6 mb-6">
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-4">Result</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <StagePicker label="Attacker stage" value={atkStage} onChange={setAtkStage} />
            <StagePicker label="Victim stage" value={tgtStage} onChange={setTgtStage} />
          </div>
          <ResultCard
            atkName={atk.creature || 'Attacker'}
            tgtName={tgt.creature || 'Victim'}
            atkStage={atkStage}
            tgtStage={tgtStage}
            result={singleResult}
            cw={atkValues.cw[atkStage]}
            cwd={tgtValues.cwd[tgtStage]}
            mhpa={tgtValues.mhpa[tgtStage]}
            htk={tgtValues.htk[tgtStage]}
          />
        </div>

        <div className="card-static p-6 mb-6">
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-1">Solver</h2>
          <p className="text-text-secondary text-sm mb-4">
            Pick a target hits-to-kill and a variable to compute. The solver uses the values at the
            currently selected stages ({GROWTH_LABELS[atkStage]} attacker / {GROWTH_LABELS[tgtStage]} victim).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <label className="block">
              <span className="block text-xs text-text-secondary mb-1">Desired hits to kill</span>
              <input
                type="number"
                min={1}
                step={1}
                value={Number.isFinite(desiredHits) ? desiredHits : ''}
                onChange={(e) => {
                  const v = e.target.value === '' ? NaN : parseInt(e.target.value, 10);
                  setDesiredHits(v);
                }}
                className="input-field text-sm py-2 font-mono"
              />
            </label>
            <label className="block">
              <span className="block text-xs text-text-secondary mb-1">Solve for</span>
              <select
                value={solveTarget}
                onChange={(e) => setSolveTarget(e.target.value as SolveTarget)}
                className="input-field text-sm py-2"
              >
                <option value="htk">Victim HTK (health)</option>
                <option value="mhpa">Victim MHPA (damage cap)</option>
                <option value="cwd">Victim CWD (defense divisor)</option>
                <option value="cw">Attacker CW (combat weight)</option>
              </select>
            </label>
            <div className="flex items-end">
              <button
                type="button"
                onClick={applySolved}
                disabled={!solveResult.feasible || solveResult.value === null}
                className="btn-primary w-full text-sm py-2 disabled:opacity-50 disabled:hover:scale-100"
                title={solveTarget === 'cw'
                  ? `Apply to attacker CW at ${GROWTH_LABELS[atkStage]}`
                  : `Apply to ${SOLVE_LABELS[solveTarget]} at ${GROWTH_LABELS[tgtStage]}`}
              >
                Apply to {solveTarget === 'cw' ? GROWTH_LABELS[atkStage] : GROWTH_LABELS[tgtStage]}
              </button>
            </div>
          </div>

          <div className="bg-background/60 border border-divider rounded-lg p-4">
            {solveResult.feasible && solveResult.value !== null ? (
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                <span className="text-xs uppercase tracking-wide text-text-secondary">
                  {SOLVE_LABELS[solveTarget]} should be
                </span>
                <span className="font-mono text-2xl font-semibold text-primary-light">
                  {formatSolved(solveResult.value, solveTarget)}
                </span>
                <span className="text-xs text-text-secondary">
                  for {desiredHits} hit{desiredHits === 1 ? '' : 's'} at the selected stage.
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2 text-sm text-amber-300">
                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                <span>{solveResult.reason ?? 'Not solvable with the current inputs.'}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card-static p-6">
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-1">Hits-to-Kill Matrix</h2>
          <p className="text-text-secondary text-sm mb-4">Rows = attacker stage, columns = victim stage.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-text-secondary font-medium p-2"></th>
                  {STAGES.map((s) => (
                    <th key={s} className="text-center text-text-secondary font-medium p-2 min-w-[80px]">
                      {GROWTH_LABELS[s]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {STAGES.map((a) => (
                  <tr key={a} className="border-t border-divider">
                    <th className="text-left text-text-secondary font-medium p-2 whitespace-nowrap">
                      {GROWTH_LABELS[a]}
                    </th>
                    {STAGES.map((t) => {
                      const r = matrix[a][t];
                      const isPick = a === atkStage && t === tgtStage;
                      return (
                        <td
                          key={t}
                          className={`text-center p-2 font-mono ${isPick ? 'bg-primary/15 text-primary-light font-semibold rounded' : 'text-text-primary'}`}
                          title={`Base ${r.baseDmg.toFixed(2)} | Eff ${r.effDmg.toFixed(2)}${r.capped ? ' (capped)' : ''}`}
                        >
                          {r.hits === null ? '—' : r.hits}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-text-secondary text-xs mt-3">Hover a cell to see base / effective damage. A dash (—) means the values are incomplete or yield zero damage.</p>
        </div>

        <div className="card-static p-6 mt-6">
          <h2 className="font-heading text-xl font-semibold text-text-primary mb-1">Generated Curve Overrides</h2>
          <p className="text-text-secondary text-sm mb-4">
            Only curves you&apos;ve changed from each creature&apos;s defaults are emitted. Paste under{' '}
            <code className="text-text-primary bg-background/60 px-1 py-0.5 rounded">[/Script/PathOfTitans.IGameSession]</code>
            {' '}in your <code className="text-text-primary bg-background/60 px-1 py-0.5 rounded">Game.ini</code>.
          </p>
          {!atk.creature && !tgt.creature ? (
            <div className="text-sm text-text-secondary bg-background/60 border border-divider rounded-lg px-4 py-3">
              Pick a creature on at least one side to generate overrides.
            </div>
          ) : generatedConfig === '' ? (
            <div className="text-sm text-text-secondary bg-background/60 border border-divider rounded-lg px-4 py-3">
              No modifications detected. Edit any value (or use the Solver) and the overrides will appear here.
            </div>
          ) : (
            <>
              <textarea
                readOnly
                value={generatedConfig}
                className="input-field w-full font-mono text-xs min-h-[140px]"
              />
              <div className="flex gap-2 mt-3">
                <button
                  type="button"
                  onClick={handleCopyConfig}
                  className="btn-outline text-sm py-2 flex items-center gap-2"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadConfig}
                  className="btn-outline text-sm py-2 flex items-center gap-2"
                >
                  <Download size={14} />
                  Download CurveOverrides.ini
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

interface SidePanelProps {
  title: string;
  side: SideState;
  setSide: React.Dispatch<React.SetStateAction<SideState>>;
  categories: CoCategory[];
  creatures: CoCreature[];
  creators: CoCreator[];
  values: SideValues;
  setValues: React.Dispatch<React.SetStateAction<SideValues>>;
  onReset: () => void;
  onClear: () => void;
  showFields: Array<keyof SideValues>;
}

const FIELD_LABELS: Record<keyof SideValues, string> = {
  cw: 'Combat Weight (CW)',
  cwd: 'Combat Weight Divider (CWD)',
  mhpa: 'Max Hits Per Attack (MHPA)',
  htk: 'Hits To Kill (HTK)',
};

function SidePanel({ title, side, setSide, categories, creatures, creators, values, setValues, onReset, onClear, showFields }: SidePanelProps) {
  const isMod = side.category.toLowerCase() === 'mod';

  function updateValue(field: keyof SideValues, idx: number, raw: string) {
    const n = raw === '' ? 0 : parseFloat(raw);
    if (Number.isNaN(n)) return;
    setValues((prev) => {
      const next = { ...prev, [field]: [...prev[field]] };
      next[field][idx] = n;
      return next;
    });
  }

  return (
    <div className="card-static p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-xl font-semibold text-text-primary">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            disabled={!side.creature}
            className="text-xs text-text-secondary hover:text-text-primary disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            title="Re-apply loaded creature defaults"
          >
            <RotateCcw size={12} /> Defaults
          </button>
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-text-secondary hover:text-text-primary"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <label className="block">
          <span className="block text-xs text-text-secondary mb-1">Category</span>
          <select
            className="input-field text-sm py-2"
            value={side.category}
            onChange={(e) => setSide((s) => ({ ...s, category: e.target.value, author: '', creature: '', sections: {}, notice: '' }))}
          >
            <option value="">Select…</option>
            {categories.map((c) => (
              <option key={c.name} value={c.name}>{c.name} ({c.creatureCount})</option>
            ))}
          </select>
        </label>

        {isMod && (
          <label className="block">
            <span className="block text-xs text-text-secondary mb-1">Mod Author</span>
            <select
              className="input-field text-sm py-2"
              value={side.author}
              onChange={(e) => setSide((s) => ({ ...s, author: e.target.value, creature: '', sections: {} }))}
              disabled={creators.length === 0}
            >
              <option value="">Select…</option>
              {creators.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </label>
        )}

        <label className={`block ${isMod ? '' : 'sm:col-span-1'}`}>
          <div className="text-xs text-text-secondary mb-1 flex items-center gap-2">
            Creature
            {(side.loadingCreatures || side.loadingCurves) && <Spinner size="sm" />}
          </div>
          <select
            className="input-field text-sm py-2"
            value={side.creature}
            onChange={(e) => setSide((s) => ({ ...s, creature: e.target.value, sections: {}, notice: '' }))}
            disabled={creatures.length === 0}
          >
            <option value="">{creatures.length === 0 ? '— pick category first —' : 'Select…'}</option>
            {creatures.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>

      {side.notice && (
        <div className="flex items-start gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded px-3 py-2 mb-4">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{side.notice}</span>
        </div>
      )}

      <div className="space-y-3">
        {showFields.map((field) => (
          <div key={field}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-text-secondary">{FIELD_LABELS[field]}</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {STAGES.map((s) => (
                <div key={s} className="flex flex-col">
                  <span className="text-[10px] text-text-secondary text-center mb-0.5">{GROWTH_LABELS[s].slice(0, 4)}</span>
                  <input
                    type="number"
                    step="any"
                    value={values[field][s]}
                    onChange={(e) => updateValue(field, s, e.target.value)}
                    className="input-field text-sm px-2 py-1.5 font-mono"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StagePicker({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="block text-xs text-text-secondary mb-1">{label}</span>
      <select
        className="input-field text-sm py-2"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
      >
        {STAGES.map((s) => (
          <option key={s} value={s}>{GROWTH_LABELS[s]}</option>
        ))}
      </select>
    </label>
  );
}

interface ResultCardProps {
  atkName: string;
  tgtName: string;
  atkStage: number;
  tgtStage: number;
  result: HitsResult;
  cw: number;
  cwd: number;
  mhpa: number;
  htk: number;
}

function ResultCard({ atkName, tgtName, atkStage, tgtStage, result, cw, cwd, mhpa, htk }: ResultCardProps) {
  const { hits, baseDmg, effDmg, capped } = result;
  return (
    <div className="bg-background/60 border border-divider rounded-lg p-5">
      <div className="text-sm text-text-secondary mb-3">
        <span className="text-text-primary font-medium">{atkName}</span> ({GROWTH_LABELS[atkStage]})
        {' → '}
        <span className="text-text-primary font-medium">{tgtName}</span> ({GROWTH_LABELS[tgtStage]})
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Base damage" value={`${baseDmg.toFixed(2)}`} sub={`${cw} / ${cwd}`} />
        <Stat
          label="Effective damage"
          value={`${effDmg.toFixed(2)}`}
          sub={capped ? `capped at MHPA ${mhpa}` : 'below cap'}
          accent={capped}
        />
        <Stat label="HTK" value={`${htk}`} sub="target's hits-to-kill" />
        <Stat
          label="Hits to kill"
          value={hits === null ? '—' : String(hits)}
          sub={hits === null ? 'incomplete inputs' : `ceil(${htk} / ${effDmg.toFixed(2)})`}
          highlight
        />
      </div>
    </div>
  );
}

function Stat({ label, value, sub, accent, highlight }: { label: string; value: string; sub?: string; accent?: boolean; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-text-secondary mb-1">{label}</div>
      <div className={`font-mono ${highlight ? 'text-2xl text-primary-light font-semibold' : 'text-lg'} ${accent ? 'text-amber-300' : 'text-text-primary'}`}>
        {value}
      </div>
      {sub && <div className="text-[11px] text-text-secondary mt-0.5">{sub}</div>}
    </div>
  );
}
