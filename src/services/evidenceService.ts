import {
  EvidenceCategory,
  EvidenceItem,
  EvidenceType,
  Skill,
  SkillAnalysisSummary,
  CompetenceStatus,
} from "../domain/types";

export interface SignalBreakdown {
  signal: string;
  whatItIndicates: string;
  whatItCannotProve: string;
}

export const EVIDENCE_SIGNAL_MATRIX: SignalBreakdown[] = [
  {
    signal: "Repository exists",
    whatItIndicates: "A project codebase is structured and publicly accessible.",
    whatItCannotProve: "Independent authorship, understanding of dependencies, or absence of copy-pasting.",
  },
  {
    signal: "Tests pass",
    whatItIndicates: "Evaluated automated test assertions succeeded in the recorded runtime environment.",
    whatItCannotProve: "Comprehensive branch coverage, edge-case understanding, or unassisted debugging ability.",
  },
  {
    signal: "Commit history",
    whatItIndicates: "A chronological git contribution log exists under a git author name.",
    whatItCannotProve: "Who physically authored every line, or the degree of AI generation/copy-pasting involved.",
  },
  {
    signal: "Documentation exists",
    whatItIndicates: "An architectural narrative, README, or API specification is present.",
    whatItCannotProve: "Whether the explanation was synthesized by an LLM without conceptual retention.",
  },
  {
    signal: "Live explanation",
    whatItIndicates: "Demonstrated ability to explain chosen algorithms and trade-offs in real time.",
    whatItCannotProve: "Universal competence across unassessed domains or exotic edge-case handling.",
  },
  {
    signal: "Transfer task result",
    whatItIndicates: "Ability to apply underlying concepts to a novel, unpracticed problem domain.",
    whatItCannotProve: "Complete mastery across all real-world high-scale production failure modes.",
  },
];

export class EvidenceService {
  /**
   * Evaluates the appropriate category for a given evidence type.
   * STRICT BOUNDARY: Never returns 'PROVEN' automatically for indirect sources (GitHub, Resumes, etc.)
   */
  static determineCategory(type: EvidenceType, directlyAssessed: boolean): EvidenceCategory {
    switch (type) {
      case "SELF_REPORTED":
      case "RESUME_CLAIM":
        return "CLAIMED";
      case "GITHUB_REPOSITORY":
      case "CODING_PLATFORM_PROFILE":
      case "PROJECT_DESCRIPTION":
        return "INFERRED";
      case "EXPLANATION_RESPONSE":
      case "CONTROLLED_MODIFICATION_TASK":
        return directlyAssessed ? "VERIFIED" : "INFERRED";
      case "ASSESSMENT_RESULT":
      case "TRANSFER_TASK_RESULT":
        return directlyAssessed ? "PROVEN" : "VERIFIED";
      default:
        return "CLAIMED";
    }
  }

  /**
   * Computes a structured SkillAnalysisSummary for each skill given the learner's claims and evidence items.
   */
  static analyzeSkills(
    skills: Skill[],
    selfReportedSkills: string[],
    evidenceList: EvidenceItem[]
  ): SkillAnalysisSummary[] {
    const categoryWeights: Record<EvidenceCategory, number> = {
      CLAIMED: 1,
      INFERRED: 2,
      VERIFIED: 3,
      PROVEN: 4,
    };

    return skills.map((skill) => {
      const isClaimed = selfReportedSkills.some((claimed) => {
        const cLower = claimed.toLowerCase().trim();
        const sNameLower = skill.name.toLowerCase().trim();
        const sSlugLower = skill.slug.toLowerCase().trim();
        const sIdLower = skill.id.toLowerCase().trim();

        return (
          cLower === sIdLower ||
          cLower === sSlugLower ||
          cLower === sNameLower ||
          cLower.includes(sNameLower) ||
          sNameLower.includes(cLower) ||
          (cLower.includes("hash") && sSlugLower.includes("hash")) ||
          (cLower.includes("concurrency") && sSlugLower.includes("concurrency"))
        );
      });

      const skillEvidence = evidenceList.filter((ev) => ev.skillId === skill.id);

      // Determine highest evidence category attained
      let highestCategory: EvidenceCategory = isClaimed ? "CLAIMED" : "CLAIMED";
      let highestWeight = isClaimed ? 1 : 0;

      for (const item of skillEvidence) {
        const weight = categoryWeights[item.category] || 1;
        if (weight > highestWeight) {
          highestWeight = weight;
          highestCategory = item.category;
        }
      }

      // Determine Competence Status
      let competenceStatus: CompetenceStatus = "NOT_ASSESSED";
      if (highestCategory === "PROVEN") {
        competenceStatus = "DEMONSTRATED_IN_ASSESSED_CONTEXT";
      } else if (highestCategory === "VERIFIED") {
        competenceStatus = "PARTIALLY_DEMONSTRATED";
      } else if (highestCategory === "INFERRED") {
        competenceStatus = "INITIAL_EVIDENCE";
      } else {
        competenceStatus = "NOT_ASSESSED";
      }

      // Discrepancy Detection:
      // Learner claims intermediate/advanced familiarity, but only indirect or no verified evidence is available.
      const hasDiscrepancy = isClaimed && highestWeight <= 2;
      const discrepancyExplanation = hasDiscrepancy
        ? "Your claimed proficiency is higher than the currently assessed evidence. A targeted assessment can help clarify your level."
        : undefined;

      // Transparent uncertainty explanation
      let confidenceExplanation = "";
      let limitations = "";
      let recommendedNextAction = "";

      if (highestCategory === "PROVEN") {
        confidenceExplanation = "Direct evidence observed under structured assessment conditions.";
        limitations = "Supports competence in the specific evaluated scenarios; does not represent exhaustive mastery of all edge cases.";
        recommendedNextAction = "Apply this competency in an end-to-end integration project.";
      } else if (highestCategory === "VERIFIED") {
        confidenceExplanation = "Verified in controlled code modification or explanation task.";
        limitations = "Transfer to novel problem contexts has not yet been directly validated.";
        recommendedNextAction = "Complete a transfer assessment challenge.";
      } else if (highestCategory === "INFERRED") {
        confidenceExplanation = "Indirect evidence inferred from code repositories or project descriptions.";
        limitations = "Repository artifacts do not independently establish sole authorship or unassisted debugging competence.";
        recommendedNextAction = "Complete a calibration assessment.";
      } else if (isClaimed) {
        confidenceExplanation = "Self-reported claim with no direct or indirect verification.";
        limitations = "Self-assessment without corroborating technical evidence.";
        recommendedNextAction = "Upload evidence or take a baseline assessment.";
      } else {
        confidenceExplanation = "Competency not yet claimed or assessed for this profile.";
        limitations = "No evidence items or self-reported claims recorded in Supabase.";
        recommendedNextAction = "Explore prerequisite resources or take a diagnostic assessment.";
      }

      return {
        skillId: skill.id,
        skillName: skill.name,
        category: skill.category,
        difficulty: skill.difficulty,
        claimedLevel: isClaimed ? "Claimed" : null,
        evidenceItems: skillEvidence,
        highestCategory,
        competenceStatus,
        hasDiscrepancy,
        discrepancyExplanation,
        confidenceExplanation,
        limitations,
        recommendedNextAction,
      };
    });
  }
}
