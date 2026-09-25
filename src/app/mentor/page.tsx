"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Shield,
  BookOpen,
} from "lucide-react";
import { mentorRepo } from "../../repositories/supabase/supabaseStore";
import { MentorMessage, MentorMode } from "../../domain/types";
import { NexusMentorService } from "../../services/nexusMentorService";
import { Card } from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { AuthGuard } from "../../components/auth/AuthGuard";

const MODES: { id: MentorMode; label: string; desc: string }[] = [
  { id: "LEARNING", label: "Learning Mode", desc: "Socratic systems inquiry with full discussion." },
  { id: "PRACTICE", label: "Practice Mode", desc: "Progressive hints and questions before code answers." },
  { id: "ASSESSMENT_PREP", label: "Assessment Prep", desc: "Format and rubric walkthroughs without answers." },
  { id: "ASSESSMENT", label: "Assessment Mode", desc: "Follows declared assessment conditions strictly." },
  { id: "REFLECTION", label: "Reflection Mode", desc: "Socratic reflection on trade-offs and lessons learned." },
];

export default function NexusMentorPage() {
  return (
    <AuthGuard
      fallbackTitle="Nexus Mentor Locked"
      fallbackDescription="Please sign in to access your private Socratic dialogs, practice hints, and reflective reasoning threads."
    >
      <NexusMentorContent />
    </AuthGuard>
  );
}

function NexusMentorContent() {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState<MentorMode>("LEARNING");
  const [messages, setMessages] = useState<MentorMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeUserId = user?.id || "";

  useEffect(() => {
    async function loadConv() {
      if (!activeUserId) return;
      const conv = await mentorRepo.getConversation(activeUserId, activeMode);
      if (conv && conv.messages.length > 0) {
        setMessages(conv.messages);
      } else {
        // Initial greeting tailored to mode
        const greeting = await NexusMentorService.query("Hello Nexus", activeMode);
        setMessages([greeting]);
        await mentorRepo.appendMessage(activeUserId, activeMode, greeting);
      }
    }
    loadConv();
  }, [activeMode, activeUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: MentorMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      content: text,
      mode: activeMode,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      await mentorRepo.appendMessage(activeUserId, activeMode, userMsg);
      const reply = await NexusMentorService.query(text, activeMode);
      setMessages((prev) => [...prev, reply]);
      await mentorRepo.appendMessage(activeUserId, activeMode, reply);
    } catch (err) {
      console.error("Mentor query error", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = async () => {
    if (confirm("Reset current conversation mode?")) {
      await mentorRepo.clearConversation(activeUserId);
      const greeting = await NexusMentorService.query("Hello Nexus", activeMode);
      setMessages([greeting]);
      await mentorRepo.appendMessage(activeUserId, activeMode, greeting);
    }
  };

  const currentModeInfo = MODES.find((m) => m.id === activeMode);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-3.5rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <Bot className="w-7 h-7 text-blue-600" />
              <span>Nexus AI Systems Mentor</span>
            </h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold font-mono">
              Socratic Engine
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            A mentor engineered to probe understanding, uncover trade-offs, and guide deliberate practice without completing your tasks for you.
          </p>
        </div>

        <button
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Chat</span>
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 shrink-0">
        {MODES.map((m) => {
          const isActive = m.id === activeMode;
          return (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              className={`p-2.5 text-left rounded-xl border text-xs transition-all shadow-xs ${
                isActive
                  ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                  : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <div className={`font-bold truncate ${isActive ? "text-white" : "text-slate-900"}`}>{m.label}</div>
              <div className={`text-[10px] truncate mt-0.5 ${isActive ? "text-blue-100" : "text-slate-500"}`}>{m.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Chat Container */}
      <Card className="flex-1 min-h-0 flex flex-col p-4 sm:p-6 bg-white border border-slate-200 shadow-xs overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-2 scroll-smooth">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-blue-600 text-white shadow-xs font-normal"
                      : "bg-slate-50 border border-slate-200 text-slate-800"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Suggested Question Chips */}
                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5">
                      <span className="text-[11px] font-semibold text-blue-700 block">
                        Explore further:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(q)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-medium transition-colors text-left shadow-xs"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Honest Limitation Tag */}
                  {msg.limitationsDisclosure && (
                    <div className="mt-2 text-[10px] text-slate-500 italic">
                      Boundary note: {msg.limitationsDisclosure}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 items-center text-xs text-slate-500">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <span className="animate-pulse">Nexus is formulating Socratic inquiry...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-3 mt-2 border-t border-slate-100 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask Nexus in ${currentModeInfo?.label}...`}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
