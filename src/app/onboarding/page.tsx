"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowRight,
  Code2,
  Check,
  AlertCircle,
  User,
  Target,
  Briefcase,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { learnerRepo, skillRepo, evidenceRepo } from "../../repositories/supabase/supabaseStore";
import { Skill, EvidenceItem } from "../../domain/types";
import { OnboardingFormSchema } from "../../domain/schemas";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/ui/Badge";
import { ClaimsCalibrationRadar } from "../../components/telemetry/ClaimsCalibrationRadar";

const AVAILABLE_LANGUAGES = ["TypeScript", "JavaScript", "Go", "Python", "Rust", "Java", "C++", "SQL"];
const SUGGESTED_SKILLS = [
  "Core Data Structures & Memory Layouts",
  "Hash Tables & Collision Resolution",
  "Concurrency, Mutexes & Race Conditions",
  "Distributed Caching & Invalidation",
  "REST API Contracts & Idempotency",
  "Database Indexing & Query Execution Plans",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, profile, isLoggedIn, isLoading, logout, refreshProfile } = useAuth();

  const [skills, setSkills] = useState<Skill[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    targetRole: "",
    learningGoal: "",
    experienceLevel: "Intermediate" as "Beginner" | "Intermediate" | "Advanced",
    programmingLanguages: [] as string[],
    selfReportedSkills: [] as string[],
    githubUrl: "",
    codingProfileUrl: "",
    preferredLearningHoursPerWeek: 10,
    aiAssistancePreference: "balanced" as "proactive" | "balanced" | "minimal",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (user?.name && !formData.name) {
      setFormData((prev) => ({ ...prev, name: user.name }));
    }
  }, [user]);

  // Load skills and user evidence when logged in
  React.useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [allSkills, userEv] = await Promise.all([
          skillRepo.getAllSkills(),
          evidenceRepo.getEvidenceForUser(user.id),
        ]);
        setSkills(allSkills);
        setEvidenceList(userEv);
      } catch (err) {
        console.error("Failed to load skills/evidence for calibration", err);
      }
    }
    loadData();
  }, [user]);

  // Populate form with existing profile when editing
  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        targetRole: profile.targetRole,
        learningGoal: profile.learningGoal,
        experienceLevel: profile.experienceLevel,
        programmingLanguages: profile.programmingLanguages || [],
        selfReportedSkills: profile.selfReportedSkills || [],
        githubUrl: profile.githubUrl || "",
        codingProfileUrl: profile.codingProfileUrl || "",
        preferredLearningHoursPerWeek: profile.preferredLearningHoursPerWeek || 10,
        aiAssistancePreference: profile.aiAssistancePreference || "balanced",
      });
    }
  }, [profile]);

  // If user is already logged in with an active profile and not in edit mode, show rich calibration suite
  if (!isLoading && isLoggedIn && profile && !isEditing) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Pipeline Breadcrumb Navigation (from reference design) */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono">
            <Link href="/" className="text-slate-500 hover:text-slate-900 transition-colors">
              Welcome
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/mentor" className="text-slate-500 hover:text-slate-900 transition-colors">
              Interview
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/evidence" className="text-slate-500 hover:text-slate-900 transition-colors">
              Evidence
            </Link>
            <span className="text-slate-300">/</span>
            <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-semibold flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Your profile
            </span>
            <span className="text-slate-300">/</span>
            <Link href="/assessment" className="text-slate-500 hover:text-slate-900 transition-colors">
              Calibration
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/path" className="text-slate-500 hover:text-slate-900 transition-colors">
              Roadmap
            </Link>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 border border-blue-200 px-3.5 py-1.5 rounded-xl transition-colors"
          >
            Edit Self-Reported Claims
          </button>
        </div>

        {/* Hero Section: Claims vs Evidence vs Requirement Radar + Evidence Tiers + Skills Gap & Good Skills */}
        <ClaimsCalibrationRadar
          profile={profile}
          skills={skills}
          evidenceList={evidenceList}
          onEditProfile={() => setIsEditing(true)}
        />

        {/* Profile Card & Session Actions */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900">{profile.name}</span>
              <Badge type="neutral" value={profile.experienceLevel} size="sm" />
              <span className="text-xs text-slate-500 font-mono">({profile.targetRole})</span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Goal: {profile.learningGoal}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleToggleLang = (lang: string) => {
    setFormData((prev) => {
      const exists = prev.programmingLanguages.includes(lang);
      return {
        ...prev,
        programmingLanguages: exists
          ? prev.programmingLanguages.filter((l) => l !== lang)
          : [...prev.programmingLanguages, lang],
      };
    });
  };

  const handleToggleSkill = (skill: string) => {
    setFormData((prev) => {
      const exists = prev.selfReportedSkills.includes(skill);
      return {
        ...prev,
        selfReportedSkills: exists
          ? prev.selfReportedSkills.filter((s) => s !== skill)
          : [...prev.selfReportedSkills, skill],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = OnboardingFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const activeUserId = user?.id || `user-${Date.now()}`;

      await learnerRepo.saveProfile({
        id: `profile-${activeUserId}`,
        userId: activeUserId,
        name: formData.name,
        targetRole: formData.targetRole,
        learningGoal: formData.learningGoal,
        experienceLevel: formData.experienceLevel,
        programmingLanguages: formData.programmingLanguages,
        selfReportedSkills: formData.selfReportedSkills,
        githubUrl: formData.githubUrl || undefined,
        codingProfileUrl: formData.codingProfileUrl || undefined,
        preferredLearningHoursPerWeek: formData.preferredLearningHoursPerWeek,
        aiAssistancePreference: formData.aiAssistancePreference,
        isDemoUser: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await refreshProfile();
      if (profile) {
        setIsEditing(false);
      } else {
        router.push("/dashboard");
      }
    } catch {
      setErrors({ form: "Failed to initialize profile in Supabase. Please verify connection." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Top Heading */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="font-mono text-xs font-bold text-blue-700 uppercase tracking-wider block">
            {profile ? "Profile & Claims Management" : "Step 1 of Verification Journey"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {profile ? "Edit Self-Reported Claims" : "Create Your Learner Profile"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            {profile
              ? "Update your claimed skills and goals. Your calibration radar will recalculate in real-time."
              : "Declare your target role and initial competency claims. You will prove them next with direct verification challenges."}
          </p>
        </div>

        {profile && (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        {errors.form && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errors.form}</span>
          </div>
        )}

        {/* Section 1: Identity & Target Role */}
        <div className="space-y-4">
          <h2 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-blue-600" />
            <span>1. Candidate Overview</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="full-name" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="full-name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Immanuel Thomas J"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[44px]"
              />
              {errors.name && <p className="mt-1 text-xs text-rose-600 font-mono">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="target-role" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Role <span className="text-rose-500">*</span>
              </label>
              <input
                id="target-role"
                type="text"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[44px]"
              />
              {errors.targetRole && <p className="mt-1 text-xs text-rose-600 font-mono">{errors.targetRole}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="learning-goal" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Core Systems Objective <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="learning-goal"
              rows={2}
              value={formData.learningGoal}
              onChange={(e) => setFormData({ ...formData, learningGoal: e.target.value })}
              placeholder="What specific systems competencies are you looking to prove?"
              className="w-full bg-white border border-slate-300 rounded-xl p-3.5 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
            {errors.learningGoal && <p className="mt-1 text-xs text-rose-600 font-mono">{errors.learningGoal}</p>}
          </div>
        </div>

        {/* Section 2: Experience & Core Stacks */}
        <div className="space-y-4 pt-2">
          <h2 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-blue-600" />
            <span>2. Technical Level & Stacks</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-1.5">
                Current Systems Level
              </span>
              <div className="grid grid-cols-3 gap-2">
                {(["Beginner", "Intermediate", "Advanced"] as const).map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setFormData({ ...formData, experienceLevel: lvl })}
                    className={`py-2 text-xs font-mono font-medium rounded-xl border transition-all min-h-[44px] flex items-center justify-center shadow-xs ${
                      formData.experienceLevel === lvl
                        ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="learning-hours" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Practice Hours per Week ({formData.preferredLearningHoursPerWeek} hrs)
              </label>
              <input
                id="learning-hours"
                type="range"
                min={2}
                max={40}
                step={2}
                value={formData.preferredLearningHoursPerWeek}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferredLearningHoursPerWeek: Number(e.target.value),
                  })
                }
                className="w-full accent-blue-600 bg-slate-200 rounded-lg cursor-pointer h-2.5 mt-3"
              />
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-700 mb-1.5">
              Primary Programming Languages <span className="text-rose-500">*</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_LANGUAGES.map((lang) => {
                const selected = formData.programmingLanguages.includes(lang);
                return (
                  <button
                    type="button"
                    key={lang}
                    onClick={() => handleToggleLang(lang)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono rounded-xl border transition-all min-h-[38px] shadow-xs ${
                      selected
                        ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    <span>{lang}</span>
                  </button>
                );
              })}
            </div>
            {errors.programmingLanguages && (
              <p className="mt-1 text-xs text-rose-600 font-mono">{errors.programmingLanguages}</p>
            )}
          </div>
        </div>

        {/* Section 3: Initial Competency Claims */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-blue-600" />
              <span>3. Initial Claimed Skills</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-500">
              Categorized as &apos;CLAIMED&apos; until tested
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {SUGGESTED_SKILLS.map((sk) => {
              const selected = formData.selfReportedSkills.includes(sk);
              return (
                <button
                  type="button"
                  key={sk}
                  onClick={() => handleToggleSkill(sk)}
                  className={`text-left p-3.5 rounded-xl border text-xs transition-all flex items-start gap-3 min-h-[48px] shadow-xs ${
                    selected
                      ? "bg-blue-50/60 border-blue-300 text-slate-900 font-medium"
                      : "bg-slate-50/60 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  <div
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      selected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                    }`}
                  >
                    {selected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="leading-snug">{sk}</span>
                </button>
              );
            })}
          </div>
          {errors.selfReportedSkills && (
            <p className="mt-1 text-xs text-rose-600 font-mono">{errors.selfReportedSkills}</p>
          )}
        </div>

        {/* Section 4: Skippable External Profiles */}
        <div className="space-y-4 pt-2">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-sky-600" />
              <span>4. Optional Indirect Signals (Skippable)</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Repos and profiles will be categorized as INFERRED in Supabase. They are never marked PROVEN automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="github-url" className="block text-xs font-semibold text-slate-700 mb-1.5">
                GitHub Repository URL
              </label>
              <input
                id="github-url"
                type="url"
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                placeholder="https://github.com/username/repo"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-base sm:text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[44px]"
              />
              {errors.githubUrl && <p className="mt-1 text-xs text-rose-600 font-mono">{errors.githubUrl}</p>}
            </div>

            <div>
              <label htmlFor="coding-url" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Coding Platform Profile (e.g. LeetCode)
              </label>
              <input
                id="coding-url"
                type="url"
                value={formData.codingProfileUrl}
                onChange={(e) => setFormData({ ...formData, codingProfileUrl: e.target.value })}
                placeholder="https://leetcode.com/username"
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-base sm:text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[44px]"
              />
              {errors.codingProfileUrl && (
                <p className="mt-1 text-xs text-rose-600 font-mono">{errors.codingProfileUrl}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button
            type="submit"
            isLoading={isSubmitting}
            variant="primary"
            size="md"
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs min-h-[44px]"
          >
            <span>Complete Setup & Enter Dashboard</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </form>
    </div>
  );
}
