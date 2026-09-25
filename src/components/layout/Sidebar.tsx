"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  LayoutDashboard,
  User,
  FolderGit2,
  GitBranch,
  FileCheck2,
  Layers,
  Bot,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, badge: null },
  { href: "/onboarding", label: "Profile & Claims", icon: User, badge: null },
  { href: "/evidence", label: "Evidence Graph", icon: FolderGit2, badge: null },
  { href: "/skills", label: "Skill Matrix", icon: GitBranch, badge: null },
  { href: "/assessment", label: "Assessments", icon: FileCheck2, badge: null },
  { href: "/path", label: "Learning Path", icon: Layers, badge: null },
  { href: "/mentor", label: "Nexus AI Mentor", icon: Bot, badge: "AI" },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, profile, isLoggedIn, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayName = profile?.name || user?.name || "Candidate";
  const initial = displayName.charAt(0).toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-sm rounded-2xl md:my-3 md:ml-3 p-3 select-none">
      {/* Brand Header */}
      <div className="px-3 py-3 mb-2 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-sm relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/20 rounded-full blur-xl pointer-events-none" />
        <Link href="/" className="flex items-center gap-2.5 relative z-10" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center shadow-inner shrink-0">
            <ShieldCheck className="w-4 h-4 text-white drop-shadow" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-sm tracking-tight text-white block leading-none truncate">
              ProofPath<span className="text-cyan-400">.AI</span>
            </span>
            <span className="font-mono text-[8.5px] text-slate-300/80 uppercase tracking-widest block mt-1">
              Evidence Engine
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation section */}
      <div className="px-2 pt-2 pb-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Navigation</p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto py-1 pr-1 custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 relative ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/25 translate-x-0.5"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 active:scale-[0.98]"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 group-hover:bg-white text-slate-500 group-hover:text-blue-600 shadow-2xs"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span className="flex-1 truncate tracking-tight">{item.label}</span>

              {item.badge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide flex items-center gap-0.5 ${
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-indigo-50 text-indigo-600 border border-indigo-200/60"
                  }`}
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  {item.badge}
                </span>
              )}

              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 text-white/70 ml-auto" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile & Actions */}
      <div className="pt-3 mt-auto border-t border-slate-100 space-y-2">
        {isLoading ? (
          <div className="px-3 py-2 text-xs text-slate-400 animate-pulse">Checking session...</div>
        ) : isLoggedIn ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50/80 border border-slate-200/70 hover:border-slate-300 transition-all">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-slate-800 truncate block leading-tight">{displayName}</span>
                <span className="text-[9px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Connected
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50/80 border border-transparent hover:border-rose-100 transition-all active:scale-[0.98]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 w-full px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            Sign In
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 shadow-md text-slate-700 active:scale-95 transition-all"
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 p-2 transform transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </div>

      {/* Desktop floating rounded sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 z-30 pb-3">
        <SidebarContent />
      </aside>
    </>
  );
};
