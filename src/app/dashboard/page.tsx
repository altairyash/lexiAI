"use client";
import "../globals.css";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Menu,
  X,
  Zap,
  Send,
  PanelLeftOpen,
  PanelLeftClose,
  ChevronDown,
  Database,
  Sparkles,
  Plus,
} from "lucide-react";
import Select, { StylesConfig, GroupBase, SingleValue } from "react-select";

import Answer from "@/components/dashboard/answer";
import { useNamespaceDetector } from "@/hooks/use-namespace-detector";
import { Namespace } from "@/types";
import { fetchNamespaces } from "../../utils/fetchNamespaces";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// ── Namespace selector styles ─────────────────────────────────────────────────
const selectStyles: StylesConfig<Namespace, false, GroupBase<Namespace>> = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: state.isFocused ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.07)",
    color: "#e5e5e5",
    borderRadius: "0.75rem",
    padding: "2px 4px",
    fontSize: "0.8rem",
    boxShadow: state.isFocused ? "0 0 0 1px rgba(124,58,237,0.3)" : "none",
    "&:hover": { borderColor: "rgba(124,58,237,0.35)" },
    transition: "all 0.2s",
    cursor: "pointer",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#0e0e14",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: "0.75rem",
    overflow: "hidden",
    boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "rgba(124,58,237,0.3)"
      : state.isFocused
      ? "rgba(255,255,255,0.05)"
      : "transparent",
    color: state.isSelected ? "#c4b5fd" : "#d4d4d4",
    cursor: "pointer",
    fontSize: "0.8rem",
    "&:active": { backgroundColor: "rgba(124,58,237,0.2)" },
  }),
  singleValue: (base) => ({ ...base, color: "#e5e5e5" }),
  input: (base) => ({ ...base, color: "#e5e5e5" }),
  placeholder: (base) => ({ ...base, color: "#525252" }),
  dropdownIndicator: (base) => ({ ...base, color: "#525252", "&:hover": { color: "#a78bfa" } }),
  indicatorSeparator: () => ({ display: "none" }),
};

// ── Types ─────────────────────────────────────────────────────────────────────
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
};

