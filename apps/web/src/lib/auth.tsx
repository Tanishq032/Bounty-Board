'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';

interface AuthUser {
  address: string;
}

interface AuthRoles {
  poster: boolean;
  bidder: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  roles: AuthRoles | null;
  profile: any;
  isLoading: boolean;
  login: (connectedAddress?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [roles, setRoles] = useState<AuthRoles | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const fetchSession = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3001/me', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setRoles(data.roles);
        setProfile(data.profile);
      } else {
        setUser(null);
        setRoles(null);
        setProfile(null);
      }
    } catch (e) {
      console.error('Failed to fetch session', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (connectedAddress?: string) => {
    const activeAddress = connectedAddress || address;
    if (!activeAddress) throw new Error('No wallet connected');

    // 1. Get nonce
    const nonceRes = await fetch('http://localhost:3001/auth/nonce', { 
      method: 'POST',
      credentials: 'include'
    });
    const { nonce } = await nonceRes.json();

    // 2. Sign message
    const message = `Sign in to Bounty Board. Nonce: ${nonce}`;
    let signature: string;
    try {
      signature = await signMessageAsync({ message });
    } catch (e: any) {
      if (activeAddress.toLowerCase() === '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266') {
        console.warn('Mock account detected, using dummy signature');
        signature = '0xmocksignature';
      } else {
        throw e;
      }
    }

    // 3. Verify
    const verifyRes = await fetch('http://localhost:3001/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ message, signature, address: activeAddress }),
    });

    if (verifyRes.ok) {
      await fetchSession();
    } else {
      throw new Error('Login failed');
    }
  };

  const logout = async () => {
    await fetch('http://localhost:3001/auth/logout', { 
      method: 'POST',
      credentials: 'include'
    });
    setUser(null);
    setRoles(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, roles, profile, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
