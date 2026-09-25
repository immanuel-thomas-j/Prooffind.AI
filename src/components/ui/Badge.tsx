"use client";

import React from "react";
import { EvidenceCategory, CompetenceStatus, AIAssistanceCondition } from "../../domain/types";
import { ShieldCheck, AlertCircle, HelpCircle, CheckCircle2, Bot, Lock } from "lucide-react";

interface BadgeProps {
  type: "category" | "status" | "condition" | "neutral";
  value: EvidenceCategory | CompetenceStatus | AIAssistanceCondition | string;
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ type, value, size = "md", className = "" }) => {
  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1 font-medium";

  // Category Badges
  if (type === "category") {
    switch (value) {
      case "PROVEN":
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold ${sizeClasses} ${className}`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
            <span>PROVEN</span>
          </span>
        );
      case "VERIFIED":
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-semibold ${sizeClasses} ${className}`}>
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
            <span>VERIFIED</span>
          </span>
        );
      case "INFERRED":
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-sky-50 text-sky-800 border border-sky-300 font-semibold ${sizeClasses} ${className}`}>
            <HelpCircle className="w-3.5 h-3.5 text-sky-600" aria-hidden="true" />
            <span>INFERRED</span>
          </span>
        );
      case "UNCLAIMED":
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 font-medium ${sizeClasses} ${className}`}>
            <span>UNCLAIMED</span>
          </span>
        );
      case "CLAIMED":
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-semibold ${sizeClasses} ${className}`}>
            <AlertCircle className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
            <span>CLAIMED</span>
          </span>
        );
    }
  }

  // Condition Badges
  if (type === "condition") {
    switch (value) {
      case "AI_ALLOWED":
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-medium ${sizeClasses} ${className}`}>
            <Bot className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Assistance Allowed</span>
          </span>
        );
      case "AI_RESTRICTED":
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 font-medium ${sizeClasses} ${className}`}>
            <Lock className="w-3.5 h-3.5 text-rose-600" />
            <span>AI Restricted Mode</span>
          </span>
        );
      case "AI_DISCLOSURE_REQUIRED":
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium ${sizeClasses} ${className}`}>
            <Bot className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Disclosure Required</span>
          </span>
        );
      case "PRACTICE_MODE":
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-medium ${sizeClasses} ${className}`}>
            <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
            <span>Practice Mode</span>
          </span>
        );
    }
  }

  // Competence Status Badges
  if (type === "status") {
    const label = String(value).replace(/_/g, " ");
    let colorClass = "bg-slate-100 text-slate-700 border-slate-300 font-medium";
    if (value === "DEMONSTRATED_IN_ASSESSED_CONTEXT") {
      colorClass = "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold";
    } else if (value === "PARTIALLY_DEMONSTRATED") {
      colorClass = "bg-amber-50 text-amber-800 border-amber-300 font-semibold";
    } else if (value === "REQUIRES_TRANSFER_VALIDATION") {
      colorClass = "bg-sky-50 text-sky-800 border-sky-300 font-semibold";
    }

    return (
      <span className={`inline-flex items-center gap-1 rounded-full border ${colorClass} ${sizeClasses} ${className}`}>
        {label}
      </span>
    );
  }

  // Neutral Badge
  return (
    <span className={`inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-medium ${sizeClasses} ${className}`}>
      {value}
    </span>
  );
};
