"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  FolderGit2,
  FileCheck2,
  Bot,
  Activity,
} from "lucide-react";
import {
  learnerRepo,
  skillRepo,
  evidenceRepo,
  assessmentRepo,
} from "../../repositories/supabase/supabaseStore";
import {
  LearnerProfile,
  Skill,
  EvidenceItem,
  SkillAnalysisSummary,
  AssessmentResult,
} from "../../domain/types";
import { EvidenceService } from "../../services/evidenceService";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { AuthGuard } from "../../components/auth/AuthGuard";
import { ClaimsCalibrationRadar } from "../../components/telemetry/ClaimsCalibrationRadar";

export default function DashboardPage() {
  return (
    <AuthGuard
      fallbackTitle="Candidate Dashboard Locked"
      fallbackDescription="Sign in to view your verified competence telemetry, DAG progression, and skill discrepancy calibration records."
    >
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [analyses, setAnalyses] = useState<SkillAnalysisSummary[]>([]);
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        let prof = authProfile;
        if (!prof) {
          prof = await learnerRepo.getProfile(user.id);
        }
        
        const sks = await skillRepo.getAllSkills();
        const evs = prof ? await evidenceRepo.getEvidenceForUser(prof.userId) : [];
        const resList = prof ? await assessmentRepo.getResultsForUser(prof.userId) : [];

        setProfile(prof);
        setSkills(sks);
        setEvidenceList(evs);
        setResults(resList);

        if (sks.length > 0) {
          const calculated = EvidenceService.analyzeSkills(sks, prof?.selfReportedSkills || [], evs);
          setAnalyses(calculated);
        }
      } catch (err) {
        console.error("Failed to load dashboard data from Supabase", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, authProfile]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-slate-500">Loading candidate competence telemetry from Supabase...</p>
      </div>
    );
  }

  const claimedCount = analyses.filter((a) => a.highestCategory === "CLAIMED").length;
  const inferredCount = analyses.filter((a) => a.highestCategory === "INFERRED").length;
  const verifiedCount = analyses.filter((a) => a.highestCategory === "VERIFIED").length;
  const provenCount = analyses.filter((a) => a.highestCategory === "PROVEN").length;

  const discrepancies = analyses.filter((a) => a.hasDiscrepancy);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {!profile && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Declare Your Learner Profile</h2>
            <p className="text-xs text-slate-600 mt-0.5">
              You haven&apos;t declared your target role and initial claimed competencies in Supabase yet.
            </p>
          </div>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors whitespace-nowrap min-h-[38px]"
          >
            <span>Complete Setup in Onboarding</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Profile Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {profile?.name || user?.name || "Candidate Profile"}
            </h1>
            <Badge type="neutral" value={profile?.experienceLevel || "Intermediate"} size="sm" />
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-medium">
            Target Role: <span className="text-slate-900 font-semibold">{profile?.targetRole || "Systems Engineer"}</span>
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {profile?.learningGoal || "Validate genuine concurrency and data structure competence."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 font-mono text-xs">
          <Link
            href="/assessment"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition-colors min-h-[38px]"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Take Assessment</span>
          </Link>
          <Link
            href="/mentor"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold border border-slate-300 shadow-xs transition-colors min-h-[38px]"
          >
            <Bot className="w-3.5 h-3.5 text-blue-600" />
            <span>Consult Nexus</span>
          </Link>
        </div>
      </div>

      {/* 4 Evidence Tier Telemetry Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-1 font-mono text-[11px]">
            <span className="font-semibold text-slate-500 uppercase">CLAIMED</span>
            <Badge type="category" value="CLAIMED" size="sm" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900">{claimedCount}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-sans">Self-reported claims</p>
        </div>

        <div className="bg-white border border-sky-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-1 font-mono text-[11px]">
            <span className="font-semibold text-sky-700 uppercase">INFERRED</span>
            <Badge type="category" value="INFERRED" size="sm" />
          </div>
          <p className="text-2xl font-bold font-mono text-sky-700">{inferredCount}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-sans">Indirect repos & stats</p>
        </div>

        <div className="bg-white border border-amber-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-1 font-mono text-[11px]">
            <span className="font-semibold text-amber-700 uppercase">VERIFIED</span>
            <Badge type="category" value="VERIFIED" size="sm" />
          </div>
          <p className="text-2xl font-bold font-mono text-amber-700">{verifiedCount}</p>
          <p className="text-[11px] text-slate-500 mt-1 font-sans">Controlled modifications</p>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-300 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between mb-1 font-mono text-[11px]">
            <span className="font-semibold text-emerald-800 uppercase">PROVEN</span>
            <Badge type="category" value="PROVEN" size="sm" />
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-800">{provenCount}</p>
          <p className="text-[11px] text-slate-600 mt-1 font-sans">Directly evaluated & transferred</p>
        </div>
      </div>

      {/* Claims vs Evidence vs Requirement Radar & Gaps Calibration */}
      <ClaimsCalibrationRadar
        profile={profile}
        skills={skills}
        evidenceList={evidenceList}
      />

      {/* Main Grid: Competence Matrix & Quick Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Competence Matrix */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <span>Competency Telemetry Matrix</span>
            </h2>
            <Link
              href="/skills"
              className="text-xs font-mono text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              <span>Inspect DAG Hierarchy</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {analyses.map((item) => (
              <div
                key={item.skillId}
                className="bg-white border border-slate-200 p-4 rounded-xl hover:border-slate-300 transition-colors space-y-3 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.skillName}</h3>
                    <div className="flex items-center gap-2 mt-0.5 font-mono text-[11px] text-slate-500">
                      <span>{item.category}</span>
                      <span>•</span>
                      <span>{item.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge type="category" value={item.highestCategory} size="sm" />
                    <Badge type="status" value={item.competenceStatus} size="sm" />
                  </div>
                </div>

                <div className="text-xs space-y-1 font-sans">
                  <p className="text-slate-700">
                    <strong className="text-slate-900 font-mono text-[11px]">Observed Evidence:</strong> {item.confidenceExplanation}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    <strong className="text-slate-600 font-mono">Documented Limitation:</strong> {item.limitations}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500 text-[11px]">Next: {item.recommendedNextAction}</span>
                  <Link
                    href={`/assessment?skill=${item.skillId}`}
                    className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1"
                  >
                    <span>Assess</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Adaptive Learning Path & Evidence Records */}
        <div className="space-y-5">
          {/* Quick Learning Path Action */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Next on Learning Path</span>
              </h3>
              <Link href="/path" className="text-xs font-mono text-blue-600 hover:underline">
                Full DAG
              </Link>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Based on verified data structures prerequisites and intermediate concurrency goals:
            </p>
            <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-xl space-y-2 font-mono text-xs">
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                Priority 1 — Unblocked
              </span>
              <h4 className="font-bold text-slate-900 font-sans text-xs">
                Hash Tables & Collision Resolution
              </h4>
              <p className="text-[11px] text-slate-600 font-sans">
                Prerequisites met. Resolves discrepancy on public repo claim.
              </p>
              <Link
                href="/assessment/assess-hash-01"
                className="mt-2 block w-full py-2 text-center text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-sans shadow-xs min-h-[38px]"
              >
                Launch Assessment
              </Link>
            </div>
          </div>

          {/* Evidence Vault Quick Access */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <FolderGit2 className="w-4 h-4 text-blue-600" />
                <span>Evidence Records ({evidenceList.length})</span>
              </h3>
              <Link href="/evidence" className="text-xs font-mono text-blue-600 hover:underline">
                Vault
              </Link>
            </div>
            <div className="space-y-2">
              {evidenceList.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-2">No evidence items in vault yet.</p>
              ) : (
                evidenceList.slice(0, 3).map((ev) => (
                  <div key={ev.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900 truncate max-w-[150px] font-sans">{ev.title}</span>
                      <Badge type="category" value={ev.category} size="sm" />
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-1 truncate">{ev.source}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Socratic Mentor Card */}
          <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 border border-blue-200 p-5 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-mono font-bold text-slate-900 uppercase tracking-wider">Nexus Socratic Engine</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Probe concurrency trade-offs, explore hash table failure modes, or review assessment rubrics.
            </p>
            <Link
              href="/mentor"
              className="inline-flex items-center justify-center w-full py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 rounded-lg border border-slate-300 shadow-xs transition-colors font-mono min-h-[38px]"
            >
              Open Mentor Chat
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
