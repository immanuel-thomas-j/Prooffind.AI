import { supabase } from "../../lib/supabaseClient";
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

export const PRIMARY_USER_ID = "demo-learner-immanuel-001";

// ==============================================================================
// 1. PURE SUPABASE LEARNER REPOSITORY
// ==============================================================================
export class SupabaseLearnerRepository implements ILearnerRepository {
  async getProfile(userId: string): Promise<LearnerProfile | null> {
    if (!userId) return null;
    const { data, error } = await supabase
      .from("learner_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      learningGoal: data.learning_goal,
      targetRole: data.target_role,
      experienceLevel: data.experience_level,
      programmingLanguages: data.programming_languages || [],
      selfReportedSkills: data.self_reported_skills || [],
      githubUrl: data.github_url,
      codingProfileUrl: data.coding_profile_url,
      preferredLearningHoursPerWeek: data.preferred_learning_hours_per_week || 8,
      aiAssistancePreference: data.ai_assistance_preference || "balanced",
      isDemoUser: data.is_demo_user || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async saveProfile(profile: LearnerProfile): Promise<LearnerProfile> {
    // Ensure parent user record exists
    await supabase.from("users").upsert(
      {
        id: profile.userId,
        email: `${profile.userId}@solvix.ai`,
        name: profile.name,
        role: "learner",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id", ignoreDuplicates: true }
    );

    const { data, error } = await supabase
      .from("learner_profiles")
      .upsert({
        id: profile.id,
        user_id: profile.userId,
        name: profile.name,
        learning_goal: profile.learningGoal,
        target_role: profile.targetRole,
        experience_level: profile.experienceLevel,
        programming_languages: profile.programmingLanguages,
        self_reported_skills: profile.selfReportedSkills,
        github_url: profile.githubUrl,
        coding_profile_url: profile.codingProfileUrl,
        preferred_learning_hours_per_week: profile.preferredLearningHoursPerWeek,
        ai_assistance_preference: profile.aiAssistancePreference,
        is_demo_user: profile.isDemoUser,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase profile save error", error);
    }
    return profile;
  }

  async resetToDemo(): Promise<LearnerProfile> {
    const prof = await this.getProfile(PRIMARY_USER_ID);
    return (
      prof || {
        id: "profile-immanuel-001",
        userId: PRIMARY_USER_ID,
        name: "Immanuel Thomas J",
        learningGoal: "Validate genuine AI systems architecture and data structure competencies.",
        targetRole: "Software Engineer & AI Architect",
        experienceLevel: "Advanced",
        programmingLanguages: ["JavaScript", "TypeScript", "Python", "Go"],
        selfReportedSkills: ["Hash Tables & Collision Resolution", "Concurrency, Mutexes & Race Conditions"],
        githubUrl: "https://github.com/immanuel-thomas-j",
        codingProfileUrl: "https://leetcode.com/u/immanuel-thomas-j/",
        preferredLearningHoursPerWeek: 12,
        aiAssistancePreference: "balanced",
        isDemoUser: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );
  }
}

// ==============================================================================
// 2. PURE SUPABASE SKILLS REPOSITORY
// ==============================================================================
export class SupabaseSkillRepository implements ISkillRepository {
  async getAllSkills(): Promise<Skill[]> {
    const { data, error } = await supabase.from("skills").select("*");
    if (error || !data) {
      return [];
    }
    return data.map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      category: s.category,
      difficulty: s.difficulty,
      description: s.description,
      coreConcepts: s.core_concepts || [],
      evaluationFocus: s.evaluation_focus,
      createdAt: s.created_at,
      updatedAt: s.updated_at,
    }));
  }

  async getSkillById(id: string): Promise<Skill | null> {
    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .or(`id.eq.${id},slug.eq.${id}`)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return {
      id: data.id,
      slug: data.slug,
      name: data.name,
      category: data.category,
      difficulty: data.difficulty,
      description: data.description,
      coreConcepts: data.core_concepts || [],
      evaluationFocus: data.evaluation_focus,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async getPrerequisites(): Promise<SkillPrerequisite[]> {
    const { data, error } = await supabase.from("skill_prerequisites").select("*");
    if (error || !data) {
      return [];
    }
    return data.map((p) => ({
      id: p.id,
      skillId: p.skill_id,
      prerequisiteSkillId: p.prerequisite_skill_id,
      relationType: p.relation_type,
    }));
  }

  async getPrerequisitesForSkill(skillId: string): Promise<SkillPrerequisite[]> {
    const { data, error } = await supabase
      .from("skill_prerequisites")
      .select("*")
      .eq("skill_id", skillId);

    if (error || !data) {
      return [];
    }
    return data.map((p) => ({
      id: p.id,
      skillId: p.skill_id,
      prerequisiteSkillId: p.prerequisite_skill_id,
      relationType: p.relation_type,
    }));
  }
}

// ==============================================================================
// 3. PURE SUPABASE EVIDENCE VAULT REPOSITORY
// ==============================================================================
export class SupabaseEvidenceRepository implements IEvidenceRepository {
  async getEvidenceForUser(userId: string): Promise<EvidenceItem[]> {
    const { data, error } = await supabase
      .from("evidence_items")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((item) => ({
      id: item.id,
      userId: item.user_id,
      skillId: item.skill_id,
      type: item.type,
      category: item.category,
      title: item.title,
      source: item.source,
      dateCollected: item.date_collected,
      reliabilityLimitations: item.reliability_limitations,
      directlyAssessed: item.directly_assessed,
      aiAssistanceAllowed: item.ai_assistance_allowed,
      aiDisclosureDetails: item.ai_disclosure_details,
      notes: item.notes,
      metadata: item.metadata,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  async getEvidenceForSkill(userId: string, skillId: string): Promise<EvidenceItem[]> {
    const { data, error } = await supabase
      .from("evidence_items")
      .select("*")
      .eq("user_id", userId)
      .eq("skill_id", skillId);

    if (error || !data) {
      return [];
    }

    return data.map((item) => ({
      id: item.id,
      userId: item.user_id,
      skillId: item.skill_id,
      type: item.type,
      category: item.category,
      title: item.title,
      source: item.source,
      dateCollected: item.date_collected,
      reliabilityLimitations: item.reliability_limitations,
      directlyAssessed: item.directly_assessed,
      aiAssistanceAllowed: item.ai_assistance_allowed,
      aiDisclosureDetails: item.ai_disclosure_details,
      notes: item.notes,
      metadata: item.metadata,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  async addEvidence(evidence: EvidenceItem): Promise<EvidenceItem> {
    const { error } = await supabase.from("evidence_items").insert({
      id: evidence.id || `ev-${Date.now()}`,
      user_id: evidence.userId,
      skill_id: evidence.skillId,
      type: evidence.type,
      category: evidence.category,
      title: evidence.title,
      source: evidence.source,
      date_collected: evidence.dateCollected || new Date().toISOString(),
      reliability_limitations: evidence.reliabilityLimitations,
      directly_assessed: evidence.directlyAssessed,
      ai_assistance_allowed: evidence.aiAssistanceAllowed,
      ai_disclosure_details: evidence.aiDisclosureDetails,
      notes: evidence.notes,
      metadata: evidence.metadata || {},
    });

    if (error) {
      console.error("Supabase addEvidence error", error);
    }
    return evidence;
  }

  async updateEvidence(evidence: EvidenceItem): Promise<EvidenceItem> {
    await supabase
      .from("evidence_items")
      .update({
        title: evidence.title,
        source: evidence.source,
        category: evidence.category,
        reliability_limitations: evidence.reliabilityLimitations,
        directly_assessed: evidence.directlyAssessed,
        ai_assistance_allowed: evidence.aiAssistanceAllowed,
        notes: evidence.notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", evidence.id);

    return evidence;
  }

  async deleteEvidence(id: string): Promise<boolean> {
    const { error } = await supabase.from("evidence_items").delete().eq("id", id);
    return !error;
  }
}

// ==============================================================================
// 4. PURE SUPABASE ASSESSMENTS REPOSITORY
// ==============================================================================
export class SupabaseAssessmentRepository implements IAssessmentRepository {
  async getAllAssessments(): Promise<Assessment[]> {
    const { data, error } = await supabase.from("assessments").select("*");
    if (error || !data) {
      return [];
    }
    return data.map((a) => ({
      id: a.id,
      skillId: a.skill_id,
      version: a.version,
      title: a.title,
      description: a.description,
      timeLimitMinutes: a.time_limit_minutes,
      allowedConditions: a.allowed_conditions,
      stages: a.stages || [],
      createdAt: a.created_at,
      updatedAt: a.updated_at,
    }));
  }

  async getAssessmentById(id: string): Promise<Assessment | null> {
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return {
      id: data.id,
      skillId: data.skill_id,
      version: data.version,
      title: data.title,
      description: data.description,
      timeLimitMinutes: data.time_limit_minutes,
      allowedConditions: data.allowed_conditions,
      stages: data.stages || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async getAssessmentForSkill(skillId: string): Promise<Assessment | null> {
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .eq("skill_id", skillId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return {
      id: data.id,
      skillId: data.skill_id,
      version: data.version,
      title: data.title,
      description: data.description,
      timeLimitMinutes: data.time_limit_minutes,
      allowedConditions: data.allowed_conditions,
      stages: data.stages || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async createAttempt(attempt: AssessmentAttempt): Promise<AssessmentAttempt> {
    const { error } = await supabase.from("assessment_attempts").insert({
      id: attempt.id,
      assessment_id: attempt.assessmentId,
      user_id: attempt.userId,
      status: attempt.status,
      conditions_applied: attempt.conditionsApplied,
      ai_disclosure: attempt.aiDisclosure,
      stage_responses: attempt.stageResponses,
      started_at: attempt.startedAt || new Date().toISOString(),
    });

    if (error) {
      console.error("Supabase createAttempt error", error);
    }
    return attempt;
  }

  async getAttemptById(attemptId: string): Promise<AssessmentAttempt | null> {
    const { data, error } = await supabase
      .from("assessment_attempts")
      .select("*")
      .eq("id", attemptId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return {
      id: data.id,
      assessmentId: data.assessment_id,
      userId: data.user_id,
      status: data.status,
      conditionsApplied: data.conditions_applied,
      aiDisclosure: data.ai_disclosure,
      stageResponses: data.stage_responses,
      startedAt: data.started_at,
      submittedAt: data.submitted_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async saveAttempt(attempt: AssessmentAttempt): Promise<AssessmentAttempt> {
    await supabase
      .from("assessment_attempts")
      .update({
        status: attempt.status,
        conditions_applied: attempt.conditionsApplied,
        ai_disclosure: attempt.aiDisclosure,
        stage_responses: attempt.stageResponses,
        submitted_at: attempt.submittedAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", attempt.id);

    return attempt;
  }

  async saveResult(result: AssessmentResult): Promise<AssessmentResult> {
    const { error } = await supabase.from("assessment_results").upsert({
      id: result.id,
      attempt_id: result.attemptId,
      assessment_id: result.assessmentId,
      user_id: result.userId,
      skill_id: result.skillId,
      competence_status: result.competenceStatus,
      percentage_score: result.percentageScore,
      rubric_evaluations: result.rubricEvaluations,
      strengths: result.strengths,
      knowledge_gaps: result.knowledgeGaps,
      uncertainty_notes: result.uncertaintyNotes,
      what_result_supports: result.whatResultSupports,
      what_result_does_not_establish: result.whatResultDoesNotEstablish,
      recommended_next_assessment: result.recommendedNextAssessment,
      recommended_learning_activity: result.recommendedLearningActivity,
      evaluated_at: result.evaluatedAt || new Date().toISOString(),
    });

    if (error) {
      console.error("Supabase saveResult error", error);
    }
    return result;
  }

  async getResultByAttemptId(attemptId: string): Promise<AssessmentResult | null> {
    const { data, error } = await supabase
      .from("assessment_results")
      .select("*")
      .eq("attempt_id", attemptId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return {
      id: data.id,
      attemptId: data.attempt_id,
      assessmentId: data.assessment_id,
      userId: data.user_id,
      skillId: data.skill_id,
      competenceStatus: data.competence_status,
      percentageScore: data.percentage_score,
      rubricEvaluations: data.rubric_evaluations,
      strengths: data.strengths,
      knowledgeGaps: data.knowledge_gaps,
      uncertaintyNotes: data.uncertainty_notes,
      whatResultSupports: data.what_result_supports,
      whatResultDoesNotEstablish: data.what_result_does_not_establish,
      recommendedNextAssessment: data.recommended_next_assessment,
      recommendedLearningActivity: data.recommended_learning_activity,
      evaluatedAt: data.evaluated_at,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async getResultsForUser(userId: string): Promise<AssessmentResult[]> {
    const { data, error } = await supabase
      .from("assessment_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return [];
    }
    return data.map((d) => ({
      id: d.id,
      attemptId: d.attempt_id,
      assessmentId: d.assessment_id,
      userId: d.user_id,
      skillId: d.skill_id,
      competenceStatus: d.competence_status,
      percentageScore: d.percentage_score,
      rubricEvaluations: d.rubric_evaluations,
      strengths: d.strengths,
      knowledgeGaps: d.knowledge_gaps,
      uncertaintyNotes: d.uncertainty_notes,
      whatResultSupports: d.what_result_supports,
      whatResultDoesNotEstablish: d.what_result_does_not_establish,
      recommendedNextAssessment: d.recommended_next_assessment,
      recommendedLearningActivity: d.recommended_learning_activity,
      evaluatedAt: d.evaluated_at,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  }
}

// ==============================================================================
// 5. PURE SUPABASE LEARNING PATHS & PROJECTS REPOSITORY
// ==============================================================================
export class SupabaseLearningPathRepository implements ILearningPathRepository {
  async getLearningPath(userId: string): Promise<LearningPath | null> {
    const { data, error } = await supabase
      .from("learning_paths")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return {
      id: data.id,
      userId: data.user_id,
      targetRole: data.target_role,
      generatedAt: data.generated_at,
      schedulingHeuristicExplanation: data.scheduling_heuristic_explanation,
      items: data.items || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async saveLearningPath(path: LearningPath): Promise<LearningPath> {
    await supabase.from("learning_paths").upsert({
      id: path.id,
      user_id: path.userId,
      target_role: path.targetRole,
      scheduling_heuristic_explanation: path.schedulingHeuristicExplanation,
      items: path.items,
      updated_at: new Date().toISOString(),
    });
    return path;
  }

  async getAllProjects(): Promise<Project[]> {
    const { data, error } = await supabase.from("projects").select("*");
    if (error || !data) {
      return [];
    }
    return data.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      targetRole: p.target_role,
      requiredSkills: p.required_skills || [],
      prerequisites: p.prerequisites || [],
      difficulty: p.difficulty,
      difficultyHeuristicNote: p.difficulty_heuristic_note,
      learningOutcomes: p.learning_outcomes || [],
      milestones: p.milestones || [],
      assessmentMethod: p.assessment_method,
      aiAssistanceRules: p.ai_assistance_rules,
      extensionChallenges: p.extension_challenges || [],
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    }));
  }

  async getProjectById(id: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      targetRole: data.target_role,
      requiredSkills: data.required_skills || [],
      prerequisites: data.prerequisites || [],
      difficulty: data.difficulty,
      difficultyHeuristicNote: data.difficulty_heuristic_note,
      learningOutcomes: data.learning_outcomes || [],
      milestones: data.milestones || [],
      assessmentMethod: data.assessment_method,
      aiAssistanceRules: data.ai_assistance_rules,
      extensionChallenges: data.extension_challenges || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }
}

// ==============================================================================
// 6. PURE SUPABASE SOCRATIC MENTOR REPOSITORY
// ==============================================================================
export class SupabaseMentorRepository implements IMentorRepository {
  async getConversation(userId: string, mode: string): Promise<MentorConversation | null> {
    const { data, error } = await supabase
      .from("mentor_conversations")
      .select("*")
      .eq("user_id", userId)
      .eq("mode", mode)
      .maybeSingle();

    if (error || !data) {
      return null;
    }
    return {
      id: data.id,
      userId: data.user_id,
      mode: data.mode as any,
      topicSkillId: data.topic_skill_id,
      messages: data.messages || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async appendMessage(
    userId: string,
    mode: string,
    message: MentorMessage
  ): Promise<MentorConversation> {
    const existing = await this.getConversation(userId, mode);
    const updatedMessages = existing ? [...existing.messages, message] : [message];
    const convId = existing?.id || `conv-${Date.now()}`;

    await supabase.from("mentor_conversations").upsert({
      id: convId,
      user_id: userId,
      mode,
      messages: updatedMessages,
      updated_at: new Date().toISOString(),
    });

    return {
      id: convId,
      userId,
      mode: mode as any,
      messages: updatedMessages,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async clearConversation(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from("mentor_conversations")
      .delete()
      .eq("user_id", userId);
    return !error;
  }
}

// ==============================================================================
// SINGLETON EXPORTS FOR LIVE APPLICATION RUNTIME
// ==============================================================================
export const learnerRepo = new SupabaseLearnerRepository();
export const skillRepo = new SupabaseSkillRepository();
export const evidenceRepo = new SupabaseEvidenceRepository();
export const assessmentRepo = new SupabaseAssessmentRepository();
export const learningPathRepo = new SupabaseLearningPathRepository();
export const mentorRepo = new SupabaseMentorRepository();
