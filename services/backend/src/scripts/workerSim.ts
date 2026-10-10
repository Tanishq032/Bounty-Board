import { createPublicClient, http, parseAbiItem } from 'viem';
import { defineChain } from 'viem';

// Monad Testnet definition
const monadTestnet = defineChain({
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
});

const publicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(),
});

const BOUNTY_BOARD_ADDRESS = '0x1234567890123456789012345678901234567890'; // Placeholder address

async function main() {
  console.log(`Starting worker simulator. Listening for TaskCreated events on ${BOUNTY_BOARD_ADDRESS}...`);

  // Event signature from BountyBoard.sol
  // event TaskCreated(uint256 indexed taskId, address indexed poster, uint96 reward);
  const event = parseAbiItem('event TaskCreated(uint256 indexed taskId, address indexed poster, uint96 reward)');

  publicClient.watchEvent({
    address: BOUNTY_BOARD_ADDRESS as `0x${string}`,
    event: event,
    onLogs: async (logs) => {
      for (const log of logs) {
        const { taskId, poster, reward } = log.args;
        console.log(`\n[EVENT CAUGHT] TaskCreated(taskId: ${taskId}, poster: ${poster}, reward: ${reward})`);
        
        console.log(`[WORKER] Simulating AI worker assigning to task ${taskId}...`);
        
        // Simulate work taking 5 seconds
        await new Promise((resolve) => setTimeout(resolve, 5000));
        
        const mockEvidenceHash = '0xabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcdabcd';
        const mockEvidenceUrl = 'ipfs://QmPlaceholderWorkerSubmissionHash123';
        
        console.log(`[WORKER] Work completed for task ${taskId}.`);
        console.log(`[WORKER] Evidence Hash: ${mockEvidenceHash}`);
        console.log(`[WORKER] Submission ready at: ${mockEvidenceUrl}`);
        console.log(`[WORKER] (In a full flow, the worker would now call submitWork on-chain)`);
      }
    },
  });

  // Keep process alive
  await new Promise(() => {});
}

main().catch(console.error);
