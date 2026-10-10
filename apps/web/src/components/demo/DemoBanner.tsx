import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function DemoBanner() {
  return (
    <div className="w-full bg-amber-300/30 backdrop-blur-md border-b border-amber-300/50 text-ink-900 py-2 px-4 flex items-center justify-between text-sm z-50 relative">
      <div className="flex items-center space-x-2">
        <AlertCircle className="w-4 h-4 text-ink-600" />
        <span className="font-medium"><strong>Demo mode</strong> — Burner wallets, no account needed.</span>
      </div>
      <Link href="/" className="font-medium text-ink-900 hover:bg-white/30 transition-colors border border-white/60 bg-white/20 px-4 py-1.5 rounded-[9999px] text-xs shadow-sm">
        Exit demo
      </Link>
    </div>
  );
}
