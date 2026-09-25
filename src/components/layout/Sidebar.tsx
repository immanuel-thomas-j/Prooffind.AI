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
  HelpCircle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/onboarding", label: "Profile & Claims", icon: User },
  { href: "/evidence", label: "Evidence", icon: FolderGit2 },
  { href: "/skills", label: "Skills", icon: GitBranch },
  { href: "/assessment", label: "Assessments", icon: FileCheck2 },
  { href: "/path", label: "Learning Path", icon: Layers },
  { href: "/mentor", label: "Nexus Mentor", icon: Bot },
];

const PUBLIC_ITEMS = [
  { href: "/transparency", label: "Transparency", icon: HelpCircle },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, profile, isLoggedIn, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const displayName = profile?.name || user?.name || "Candidate";
  const initial = displayName.charAt(0).toUpperCase();

  const navLinks = isLoggedIn ? [...NAV_ITEMS, ...PUBLIC_ITEMS] : PUBLIC_ITEMS;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-slate-900 block leading-none">
              ProofPath<span className="text-blue-600">.AI</span>
            </span>
            <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider">
              Evidence & Calibration
            </span>
          </div>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
              <span>{item.label}</span>
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Area */}
      <div className="px-2 py-4 border-t border-slate-100">
        {isLoading ? (
          <div className="px-3 py-2 text-xs text-slate-400">Loading...</div>
        ) : isLoggedIn ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {initial}
              </div>
              <span className="text-xs font-semibold text-slate-800 truncate flex-1">{displayName}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center justify-center w-full px-3 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            Sign In
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
        className="lg:hidden fixed top-3 left-3 z-50 p-2 rounded-xl bg-white border border-slate-200 shadow-sm text-slate-600"
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-60 bg-white border-r border-slate-200 transform transition-transform duration-200 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </div>

      {/* Desktop sidebar - always visible */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0 overflow-y-auto">
        <SidebarContent />
      </aside>
    </>
  );
};
