import { describe, it, expect } from "vitest";
import { EvidenceService } from "../services/evidenceService";
import { EvidenceItem, Skill } from "../domain/types";

describe("EvidenceService", () => {
  it("never classifies GitHub repositories or resumes as PROVEN automatically", () => {
    const githubCategory = EvidenceService.determineCategory("GITHUB_REPOSITORY", false);
    const resumeCategory = EvidenceService.determineCategory("RESUME_CLAIM", false);
    const platformCategory = EvidenceService.determineCategory("CODING_PLATFORM_PROFILE", false);

    expect(githubCategory).toBe("INFERRED");
    expect(resumeCategory).toBe("CLAIMED");
    expect(platformCategory).toBe("INFERRED");
    expect(githubCategory).not.toBe("PROVEN");
    expect(resumeCategory).not.toBe("PROVEN");
  });

  it("requires direct assessment to reach PROVEN status", () => {
    const directAssessment = EvidenceService.determineCategory("ASSESSMENT_RESULT", true);
    const indirectAssessment = EvidenceService.determineCategory("ASSESSMENT_RESULT", false);

    expect(directAssessment).toBe("PROVEN");
    expect(indirectAssessment).toBe("VERIFIED");
  });

  it("accurately detects skill-evidence discrepancies with non-judgmental wording", () => {
    const mockSkills: Skill[] = [
      {
        id: "skill-1",
        slug: "concurrency",
        name: "Concurrency & Mutexes",
        category: "Backend Engineering",
        difficulty: "Advanced",
        description: "",
        coreConcepts: [],
        evaluationFocus: "",
        createdAt: "",
        updatedAt: "",
      },
    ];

    const claimedSkills = ["Concurrency & Mutexes"];
    const evidenceList: EvidenceItem[] = [
      {
        id: "ev-1",
        userId: "user-1",
        skillId: "skill-1",
        type: "RESUME_CLAIM",
        category: "CLAIMED",
        title: "Resume Claim",
        source: "LinkedIn",
        dateCollected: "2026-03-01",
        reliabilityLimitations: "Self reported",
        directlyAssessed: false,
        aiAssistanceAllowed: true,
        createdAt: "",
        updatedAt: "",
      },
    ];

    const analysis = EvidenceService.analyzeSkills(mockSkills, claimedSkills, evidenceList);
    expect(analysis[0].hasDiscrepancy).toBe(true);
    expect(analysis[0].discrepancyExplanation).toContain("Your claimed proficiency is higher than the currently assessed evidence");
    expect(analysis[0].discrepancyExplanation).not.toContain("Dunning");
    expect(analysis[0].discrepancyExplanation).not.toContain("dishonest");
  });
});