// ── Loader dots ───────────────────────────────────────────────────────────────
function LoaderDots() {
  return (
    <div className="flex items-center gap-1.5 py-2 px-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-violet-400"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.1, 0.8] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({
  hasNamespace,
  onOpenSidebar,
}: {
  hasNamespace: boolean;
  onOpenSidebar: () => void;
}) {
  const suggestions = [
    "How do I get started?",
    "What are the main concepts?",
    "Show me a code example",
    "How do I deploy this?",
  ];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center text-center h-full py-20 px-6"
    >
      <motion.div
        animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 5, repeat: Infinity, repeatDelay: 3 }}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center mb-6 shadow-xl shadow-violet-500/10"
      >
        <Zap className="w-7 h-7 text-violet-400" />
      </motion.div>
      <h2 className="text-xl font-bold text-white mb-2 tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
        {hasNamespace ? "What do you want to know?" : "Select a knowledge base"}
      </h2>
      <p className="text-neutral-600 text-sm max-w-sm leading-relaxed mb-8">
        {hasNamespace
          ? "Ask any question about your indexed documentation."
          : "Choose a namespace from the sidebar to start chatting with your docs."}
      </p>
      {!hasNamespace && (
        <button
          onClick={onOpenSidebar}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600/20 border border-violet-500/20 text-violet-300 text-sm font-medium hover:bg-violet-600/30 hover:border-violet-500/40 transition-all duration-200 cursor-pointer min-h-0 min-w-0"
        >
          <Database className="w-4 h-4" /> Browse knowledge bases
        </button>
      )}
      {hasNamespace && (
        <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
          {suggestions.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-neutral-500 text-xs text-left hover:border-violet-500/25 hover:bg-white/[0.04] hover:text-neutral-300 transition-all duration-200 cursor-default"
            >
              {s}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load initial state
  useEffect(() => {
    const storedNamespace = localStorage.getItem("selectedNamespace");
    const storedQuery = localStorage.getItem("query");
    if (storedNamespace) setSelectedNamespace(storedNamespace);
    if (storedQuery?.trim()) {
      const initialMsg: Message = { id: "init-1", role: "user", content: storedQuery };
      setMessages([initialMsg]);
      localStorage.removeItem("query");
      if (storedNamespace) {
        handleTriggerQuery(storedQuery, storedNamespace, [initialMsg]);
      } else {
        setInput(storedQuery);
      }
    }
  }, []);

  // Fetch namespaces
  useEffect(() => {
    fetchNamespaces(setNamespaces, () => {}, toast);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Namespace auto-detect
  useNamespaceDetector({
    namespaces,
    question: input,
    selectedNamespace,
    answer: "",
    showAnswer: false,
    onNamespaceDetected: (ns) => {
      if (ns !== selectedNamespace) {
        setSelectedNamespace(ns);
        toast.success(`Switched to "${ns}"`);
      }
    },
  });

  // Keyboard shortcut toggle sidebar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        setSidebarOpen((p) => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
  };

  const handleTriggerQuery = async (
    queryText: string,
    namespace: string,
    currentMessages: Message[]
  ) => {
    if (!queryText.trim() || !namespace) return;
    setIsLoading(true);
    const loadingId = "loading-" + Date.now();
    setMessages([
      ...currentMessages,
      { id: loadingId, role: "assistant", content: "", isLoading: true },
    ]);

    try {
      const chatHistory = currentMessages
        .filter((m) => !m.id.startsWith("loading-"))
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: queryText, namespace, chatHistory }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Query failed");
      }

      const data = await res.json();
      const answer = data.answer || data.message || "";
      if (!answer.trim()) throw new Error("No answer received");

      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId ? { ...m, content: answer, isLoading: false } : m
        )
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to fetch answer.";
      toast.error(msg);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId ? { ...m, content: `Error: ${msg}`, isLoading: false } : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = () => {
    if (!selectedNamespace) {
      toast.error("Please select a knowledge base first.");
      return;
    }
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    const q = input;
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    handleTriggerQuery(q, selectedNamespace, newMessages);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const clearConversation = () => {
    setMessages([]);
  };

  // ── Sidebar inner ──────────────────────────────────────────────────────────
  const SidebarContent = () => (
    <div className="flex flex-col h-full gap-5 p-5">
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 cursor-pointer group"
        onClick={() => router.push("/")}
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-600/25 group-hover:shadow-violet-600/40 transition-all duration-200">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-white font-bold text-sm tracking-tight group-hover:text-violet-300 transition-colors">
          Lexi AI
        </span>
        <span className="ml-auto text-[10px] text-neutral-700 font-mono">v2.1</span>
      </div>

      {/* New chat */}
      <button
        onClick={clearConversation}
        className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-neutral-400 text-xs font-medium hover:bg-white/[0.05] hover:text-white hover:border-white/[0.1] transition-all duration-200 cursor-pointer min-h-0 min-w-0"
      >
        <Plus className="w-3.5 h-3.5" /> New conversation
      </button>

      {/* Namespace section */}
      <div className="space-y-2">
        <label className="text-[10px] font-semibold text-neutral-600 uppercase tracking-[0.15em] flex items-center gap-1.5">
          <Database className="w-3 h-3" /> Knowledge Base
        </label>
        <Select
          instanceId="namespace-selector"
          options={namespaces}
          isSearchable
          styles={selectStyles}
          placeholder="Select namespace..."
          onChange={(e) => {
            setSelectedNamespace((e as SingleValue<Namespace>)?.value || null);
            setSidebarOpen(false);
          }}
          value={namespaces.find((ns) => ns.value === selectedNamespace)}
          className="react-select-container"
          classNamePrefix="react-select"
        />
        {selectedNamespace && (
          <p className="text-[10px] text-violet-400/70 mt-1 ml-1">
            ✓ {selectedNamespace}
          </p>
        )}
      </div>

      {/* Stats */}
      {namespaces.length > 0 && (
        <div className="p-3 rounded-xl border border-white/[0.04] bg-white/[0.02] space-y-1.5">
          <p className="text-[10px] text-neutral-600 font-semibold uppercase tracking-widest">
            Available
          </p>
          <p className="text-lg font-bold text-white">{namespaces.length}</p>
          <p className="text-[10px] text-neutral-600">knowledge bases indexed</p>
        </div>
      )}

      {/* Footer hint */}
      <div className="mt-auto pt-4 border-t border-white/[0.04]">
        <p className="text-[10px] text-neutral-700">
          Alt+B to toggle sidebar
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-[#060609] text-white overflow-hidden">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        toastStyle={{
          background: "#0e0e14",
          border: "1px solid rgba(255,255,255,0.07)",
          color: "#e5e5e5",
          fontSize: "0.8rem",
        }}
      />

      {/* ── Mobile overlay sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              className="fixed inset-y-0 left-0 w-72 bg-[#0b0b10] border-r border-white/[0.06] z-50 md:hidden overflow-y-auto"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/[0.06] text-neutral-500 hover:text-white transition-colors cursor-pointer min-h-0 min-w-0"
              >
                <X className="w-4 h-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Desktop sidebar ── */}
      <AnimatePresence mode="wait">
        {sidebarOpen && (
          <motion.aside
            key="desktop-sidebar"
            initial={{ x: -288, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -288, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="hidden md:flex flex-col w-72 flex-shrink-0 bg-[#0b0b10] border-r border-white/[0.06] overflow-y-auto"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0 relative">
        {/* Subtle grid bg */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Top bar */}
        <div className="relative z-20 flex items-center justify-between px-4 h-12 border-b border-white/[0.04] bg-[#060609]/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle */}
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-neutral-600 hover:text-white transition-colors cursor-pointer min-h-0 min-w-0"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </button>

            {/* Mobile menu */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-white/[0.06] text-neutral-600 hover:text-white transition-colors cursor-pointer min-h-0 min-w-0"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Namespace badge */}
            {selectedNamespace && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-medium"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                {selectedNamespace}
              </motion.div>
            )}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-neutral-700 font-mono">
            {messages.length > 0 && (
              <button
                onClick={clearConversation}
                className="text-neutral-600 hover:text-red-400 transition-colors cursor-pointer min-h-0 min-w-0 text-[10px] font-sans"
              >
                Clear
              </button>
            )}
            <span>{messages.filter(m => m.role === "user").length} msgs</span>
          </div>
        </div>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto relative z-10">
          <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-6 pb-32">
            {messages.length === 0 ? (
              <EmptyState
                hasNamespace={!!selectedNamespace}
                onOpenSidebar={() => setSidebarOpen(true)}
              />
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex w-full",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {msg.role === "user" ? (
                    <div className="max-w-[82%] px-4 py-3 rounded-2xl rounded-tr-sm bg-gradient-to-br from-violet-600/25 to-indigo-600/20 border border-violet-500/20 text-white text-sm leading-relaxed shadow-lg">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="flex gap-3 w-full max-w-full">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex-shrink-0 flex items-center justify-center mt-0.5 shadow-lg shadow-violet-600/20">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        {msg.isLoading ? (
                          <LoaderDots />
                        ) : (
                          <Answer answer={msg.content || ""} isLoading={false} />
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ── Input area ── */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[#060609] via-[#060609]/95 to-transparent pt-8 pb-5 px-4">
          <div className="max-w-3xl mx-auto">
            <div
              className={cn(
                "relative flex items-end gap-2 rounded-2xl border bg-[#0e0e14] shadow-2xl shadow-black/60 transition-all duration-200 p-3",
                !selectedNamespace
                  ? "border-white/[0.05] opacity-70"
                  : "border-white/[0.07] hover:border-violet-500/20 focus-within:border-violet-500/35"
              )}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedNamespace
                    ? "Ask anything about your documentation…"
                    : "Select a knowledge base to start"
                }
                disabled={!selectedNamespace || isLoading}
                className="flex-1 bg-transparent resize-none outline-none text-sm text-white placeholder-neutral-600 leading-relaxed font-sans overflow-y-auto max-h-40 py-1 px-1 disabled:cursor-not-allowed"
                style={{ minHeight: "24px" }}
              />
              <motion.button
                onClick={onSubmit}
                disabled={!selectedNamespace || !input.trim() || isLoading}
                whileHover={selectedNamespace && input.trim() && !isLoading ? { scale: 1.05 } : {}}
                whileTap={selectedNamespace && input.trim() && !isLoading ? { scale: 0.95 } : {}}
                className={cn(
                  "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer min-h-0 min-w-0",
                  selectedNamespace && input.trim() && !isLoading
                    ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/25 hover:from-violet-500 hover:to-indigo-500"
                    : "bg-white/[0.04] text-neutral-700 cursor-not-allowed"
                )}
                aria-label="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </motion.button>
            </div>
            <p className="text-center text-[10px] text-neutral-700 mt-2.5 font-mono">
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
