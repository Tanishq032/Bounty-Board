import React, { useState } from 'react';
import { X, Clock, Coins, Send } from 'lucide-react';
import { Task } from './TaskCard';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onSubmit: (bid: { amount: number; etaDays: number }) => Promise<void>;
}

export function BidModal({ isOpen, onClose, task, onSubmit }: BidModalProps) {
  const [amount, setAmount] = useState('');
  const [etaDays, setEtaDays] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !etaDays) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        amount: parseFloat(amount),
        etaDays: parseInt(etaDays, 10),
      });
      setAmount('');
      setEtaDays('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative glass-1 border border-white/60 rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-taupe-400/30 flex items-center justify-between">
          <h2 className="text-xl font-light tracking-[-0.02em] text-ink-900">Place Bid</h2>
          <button 
            onClick={onClose}
            className="text-ink-600 hover:text-ink-900 p-2 rounded-[9999px] hover:bg-taupe-400/20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-4 bg-sand-50/50 border-b border-taupe-400/30">
          <h3 className="text-sm font-medium text-ink-600 mb-1">Task</h3>
          <p className="text-ink-900 font-medium truncate">{task.title}</p>
          <div className="flex items-center space-x-4 mt-2">
            <span className="text-xs text-ink-600">Max Reward: <span className="text-ink-900 font-variant-numeric:tabular-nums">{task.reward} MONAD</span></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink-600 mb-2">Your Bid (MONAD)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-600">
                <Coins size={16} />
              </div>
              <input 
                type="number" 
                min="0"
                step="0.01"
                max={task.reward}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none pl-10 pr-4 py-3 text-ink-900 placeholder-taupe-400 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-all font-variant-numeric:tabular-nums"
                placeholder="0.00"
              />
            </div>
            <p className="text-xs text-ink-600 mt-2">
              Must be less than or equal to {task.reward} MONAD. A 5% bond will be required.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-600 mb-2">Estimated Time (Days)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-600">
                <Clock size={16} />
              </div>
              <input 
                type="number" 
                min="1"
                required
                value={etaDays}
                onChange={(e) => setEtaDays(e.target.value)}
                className="w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none pl-10 pr-4 py-3 text-ink-900 placeholder-taupe-400 focus:outline-none focus:border-transparent focus:border-b-orange-500 transition-all"
                placeholder="e.g. 3"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 text-white rounded-[9999px] py-3.5 font-medium flex items-center justify-center space-x-2 hover:bg-orange-500/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <Send size={18} />
                  <span>Submit Bid</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
