'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Save, Wallet, User, Briefcase, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, roles } = useAuth();
  const router = useRouter();
  
  const [isPoster, setIsPoster] = useState(false);
  const [isBidder, setIsBidder] = useState(false);
  const [payoutAddress, setPayoutAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load current values
    if (roles) {
      setIsPoster(roles.poster);
      setIsBidder(roles.bidder);
    }
    if (user) {
      setPayoutAddress(user.address);
    }
  }, [user, roles]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Mock API call to /users/settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Saved settings:', { isPoster, isBidder, payoutAddress });
      alert('Settings saved successfully!');
      
      // Navigate to appropriate dashboard if only one role is selected
      if (isPoster && !isBidder) {
        router.push('/app/poster/dashboard');
      } else if (isBidder && !isPoster) {
        router.push('/app/bidder/dashboard');
      }
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-sand-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-light tracking-[-0.02em] text-ink-900 mb-2">Account Settings</h1>
          <p className="text-ink-600 font-normal">Configure your profile, roles, and payout preferences.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Profile Section */}
          <section className="glass-1 border border-white/60 rounded-[24px] p-8 shadow-sm">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-taupe-400/20 rounded-full flex items-center justify-center text-ink-900">
                <User size={24} />
              </div>
              <div>
                <h2 className="text-xl font-medium text-ink-900">Profile Details</h2>
                <p className="text-ink-600 text-sm">Your connected wallet information</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-2">Connected Address</label>
              <div className="bg-sand-50/50 border border-taupe-400/30 rounded-[12px] px-4 py-3 text-ink-900 font-variant-numeric:tabular-nums font-medium select-all">
                {user?.address || 'Not connected'}
              </div>
            </div>
          </section>

          {/* Roles Section */}
          <section className="glass-1 border border-white/60 rounded-[24px] p-8 shadow-sm">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-taupe-400/20 rounded-full flex items-center justify-center text-ink-900">
                <Briefcase size={24} />
              </div>
              <div>
                <h2 className="text-xl font-medium text-ink-900">User Roles</h2>
                <p className="text-ink-600 text-sm">Select how you want to use Bounty Board</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label 
                className={`relative flex items-start p-5 rounded-[24px] border-2 cursor-pointer transition-all ${
                  isPoster 
                    ? 'border-orange-500 bg-orange-500/10' 
                    : 'border-white/60 glass-2 hover:border-orange-500/50'
                }`}
              >
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={isPoster}
                    onChange={(e) => setIsPoster(e.target.checked)}
                    className="h-5 w-5 rounded border-taupe-400/50 bg-transparent text-orange-500 focus:ring-orange-500 focus:ring-offset-sand-50"
                  />
                </div>
                <div className="ml-4 flex flex-col">
                  <span className="text-ink-900 font-medium mb-1">Poster</span>
                  <span className="text-ink-600 text-sm">I want to create bounties and hire agents.</span>
                </div>
              </label>

              <label 
                className={`relative flex items-start p-5 rounded-[24px] border-2 cursor-pointer transition-all ${
                  isBidder 
                    ? 'border-orange-500 bg-orange-500/10' 
                    : 'border-white/60 glass-2 hover:border-orange-500/50'
                }`}
              >
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={isBidder}
                    onChange={(e) => setIsBidder(e.target.checked)}
                    className="h-5 w-5 rounded border-taupe-400/50 bg-transparent text-orange-500 focus:ring-orange-500 focus:ring-offset-sand-50"
                  />
                </div>
                <div className="ml-4 flex flex-col">
                  <span className="text-ink-900 font-medium mb-1">Bidder</span>
                  <span className="text-ink-600 text-sm">I want to complete tasks and earn MONAD.</span>
                </div>
              </label>
            </div>
          </section>

          {/* Payout Section */}
          <section className="glass-1 border border-white/60 rounded-[24px] p-8 shadow-sm">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-taupe-400/20 rounded-full flex items-center justify-center text-ink-900">
                <Wallet size={24} />
              </div>
              <div>
                <h2 className="text-xl font-medium text-ink-900">Payout Address</h2>
                <p className="text-ink-600 text-sm">Where your earnings will be sent (Bidders only)</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-ink-600 mb-2">Monad Wallet Address</label>
              <input 
                type="text"
                value={payoutAddress}
                onChange={(e) => setPayoutAddress(e.target.value)}
                disabled={!isBidder}
                placeholder="0x..."
                className={`w-full bg-transparent border border-transparent border-b-taupe-400/50 rounded-none px-4 py-3 text-ink-900 font-variant-numeric:tabular-nums transition-colors placeholder-taupe-400 ${
                  !isBidder ? 'opacity-50 cursor-not-allowed' : 'focus:outline-none focus:border-transparent focus:border-b-orange-500'
                }`}
              />
            </div>
          </section>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSaving || (!isPoster && !isBidder)}
              className="bg-orange-500 text-white px-8 py-3.5 rounded-[9999px] font-medium flex items-center space-x-2 hover:bg-orange-500/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {isSaving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Save size={18} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
