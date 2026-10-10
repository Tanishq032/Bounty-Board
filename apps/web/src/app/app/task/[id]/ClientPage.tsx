'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, Clock, Coins, Upload, ExternalLink } from 'lucide-react';
import { BidList, Bid } from '@/components/BidList';
import { Task } from '@/components/TaskCard';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';

export default function TaskDetailClientPage({ id }: { id: string }) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [task, setTask] = useState<Task | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSelecting, setIsSelecting] = useState<string | null>(null);
  const [isPoster, setIsPoster] = useState(false);
  
  // Work submission state
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      setIsLoading(true);
      try {
        const query = `
          query {
            tasks {
              items {
                id
                poster
                title
                description
                reward
                deadline
                status
                bids {
                  items {
                    id
                    agentAddress
                    amount
                    etaDays
                    isActive
                  }
                }
              }
            }
          }
        `;
        
        const res = await fetch('http://localhost:3001/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });
        
        if (res.ok) {
          const { data } = await res.json();
          const taskData = data?.tasks?.items?.find((t: any) => t.id === id);
          if (taskData) {
            setTask({
              ...taskData,
              reward: parseInt(taskData.reward) / 1e18,
              deadline: new Date(parseInt(taskData.deadline)).toISOString(),
              status: taskData.status === 0 ? 'Open' : (taskData.status === 1 ? 'Assigned' : (taskData.status === 2 ? 'Submitted' : 'Completed'))
            });
            
            const MY_AGENT = '0x1234567890abcdef1234567890abcdef12345678';
            setBids(taskData.bids.items.map((b: any) => ({
              ...b,
              amount: parseInt(b.amount) / 1e18,
              agentName: 'Mock Agent',
              reputationScore: 90
            })));
            
            // If the user's wallet matches the poster, or if they navigated from Poster Dashboard, they are the poster.
            // For MVP mock, default anvil account is the poster: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
            setIsPoster(user?.address?.toLowerCase() === '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'.toLowerCase() || taskData.poster.toLowerCase() === user?.address?.toLowerCase());
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchTask();
    }
  }, [id, user]);

  const handleSelectBid = async (bidId: string) => {
    setIsSelecting(bidId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Optimistic update
      setTask(prev => prev ? { ...prev, status: 'Assigned' } : null);
      alert('Worker successfully assigned to task!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSelecting(null);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionUrl) return;
    
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTask(prev => prev ? { ...prev, status: 'Submitted' } : null);
      alert('Work submitted successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 bg-sand-50 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex-1 bg-sand-50 p-8 text-center pt-32">
        <h2 className="text-2xl font-medium text-ink-900 mb-4">Task Not Found</h2>
        <button onClick={() => router.back()} className="text-orange-500 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-sand-50 p-8">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-ink-600 hover:text-ink-900 transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div className="glass-1 border border-white/60 rounded-[24px] p-8 mb-8 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-light tracking-[-0.02em] text-ink-900">{task.title}</h1>
            <span className={`px-4 py-1.5 rounded-[9999px] border font-medium ${
              task.status === 'Open' ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30' :
              task.status === 'Assigned' ? 'bg-blue-500/10 text-blue-700 border-blue-500/30' :
              task.status === 'Submitted' ? 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30' :
              'bg-taupe-400/20 text-ink-600 border-taupe-400/30'
            }`}>
              {task.status}
            </span>
          </div>

          <p className="text-ink-600 text-lg leading-relaxed mb-8 font-normal">
            {task.description}
          </p>

          <div className="flex flex-wrap gap-8 border-t border-taupe-400/30 pt-6">
            <div>
              <span className="block text-sm text-ink-600 mb-1">Max Reward</span>
              <div className="flex items-center space-x-2 text-ink-900 font-variant-numeric:tabular-nums text-xl font-medium">
                <Coins size={20} className="text-ink-600" />
                <span>{task.reward} MONAD</span>
              </div>
            </div>
            <div>
              <span className="block text-sm text-ink-600 mb-1">Deadline</span>
              <div className="flex items-center space-x-2 text-ink-900 text-lg font-medium">
                <Clock size={20} className="text-ink-600" />
                <span>{new Date(task.deadline).toLocaleDateString()}</span>
              </div>
            </div>
            <div>
              <span className="block text-sm text-ink-600 mb-1">Task ID</span>
              <div className="text-ink-900 font-variant-numeric:tabular-nums text-lg font-medium">#{task.id}</div>
            </div>
          </div>
        </div>

        {/* Dynamic section based on role and status */}
        {isPoster && task.status === 'Open' && (
          <div>
            <h3 className="text-xl font-medium text-ink-900 mb-6 flex items-center">
              Active Bids <span className="ml-3 bg-orange-500/20 text-orange-500 text-sm px-2.5 py-0.5 rounded-[9999px]">{bids.length}</span>
            </h3>
            <BidList 
              bids={bids} 
              onSelectBid={handleSelectBid} 
              isSelecting={isSelecting}
            />
          </div>
        )}

        {!isPoster && task.status === 'Assigned' && (
          <div className="glass-1 border border-white/60 rounded-[24px] p-8 shadow-sm">
            <h3 className="text-xl font-medium text-ink-900 mb-2">Submit Work</h3>
            <p className="text-ink-600 mb-6 font-normal">Provide the link to your repository, document, or deliverables.</p>
            
            <form onSubmit={handleSubmitWork}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-ink-600 mb-2">Deliverable URL / IPFS Hash</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-600">
                    <ExternalLink size={16} />
                  </div>
                  <input 
                    type="text" 
                    required
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                    className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none pl-10 pr-4 py-3 text-ink-900 placeholder-taupe-400 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-colors"
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-500 text-white px-8 py-3 rounded-[9999px] font-medium flex items-center space-x-2 hover:bg-orange-500/90 disabled:opacity-50 transition-all shadow-sm"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Upload size={18} />
                    <span>Submit for Review</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
        
        {task.status === 'Submitted' && (
          <div className="glass-1 border border-emerald-500/30 rounded-[24px] p-8 text-center shadow-sm">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-700">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-medium text-ink-900 mb-2">Work Submitted</h3>
            <p className="text-ink-600 font-normal">The deliverables are currently being reviewed by the verifier network.</p>
            <p className="text-ink-600 text-sm mt-4 font-variant-numeric:tabular-nums">Submission: {submissionUrl || 'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
