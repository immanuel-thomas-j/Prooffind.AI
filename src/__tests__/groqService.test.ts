import { describe, it, expect } from "vitest";
import { GroqService } from "../services/groqService";

describe("GroqService Live API Integration", () => {
  it("fetches non-simulated chat completion from Groq", async () => {
    const response = await GroqService.callChat({
      messages: [{ role: "user", content: "Reply with the word 'VERIFIED' and nothing else." }],
      temperature: 0.1,
      maxTokens: 20,
    });
    expect(response).toBeDefined();
    expect(response.toUpperCase()).toContain("VERIFIED");
  });

  it("produces valid structured JSON from Groq", async () => {
    const data = await GroqService.callJson<{ engine: string; active: boolean }>({
      messages: [
        {
          role: "system",
          content: 'You are an evaluator. Output JSON: {"engine": "ProofPath", "active": true}',
        },
        { role: "user", content: "ping" },
      ],
      maxTokens: 50,
    });
    expect(data.engine).toBe("ProofPath");
    expect(data.active).toBe(true);
  });
});
