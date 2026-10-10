'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Bot, Power, Activity } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';

interface Agent {
  id: string;
  name: string;
  provider: string;
  model: string;
  operatorAddress: string;
  isActive: boolean;
}

export default function AgentsPage() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch('http://localhost:3001/agents');
        if (res.ok) {
          const data = await res.json();
          setAgents(data.agents || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAgents();
  }, []);

  return (
    <div className="flex-1 bg-sand-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-light tracking-[-0.02em] text-ink-900 mb-2">My Agents</h1>
            <p className="text-ink-600 font-normal">Manage your AI agents, auto-bidding rules, and operators.</p>
          </div>
          <Link 
            href="/app/bidder/agents/new"
            className="bg-orange-500 text-white px-6 py-2.5 rounded-[9999px] font-medium flex items-center space-x-2 hover:bg-orange-500/90 transition-all shadow-sm"
          >
            <Plus size={18} />
            <span>Create Agent</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center text-ink-600 py-20">Loading agents...</div>
        ) : agents.length === 0 ? (
          <div className="glass-1 border border-white/60 rounded-[24px] p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-taupe-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot size={24} className="text-ink-600" />
            </div>
            <h3 className="text-xl font-medium text-ink-900 mb-2">No agents yet</h3>
            <p className="text-ink-600 mb-6 font-normal">Create your first AI agent to start bidding on tasks automatically.</p>
            <Link 
              href="/app/bidder/agents/new"
              className="inline-flex items-center space-x-2 text-orange-500 hover:text-orange-500/80 transition-colors font-medium"
            >
              <Plus size={16} />
              <span>Create Agent</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <div key={agent.id} className="glass-1 border border-white/60 rounded-[24px] p-6 transition-all hover:border-orange-500/50 shadow-sm group hover:shadow-lg">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium text-xl">
                    {agent.name.charAt(0)}
                  </div>
                  <div className={`px-2 py-1 rounded-[9999px] text-xs font-medium flex items-center space-x-1 ${
                    agent.isActive ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30' : 'bg-taupe-400/20 text-ink-600 border border-taupe-400/30'
                  }`}>
                    {agent.isActive ? <Activity size={12} /> : <Power size={12} />}
                    <span>{agent.isActive ? 'Active' : 'Paused'}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-medium text-ink-900 mb-1 group-hover:text-orange-500 transition-colors">{agent.name}</h3>
                <p className="text-ink-600 text-sm mb-4 font-normal">
                  {agent.provider} / {agent.model}
                </p>
                
                <div className="bg-sand-50/50 border border-taupe-400/30 rounded-[12px] p-3">
                  <span className="block text-xs text-ink-600 mb-1">Operator Address (Fund for Gas)</span>
                  <p className="text-ink-900 font-variant-numeric:tabular-nums text-sm truncate font-medium">{agent.operatorAddress}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
