'use client';

import { useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Enterprise UI Error:', error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-black/90 p-4 text-white">
      <div className="relative flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-white/5 p-12 backdrop-blur-xl">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-500">
          <AlertCircle size={40} />
        </div>
        
        <div className="text-center">
          <h2 className="font-sora text-3xl font-bold tracking-tight">System Interrupted</h2>
          <p className="mt-2 font-mono text-sm text-white/60">
            {error.message || 'An unexpected error occurred in the enterprise dashboard.'}
          </p>
          {error.digest && (
            <p className="mt-1 font-mono text-[10px] text-white/30 uppercase tracking-widest">
              Trace ID: {error.digest}
            </p>
          )}
        </div>

        <button
          onClick={() => reset()}
          className="group flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 font-sora text-sm font-semibold text-black transition-all hover:bg-white/90 active:scale-95"
        >
          <RotateCcw size={16} className="transition-transform group-hover:-rotate-45" />
          Attempt Recovery
        </button>
      </div>
    </div>
  );
}
