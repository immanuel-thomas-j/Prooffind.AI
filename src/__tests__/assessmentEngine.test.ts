import { describe, it, expect } from "vitest";
import { AssessmentEngine } from "../services/assessmentEngine";
import { Assessment, AssessmentAttempt } from "../domain/types";

describe("AssessmentEngine", () => {
  const mockAssessment: Assessment = {
    id: "assess-1",
    skillId: "skill-hash",
    version: "1.0",
    title: "Hash Tables Assessment",
    description: "Assessment",
    timeLimitMinutes: 20,
    allowedConditions: "AI_DISCLOSURE_REQUIRED",
    stages: [
      {
        id: "s1",
        type: "EXPLANATION",
        prompt: "Explain hash tables and collision degradation",
        rubricCriteria: [
          { name: "Mechanics", maxPoints: 50, description: "Hash bucket distribution" },
          { name: "Degradation", maxPoints: 50, description: "O(N) worst case breakdown" },
        ],
      },
    ],
    createdAt: "",
    updatedAt: "",
  };

  it("evaluates rubric criteria with transparent scoring and uncertainty notes", async () => {
    const attempt: AssessmentAttempt = {
      id: "att-1",
      assessmentId: "assess-1",
      userId: "u-1",
      status: "SUBMITTED",
      conditionsApplied: "AI_DISCLOSURE_REQUIRED",
      aiDisclosure: { usedAI: false },
      stageResponses: [
        {
          stageId: "s1",
          type: "EXPLANATION",
          responseContent:
            "Hash tables provide average O(1) lookup through bucket hashing, but degrade to O(N) when collisions cause chain clustering or during HashDoS attack.",
        },
      ],
      startedAt: "2026-03-20T10:00:00Z",
      createdAt: "",
      updatedAt: "",
    };

    const result = await AssessmentEngine.evaluateAttempt(mockAssessment, attempt);
    expect(result.rubricEvaluations.length).toBe(2);
    expect(result.percentageScore).toBeGreaterThanOrEqual(80);
    expect(result.competenceStatus).toBe("DEMONSTRATED_IN_ASSESSED_CONTEXT");
    expect(result.uncertaintyNotes).toContain("The result reflects performance on these specific challenge tasks");
    expect(result.whatResultDoesNotEstablish).toBeDefined();
  });
});
