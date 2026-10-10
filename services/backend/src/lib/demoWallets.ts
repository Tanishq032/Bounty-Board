import * as dotenv from 'dotenv';
dotenv.config();

// The environment variable should be a comma-separated list of addresses.
const DEMO_WALLETS_ENV = process.env.DEMO_WALLETS || '';
const demoWallets = new Set(DEMO_WALLETS_ENV.split(',').map(w => w.trim().toLowerCase()).filter(Boolean));

export function isDemoWallet(address: string): boolean {
  if (!address) return false;
  return demoWallets.has(address.toLowerCase());
}

export function getDemoWallets(): string[] {
  return Array.from(demoWallets);
}
