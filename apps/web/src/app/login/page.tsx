'use client';

import React, { useState } from 'react';
import { useConnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { connectAsync, connectors } = useConnect();
  const { user, roles, login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto redirect if already logged in
  React.useEffect(() => {
    if (user) {
      if (roles?.bidder) {
        router.push('/app/bidder/dashboard');
      } else if (roles?.poster) {
        router.push('/app/poster/dashboard');
      } else {
        router.push('/signup/bidder'); // default fallback if no roles
      }
    }
  }, [user, roles, router]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
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
            throw new Error('No Web3 wallet installed.');
          }
        } else {
          throw e;
        }
      }
      // Sign in
      await login(connectedAddress);
      
      // We don't push here anymore, the useEffect will handle it once the session updates
      // But just in case, we can try to navigate if roles are somehow known immediately
      // However fetchSession() inside login() updates the context, so useEffect will catch it.
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full flex-grow p-4 bg-transparent">
      <div className="glass-2 p-8 rounded-[24px] border border-white/60 max-w-sm w-full text-center shadow-sm">
        <h1 className="text-2xl font-light tracking-[-0.02em] text-ink-900 mb-6">Sign in to Bounty Board</h1>
        <p className="text-ink-600 mb-8 text-sm font-normal">
          Connect your wallet to sign in. No password required.
        </p>
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-ink-900 hover:bg-ink-900/90 text-white py-3 rounded-[9999px] font-medium transition-all shadow-sm"
        >
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
        {error && <p className="text-red-500 mt-4 text-sm font-medium">{error}</p>}
      </div>
    </div>
  );
}
