'use client';

import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <AlertCircle size={48} className="text-error mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-text-secondary mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="btn-primary inline-flex items-center gap-2"
        >
          <RotateCcw size={16} />
          Try Again
        </button>
      </div>
    </div>
  );
}
