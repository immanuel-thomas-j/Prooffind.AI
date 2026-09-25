"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FolderGit2,
  Plus,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Filter,
  Code2,
  Award,
  Globe,
  Search,
} from "lucide-react";
import { evidenceRepo, skillRepo, learnerRepo } from "../../repositories/supabase/supabaseStore";
import { EvidenceItem, Skill, EvidenceType } from "../../domain/types";
import { EvidenceService } from "../../services/evidenceService";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";
import { AuthGuard } from "../../components/auth/AuthGuard";

export default function EvidenceVaultPage() {
  return (
    <AuthGuard
      fallbackTitle="Evidence Vault Locked"
      fallbackDescription="Sign in to inspect and record verified artifacts, GitHub repository analysis, and LeetCode profiles."
    >
      <EvidenceVaultContent />
    </AuthGuard>
  );
}

function EvidenceVaultContent() {
  const { user, profile: authProfile } = useAuth();
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  // Analyzer Widget State (Matching Image 1)
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(true);
  const [selectedSourceType, setSelectedSourceType] = useState<"GITHUB" | "LEETCODE" | "CERTIFICATION" | "PORTFOLIO">("GITHUB");
  const [sourceUrlInput, setSourceUrlInput] = useState("");
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectStep, setInspectStep] = useState("");
  const [inspectionResult, setInspectionResult] = useState<any | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  // Manual Add Evidence Form State
  const [formState, setFormState] = useState({
    skillId: "",
    type: "GITHUB_REPOSITORY" as EvidenceType,
    title: "",
    source: "",
    reliabilityLimitations: "Repository indicates project existence. Does not establish independent code authorship or unassisted debugging competence.",
    directlyAssessed: false,
    aiAssistanceAllowed: true,
    aiDisclosureDetails: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadData = async () => {
    if (!user) return;
    try {
      const prof = authProfile || (await learnerRepo.getProfile(user.id));
      const sks = await skillRepo.getAllSkills();
      setSkills(sks);
      if (sks.length > 0 && !formState.skillId) {
        setFormState((prev) => ({ ...prev, skillId: sks[0].id }));
      }
      if (prof) {
        const evs = await evidenceRepo.getEvidenceForUser(prof.userId);
        setEvidenceList(evs);
      }
    } catch (err) {
      console.error("Failed to load evidence from Supabase", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, authProfile]);

  const handleSourceTypeChange = (type: "GITHUB" | "LEETCODE" | "CERTIFICATION" | "PORTFOLIO") => {
    setSelectedSourceType(type);
    setInspectionResult(null);
    setImportSuccess(false);
    setSourceUrlInput("");
  };

  const handleInspectSource = async () => {
    if (!sourceUrlInput.trim()) return;
    setIsInspecting(true);
    setInspectionResult(null);
    setImportSuccess(false);

    try {
      setInspectStep("1. Connecting to live API endpoint & fetching genuine telemetry...");
      const res = await fetch("/api/inspect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: selectedSourceType,
          sourceUrl: sourceUrlInput.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP inspection error: ${res.status}`);
      }

      setInspectStep("2. Evaluating architecture patterns & signal boundaries via Groq LLM...");
      const result = await res.json();
      setInspectStep("3. Synthesizing reliability limitations & discrepancy flags...");
      setInspectionResult(result);
    } catch (err: any) {
      console.error("Source inspection failed", err);
      setInspectionResult({
        sourceType: selectedSourceType,
        sourceUrl: sourceUrlInput,
        title: "Inspection Error",
        summary: `Failed to inspect source: ${err.message || "Network error"}. Please verify the target URL or handle.`,
        isFound: false,
        detectedSkills: [],
        signalMatrix: [],
        aiRiskLevel: "LOW",
        aiRiskRationale: "Inspection could not complete.",
        recommendedAssessmentId: "assess-hash-01",
        recommendedSkillName: "Hash Tables & Collision Resolution",
      });
    } finally {
      setIsInspecting(false);
      setInspectStep("");
    }
  };

  const handleImportEvidence = async () => {
    if (!inspectionResult || !user) return;
    try {
      const activeUserId = user.id;
      const prof = authProfile || (await learnerRepo.getProfile(activeUserId));
      const userId = prof?.userId || activeUserId;

      for (const det of inspectionResult.detectedSkills) {
        const newEv: EvidenceItem = {
          id: `ev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          userId,
          skillId: det.skillId || "skill-hash-02",
          type:
            selectedSourceType === "GITHUB"
              ? "GITHUB_REPOSITORY"
              : selectedSourceType === "LEETCODE"
              ? "CODING_PLATFORM_PROFILE"
              : selectedSourceType === "CERTIFICATION"
              ? "PROJECT_DESCRIPTION"
              : "PROJECT_DESCRIPTION",
          category: "INFERRED",
          title: det.evidenceTitle || inspectionResult.title,
          source: inspectionResult.sourceUrl,
          dateCollected: new Date().toISOString(),
          reliabilityLimitations: det.limitation,
          directlyAssessed: false,
          aiAssistanceAllowed: true,
          notes: det.inferredClaim,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await evidenceRepo.addEvidence(newEv);
      }

      setImportSuccess(true);
      await loadData();
    } catch (err) {
      console.error("Failed to import evidence", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this evidence record from your vault?")) {
      await evidenceRepo.deleteEvidence(id);
      setEvidenceList((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const filteredEvidence =
    filterCategory === "ALL"
      ? evidenceList
      : evidenceList.filter((e) => e.category === filterCategory);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-slate-500">Loading evidence vault records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header Section (Matching Image 1) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Evidence
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Observable artifacts inspected from submitted public sources. Never treats repository presence as competence.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAnalyzerOpen(!isAnalyzerOpen)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors min-h-[40px]"
          >
            <span>{isAnalyzerOpen ? "✕ Close Analyzer" : "+ Open Analyzer"}</span>
          </button>
        </div>
      </div>

      {/* Add Evidence Source Card (Matching Image 1) */}
      {isAnalyzerOpen && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">Add Evidence Source</h2>
            <span className="font-mono text-[11px] text-slate-400">
              Safe Static Inspection • Server-Side Groq Engine
            </span>
          </div>

          {/* Evidence Source Type Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Evidence Source Type:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => handleSourceTypeChange("GITHUB")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all min-h-[44px] ${
                  selectedSourceType === "GITHUB"
                    ? "bg-blue-50/80 border-blue-500 text-blue-700 shadow-xs ring-1 ring-blue-500/20"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <FolderGit2 className={`w-4 h-4 ${selectedSourceType === "GITHUB" ? "text-blue-600" : "text-slate-400"}`} />
                <span>GitHub Repository</span>
              </button>

              <button
                type="button"
                onClick={() => handleSourceTypeChange("LEETCODE")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all min-h-[44px] ${
                  selectedSourceType === "LEETCODE"
                    ? "bg-blue-50/80 border-blue-500 text-blue-700 shadow-xs ring-1 ring-blue-500/20"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <Code2 className={`w-4 h-4 ${selectedSourceType === "LEETCODE" ? "text-blue-600" : "text-slate-400"}`} />
                <span>LeetCode</span>
              </button>

              <button
                type="button"
                onClick={() => handleSourceTypeChange("CERTIFICATION")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all min-h-[44px] ${
                  selectedSourceType === "CERTIFICATION"
                    ? "bg-blue-50/80 border-blue-500 text-blue-700 shadow-xs ring-1 ring-blue-500/20"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <Award className={`w-4 h-4 ${selectedSourceType === "CERTIFICATION" ? "text-blue-600" : "text-slate-400"}`} />
                <span>Certificate</span>
              </button>

              <button
                type="button"
                onClick={() => handleSourceTypeChange("PORTFOLIO")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold transition-all min-h-[44px] ${
                  selectedSourceType === "PORTFOLIO"
                    ? "bg-blue-50/80 border-blue-500 text-blue-700 shadow-xs ring-1 ring-blue-500/20"
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <Globe className={`w-4 h-4 ${selectedSourceType === "PORTFOLIO" ? "text-blue-600" : "text-slate-400"}`} />
                <span>Portfolio / Project</span>
              </button>
            </div>
          </div>

          {/* Source URL Input Row (Matching Image 1) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Source URL:
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  value={sourceUrlInput}
                  onChange={(e) => setSourceUrlInput(e.target.value)}
                  placeholder={
                    selectedSourceType === "GITHUB"
                      ? "https://github.com/username/repository"
                      : selectedSourceType === "LEETCODE"
                      ? "https://leetcode.com/u/username"
                      : selectedSourceType === "CERTIFICATION"
                      ? "https://aws.amazon.com/verification/..."
                      : "https://myportfolio.dev"
                  }
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[42px]"
                />
              </div>

              <button
                type="button"
                disabled={isInspecting || !sourceUrlInput.trim()}
                onClick={handleInspectSource}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition-colors min-h-[42px] whitespace-nowrap"
              >
                {isInspecting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Inspect Source</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Inspection Scanning Steps Banner */}
          {isInspecting && (
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center gap-3 font-mono text-xs text-blue-800">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <span>{inspectStep}</span>
            </div>
          )}

          {/* Inspection Output Report & Importer */}
          {inspectionResult && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <span className="font-mono text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                    Live Telemetry Inspection Report
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{inspectionResult.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge type="category" value={inspectionResult.isFound ? "INFERRED" : "CLAIMED"} size="sm" />
                  <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                    AI Risk: {inspectionResult.aiRiskLevel}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                {inspectionResult.summary}
              </p>

              {/* If Not Found / Inactive */}
              {!inspectionResult.isFound ? (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5 font-mono">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Unverified Public Signal:</strong>
                    <span>No public solved problems, commits, or accessible webpage data were retrieved from this source. ProofPath does not fabricate telemetry for inactive links.</span>
                  </div>
                </div>
              ) : (
                /* Detected Skills Breakdown */
                inspectionResult.detectedSkills.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-mono text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Extracted Genuine Signals ({inspectionResult.detectedSkills.length}):
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {inspectionResult.detectedSkills.map((sk: any, idx: number) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{sk.skillName}</span>
                            <Badge type="category" value="INFERRED" size="sm" />
                          </div>
                          <p className="text-slate-600 text-[11px]">{sk.inferredClaim}</p>
                          <p className="text-amber-800 text-[10px] font-mono pt-1">
                            <strong>Limitation:</strong> {sk.limitation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

              {/* Import Action (Only for found/verified sources) */}
              {inspectionResult.isFound && inspectionResult.detectedSkills.length > 0 && (
                <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Artifact will be saved as INFERRED awaiting direct interactive challenge.
                  </span>

                  {importSuccess ? (
                    <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold text-xs font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Added to Evidence Vault!</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleImportEvidence}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Save to Vault as INFERRED</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Strict Boundary Disclosure Banner */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 space-y-1">
          <span className="font-semibold text-slate-900 block">ProofPath Classification Invariant:</span>
          <p className="text-slate-600 leading-relaxed">
            Repositories, resumes, and self-reports are categorized as <strong className="text-slate-900 font-mono">CLAIMED</strong> or <strong className="text-sky-700 font-mono">INFERRED</strong>.
            They are <span className="text-rose-600 font-semibold underline">never</span> marked as <strong className="text-emerald-700 font-mono">PROVEN</strong> without multi-stage direct assessment.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Manual Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <span className="text-slate-500 mr-1 flex items-center gap-1 font-sans">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Filter:
          </span>
          {["ALL", "CLAIMED", "INFERRED", "VERIFIED", "PROVEN"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg border transition-colors min-h-[36px] ${
                filterCategory === cat
                  ? "bg-white border-blue-500 text-blue-700 font-semibold shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              {cat} ({cat === "ALL" ? evidenceList.length : evidenceList.filter((e) => e.category === cat).length})
            </button>
          ))}
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          variant="secondary"
          size="sm"
          className="border-slate-300 text-slate-700 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          <span>Manual Entry</span>
        </Button>
      </div>

      {/* Evidence Cards List */}
      <div className="space-y-3">
        {filteredEvidence.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-xs text-slate-500 font-mono shadow-xs">
            No evidence records found in category &apos;{filterCategory}&apos;.
          </div>
        ) : (
          filteredEvidence.map((item) => {
            const associatedSkill = skills.find((s) => s.id === item.skillId);
            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 p-5 rounded-xl hover:border-slate-300 transition-colors space-y-3 shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">{item.title}</h3>
                      <Badge type="category" value={item.category} size="sm" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500">
                      <span>
                        Target: <strong className="text-slate-800">{associatedSkill?.name || item.skillId}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(item.dateCollected).toLocaleDateString()}
                      </span>
                      <span>•</span>
                      <span>Type: {item.type.replace(/_/g, " ")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      title="Delete evidence record"
                      aria-label="Delete evidence record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Source & Details */}
                <div className="text-xs space-y-2">
                  <div className="flex items-center gap-2 font-mono">
                    <strong className="text-slate-700">Source:</strong>
                    <span className="text-blue-600 break-all">{item.source}</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                    <span className="font-semibold font-mono text-amber-800 block mb-0.5 text-[11px]">
                      Documented Limitations:
                    </span>
                    <p className="text-slate-600 leading-relaxed font-sans">{item.reliabilityLimitations}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-500 pt-1">
                    <span>
                      Directly Assessed:{" "}
                      <strong className={item.directlyAssessed ? "text-emerald-700" : "text-slate-700"}>
                        {item.directlyAssessed ? "Yes" : "No (Indirect)"}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      AI Assistance:{" "}
                      <strong className="text-slate-700">
                        {item.aiAssistanceAllowed ? "Allowed" : "Restricted"}
                      </strong>
                    </span>
                    {item.notes && (
                      <>
                        <span>•</span>
                        <span>Notes: {item.notes}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>


      {/* Manual Entry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Manual Evidence Item"
        maxWidth="lg"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!user) return;
            const category = EvidenceService.determineCategory(formState.type, formState.directlyAssessed);
            const activeUserId = user.id;
            const created = await evidenceRepo.addEvidence({
              id: `ev-${Date.now()}`,
              userId: activeUserId,
              skillId: formState.skillId,
              type: formState.type,
              category,
              title: formState.title,
              source: formState.source,
              dateCollected: new Date().toISOString(),
              reliabilityLimitations: formState.reliabilityLimitations,
              directlyAssessed: formState.directlyAssessed,
              aiAssistanceAllowed: formState.aiAssistanceAllowed,
              aiDisclosureDetails: formState.aiDisclosureDetails || undefined,
              notes: formState.notes || undefined,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            setEvidenceList((prev) => [created, ...prev]);
            setIsModalOpen(false);
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Associated Skill</label>
            <select
              value={formState.skillId}
              onChange={(e) => setFormState((p) => ({ ...p, skillId: e.target.value }))}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 text-base sm:text-xs"
            >
              {skills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.difficulty})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Title</label>
            <input
              type="text"
              value={formState.title}
              onChange={(e) => setFormState({ ...formState, title: e.target.value })}
              placeholder="e.g. Public repo or Certificate"
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 text-base sm:text-xs"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Source URL</label>
            <input
              type="text"
              value={formState.source}
              onChange={(e) => setFormState({ ...formState, source: e.target.value })}
              placeholder="https://..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 text-base sm:text-xs font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Documented Limitations</label>
            <textarea
              rows={2}
              value={formState.reliabilityLimitations}
              onChange={(e) => setFormState({ ...formState, reliabilityLimitations: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-slate-900 text-base sm:text-xs"
            />
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" size="md" className="bg-blue-600 text-white">
              Save Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
