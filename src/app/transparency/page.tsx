"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Scale,
  BrainCircuit,
  Lock,
  Database,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { EVIDENCE_SIGNAL_MATRIX } from "../../services/evidenceService";
import { Card } from "../../components/ui/Card";

export default function TransparencyPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
            Ethics & Product Boundaries
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
          <span>ProofPath Transparency & Governance</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-3xl leading-relaxed">
          In the Generative-AI era, platforms must be rigorously honest about what they can and cannot prove.
          Here is ProofPath AI&apos;s architectural contract, evidence taxonomy, and boundary declarations.
        </p>
      </div>

      {/* 4 Pillars of Integrity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-3 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5 text-sky-700">
            <Lock className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-slate-900">1. No Unreliable AI-Authorship Detection</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            We reject the industry trend of claiming statistical AI detectors can definitively distinguish human vs AI authored code.
            Repositories may contain AI-generated snippets, copied code, multi-contributor commits, or code the user memorized.
            ProofPath relies instead on interactive code comprehension, controlled modification tasks, and novel transfer challenges.
          </p>
        </Card>

        <Card className="p-6 space-y-3 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5 text-amber-700">
            <BrainCircuit className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">2. Skill-Evidence Discrepancy (No Psychological Labels)</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            We never diagnose learners with psychological labels like the &quot;Dunning–Kruger effect&quot;.
            Instead, we measure a <strong>Skill-Evidence Discrepancy</strong>: a meaningful difference between claimed proficiency and currently evaluated evidence.
            This is treated neutrally as an actionable invitation for targeted assessment, not as evidence of dishonesty or cognitive bias.
          </p>
        </Card>

        <Card className="p-6 space-y-3 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5 text-emerald-700">
            <Scale className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">3. Evidence is Not Automatically Proof</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Evidence is categorized into <strong>CLAIMED</strong>, <strong>INFERRED</strong>, <strong>VERIFIED</strong>, and <strong>PROVEN</strong>.
            A public GitHub repository or resume claim is classified as INFERRED or CLAIMED.
            It is <span className="underline decoration-rose-500 font-semibold text-rose-600">never</span> marked as PROVEN without a structured assessment demonstrating independent application.
          </p>
        </Card>

        <Card className="p-6 space-y-3 bg-white border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5 text-purple-700">
            <Info className="w-5 h-5 text-purple-600" />
            <h2 className="text-base font-bold text-slate-900">4. Honest Uncertainty Disclosures</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            We never present arbitrary scores as scientifically validated absolute truth.
            Every assessment result explains what was assessed, what conditions applied (e.g. AI-allowed vs restricted), what the result supports, and what it does not establish.
          </p>
        </Card>
      </div>

      {/* Signal Reality Matrix */}
      <section id="evidence-matrix" className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Scale className="w-5 h-5 text-blue-600" />
          <span>Evidence Signal Reality Matrix</span>
        </h2>
        <div className="bg-white border border-slate-200 rounded-3xl p-6 overflow-x-auto shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-slate-700 uppercase tracking-wider bg-slate-50 font-mono">
              <tr>
                <th className="py-3 px-4">Evidence Signal</th>
                <th className="py-3 px-4 text-emerald-700">What It Indicates</th>
                <th className="py-3 px-4 text-amber-700">What It Cannot Prove</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {EVIDENCE_SIGNAL_MATRIX.map((m, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 font-mono">{m.signal}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-sans">{m.whatItIndicates}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-sans">{m.whatItCannotProve}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Cryptographically Auditable Records & Integrity Boundaries */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900">Cryptographically Auditable Integrity Records</h2>
        </div>
        <Card className="p-6 space-y-4 bg-white border border-slate-200 shadow-xs">
          <p className="text-xs text-slate-600 leading-relaxed font-sans">
            Every candidate assessment and evidence record on ProofPath is sealed with a deterministic SHA-256 fingerprint that binds the verified rubric criteria, testing conditions, code patches, and AI disclosure logs together into an auditable record.
          </p>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-950 font-sans">
            <span className="font-bold flex items-center gap-1.5 text-amber-900">
              <Info className="w-4 h-4 text-amber-700" />
              Epistemic Boundary: Cryptographic Record Integrity ≠ Blanket Competence
            </span>
            <p className="text-[11px] leading-relaxed text-amber-900/90">
              Cryptography proves that the assessment log, intermediate scratchpad, audio defense transcripts, and test runner outputs have not been altered after submission. It does <em>not</em> prove universal, context-free mastery. ProofPath explicitly bounds all claims to: <strong>Demonstrated competence within the assessed task invariants under declared conditions.</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-sans">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block">Auditable Integrity Records</span>
              <p className="text-slate-500 text-[11px]">Reports can be cryptographically exported as portable JSON audit payloads with verification hashes.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block">Zero Unchecked AI Claims</span>
              <p className="text-slate-500 text-[11px]">All repository signals are quarantined as INFERRED until verified in direct sandbox challenges.</p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-900 block">Scoped Competence Definitions</span>
              <p className="text-slate-500 text-[11px]">Competence is verified per task invariant (e.g. linear probe deletion invariants), not broad blanket claims.</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Assessment Validity & Experimental Evaluation Framework */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-slate-900">Assessment Validity & Experimental Framework</h2>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900">How We Evaluate Assessment Validity</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              To verify that ProofPath distinguishes genuine understanding better than conventional final-code grading, we design assessments around a multi-arm experimental evaluation model:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-900 font-mono text-[11px] block">COHORT STUDY DESIGN</span>
              <p className="text-slate-700 leading-relaxed">
                <strong>Group A (Unassisted Learners):</strong> Complete problems under conventional conditions without generative AI.<br />
                <strong>Group B (AI-Assisted Learners):</strong> Solve problems with continuous access to frontier LLMs (ChatGPT, Claude, Copilot).
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-slate-900 font-mono text-[11px] block">VALIDATION METRICS</span>
              <ul className="text-slate-700 space-y-1 list-disc list-inside text-[11px]">
                <li><strong>Transfer Task Delta:</strong> Ability to apply core invariants to unmemorized novel architectures.</li>
                <li><strong>Adversarial Consistency:</strong> Defending edge cases without LLM re-prompting.</li>
                <li><strong>False Positive Suppression:</strong> Detecting surface fluency without comprehension.</li>
                <li><strong>Inter-Rater Reliability:</strong> Objective rubric agreement between human evaluators.</li>
              </ul>
            </div>
          </div>

          {/* Comparative Methodology Table */}
          <div className="border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-mono text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Assessment Method</th>
                  <th className="py-2.5 px-3">GenAI Vulnerability</th>
                  <th className="py-2.5 px-3">Signal Reality</th>
                  <th className="py-2.5 px-3">ProofPath Implementation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">1. Final Code Artifact Only</td>
                  <td className="py-2.5 px-3 text-rose-600 font-medium">Critical (100% LLM generable)</td>
                  <td className="py-2.5 px-3 text-slate-600">Proves code exists; cannot prove human understanding</td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono">Quarantined to INFERRED</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">2. Code + Text Summary</td>
                  <td className="py-2.5 px-3 text-amber-600 font-medium">High (LLMs generate articulate prose)</td>
                  <td className="py-2.5 px-3 text-slate-600">Tests vocabulary recall, not process grasp</td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono">Supplemented with Oral Defense</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">3. ProofPath Multi-Stage Engine</td>
                  <td className="py-2.5 px-3 text-emerald-600 font-medium">Resistant (Invariants + Spoken + Transfer)</td>
                  <td className="py-2.5 px-3 text-slate-600">Captures thought process before code, plus unscripted spoken defense</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-semibold font-mono">Core Assessment Flow</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
