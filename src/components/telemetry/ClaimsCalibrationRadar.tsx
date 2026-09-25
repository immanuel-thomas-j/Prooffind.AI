"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  Sparkles,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { LearnerProfile, Skill, EvidenceItem, EvidenceCategory } from "../../domain/types";
import { EvidenceService } from "../../services/evidenceService";
import { Badge } from "../ui/Badge";

interface ClaimsCalibrationRadarProps {
  profile: LearnerProfile | null;
  skills: Skill[];
  evidenceList: EvidenceItem[];
  onEditProfile?: () => void;
}

export const ClaimsCalibrationRadar: React.FC<ClaimsCalibrationRadarProps> = ({
  profile,
  skills,
  evidenceList,
  onEditProfile,
}) => {
  // Compute analytics using EvidenceService
  const analysis = useMemo(() => {
    return EvidenceService.analyzeSkills(
      skills,
      profile?.selfReportedSkills || [],
      evidenceList
    );
  }, [profile, skills, evidenceList]);

  // Evidence tier counts
  const provenCount = useMemo(
    () => analysis.filter((a) => a.highestCategory === "PROVEN").length,
    [analysis]
  );
  const verifiedCount = useMemo(
    () => analysis.filter((a) => a.highestCategory === "VERIFIED").length,
    [analysis]
  );
  const inferredCount = useMemo(
    () => analysis.filter((a) => a.highestCategory === "INFERRED").length,
    [analysis]
  );
  const claimedCount = useMemo(
    () => analysis.filter((a) => a.highestCategory === "CLAIMED").length,
    [analysis]
  );

  // Group skills into 3 axes for the Radar:
  // 1. Foundations (Computer Science / Fundamental)
  // 2. Core practice (Backend Engineering / Intermediate)
  // 3. Applied work (Distributed Systems / Advanced)
  const radarMetrics = useMemo(() => {
    const foundationsSkills = skills.filter(
      (s) => s.category === "Computer Science" || s.difficulty === "Fundamental"
    );
    const coreSkills = skills.filter(
      (s) => s.category === "Backend Engineering" || s.difficulty === "Intermediate"
    );
    const appliedSkills = skills.filter(
      (s) => s.category === "Distributed Systems" || s.difficulty === "Advanced"
    );

    const calcAxis = (axisSkills: Skill[]) => {
      if (axisSkills.length === 0) return { claimed: 0.05, evidenced: 0.05, required: 0.85 };

      const ids = new Set(axisSkills.map((s) => s.id));
      const axisAnalysis = analysis.filter((a) => ids.has(a.skillId));

      // 1. Claimed ratio: skills in this axis claimed by the user (or with evidence)
      const claimedSkillsCount = axisAnalysis.filter(
        (a) => a.highestCategory !== "UNCLAIMED"
      ).length;

      const claimedRatio = axisSkills.length > 0
        ? claimedSkillsCount === 0
          ? 0.05
          : Math.min(1, Math.max(0.15, claimedSkillsCount / axisSkills.length))
        : 0.05;

      // 2. Evidenced ratio: skills in this axis with VERIFIED or PROVEN evidence
      const evidencedSkillsCount = axisAnalysis.filter(
        (a) => a.highestCategory === "VERIFIED" || a.highestCategory === "PROVEN"
      ).length;

      const evidencedRatio = axisSkills.length > 0
        ? evidencedSkillsCount === 0
          ? 0.05
          : Math.min(1, Math.max(0.15, evidencedSkillsCount / axisSkills.length))
        : 0.05;

      // 3. Required target based on role
      const requiredRatio = profile?.experienceLevel === "Advanced" ? 0.95 : 0.85;

      return {
        claimed: claimedRatio,
        evidenced: evidencedRatio,
        required: requiredRatio,
      };
    };

    return {
      foundations: calcAxis(foundationsSkills),
      corePractice: calcAxis(coreSkills),
      appliedWork: calcAxis(appliedSkills),
    };
  }, [skills, analysis, profile]);

  // SVG Geometry for Triangle Radar
  // Center: (150, 140), Radius: 85
  const cx = 150;
  const cy = 135;
  const R = 85;

  // Angles in radians:
  // Top: -PI/2 (Foundations)
  // Bottom-Right: PI/6 (Core Practice)
  // Bottom-Left: 5*PI/6 (Applied Work)
  const angleFoundations = -Math.PI / 2;
  const angleCore = Math.PI / 6;
  const angleApplied = (5 * Math.PI) / 6;

  const getPoint = (ratio: number, angle: number) => {
    const clamped = Math.max(0.05, Math.min(1, ratio));
    return {
      x: cx + clamped * R * Math.cos(angle),
      y: cy + clamped * R * Math.sin(angle),
    };
  };

  // Polygon points strings
  const polyString = (f: number, c: number, a: number) => {
    const p1 = getPoint(f, angleFoundations);
    const p2 = getPoint(c, angleCore);
    const p3 = getPoint(a, angleApplied);
    return `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;
  };

  const requiredPolygon = polyString(
    radarMetrics.foundations.required,
    radarMetrics.corePractice.required,
    radarMetrics.appliedWork.required
  );

  const claimedPolygon = polyString(
    radarMetrics.foundations.claimed,
    radarMetrics.corePractice.claimed,
    radarMetrics.appliedWork.claimed
  );

  const evidencedPolygon = polyString(
    radarMetrics.foundations.evidenced,
    radarMetrics.corePractice.evidenced,
    radarMetrics.appliedWork.evidenced
  );

  // Divide skills into Skills Gap vs Good Skills
  const skillsGap = useMemo(() => {
    return analysis.filter(
      (a) => a.hasDiscrepancy || a.highestCategory === "CLAIMED" || a.highestCategory === "INFERRED"
    );
  }, [analysis]);

  const goodSkills = useMemo(() => {
    return analysis.filter(
      (a) => a.highestCategory === "VERIFIED" || a.highestCategory === "PROVEN"
    );
  }, [analysis]);

  return (
    <div className="space-y-6">
      {/* 2 Main Hero Calibration Cards (Dark aesthetic from uploaded reference) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Card: Claims vs evidence vs requirement Radar */}
        <div className="bg-[#0B0F17] text-white border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white mb-1">
              Claims vs evidence vs requirement
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
              <span className="text-amber-400 font-semibold">Amber</span> = what you claim •{" "}
              <span className="text-emerald-400 font-semibold">green</span> = what your data proves •{" "}
              <span className="text-rose-400 font-semibold">red dashes</span> = what your goal demands.
            </p>

            {/* Radar Spider/Triangle Chart */}
            <div className="relative flex items-center justify-center py-2">
              <svg width="300" height="250" viewBox="0 0 300 250" className="overflow-visible select-none">
                {/* Concentric Guide Triangles */}
                {[0.33, 0.66, 1.0].map((step, idx) => {
                  const pts = polyString(step, step, step);
                  return (
                    <polygon
                      key={idx}
                      points={pts}
                      fill="none"
                      stroke="#1E293B"
                      strokeWidth={idx === 2 ? "1.5" : "1"}
                      strokeDasharray={idx < 2 ? "3 3" : undefined}
                    />
                  );
                })}

                {/* Radial Axis Lines */}
                {[angleFoundations, angleCore, angleApplied].map((ang, i) => {
                  const outer = getPoint(1.0, ang);
                  return (
                    <line
                      key={i}
                      x1={cx}
                      y1={cy}
                      x2={outer.x}
                      y2={outer.y}
                      stroke="#334155"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* 1. Required Area (Red dashed) */}
                <polygon
                  points={requiredPolygon}
                  fill="rgba(239, 68, 68, 0.08)"
                  stroke="#EF4444"
                  strokeWidth="1.8"
                  strokeDasharray="4 4"
                />

                {/* 2. Claimed Area (Amber) */}
                <polygon
                  points={claimedPolygon}
                  fill="rgba(245, 158, 11, 0.28)"
                  stroke="#F59E0B"
                  strokeWidth="1.8"
                />

                {/* 3. Evidenced Area (Green) */}
                <polygon
                  points={evidencedPolygon}
                  fill="rgba(16, 185, 129, 0.45)"
                  stroke="#10B981"
                  strokeWidth="2"
                />

                {/* Axis Labels */}
                <text
                  x={cx}
                  y={cy - R - 14}
                  textAnchor="middle"
                  className="fill-slate-300 font-mono text-[11px] font-semibold tracking-wider"
                >
                  Foundations
                </text>
                <text
                  x={cx + R * Math.cos(angleCore) + 12}
                  y={cy + R * Math.sin(angleCore) + 14}
                  textAnchor="start"
                  className="fill-slate-300 font-mono text-[11px] font-semibold tracking-wider"
                >
                  Core practice
                </text>
                <text
                  x={cx + R * Math.cos(angleApplied) - 12}
                  y={cy + R * Math.sin(angleApplied) + 14}
                  textAnchor="end"
                  className="fill-slate-300 font-mono text-[11px] font-semibold tracking-wider"
                >
                  Applied work
                </text>
              </svg>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-5 pt-3 border-t border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-amber-500" />
              <span className="text-slate-300">Claimed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-xs bg-emerald-500" />
              <span className="text-slate-300">Evidenced</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-rose-500" />
              <span className="text-slate-300">Required</span>
            </div>
          </div>
        </div>

        {/* Right Card: Evidence tiers */}
        <div className="bg-[#0B0F17] text-white border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Evidence tiers
                </h2>
                {onEditProfile && (
                  <button
                    onClick={onEditProfile}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Edit Claims
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                How each skill belief is backed right now.
              </p>
            </div>

            {/* Tier Rows */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div>
                  <span className="text-xs font-bold text-white block">Proven</span>
                  <span className="text-[11px] text-slate-400 font-sans">
                    Real artefacts (GitHub, contexts)
                  </span>
                </div>
                <span className="font-mono text-xl font-bold text-emerald-400">{provenCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div>
                  <span className="text-xs font-bold text-white block">Verified</span>
                  <span className="text-[11px] text-slate-400 font-sans">Confirmed by assessment</span>
                </div>
                <span className="font-mono text-xl font-bold text-sky-400">{verifiedCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div>
                  <span className="text-xs font-bold text-white block">Claimed</span>
                  <span className="text-[11px] text-slate-400 font-sans">Self-reported only</span>
                </div>
                <span className="font-mono text-xl font-bold text-amber-400">{claimedCount}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                <div>
                  <span className="text-xs font-bold text-white block">Inferred</span>
                  <span className="text-[11px] text-slate-400 font-sans">Weak signals</span>
                </div>
                <span className="font-mono text-xl font-bold text-slate-400">{inferredCount}</span>
              </div>
            </div>
          </div>

          {/* Alert Callout */}
          <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed font-sans">
            <span className="font-semibold text-amber-300">
              {skillsGap.length} skill{skillsGap.length === 1 ? "" : "s"} show a claim-evidence gap.
            </span>{" "}
            The next step will audit these competencies with a structured calibration assessment.
          </div>
        </div>
      </div>

      {/* SKILLS GAP & GOOD SKILLS SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        {/* SECTION 1: Skills Gap (Requires Calibration) */}
        <div className="bg-white border border-amber-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-amber-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Skills Gap ({skillsGap.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Claimed or required skills lacking verified proof
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              Needs Calibration
            </span>
          </div>

          {skillsGap.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              All claimed skills have verified backing! Zero discrepancies detected.
            </div>
          ) : (
            <div className="space-y-3">
              {skillsGap.map((item) => (
                <div
                  key={item.skillId}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{item.skillName}</span>
                      <Badge type="category" value={item.highestCategory} size="sm" />
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                      {item.discrepancyExplanation || item.confidenceExplanation}
                    </p>
                  </div>

                  <Link
                    href={`/assessment?skill=${item.skillId}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shrink-0 transition-colors shadow-xs"
                  >
                    <span>Calibrate</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: Good Skills (Demonstrated Competencies) */}
        <div className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Good Skills ({goodSkills.length})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Verified or proven through sandbox assessments & artifacts
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Verified Proof
            </span>
          </div>

          {goodSkills.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
              <p className="text-xs text-slate-600 font-medium">
                No skills proven under assessment conditions yet.
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                Take an assessment or upload code evidence to convert your claimed skills into verified proof.
              </p>
              <div className="pt-2">
                <Link
                  href="/assessment"
                  className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  <span>Start First Assessment</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {goodSkills.map((item) => (
                <div
                  key={item.skillId}
                  className="p-3.5 bg-emerald-50/40 border border-emerald-200 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{item.skillName}</span>
                      <Badge type="category" value={item.highestCategory} size="sm" />
                    </div>
                    <p className="text-[11px] text-emerald-900 font-sans">
                      {item.confidenceExplanation}
                    </p>
                  </div>

                  <Link
                    href={`/skills`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 shrink-0 font-mono"
                  >
                    <span>View DAG</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
