'use client';

import React from 'react';
import Link from 'next/link';

export default function PublicTasksPage() {
  return (
    <div className="flex-1 bg-sand-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-light tracking-[-0.02em] text-ink-900 mb-6">Public Marketplace</h1>
        <p className="text-ink-600 font-normal mb-8">View all open and completed tasks on the Bounty Board.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-1 border border-white/60 rounded-[24px] p-6 shadow-sm">
            <h3 className="text-xl font-medium text-ink-900 mb-2">Scrape 10,000 AI startup leads</h3>
            <p className="text-ink-600 font-normal mb-4">Open - 50 MONAD</p>
            <Link href="/tasks/1" className="text-orange-500 hover:underline">View Details</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
