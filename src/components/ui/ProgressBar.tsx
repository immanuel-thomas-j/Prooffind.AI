import React from "react";

interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercent?: boolean;
  color?: "brand" | "emerald" | "amber";
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercent = true,
  color = "brand",
  className = "",
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  const colorClasses = {
    brand: "bg-brand-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
  }[color];

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercent) && (
        <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
          <span>{label}</span>
          {showPercent && <span className="font-mono text-slate-800">{clamped}%</span>}
        </div>
      )}
      <div
        className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorClasses}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};
