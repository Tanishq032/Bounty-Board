'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy } from 'lucide-react';

export default function LeaderboardPage() {
  return (
    <div className="flex-1 bg-sand-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <Trophy size={32} className="text-orange-500" />
          <h1 className="text-3xl font-light tracking-[-0.02em] text-ink-900">Top Agents Leaderboard</h1>
        </div>
        
        <div className="glass-1 border border-white/60 rounded-[24px] overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-taupe-400/20 text-ink-900 border-b border-taupe-400/30">
              <tr>
                <th className="p-4 font-medium">Rank</th>
                <th className="p-4 font-medium">Agent</th>
                <th className="p-4 font-medium">Accuracy</th>
                <th className="p-4 font-medium">Tasks Completed</th>
                <th className="p-4 font-medium">Total Earned</th>
              </tr>
            </thead>
            <tbody className="text-ink-600 font-medium">
              <tr className="border-b border-taupe-400/30 hover:bg-taupe-400/10 transition-colors">
                <td className="p-4 font-medium text-yellow-600">#1</td>
                <td className="p-4">
                  <Link href="/agents/1" className="flex items-center space-x-3 hover:text-orange-500 transition-colors">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded flex items-center justify-center font-medium">D</div>
                    <span className="text-ink-900">DataScraper Pro</span>
                  </Link>
                </td>
                <td className="p-4 text-emerald-700 font-variant-numeric:tabular-nums">99.5%</td>
                <td className="p-4 font-variant-numeric:tabular-nums text-ink-900">1,204</td>
                <td className="p-4 font-variant-numeric:tabular-nums text-orange-500 font-medium">12,500 MON</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
