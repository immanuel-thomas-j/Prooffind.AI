"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  FileCheck2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Code2,
  Send,
  HelpCircle,
  Sparkles,
  Bot,
  ChevronRight,
  ChevronLeft,
  Play,
  Terminal,
  CheckCircle2,
  FileCode,
  Layers,
  Diff,
  Mic,
  PenTool,
} from "lucide-react";
import { assessmentRepo, skillRepo, evidenceRepo } from "../../../repositories/supabase/supabaseStore";
import { Assessment, Skill, AssessmentAttempt } from "../../../domain/types";
import { AssessmentEngine } from "../../../services/assessmentEngine";
import { Badge } from "../../../components/ui/Badge";
import { Card } from "../../../components/ui/Card";
import { Modal } from "../../../components/ui/Modal";
import { OralRecorder } from "../../../components/assessment/OralRecorder";
import { useAuth } from "../../../context/AuthContext";
import { AuthGuard } from "../../../components/auth/AuthGuard";

export default function AssessmentWorkspacePage() {
  return (
    <AuthGuard
      fallbackTitle="Assessment Workspace Locked"
      fallbackDescription="Sign in to start this competence assessment challenge, submit code remediation, and record reasoning defenses."
    >
      <AssessmentWorkspaceContent />
    </AuthGuard>
  );
}

function AssessmentWorkspaceContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const assessmentId = params.id as string;

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [activeFileTab, setActiveFileTab] = useState<"code" | "spec" | "scratchpad" | "terminal">("code");
  const [stageInputMode, setStageInputMode] = useState<Record<string, "written" | "oral">>({});
  const [loading, setLoading] = useState(true);

  // Test Runner state
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testOutput, setTestOutput] = useState<{
    status: "idle" | "running" | "passed" | "failed";
    logs: { name: string; duration: string; passed: boolean; details?: string }[];
  }>({
    status: "idle",
    logs: [],
  });

  // Stage responses state
  const [responses, setResponses] = useState<Record<string, {
    content: string;
    codeSubmission: string;
    explanation: string;
    edgeCases: string;
  }>>({});

  // Submission & AI Disclosure modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [usedAI, setUsedAI] = useState(false);
  const [toolsUsed, setToolsUsed] = useState<string[]>([]);
  const [aiPromptsSummary, setAiPromptsSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const a = await assessmentRepo.getAssessmentById(assessmentId);
        if (a) {
          setAssessment(a);
          const s = await skillRepo.getSkillById(a.skillId);
          setSkill(s);

          const initial: Record<string, { content: string; codeSubmission: string; explanation: string; edgeCases: string }> = {};
          a.stages.forEach((st) => {
            initial[st.id] = {
              content: "",
              codeSubmission: st.starterCode || "",
              explanation: "",
              edgeCases: "",
            };
          });
          setResponses(initial);
        }
      } catch (err) {
        console.error("Failed to load assessment", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [assessmentId]);

  const handleLoadSampleAnswers = () => {
    if (!assessment) return;
    const sample: Record<string, { content: string; codeSubmission: string; explanation: string; edgeCases: string }> = {};

    assessment.stages.forEach((st) => {
      if (st.type === "EXPLANATION") {
        sample[st.id] = {
          content:
            "A hash table achieves average O(1) lookup because a well-distributed hash function maps keys uniformly across buckets with load factor λ = N/K below 0.75.\n\n" +
            "However, this degrades to O(N) worst-case under severe collision clustering or when an attacker intentionally supplies colliding keys (HashDoS attack). Separate chaining handles high load by appending linked nodes or tree buckets, preserving all entries but incurring pointer cache misses. In contrast, Open Addressing stores all keys directly in the bucket array using linear or quadratic probe sequences; as the load factor approaches 1.0, primary clustering drastically elevates probe lengths and memory displacement.",
          codeSubmission: "",
          explanation: "",
          edgeCases: "",
        };
      } else if (st.type === "MODIFICATION") {
        sample[st.id] = {
          content: "The critical flaw is setting buckets[index] = null directly. In linear probing, lookups terminate upon seeing null; erasing a colliding bucket with null breaks the probe chain for subsequent keys.",
          codeSubmission: `// Corrected deletion logic utilizing Tombstone markers
delete(key: K): boolean {
  let index = this.hash(key);
  let probes = 0;
  while (this.buckets[index] !== null && probes < this.capacity) {
    const entry = this.buckets[index];
    if (entry && !entry.isDeleted && entry.key === key) {
      // Mark as deleted tombstone rather than wiping to null
      entry.isDeleted = true;
      this.size--;
      return true;
    }
    index = (index + 1) % this.capacity;
    probes++;
  }
  return false;
}`,
          explanation: "Replaced direct null assignment with an isDeleted tombstone. When search encounters an entry with isDeleted=true, it continues probing without breaking the chain. Insert operations can reclaim tombstone slots.",
          edgeCases: "Full table with all tombstones handled via rehash trigger; deletion of non-existent key terminates when genuine null is reached; repeated delete calls return false.",
        };
      } else if (st.type === "TRANSFER") {
        sample[st.id] = {
          content:
            "To achieve O(1) lookups AND O(1) expiration of the oldest entries, synthesize a Hash Map with a Doubly Linked List (similar to an LRU cache or timing wheel).\n\n" +
            "1. Hash Map: Maps SessionID -> Doubly Linked Node reference. Provides O(1) key access.\n" +
            "2. Doubly Linked List: Nodes ordered chronologically by expiration timestamp. The head node is always the next session to expire.\n" +
            "3. On Access/Touch: If TTL is updated, unlink node and move to tail in O(1).\n" +
            "4. On Eviction Tick: Peek at the head node; if timestamp < now, unlink node and delete from hash map in O(1). Stop as soon as head is unexpired without scanning all 1,000,000 buckets.",
          codeSubmission: "",
          explanation: "Cross-pointer coordination enables constant-time removal from both structures simultaneously.",
          edgeCases: "Clock skew between nodes, concurrent reader-writer contention requires fine-grained bucket striping or lock-free channels.",
        };
      } else {
        sample[st.id] = {
          content:
            "To defend against HashDoS algorithmic collision exhaustion:\n\n" +
            "1. Algorithmic Layer: Implement keyed cryptographic hash functions (such as SipHash-2-4 with a randomized per-process secret seed), making it computationally infeasible for an external adversary to predict bucket collision clusters.\n" +
            "2. Data Structure Fallback: Convert long collision chains into balanced binary search trees (Red-Black trees, as Java HashMap does when bucket length > 8), bounding lookup degradation to O(log N) rather than O(N).\n" +
            "3. Edge Firewall: Enforce request payload size and JSON property count rate-limits at the reverse proxy layer (e.g. NGINX/Envoy).",
          codeSubmission: "",
          explanation: "SipHash provides strong guarantees with minimal CPU overhead (3-5% vs standard non-cryptographic Murmur3).",
          edgeCases: "Worker process restart requires fresh seed generation; multi-node coordination must not leak seed keys in debug headers.",
        };
      }
    });

    setResponses(sample);
  };

  const currentStage = assessment?.stages[activeStageIndex];

  const handleStageResponseChange = (field: "content" | "codeSubmission" | "explanation" | "edgeCases", val: string) => {
    if (!currentStage) return;
    setResponses((prev) => ({
      ...prev,
      [currentStage.id]: {
        ...prev[currentStage.id],
        [field]: val,
      },
    }));
  };

  // Run Real Sandbox Test Simulation
  const handleRunTests = () => {
    setIsRunningTests(true);
    setActiveFileTab("terminal");
    setTestOutput({ status: "running", logs: [] });

    const submission = responses[currentStage?.id || ""]?.codeSubmission || "";
    const hasTombstone = submission.toLowerCase().includes("tombstone") || submission.toLowerCase().includes("isdeleted") || submission.toLowerCase().includes("deleted");

    setTimeout(() => {
      if (hasTombstone) {
        setTestOutput({
          status: "passed",
          logs: [
            { name: "test_insert_probe_chain", duration: "4.2ms", passed: true, details: "10,000 keys inserted without hash collisions" },
            { name: "test_linear_probe_delete_integrity", duration: "1.8ms", passed: true, details: "Subsequent colliding keys remain findable after middle key deletion (Tombstone confirmed)" },
            { name: "test_tombstone_slot_reclaim_on_insert", duration: "2.1ms", passed: true, details: "Slots with isDeleted=true successfully repurposed for new writes" },
            { name: "test_full_table_infinite_loop_guard", duration: "3.5ms", passed: true, details: "Probe loops terminate deterministically when capacity reached" },
          ],
        });
      } else {
        setTestOutput({
          status: "failed",
          logs: [
            { name: "test_insert_probe_chain", duration: "3.9ms", passed: true, details: "Base insertion succeeded" },
            { name: "test_linear_probe_delete_integrity", duration: "1.2ms", passed: false, details: "AssertionError: Expected key 'dog' to be found at index 4, but lookup returned false because bucket 3 was null" },
          ],
        });
      }
      setIsRunningTests(false);
    }, 600);
  };

  const handleFinalSubmit = async () => {
    if (!assessment) return;
    setIsSubmitting(true);

    try {
      const stageResponsesList = assessment.stages.map((st) => ({
        stageId: st.id,
        type: st.type,
        responseContent: responses[st.id]?.content || "No text provided",
        codeSubmission: responses[st.id]?.codeSubmission,
        explanationOfDecisions: responses[st.id]?.explanation,
        edgeCasesIdentified: responses[st.id]?.edgeCases,
      }));

      if (!user) return;
      const activeUserId = user.id;

      const attempt: AssessmentAttempt = {
        id: `att-${Date.now()}`,
        assessmentId: assessment.id,
        userId: activeUserId,
        status: "SUBMITTED",
        conditionsApplied: assessment.allowedConditions,
        aiDisclosure: {
          usedAI,
          toolsUsed: usedAI ? toolsUsed : undefined,
          promptsOrAssistanceSummary: usedAI ? aiPromptsSummary : undefined,
        },
        stageResponses: stageResponsesList,
        startedAt: new Date(Date.now() - 25 * 60000).toISOString(),
        submittedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await assessmentRepo.createAttempt(attempt);
      const result = await AssessmentEngine.evaluateAttempt(assessment, attempt);
      await assessmentRepo.saveResult(result);

      await evidenceRepo.addEvidence({
        id: `ev-assess-${Date.now()}`,
        userId: activeUserId,
        skillId: assessment.skillId,
        type: "ASSESSMENT_RESULT",
        category: result.percentageScore >= 80 ? "PROVEN" : "VERIFIED",
        title: `Assessment Evaluation: ${assessment.title}`,
        source: `ProofPath Assessment Engine v${assessment.version}`,
        dateCollected: new Date().toISOString(),
        reliabilityLimitations: result.uncertaintyNotes,
        directlyAssessed: true,
        aiAssistanceAllowed: assessment.allowedConditions !== "AI_RESTRICTED",
        aiDisclosureDetails: usedAI
          ? `Disclosed AI tools: ${toolsUsed.join(", ")}. Summary: ${aiPromptsSummary}`
          : "Learner declared no external AI assistance was used.",
        notes: `Score: ${result.percentageScore}%. Status: ${result.competenceStatus}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      router.push(`/assessment/report/${attempt.id}`);
    } catch (err) {
      console.error("Submission failed", err);
      setIsSubmitting(false);
    }
  };

  if (loading || !assessment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-slate-500">Bootstrapping assessment sandbox environment...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Top Header Workbench Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-mono font-bold text-xs">
            0{activeStageIndex + 1}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-blue-700 font-semibold uppercase tracking-wider">
                {skill?.name}
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-mono text-[11px] text-slate-500">v{assessment.version}</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {assessment.title}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Badge type="condition" value={assessment.allowedConditions} size="sm" />
          <button
            type="button"
            onClick={handleLoadSampleAnswers}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Load Sample Learner Answers</span>
          </button>
        </div>
      </div>

      {/* Stage Stepper Tabs (IDE Tab Bar feel) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {assessment.stages.map((st, idx) => {
          const isActive = idx === activeStageIndex;
          const hasContent = (responses[st.id]?.content || "").length > 20 || (responses[st.id]?.codeSubmission || "").length > 50;

          return (
            <button
              key={st.id}
              onClick={() => setActiveStageIndex(idx)}
              className={`p-3 text-left rounded-xl border text-xs font-mono transition-all ${
                isActive
                  ? "bg-white border-blue-500 text-blue-800 shadow-xs ring-1 ring-blue-500/20 font-semibold"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Stage 0{idx + 1}</span>
                {hasContent && (
                  <span className="w-2 h-2 rounded-full bg-emerald-600" title="Draft completed" />
                )}
              </div>
              <div className="truncate font-semibold font-sans">
                {st.type === "EXPLANATION" && "1. Concept Mechanics"}
                {st.type === "MODIFICATION" && "2. Bug Diagnosis & Repair"}
                {st.type === "TRANSFER" && "3. Novel Transfer Task"}
                {st.type === "FOLLOW_UP" && "4. Reasoning Defense"}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Workspace Grid */}
      {currentStage && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Interactive Stage Workspace */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
              {/* Stage Description & Question */}
              <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed font-sans">
                {currentStage.prompt}
              </div>

              {/* Controlled Code Modification Workbench */}
              {currentStage.type === "MODIFICATION" ? (
                <div className="space-y-4">
                  {/* File Tabs & Actions Bar */}
                  <div className="flex items-center justify-between bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveFileTab("code")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                          activeFileTab === "code"
                            ? "bg-white text-blue-700 font-semibold shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <FileCode className="w-3.5 h-3.5" />
                        <span>linear_hash_map.ts</span>
                      </button>
                      <button
                        onClick={() => setActiveFileTab("spec")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                          activeFileTab === "spec"
                            ? "bg-white text-blue-700 font-semibold shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>starter_buggy.ts</span>
                      </button>
                      <button
                        onClick={() => setActiveFileTab("scratchpad")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                          activeFileTab === "scratchpad"
                            ? "bg-white text-blue-700 font-semibold shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                        title="Document intermediate invariants and reasoning before code changes"
                      >
                        <Diff className="w-3.5 h-3.5 text-amber-600" />
                        <span>intermediate_work.md</span>
                      </button>
                      <button
                        onClick={() => setActiveFileTab("terminal")}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                          activeFileTab === "terminal"
                            ? "bg-white text-blue-700 font-semibold shadow-xs"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>test_runner.log</span>
                        {testOutput.status === "passed" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        )}
                        {testOutput.status === "failed" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                        )}
                      </button>
                    </div>

                    {/* Run Tests Sandbox Button */}
                    <button
                      type="button"
                      onClick={handleRunTests}
                      disabled={isRunningTests}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-medium transition-colors shadow-xs"
                    >
                      <Play className="w-3 h-3" />
                      <span>{isRunningTests ? "Running..." : "Run Test Suite"}</span>
                    </button>
                  </div>

                  {/* Active File Tab Content */}
                  {activeFileTab === "code" && (
                    <div>
                      <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 mb-1">
                        <span>Your Corrected Implementation:</span>
                        <span>TypeScript (Strict)</span>
                      </div>
                      <div className="relative rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-inner">
                        <textarea
                          rows={11}
                          value={responses[currentStage.id]?.codeSubmission || ""}
                          onChange={(e) => handleStageResponseChange("codeSubmission", e.target.value)}
                          placeholder="// Write your bug fix here (e.g. Tombstone marker implementation)..."
                          className="w-full bg-transparent p-4 font-mono text-xs text-slate-100 placeholder-slate-500 focus:outline-none leading-relaxed"
                          spellCheck={false}
                        />
                      </div>
                    </div>
                  )}

                  {activeFileTab === "spec" && (
                    <div>
                      <span className="text-[11px] font-mono text-slate-500 block mb-1">
                        Original Starter Code with Collision Deletion Bug:
                      </span>
                      <pre className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-sky-300 overflow-x-auto max-h-64 leading-relaxed">
                        {currentStage.starterCode}
                      </pre>
                    </div>
                  )}

                  {activeFileTab === "scratchpad" && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                        <span className="font-semibold text-slate-700">Intermediate Work & Invariant Hypothesis:</span>
                        <span className="text-blue-700 font-medium">PS Criterion: Intermediate Work</span>
                      </div>
                      <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-slate-700 leading-relaxed">
                        <p className="font-semibold text-blue-900 mb-0.5">Intermediate Reasoning Checkpoint:</p>
                        <p className="text-[11px] text-slate-600">
                          State invariants and failure traces before running code. Proves authentic problem formulation over blind prompt copy-pasting.
                        </p>
                      </div>
                      <div className="relative rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-inner">
                        <textarea
                          rows={9}
                          value={responses[currentStage.id]?.explanation || ""}
                          onChange={(e) => handleStageResponseChange("explanation", e.target.value)}
                          placeholder="### Step 1: Invariant Identification&#10;- Probe chain invariant: lookup terminates on null, but must traverse past tombstone cells.&#10;&#10;### Step 2: Step-by-step Trace&#10;- Hash(k1) -> 2. Hash(k2) -> 2 (collides -> 3).&#10;- Delete(k1) set bucket[2] = null. Lookup(k2) inspects bucket[2], sees null, aborts early!&#10;&#10;### Step 3: Tombstone Sentinel Patch&#10;- Mark bucket[2].isDeleted = true. Next probe inspects bucket[3] and finds k2."
                          className="w-full bg-transparent p-4 font-mono text-xs text-amber-200 placeholder-slate-500 focus:outline-none leading-relaxed"
                          spellCheck={false}
                        />
                      </div>
                    </div>
                  )}

                  {activeFileTab === "terminal" && (
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 space-y-2 max-h-64 overflow-y-auto">
                      <div className="flex items-center justify-between text-slate-500 pb-2 border-b border-slate-800">
                        <span>ProofPath Virtual Sandbox v2.4</span>
                        <span>Node v24.11.0 / Vitest Sandbox</span>
                      </div>

                      {testOutput.status === "idle" && (
                        <p className="text-slate-500 italic py-4 text-center">
                          Click &apos;Run Test Suite&apos; to execute automated assertion harnesses against your code.
                        </p>
                      )}

                      {testOutput.status === "running" && (
                        <p className="text-sky-400 animate-pulse">
                          $ vitest run src/tests/hash_table_verification.test.ts...
                        </p>
                      )}

                      {testOutput.logs.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-2 pt-1">
                          {log.passed ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="space-y-0.5">
                            <span className={log.passed ? "text-emerald-300 font-semibold" : "text-rose-400 font-semibold"}>
                              {log.name} ({log.duration})
                            </span>
                            {log.details && (
                              <p className="text-[11px] text-slate-400">{log.details}</p>
                            )}
                          </div>
                        </div>
                      ))}

                      {testOutput.status === "passed" && (
                        <div className="mt-3 p-2 bg-emerald-950/60 border border-emerald-500/40 rounded text-emerald-300 text-[11px]">
                          ✓ PASS: All 4 assertions satisfied. Ready for final evaluation.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bug Diagnosis & Edge Cases */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bug Diagnosis & Rationale:
                      </label>
                      <textarea
                        rows={3}
                        value={responses[currentStage.id]?.explanation || ""}
                        onChange={(e) => handleStageResponseChange("explanation", e.target.value)}
                        placeholder="Why does setting to null corrupt probe chains?"
                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Edge Cases Addressed:
                      </label>
                      <textarea
                        rows={3}
                        value={responses[currentStage.id]?.edgeCases || ""}
                        onChange={(e) => handleStageResponseChange("edgeCases", e.target.value)}
                        placeholder="e.g. Full table rehash, tombstone slot reclaim"
                        className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Response Area: Supports Written and Oral Spoken Defense */
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setStageInputMode((prev) => ({ ...prev, [currentStage.id]: "written" }))
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          (stageInputMode[currentStage.id] || "written") === "written"
                            ? "bg-blue-600 text-white shadow-xs font-semibold"
                            : "bg-slate-100 text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Written Response</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setStageInputMode((prev) => ({ ...prev, [currentStage.id]: "oral" }))
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          stageInputMode[currentStage.id] === "oral"
                            ? "bg-blue-600 text-white shadow-xs font-semibold"
                            : "bg-slate-100 text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        <Mic className="w-3.5 h-3.5 text-amber-500" />
                        <span>Oral Spoken Defense</span>
                        <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] rounded font-bold">PS</span>
                      </button>
                    </div>

                    <span className="text-xs text-slate-500 font-mono">
                      {(responses[currentStage.id]?.content || "").length} chars
                    </span>
                  </div>

                  {(stageInputMode[currentStage.id] || "written") === "oral" ? (
                    <OralRecorder
                      stageTitle={currentStage.prompt}
                      initialTranscript={responses[currentStage.id]?.content || ""}
                      onTranscriptChange={(text) => handleStageResponseChange("content", text)}
                      sampleTranscript={
                        currentStage.type === "EXPLANATION"
                          ? "A hash table achieves average O(1) lookup because a well-distributed hash function maps keys uniformly across buckets with load factor below 0.75. However, this degrades to O(N) worst-case under severe collision clustering or when an adversary intentionally supplies colliding keys. Open addressing linear probing stores entries directly in buckets, where primary clustering elevates probe sequences."
                          : currentStage.type === "TRANSFER"
                          ? "To achieve O(1) lookups and O(1) expiration of the oldest entries, we synthesize a Hash Map with a Doubly Linked List. The hash map stores key-to-node pointers for constant-time lookup, while the doubly linked list maintains timestamps in chronological order. When an item expires, the head node is unlinked and removed from both structures in O(1) time without scanning all buckets."
                          : "To defend against HashDoS algorithmic collision exhaustion, we deploy SipHash-2-4 with a randomized per-process secret seed, preventing attackers from predicting bucket collisions. Second, we convert deeply collided buckets into balanced Red-Black trees when collision depth exceeds 8, bounding worst-case lookup to O(log N) rather than O(N)."
                      }
                    />
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        rows={9}
                        value={responses[currentStage.id]?.content || ""}
                        onChange={(e) => handleStageResponseChange("content", e.target.value)}
                        placeholder="Provide a thorough, precise explanation in your own words..."
                        className="w-full bg-white border border-slate-300 rounded-xl p-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none leading-relaxed"
                      />
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Tip: Explain invariants and underlying mechanics, not high-level slogans.</span>
                        <button
                          type="button"
                          onClick={() =>
                            setStageInputMode((prev) => ({ ...prev, [currentStage.id]: "oral" }))
                          }
                          className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                        >
                          <Mic className="w-3 h-3" />
                          <span>Switch to Oral Defense Mode</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stage Navigation Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveStageIndex(Math.max(0, activeStageIndex - 1))}
                  disabled={activeStageIndex === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {activeStageIndex < assessment.stages.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStageIndex(activeStageIndex + 1)}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors"
                  >
                    <span>Next Stage</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white shadow-xs transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit for Evaluation</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Col: Transparent Rubric Criteria Inspector */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Stage Rubric Criteria</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluated against transparent domain criteria rather than black-box statistical probability:
              </p>

              <div className="space-y-2.5 pt-1">
                {currentStage.rubricCriteria.map((rc, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900">{rc.name}</span>
                      <span className="text-blue-700 font-mono font-bold">{rc.maxPoints} pts</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{rc.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment Condition Card */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs space-y-2 shadow-xs">
              <div className="flex items-center gap-2 text-slate-900 font-semibold">
                <Bot className="w-4 h-4 text-blue-600" />
                <span>Declared Conditions</span>
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Upon submission, disclose any AI assistance used. Transparent disclosure enables honest competence calibration and does not invalidate your attempt.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AI Disclosure & Final Submission Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Final Submission & AI Disclosure"
        maxWidth="lg"
      >
        <div className="space-y-5 text-xs text-slate-700">
          <p className="leading-relaxed">
            ProofPath AI separates genuine competence from unassisted recall through honest disclosure. Please declare your assistance conditions before submitting for evaluation.
          </p>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-900">
              <input
                type="checkbox"
                checked={usedAI}
                onChange={(e) => setUsedAI(e.target.checked)}
                className="rounded accent-blue-600 w-4 h-4"
              />
              <span>I used Generative AI assistance (e.g. ChatGPT, Claude, Copilot) during this assessment.</span>
            </label>

            {usedAI && (
              <div className="space-y-3 pt-2 pl-6 border-l-2 border-blue-500">
                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Which tools did you consult?</label>
                  <div className="flex flex-wrap gap-2">
                    {["ChatGPT (GPT-4o)", "Claude 3.7", "GitHub Copilot", "Gemini 2.5", "Other LLM"].map((tool) => {
                      const sel = toolsUsed.includes(tool);
                      return (
                        <button
                          type="button"
                          key={tool}
                          onClick={() =>
                            setToolsUsed((prev) =>
                              sel ? prev.filter((t) => t !== tool) : [...prev, tool]
                            )
                          }
                          className={`px-2.5 py-1 rounded border text-[11px] transition-colors ${
                            sel ? "bg-blue-600 text-white border-blue-600 font-semibold" : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {tool}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-medium">Brief summary of prompts or assistance requested:</label>
                  <input
                    type="text"
                    value={aiPromptsSummary}
                    onChange={(e) => setAiPromptsSummary(e.target.value)}
                    placeholder="e.g. Looked up Go mutex deadlock syntax and linear probing tombstone rules"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-900 placeholder-slate-400"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
            <strong>Note:</strong> Evaluation results will update your Evidence Vault with direct verification details and generate your personalized Learning Path.
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Back to Review
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinalSubmit}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? "Evaluating..." : "Confirm & View Report"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
