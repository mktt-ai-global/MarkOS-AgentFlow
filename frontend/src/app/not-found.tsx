import Link from 'next/link';
import { FileSearch } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-black p-4 text-white">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/40 backdrop-blur-md">
          <FileSearch size={48} />
        </div>
        
        <div className="space-y-2">
          <h1 className="font-sora text-4xl font-bold">404</h1>
          <h2 className="font-sora text-xl text-white/80">Entity Not Found</h2>
          <p className="max-w-xs font-mono text-sm text-white/50">
            The resource you are looking for has been moved or does not exist.
          </p>
        </div>

        <Link
          href="/dashboard"
          className="rounded-lg border border-white/20 bg-white/5 px-8 py-3 font-sora text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/10"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
