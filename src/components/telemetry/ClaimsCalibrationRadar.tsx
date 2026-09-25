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

  // SVG Geometry for Triangle Radar (Calculated with generous boundary padding)
  // Center: (170, 115), Radius: 62
  const cx = 170;
  const cy = 115;
  const R = 62;

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
      {/* Clean Calibration Hero Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Context & Legend (4 cols) */}
          <div className="lg:col-span-4 space-y-3.5">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 block">
                Triangulated Calibration
              </span>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 mt-0.5">
                Claims vs Evidence vs Requirement
              </h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              Calibrates declared capabilities against verified sandbox results and target role benchmarks across 3 engineering axes.
            </p>

            {/* Legend */}
            <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-2 text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-xs bg-amber-500 shrink-0" />
                <span className="text-slate-700 font-semibold text-[11px]">Claimed (Self-Reported)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500 shrink-0" />
                <span className="text-slate-700 font-semibold text-[11px]">Evidenced (Tested/Verified)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-0.5 border-t-2 border-dashed border-rose-500 shrink-0" />
                <span className="text-slate-700 font-semibold text-[11px]">Required (Role Target)</span>
              </div>
            </div>
          </div>

          {/* Center Column: Radar Chart (4 cols) */}
          <div className="lg:col-span-4 flex items-center justify-center">
            <div className="relative p-5 bg-slate-950 text-white rounded-2xl border border-slate-800 shadow-md w-full max-w-[340px] flex flex-col items-center justify-between">
              {/* Top Label: Foundations */}
              <div className="text-center font-mono text-[11px] font-bold tracking-wider text-slate-200">
                Foundations
              </div>

              {/* Radar Chart Visual */}
              <div className="relative w-full flex items-center justify-center my-1">
                <svg width="220" height="170" viewBox="0 0 220 170" className="overflow-visible select-none">
                  {/* Concentric Guide Triangles */}
                  {[0.33, 0.66, 1.0].map((step, idx) => {
                    const cX = 110;
                    const cY = 95;
                    const rad = 65;
                    const getP = (r: number, ang: number) => ({
                      x: cX + r * rad * Math.cos(ang),
                      y: cY + r * rad * Math.sin(ang),
                    });
                    const p1 = getP(step, -Math.PI / 2);
                    const p2 = getP(step, Math.PI / 6);
                    const p3 = getP(step, (5 * Math.PI) / 6);
                    const pts = `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;

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
                  {[-Math.PI / 2, Math.PI / 6, (5 * Math.PI) / 6].map((ang, i) => {
                    const cX = 110;
                    const cY = 95;
                    const rad = 65;
                    const out = {
                      x: cX + rad * Math.cos(ang),
                      y: cY + rad * Math.sin(ang),
                    };
                    return (
                      <line
                        key={i}
                        x1={cX}
                        y1={cY}
                        x2={out.x}
                        y2={out.y}
                        stroke="#334155"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Polygon helper */}
                  {(() => {
                    const cX = 110;
                    const cY = 95;
                    const rad = 65;
                    const getP = (r: number, ang: number) => {
                      const clamped = Math.max(0.05, Math.min(1, r));
                      return {
                        x: cX + clamped * rad * Math.cos(ang),
                        y: cY + clamped * rad * Math.sin(ang),
                      };
                    };
                    const getPoly = (f: number, c: number, a: number) => {
                      const p1 = getP(f, -Math.PI / 2);
                      const p2 = getP(c, Math.PI / 6);
                      const p3 = getP(a, (5 * Math.PI) / 6);
                      return `${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`;
                    };

                    const reqPoly = getPoly(
                      radarMetrics.foundations.required,
                      radarMetrics.corePractice.required,
                      radarMetrics.appliedWork.required
                    );
                    const claimPoly = getPoly(
                      radarMetrics.foundations.claimed,
                      radarMetrics.corePractice.claimed,
                      radarMetrics.appliedWork.claimed
                    );
                    const evidPoly = getPoly(
                      radarMetrics.foundations.evidenced,
                      radarMetrics.corePractice.evidenced,
                      radarMetrics.appliedWork.evidenced
                    );

                    return (
                      <>
                        {/* 1. Required Area (Red dashed) */}
                        <polygon
                          points={reqPoly}
                          fill="rgba(239, 68, 68, 0.08)"
                          stroke="#EF4444"
                          strokeWidth="1.8"
                          strokeDasharray="4 4"
                        />

                        {/* 2. Claimed Area (Amber) */}
                        <polygon
                          points={claimPoly}
                          fill="rgba(245, 158, 11, 0.28)"
                          stroke="#F59E0B"
                          strokeWidth="1.8"
                        />

                        {/* 3. Evidenced Area (Green) */}
                        <polygon
                          points={evidPoly}
                          fill="rgba(16, 185, 129, 0.45)"
                          stroke="#10B981"
                          strokeWidth="2"
                        />
                      </>
                    );
                  })()}
                </svg>
              </div>

              {/* Bottom Labels: Applied Work on Left, Core Practice on Right */}
              <div className="w-full flex items-center justify-between font-mono text-[11px] font-bold tracking-wider text-slate-200 px-1 pt-1">
                <span>Applied work</span>
                <span>Core practice</span>
              </div>
            </div>
          </div>

          {/* Right Column: Status & Action (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-4 bg-amber-50/90 border border-amber-200/90 rounded-xl space-y-1.5 shadow-2xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                Discrepancy Status
              </span>
              <p className="text-xs text-amber-900 font-medium leading-relaxed">
                {skillsGap.length} {skillsGap.length === 1 ? "skill needs" : "skills need"} hands-on calibration to convert claims into proven proof.
              </p>
            </div>
            <Link
              href="/assessment"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs hover:shadow-sm transition-all active:scale-[0.99] min-h-[38px]"
            >
              <span>Take Calibration Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
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
