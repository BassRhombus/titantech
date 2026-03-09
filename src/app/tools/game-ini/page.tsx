'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import {
  FileCode, Download, Upload, Copy, RotateCcw, ChevronDown, ChevronUp,
  Check,
} from 'lucide-react';
import { ProfileManager } from '@/components/generators/ProfileManager';
import {
  configData, MULTILINE_KEYS, getMultilineOutputKey, getDefaultValues,
  type ConfigSetting,
} from '@/data/game-ini-config';

export default function GameIniPage() {
  const [values, setValues] = useState<Record<string, string>>(() => getDefaultValues());
  const [activeTab, setActiveTab] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaults = useMemo(() => getDefaultValues(), []);

  const changedCount = useMemo(() => {
    let count = 0;
    for (const [key, val] of Object.entries(values)) {
      if (val !== defaults[key]) count++;
    }
    return count;
  }, [values, defaults]);

  // Build flat tab list from sections/categories
  const tabs = useMemo(() => {
    return configData.flatMap((section) =>
      section.categories.map((cat) => ({
        label: cat.label,
        sectionKey: section.key,
        sectionLabel: section.label,
        settings: cat.settings,
      }))
    );
  }, []);

  const currentTab = tabs[activeTab] || tabs[0];

  function setValue(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function generateConfig(): string {
    const sections: Record<string, string[]> = {};

    for (const section of configData) {
      const lines: string[] = [];

      if (section.key === 'SourceRCON') {
        const rconEnabled = values['bEnabled'] === 'true';
        if (!rconEnabled) continue;
        lines.push('bEnabled=true');
      }

      for (const cat of section.categories) {
        for (const setting of cat.settings) {
          if (section.key === 'SourceRCON' && setting.name === 'bEnabled') continue;
          const current = values[setting.name] ?? setting.default;

          if (setting.name === 'bEnforceWhitelist') {
            if (current === 'true') lines.push(`${setting.name}=${current}`);
            continue;
          }

          // Always include ServerMap in output
          if (setting.name !== 'ServerMap' && current === setting.default) continue;

          if (setting.name === 'ServerAdmins') {
            const entries = current.split('\n').map((l) => l.trim()).filter(Boolean);
            entries.forEach((entry) => lines.push(`ServerAdmins=${entry}`));
          } else if (MULTILINE_KEYS.has(setting.name)) {
            const outputKey = getMultilineOutputKey(setting.name);
            const entries = current.split('\n').map((l) => l.trim()).filter(Boolean);
            entries.forEach((entry) => lines.push(`${outputKey}=${entry}`));
          } else if (section.key === 'SourceRCON' && setting.type === 'text') {
            lines.push(`${setting.name}="${current}"`);
          } else {
            lines.push(`${setting.name}=${current}`);
          }
        }
      }

      if (lines.length > 0) {
        sections[section.key] = lines;
      }
    }

    let output = '';
    const gameSessionKey = '/Script/PathOfTitans.IGameSession';
    output += `[${gameSessionKey}]\n`;

    if (sections[gameSessionKey] && sections[gameSessionKey].length > 0) {
      output += sections[gameSessionKey].join('\n') + '\n';
    } else {
      output += '; No changes made\n';
    }

    const gameModeKey = '/Script/PathOfTitans.IGameMode';
    output += `\n[${gameModeKey}]\n`;
    if (sections[gameModeKey]) {
      output += sections[gameModeKey].join('\n') + '\n';
    } else {
      output += '; No changes made\n';
    }

    if (sections['SourceRCON']) {
      output += `\n[SourceRCON]\n`;
      output += sections['SourceRCON'].join('\n') + '\n';
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
    try {
      await fetch('/api/webhooks/generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileType: 'Game.ini',
          changedSettingsCount: changedCount,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {}
    downloadFile(content, 'Game.ini');
  }

  function handleCopy() {
    navigator.clipboard.writeText(generateConfig());
  }

  function handleReset() {
    if (!confirm('Reset all settings to defaults?')) return;
    setValues(getDefaultValues());
  }

  const getProfileData = useCallback(() => {
    const changed: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(values)) {
      if (val !== defaults[key]) changed[key] = val;
    }
    return changed;
  }, [values, defaults]);

  const loadProfileData = useCallback((data: Record<string, unknown>) => {
    const newValues = { ...getDefaultValues() };
    for (const [key, val] of Object.entries(data)) {
      if (typeof val === 'string') newValues[key] = val;
    }
    setValues(newValues);
  }, []);

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
    const newValues = { ...getDefaultValues() };
    const multilineAccum: Record<string, string[]> = {};
    const lines = content.split('\n');

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith(';') || line.startsWith('#') || line.startsWith('[')) continue;
      if (line.startsWith('CurveOverrides=')) continue; // Skip curve overrides

      const match = line.match(/^([^=]+)=(.*)$/);
      if (!match) continue;
      let [, key, val] = match;
      val = val.replace(/^"(.*)"$/, '$1');

      // Handle ServerAdmins=ID1,ID2 (comma-separated) format
      if (key === 'ServerAdmins') {
        if (!multilineAccum['ServerAdmins']) multilineAccum['ServerAdmins'] = [];
        multilineAccum['ServerAdmins'].push(...val.split(',').map((v) => v.trim()).filter(Boolean));
        continue;
      }

      const pluralKey = key === 'ServerAdmin' ? 'ServerAdmins'
        : key === 'AllowedCharacter' ? 'AllowedCharacters'
        : key === 'DisallowedCharacter' ? 'DisallowedCharacters'
        : key === 'AllowedCritter' ? 'AllowedCritters'
        : key === 'DisallowedCritter' ? 'DisallowedCritters'
        : null;

      if (pluralKey) {
        if (!multilineAccum[pluralKey]) multilineAccum[pluralKey] = [];
        multilineAccum[pluralKey].push(val);
        continue;
      }

      if (key in newValues) {
        const setting = configData.flatMap((s) => s.categories.flatMap((c) => c.settings)).find((s) => s.name === key);
        if (setting?.type === 'boolean') {
          newValues[key] = val.toLowerCase() === 'true' || val === '1' ? 'true' : 'false';
        } else {
          newValues[key] = val;
        }
      }
    }

    for (const [key, entries] of Object.entries(multilineAccum)) {
      newValues[key] = entries.join('\n');
    }

    setValues(newValues);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-primary-light mb-2">
          <FileCode size={28} />
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">Game.ini Generator</h1>
        <p className="text-text-secondary">
          Configure 200+ server settings and generate your Game.ini file.
        </p>
      </div>

      {/* Info Bar */}
      <div className="flex flex-wrap items-center justify-between mb-6 card p-3 gap-2">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-text-secondary">
            <strong className={changedCount > 0 ? 'text-primary-light' : 'text-text-primary'}>{changedCount}</strong> setting{changedCount !== 1 ? 's' : ''} changed
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handleDownload} className="btn-primary flex items-center gap-1.5 text-sm">
            <Download size={16} /> Download
          </button>
          <button onClick={handleCopy} className="btn-outline flex items-center gap-1.5 text-sm">
            <Copy size={16} /> Copy
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="btn-outline flex items-center gap-1.5 text-sm">
            <Upload size={16} /> Upload
          </button>
          <button onClick={handleReset} className="btn-outline flex items-center gap-1.5 text-sm text-error border-red-500/30 hover:bg-red-500/10">
            <RotateCcw size={16} /> Reset
          </button>
          <input ref={fileInputRef} type="file" accept=".ini,.txt" onChange={handleUpload} className="hidden" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tab Navigation & Profiles */}
        <div className="lg:col-span-1 space-y-4">
          <ProfileManager
            generatorType="game-ini"
            getCurrentData={getProfileData}
            onLoadData={loadProfileData}
          />
          <div className="card p-2 space-y-0.5 sticky top-20 max-h-[80vh] overflow-y-auto">
            {tabs.map((tab, i) => {
              const tabChanges = tab.settings.filter(
                (s) => (values[s.name] ?? s.default) !== s.default
              ).length;
              return (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                    activeTab === i
                      ? 'bg-primary/10 text-primary-light font-medium'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                  }`}
                >
                  <span className="truncate">{tab.label}</span>
                  {tabChanges > 0 && (
                    <span className="text-[10px] bg-primary/20 text-primary-light px-1.5 py-0.5 rounded-full ml-1 shrink-0">
                      {tabChanges}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings Panel */}
        <div className="lg:col-span-3">
          {currentTab && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-heading font-semibold text-lg">{currentTab.label}</h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Section: [{currentTab.sectionKey}]
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {currentTab.settings.map((setting) => (
                  <SettingField
                    key={setting.name}
                    setting={setting}
                    value={values[setting.name] ?? setting.default}
                    isChanged={(values[setting.name] ?? setting.default) !== setting.default}
                    onChange={(val) => setValue(setting.name, val)}
                    onReset={() => setValue(setting.name, setting.default)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Preview Toggle */}
          <div className="card mt-6 overflow-hidden">
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

function SettingField({
  setting,
  value,
  isChanged,
  onChange,
  onReset,
}: {
  setting: ConfigSetting;
  value: string;
  isChanged: boolean;
  onChange: (val: string) => void;
  onReset: () => void;
}) {
  return (
    <div className={`p-3 rounded-lg border transition-colors ${
      isChanged ? 'border-primary/30 bg-primary/5' : 'border-transparent bg-surface/30'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-1.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-text-primary font-mono">
              {setting.name}
            </label>
            {isChanged && (
              <span className="flex items-center gap-0.5 text-[10px] text-primary-light">
                <Check size={10} /> Modified
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-0.5">{setting.description}</p>
        </div>
        {isChanged && (
          <button
            onClick={onReset}
            className="text-xs text-text-secondary hover:text-text-primary transition-colors shrink-0"
            title="Reset to default"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>

      {setting.type === 'boolean' ? (
        <button
          onClick={() => onChange(value === 'true' ? 'false' : 'true')}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            value === 'true' ? 'bg-primary' : 'bg-surface'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value === 'true' ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      ) : setting.type === 'multiline' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="input-field w-full text-sm font-mono resize-none mt-1"
          placeholder="One entry per line..."
        />
      ) : setting.type === 'number' ? (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          step={setting.default.includes('.') ? '0.1' : '1'}
          className="input-field w-40 text-sm font-mono mt-1"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field w-full text-sm font-mono mt-1"
        />
      )}

      {setting.default && (
        <p className="text-[10px] text-text-secondary/60 mt-1">
          Default: {setting.type === 'boolean' ? setting.default : `"${setting.default}"`}
        </p>
      )}
    </div>
  );
}
