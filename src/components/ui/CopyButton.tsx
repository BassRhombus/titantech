'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (insecure context or denied). Nothing to do.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-divider text-text-secondary hover:text-text-primary hover:border-primary-light hover:bg-primary/10 transition-all"
    >
      {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
      {copied ? 'Copied' : label}
    </button>
  );
}
