import fs from 'fs';
import path from 'path';

export interface LLMProvider {
  name: string;
  complete(prompt: string, model: string): Promise<string>;
}

const limitsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/llm-limits.json'), 'utf-8'));

export class LLMClient {
  private providers: Map<string, LLMProvider> = new Map();
  private usage: Map<string, { rpm: number, lastReset: number }> = new Map();

  registerProvider(provider: LLMProvider) {
    this.providers.set(provider.name, provider);
    this.usage.set(provider.name, { rpm: 0, lastReset: Date.now() });
  }

  async completeWithFailover(prompt: string, preferredProvider: string, model: string): Promise<string> {
    const providerNames = [preferredProvider, ...Array.from(this.providers.keys()).filter(p => p !== preferredProvider)];
    
    for (const providerName of providerNames) {
      const provider = this.providers.get(providerName);
      if (!provider) continue;

      // Rate limiting check
      const limit = limitsConfig.providers[providerName]?.rpm || 10;
      const currentUsage = this.usage.get(providerName)!;
      
      if (Date.now() - currentUsage.lastReset > 60000) {
        currentUsage.rpm = 0;
        currentUsage.lastReset = Date.now();
      }

      if (currentUsage.rpm >= limit) {
        console.log(`[LLM Client] Provider ${providerName} rate limited, failing over...`);
        continue;
      }

      try {
        currentUsage.rpm++;
        console.log(`[LLM Client] Attempting completion with ${providerName}...`);
        const result = await provider.complete(prompt, model);
        return result;
      } catch (err) {
        console.error(`[LLM Client] Error with ${providerName}:`, err);
        // Failover
      }
    }

    throw new Error('All LLM providers exhausted or rate limited.');
  }
}
