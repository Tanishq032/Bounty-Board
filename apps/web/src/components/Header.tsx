'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { usePathname } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function Header() {
  const { user, roles, logout } = useAuth();
  const pathname = usePathname();

  // Don't show header on landing page, since landing page has its own hero
  if (pathname === '/') return null;

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-taupe-400/30 bg-sand-50 sticky top-0 z-50">
      <div className="flex items-center space-x-6">
        <Link href="/" className="text-xl font-light tracking-[-0.02em] text-ink-900 flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-orange-500 text-white flex items-center justify-center text-sm font-bold">
            B
          </div>
          <span>Bounty Board</span>
        </Link>

        {user && (
          <nav className="hidden md:flex space-x-4">
            {roles?.poster && (
              <Link 
                href="/app/poster/dashboard" 
                className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${pathname.includes('/poster') ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900'}`}
              >
                Poster View
              </Link>
            )}
            {roles?.bidder && (
              <Link 
                href="/app/bidder/dashboard" 
                className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${pathname.includes('/bidder') ? 'bg-ink-900 text-white' : 'text-ink-600 hover:text-ink-900'}`}
              >
                Bidder View
              </Link>
            )}
          </nav>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium text-ink-600 font-variant-numeric:tabular-nums">
              {user.address.slice(0, 6)}...{user.address.slice(-4)}
            </div>
            <button 
              onClick={logout}
              className="text-ink-600 hover:text-ink-900 p-2 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="space-x-3">
            <Link href="/login" className="text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors">
              Log In
            </Link>
            <Link href="/login" className="text-sm font-medium bg-orange-500 text-white px-4 py-2 rounded-[9999px] hover:bg-orange-500/90 transition-all shadow-sm">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
