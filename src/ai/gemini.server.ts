import { env } from '@/config/env';

export interface GeminiGenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemInstruction?: string;
}

export class GeminiServerClient {
  private static apiKey = env.GEMINI_API_KEY;
  private static defaultModel = env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
  private static embeddingModel = env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';

  public static isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 0);
  }

  public static async generateText(
    prompt: string,
    options?: GeminiGenerateOptions
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key is not configured');
    }

    const model = options?.model || this.defaultModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options?.temperature ?? 0.2,
        maxOutputTokens: options?.maxTokens ?? 1024
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  public static async generateJson<T>(
    prompt: string,
    options?: GeminiGenerateOptions
  ): Promise<T> {
    const rawText = await this.generateText(prompt, options);
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    try {
      const parsed = JSON.parse(cleaned) as T;
      return parsed;
    } catch {
      throw new Error(`Failed to parse Gemini JSON output: ${cleaned.slice(0, 100)}`);
    }
  }

  public static async generateEmbedding(text: string): Promise<number[]> {
    if (!this.isConfigured()) {
      // Fallback 1536-dim deterministic vector
      const dim = 1536;
      const vec = new Array(dim).fill(0);
      for (let i = 0; i < text.length; i++) {
        vec[i % dim] += (text.charCodeAt(i) % 10) / 10;
      }
      return vec;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.embeddingModel}:embedContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text }] }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini Embedding API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return (data.embedding?.values as number[]) || [];
  }
}
