"use client";

import React from "react";
import Link from "next/link";
import { Lock, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallbackTitle = "Authentication Required",
  fallbackDescription = "Please sign in to access your verified competence records, skill telemetry, and evidence vault.",
}) => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-slate-500">Checking authentication session...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 shadow-xs mb-2">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{fallbackTitle}</h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{fallbackDescription}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="space-y-2.5">
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors min-h-[44px]"
            >
              <span>Sign In with Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs shadow-xs transition-colors min-h-[44px]"
            >
              <span>Create Candidate Account</span>
            </Link>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="font-mono text-[11px] text-slate-400">
              Only signed-in candidates can access personal records & assessments.
            </span>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
