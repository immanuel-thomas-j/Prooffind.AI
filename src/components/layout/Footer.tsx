"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Info } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-slate-900 tracking-tight">ProofPath AI</span>
            </div>
            <p className="text-sm text-slate-600 max-w-md">
              Evidence-based adaptive learning and genuine competence assessment platform for the Generative-AI era.
              Don&apos;t ask learners what they think they know. Check what they can prove.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
              <Info className="w-4 h-4 text-sky-600" />
              <span>
                Committed to honest AI evaluation boundaries. No fake authorship detectors.
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Platform
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Learner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/skills" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Skill Graph & DAG
                </Link>
              </li>
              <li>
                <Link href="/evidence" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Evidence Vault
                </Link>
              </li>
              <li>
                <Link href="/assessment" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Competence Assessments
                </Link>
              </li>
              <li>
                <Link href="/mentor" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Nexus AI Mentor
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3">
              Transparency & Ethics
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/transparency" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Product Boundaries
                </Link>
              </li>
              <li>
                <Link href="/transparency#evidence-matrix" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Evidence Signal Matrix
                </Link>
              </li>
              <li>
                <Link href="/transparency#discrepancy" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Skill-Evidence Discrepancy
                </Link>
              </li>
              <li>
                <Link href="/transparency" className="text-slate-600 hover:text-blue-600 transition-colors">
                  Platform Architecture & Integrity
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 ProofPath AI. All rights reserved.</p>
          <p>
            Independent competence verification protocol for modern engineering teams.
          </p>
        </div>
      </div>
    </footer>
  );
};
