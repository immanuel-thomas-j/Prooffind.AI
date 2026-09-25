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
} from "../../domain/types";
import {
  ILearnerRepository,
  ISkillRepository,
  IEvidenceRepository,
  IAssessmentRepository,
  ILearningPathRepository,
  IMentorRepository,
} from "../interfaces";
import {
  SEED_PROFILE,
  SEED_SKILLS,
  SEED_PREREQUISITES,
  SEED_EVIDENCE,
  SEED_ASSESSMENTS,
  SEED_PROJECTS,
  DEMO_USER_ID,
} from "./seedData";

// Storage keys
const STORAGE_PREFIX = "proofpath_ai_";
const KEY_PROFILE = `${STORAGE_PREFIX}profile`;
const KEY_EVIDENCE = `${STORAGE_PREFIX}evidence`;
const KEY_ATTEMPTS = `${STORAGE_PREFIX}attempts`;
const KEY_RESULTS = `${STORAGE_PREFIX}results`;
const KEY_CONVERSATIONS = `${STORAGE_PREFIX}conversations`;
const KEY_PATH = `${STORAGE_PREFIX}path`;

// In-memory fallback for SSR and test runners
class MemoryStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

const memoryFallback = new MemoryStorage();

function getStorage(): Storage | MemoryStorage {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  return memoryFallback;
}

export class LocalLearnerRepository implements ILearnerRepository {
  async getProfile(userId: string): Promise<LearnerProfile | null> {
    const storage = getStorage();
    const raw = storage.getItem(KEY_PROFILE);
    if (!raw) {
      // Initialize with demo profile if requesting demo user
      if (userId === DEMO_USER_ID) {
        await this.saveProfile(SEED_PROFILE);
        return { ...SEED_PROFILE };
      }
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as LearnerProfile;
      return parsed.userId === userId ? parsed : null;
    } catch {
      return null;
    }
  }

  async saveProfile(profile: LearnerProfile): Promise<LearnerProfile> {
    const storage = getStorage();
    const updated = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    storage.setItem(KEY_PROFILE, JSON.stringify(updated));
    return updated;
  }

  async resetToDemo(): Promise<LearnerProfile> {
    const storage = getStorage();
    storage.setItem(KEY_PROFILE, JSON.stringify(SEED_PROFILE));
    storage.setItem(KEY_EVIDENCE, JSON.stringify(SEED_EVIDENCE));
    storage.removeItem(KEY_ATTEMPTS);
    storage.removeItem(KEY_RESULTS);
    storage.removeItem(KEY_CONVERSATIONS);
    storage.removeItem(KEY_PATH);
    return { ...SEED_PROFILE };
  }
}

export class LocalSkillRepository implements ISkillRepository {
  async getAllSkills(): Promise<Skill[]> {
    return [...SEED_SKILLS];
  }

  async getSkillById(id: string): Promise<Skill | null> {
    const found = SEED_SKILLS.find((s) => s.id === id || s.slug === id);
    return found ? { ...found } : null;
  }

  async getPrerequisites(): Promise<SkillPrerequisite[]> {
    return [...SEED_PREREQUISITES];
  }

  async getPrerequisitesForSkill(skillId: string): Promise<SkillPrerequisite[]> {
    return SEED_PREREQUISITES.filter((p) => p.skillId === skillId);
  }
}

export class LocalEvidenceRepository implements IEvidenceRepository {
  private initDefaultEvidence(): EvidenceItem[] {
    const storage = getStorage();
    const raw = storage.getItem(KEY_EVIDENCE);
    if (!raw) {
      storage.setItem(KEY_EVIDENCE, JSON.stringify(SEED_EVIDENCE));
      return [...SEED_EVIDENCE];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [...SEED_EVIDENCE];
    }
  }

  async getEvidenceForUser(userId: string): Promise<EvidenceItem[]> {
    const all = this.initDefaultEvidence();
    return all.filter((e) => e.userId === userId);
  }

  async getEvidenceForSkill(userId: string, skillId: string): Promise<EvidenceItem[]> {
    const userEv = await this.getEvidenceForUser(userId);
    return userEv.filter((e) => e.skillId === skillId);
  }

