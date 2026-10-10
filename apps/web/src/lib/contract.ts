import { createPublicClient, createWalletClient, custom, http, defineChain } from 'viem';

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MONAD',
    symbol: 'MONAD',
  },
  rpcUrls: {
    default: { http: ['https://testnet-rpc.monad.xyz'] },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
  testnet: true,
});

export const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

export async function getWalletClient() {
  if (typeof window === 'undefined') {
    throw new Error('Window is undefined');
  }
  
  if (!window.ethereum) {
    throw new Error('No ethereum provider found. Please install MetaMask or another wallet.');
  }

  // Request accounts to ensure the user is connected
  await window.ethereum.request({ method: 'eth_requestAccounts' });

  const walletClient = createWalletClient({
    chain: monadTestnet,
    transport: custom(window.ethereum),
  });
  
  return walletClient;
}

// Ensure window.ethereum is typed
declare global {
  interface Window {
    ethereum?: any;
  }
}
