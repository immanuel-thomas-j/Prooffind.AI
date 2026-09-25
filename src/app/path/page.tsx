"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Clock,
  Code2,
  FolderGit2,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  learnerRepo,
  skillRepo,
  evidenceRepo,
  learningPathRepo,
} from "../../repositories/supabase/supabaseStore";
import {
  LearnerProfile,
  Skill,
  SkillPrerequisite,
  EvidenceItem,
  Project,
  LearningPathItem,
} from "../../domain/types";
import { SkillGraphService } from "../../services/skillGraphService";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { AuthGuard } from "../../components/auth/AuthGuard";

export default function LearningPathPage() {
  return (
    <AuthGuard
      fallbackTitle="Candidate Learning Path Locked"
      fallbackDescription="Please sign in to access your adaptive evidence-based DAG curriculum, verified milestones, and project portfolio."
    >
      <LearningPathContent />
    </AuthGuard>
  );
}

function LearningPathContent() {
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [prereqs, setPrereqs] = useState<SkillPrerequisite[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pathItems, setPathItems] = useState<LearningPathItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const prof = authProfile || (await learnerRepo.getProfile(user.id));
        const sks = await skillRepo.getAllSkills();
        const prs = await skillRepo.getPrerequisites();
        const evs = prof ? await evidenceRepo.getEvidenceForUser(prof.userId) : [];
        const projs = await learningPathRepo.getAllProjects();

        setProfile(prof);
        setSkills(sks);
        setPrereqs(prs);
        setEvidenceList(evs);
        setProjects(projs);

        // Build adaptive DAG-ordered path items
        const sortedSkills = SkillGraphService.getTopologicalSort(sks, prs);
        const verifiedSkillIds = new Set(
          evs.filter((e) => e.category === "VERIFIED" || e.category === "PROVEN").map((e) => e.skillId)
        );

        const items: LearningPathItem[] = sortedSkills.map((sk, index) => {
          const directPrereqs = prs.filter((p) => p.skillId === sk.id);
          const missing = directPrereqs
            .filter((p) => !verifiedSkillIds.has(p.prerequisiteSkillId))
            .map((p) => sks.find((s) => s.id === p.prerequisiteSkillId)?.name || p.prerequisiteSkillId);

          const isDemonstrated = verifiedSkillIds.has(sk.id);
          const prerequisitesMet = missing.length === 0;

          let status: "LOCKED" | "AVAILABLE" | "IN_PROGRESS" | "DEMONSTRATED" = "AVAILABLE";
          if (isDemonstrated) {
            status = "DEMONSTRATED";
          } else if (!prerequisitesMet) {
            status = "LOCKED";
          } else {
            status = "AVAILABLE";
          }

          const associatedEvidence = evs.filter((e) => e.skillId === sk.id);
          const evidenceSummary =
            associatedEvidence.length > 0
              ? `${associatedEvidence.length} record(s): ${associatedEvidence.map((e) => e.category).join(", ")}`
              : "No verified evidence recorded yet";

          return {
            id: `item-${sk.id}`,
            skillId: sk.id,
            order: index + 1,
            reasonRecommended: `Critical competency for ${prof?.targetRole || "Backend Engineer"} role.`,
            prerequisitesMet,
            missingPrerequisites: missing,
            supportingEvidenceSummary: evidenceSummary,
            recommendedActivity: isDemonstrated
              ? "Competence demonstrated in assessed context. Maintain via integration project."
              : prerequisitesMet
              ? "Complete calibration assessment and controlled modification challenge."
              : `Satisfy prerequisite: ${missing.join(", ")} first.`,
            estimatedEffortHours: sk.difficulty === "Fundamental" ? 4 : sk.difficulty === "Intermediate" ? 8 : 12,
            assessmentTypeRequired: "Controlled Modification + Transfer Task",
            status,
          };
        });

        setPathItems(items);
      } catch (err) {
        console.error("Failed to load learning path", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user, authProfile]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-500">Synthesizing adaptive DAG progression and project challenges...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            Role Progression: {profile?.targetRole}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="w-7 h-7 text-emerald-600" />
          <span>Adaptive Evidence-Based Learning Path</span>
        </h1>
        <p className="mt-1 text-sm text-slate-600 max-w-3xl">
          Progression sequenced strictly by DAG prerequisite validity and verified competence, rather than unevaluated self-claims.
        </p>
      </div>


      {/* Path Items Progression List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          <span>Sequenced Competency Milestones</span>
        </h2>

        <div className="space-y-3">
          {pathItems.map((item) => {
            const skill = skills.find((s) => s.id === item.skillId);
            const isDemonstrated = item.status === "DEMONSTRATED";
            const isLocked = item.status === "LOCKED";

            return (
              <Card
                key={item.id}
                className={`p-5 transition-all shadow-xs ${
                  isDemonstrated
                    ? "border-emerald-300 bg-emerald-50/40"
                    : isLocked
                    ? "border-slate-200 bg-slate-50/60 opacity-80"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isDemonstrated
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : isLocked
                          ? "bg-slate-200 text-slate-600"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      0{item.order}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{skill?.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{skill?.category}</span>
                        <span>•</span>
                        <span>{skill?.difficulty}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> ~{item.estimatedEffortHours} hrs deliberate practice
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isDemonstrated ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Competence Demonstrated</span>
                      </span>
                    ) : isLocked ? (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-semibold">
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Prerequisites Required</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>Ready to Assess</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Explanations & Evidence Context */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 text-xs font-sans">
                  <div>
                    <span className="text-slate-500 font-semibold block mb-0.5 font-mono text-[11px]">Why Recommended:</span>
                    <p className="text-slate-700 leading-relaxed">{item.reasonRecommended}</p>
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block mb-0.5 font-mono text-[11px]">Prerequisite Check:</span>
                    {item.prerequisitesMet ? (
                      <p className="text-emerald-700 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> All graph dependencies satisfied
                      </p>
                    ) : (
                      <p className="text-amber-800">
                        Missing: <span className="font-semibold">{item.missingPrerequisites.join(", ")}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-500 font-semibold block mb-0.5 font-mono text-[11px]">Recommended Action:</span>
                    <p className="text-slate-700 leading-relaxed">{item.recommendedActivity}</p>
                  </div>
                </div>

                {!isDemonstrated && !isLocked && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
                    <Link
                      href={`/assessment?skill=${item.skillId}`}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <span>Take Calibration Assessment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>

      {/* Real-World Systems Projects Section */}
      <div className="space-y-6 pt-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-sky-600" />
            <span>Recommended Real-World Systems Projects</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            End-to-end implementation challenges designed to validate transfer and independent synthesis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <Card key={proj.id} className="p-6 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors shadow-xs">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge type="neutral" value={proj.difficulty} size="sm" className="mb-2" />
                    <h3 className="text-base font-bold text-slate-900">{proj.title}</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-sans">{proj.description}</p>

                {/* Difficulty Heuristic Disclosure */}
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 font-sans">
                  <strong className="text-slate-800 font-mono">Difficulty Heuristic:</strong> {proj.difficultyHeuristicNote}
                </div>

                {/* Milestones */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                    Implementation Milestones:
                  </span>
                  {proj.milestones.map((m) => (
                    <div key={m.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                      <span className="font-semibold text-slate-900">{m.title}</span>
                      <p className="text-[11px] text-slate-600">{m.description}</p>
                    </div>
                  ))}
                </div>

                {/* AI Rules */}
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1">
                  <span className="font-semibold text-blue-900 block">AI Assistance Rules:</span>
                  <p className="text-slate-700 text-[11px] font-sans">{proj.aiAssistanceRules}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Assessment: {proj.assessmentMethod}</span>
                <Link
                  href="/mentor"
                  className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 font-sans"
                >
                  <span>Discuss with Nexus</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
