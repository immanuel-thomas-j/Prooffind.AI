"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, RotateCcw, ArrowRight } from "lucide-react";
import { learnerRepo } from "../../repositories/supabase/supabaseStore";

interface DemoBannerProps {
  isDemo?: boolean;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ isDemo = true }) => {
  if (!isDemo) return null;

  const handleReset = async () => {
    if (confirm("Reset demo data to initial state?")) {
      await learnerRepo.resetToDemo();
      window.location.reload();
    }
  };

  return (
    <div className="bg-gradient-to-r from-navy-900 via-brand-950/60 to-navy-900 border-b border-brand-500/30 px-4 py-2 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          <span className="font-semibold text-brand-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> DEMO MODE:
          </span>
          <span className="text-slate-300">
            Currently displaying fictional systems engineer profile (<strong className="text-white font-medium">Alex Rivera</strong>). All data is simulated for review.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo</span>
          </button>
          <span className="text-slate-700">|</span>
          <Link
            href="/onboarding"
            className="flex items-center gap-1 text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            <span>Create Your Profile</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};
