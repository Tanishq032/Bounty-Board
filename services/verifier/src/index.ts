import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config();

// EIP-712 Domain and Types
const domain = {
  name: 'BountyBoard',
  version: '1',
  chainId: 10143, // Replace with actual Monad Testnet ID
  verifyingContract: process.env.BOUNTY_BOARD_ADDRESS as `0x${string}`
};

const types = {
  Verdict: [
    { name: 'taskId', type: 'uint256' },
    { name: 'attempt', type: 'uint256' },
    { name: 'evidenceHash', type: 'bytes32' },
    { name: 'passed', type: 'bool' },
    { name: 'scoreBps', type: 'uint256' },
    { name: 'criteriaResultsHash', type: 'bytes32' },
    { name: 'reasonHash', type: 'bytes32' },
    { name: 'expiry', type: 'uint64' }
  ]
};

// Checkers
async function verifyDeterministicTask(taskId: string, evidenceURI: string) {
  // 1. Fetch payload and gold-set from Backend API
  // 2. Fetch evidence from IPFS via evidenceURI
  // 3. Run deterministic validation (e.g. JSON schema, matching strings)
  return { passed: true, scoreBps: 10000 };
}

// The core runner loop for the Verifier Service
async function runVerifierService() {
  console.log("Starting Verifier Service...");

  // Support up to 3 keys for the panel simulation
  const keys = [
    process.env.VERIFIER_KEY_1,
    process.env.VERIFIER_KEY_2,
    process.env.VERIFIER_KEY_3
  ].filter(Boolean) as `0x${string}`[];

  if (keys.length === 0) throw new Error("No VERIFIER keys found in .env");

  const accounts = keys.map(k => privateKeyToAccount(k));
  
  const walletClients = accounts.map(account => 
    createWalletClient({
      account,
      chain: monadTestnet,
      transport: http()
    })
  );

  console.log(`Verifier Panel loaded with ${accounts.length} signers.`);
  
  // 1. Listen for WorkSubmitted events
  // 2. Determine task template (T1-T5)
  // 3. Call `verifyDeterministicTask` or Rubric LLM checker
  // 4. Construct Verdict struct
  // 5. Have each panel member sign the typed data (EIP-712)
  // 6. Submit the multi-sig verdict to `BountyBoard.submitVerdict` via relay

  console.log("Verifier Loop initialized and waiting for WorkSubmitted events...");
}

runVerifierService().catch(console.error);
