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
    <div className="flex flex-col h-full bg-white border border-slate-200/90 shadow-xs rounded-2xl md:my-3 md:ml-3 p-4 select-none">
      {/* Clean Brand Header */}
      <div className="px-2 py-3 mb-4 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs group-hover:bg-blue-700 transition-colors shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-sm text-slate-900 tracking-tight leading-none">
              ProofPath<span className="text-blue-600">.AI</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-1">
              Evidence Engine
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation section */}
      <div className="px-2 mb-2">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Navigation</p>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-bold shadow-2xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
              <span className="flex-1 truncate tracking-tight">{item.label}</span>

              {item.badge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide flex items-center gap-0.5 ${
                    isActive
                      ? "bg-blue-100/80 text-blue-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Sparkles className="w-2.5 h-2.5 text-blue-600" />
                  {item.badge}
                </span>
              )}

              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-auto shrink-0" />
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
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50/80 border border-slate-200/80">
              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-semibold text-slate-800 truncate block leading-tight">{displayName}</span>
                <span className="text-[9px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Online
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center gap-1.5 w-full px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
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
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-xl bg-white border border-slate-200 shadow-md text-slate-700 active:scale-95 transition-all"
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity"
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
