import { describe, it, expect, beforeEach } from "vitest";
import {
  LocalLearnerRepository,
  LocalSkillRepository,
  LocalEvidenceRepository,
  LocalAssessmentRepository,
  LocalLearningPathRepository,
} from "../repositories/local/localStore";
import { EvidenceService } from "../services/evidenceService";
import { SkillGraphService } from "../services/skillGraphService";
import { AssessmentEngine } from "../services/assessmentEngine";
import { DEMO_USER_ID, SEED_PROFILE } from "../repositories/local/seedData";
import { AssessmentAttempt } from "../domain/types";

const learnerRepo = new LocalLearnerRepository();
const skillRepo = new LocalSkillRepository();
const evidenceRepo = new LocalEvidenceRepository();
const assessmentRepo = new LocalAssessmentRepository();
const learningPathRepo = new LocalLearningPathRepository();

describe("ProofPath AI — End-to-End Integration Suite", () => {
  beforeEach(async () => {
    await evidenceRepo.deleteEvidence("ev-direct-hash-01");
    await learnerRepo.resetToDemo();
  });

  it("completes full user journey: Onboard -> Discrepancy -> Assessment -> Evidence Update", async () => {
    // 1. Profile retrieval
    const profile = await learnerRepo.getProfile(DEMO_USER_ID);
    expect(profile).not.toBeNull();
    expect(profile?.name).toBe("Immanuel Thomas J");

    // 2. Fetch skills and prerequisites (DAG verification)
    const skills = await skillRepo.getAllSkills();
    const prereqs = await skillRepo.getPrerequisites();
    const dagCheck = SkillGraphService.validateGraph(skills, prereqs);
    expect(dagCheck.isValid).toBe(true);
    expect(dagCheck.hasCycles).toBe(false);

    // 3. Evidence retrieval & Skill Analysis
    const initialEvidence = await evidenceRepo.getEvidenceForUser(DEMO_USER_ID);
    expect(initialEvidence.length).toBeGreaterThan(0);

    const analyses = EvidenceService.analyzeSkills(skills, profile!.selfReportedSkills, initialEvidence);
    const hashSkillAnalysis = analyses.find((a) => a.skillId === "skill-hash-02");
    expect(hashSkillAnalysis).toBeDefined();
    // Prior to assessment, only indirect GitHub repo exists -> INFERRED
    expect(hashSkillAnalysis?.highestCategory).toBe("INFERRED");
    expect(hashSkillAnalysis?.hasDiscrepancy).toBe(true);

    // 4. Retrieve assessment for Hash Tables
    const assessment = await assessmentRepo.getAssessmentForSkill("skill-hash-02");
    expect(assessment).not.toBeNull();
    expect(assessment?.stages.length).toBe(4);

    // 5. Submit an assessment attempt
    const attempt: AssessmentAttempt = {
      id: `att-test-${Date.now()}`,
      assessmentId: assessment!.id,
      userId: DEMO_USER_ID,
      status: "SUBMITTED",
      conditionsApplied: "AI_DISCLOSURE_REQUIRED",
      aiDisclosure: {
        usedAI: false,
      },
      stageResponses: [
        {
          stageId: "stage-1-concept",
          type: "EXPLANATION",
          responseContent:
            "Hash tables provide average O(1) lookup time through bucket hashing with load factors under 0.75, but degrade to worst-case O(N) under collision clustering or HashDoS attacks. Separate chaining handles collisions via node buckets while linear probing uses open addressing.",
        },
        {
          stageId: "stage-2-mod",
          type: "MODIFICATION",
          responseContent: "Identified probe chain truncation caused by premature null assignment.",
          codeSubmission: "buckets[index].isDeleted = true; // Use tombstone marker to preserve probe chains",
          explanationOfDecisions: "Replaced null deletion with tombstone flag to preserve probe chain continuity.",
        },
        {
          stageId: "stage-3-transfer",
          type: "TRANSFER",
          responseContent:
            "Synthesized Hash Map + Doubly Linked List with cross-pointers to provide O(1) key lookups and O(1) TTL eviction from list head.",
        },
        {
          stageId: "stage-4-followup",
          type: "FOLLOW_UP",
          responseContent:
            "Mitigate algorithmic HashDoS attacks via keyed SipHash random seeds and tree-ification of deep buckets into Red-Black trees.",
        },
      ],
      startedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedAttempt = await assessmentRepo.createAttempt(attempt);
    expect(savedAttempt.id).toBeDefined();

    // 6. Evaluate attempt with AssessmentEngine
    const result = await AssessmentEngine.evaluateAttempt(assessment!, savedAttempt);
    expect(result.percentageScore).toBeGreaterThanOrEqual(80);
    expect(result.competenceStatus).toBe("DEMONSTRATED_IN_ASSESSED_CONTEXT");
    expect(result.rubricEvaluations.length).toBeGreaterThan(0);
    await assessmentRepo.saveResult(result);

    // 7. Update Evidence Vault with direct assessment result
    const newEvidence = await evidenceRepo.addEvidence({
      id: `ev-test-res-${Date.now()}`,
      userId: DEMO_USER_ID,
      skillId: "skill-hash-02",
      type: "ASSESSMENT_RESULT",
      category: "PROVEN",
      title: `Formal Assessment: ${assessment!.title}`,
      source: "ProofPath Diagnostic Lab v2",
      dateCollected: new Date().toISOString(),
      reliabilityLimitations: result.uncertaintyNotes,
      directlyAssessed: true,
      aiAssistanceAllowed: true,
      notes: "Successfully evaluated across 4 stages.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    expect(newEvidence.category).toBe("PROVEN");

    // 8. Re-evaluate Skill Competence Matrix
    const updatedEvidence = await evidenceRepo.getEvidenceForUser(DEMO_USER_ID);
    const updatedAnalyses = EvidenceService.analyzeSkills(skills, profile!.selfReportedSkills, updatedEvidence);
    const updatedHashAnalysis = updatedAnalyses.find((a) => a.skillId === "skill-hash-02");

    expect(updatedHashAnalysis?.highestCategory).toBe("PROVEN");
    expect(updatedHashAnalysis?.hasDiscrepancy).toBe(false); // Discrepancy resolved by direct assessment
    expect(updatedHashAnalysis?.competenceStatus).toBe("DEMONSTRATED_IN_ASSESSED_CONTEXT");

    // 9. Reset Demo verification
    await learnerRepo.resetToDemo();
    const resetEv = await evidenceRepo.getEvidenceForUser(DEMO_USER_ID);
    expect(resetEv.some((e) => e.id === newEvidence.id)).toBe(false);
  });
});
