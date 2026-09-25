"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, isLoggedIn, isLoading, login, signUp, logout } = useAuth();

  const [mode, setMode] = useState<"SIGN_IN" | "SIGN_UP">("SIGN_IN");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, display active session card with Logout option
  if (!isLoading && isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs mb-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Already Logged In
          </h1>
          <p className="text-xs text-slate-600">
            You are signed in as <span className="font-semibold text-slate-900">{profile?.name || user?.name || user?.email}</span>.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between items-center font-mono">
              <span className="text-slate-500">Candidate</span>
              <span className="font-bold text-slate-800">{profile?.name || user?.name}</span>
            </div>
            <div className="flex justify-between items-center font-mono">
              <span className="text-slate-500">Email</span>
              <span className="text-slate-700">{user?.email}</span>
            </div>
            {profile?.targetRole && (
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-500">Role</span>
                <span className="text-blue-700 font-semibold">{profile.targetRole}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2.5 pt-2">
            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors min-h-[44px]"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={logout}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-700 font-semibold text-xs shadow-xs transition-colors min-h-[44px]"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "SIGN_IN") {
        const res = await login(email, password);
        if (res.success) {
          router.push("/dashboard");
        } else {
          setErrorMsg(res.error || "Failed to sign in. Please verify your credentials.");
        }
      } else {
        if (!name.trim()) {
          setErrorMsg("Please enter your full name.");
          setIsSubmitting(false);
          return;
        }
        const res = await signUp(email, password || "solvix-auth-pass-2026", name, targetRole || "Software Engineer");
        if (res.success) {
          router.push("/dashboard");
        } else {
          setErrorMsg(res.error || "Sign up failed. Please try again.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLoginImmanuel = async () => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const res = await login("immanuel.thomas@solvix.ai", "solvix-auth-pass-2026");
      if (res.success) {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono text-slate-500">Checking authentication state...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 shadow-xs mb-2">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {mode === "SIGN_IN" ? "Sign in to ProofPath AI" : "Create Candidate Account"}
        </h1>
        <p className="text-xs text-slate-600">
          {mode === "SIGN_IN"
            ? "Access your verified competence records, DAG path, and evidence vault."
            : "Start your structured competency verification journey."}
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setMode("SIGN_IN");
            setErrorMsg("");
          }}
          className={`flex-1 py-2 rounded-lg transition-all ${
            mode === "SIGN_IN"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("SIGN_UP");
            setErrorMsg("");
          }}
          className={`flex-1 py-2 rounded-lg transition-all ${
            mode === "SIGN_UP"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-4"
      >
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {mode === "SIGN_UP" && (
          <>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Immanuel Thomas J"
                  className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[42px]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Backend Engineer"
                className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[42px]"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="candidate@solvix.ai"
              className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[42px]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Password <span className="text-slate-400 font-normal">(Optional for direct sign-in)</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[42px]"
          />
        </div>

        <Button
          type="submit"
          isLoading={isSubmitting}
          variant="primary"
          size="md"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs min-h-[44px]"
        >
          <span>{mode === "SIGN_IN" ? "Sign In to Dashboard" : "Create Account & Continue"}</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </Button>

        {/* Quick Candidate Sign In Option */}
        <div className="pt-3 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={handleQuickLoginImmanuel}
            disabled={isSubmitting}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors min-h-[40px]"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Sign in as Immanuel Thomas J</span>
          </button>
        </div>
      </form>
    </div>
  );
}
