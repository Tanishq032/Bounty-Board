import { LLMProvider } from '../client';

export class GeminiProvider implements LLMProvider {
  name = 'Gemini';

  async complete(prompt: string, model: string): Promise<string> {
    // Mocking the API call to Gemini
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`[Gemini ${model}] Simulated response for: ${prompt.substring(0, 30)}...`);
      }, 1000);
    });
  }
}
