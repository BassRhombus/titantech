'use client';

import { useState, useRef, useMemo, useCallback } from 'react';
import {
  FileText, Download, Upload, Copy, RotateCcw, Type, Minus, Plus,
  Palette, AlertTriangle, Wand2,
} from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { ProfileManager } from '@/components/generators/ProfileManager';

type TabType = 'rules' | 'motd';

const SIZE_TAGS = [
  { label: 'Title', tag: 'title' },
  { label: 'Large', tag: 'large' },
  { label: 'Small', tag: 'small' },
];

const COLOR_TAGS = [
  { label: 'R', tag: 'red', color: '#ef4444' },
  { label: 'O', tag: 'orange', color: '#f97316' },
  { label: 'Y', tag: 'yellow', color: '#eab308' },
  { label: 'G', tag: 'green', color: '#22c55e' },
  { label: 'B', tag: 'blue', color: '#3b82f6' },
  { label: 'P', tag: 'purple', color: '#a855f7' },
  { label: 'W', tag: 'white', color: '#ffffff' },
];

const CHAR_LIMIT = 1024;

const RULES_TEMPLATE = `<title>Server Rules</>
<large>Welcome to our server!</>

<red>1. Be Respectful</>
Treat all players with respect. No harassment, hate speech, or toxic behavior.

<orange>2. No Random Killing</>
Do not attack players without roleplay reason. Follow the server's combat rules.

<yellow>3. No Exploits or Hacking</>
Using exploits, hacks, or any unfair advantage will result in an immediate ban.

<green>4. Follow Roleplay Rules</>
Stay in character and respect the roleplay guidelines. No breaking character in public chat.

<blue>5. Listen to Staff</>
Staff decisions are final. If you have a dispute, handle it privately with staff.`;

const MOTD_TEMPLATE = `<title>Welcome to Our Server!</>

<large>Message of the Day</>

<green>Server is running smoothly!</>
Current version: Latest

<blue>Upcoming Events:</>
- Community Hunt this Saturday at 8PM EST
- New map area opening next week

<yellow>Reminders:</>
- Read /rules before playing
- Join our Discord for updates
- Report issues to staff`;

function stripTags(text: string): string {
  return text.replace(/<(?:\/|title|large|small|red|orange|yellow|green|blue|purple|white)>/gi, '');
}

const ALL_TAGS = ['title', 'large', 'small', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'white'];
const TAG_OPEN_RE = new RegExp(`<(${ALL_TAGS.join('|')})>`, 'gi');

function getCharCount(text: string): number {
  return stripTags(text).length;
}

function parsePreview(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Parse tags: <tag>content</>
  for (const tag of ALL_TAGS) {
    const re = new RegExp(`&lt;${tag}&gt;(.*?)&lt;/&gt;`, 'gi');
    html = html.replace(re, `<span class="preview-${tag}">$1</span>`);
  }

  return html;
}

function getValidationErrors(text: string): string[] {
  const errors: string[] = [];

  // Count total openers vs total </>
  let totalOpens = 0;
  for (const tag of ALL_TAGS) {
    totalOpens += (text.match(new RegExp(`<${tag}>`, 'gi')) || []).length;
  }
  const totalCloses = (text.match(/<\/>/g) || []).length;
  if (totalOpens !== totalCloses) {
    errors.push(`Mismatched tags: ${totalOpens} opening tag${totalOpens !== 1 ? 's' : ''}, ${totalCloses} closer${totalCloses !== 1 ? 's' : ''}`);
  }

  // Check for nested tags
  for (const tag of ALL_TAGS) {
    const re = new RegExp(`<${tag}>(.*?)</>`, 'gis');
    let match;
    while ((match = re.exec(text)) !== null) {
      const inner = match[1];
      TAG_OPEN_RE.lastIndex = 0;
      if (TAG_OPEN_RE.test(inner)) {
        errors.push(`Nested tags inside <${tag}> — tags cannot be placed inside other tags`);
        TAG_OPEN_RE.lastIndex = 0;
        break;
      }
      TAG_OPEN_RE.lastIndex = 0;
    }
  }

  if (getCharCount(text) > CHAR_LIMIT) {
    errors.push(`Content exceeds ${CHAR_LIMIT} character limit (${getCharCount(text)} chars)`);
  }

  return errors;
}

