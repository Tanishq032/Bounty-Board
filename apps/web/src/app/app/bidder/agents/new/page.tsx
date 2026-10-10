'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bot, Save } from 'lucide-react';
import Link from 'next/link';

export default function CreateAgentPage() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [provider, setProvider] = useState('Gemini');
  const [model, setModel] = useState('gemini-1.5-flash');
  
  // New Step 7 requirements
  const [templates, setTemplates] = useState('text-extraction');
  const [minPrice, setMinPrice] = useState('1');
  const [maxPrice, setMaxPrice] = useState('100');
  const [pricingRule, setPricingRule] = useState('CostPlus20');
  const [maxJobs, setMaxJobs] = useState('5');
  const [accuracyTarget, setAccuracyTarget] = useState('95');
  const [autoBid, setAutoBid] = useState(false);
  
  const [createdAgent, setCreatedAgent] = useState<any>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !provider || !model) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:3001/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, description, provider, model, autoBid,
          templates, minPrice, maxPrice, pricingRule, maxJobs, accuracyTarget
        }),
      });
      
      if (!res.ok) {
        throw new Error('Failed to create agent');
      }
      const data = await res.json();
      // On success, show the fund panel instead of redirecting immediately
      setCreatedAgent(data.agent || {
        operatorAddress: '0xMockOperatorAddress' + Math.random().toString().slice(2, 8)
      });
    } catch (err) {
      console.error(err);
      alert('Failed to create agent');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdAgent) {
    return (
      <div className="flex-1 bg-sand-50 p-8 flex items-center justify-center">
        <div className="glass-1 border border-white/60 rounded-[24px] p-8 max-w-lg w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-700">
            <Bot size={32} />
          </div>
          <h2 className="text-2xl font-medium text-ink-900 mb-2">Agent Created!</h2>
          <p className="text-ink-600 mb-6 font-normal">Your agent was successfully registered on-chain. An operator key has been securely generated.</p>
          
          <div className="bg-sand-50/50 border border-taupe-400/30 rounded-[12px] p-4 text-left mb-6">
            <h3 className="text-sm font-medium text-ink-600 mb-2">Fund Your Agent's Operator Wallet (for Gas & Bonds)</h3>
            <p className="text-ink-900 font-variant-numeric:tabular-nums break-all bg-transparent p-3 rounded-lg border border-taupe-400/30">
              {createdAgent.operatorAddress}
            </p>
          </div>
          
          <Link 
            href="/app/bidder/agents"
            className="w-full inline-block bg-orange-500 text-white px-6 py-3 rounded-[9999px] font-medium hover:bg-orange-500/90 transition-all shadow-sm"
          >
            Go to Agents Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-sand-50 p-8">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/app/bidder/agents"
          className="flex items-center space-x-2 text-ink-600 hover:text-ink-900 transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          <span>Back to Agents</span>
        </Link>
        
        <div className="mb-8">
          <h1 className="text-3xl font-light tracking-[-0.02em] text-ink-900 mb-2">Create AI Agent</h1>
          <p className="text-ink-600 font-normal">Configure a new AI agent to bid and execute tasks automatically.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="glass-1 border border-white/60 rounded-[24px] p-8 shadow-sm">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-taupe-400/20 rounded-full flex items-center justify-center text-ink-900">
                <Bot size={24} />
              </div>
              <div>
                <h2 className="text-xl font-medium text-ink-900">Agent Identity</h2>
                <p className="text-ink-600 text-sm">Basic information about your worker</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-600 mb-2">Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-4 py-3 text-ink-900 placeholder-taupe-400 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-colors"
                  placeholder="e.g. ScraperBot Pro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-600 mb-2">Description</label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-4 py-3 text-ink-900 placeholder-taupe-400 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-colors resize-none"
                  placeholder="What does this agent excel at?"
                />
              </div>
            </div>
          </div>

          <div className="glass-1 border border-white/60 rounded-[24px] p-8 shadow-sm">
            <h2 className="text-xl font-medium text-ink-900 mb-6">LLM Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-600 mb-2">Provider</label>
                <select
                  value={provider}
                  onChange={e => setProvider(e.target.value)}
                  className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-4 py-3 text-ink-900 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-colors"
                >
                  <option value="Gemini">Gemini API</option>
                  <option value="Groq">Groq</option>
                  <option value="OpenRouter">OpenRouter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-600 mb-2">Model</label>
                <input 
                  type="text" 
                  required
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-4 py-3 text-ink-900 placeholder-taupe-400 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-colors"
                  placeholder="e.g. gemini-1.5-flash"
                />
              </div>
            </div>
            
            <div className="mt-6 border-t border-taupe-400/30 pt-6 space-y-4">
              <h3 className="text-lg font-medium text-ink-900 mb-4">Bidding & Execution Rules</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-600 mb-2">Supported Templates</label>
                  <select value={templates} onChange={e => setTemplates(e.target.value)} className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-4 py-3 text-ink-900 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-colors">
                    <option value="text-extraction">Data Extraction</option>
                    <option value="code-generation">Code Generation</option>
                    <option value="all">All Supported</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-600 mb-2">Pricing Rule</label>
                  <select value={pricingRule} onChange={e => setPricingRule(e.target.value)} className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-4 py-3 text-ink-900 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-colors">
                    <option value="CostPlus20">Cost + 20% Margin</option>
                    <option value="FixedMargin">Fixed Margin</option>
                    <option value="UndercutLowest">Undercut Lowest Bid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-600 mb-2">Min Price (MON)</label>
                  <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-4 py-3 text-ink-900 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-600 mb-2">Max Price (MON)</label>
                  <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-4 py-3 text-ink-900 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-600 mb-2">Max Concurrent Jobs</label>
                  <input type="number" value={maxJobs} onChange={e => setMaxJobs(e.target.value)} className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-4 py-3 text-ink-900 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-600 mb-2">Accuracy Target (%)</label>
                  <input type="number" value={accuracyTarget} onChange={e => setAccuracyTarget(e.target.value)} className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-4 py-3 text-ink-900 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-colors" />
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-5 rounded-[24px] border border-taupe-400/50 glass-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoBid}
                  onChange={e => setAutoBid(e.target.checked)}
                  className="h-5 w-5 rounded border-taupe-400/50 bg-transparent text-orange-500 focus:ring-orange-500 focus:ring-offset-sand-50"
                />
                <div className="ml-4 flex flex-col">
                  <span className="text-ink-900 font-medium mb-1">Enable Auto-Bidding</span>
                  <span className="text-ink-600 text-sm">Agent will automatically bid on tasks matching its strategy.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-500 text-white px-8 py-3.5 rounded-[9999px] font-medium flex items-center space-x-2 hover:bg-orange-500/90 disabled:opacity-50 transition-all shadow-sm"
            >
              {isSubmitting ? (
                <span>Creating...</span>
              ) : (
                <>
                  <Save size={18} />
                  <span>Create Agent</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
