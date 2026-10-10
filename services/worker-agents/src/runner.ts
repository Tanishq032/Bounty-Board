import { createPublicClient, createWalletClient, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { monadTestnet } from 'viem/chains';
import * as dotenv from 'dotenv';
import { LLMClient } from './llm/client';
import { GeminiProvider } from './llm/providers/gemini';
// Import db (assuming we can reach backend db client or we instantiate our own)
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../../backend/src/db/schema';
import { eq, and } from 'drizzle-orm';
import path from 'path';

dotenv.config();

const RUNNER_DELAY = 5000;

const sqlite = new Database(path.resolve(__dirname, '../../../bounty-board-app.db'));
const db = drizzle(sqlite, { schema });

const llmClient = new LLMClient();
llmClient.registerProvider(new GeminiProvider());
// Register other providers here...

async function pollJobs() {
  console.log('[Worker Runner] Polling for new jobs...');
  
  try {
    const queuedJobs = db.select().from(schema.jobs).where(eq(schema.jobs.status, 'queued')).all();
    
    for (const job of queuedJobs) {
      await processJob(job);
    }
  } catch (err) {
    console.error('[Worker Runner] Error polling jobs:', err);
  }
}

async function processJob(job: any) {
  console.log(`[Worker Runner] Claiming job ${job.id} for agent ${job.agentId}...`);
  
  // Mark as processing
  db.update(schema.jobs).set({ status: 'processing', startedAt: new Date() }).where(eq(schema.jobs.id, job.id)).run();
  
  try {
    // Enforce concurrency limit and quota here...
    
    // Get agent info to know which provider to use
    const agent = db.select().from(schema.agents).where(eq(schema.agents.id, job.agentId)).get();
    const provider = agent?.provider || 'Gemini';
    const model = agent?.model || 'gemini-1.5-flash';

    console.log(`[Worker Runner] Using LLM provider ${provider} for job ${job.id}`);
    
    // Call LLM
    const result = await llmClient.completeWithFailover('Solve task ' + job.taskId, provider, model);
    console.log(`[Worker Runner] LLM completion successful: ${result}`);
    
    // Submit evidence (Mock)
    const evidenceHash = 'ipfs://QmDummyHash' + job.id;
    console.log(`[Worker Runner] Submitting evidence ${evidenceHash} to contract for task ${job.taskId}`);
    
    // In reality:
    // const operatorKey = await getEncryptedKey(job.agentId);
    // const account = privateKeyToAccount(operatorKey);
    // const walletClient = createWalletClient({ account, chain: monadTestnet, transport: http() });
    // await walletClient.writeContract({ ...submitWork ... });

    // Mark as completed
    db.update(schema.jobs).set({ status: 'completed', completedAt: new Date() }).where(eq(schema.jobs.id, job.id)).run();
    
    // Record LLM usage
    db.insert(schema.llmUsage).values({
      id: 'llm-' + Date.now(),
      agentId: job.agentId,
      provider: provider,
      model: model,
      tokensUsed: 150,
      timestamp: new Date()
    }).run();

  } catch (err) {
    console.error(`[Worker Runner] Job ${job.id} failed:`, err);
    db.update(schema.jobs).set({ status: 'failed', completedAt: new Date() }).where(eq(schema.jobs.id, job.id)).run();
  }
}

export function startRunner() {
  console.log('Starting Multi-tenant Agent Runner...');
  setInterval(pollJobs, 10000);
  pollJobs();
}

if (require.main === module) {
  startRunner();
}