function autoFix(text: string): string {
  let fixed = text;

  // First, unnest tags: <outer><inner>text</></>  → <inner>text</>
  let changed = true;
  while (changed) {
    changed = false;
    for (const outer of ALL_TAGS) {
      const re = new RegExp(`<${outer}>(.*?)</>`, 'gis');
      let match;
      while ((match = re.exec(fixed)) !== null) {
        const inner = match[1];
        TAG_OPEN_RE.lastIndex = 0;
        if (TAG_OPEN_RE.test(inner)) {
          // Remove the outer tag wrapper, keep inner content as-is
          const before = fixed.slice(0, match.index);
          const after = fixed.slice(match.index + match[0].length);
          fixed = before + inner + after;
          changed = true;
          break;
        }
        TAG_OPEN_RE.lastIndex = 0;
      }
      if (changed) break;
    }
  }

  // Fix mismatched open/close counts
  let totalOpens = 0;
  for (const tag of ALL_TAGS) {
    totalOpens += (fixed.match(new RegExp(`<${tag}>`, 'gi')) || []).length;
  }
  let totalCloses = (fixed.match(/<\/>/g) || []).length;

  if (totalOpens > totalCloses) {
    // Add missing </> at end of lines with unclosed tags
    const lines = fixed.split('\n');
    for (let i = lines.length - 1; i >= 0 && totalOpens > totalCloses; i--) {
      const lineOpens = ALL_TAGS.reduce((n, tag) => n + (lines[i].match(new RegExp(`<${tag}>`, 'gi')) || []).length, 0);
      const lineCloses = (lines[i].match(/<\/>/g) || []).length;
      if (lineOpens > lineCloses) {
        lines[i] += '</>'.repeat(lineOpens - lineCloses);
        totalCloses += lineOpens - lineCloses;
      }
    }
    fixed = lines.join('\n');
  } else if (totalCloses > totalOpens) {
    // Remove excess </>
    for (let i = 0; i < totalCloses - totalOpens; i++) {
      const idx = fixed.lastIndexOf('</>');
      if (idx !== -1) {
        fixed = fixed.slice(0, idx) + fixed.slice(idx + 3);
      }
    }
  }

  return fixed;
}

