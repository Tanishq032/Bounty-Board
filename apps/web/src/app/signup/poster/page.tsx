'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useConnect } from 'wagmi';

export default function PosterSignupPage() {
  const { user, login } = useAuth();
  const { connectAsync, connectors } = useConnect();
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');

  const handleSignup = async () => {
    if (!user) {
      let connectedAddress: string | undefined;
      // Try to connect injected wallet, fallback to mock if none exists
      try {
        const injectedConnector = connectors.find(c => c.type === 'injected') || connectors[0];
        const res = await connectAsync({ connector: injectedConnector });
        connectedAddress = res.accounts[0];
      } catch (e: any) {
        if (e.message && e.message.includes('already connected')) {
          console.log('Connector already connected');
          // Address will be resolved in login() via useAccount
        } else if (e.message && e.message.includes('Provider not found')) {
          const mockConnector = connectors.find(c => c.type === 'mock');
          if (mockConnector) {
            console.log('No injected provider found, falling back to mock connector.');
            try {
              const res = await connectAsync({ connector: mockConnector });
              connectedAddress = res.accounts[0];
            } catch (mockErr: any) {
              if (mockErr.message && mockErr.message.includes('already connected')) {
                 console.log('Mock connector already connected');
              } else {
                 throw mockErr;
              }
            }
          } else {
            alert('No Web3 wallet installed.');
            return;
          }
        } else {
          console.error(e);
          return;
        }
      }
      await login(connectedAddress);
    }
    // TODO: Create profile in backend
    router.push('/app/poster/dashboard');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full flex-grow p-4 bg-transparent">
      <div className="glass-2 p-8 rounded-[24px] border border-white/60 max-w-sm w-full shadow-sm">
        <h1 className="text-2xl font-light tracking-[-0.02em] text-ink-900 mb-6 text-center">Become a Poster</h1>
        
        <label className="block text-sm font-medium text-ink-600 mb-2 px-2">Display Name</label>
        <input 
          type="text" 
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          className="w-full bg-sand-50/70 border border-transparent rounded-[9999px] px-5 py-3 text-ink-900 mb-6 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-sand-50 transition-all shadow-sm" 
          placeholder="Acme Corp"
        />

        <button
          onClick={handleSignup}
          className="w-full bg-ink-900 hover:bg-ink-900/90 text-white py-3 rounded-[9999px] font-medium transition-all shadow-sm"
        >
          {user ? 'Complete Signup' : 'Connect & Signup'}
        </button>
      </div>
    </div>
  );
}
