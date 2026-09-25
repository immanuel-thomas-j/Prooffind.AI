"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Bot,
  Layers,
} from "lucide-react";
import { assessmentRepo, skillRepo } from "../../repositories/supabase/supabaseStore";
import { Assessment, Skill } from "../../domain/types";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { AuthGuard } from "../../components/auth/AuthGuard";

export default function AssessmentListPage() {
  return (
    <AuthGuard
      fallbackTitle="Competence Assessments Locked"
      fallbackDescription="Sign in to challenge multi-stage structured assessments, code remediation sandbox, and oral explanation audits."
    >
      <AssessmentListContent />
    </AuthGuard>
  );
}

function AssessmentListContent() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const assList = await assessmentRepo.getAllAssessments();
        const sks = await skillRepo.getAllSkills();
        setAssessments(assList);
        setSkills(sks);
      } catch (err) {
        console.error("Failed to load assessments", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-mono">Loading structured competence assessments...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Subtitle (Matching Image 2) */}
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <FileCheck2 className="w-7 h-7 text-blue-600 flex-shrink-0" />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Competence Assessment Challenges
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-9">
          Structured 4-stage evaluations: Concept explanation, controlled code modification, novel transfer, and reasoning defense.
        </p>
      </div>



      {/* Assessment Challenge Cards Grid (Matching Image 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assessments.map((a) => {
          const associatedSkill = skills.find((s) => s.id === a.skillId);
          const categoryName = associatedSkill?.category?.toUpperCase() || "COMPUTER SCIENCE";
          const isAiDisclosure = a.allowedConditions === "AI_DISCLOSURE_REQUIRED";

          return (
            <div
              key={a.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs space-y-5"
            >
              <div className="space-y-4">
                {/* Header Row: Category on left, Condition Badge on right */}
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] font-bold text-blue-700 tracking-wider uppercase">
                    {categoryName}
                  </span>

                  {isAiDisclosure ? (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>AI Disclosure Required</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                      <Lock className="w-3 h-3 text-rose-600" />
                      <span>AI Restricted Mode</span>
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
                    {a.title}
                  </h2>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed font-sans">
                    {a.description}
                  </p>
                </div>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Est. {a.timeLimitMinutes} minutes</span>
                  </div>
                  <span>•</span>
                  <span>4 Interactive Stages</span>
                  <span>•</span>
                  <span>Version {a.version}</span>
                </div>

                {/* Stages Included Inner Panel (Matching Image 2) */}
                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 space-y-2.5">
                  <span className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    STAGES INCLUDED:
                  </span>
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-700 font-sans">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>Concept Explanation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>Code Modification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>Novel Transfer Task</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                      <span>Follow-up Reasoning</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Bar (Matching Image 2) */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
                <div className="text-xs text-slate-600">
                  Target Skill: <strong className="text-slate-900 font-semibold">{associatedSkill?.name || "Target System"}</strong>
                </div>

                <Link
                  href={`/assessment/${a.id}`}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all hover:scale-[1.01]"
                >
                  <span>Enter Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
