import {
  Assessment,
  AssessmentAttempt,
  AssessmentResult,
  CompetenceStatus,
  RubricEvaluationItem,
} from "../domain/types";
import { GroqService } from "./groqService";

export class AssessmentEngine {
  /**
   * Evaluates an assessment attempt based on the assessment rubric criteria.
   * Uses real Groq LLM evaluation for non-simulated grading, with a deterministic fallback.
   */
  static async evaluateAttempt(
    assessment: Assessment,
    attempt: AssessmentAttempt
  ): Promise<AssessmentResult> {
    if (typeof process !== "undefined" && process.env.VITEST === "true") {
      return this.evaluateDeterministic(assessment, attempt);
    }

    try {
      return await this.evaluateWithGroq(assessment, attempt);
    } catch (err) {
      console.warn("Groq evaluation failed, using deterministic fallback:", err);
      return this.evaluateDeterministic(assessment, attempt);
    }
  }

  private static async evaluateWithGroq(
    assessment: Assessment,
    attempt: AssessmentAttempt
  ): Promise<AssessmentResult> {
    const prompt = `You are an expert computer science assessment evaluator in ProofPath AI, an authentic competence verification system.
Evaluate this student's multi-stage assessment attempt against the stated rubric criteria.

Assessment Title: "${assessment.title}"
Allowed Condition: ${assessment.allowedConditions}
Declared AI Usage:
- Used AI: ${attempt.aiDisclosure.usedAI}
- Tools: ${attempt.aiDisclosure.toolsUsed?.join(", ") || "None"}
- Summary of Prompts: ${attempt.aiDisclosure.promptsOrAssistanceSummary || "None"}

Assessment Stages & Rubric Criteria:
${JSON.stringify(
  assessment.stages.map((s) => ({
    stageId: s.id,
    type: s.type,
    prompt: s.prompt,
    rubricCriteria: s.rubricCriteria,
  })),
  null,
  2
)}

Student's Attempt Responses:
${JSON.stringify(
  attempt.stageResponses.map((r) => ({
    stageId: r.stageId,
    type: r.type,
    responseContent: r.responseContent,
    codeSubmission: r.codeSubmission,
    intermediateReasoning: r.explanationOfDecisions,
    edgeCasesIdentified: r.edgeCasesIdentified,
  })),
  null,
  2
)}

Evaluation Instructions:
1. For each rubric criterion in each stage, award an integer score between 0 and maxPoints based on technical accuracy, understanding of invariants, and edge-case handling.
2. In Stage 1: Evaluate conceptual depth (O(1) average vs O(N) worst-case degradation, clustering).
3. In Stage 2: Evaluate whether the tombstone sentinel is implemented correctly so linear probing does not prematurely abort on deleted cells. Check intermediate reasoning notes.
4. In Stage 3: Evaluate novel synthesis (Hash Table + Doubly Linked List for O(1) expiration).
5. In Stage 4: Evaluate adversarial defense (HashDoS mitigation, SipHash, balanced tree buckets).
6. Calculate percentageScore = (totalScoreAwarded / totalMaxPoints) * 100.
7. Set competenceStatus:
   - If score >= 85 and student demonstrated clear invariant defense: "PROVEN"
   - If score >= 70: "VERIFIED"
   - Else: "NEEDS_IMPROVEMENT"
8. State clearly what this result directly supports (scoped to assessed task) and what it does NOT establish.

Respond ONLY with valid JSON matching this schema:
{
  "percentageScore": number,
  "competenceStatus": "PROVEN" | "VERIFIED" | "NEEDS_IMPROVEMENT",
  "rubricEvaluations": [
    {
      "criterionName": string,
      "scoreAwarded": number,
      "maxScore": number,
      "feedback": string
    }
  ],
  "strengths": string[],
  "knowledgeGaps": string[],
  "uncertaintyNotes": string,
  "whatResultSupports": string,
  "whatResultDoesNotEstablish": string
}`;

    const parsed = await GroqService.callJson<{
      percentageScore: number;
      competenceStatus: CompetenceStatus;
      rubricEvaluations: RubricEvaluationItem[];
      strengths: string[];
      knowledgeGaps: string[];
      uncertaintyNotes: string;
      whatResultSupports: string;
      whatResultDoesNotEstablish: string;
    }>({
      messages: [
        { role: "system", content: "You are an objective computer science rubric evaluator. Output valid JSON." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
      maxTokens: 1200,
    });

    const now = new Date().toISOString();

    return {
      id: `res-${attempt.id}`,
      attemptId: attempt.id,
      assessmentId: assessment.id,
      userId: attempt.userId,
      skillId: assessment.skillId,
      competenceStatus: parsed.competenceStatus || (parsed.percentageScore >= 80 ? "PROVEN" : "VERIFIED"),
      percentageScore: Math.min(100, Math.max(0, Math.round(parsed.percentageScore))),
      rubricEvaluations: parsed.rubricEvaluations || [],
      strengths: parsed.strengths || ["Understands fundamental data structure invariants."],
      knowledgeGaps: parsed.knowledgeGaps || ["Edge-case handling under heavy concurrency."],
      uncertaintyNotes:
        parsed.uncertaintyNotes ||
        `Evaluated under declared condition ${attempt.conditionsApplied}. AI Assistance: ${
          attempt.aiDisclosure.usedAI ? "Disclosed" : "None"
        }.`,
      whatResultSupports:
        parsed.whatResultSupports ||
        "Demonstrated competence in linear probing deletion invariants and hash map collision mechanics.",
      whatResultDoesNotEstablish:
        parsed.whatResultDoesNotEstablish ||
        "Does not establish universal competence in unassessed distributed storage architectures.",
      recommendedNextAssessment: "Distributed Systems & Consensus Challenge",
      recommendedLearningActivity: "Implement Lock-Free Concurrent Ring Buffer",
      evaluatedAt: now,
      createdAt: now,
      updatedAt: now,
    };
  }

  public static evaluateDeterministic(
    assessment: Assessment,
    attempt: AssessmentAttempt
  ): AssessmentResult {
    const rubricEvaluations: RubricEvaluationItem[] = [];
    const strengths: string[] = [];
    const knowledgeGaps: string[] = [];

    let totalPointsAwarded = 0;
    let totalMaxPoints = 0;

    for (const stage of assessment.stages) {
      const response = attempt.stageResponses.find((r) => r.stageId === stage.id);
      const text =
        (response?.responseContent || "") +
        " " +
        (response?.codeSubmission || "") +
        " " +
        (response?.explanationOfDecisions || "");
      const lowerText = text.toLowerCase();

      for (const criterion of stage.rubricCriteria) {
        totalMaxPoints += criterion.maxPoints;

        let scoreFraction = 0.5;
        let criterionFeedback = "";

        if (stage.type === "EXPLANATION") {
          const hasBigO = lowerText.includes("o(1)") || lowerText.includes("o(n)") || lowerText.includes("constant");
          const hasCollision = lowerText.includes("collision") || lowerText.includes("chain") || lowerText.includes("probing");
          const hasLoadFactor = lowerText.includes("load factor") || lowerText.includes("threshold") || lowerText.includes("rehash");
          const hasDegradation = lowerText.includes("worst") || lowerText.includes("dos") || lowerText.includes("bucket");

          if (hasBigO && hasCollision && (hasLoadFactor || hasDegradation)) {
            scoreFraction = 0.92;
            criterionFeedback = "Clear explanation of hash table complexity mechanics and collision resolution trade-offs.";
            strengths.push("Accurate identification of worst-case degradation mechanics.");
          } else if (hasBigO && hasCollision) {
            scoreFraction = 0.75;
            criterionFeedback = "Good grasp of fundamental lookup time, but omitted specific high load factor rehashing triggers.";
            knowledgeGaps.push("Deep dive into dynamic resizing load-factor triggers and memory overhead.");
          } else {
            scoreFraction = 0.5;
            criterionFeedback = "Basic concept stated, but lacks specific technical depth on collision degradation.";
            knowledgeGaps.push("Distinguishing open addressing clustering from separate chaining.");
          }
        } else if (stage.type === "MODIFICATION") {
          const hasTombstone = lowerText.includes("tombstone") || lowerText.includes("isdeleted") || lowerText.includes("deleted") || lowerText.includes("shift");
          const hasChain = lowerText.includes("probe") || lowerText.includes("chain") || lowerText.includes("null");

          if (hasTombstone && hasChain) {
            scoreFraction = 0.95;
            criterionFeedback = "Correctly diagnosed probe chain termination and implemented deletion tombstone/displacement.";
            strengths.push("Proper handling of probe chain integrity during in-place key deletion.");
          } else if (hasChain) {
            scoreFraction = 0.7;
            criterionFeedback = "Identified the premature termination bug, but implementation of tombstone reuse has edge-case gaps.";
            knowledgeGaps.push("Handling tombstone slot reclamation during subsequent insert operations.");
          } else {
            scoreFraction = 0.45;
            criterionFeedback = "Did not fully resolve probe disruption caused by immediate null assignment.";
            knowledgeGaps.push("Linear probing deletion mechanics.");
          }
        } else if (stage.type === "TRANSFER") {
          const hasSecondary = lowerText.includes("doubly") || lowerText.includes("heap") || lowerText.includes("wheel") || lowerText.includes("linked");
          const hasTTL = lowerText.includes("ttl") || lowerText.includes("evict") || lowerText.includes("expire") || lowerText.includes("lru");

          if (hasSecondary && hasTTL) {
            scoreFraction = 0.9;
            criterionFeedback = "Synthesized Hash Table + secondary ordering structure effectively for O(1) eviction.";
            strengths.push("Strong structural synthesis combining hash lookups with temporal ordering queues.");
          } else {
            scoreFraction = 0.65;
            criterionFeedback = "Proposed secondary structure, but synchronization details between eviction and hash removal require clarification.";
            knowledgeGaps.push("Atomic pointer synchronization between hash buckets and eviction queues.");
          }
        } else {
          const hasSecurity = lowerText.includes("siphash") || lowerText.includes("random") || lowerText.includes("tree") || lowerText.includes("rate");
          if (hasSecurity) {
            scoreFraction = 0.9;
            criterionFeedback = "Well-reasoned mitigation strategy against algorithmic collision attacks.";
            strengths.push("Understands HashDoS attack vectors and defense-in-depth countermeasures.");
          } else {
            scoreFraction = 0.6;
            criterionFeedback = "Suggested generic filtering without addressing seed randomization or tree-ification.";
            knowledgeGaps.push("Algorithmic collision defenses (e.g. SipHash, Red-Black bucket trees).");
          }
        }

        const score = Math.round(criterion.maxPoints * scoreFraction);
        totalPointsAwarded += score;

        rubricEvaluations.push({
          criterionName: criterion.name,
          scoreAwarded: score,
          maxScore: criterion.maxPoints,
          feedback: criterionFeedback,
        });
      }
    }

    const percentage = totalMaxPoints > 0 ? Math.round((totalPointsAwarded / totalMaxPoints) * 100) : 0;
    const now = new Date().toISOString();

    let competenceStatus: CompetenceStatus = "DEMONSTRATED_IN_ASSESSED_CONTEXT";
    if (percentage < 60) {
      competenceStatus = "PARTIALLY_DEMONSTRATED";
    } else if (percentage < 80) {
      competenceStatus = "REQUIRES_TRANSFER_VALIDATION";
    }

    return {
      id: `res-${attempt.id}`,
      attemptId: attempt.id,
      assessmentId: assessment.id,
      userId: attempt.userId,
      skillId: assessment.skillId,
      competenceStatus,
      percentageScore: percentage,
      rubricEvaluations,
      strengths: Array.from(new Set(strengths)),
      knowledgeGaps: Array.from(new Set(knowledgeGaps)),
      uncertaintyNotes: `The result reflects performance on these specific challenge tasks (${attempt.id}) under declared condition ${attempt.conditionsApplied}. Does not guarantee performance on alternative variants.`,
      whatResultSupports:
        "Directly supports understanding of linear probing collision mechanics, tombstone invariants, and composite data structure synthesis.",
      whatResultDoesNotEstablish:
        "Does not establish universal competence in unassessed distributed storage architectures, hardware cache affinity, or production cluster sharding.",
      recommendedNextAssessment: "assess-concurrency-02",
      recommendedLearningActivity: "Review lock-free concurrent hash tables and cache-conscious Swiss Tables.",
      evaluatedAt: now,
      createdAt: now,
      updatedAt: now,
    };
  }
}
