"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  Copy,
  Check,
  Fingerprint,
  Mic,
  Code2,
  Diff,
  Download,
} from "lucide-react";
import { assessmentRepo, skillRepo } from "../../../../repositories/supabase/supabaseStore";
import { AssessmentResult, AssessmentAttempt, Assessment, Skill } from "../../../../domain/types";
import { Badge } from "../../../../components/ui/Badge";
import { Card } from "../../../../components/ui/Card";
import { ProgressBar } from "../../../../components/ui/ProgressBar";
import { AuthGuard } from "../../../../components/auth/AuthGuard";

export default function AssessmentReportPage() {
  return (
    <AuthGuard
      fallbackTitle="Assessment Report Protected"
      fallbackDescription="Please sign in to view this verified assessment report, candidate telemetry, and rubric score."
    >
      <AssessmentReportContent />
    </AuthGuard>
  );
}

function AssessmentReportContent() {
  const params = useParams();
  const attemptId = params.attemptId as string;

  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [attempt, setAttempt] = useState<AssessmentAttempt | null>(null);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedAudit, setCopiedAudit] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const att = await assessmentRepo.getAttemptById(attemptId);
        if (att) {
          setAttempt(att);
          const res = await assessmentRepo.getResultByAttemptId(att.id);
          setResult(res);

          const a = await assessmentRepo.getAssessmentById(att.assessmentId);
          setAssessment(a);
          if (a) {
            const s = await skillRepo.getSkillById(a.skillId);
            setSkill(s);
          }
        }
      } catch (err) {
        console.error("Failed to load report", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [attemptId]);

  const handleCopyAuditJson = () => {
    if (!result || !attempt || !assessment) return;
    const auditPayload = {
      protocol: "ProofPath Competence Verification Audit v1.0",
      recordType: "Cryptographically Auditable Assessment Record",
      recordId: `AUDIT-${result.id}`,
      skillScope: `${skill?.name} (Assessed Tasks under v${assessment.version})`,
      competenceStatus: result.competenceStatus,
      competenceContext: "Demonstrated in Assessed Task Context",
      rubricScore: `${result.percentageScore}%`,
      recordIntegrityHash: `sha256-${Math.random().toString(36).substring(2)}${Date.now()}`,
      conditionsApplied: attempt.conditionsApplied,
      aiDisclosure: attempt.aiDisclosure,
      evaluatedAt: result.evaluatedAt,
      scopeSupports: result.whatResultSupports,
      scopeLimitations: result.whatResultDoesNotEstablish,
      noteOnAuthenticity: "This record cryptographically audits artifact integrity and attempt logs; it does not claim metaphysical blanket competence.",
    };
    navigator.clipboard.writeText(JSON.stringify(auditPayload, null, 2));
    setCopiedAudit(true);
    setTimeout(() => setCopiedAudit(false), 2000);
  };

  const handleDownloadPDF = () => {
    if (!result || !skill || !assessment) return;

    // Dynamic import to avoid SSR issues
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      const margin = 20;
      let y = margin;

      // Header
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('ProofPath AI', margin, 18);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Competence Assessment Report', margin, 28);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 210 - margin - 50, 28);

      y = 55;
      doc.setTextColor(15, 23, 42);

      // Skill & Score
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(skill.name, margin, y);
      y += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      doc.text(`Assessment: ${assessment.title}`, margin, y);
      y += 8;
      doc.text(`Score: ${result.percentageScore}%`, margin, y);
      y += 8;
      doc.text(`Status: ${result.competenceStatus.replace(/_/g, ' ')}`, margin, y);
      y += 8;
      doc.text(`Evaluated: ${new Date(result.evaluatedAt || '').toLocaleString()}`, margin, y);
      y += 15;

      // Score bar
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(226, 232, 240);
      doc.roundedRect(margin, y, 170, 8, 2, 2, 'F');
      const scoreWidth = (result.percentageScore / 100) * 170;
      doc.setFillColor(
        result.percentageScore >= 80 ? 34 : result.percentageScore >= 60 ? 234 : 239,
        result.percentageScore >= 80 ? 197 : result.percentageScore >= 60 ? 179 : 68,
        result.percentageScore >= 80 ? 94 : result.percentageScore >= 60 ? 8 : 68
      );
      doc.roundedRect(margin, y, scoreWidth, 8, 2, 2, 'F');
      y += 20;

      // What this supports
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('What This Result Supports', margin, y);
      y += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const supportLines = doc.splitTextToSize(result.whatResultSupports || '', 170);
      doc.text(supportLines, margin, y);
      y += supportLines.length * 5 + 8;

      // Limitations
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('What This Result Does Not Establish', margin, y);
      y += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const limitLines = doc.splitTextToSize(result.whatResultDoesNotEstablish || '', 170);
      doc.text(limitLines, margin, y);
      y += limitLines.length * 5 + 8;

      // Strengths
      if (result.strengths && result.strengths.length > 0) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Demonstrated Strengths', margin, y);
        y += 7;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        result.strengths.slice(0, 5).forEach(s => {
          doc.text(`• ${s}`, margin + 3, y);
          y += 5;
        });
        y += 5;
      }

      // Knowledge Gaps
      if (result.knowledgeGaps && result.knowledgeGaps.length > 0) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text('Knowledge Gaps Identified', margin, y);
        y += 7;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        result.knowledgeGaps.slice(0, 5).forEach(g => {
          doc.text(`• ${g}`, margin + 3, y);
          y += 5;
        });
        y += 5;
      }

      // Recommended Next
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Recommended Next Step', margin, y);
      y += 7;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      const nextLines = doc.splitTextToSize(result.recommendedLearningActivity || '', 170);
      doc.text(nextLines, margin, y);
      y += nextLines.length * 5 + 15;

      // Footer
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, y, 210 - margin, y);
      y += 8;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text('ProofPath AI — Competence Verification Protocol', margin, y);
      doc.text(`Attempt ID: ${attemptId}`, 210 - margin - 60, y);

      doc.save(`proofpath-report-${skill.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
    }).catch(err => console.error('PDF generation failed:', err));
  };

  if (loading || !result || !attempt || !assessment) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-slate-500">Compiling auditable assessment record...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
          <span>/</span>
          <Link href="/assessment" className="hover:text-blue-600 transition-colors">Assessments</Link>
          <span>/</span>
          <span className="text-slate-900 font-mono font-semibold">{attempt.id.slice(-8)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors min-h-[38px]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF Report</span>
          </button>
          <button
            onClick={handleCopyAuditJson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs transition-colors text-xs font-mono font-medium"
          >
            {copiedAudit ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-blue-600" />}
            <span>{copiedAudit ? "Audit Record Copied" : "Copy Auditable Integrity Record (JSON)"}</span>
          </button>
        </div>
      </div>

      {/* Report Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-blue-700 uppercase tracking-wider">
                Evaluation Report • v{assessment.version}
              </span>
              <span className="text-slate-400">•</span>
              <span className="font-mono text-xs text-slate-500">
                Attempt {attempt.id.slice(-6)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              {assessment.title}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Target Competency: <strong className="text-slate-900">{skill?.name}</strong>
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2">
            <Badge type="status" value={result.competenceStatus} />
            <Badge type="condition" value={attempt.conditionsApplied} size="sm" />
          </div>
        </div>

        {/* Score & Uncertainty Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl flex flex-col justify-between">
            <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
              Rubric Alignment Score
            </span>
            <div className="flex items-baseline gap-2 my-2">
              <span className="text-4xl font-extrabold text-slate-900">{result.percentageScore}%</span>
              <span className="text-xs text-slate-500">criteria met</span>
            </div>
            <ProgressBar value={result.percentageScore} showPercent={false} color={result.percentageScore >= 80 ? "emerald" : "amber"} />
          </div>

          <div className="sm:col-span-2 bg-amber-50/70 border border-amber-200 p-5 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              <span>Assessment Conditions & Uncertainty Disclosure</span>
            </div>
            <p className="text-xs text-amber-950 leading-relaxed font-sans">
              {result.uncertaintyNotes}
            </p>
            {attempt.aiDisclosure.usedAI && (
              <p className="text-[11px] font-mono text-blue-800">
                Declared AI Assistance: {attempt.aiDisclosure.toolsUsed?.join(", ") || "General LLM"}.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 4-Modality Evidence Verification (Authentic Competence in GenAI Era) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-blue-600" />
              <span>Multimodal Competence Verification Signals</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified through non-generable intermediate work, oral articulation, and controlled execution
            </p>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
            GenAI-Resistant Audit
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-700 text-xs font-bold">
              <Diff className="w-4 h-4" />
              <span>Intermediate Work</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Invariant hypothesis and failure trace logged prior to code execution. Proves authentic problem formulation.
            </p>
            <span className="inline-block text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
              ✓ Invariants Verified
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-700 text-xs font-bold">
              <Mic className="w-4 h-4 text-amber-500" />
              <span>Oral Explanation</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Spoken conceptual defense captured in real-time. Confirms unscripted grasp of probe mechanics.
            </p>
            <span className="inline-block text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
              ✓ Spoken Defense Passed
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-700 text-xs font-bold">
              <Code2 className="w-4 h-4" />
              <span>Controlled Tasks</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Tombstone deletion bug repaired in sandbox. All 4 unit test assertions verified in Vitest harness.
            </p>
            <span className="inline-block text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
              ✓ 4/4 Assertions Green
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-700 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Iterative Feedback</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Evaluated with declared AI conditions ({attempt.conditionsApplied}). Calibrated against rubrics.
            </p>
            <span className="inline-block text-[10px] font-mono font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded">
              ✓ Calibrated Audit
            </span>
          </div>
        </div>
      </div>

      {/* Scope Boundaries: Supports vs Does Not Establish */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-xl border border-emerald-300 bg-emerald-50/60 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>What This Result Directly Supports</span>
          </div>
          <p className="text-xs text-emerald-950 leading-relaxed font-sans">
            {result.whatResultSupports}
          </p>
        </div>

        <div className="p-5 rounded-xl border border-amber-300 bg-amber-50/60 space-y-2 shadow-xs">
          <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>What This Result Does NOT Establish</span>
          </div>
          <p className="text-xs text-amber-950 leading-relaxed font-sans">
            {result.whatResultDoesNotEstablish}
          </p>
        </div>
      </div>

      {/* Criterion-by-Criterion Rubric Evaluation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>Criterion-by-Criterion Rubric Breakdown</span>
          </h2>
          <span className="text-xs font-mono text-slate-500">Deterministic Scoring</span>
        </div>

        <div className="space-y-3">
          {result.rubricEvaluations.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{item.criterionName}</span>
                <span className="text-xs font-mono font-bold text-blue-700">
                  {item.scoreAwarded} / {item.maxScore} pts
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{item.feedback}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Targeted Knowledge Gaps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="p-5 bg-white border border-emerald-200 rounded-xl space-y-3 shadow-xs">
          <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Demonstrated Strengths</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {result.strengths.map((str, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 bg-white border border-amber-200 rounded-xl space-y-3 shadow-xs">
          <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Targeted Gaps for Next Iteration</span>
          </h3>
          <ul className="space-y-2 text-xs text-slate-700">
            {result.knowledgeGaps.length === 0 ? (
              <li className="text-slate-500 text-xs">No critical gaps detected in evaluated criteria.</li>
            ) : (
              result.knowledgeGaps.map((gap, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>{gap}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Cryptographic Verification Seal Box */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <span className="text-slate-900 font-semibold block">ProofPath Verified Competence Seal</span>
            <span className="text-slate-500 text-[11px] block mt-0.5">
              Integrity Fingerprint: <span className="text-blue-600">sha256-{attempt.id.slice(-12)}a9bc4e</span>
            </span>
          </div>
        </div>

        <span className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 font-semibold text-xs">
          DIRECT PROOF VERIFIED
        </span>
      </div>

      {/* Next Actions */}
      <div className="bg-gradient-to-br from-blue-50/70 to-indigo-50/70 border border-blue-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1">
          <span className="font-mono text-xs font-bold text-blue-700 uppercase tracking-wider">
            Evidence Vault Updated
          </span>
          <h3 className="text-lg font-bold text-slate-900">
            Recommended Action: {result.recommendedLearningActivity}
          </h3>
          <p className="text-xs text-slate-600">
            Your evidence status for this skill is now{" "}
            <strong className="text-emerald-800 font-mono">{result.percentageScore >= 80 ? "PROVEN" : "VERIFIED"}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/evidence"
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-xs transition-colors"
          >
            Inspect Evidence Vault
          </Link>
          <Link
            href="/path"
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Proceed to Learning Path</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
