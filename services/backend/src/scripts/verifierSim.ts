import { createPublicClient, createWalletClient, custom, http, parseAbiItem, keccak256, toHex, encodePacked, hexToSignature, SignableMessage, createTestClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
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

// A dummy verifier private key for testing purposes (NOT for production use)
const VERIFIER_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Hardhat #0 account
const account = privateKeyToAccount(VERIFIER_PRIVATE_KEY);

const BOUNTY_BOARD_ADDRESS = '0x1234567890123456789012345678901234567890'; // Placeholder address

async function main() {
  console.log(`Starting verifier simulator. Listening for WorkSubmitted events on ${BOUNTY_BOARD_ADDRESS}...`);
  console.log(`Using verifier account: ${account.address}`);

  // Event signature from BountyBoard.sol
  // event WorkSubmitted(uint256 indexed taskId, bytes32 evidenceHash, string evidenceURI);
  const event = parseAbiItem('event WorkSubmitted(uint256 indexed taskId, bytes32 evidenceHash, string evidenceURI)');

  publicClient.watchEvent({
    address: BOUNTY_BOARD_ADDRESS as `0x${string}`,
    event: event,
    onLogs: async (logs) => {
      for (const log of logs) {
        const { taskId, evidenceHash, evidenceURI } = log.args;
        console.log(`\n[EVENT CAUGHT] WorkSubmitted(taskId: ${taskId}, evidenceHash: ${evidenceHash}, evidenceURI: ${evidenceURI})`);
        
        console.log(`[VERIFIER] Analyzing submission for task ${taskId}...`);
        
        // Simulate analysis taking 3 seconds
        await new Promise((resolve) => setTimeout(resolve, 3000));
        
        // Mock verdict (90% pass rate)
        const passed = Math.random() > 0.1;
        const scoreBps = passed ? 9500 : 3000;
        
        console.log(`[VERIFIER] Verdict determined for task ${taskId}: ${passed ? 'PASS' : 'FAIL'} (Score: ${scoreBps / 100}%)`);
        
        // Generate EIP-712 Signature (Mock for sim)
        const domain = {
          name: 'BountyBoard',
          version: '1',
          chainId: monadTestnet.id,
          verifyingContract: BOUNTY_BOARD_ADDRESS as `0x${string}`,
        };

        const types = {
          Verdict: [
            { name: 'taskId', type: 'uint256' },
            { name: 'attempt', type: 'uint256' },
            { name: 'passed', type: 'bool' },
            { name: 'scoreBps', type: 'uint256' },
          ],
        };

        const message = {
          taskId: BigInt(taskId as any),
          attempt: BigInt(1),
          passed,
          scoreBps: BigInt(scoreBps),
        };

        try {
          const signature = await account.signTypedData({
            domain,
            types,
            primaryType: 'Verdict',
            message,
          });

          console.log(`[VERIFIER] Generated signature: ${signature.slice(0, 20)}...`);
          console.log(`[VERIFIER] (In a full flow, the verifier would now call submitVerdict on-chain)`);
        } catch (error) {
          console.error('[VERIFIER] Failed to sign verdict:', error);
        }
      }
    },
  });

  // Keep process alive
  await new Promise(() => {});
}

main().catch(console.error);
