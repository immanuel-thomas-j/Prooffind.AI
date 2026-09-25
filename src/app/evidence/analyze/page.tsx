"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderGit2,
  GitBranch,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Bot,
  ExternalLink,
  Scale,
  Code2,
  FileCode2,
  Download,
  Check,
  Search,
  Activity,
  Layers,
  HelpCircle,
  User,
  Star,
  GitCommit,
  MapPin,
  ChevronRight,
  Award,
  Globe,
  FileText,
  Puzzle,
} from "lucide-react";
import {
  RepoAnalysisService,
  RepoAnalysisResult,
  CandidateProfile,
  ExternalPortfolioSignal,
} from "../../../services/repoAnalysisService";
import { evidenceRepo } from "../../../repositories/supabase/supabaseStore";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { useAuth } from "../../../context/AuthContext";
import { AuthGuard } from "../../../components/auth/AuthGuard";

const PRESET_CANDIDATES = [
  {
    username: "immanuel-thomas-j",
    label: "Immanuel Thomas J",
    role: "Software Engineer & Creator of OpenForge",
    badge: "Primary Candidate Profile",
    color: "blue",
  },
];

export default function RepoAnalysisPage() {
  return (
    <AuthGuard
      fallbackTitle="Portfolio Analyzer Locked"
      fallbackDescription="Sign in to run safe static repository AST inspections and import multimodal portfolio signals."
    >
      <RepoAnalysisContent />
    </AuthGuard>
  );
}

function RepoAnalysisContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [profileInput, setProfileInput] = useState("immanuel-thomas-j");
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [activeSignalTab, setActiveSignalTab] = useState<"ALL" | "GITHUB" | "LEETCODE" | "CERTIFICATION" | "PORTFOLIO" | "RESUME">("ALL");
  const [selectedRepoUrl, setSelectedRepoUrl] = useState<string>("https://github.com/immanuel-thomas-j/openforge");
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [report, setReport] = useState<RepoAnalysisResult | null>(null);
  const [imported, setImported] = useState(false);

  useEffect(() => {
    loadProfile("immanuel-thomas-j");
  }, []);

  const loadProfile = async (input: string) => {
    setIsLoadingProfile(true);
    try {
      const prof = await RepoAnalysisService.getCandidateProfile(input);
      setCandidateProfile(prof);
      if (prof.repositories.length > 0) {
        setSelectedRepoUrl(prof.repositories[0].repoUrl);
        runRepoScan(prof.repositories[0].repoUrl);
      }
    } catch (err) {
      console.error("Failed to load candidate profile", err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileInput.trim()) return;
    loadProfile(profileInput.trim());
  };

  const runRepoScan = async (url: string) => {
    setSelectedRepoUrl(url);
    setIsScanning(true);
    setReport(null);
    setImported(false);

    setScanStep("Cloning AST & parsing repository tree...");
    setTimeout(() => {
      setScanStep("Scanning GitHub, LeetCode & Certification signals with Groq LLM...");
    }, 300);
    setTimeout(() => {
      setScanStep("Evaluating commit telemetry & AI prompt generation likelihood...");
    }, 600);

    try {
      const result = await RepoAnalysisService.analyzeRepository(url);
      setReport(result);
    } catch (err) {
      console.error("Scan error", err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleImportToVault = async () => {
    if (!report || !candidateProfile || !user) return;
    const activeUserId = user.id;
    
    // Import repo AST extracted items
    for (const item of report.extractedEvidence) {
      await evidenceRepo.addEvidence({
        id: `ev-repo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId: activeUserId,
        skillId: item.skillId,
        type: item.type,
        category: item.category,
        title: item.title,
        source: item.source,
        dateCollected: new Date().toISOString(),
        reliabilityLimitations: item.reliabilityLimitations,
        directlyAssessed: item.directlyAssessed,
        aiAssistanceAllowed: true,
        notes: `Imported via ProofPath Portfolio Analyzer for ${candidateProfile.displayName} (${report.name})`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Import external signals (LeetCode, Certificates, Resume claims)
    if (candidateProfile.externalSignals) {
      for (const sig of candidateProfile.externalSignals) {
        await evidenceRepo.addEvidence({
          id: `ev-sig-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          userId: activeUserId,
          skillId: "skill-hash-02",
          type:
            sig.type === "RESUME_CLAIM"
              ? "RESUME_CLAIM"
              : sig.type === "LEETCODE"
              ? "CODING_PLATFORM_PROFILE"
              : "PROJECT_DESCRIPTION",
          category: sig.category,
          title: sig.title,
          source: sig.sourceUrl || candidateProfile.profileUrl,
          dateCollected: new Date().toISOString(),
          reliabilityLimitations: sig.proofLimitation,
          directlyAssessed: false,
          aiAssistanceAllowed: true,
          notes: `${sig.type} Signal: ${sig.description}. Metrics: ${sig.metrics || 'N/A'}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    setImported(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-mono text-xs font-bold text-blue-700 uppercase tracking-wider">
            Multimodal Portfolio Ingestion
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-xs font-mono text-slate-500">Signal Reality Engine</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <FolderGit2 className="w-8 h-8 text-blue-600" />
              <span>Multimodal Profile & Portfolio Evidence Analyzer</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-3xl leading-relaxed">
              Analyzes a candidate&apos;s complete online footprint: <strong>GitHub Repositories</strong>, <strong>LeetCode Profiles</strong>, <strong>Certifications</strong>, <strong>Deployments</strong>, and <strong>Resume Claims</strong>.
              ProofPath strictly quarantines all external signals as <code className="bg-slate-100 text-blue-700 px-1 py-0.5 rounded font-mono font-bold">INFERRED</code> or <code className="bg-slate-100 text-amber-800 px-1 py-0.5 rounded font-mono font-bold">CLAIMED</code> until verified in task calibration.
            </p>
          </div>

          <Link
            href="/evidence"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl transition-colors self-start md:self-auto"
          >
            <span>View Evidence Vault</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Profile Search & Featured Persona Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
            Candidate Handle or GitHub Profile:
          </label>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={profileInput}
                onChange={(e) => setProfileInput(e.target.value)}
                placeholder="Enter GitHub handle (e.g. immanuel-thomas-j, alex-rivera, jordan-demo)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:outline-none transition-colors font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isLoadingProfile}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>{isLoadingProfile ? "Fetching..." : "Analyze Candidate Portfolio"}</span>
            </button>
          </div>
        </form>

        {/* Featured Persona Selection */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center gap-2.5 text-xs">
          <span className="font-mono text-slate-500 font-medium shrink-0">Featured Candidates:</span>
          <div className="flex flex-wrap gap-2">
            {PRESET_CANDIDATES.map((cand) => {
              const active = candidateProfile?.username === cand.username;
              return (
                <button
                  type="button"
                  key={cand.username}
                  onClick={() => {
                    setProfileInput(cand.username);
                    loadProfile(cand.username);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs transition-colors ${
                    active
                      ? "bg-blue-600 border-blue-600 text-white font-semibold shadow-xs"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="font-medium">{cand.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${active ? "bg-blue-700 text-blue-100" : "bg-slate-100 text-slate-600"}`}>
                    {cand.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Candidate Profile Summary Header */}
      {candidateProfile && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-start sm:items-center gap-4">
              <img
                src={candidateProfile.avatarUrl}
                alt={candidateProfile.displayName}
                className="w-16 h-16 rounded-2xl border-2 border-blue-600/30 object-cover shadow-xs shrink-0"
              />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{candidateProfile.displayName}</h2>
                  <a
                    href={candidateProfile.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono text-blue-700 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <span>@{candidateProfile.username}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  {candidateProfile.username === "immanuel-thomas-j" && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-[10px] font-mono font-bold">
                      VERIFIED CANDIDATE DEMO
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  {candidateProfile.bio}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{candidateProfile.location}</span>
                  </span>
                  <span>•</span>
                  <span>{candidateProfile.publicReposCount} Public Repos</span>
                  <span>•</span>
                  <span>{candidateProfile.totalCommits}+ Analyzed Commits</span>
                  <span>•</span>
                  <span className="text-blue-700 font-semibold">{candidateProfile.externalSignals?.length || 5} External Portfolio Signals</span>
                </div>
              </div>
            </div>

            {/* Profile AI Assistance Risk Badge */}
            <div className="flex flex-col sm:items-end gap-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 shrink-0">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                Portfolio AI Assistance Signal
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-full ${
                    candidateProfile.overallAiAssistanceSignal === "HIGH"
                      ? "bg-rose-500 animate-pulse"
                      : candidateProfile.overallAiAssistanceSignal === "MODERATE"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                />
                <span className="text-xs font-bold text-slate-900">
                  {candidateProfile.overallAiAssistanceSignal} LLM PROMPT SUSCEPTIBILITY
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                Quarantined: <strong className="text-slate-700">INFERRED / CLAIMED</strong>
              </span>
            </div>
          </div>

          {/* Multimodal Signals Tab Bar */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveSignalTab("ALL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeSignalTab === "ALL"
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All Signals ({candidateProfile.repositories.length + (candidateProfile.externalSignals?.length || 0)})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSignalTab("GITHUB")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeSignalTab === "GITHUB"
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FolderGit2 className="w-3.5 h-3.5" />
                  <span>GitHub Repos ({candidateProfile.repositories.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSignalTab("LEETCODE")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeSignalTab === "LEETCODE"
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Puzzle className="w-3.5 h-3.5 text-amber-500" />
                  <span>LeetCode Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSignalTab("CERTIFICATION")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeSignalTab === "CERTIFICATION"
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Certifications</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSignalTab("PORTFOLIO")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeSignalTab === "PORTFOLIO"
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-sky-600" />
                  <span>Web Portfolio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSignalTab("RESUME")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeSignalTab === "RESUME"
                      ? "bg-blue-600 text-white font-semibold shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>Resume Claims</span>
                </button>
              </div>

              <span className="text-xs font-mono text-slate-500">
                Click a repository to deep-scan AST
              </span>
            </div>

            {/* Repositories Section */}
            {(activeSignalTab === "ALL" || activeSignalTab === "GITHUB") && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  GitHub Code Repositories ({candidateProfile.repositories.length}):
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {candidateProfile.repositories.map((repo) => {
                    const isSelected = selectedRepoUrl === repo.repoUrl;
                    return (
                      <button
                        key={repo.name}
                        type="button"
                        onClick={() => runRepoScan(repo.repoUrl)}
                        className={`text-left p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                          isSelected
                            ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                            : "bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                        }`}
                      >
                        <div className="space-y-1.5 w-full">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold font-mono text-slate-900 truncate">
                              {repo.name}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                                repo.aiAssistanceRisk === "HIGH"
                                  ? "bg-rose-100 text-rose-800"
                                  : repo.aiAssistanceRisk === "MODERATE"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {repo.aiAssistanceRisk} AI
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                            {repo.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-200/60 w-full flex items-center justify-between text-[11px] text-slate-500">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700">{repo.primaryLanguage}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 text-amber-500" />
                              <span>{repo.starsCount}</span>
                            </span>
                          </div>
                          <span className="text-blue-700 font-semibold text-[10px] flex items-center gap-0.5">
                            {isSelected ? "Scanning" : "Inspect AST"}
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Non-GitHub External Portfolio Signals (LeetCode, Certs, Portfolio, Resume) */}
            {activeSignalTab !== "GITHUB" && candidateProfile.externalSignals && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                  External Signals (LeetCode, Certifications, Web Deployments & Resume Claims):
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {candidateProfile.externalSignals
                    .filter((sig) => activeSignalTab === "ALL" || sig.type.startsWith(activeSignalTab))
                    .map((sig, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {sig.type === "LEETCODE" && <Puzzle className="w-4 h-4 text-amber-500" />}
                            {sig.type === "CERTIFICATION" && <Award className="w-4 h-4 text-emerald-600" />}
                            {sig.type === "PORTFOLIO_SITE" && <Globe className="w-4 h-4 text-sky-600" />}
                            {sig.type === "RESUME_CLAIM" && <FileText className="w-4 h-4 text-amber-600" />}
                            {sig.type === "GITHUB" && <FolderGit2 className="w-4 h-4 text-blue-600" />}
                            <span className="text-xs font-bold text-slate-900">{sig.title}</span>
                          </div>
                          <Badge type="category" value={sig.category} size="sm" />
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-sans">{sig.description}</p>

                        <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-950 space-y-0.5 text-[11px]">
                          <span className="font-semibold text-amber-900 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Quarantine Boundary Note:
                          </span>
                          <p className="leading-relaxed text-[11px] text-amber-900/90">{sig.proofLimitation}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Real-time Groq LLM Scanning Banner */}
      {isScanning && (
        <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-4 text-center">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900">ProofPath Groq Telemetry Engine</h3>
            <p className="text-xs font-mono text-blue-700 animate-pulse">{scanStep}</p>
          </div>
          <p className="text-[11px] text-slate-500 max-w-md">
            Analyzing source code AST patterns, LeetCode submission signals, and calculating prompt generation heuristics via Groq LLM.
          </p>
        </div>
      )}

      {/* Deep-Dive Repository Extraction Report */}
      {report && !isScanning && (
        <div className="space-y-8 animate-fadeIn">
          {/* Top Result Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-blue-700 uppercase tracking-wider">
                    AST Evidence Extraction Report
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-xs font-mono text-slate-500">{report.license} License</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{report.owner}/{report.name}</span>
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  {report.summary}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleImportToVault}
                  disabled={imported}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-colors ${
                    imported
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {imported ? <Check className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4" />}
                  <span>{imported ? "Imported to Evidence Vault" : "Import Portfolio Evidence"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push(`/assessment/${report.recommendedCalibrationAssessmentId}`)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Launch Task Calibration</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">Primary Language</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">{report.primaryLanguage}</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">Commits Analyzed</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">{report.commitsAnalyzed} Commits</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">Source Files Scanned</span>
                <span className="text-base font-bold text-slate-900 mt-0.5 block">{report.filesScanned} AST Trees</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">Extracted Evidence</span>
                <span className="text-base font-bold text-blue-700 mt-0.5 block">{report.extractedEvidence.length} Items (INFERRED)</span>
              </div>
            </div>
          </div>

          {/* AI Assistance Risk Analysis Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-600" />
                <span>Generative-AI Assistance Risk Assessment</span>
              </h3>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                  report.aiRiskAssessment.riskLevel === "HIGH"
                    ? "bg-rose-100 text-rose-800"
                    : report.aiRiskAssessment.riskLevel === "MODERATE"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {report.aiRiskAssessment.riskLevel} AI RISK
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <span className="font-semibold text-slate-900 font-mono text-[11px]">Commit Telemetry & AST Heuristics:</span>
                <p className="text-slate-600 leading-relaxed font-sans">{report.aiRiskAssessment.rationale}</p>
              </div>
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1.5">
                <span className="font-semibold text-amber-950 font-mono text-[11px]">Epistemic Attribution Limitation:</span>
                <p className="text-amber-900/90 leading-relaxed font-sans">{report.aiRiskAssessment.authorAttributionLimitation}</p>
              </div>
            </div>
          </div>

          {/* Architectural Patterns Detected */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-600" />
                <span>Detected Architecture Patterns & Signal Limitations</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Concrete patterns parsed from source files, cross-referenced with what they cannot independently prove:
              </p>
            </div>

            <div className="space-y-4">
              {report.architecturePatterns.map((pat, idx) => (
                <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900">{pat.name}</span>
                      <span className="text-[11px] text-slate-500 ml-2 font-mono">
                        Mapped to: <strong className="text-blue-700">{pat.associatedSkillName}</strong>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {pat.files.map((f, i) => (
                        <span key={i} className="text-[10px] font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">{pat.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 text-xs">
                    <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-lg text-emerald-950 space-y-0.5">
                      <span className="font-semibold text-[11px] text-emerald-900 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Observed Code Signal:
                      </span>
                      <p className="text-[11px] leading-relaxed">{pat.observedSignal}</p>
                    </div>

                    <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg text-amber-950 space-y-0.5">
                      <span className="font-semibold text-[11px] text-amber-900 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        Critical Proof Limitation:
                      </span>
                      <p className="text-[11px] leading-relaxed">{pat.limitationNote}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
