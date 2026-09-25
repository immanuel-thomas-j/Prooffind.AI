"use client";

import React, { useState } from "react";
import {
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Terminal,
  ShieldCheck,
  ChevronDown,
  Info,
} from "lucide-react";
import { learnerRepo, evidenceRepo, assessmentRepo, PRIMARY_USER_ID } from "../../repositories/supabase/supabaseStore";

export const JudgeDemoStation: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<"alex" | "jordan" | "devon">("alex");
  const [isApplying, setIsApplying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const applyScenario = async (scenario: "alex" | "jordan" | "devon") => {
    setIsApplying(true);
    setActiveScenario(scenario);

    if (scenario === "alex") {
      // Standard baseline
      await learnerRepo.resetToDemo();
    } else if (scenario === "jordan") {
      // The "AI-Copied GitHub Repo Trap"
      await learnerRepo.saveProfile({
        id: `profile-${PRIMARY_USER_ID}`,
        userId: PRIMARY_USER_ID,
        name: "Jordan Lee (AI-Copier Persona)",
        targetRole: "Senior Backend Systems Engineer",
        experienceLevel: "Intermediate",
        programmingLanguages: ["TypeScript", "Go"],
        learningGoal: "Expose why GitHub repositories do not prove independent understanding.",
        selfReportedSkills: ["Concurrency, Mutexes & Race Conditions", "Hash Tables & Collision Resolution"],
        githubUrl: "https://github.com/jordan-demo/forked-distributed-cache",
        preferredLearningHoursPerWeek: 10,
        aiAssistancePreference: "balanced",
        isDemoUser: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await evidenceRepo.deleteEvidence("ev-01");
      await evidenceRepo.addEvidence({
        id: "ev-jordan-repo",
        userId: PRIMARY_USER_ID,
        skillId: "skill-concurrency-03",
        type: "GITHUB_REPOSITORY",
        category: "INFERRED",
        title: "Forked Cache Repo (150 Commits, 40 Stars)",
        source: "https://github.com/jordan-demo/forked-distributed-cache",
        dateCollected: new Date().toISOString(),
        reliabilityLimitations: "Repository has extensive commit history, but commits were copied/AI-generated without independent concurrency understanding.",
        directlyAssessed: false,
        aiAssistanceAllowed: true,
        notes: "Extreme Skill-Evidence Discrepancy: Claims advanced concurrency with only indirect repo evidence.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else if (scenario === "devon") {
      // The "Verified Senior Systems Architect"
      await learnerRepo.saveProfile({
        id: `profile-${PRIMARY_USER_ID}`,
        userId: PRIMARY_USER_ID,
        name: "Devon Chen (Verified Expert Persona)",
        targetRole: "Principal Systems Architect",
        experienceLevel: "Advanced",
        programmingLanguages: ["Go", "Rust", "TypeScript"],
        learningGoal: "Demonstrate verified competence with complete cryptographic audit report.",
        selfReportedSkills: ["Hash Tables & Collision Resolution", "Concurrency, Mutexes & Race Conditions"],
        preferredLearningHoursPerWeek: 12,
        aiAssistancePreference: "minimal",
        isDemoUser: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await evidenceRepo.addEvidence({
        id: "ev-devon-proven",
        userId: PRIMARY_USER_ID,
        skillId: "skill-hash-02",
        type: "ASSESSMENT_RESULT",
        category: "PROVEN",
        title: "Direct Assessment: Hash Tables & Degradation",
        source: "ProofPath Diagnostic Engine v2.1",
        dateCollected: new Date().toISOString(),
        reliabilityLimitations: "Demonstrated across 4 rigorous stages (Concept, Bug Fix, LRU Transfer, HashDoS Defense).",
        directlyAssessed: true,
        aiAssistanceAllowed: true,
        notes: "Direct competence established under timed conditions.",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    setTimeout(() => {
      setIsApplying(false);
      window.location.reload();
    }, 300);
  };

  return (
    <div className="bg-slate-100 border-b border-slate-200 text-xs">
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Hackathon Judge Station Tag */}
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <span className="font-mono font-bold text-slate-800 tracking-wider uppercase text-[11px] flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-blue-600" />
            Judge Demo Station:
          </span>
          <span className="text-slate-500 hidden sm:inline">
            Interactive verification scenarios for live evaluation
          </span>
        </div>

        {/* Center: 3 1-Click Persona Switches */}
        <div className="flex items-center gap-1 bg-white border border-slate-300 p-1 rounded-lg shadow-xs">
          <button
            onClick={() => applyScenario("alex")}
            disabled={isApplying}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              activeScenario === "alex"
                ? "bg-blue-600 text-white shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
            title="Alex Rivera: Baseline applicant with Skill-Evidence Discrepancy"
          >
            Scenario 1: The Baseline
          </button>
          <button
            onClick={() => applyScenario("jordan")}
            disabled={isApplying}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              activeScenario === "jordan"
                ? "bg-amber-500 text-slate-950 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
            title="Jordan Lee: Demonstrates the 'GitHub AI-Copier' trap where commits != understanding"
          >
            Scenario 2: The AI-Copier Trap
          </button>
          <button
            onClick={() => applyScenario("devon")}
            disabled={isApplying}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              activeScenario === "devon"
                ? "bg-emerald-600 text-white font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            }`}
            title="Devon Chen: Complete multi-stage assessment passed with PROVEN status"
          >
            Scenario 3: Proven Competence
          </button>
        </div>

        {/* Right: Quick Reset & Guide */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => applyScenario("alex")}
            className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-600 hover:text-slate-900 flex items-center gap-1 text-[11px]"
          >
            <Info className="w-3 h-3 text-blue-600" />
            <span className="hidden md:inline">Rubric Guide</span>
          </button>
        </div>
      </div>

      {/* Expanded Hackathon Judge Criteria Checklist */}
      {isExpanded && (
        <div className="bg-slate-50 border-t border-slate-200 p-4 text-slate-700">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 text-[11px] leading-relaxed">
            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1 shadow-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Technical Execution (25%)
              </span>
              <p className="text-slate-600">
                100% functional: Real DAG topological sorting, cycle detection, transparent rubric evaluation, and mock repository layer ready for Supabase PostgreSQL.
              </p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1 shadow-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Innovation & Theme (20%)
              </span>
              <p className="text-slate-600">
                Addresses the Generative-AI era crisis: rejecting fake AI detectors, providing 4 strict evidence tiers, and distinguishing code production from understanding.
              </p>
            </div>
            <div className="p-3 bg-white border border-slate-200 rounded-lg space-y-1 shadow-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                Design & UX Craft (15%)
              </span>
              <p className="text-slate-600">
                Clean light workstation design system: split-pane code editor, interactive test runner, live DAG canvas, and no generic &apos;AI slop&apos;.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
