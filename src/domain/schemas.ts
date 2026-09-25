import { z } from "zod";

export const EvidenceCategoryEnum = z.enum(["CLAIMED", "INFERRED", "VERIFIED", "PROVEN"]);

export const EvidenceTypeEnum = z.enum([
  "SELF_REPORTED",
  "RESUME_CLAIM",
  "GITHUB_REPOSITORY",
  "CODING_PLATFORM_PROFILE",
  "PROJECT_DESCRIPTION",
  "EXPLANATION_RESPONSE",
  "ASSESSMENT_RESULT",
  "CONTROLLED_MODIFICATION_TASK",
  "TRANSFER_TASK_RESULT",
]);

export const CompetenceStatusEnum = z.enum([
  "NOT_ASSESSED",
  "INITIAL_EVIDENCE",
  "PARTIALLY_DEMONSTRATED",
  "DEMONSTRATED_IN_ASSESSED_CONTEXT",
  "REQUIRES_TRANSFER_VALIDATION",
]);

export const AIAssistanceConditionEnum = z.enum([
  "AI_ALLOWED",
  "AI_RESTRICTED",
  "AI_DISCLOSURE_REQUIRED",
  "PRACTICE_MODE",
]);

export const MentorModeEnum = z.enum([
  "LEARNING",
  "PRACTICE",
  "ASSESSMENT_PREP",
  "ASSESSMENT",
  "REFLECTION",
]);

export const OnboardingFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60, "Name is too long"),
  targetRole: z.string().min(2, "Please select or enter your target role"),
  learningGoal: z.string().min(5, "Please provide a brief learning goal"),
  experienceLevel: z.enum(["Beginner", "Intermediate", "Advanced"]),
  programmingLanguages: z.array(z.string()).min(1, "Select at least one programming language"),
  selfReportedSkills: z.array(z.string()).min(1, "Select at least one skill you currently claim or wish to assess"),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  codingProfileUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  preferredLearningHoursPerWeek: z.number().min(1).max(60).default(8),
  aiAssistancePreference: z.enum(["proactive", "balanced", "minimal"]).default("balanced"),
});

export type OnboardingFormData = z.infer<typeof OnboardingFormSchema>;

export const EvidenceCreationSchema = z.object({
  skillId: z.string().min(1, "Please select an associated skill"),
  type: EvidenceTypeEnum,
  category: EvidenceCategoryEnum,
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  source: z.string().min(2, "Source identifier or URL is required"),
  reliabilityLimitations: z.string().min(5, "Explicit limitations must be documented"),
  directlyAssessed: z.boolean(),
  aiAssistanceAllowed: z.boolean(),
  aiDisclosureDetails: z.string().optional(),
  notes: z.string().optional(),
});

export type EvidenceCreationData = z.infer<typeof EvidenceCreationSchema>;

export const AssessmentSubmissionSchema = z.object({
  attemptId: z.string().min(1),
  conditionsApplied: AIAssistanceConditionEnum,
  aiDisclosure: z.object({
    usedAI: z.boolean(),
    toolsUsed: z.array(z.string()).optional(),
    promptsOrAssistanceSummary: z.string().optional(),
  }),
  stageResponses: z.array(
    z.object({
      stageId: z.string(),
      type: z.enum(["EXPLANATION", "MODIFICATION", "TRANSFER", "FOLLOW_UP"]),
      responseContent: z.string().min(5, "Response is too short to evaluate"),
      codeSubmission: z.string().optional(),
      explanationOfDecisions: z.string().optional(),
      edgeCasesIdentified: z.string().optional(),
    })
  ).min(1, "At least one stage response must be submitted"),
});

export type AssessmentSubmissionData = z.infer<typeof AssessmentSubmissionSchema>;

export const MentorQuerySchema = z.object({
  message: z.string().min(2, "Message cannot be empty").max(1500),
  mode: MentorModeEnum,
  skillId: z.string().optional(),
});

export type MentorQueryData = z.infer<typeof MentorQuerySchema>;
