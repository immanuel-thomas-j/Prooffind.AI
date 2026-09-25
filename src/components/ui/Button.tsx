import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "emerald";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  children,
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs min-h-[36px] gap-1.5 font-mono",
    md: "px-4 py-2.5 text-xs sm:text-sm min-h-[44px] gap-2 font-medium",
    lg: "px-6 py-3.5 text-sm sm:text-base min-h-[48px] gap-2.5 font-semibold",
  }[size];

  const variantStyles = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-xs focus-visible:ring-blue-500 font-semibold",
    emerald:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs focus-visible:ring-emerald-500 font-semibold",
    secondary:
      "bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs focus-visible:ring-slate-400 font-medium",
    outline:
      "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 focus-visible:ring-slate-400 shadow-xs font-medium",
    danger:
      "bg-rose-600 hover:bg-rose-700 text-white shadow-xs focus-visible:ring-rose-500 font-semibold",
    ghost:
      "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400 font-medium",
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />}
      {children}
    </button>
  );
};
