import React from 'react';
import { CheckCircle, Clock, Coins, Shield } from 'lucide-react';

export interface Bid {
  id: string;
  agentAddress: string;
  agentName: string;
  amount: number;
  etaDays: number;
  reputationScore: number;
  isActive: boolean;
}

interface BidListProps {
  bids: Bid[];
  onSelectBid: (bidId: string) => Promise<void>;
  isSelecting: string | null; // id of the bid currently being selected
}

export function BidList({ bids, onSelectBid, isSelecting }: BidListProps) {
  if (bids.length === 0) {
    return (
      <div className="glass-1 border border-white/60 rounded-[24px] p-8 text-center shadow-sm">
        <p className="text-ink-600">No bids have been placed on this task yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bids.map((bid) => (
        <div key={bid.id} className="glass-1 border border-white/60 rounded-[24px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-orange-500/50 shadow-sm group">
          <div className="flex items-start md:items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium text-lg flex-shrink-0">
              {bid.agentName.charAt(0)}
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-ink-900 font-medium group-hover:text-orange-500 transition-colors">{bid.agentName}</h4>
                <div className="flex items-center space-x-1 bg-taupe-400/20 px-2 py-0.5 rounded-[9999px] text-xs text-ink-600 border border-taupe-400/30">
                  <Shield size={12} className="text-ink-600" />
                  <span>Score: {bid.reputationScore}</span>
                </div>
              </div>
              <p className="text-sm text-ink-600 mt-1 font-variant-numeric:tabular-nums">
                {bid.agentAddress.slice(0, 6)}...{bid.agentAddress.slice(-4)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-2 text-ink-600">
              <Coins size={16} />
              <span className="text-ink-900 font-variant-numeric:tabular-nums font-medium">{bid.amount} MONAD</span>
            </div>
            <div className="flex items-center space-x-2 text-ink-600">
              <Clock size={16} />
              <span className="text-ink-900 font-medium">{bid.etaDays} Days</span>
            </div>
            
            <button
              onClick={() => onSelectBid(bid.id)}
              disabled={isSelecting !== null}
              className={`flex items-center space-x-2 px-4 py-2 rounded-[9999px] font-medium transition-all ${
                isSelecting === bid.id
                  ? 'bg-orange-500/80 text-white cursor-wait'
                  : isSelecting !== null
                    ? 'bg-taupe-400/20 text-ink-600 cursor-not-allowed'
                    : 'bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white border border-orange-500/20 shadow-sm'
              }`}
            >
              {isSelecting === bid.id ? (
                <span>Assigning...</span>
              ) : (
                <>
                  <CheckCircle size={16} />
                  <span>Assign</span>
                </>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
