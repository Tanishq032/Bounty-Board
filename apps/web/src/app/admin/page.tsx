'use client';

import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, PauseCircle, PlayCircle, Users, Activity, List } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  // Mock check for admin
  useEffect(() => {
    if (user) {
      // In real life, query /me/admin
      if (user.address.toLowerCase() === '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'.toLowerCase()) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        router.push('/');
      }
    }
  }, [user, router]);

  if (isAdmin === null) return <div className="p-8 text-ink-900">Loading admin access...</div>;
  if (!isAdmin) return <div className="p-8 text-red-500">Access Denied.</div>;

  return (
    <div className="flex-1 bg-sand-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <Shield size={32} className="text-ink-900" />
          <h1 className="text-3xl font-light tracking-[-0.02em] text-ink-900">Admin Control Center</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Platform Controls */}
          <div className="glass-1 border border-white/60 rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-6">
              <ShieldAlert className="text-yellow-600" />
              <h2 className="text-xl font-medium text-ink-900">Platform Controls</h2>
            </div>
            
            <div className="glass-2 border border-taupe-400/50 rounded-[12px] p-4 flex justify-between items-center shadow-sm">
              <div>
                <h3 className="text-ink-900 font-medium">Global Task Creation</h3>
                <p className="text-ink-600 text-sm">Emergency pause for new tasks</p>
              </div>
              <button className="flex items-center space-x-2 bg-red-500/10 text-red-700 border border-red-500/30 px-4 py-2 rounded-[9999px] font-medium hover:bg-red-500/20 transition-all shadow-sm">
                <PauseCircle size={18} />
                <span>Pause Platform</span>
              </button>
            </div>
          </div>

          {/* Verifier Set */}
          <div className="glass-1 border border-white/60 rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="text-ink-900" />
              <h2 className="text-xl font-medium text-ink-900">Verifier Registry</h2>
            </div>
            
            <table className="w-full text-left text-sm">
              <thead className="text-ink-600 border-b border-taupe-400/30">
                <tr>
                  <th className="pb-3 font-medium">Verifier Address</th>
                  <th className="pb-3 font-medium">Stake (MON)</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-ink-900 font-medium">
                <tr className="border-b border-taupe-400/30">
                  <td className="py-3 font-variant-numeric:tabular-nums text-xs">0x1234...5678</td>
                  <td className="py-3">10,000</td>
                  <td className="py-3 text-emerald-700">Active</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* User Management */}
        <div className="glass-1 border border-white/60 rounded-[24px] p-6 mb-8 shadow-sm">
          <div className="flex items-center space-x-2 mb-6">
            <Users className="text-ink-900" />
            <h2 className="text-xl font-medium text-ink-900">User Management</h2>
          </div>
          
          <table className="w-full text-left text-sm">
            <thead className="text-ink-600 border-b border-taupe-400/30">
              <tr>
                <th className="pb-3 font-medium">Wallet</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="text-ink-900 font-medium">
              <tr className="border-b border-taupe-400/30">
                <td className="py-3 font-variant-numeric:tabular-nums text-xs">0xabcd...ef12</td>
                <td className="py-3">Bidder</td>
                <td className="py-3 text-emerald-700">Active</td>
                <td className="py-3">
                  <button className="text-red-500 hover:underline">Ban User</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* LLM Usage & Audit */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-1 border border-white/60 rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-6">
              <Activity className="text-ink-900" />
              <h2 className="text-xl font-medium text-ink-900">LLM Usage Limits</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-taupe-400/30 pb-2">
                <span className="text-ink-600 font-normal">Gemini (RPM)</span>
                <span className="text-ink-900 font-variant-numeric:tabular-nums font-medium">12 / 15</span>
              </div>
              <div className="flex justify-between items-center border-b border-taupe-400/30 pb-2">
                <span className="text-ink-600 font-normal">Groq (RPM)</span>
                <span className="text-ink-900 font-variant-numeric:tabular-nums font-medium">5 / 30</span>
              </div>
            </div>
          </div>

          <div className="glass-1 border border-white/60 rounded-[24px] p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-6">
              <List className="text-ink-900" />
              <h2 className="text-xl font-medium text-ink-900">Recent Audit Log</h2>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex space-x-3">
                <span className="text-ink-600">10:45 AM</span>
                <span className="text-yellow-600 font-medium">WARN</span>
                <span className="text-ink-900 font-medium">Gemini rate limit exceeded. Failed over to Groq.</span>
              </div>
              <div className="flex space-x-3">
                <span className="text-ink-600">09:12 AM</span>
                <span className="text-emerald-700 font-medium">INFO</span>
                <span className="text-ink-900 font-medium">User 0x123...456 created new agent.</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
