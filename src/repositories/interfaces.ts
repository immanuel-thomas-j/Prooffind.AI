import {
  LearnerProfile,
  Skill,
  SkillPrerequisite,
  EvidenceItem,
  Assessment,
  AssessmentAttempt,
  AssessmentResult,
  LearningPath,
  Project,
  MentorConversation,
  MentorMessage,
} from "../domain/types";

export interface ILearnerRepository {
  getProfile(userId: string): Promise<LearnerProfile | null>;
  saveProfile(profile: LearnerProfile): Promise<LearnerProfile>;
  resetToDemo(): Promise<LearnerProfile>;
}

export interface ISkillRepository {
  getAllSkills(): Promise<Skill[]>;
  getSkillById(id: string): Promise<Skill | null>;
  getPrerequisites(): Promise<SkillPrerequisite[]>;
  getPrerequisitesForSkill(skillId: string): Promise<SkillPrerequisite[]>;
}

export interface IEvidenceRepository {
  getEvidenceForUser(userId: string): Promise<EvidenceItem[]>;
  getEvidenceForSkill(userId: string, skillId: string): Promise<EvidenceItem[]>;
  addEvidence(evidence: EvidenceItem): Promise<EvidenceItem>;
  updateEvidence(evidence: EvidenceItem): Promise<EvidenceItem>;
  deleteEvidence(id: string): Promise<boolean>;
}

export interface IAssessmentRepository {
  getAllAssessments(): Promise<Assessment[]>;
  getAssessmentById(id: string): Promise<Assessment | null>;
  getAssessmentForSkill(skillId: string): Promise<Assessment | null>;
  createAttempt(attempt: AssessmentAttempt): Promise<AssessmentAttempt>;
  getAttemptById(attemptId: string): Promise<AssessmentAttempt | null>;
  saveAttempt(attempt: AssessmentAttempt): Promise<AssessmentAttempt>;
  saveResult(result: AssessmentResult): Promise<AssessmentResult>;
  getResultByAttemptId(attemptId: string): Promise<AssessmentResult | null>;
  getResultsForUser(userId: string): Promise<AssessmentResult[]>;
}

export interface ILearningPathRepository {
  getLearningPath(userId: string): Promise<LearningPath | null>;
  saveLearningPath(path: LearningPath): Promise<LearningPath>;
  getAllProjects(): Promise<Project[]>;
  getProjectById(id: string): Promise<Project | null>;
}

export interface IMentorRepository {
  getConversation(userId: string, mode: string): Promise<MentorConversation | null>;
  appendMessage(userId: string, mode: string, message: MentorMessage): Promise<MentorConversation>;
  clearConversation(userId: string): Promise<boolean>;
}
