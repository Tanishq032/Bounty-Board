'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Cpu } from 'lucide-react';
import { TaskCard, Task } from '@/components/TaskCard';
import { BidModal } from '@/components/BidModal';

export default function BidderDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState('Explore');

  // Fetch from GraphQL
  useEffect(() => {
    const fetchTasks = async () => {
      setIsLoading(true);
      try {
        const query = `
          query {
            tasks {
              items {
                id
                title
                description
                reward
                deadline
                status
                bids {
                  items {
                    agentAddress
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
          if (data && data.tasks && data.tasks.items) {
            // Check if current user bid on this task. Hardcoding the agent address for the mock.
            const MY_AGENT = '0x1234567890abcdef1234567890abcdef12345678';
            setTasks(data.tasks.items.map((t: any) => ({
              ...t,
              reward: parseInt(t.reward) / 1e18,
              deadline: new Date(parseInt(t.deadline)).toISOString(),
              status: t.status === 0 ? 'Open' : (t.status === 1 ? 'Assigned' : 'Completed'),
              hasMyBid: t.bids?.items.some((b: any) => b.agentAddress.toLowerCase() === MY_AGENT.toLowerCase())
            })));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task: any) => {
    if (activeTab === 'Explore') return task.status === 'Open' && !task.hasMyBid;
    if (activeTab === 'My Bids') return task.status === 'Open' && task.hasMyBid;
    if (activeTab === 'Assigned Tasks') return task.status === 'Assigned';
    if (activeTab === 'Completed') return task.status === 'Completed';
    return true;
  });

  const handleBidSubmit = async (bidData: { amount: number; etaDays: number }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would send a POST request to /bids
    console.log('Bid submitted:', { taskId: selectedTask?.id, ...bidData });
    
    // For demo, we might want to show a toast or remove the task from the list
    alert(`Successfully placed bid of ${bidData.amount} MONAD on "${selectedTask?.title}"`);
    
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === selectedTask?.id ? { ...t, hasMyBid: true } : t));
    setSelectedTask(null);
  };

  return (
    <div className="flex-1 bg-transparent p-4 md:p-8">
      <div className="max-w-6xl mx-auto glass-1 border border-white/60 rounded-[28px] shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-light tracking-[-0.02em] text-ink-900 mb-2">Available Bounties</h1>
            <p className="text-ink-600 font-normal">Find tasks, place bids, and earn MONAD by completing work.</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-600">
                <Search size={16} />
              </div>
              <input 
                type="text" 
                placeholder="Search tasks..."
                className="w-full md:w-64 glass-1 border border-white/60 rounded-[9999px] pl-10 pr-4 py-2.5 text-ink-900 placeholder-taupe-400 focus:outline-none focus:border-orange-500 transition-all text-sm shadow-sm"
              />
            </div>
            <button className="glass-1 border border-white/60 text-ink-900 p-2.5 rounded-[9999px] hover:bg-white/40 transition-all shadow-sm">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="mb-6 flex space-x-4 border-b border-taupe-400/30">
          {['Explore', 'My Bids', 'Assigned Tasks', 'Completed'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-orange-500 text-orange-500' 
                  : 'border-transparent text-ink-600 hover:text-ink-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-2 border border-taupe-400/50 rounded-[24px] p-6 h-56 animate-pulse shadow-sm">
                <div className="h-6 bg-taupe-400/20 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-taupe-400/20 rounded w-full mb-2"></div>
                <div className="h-4 bg-taupe-400/20 rounded w-5/6 mb-8"></div>
                <div className="h-10 bg-taupe-400/20 rounded w-full mt-auto"></div>
              </div>
            ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task: any) => (
              <div key={task.id} className="relative group">
                <TaskCard task={task} />
                {task.status === 'Open' && !task.hasMyBid && (
                  <div className="absolute inset-0 bg-sand-50/80 backdrop-blur-[4px] opacity-0 group-hover:opacity-100 transition-opacity rounded-[24px] flex items-center justify-center border border-orange-500/50">
                    <button 
                      onClick={() => setSelectedTask(task)}
                      className="bg-orange-500 text-white px-6 py-2.5 rounded-[9999px] font-medium hover:bg-orange-500/90 transition-all shadow-sm"
                    >
                      Place Bid
                    </button>
                  </div>
                )}
                {task.status === 'Open' && task.hasMyBid && (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-medium px-2.5 py-1 rounded-[9999px] shadow-sm">
                    Bid Placed
                  </div>
                )}
                {task.status === 'Assigned' && (
                  <div className="absolute inset-0 bg-sand-50/80 backdrop-blur-[4px] opacity-0 group-hover:opacity-100 transition-opacity rounded-[24px] flex items-center justify-center border border-orange-500/50">
                    <a 
                      href={`/app/task/${task.id}`}
                      className="bg-orange-500 text-white px-6 py-2.5 rounded-[9999px] font-medium hover:bg-orange-500/90 transition-all shadow-sm block text-center"
                    >
                      Work on Task
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-2 border border-taupe-400/50 rounded-[24px] shadow-sm">
            <div className="w-16 h-16 bg-taupe-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Cpu size={24} className="text-ink-600" />
            </div>
            <h3 className="text-xl font-medium text-ink-900 mb-2">No tasks available</h3>
            <p className="text-ink-600 font-normal max-w-md mx-auto">There are currently no open tasks matching your criteria. Check back later.</p>
          </div>
        )}
      </div>

      <BidModal 
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        task={selectedTask}
        onSubmit={handleBidSubmit}
      />
    </div>
  );
}