  async addEvidence(evidence: EvidenceItem): Promise<EvidenceItem> {
    const storage = getStorage();
    const all = this.initDefaultEvidence();
    const created: EvidenceItem = {
      ...evidence,
      id: evidence.id || `ev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    all.push(created);
    storage.setItem(KEY_EVIDENCE, JSON.stringify(all));
    return created;
  }

  async updateEvidence(evidence: EvidenceItem): Promise<EvidenceItem> {
    const storage = getStorage();
    const all = this.initDefaultEvidence();
    const index = all.findIndex((e) => e.id === evidence.id);
    if (index === -1) {
      throw new Error(`Evidence item ${evidence.id} not found`);
    }
    const updated: EvidenceItem = {
      ...evidence,
      updatedAt: new Date().toISOString(),
    };
    all[index] = updated;
    storage.setItem(KEY_EVIDENCE, JSON.stringify(all));
    return updated;
  }

  async deleteEvidence(id: string): Promise<boolean> {
    const storage = getStorage();
    const all = this.initDefaultEvidence();
    const filtered = all.filter((e) => e.id !== id);
    if (filtered.length === all.length) return false;
    storage.setItem(KEY_EVIDENCE, JSON.stringify(filtered));
    return true;
  }
}

export class LocalAssessmentRepository implements IAssessmentRepository {
  async getAllAssessments(): Promise<Assessment[]> {
    return [...SEED_ASSESSMENTS];
  }

  async getAssessmentById(id: string): Promise<Assessment | null> {
    const found = SEED_ASSESSMENTS.find((a) => a.id === id);
    return found ? { ...found } : null;
  }

  async getAssessmentForSkill(skillId: string): Promise<Assessment | null> {
    const found = SEED_ASSESSMENTS.find((a) => a.skillId === skillId);
    return found ? { ...found } : null;
  }

  async createAttempt(attempt: AssessmentAttempt): Promise<AssessmentAttempt> {
    const storage = getStorage();
    const raw = storage.getItem(KEY_ATTEMPTS);
    const list: AssessmentAttempt[] = raw ? JSON.parse(raw) : [];
    const created: AssessmentAttempt = {
      ...attempt,
      id: attempt.id || `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(created);
    storage.setItem(KEY_ATTEMPTS, JSON.stringify(list));
    return created;
  }

  async getAttemptById(attemptId: string): Promise<AssessmentAttempt | null> {
    const storage = getStorage();
    const raw = storage.getItem(KEY_ATTEMPTS);
    if (!raw) return null;
    const list: AssessmentAttempt[] = JSON.parse(raw);
    const found = list.find((a) => a.id === attemptId);
    return found || null;
  }

  async saveAttempt(attempt: AssessmentAttempt): Promise<AssessmentAttempt> {
    const storage = getStorage();
    const raw = storage.getItem(KEY_ATTEMPTS);
    const list: AssessmentAttempt[] = raw ? JSON.parse(raw) : [];
    const index = list.findIndex((a) => a.id === attempt.id);
    const updated = {
      ...attempt,
      updatedAt: new Date().toISOString(),
    };
    if (index >= 0) {
      list[index] = updated;
    } else {
      list.push(updated);
    }
    storage.setItem(KEY_ATTEMPTS, JSON.stringify(list));
    return updated;
  }

  async saveResult(result: AssessmentResult): Promise<AssessmentResult> {
    const storage = getStorage();
    const raw = storage.getItem(KEY_RESULTS);
    const list: AssessmentResult[] = raw ? JSON.parse(raw) : [];
    const created = {
      ...result,
      id: result.id || `res-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(created);
    storage.setItem(KEY_RESULTS, JSON.stringify(list));
    return created;
  }

  async getResultByAttemptId(attemptId: string): Promise<AssessmentResult | null> {
    const storage = getStorage();
    const raw = storage.getItem(KEY_RESULTS);
    if (!raw) return null;
    const list: AssessmentResult[] = JSON.parse(raw);
    return list.find((r) => r.attemptId === attemptId) || null;
  }

  async getResultsForUser(userId: string): Promise<AssessmentResult[]> {
    const storage = getStorage();
    const raw = storage.getItem(KEY_RESULTS);
    if (!raw) return [];
    const list: AssessmentResult[] = JSON.parse(raw);
    return list.filter((r) => r.userId === userId);
  }
}

export class LocalLearningPathRepository implements ILearningPathRepository {
  async getLearningPath(userId: string): Promise<LearningPath | null> {
    const storage = getStorage();
    const raw = storage.getItem(KEY_PATH);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as LearningPath;
      return parsed.userId === userId ? parsed : null;
    } catch {
      return null;
    }
  }

  async saveLearningPath(path: LearningPath): Promise<LearningPath> {
    const storage = getStorage();
    const updated = {
      ...path,
      updatedAt: new Date().toISOString(),
    };
    storage.setItem(KEY_PATH, JSON.stringify(updated));
    return updated;
  }

  async getAllProjects(): Promise<Project[]> {
    return [...SEED_PROJECTS];
  }

  async getProjectById(id: string): Promise<Project | null> {
    const found = SEED_PROJECTS.find((p) => p.id === id);
    return found ? { ...found } : null;
  }
}

export class LocalMentorRepository implements IMentorRepository {
  async getConversation(userId: string, mode: string): Promise<MentorConversation | null> {
    const storage = getStorage();
    const raw = storage.getItem(KEY_CONVERSATIONS);
    if (!raw) return null;
    const list: MentorConversation[] = JSON.parse(raw);
    return list.find((c) => c.userId === userId && c.mode === mode) || null;
  }

  async appendMessage(userId: string, mode: string, message: MentorMessage): Promise<MentorConversation> {
    const storage = getStorage();
    const raw = storage.getItem(KEY_CONVERSATIONS);
    const list: MentorConversation[] = raw ? JSON.parse(raw) : [];
    let conv = list.find((c) => c.userId === userId && c.mode === mode);
    if (!conv) {
      conv = {
        id: `conv-${Date.now()}`,
        userId,
        mode: mode as any,
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      list.push(conv);
    }
    conv.messages.push(message);
    conv.updatedAt = new Date().toISOString();
    storage.setItem(KEY_CONVERSATIONS, JSON.stringify(list));
    return conv;
  }

  async clearConversation(userId: string): Promise<boolean> {
    const storage = getStorage();
    const raw = storage.getItem(KEY_CONVERSATIONS);
    if (!raw) return true;
    const list: MentorConversation[] = JSON.parse(raw);
    const filtered = list.filter((c) => c.userId !== userId);
    storage.setItem(KEY_CONVERSATIONS, JSON.stringify(filtered));
    return true;
  }
}

// Single instance export point connected to live Supabase backend
export {
  learnerRepo,
  skillRepo,
  evidenceRepo,
  assessmentRepo,
  learningPathRepo,
  mentorRepo,
} from "../supabase/supabaseStore";
