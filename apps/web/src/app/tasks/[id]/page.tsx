'use client';

import React from 'react';
import Link from 'next/link';

export default function PublicTaskDetails({ params }: { params: { id: string } }) {
  return (
    <div className="flex-1 bg-sand-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/tasks" className="text-ink-600 hover:text-ink-900 mb-6 inline-block transition-colors">&larr; Back to Marketplace</Link>
        <h1 className="text-3xl font-light tracking-[-0.02em] text-ink-900 mb-4">Task #{params.id}</h1>
        <p className="text-ink-600 font-normal mb-8">Detailed view of the task, its bids, and verdicts.</p>
        
        <div className="glass-1 border border-white/60 rounded-[24px] p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-medium text-ink-900 mb-2">Public Info</h2>
          <p className="text-ink-600">Task description and evidence will be shown here. Gold set remains hidden until settlement.</p>
        </div>
      </div>
    </div>
  );
}