export default function RulesMotdPage() {
  const [tab, setTab] = useState<TabType>('rules');
  const [rulesText, setRulesText] = useState('');
  const [motdText, setMotdText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentText = tab === 'rules' ? rulesText : motdText;
  const setText = tab === 'rules' ? setRulesText : setMotdText;

  const charCount = useMemo(() => getCharCount(currentText), [currentText]);
  const isOverLimit = charCount > CHAR_LIMIT;
  const errors = useMemo(() => getValidationErrors(currentText), [currentText]);
  const previewHtml = useMemo(() => parsePreview(currentText), [currentText]);

  function isInsideTag(text: string, pos: number): boolean {
    const before = text.substring(0, pos);
    for (const t of ALL_TAGS) {
      const lastOpen = before.lastIndexOf(`<${t}>`);
      if (lastOpen === -1) continue;
      // Find the next </> after that open tag
      const nextClose = before.indexOf('</>', lastOpen);
      if (nextClose === -1) return true; // No closer found after open = we're inside
    }
    return false;
  }

  function insertTag(tag: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = currentText;

    // Prevent nesting: don't insert if cursor is inside another tag
    if (isInsideTag(text, start)) return;

    const selected = text.substring(start, end);

    let newText: string;
    if (selected) {
      newText = text.substring(0, start) + `<${tag}>${selected}</>` + text.substring(end);
    } else {
      newText = text.substring(0, start) + `<${tag}></>` + text.substring(end);
    }
    setText(newText);

    setTimeout(() => {
      ta.focus();
      const cursorPos = selected
        ? start + `<${tag}>${selected}</>`.length
        : start + `<${tag}>`.length;
      ta.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  }

  function insertCloseTag() {
    const ta = textareaRef.current;
    if (!ta) return;
    const pos = ta.selectionStart;

    if (!isInsideTag(currentText, pos)) return;

    const closeTag = '</>';
    const newText = currentText.substring(0, pos) + closeTag + currentText.substring(pos);
    setText(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(pos + closeTag.length, pos + closeTag.length);
    }, 0);
  }

  async function handleDownload() {
    if (!currentText.trim()) return;

    try {
      await fetch('/api/webhooks/generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileType: tab === 'rules' ? 'Rules.txt' : 'MOTD.txt',
          changedSettingsCount: currentText.split('\n').length,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {}

    const blob = new Blob([currentText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = tab === 'rules' ? 'Rules.txt' : 'MOTD.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleCopy() {
    navigator.clipboard.writeText(currentText);
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (file.name.toLowerCase().includes('motd')) {
        setTab('motd');
        setMotdText(content);
      } else {
        setTab('rules');
        setRulesText(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  function handleReset() {
    if (!confirm(`Reset ${tab} content?`)) return;
    setText('');
  }

  function handleAutoFix() {
    setText(autoFix(currentText));
  }

  function handleLoadTemplate() {
    if (currentText.trim() && !confirm('Replace current content with template?')) return;
    setText(tab === 'rules' ? RULES_TEMPLATE : MOTD_TEMPLATE);
  }

  const getProfileData = useCallback(() => ({
    rulesText,
    motdText,
    activeTab: tab,
  }), [rulesText, motdText, tab]);

  const loadProfileData = useCallback((data: Record<string, unknown>) => {
    if (typeof data.rulesText === 'string') setRulesText(data.rulesText);
    if (typeof data.motdText === 'string') setMotdText(data.motdText);
    if (data.activeTab === 'rules' || data.activeTab === 'motd') setTab(data.activeTab);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-primary-light mb-2">
          <FileText size={28} />
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">Rules/MOTD Generator</h1>
        <p className="text-text-secondary">
          Build formatted server rules and message of the day with rich text styling.
        </p>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('rules')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'rules' ? 'bg-primary text-white' : 'bg-surface text-text-secondary hover:text-text-primary'
          }`}
        >
          Rules.txt
        </button>
        <button
          onClick={() => setTab('motd')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'motd' ? 'bg-primary text-white' : 'bg-surface text-text-secondary hover:text-text-primary'
          }`}
        >
          MOTD.txt
        </button>
      </div>

      {/* Profiles */}
      <div className="mb-6 max-w-sm">
        <ProfileManager
          generatorType="rules-motd"
          getCurrentData={getProfileData}
          onLoadData={loadProfileData}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor */}
        <div className="space-y-4">
          {/* Formatting Toolbar */}
          <div className="card p-3">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs text-text-secondary self-center mr-1">Size:</span>
              {SIZE_TAGS.map((t) => (
                <button
                  key={t.tag}
                  onClick={() => insertTag(t.tag)}
                  className="px-2.5 py-1 rounded text-xs bg-surface text-text-secondary hover:text-text-primary transition-colors"
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs text-text-secondary self-center mr-1">Color:</span>
              {COLOR_TAGS.map((t) => (
                <button
                  key={t.tag}
                  onClick={() => insertTag(t.tag)}
                  className="w-7 h-7 rounded border border-divider text-xs font-bold transition-transform hover:scale-110"
                  style={{ backgroundColor: t.color, color: t.tag === 'white' ? '#000' : '#fff' }}
                  title={t.tag}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={insertCloseTag} className="px-2.5 py-1 rounded text-xs bg-surface text-text-secondary hover:text-text-primary transition-colors">
                Close Tag
              </button>
              <button onClick={handleLoadTemplate} className="px-2.5 py-1 rounded text-xs bg-surface text-text-secondary hover:text-text-primary transition-colors">
                Load Template
              </button>
            </div>
          </div>

          {/* Textarea */}
          <div>
            <textarea
              ref={textareaRef}
              value={currentText}
              onChange={(e) => setText(e.target.value)}
              placeholder={`Type your ${tab === 'rules' ? 'rules' : 'message of the day'} here...\nUse the toolbar to add formatting tags.`}
              className="input-field w-full font-mono text-sm resize-none"
              rows={18}
            />
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className={`${isOverLimit ? 'text-red-400' : 'text-text-secondary'}`}>
                {charCount} / {CHAR_LIMIT} characters (excluding tags)
              </span>
              <span className="text-text-secondary">{currentText.split('\n').length} lines</span>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium mb-1">
                <AlertTriangle size={16} />
                Validation Issues
              </div>
              <ul className="text-xs text-yellow-400/80 space-y-0.5 ml-6">
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button onClick={handleDownload} disabled={!currentText.trim()} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
              <Download size={16} /> Download
            </button>
            <button onClick={handleCopy} disabled={!currentText.trim()} className="btn-outline flex items-center gap-2 text-sm disabled:opacity-50">
              <Copy size={16} /> Copy
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="btn-outline flex items-center gap-2 text-sm">
              <Upload size={16} /> Upload
            </button>
            {errors.length > 0 && (
              <button onClick={handleAutoFix} className="btn-outline flex items-center gap-2 text-sm text-yellow-400 border-yellow-500/30">
                <Wand2 size={16} /> Auto-Fix
              </button>
            )}
            <button onClick={handleReset} className="btn-outline flex items-center gap-2 text-sm text-error border-red-500/30">
              <RotateCcw size={16} /> Reset
            </button>
            <input ref={fileInputRef} type="file" accept=".txt" onChange={handleUpload} className="hidden" />
          </div>
        </div>

        {/* Preview */}
        <div className="card p-6">
          <h3 className="font-heading font-semibold mb-4">Preview</h3>
          <div className="bg-background rounded-lg p-4 min-h-[400px]">
            {currentText ? (
              <div
                className="whitespace-pre-wrap leading-relaxed text-text-secondary rules-preview"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <p className="text-text-secondary/50 text-sm italic">
                Start typing to see the preview...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Preview Styles */}
      <style jsx global>{`
        .rules-preview .preview-title {
          font-size: 2rem;
          font-weight: bold;
          display: block;
          margin-bottom: 0.5rem;
          color: #E5E7EB;
        }
        .rules-preview .preview-large {
          font-size: 1.5rem;
          display: block;
          margin-bottom: 0.25rem;
          color: #E5E7EB;
        }
        .rules-preview .preview-small {
          font-size: 0.85rem;
        }
        .rules-preview .preview-red { color: #ef4444; }
        .rules-preview .preview-orange { color: #f97316; }
        .rules-preview .preview-yellow { color: #eab308; }
        .rules-preview .preview-green { color: #22c55e; }
        .rules-preview .preview-blue { color: #3b82f6; }
        .rules-preview .preview-purple { color: #a855f7; }
        .rules-preview .preview-white { color: #ffffff; }
      `}</style>
    </div>
  );
}
