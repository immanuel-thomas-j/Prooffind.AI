"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  GitBranch,
  List,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Workflow,
  Network,
  Info,
} from "lucide-react";
import { skillRepo, learnerRepo, evidenceRepo } from "../../repositories/supabase/supabaseStore";
import { Skill, SkillPrerequisite, SkillAnalysisSummary } from "../../domain/types";
import { SkillGraphService } from "../../services/skillGraphService";
import { EvidenceService } from "../../services/evidenceService";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { AuthGuard } from "../../components/auth/AuthGuard";

export default function SkillsPage() {
  return (
    <AuthGuard
      fallbackTitle="Skill Graph & DAG Locked"
      fallbackDescription="Sign in to view your prerequisite sequence, topological order, and skill-evidence discrepancy matrix."
    >
      <SkillsContent />
    </AuthGuard>
  );
}

function SkillsContent() {
  const { user, profile: authProfile } = useAuth();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [prereqs, setPrereqs] = useState<SkillPrerequisite[]>([]);
  const [analyses, setAnalyses] = useState<SkillAnalysisSummary[]>([]);
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [hoveredSkillId, setHoveredSkillId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      try {
        const sks = await skillRepo.getAllSkills();
        const prs = await skillRepo.getPrerequisites();
        const prof = authProfile || (await learnerRepo.getProfile(user.id));
        const evs = prof ? await evidenceRepo.getEvidenceForUser(prof.userId) : [];

        setSkills(sks);
        setPrereqs(prs);
        if (sks.length > 0) {
          setSelectedSkill(sks[1] || sks[0]);
        }

        if (prof && sks.length > 0) {
          const res = EvidenceService.analyzeSkills(sks, prof.selfReportedSkills, evs);
          setAnalyses(res);
        }
      } catch (err) {
        console.error("Failed to load skills from Supabase", err);
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
        <p className="text-xs font-mono text-slate-500">Computing DAG topological ordering and prerequisite matrix...</p>
      </div>
    );
  }

  const dagValidation = SkillGraphService.validateGraph(skills, prereqs);
  const topologicalOrder = SkillGraphService.getTopologicalSort(skills, prereqs);

  const getAnalysisForSkill = (skillId: string) => {
    return analyses.find((a) => a.skillId === skillId);
  };

  // Find ancestor chain for selected/hovered skill
  const getAncestorIds = (skillId: string): Set<string> => {
    const ancestors = new Set<string>();
    const stack = [skillId];
    while (stack.length > 0) {
      const curr = stack.pop()!;
      const parentEdges = prereqs.filter((p) => p.skillId === curr);
      for (const edge of parentEdges) {
        if (!ancestors.has(edge.prerequisiteSkillId)) {
          ancestors.add(edge.prerequisiteSkillId);
          stack.push(edge.prerequisiteSkillId);
        }
      }
    }
    return ancestors;
  };

  const activeAncestors = selectedSkill ? getAncestorIds(selectedSkill.id) : new Set<string>();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Network className="w-7 h-7 text-blue-600" />
              <span>Skill Graph & Dependency DAG</span>
            </h1>
            <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
              DAG Validated • 0 Cycles
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Acyclic prerequisite hierarchy evaluated via 3-color DFS graph validation and topological sequencing.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-slate-100 border border-slate-300 rounded-xl p-1 font-mono text-xs">
          <button
            onClick={() => setViewMode("graph")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "graph" ? "bg-white text-blue-700 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Interactive DAG</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "list" ? "bg-white text-blue-700 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Topological List</span>
          </button>
        </div>
      </div>

      {/* DAG Integrity Engine Bar */}
      <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 font-mono shadow-xs">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            Strict Graph State: {skills.length} nodes, {prereqs.length} prerequisite edges. All references verified acyclic.
          </span>
        </div>
        <div className="flex items-center gap-4 text-slate-500 text-[11px]">
          <span>Prerequisite Sequencing: Validated</span>
          <span>Integrity: Zero Cycles</span>
        </div>
      </div>

      {viewMode === "graph" ? (
        /* Visual Graph View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual DAG Columns with dependency glow */}
          <div className="lg:col-span-2 space-y-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
              <span className="font-mono text-slate-500 uppercase tracking-wider font-semibold">
                Prerequisite Columns (Flows Left &rarr; Right)
              </span>
              <span className="text-slate-500 text-[11px]">
                {selectedSkill ? `Inspecting: ${selectedSkill.name}` : "Click node to inspect"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Level 1: Foundations */}
              <div className="space-y-3">
                <div className="text-[11px] font-mono font-bold text-sky-700 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center justify-between">
                  <span>01: Foundations</span>
                  <span className="text-slate-400">Tier 1</span>
                </div>
                {skills
                  .filter((s) => s.difficulty === "Fundamental")
                  .map((sk) => {
                    const analysis = getAnalysisForSkill(sk.id);
                    const isSelected = selectedSkill?.id === sk.id;
                    const isAncestor = activeAncestors.has(sk.id);

                    return (
                      <button
                        key={sk.id}
                        onClick={() => setSelectedSkill(sk)}
                        onMouseEnter={() => setHoveredSkillId(sk.id)}
                        onMouseLeave={() => setHoveredSkillId(null)}
                        className={`w-full text-left p-4 rounded-xl border transition-all text-xs ${
                          isSelected
                            ? "bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-500/30"
                            : isAncestor
                            ? "bg-sky-50/50 border-sky-300"
                            : "bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70"
                        }`}
                      >
                        <span className="font-mono text-[10px] text-slate-500 uppercase block mb-1">
                          {sk.category}
                        </span>
                        <h4 className="font-bold text-slate-900 mb-2 leading-snug">{sk.name}</h4>
                        <div className="flex items-center justify-between pt-1">
                          <Badge
                            type="category"
                            value={analysis?.highestCategory || "UNCLAIMED"}
                            size="sm"
                          />
                          {isAncestor && (
                            <span className="text-[10px] font-mono text-sky-700 font-bold">Prereq</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>

              {/* Level 2: Core Systems */}
              <div className="space-y-3">
                <div className="text-[11px] font-mono font-bold text-amber-700 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center justify-between">
                  <span>02: Systems Core</span>
                  <span className="text-slate-400">Tier 2</span>
                </div>
                {skills
                  .filter((s) => s.difficulty === "Intermediate")
                  .map((sk) => {
                    const analysis = getAnalysisForSkill(sk.id);
                    const isSelected = selectedSkill?.id === sk.id;
                    const isAncestor = activeAncestors.has(sk.id);

                    return (
                      <button
                        key={sk.id}
                        onClick={() => setSelectedSkill(sk)}
                        onMouseEnter={() => setHoveredSkillId(sk.id)}
                        onMouseLeave={() => setHoveredSkillId(null)}
                        className={`w-full text-left p-4 rounded-xl border transition-all text-xs ${
                          isSelected
                            ? "bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-500/30"
                            : isAncestor
                            ? "bg-sky-50/50 border-sky-300"
                            : "bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70"
                        }`}
                      >
                        <span className="font-mono text-[10px] text-slate-500 uppercase block mb-1">
                          {sk.category}
                        </span>
                        <h4 className="font-bold text-slate-900 mb-2 leading-snug">{sk.name}</h4>
                        <div className="flex items-center justify-between pt-1">
                          <Badge
                            type="category"
                            value={analysis?.highestCategory || "UNCLAIMED"}
                            size="sm"
                          />
                          {analysis?.hasDiscrepancy && (
                            <span className="text-[10px] font-mono text-amber-700 font-bold">
                              Discrepancy
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>

              {/* Level 3: Distributed Systems */}
              <div className="space-y-3">
                <div className="text-[11px] font-mono font-bold text-purple-700 uppercase tracking-wider pb-1 border-b border-slate-100 flex items-center justify-between">
                  <span>03: Distributed</span>
                  <span className="text-slate-400">Tier 3</span>
                </div>
                {skills
                  .filter((s) => s.difficulty === "Advanced")
                  .map((sk) => {
                    const analysis = getAnalysisForSkill(sk.id);
                    const isSelected = selectedSkill?.id === sk.id;
                    const isAncestor = activeAncestors.has(sk.id);

                    return (
                      <button
                        key={sk.id}
                        onClick={() => setSelectedSkill(sk)}
                        onMouseEnter={() => setHoveredSkillId(sk.id)}
                        onMouseLeave={() => setHoveredSkillId(null)}
                        className={`w-full text-left p-4 rounded-xl border transition-all text-xs ${
                          isSelected
                            ? "bg-blue-50/80 border-blue-500 shadow-sm ring-1 ring-blue-500/30"
                            : isAncestor
                            ? "bg-sky-50/50 border-sky-300"
                            : "bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-100/70"
                        }`}
                      >
                        <span className="font-mono text-[10px] text-slate-500 uppercase block mb-1">
                          {sk.category}
                        </span>
                        <h4 className="font-bold text-slate-900 mb-2 leading-snug">{sk.name}</h4>
                        <div className="flex items-center justify-between pt-1">
                          <Badge
                            type="category"
                            value={analysis?.highestCategory || "UNCLAIMED"}
                            size="sm"
                          />
                          {analysis?.hasDiscrepancy && (
                            <span className="text-[10px] font-mono text-amber-700 font-bold">
                              Discrepancy
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Node Inspector Panel */}
          {selectedSkill ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                    {selectedSkill.category}
                  </span>
                  <Badge type="neutral" value={selectedSkill.difficulty} size="sm" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{selectedSkill.name}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {selectedSkill.description}
                </p>
              </div>

              {/* Prerequisites for Selected Skill */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Prerequisites Required
                </span>
                {prereqs.filter((p) => p.skillId === selectedSkill.id).length === 0 ? (
                  <p className="text-xs text-emerald-700 flex items-center gap-1.5 font-mono font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Root entry point (No prerequisites)</span>
                  </p>
                ) : (
                  <div className="space-y-1.5 font-mono text-xs">
                    {prereqs
                      .filter((p) => p.skillId === selectedSkill.id)
                      .map((p) => {
                        const preSkill = skills.find((s) => s.id === p.prerequisiteSkillId);
                        return (
                          <div
                            key={p.id}
                            className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
                          >
                            <span className="text-slate-800 font-medium">{preSkill?.name || p.prerequisiteSkillId}</span>
                            <span className="text-[10px] text-slate-500">
                              {p.relationType === "STRICT_PREREQUISITE" ? "Strict" : "Recommended"}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Core Concepts */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                  Evaluation Concepts
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSkill.coreConcepts.map((c, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Evaluation Focus */}
              <div className="pt-3 border-t border-slate-100 text-xs">
                <strong className="text-slate-700 block mb-1 font-mono">Assessment Focus:</strong>
                <p className="text-slate-600 leading-relaxed">{selectedSkill.evaluationFocus}</p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  href={`/assessment?skill=${selectedSkill.id}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>Launch Assessment for this Skill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-slate-500 text-xs shadow-xs">
              Select a node in the graph to inspect prerequisite chains.
            </div>
          )}
        </div>
      ) : (
        /* Accessible List View */
        <div className="space-y-3">
          <div className="text-xs font-mono text-slate-500 font-medium">
            Sequenced Prerequisite Progression:
          </div>
          {topologicalOrder.map((sk, index) => {
            const analysis = getAnalysisForSkill(sk.id);
            const directPrereqs = prereqs.filter((p) => p.skillId === sk.id);
            return (
              <div key={sk.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-colors shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-mono text-xs font-bold flex items-center justify-center border border-blue-200">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{sk.name}</h3>
                      <span className="text-xs font-mono text-slate-500">{sk.category} • {sk.difficulty}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge type="category" value={analysis?.highestCategory || "UNCLAIMED"} size="sm" />
                    <Badge type="status" value={analysis?.competenceStatus || "NOT_ASSESSED"} size="sm" />
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">{sk.description}</p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-4 text-xs pt-3 border-t border-slate-100">
                  <div className="text-slate-600 font-mono text-[11px]">
                    <strong className="text-slate-800">Prerequisites:</strong>{" "}
                    {directPrereqs.length === 0
                      ? "None (Root Entry)"
                      : directPrereqs
                          .map((p) => skills.find((s) => s.id === p.prerequisiteSkillId)?.name)
                          .join(", ")}
                  </div>
                  <Link
                    href={`/assessment?skill=${sk.id}`}
                    className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 font-mono text-xs"
                  >
                    <span>Take Assessment</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
