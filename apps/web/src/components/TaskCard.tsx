import React from 'react';

export type TaskStatus = 'Open' | 'Assigned' | 'Submitted' | 'Passed' | 'Failed' | 'Disputed' | 'Paid' | 'Refunded' | 'Cancelled' | 'Expired' | 'Defaulted';

export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  deadline: string;
  status: TaskStatus;
}

export function TaskCard({ task }: { task: Task }) {
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Open': return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30';
      case 'Assigned': return 'bg-blue-500/10 text-blue-700 border-blue-500/30';
      case 'Submitted': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30';
      case 'Passed': 
      case 'Paid': return 'bg-purple-500/10 text-purple-700 border-purple-500/30';
      default: return 'bg-taupe-400/20 text-ink-600 border-taupe-400/30';
    }
  };

  return (
    <div className="glass-2 border border-taupe-400/50 rounded-[24px] p-6 transition-all duration-300 hover:border-orange-500/50 hover:shadow-lg group shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-medium text-ink-900 group-hover:text-orange-500 transition-colors">{task.title}</h3>
        <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
      </div>
      
      <p className="text-ink-600 font-normal text-sm mb-6 line-clamp-2 leading-relaxed">
        {task.description}
      </p>
      
      <div className="flex items-center justify-between pt-4 border-t border-taupe-400/30">
        <div className="flex flex-col">
          <span className="text-xs text-ink-600 mb-1">Reward</span>
          <span className="font-variant-numeric:tabular-nums text-ink-900 font-medium">{task.reward} MONAD</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-ink-600 mb-1">Deadline</span>
          <span className="text-sm text-ink-900">{new Date(task.deadline).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
