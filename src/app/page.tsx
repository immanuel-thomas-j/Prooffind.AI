"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  GitBranch,
  FileCode2,
  Sparkles,
  Info,
  Scale,
  BrainCircuit,
  Lock,
  Terminal,
  Code2,
  Workflow,
  Fingerprint,
} from "lucide-react";
import { EVIDENCE_SIGNAL_MATRIX } from "../services/evidenceService";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const { isLoggedIn, profile, user } = useAuth();

  return (
    <div className="space-y-20 py-8">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8 pb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-mono mb-6">
          <Terminal className="w-3.5 h-3.5" />
          <span>Competence Verification Protocol for the Generative-AI Era</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          Prove what you know. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700">
            Discover what to learn next.
          </span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Don&apos;t ask learners what they think they know. Check what they can prove.
          Distinguish AI-assisted code output from independently demonstrated systems understanding.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] min-h-[44px]"
              >
                <span>Continue to Dashboard ({profile?.name || user?.name || "Candidate"})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/evidence"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-xs transition-all min-h-[44px]"
              >
                <span>Evidence Vault</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] min-h-[44px]"
              >
                <span>Start Verification Journey</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-xs transition-all min-h-[44px]"
              >
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>No Pseudo-AI Detectors</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>4 Evidence Tiers (Claimed to Proven)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>DAG Prerequisite Engine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Deterministic Rubric Verification</span>
          </div>
        </div>
      </section>

      {/* Side-by-Side: The Paradox of AI-Generated Code */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Box 1: The Illusion of Public Signals */}
          <div className="bg-white border border-rose-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-rose-700 font-semibold uppercase tracking-wider">
                Traditional Surface Signals
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                Easily Faked with LLMs
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">The Illusion of Public Artifacts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Anyone can prompt an AI model to generate 500 lines of clean Go or TypeScript, commit it to GitHub with green contribution tiles, and claim proficiency on a resume.
            </p>

            <div className="space-y-2 pt-2 font-mono text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-slate-700">
                <span>Green GitHub Commit Tiles</span>
                <span className="text-rose-600 font-semibold">≠ Independent Authorship</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-slate-700">
                <span>Copied Code Passing CI Tests</span>
                <span className="text-rose-600 font-semibold">≠ Debugging Competence</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-slate-700">
                <span>Self-Reported Resume Bullets</span>
                <span className="text-rose-600 font-semibold">≠ Production Resilience</span>
              </div>
            </div>
          </div>

          {/* Box 2: How ProofPath Verifies Genuine Understanding */}
          <div className="bg-white border border-blue-200 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm shadow-blue-500/5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-blue-700 font-semibold uppercase tracking-wider">
                ProofPath Verification Protocol
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold">
                Direct Proof Required
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Interactive Multi-Stage Assessment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ProofPath tests what learners can explain, debug, and transfer to novel unpracticed systems environments under declared conditions.
            </p>

            <div className="space-y-2 pt-2 font-mono text-xs">
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between text-slate-800">
                <span>1. Concept Mechanics Explanation</span>
                <span className="text-emerald-700 font-semibold">Evaluates Deep Invariants</span>
              </div>
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between text-slate-800">
                <span>2. Controlled Bug Remediation</span>
                <span className="text-emerald-700 font-semibold">Tests Active Debugging</span>
              </div>
              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex items-center justify-between text-slate-800">
                <span>3. Novel Problem Transfer</span>
                <span className="text-emerald-700 font-semibold">Proves Unmemorized Synthesis</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Strict Evidence Tiers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            The 4 ProofPath Evidence Tiers
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Strict boundaries ensure no candidate is labeled &quot;proven&quot; based on indirect repository existence alone.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-2 shadow-xs">
            <span className="font-mono text-xs text-slate-500 font-semibold uppercase">01 • CLAIMED</span>
            <h3 className="text-sm font-bold text-slate-900">Self-Reported Claim</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Learner states they know a skill on their profile or resume. Unevaluated starting signal.
            </p>
          </div>

          <div className="bg-white border border-sky-200 p-5 rounded-xl space-y-2 shadow-xs">
            <span className="font-mono text-xs text-sky-700 font-semibold uppercase">02 • INFERRED</span>
            <h3 className="text-sm font-bold text-slate-900">Indirect Artifact</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Public GitHub repo, LeetCode profile, or commit history. Proves code existence, not independent understanding.
            </p>
          </div>

          <div className="bg-white border border-amber-200 p-5 rounded-xl space-y-2 shadow-xs">
            <span className="font-mono text-xs text-amber-700 font-semibold uppercase">03 • VERIFIED</span>
            <h3 className="text-sm font-bold text-slate-900">Controlled Demonstration</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Passed controlled code modification or live explanation with explicitly documented boundaries.
            </p>
          </div>

          <div className="bg-emerald-50/60 border border-emerald-300 p-5 rounded-xl space-y-2 shadow-xs">
            <span className="font-mono text-xs text-emerald-800 font-semibold uppercase">04 • PROVEN</span>
            <h3 className="text-sm font-bold text-emerald-950">Direct Competence</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Directly demonstrated in multi-stage challenge with novel transfer problem and declared AI usage conditions.
            </p>
          </div>
        </div>
      </section>

      {/* Signal Reality Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <Scale className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">Evidence Signal Reality Matrix</h2>
              <p className="text-xs text-slate-600">
                Rigorous transparency: What external indicators demonstrate vs what they cannot prove.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-slate-700 uppercase tracking-wider font-mono bg-slate-50">
                <tr>
                  <th className="py-3 px-4">Evidence Signal</th>
                  <th className="py-3 px-4 text-emerald-700">What It Indicates</th>
                  <th className="py-3 px-4 text-amber-700">What It Cannot Prove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {EVIDENCE_SIGNAL_MATRIX.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 font-mono">{item.signal}</td>
                    <td className="py-3 px-4 text-slate-700">{item.whatItIndicates}</td>
                    <td className="py-3 px-4 text-slate-500">{item.whatItCannotProve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Product Boundaries Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-rose-600 text-xs font-mono font-semibold uppercase">
              <Lock className="w-4 h-4" />
              <span>No AI Detection Theater</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">No Fabricated Detectors</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We never claim to determine code authorship with statistical certainty. Instead, we ask learners to explain, debug, and transfer concepts interactively.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-amber-600 text-xs font-mono font-semibold uppercase">
              <BrainCircuit className="w-4 h-4" />
              <span>No Psychological Diagnoses</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Skill-Evidence Discrepancy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We never diagnose learners with &quot;Dunning–Kruger&quot;. When self-claims exceed observed evidence, we flag an objective discrepancy and offer calibration.
            </p>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-blue-600 text-xs font-mono font-semibold uppercase">
              <Info className="w-4 h-4" />
              <span>Uncertainty Disclosures</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Honest Boundaries</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every report clearly documents assessment conditions (e.g. AI-allowed vs restricted) and states what the result supports and does not establish.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-8">
        <div className="bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 border border-blue-200 rounded-2xl p-10 shadow-sm">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Ready to prove what you know?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mb-6">
            Create your profile, link your claims, locate your skill discrepancies, and take your first structured calibration assessment.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors min-h-[44px]"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors min-h-[44px]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs border border-slate-300 shadow-xs transition-colors font-mono min-h-[44px]"
                >
                  <span>Sign In</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
