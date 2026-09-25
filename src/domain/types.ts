/**
 * ProofPath AI — Core Domain Model Definitions
 * Strictly typed entities adhering to the Supabase-ready architecture.
 */

export type EvidenceCategory = "CLAIMED" | "INFERRED" | "VERIFIED" | "PROVEN" | "UNCLAIMED";

export type EvidenceType =
  | "SELF_REPORTED"
  | "RESUME_CLAIM"
  | "GITHUB_REPOSITORY"
  | "CODING_PLATFORM_PROFILE"
  | "PROJECT_DESCRIPTION"
  | "EXPLANATION_RESPONSE"
  | "ASSESSMENT_RESULT"
  | "CONTROLLED_MODIFICATION_TASK"
  | "TRANSFER_TASK_RESULT";

export type CompetenceStatus =
  | "NOT_ASSESSED"
  | "INITIAL_EVIDENCE"
  | "PARTIALLY_DEMONSTRATED"
  | "DEMONSTRATED_IN_ASSESSED_CONTEXT"
  | "REQUIRES_TRANSFER_VALIDATION";

export type AIAssistanceCondition =
  | "AI_ALLOWED"
  | "AI_RESTRICTED"
  | "AI_DISCLOSURE_REQUIRED"
  | "PRACTICE_MODE";

export type MentorMode =
  | "LEARNING"
  | "PRACTICE"
  | "ASSESSMENT_PREP"
  | "ASSESSMENT"
  | "REFLECTION";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "learner" | "evaluator" | "admin";
  createdAt: string;
  updatedAt: string;
}

export interface LearnerProfile {
  id: string;
  userId: string;
  name: string;
  learningGoal: string;
  targetRole: string;
  experienceLevel: "Beginner" | "Intermediate" | "Advanced";
  programmingLanguages: string[];
  selfReportedSkills: string[];
  githubUrl?: string;
  codingProfileUrl?: string;
  preferredLearningHoursPerWeek: number;
  aiAssistancePreference: "proactive" | "balanced" | "minimal";
  isDemoUser: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  slug: string;
  name: string;
  category: "Computer Science" | "Backend Engineering" | "Frontend Engineering" | "Distributed Systems" | "DevOps & Security";
  difficulty: "Fundamental" | "Intermediate" | "Advanced";
  description: string;
  coreConcepts: string[];
  evaluationFocus: string;
  createdAt: string;
  updatedAt: string;
}

export interface SkillPrerequisite {
  id: string;
  skillId: string;
  prerequisiteSkillId: string;
  relationType: "STRICT_PREREQUISITE" | "RECOMMENDED_BACKGROUND";
}

export interface EvidenceItem {
  id: string;
  userId: string;
  skillId: string;
  type: EvidenceType;
  category: EvidenceCategory;
  title: string;
  source: string;
  dateCollected: string;
  reliabilityLimitations: string;
  directlyAssessed: boolean;
  aiAssistanceAllowed: boolean;
  aiDisclosureDetails?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface SkillAnalysisSummary {
  skillId: string;
  skillName: string;
  category: string;
  difficulty: string;
  claimedLevel: string | null;
  evidenceItems: EvidenceItem[];
  highestCategory: EvidenceCategory;
  competenceStatus: CompetenceStatus;
  hasDiscrepancy: boolean;
  discrepancyExplanation?: string;
  confidenceExplanation: string;
  limitations: string;
  recommendedNextAction: string;
}

export interface AssessmentStageQuestion {
  id: string;
  type: "EXPLANATION" | "MODIFICATION" | "TRANSFER" | "FOLLOW_UP";
  prompt: string;
  contextCode?: string;
  starterCode?: string;
  targetRequirements?: string[];
  constraints?: string[];
  rubricCriteria: {
    name: string;
    maxPoints: number;
    description: string;
  }[];
}

export interface Assessment {
  id: string;
  skillId: string;
  version: string;
  title: string;
  description: string;
  timeLimitMinutes: number;
  allowedConditions: AIAssistanceCondition;
  stages: AssessmentStageQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentAttempt {
  id: string;
  assessmentId: string;
  userId: string;
  status: "IN_PROGRESS" | "SUBMITTED" | "EVALUATED";
  conditionsApplied: AIAssistanceCondition;
  aiDisclosure: {
    usedAI: boolean;
    toolsUsed?: string[];
    promptsOrAssistanceSummary?: string;
  };
  stageResponses: {
    stageId: string;
    type: "EXPLANATION" | "MODIFICATION" | "TRANSFER" | "FOLLOW_UP";
    responseContent: string;
    codeSubmission?: string;
    explanationOfDecisions?: string;
    edgeCasesIdentified?: string;
  }[];
  startedAt: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RubricEvaluationItem {
  criterionName: string;
  scoreAwarded: number;
  maxScore: number;
  feedback: string;
}

export interface AssessmentResult {
  id: string;
  attemptId: string;
  assessmentId: string;
  userId: string;
  skillId: string;
  competenceStatus: CompetenceStatus;
  percentageScore: number;
  rubricEvaluations: RubricEvaluationItem[];
  strengths: string[];
  knowledgeGaps: string[];
  uncertaintyNotes: string;
  whatResultSupports: string;
  whatResultDoesNotEstablish: string;
  recommendedNextAssessment: string;
  recommendedLearningActivity: string;
  evaluatedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface LearningPathItem {
  id: string;
  skillId: string;
  order: number;
  reasonRecommended: string;
  prerequisitesMet: boolean;
  missingPrerequisites: string[];
  supportingEvidenceSummary: string;
  recommendedActivity: string;
  estimatedEffortHours: number;
  assessmentTypeRequired: string;
  status: "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "DEMONSTRATED";
}

export interface LearningPath {
  id: string;
  userId: string;
  targetRole: string;
  generatedAt: string;
  schedulingHeuristicExplanation: string;
  items: LearningPathItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  targetRole: string;
  requiredSkills: string[];
  prerequisites: string[];
  difficulty: "Accessible" | "Challenging" | "Advanced";
  difficultyHeuristicNote: string;
  learningOutcomes: string[];
  milestones: ProjectMilestone[];
  assessmentMethod: string;
  aiAssistanceRules: string;
  extensionChallenges: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MentorMessage {
  id: string;
  sender: "user" | "nexus" | "system";
  content: string;
  mode: MentorMode;
  suggestedQuestions?: string[];
  limitationsDisclosure?: string;
  timestamp: string;
}

export interface MentorConversation {
  id: string;
  userId: string;
  mode: MentorMode;
  topicSkillId?: string;
  messages: MentorMessage[];
  createdAt: string;
  updatedAt: string;
}
