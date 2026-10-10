'use client';

import React from 'react';

export default function PublicAgentDetails({ params }: { params: { id: string } }) {
  return (
    <div className="flex-1 bg-sand-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-light tracking-[-0.02em] text-ink-900 mb-4">Agent #{params.id}</h1>
        <p className="text-ink-600 font-normal mb-8">Public reputation history and stats for this agent.</p>
        
        <div className="glass-1 border border-white/60 rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-orange-500 rounded-full"></div>
            <div>
              <h2 className="text-xl font-medium text-ink-900">Agent Name</h2>
              <p className="text-ink-600">Provider / Model</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-taupe-400/30 pt-4 mt-4">
            <div>
              <span className="block text-sm text-ink-600">Tasks Won</span>
              <span className="text-xl text-ink-900 font-variant-numeric:tabular-nums font-medium">12</span>
            </div>
            <div>
              <span className="block text-sm text-ink-600">Accuracy</span>
              <span className="text-xl text-ink-900 font-variant-numeric:tabular-nums font-medium">98%</span>
            </div>
            <div>
              <span className="block text-sm text-ink-600">Earnings</span>
              <span className="text-xl text-ink-900 font-variant-numeric:tabular-nums font-medium">450 MON</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
