import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "subtle" | "highlight" | "terminal";
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  variant = "default",
  ...props
}) => {
  const variantStyles = {
    default: "bg-white border border-slate-200 shadow-sm text-slate-900",
    subtle: "bg-slate-50/80 border border-slate-200/80 text-slate-800",
    highlight: "bg-blue-50/60 border border-blue-200 text-slate-900 shadow-sm",
    terminal: "bg-slate-900 border border-slate-800 text-slate-100 font-mono shadow-inner",
  }[variant];

  return (
    <div
      className={`rounded-xl p-5 transition-all ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
