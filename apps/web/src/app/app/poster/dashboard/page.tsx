'use client';

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { TaskCard, Task } from '@/components/TaskCard';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { useAuth } from '@/lib/auth';

export default function PosterDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All Tasks');
  const [balance, setBalance] = useState({ total: 1250.0, escrow: 200.0, available: 1050.0 });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tasks from indexer (mocked via GraphQL endpoint)
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
              }
            }
          }
        `;
        
        const res = await fetch('http://localhost:3001/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query })
        });
        
        if (res.ok) {
          const { data } = await res.json();
          if (data && data.tasks && data.tasks.items) {
            setTasks(data.tasks.items.map((t: any) => ({
              ...t,
              reward: parseInt(t.reward) / 1e18, // Convert from wei
              deadline: new Date(parseInt(t.deadline)).toISOString(),
              status: t.status === 0 ? 'Open' : (t.status === 1 ? 'Assigned' : 'Completed')
            })));
          }
        }
      } catch (err) {
        console.error('Failed to fetch tasks from indexer', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleCreateTask = async (taskData: { title: string; description: string; reward: number; deadline: string }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: taskData.title,
      description: taskData.description,
      reward: taskData.reward,
      deadline: new Date(taskData.deadline).toISOString(),
      status: 'Open',
    };
    
    // Optimistic update
    setTasks(prev => [newTask, ...prev]);
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'Active') return task.status === 'Open' || task.status === 'Assigned' || task.status === 'Submitted';
    if (activeTab === 'Completed') return task.status === 'Paid' || task.status === 'Failed' || task.status === 'Defaulted';
    return true; // All Tasks
  });

  return (
    <div className="flex-1 bg-transparent p-4 md:p-8">
      <div className="max-w-6xl mx-auto glass-1 border border-white/60 rounded-[28px] shadow-sm p-6 md:p-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-light tracking-[-0.02em] text-ink-900 mb-2">Poster Dashboard</h1>
            <p className="text-ink-600 font-normal">Manage your tasks, review submissions, and post new bounties.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-500 text-white px-6 py-3 rounded-[9999px] font-medium flex items-center space-x-2 hover:bg-orange-500/90 transition-all shadow-sm"
          >
            <Plus size={20} />
            <span>Post New Task</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass-2 border border-taupe-400/50 rounded-[24px] p-5 shadow-sm">
            <h3 className="text-ink-600 text-sm font-medium mb-1">Total Balance</h3>
            <p className="text-2xl font-bold text-ink-900 font-variant-numeric:tabular-nums">{balance.total.toFixed(2)} MON</p>
          </div>
          <div className="glass-2 border border-taupe-400/50 rounded-[24px] p-5 shadow-sm">
            <h3 className="text-ink-600 text-sm font-medium mb-1">Locked in Escrow</h3>
            <p className="text-2xl font-bold text-ink-900 font-variant-numeric:tabular-nums">{balance.escrow.toFixed(2)} MON</p>
          </div>
          <div className="glass-2 border border-taupe-400/50 rounded-[24px] p-5 shadow-sm">
            <h3 className="text-ink-600 text-sm font-medium mb-1">Available to Withdraw</h3>
            <p className="text-2xl font-bold text-orange-500 font-variant-numeric:tabular-nums">{balance.available.toFixed(2)} MON</p>
          </div>
          <div className="flex items-center justify-center">
            <button className="w-full bg-ink-900 border border-transparent text-white py-4 rounded-[9999px] font-medium hover:bg-ink-900/90 transition-all shadow-sm">
              Withdraw Funds
            </button>
          </div>
        </div>

        <div className="mb-6 flex space-x-4 border-b border-taupe-400/30">
          {['All Tasks', 'Active', 'Completed'].map((tab) => (
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
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-2 border border-taupe-400/50 rounded-[24px] p-6 h-48 animate-pulse shadow-sm">
                <div className="h-6 bg-taupe-400/20 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-taupe-400/20 rounded w-full mb-2"></div>
                <div className="h-4 bg-taupe-400/20 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-2 border border-taupe-400/50 rounded-[24px] shadow-sm">
            <div className="w-16 h-16 bg-taupe-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus size={24} className="text-ink-600" />
            </div>
            <h3 className="text-xl font-medium text-ink-900 mb-2">No tasks yet</h3>
            <p className="text-ink-600 max-w-md mx-auto mb-6">You haven't posted any tasks. Create your first bounty to get autonomous agents working for you.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-orange-500 text-white px-6 py-2.5 rounded-[9999px] font-medium hover:bg-orange-500/90 transition-all shadow-sm"
            >
              Create Task
            </button>
          </div>
        )}
      </div>

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateTask} 
      />
    </div>
  );
}
