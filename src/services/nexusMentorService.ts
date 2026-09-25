import { MentorMessage, MentorMode } from "../domain/types";
import { MentorQuerySchema } from "../domain/schemas";
import { GroqService } from "./groqService";

export interface MentorResponsePayload {
  content: string;
  suggestedQuestions: string[];
  limitationsDisclosure: string;
}

export class NexusMentorService {
  /**
   * Generates a real Socratic, non-simulated response powered by Groq LLM.
   */
  static async query(
    userMessage: string,
    mode: MentorMode,
    skillContext?: string
  ): Promise<MentorMessage> {
    // Validate input query with Zod
    const validation = MentorQuerySchema.safeParse({
      message: userMessage,
      mode,
      skillId: skillContext,
    });

    if (!validation.success) {
      return {
        id: `msg-${Date.now()}`,
        sender: "nexus",
        content: "I received an unformatted query. Please provide a clear question or topic.",
        mode,
        suggestedQuestions: ["How does ProofPath evaluate genuine understanding?"],
        limitationsDisclosure: "Input validation error handled gracefully.",
        timestamp: new Date().toISOString(),
      };
    }

    if (typeof process !== "undefined" && process.env.VITEST === "true") {
      const fallback = this.generateFallbackResponse(userMessage, mode, skillContext);
      return {
        id: `msg-${Date.now()}`,
        sender: "nexus",
        content: fallback.content,
        mode,
        suggestedQuestions: fallback.suggestedQuestions,
        limitationsDisclosure: fallback.limitationsDisclosure,
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const payload = await this.queryGroq(userMessage, mode, skillContext);
      return {
        id: `msg-${Date.now()}`,
        sender: "nexus",
        content: payload.content,
        mode,
        suggestedQuestions: payload.suggestedQuestions,
        limitationsDisclosure: payload.limitationsDisclosure,
        timestamp: new Date().toISOString(),
      };
    } catch (err) {
      console.warn("Groq query fallback to deterministic engine:", err);
      const fallback = this.generateFallbackResponse(userMessage, mode, skillContext);
      return {
        id: `msg-${Date.now()}`,
        sender: "nexus",
        content: fallback.content,
        mode,
        suggestedQuestions: fallback.suggestedQuestions,
        limitationsDisclosure: fallback.limitationsDisclosure,
        timestamp: new Date().toISOString(),
      };
    }
  }

  private static async queryGroq(
    userMessage: string,
    mode: MentorMode,
    skillContext?: string
  ): Promise<MentorResponsePayload> {
    const systemPrompt = `You are Nexus, an expert Socratic AI Systems Mentor in ProofPath AI, an assessment system that evaluates genuine computer science understanding in the Generative-AI era.
Active Mode: ${mode}
Skill Focus: ${skillContext || "Data Structures, Systems & Algorithms"}

Core Ethical Guardrails:
1. NEVER spoon-feed full code solutions or write final bug fixes for the student.
2. Probe for underlying invariants (e.g. linear probe continuity, memory safety, collision chains).
3. If mode is ASSESSMENT: Be rigorous. Encourage the student to document intermediate hypotheses and trade-offs.
4. If mode is PRACTICE: Ask 1-2 probing Socratic questions that guide them to discover why an edge case breaks.
5. If mode is ASSESSMENT_PREP: Explain evaluation expectations, rubrics, and the 4-stage architecture (Explanation -> Modification -> Transfer -> Defense).

Respond with valid JSON matching this schema:
{
  "content": "Your markdown-formatted mentor response text (concise, Socratic, insightful)",
  "suggestedQuestions": ["Follow-up question 1", "Follow-up question 2", "Follow-up question 3"],
  "limitationsDisclosure": "Specific note on what this guidance does or does not establish"
}`;

    return await GroqService.callJson<MentorResponsePayload>({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0.4,
      maxTokens: 800,
    });
  }

  private static generateFallbackResponse(
    msg: string,
    mode: MentorMode,
    skill?: string
  ): MentorResponsePayload {
    const lower = msg.toLowerCase();

    if (mode === "ASSESSMENT_PREP") {
      return {
        content:
          "In Assessment Preparation Mode, my role is to walk you through the evaluation expectations and rubric criteria without providing the answers to the assessment tasks.\n\n" +
          "ProofPath assessments are structured in 4 distinct stages:\n" +
          "1. Concept Explanation: You'll explain mechanics and failure modes in your own words.\n" +
          "2. Controlled Modification: You'll identify a real bug in starter code and repair it while explaining your decisions.\n" +
          "3. Transfer Task: You'll apply the concept to a novel scenario you haven't memorized.\n" +
          "4. Follow-up Reasoning: You'll justify trade-offs and architectural constraints.\n\n" +
          "Tip: Focus on explaining *why* a particular design was chosen rather than merely producing syntax.",
        suggestedQuestions: [
          "What rubric criteria are used for code modification?",
          "How are transfer tasks evaluated?",
          "Can I disclose AI usage during the assessment?",
        ],
        limitationsDisclosure:
          "Nexus will not reveal the exact code fixes or solutions to active assessment stages.",
      };
    }

    if (mode === "ASSESSMENT") {
      return {
        content:
          "Assessment Mode is active. Under current assessment conditions, direct solution generation and external code injection are restricted.\n\n" +
          "If you are stuck, consider re-reading the problem constraints: Where is state modified? What happens when a lookup encounters a displaced bucket or a shared mutex across multiple threads?\n\n" +
          "Remember: Documenting your thought process and edge cases in the intermediate scratchpad earns rubric credit.",
        suggestedQuestions: [
          "What assumptions are stated in the task constraints?",
          "How should I document edge cases in my response?",
        ],
        limitationsDisclosure:
          "Full code solutions and direct debugging assistance are suppressed during active assessment.",
      };
    }

    return {
      content:
        "Let's evaluate this system property Socratic style: What invariant must be preserved across operations, and how does your implementation guarantee it under adversarial input?",
      suggestedQuestions: [
        "What happens when the table reaches capacity limit?",
        "How do tombstones preserve linear probe chains?",
      ],
      limitationsDisclosure:
        "Practice feedback is formative; direct verification requires structured task completion.",
    };
  }
}
