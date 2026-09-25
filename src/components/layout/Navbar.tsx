"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Compass,
  FileCheck2,
  FolderGit2,
  GitBranch,
  Bot,
  HelpCircle,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, isLoggedIn, logout } = useAuth();

  // Full platform navigation items revealed ONLY for signed in users
  const authenticatedNavLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Compass },
    { href: "/skills", label: "Skill Graph", icon: GitBranch },
    { href: "/evidence", label: "Evidence Vault", icon: FolderGit2 },
    { href: "/assessment", label: "Assessments", icon: FileCheck2 },
    { href: "/path", label: "Learning Path", icon: ShieldCheck },
    { href: "/mentor", label: "Nexus Mentor", icon: Bot },
    { href: "/transparency", label: "Transparency", icon: HelpCircle },
  ];

  // Public navigation links when logged out
  const publicNavLinks = [
    { href: "/transparency", label: "Transparency & Boundaries", icon: HelpCircle },
  ];

  const currentNavLinks = isLoggedIn ? authenticatedNavLinks : publicNavLinks;
  const displayName = profile?.name || user?.name || "Candidate";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="shrink-0">
                <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 block leading-none whitespace-nowrap">
                  ProofPath<span className="text-blue-600">.AI</span>
                </span>
                <span className="font-mono text-[10px] text-slate-500 block tracking-wider uppercase mt-1 whitespace-nowrap">
                  Competence Protocol
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav - Only reveals full links when signed in */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1" aria-label="Main Navigation">
            {currentNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all min-h-[36px] ${
                    isActive
                      ? "bg-slate-100 text-blue-700 shadow-xs font-semibold border border-slate-200/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                  <span className="whitespace-nowrap">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Auth-aware Display */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs whitespace-nowrap shrink-0">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-semibold text-slate-800 max-w-[140px] truncate whitespace-nowrap">
                    {displayName}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-700 text-xs font-semibold shadow-xs transition-colors min-h-[36px] whitespace-nowrap shrink-0"
                  title="Sign out of account"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
                <Link
                  href="/login"
                  className="text-xs font-semibold px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-colors min-h-[36px] flex items-center whitespace-nowrap"
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="text-xs font-semibold px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors min-h-[36px] flex items-center whitespace-nowrap"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-5 space-y-1 shadow-lg">
          {isLoggedIn && (
            <div className="px-3.5 py-2 mb-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800 truncate">{displayName}</span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="text-rose-600 font-semibold flex items-center gap-1 shrink-0 ml-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {currentNavLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium min-h-[44px] transition-colors ${
                  isActive ? "bg-slate-100 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span className="whitespace-nowrap">{link.label}</span>
              </Link>
            );
          })}

          {!isLoggedIn && (
            <div className="pt-3 border-t border-slate-200 flex gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 min-h-[44px] flex items-center justify-center flex-1 whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-blue-600 text-white min-h-[44px] flex items-center justify-center flex-1 shadow-xs whitespace-nowrap"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
