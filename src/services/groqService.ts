export interface GroqChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqChatOptions {
  messages: GroqChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

const DEFAULT_API_KEY =
  (typeof process !== "undefined" && (process.env?.GROQ_API_KEY || process.env?.NEXT_PUBLIC_GROQ_API_KEY)) ||
  "";

const PRIMARY_MODEL = "qwen/qwen3.8-27b";
const FALLBACK_MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b"];

export class GroqService {
  static getApiKey(): string {
    return (
      (typeof process !== "undefined" && (process.env?.GROQ_API_KEY || process.env?.NEXT_PUBLIC_GROQ_API_KEY)) ||
      DEFAULT_API_KEY
    );
  }

  static async callChat(options: GroqChatOptions): Promise<string> {
    const apiKey = this.getApiKey();
    const candidateModels = [options.model || PRIMARY_MODEL, ...FALLBACK_MODELS.filter((m) => m !== options.model)];

    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const body: Record<string, any> = {
          model,
          messages: options.messages,
          temperature: options.temperature ?? 0.3,
          max_tokens: options.maxTokens ?? 1024,
        };

        if (options.jsonMode) {
          body.response_format = { type: "json_object" };
        }

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(`Groq API error (${res.status}): ${errData.error?.message || res.statusText}`);
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content !== undefined && content !== null) {
          return content;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Groq model ${model} failed, trying fallback...`, err.message || err);
      }
    }

    throw lastError || new Error("Failed to get response from Groq API");
  }

  /**
   * Helper to call Groq expecting a structured JSON response.
   */
  static async callJson<T>(options: GroqChatOptions): Promise<T> {
    const raw = await this.callChat({ ...options, jsonMode: true });
    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      // In case the model wrapped it in markdown code blocks
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
      return JSON.parse(cleaned) as T;
    }
  }
}
