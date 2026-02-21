"use client";
import "../globals.css";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Menu, X, Sparkles } from "lucide-react";

import NamespaceSelector from "@/components/dashboard/namespace-selector";
import Answer from "@/components/dashboard/answer";
import { useNamespaceDetector } from "@/hooks/use-namespace-detector";
import { Namespace } from "@/types";
import { fetchNamespaces } from "../../utils/fetchNamespaces";
import LoaderSVG from "@/custom-components/ui/loader-svg";
import { cn } from "@/lib/utils";
import { PlaceholdersAndVanishInput } from "@/components/ui/vanish-input";
import { motion, AnimatePresence } from "framer-motion";

// Minimal Dot Background Content
const DotBackground = () => (
    <div className="absolute inset-0 h-full w-full bg-black bg-dot-white/[0.1] flex items-center justify-center pointer-events-none z-0">
      <div className="absolute inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
    </div>
);

type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    isLoading?: boolean;
};

export default function Dashboard() {
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(null);
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial state
  useEffect(() => {
    setTimeout(() => setIsPageLoading(false), 800);

    const storedNamespace = localStorage.getItem("selectedNamespace");
    const storedQuery = localStorage.getItem("query");

    if (storedNamespace) setSelectedNamespace(storedNamespace);
    
    // If there was a pending query from landing page, execute it
    if (storedQuery && storedQuery.trim()) {
        const initialMsg: Message = { id: "init-1", role: "user", content: storedQuery };
        setMessages([initialMsg]);
        localStorage.removeItem("query"); // Clear it so it doesn't re-trigger on refresh
        
        // We delay slightly to ensure namespaces are loaded or just let the user see the input
        // But better to auto-submit if possible. 
        // For now, we pre-fill the input if we don't auto-submit, OR we add it to messages and trigger query.
        // Let's just setInput(storedQuery) to be safe if namespace isn't ready, 
        // OR if we have selectedNamespace, trigger it.
        if (storedNamespace) {
             handleTriggerQuery(storedQuery, storedNamespace, [initialMsg]);
        } else {
             setInput(storedQuery);
        }
    }
  }, []);

  // Fetch Namespaces
  useEffect(() => {
    fetchNamespaces(setNamespaces, () => {}, toast);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle Namespace Auto-Detect
  // We pass a dummy 'answer'/'showAnswer' to the hook/adapt it if needed, 
  // but simpler to just let it detect based on `input` or `messages`?
  // The hook watches "question". We can pass `input`.
  useNamespaceDetector({
    namespaces,
    question: input,
    selectedNamespace,
    answer: "", 
    showAnswer: false, 
    onNamespaceDetected: (detectedNs) => {
        if (detectedNs !== selectedNamespace) {
            setSelectedNamespace(detectedNs);
            toast.success(`Auto-switched to ${detectedNs}`);
        }
    }
  });

  // Toggle Sidebar shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "b") {
        event.preventDefault();
        setSidebarOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTriggerQuery = async (queryText: string, namespace: string, currentMessages: Message[]) => {
      if (!queryText.trim() || !namespace) return;

      setIsLoading(true);
      const loadingId = "loading-" + Date.now();
      
      // Add placeholder bot message
      setMessages([...currentMessages, { id: loadingId, role: "assistant", content: "", isLoading: true }]);

      try {
        // Extract previous messages for context (exclude loading placeholders)
        const chatHistory = currentMessages
          .filter(m => !m.id.startsWith("loading-"))
          .map(m => ({ role: m.role, content: m.content }));

        console.log(`📤 Sending query to API:`, {
          question: queryText,
          namespace: namespace,
          chatHistoryLength: chatHistory.length,
          chatHistory: chatHistory.map(m => `${m.role}: ${m.content.substring(0, 50)}...`)
        });

        const res = await fetch("/api/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              question: queryText, 
              namespace: namespace,
              chatHistory: chatHistory,
            }),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Query failed");
        }
        
        const data = await res.json();
        
        // Check if response has the expected structure
        if (!data || typeof data !== 'object') {
          throw new Error("Invalid response format");
        }
        
        // Handle both success: true format and direct answer format
        const answer = data.answer || data.message || "";
        
        if (!answer || answer.trim() === "") {
          throw new Error("No answer received from server");
        }
        
        // Update the loading message with the answer
        setMessages(prev => {
          const updated = prev.map(m => 
              m.id === loadingId ? { ...m, content: answer, isLoading: false } : m
          );
          // Force React to recognize the change
          return [...updated];
        });

      } catch (error) {
        console.error("Query error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch answer.";
        toast.error(errorMessage);
        
        // Update loading message with error instead of removing it
        setMessages(prev => prev.map(m => 
            m.id === loadingId 
                ? { ...m, content: `Error: ${errorMessage}`, isLoading: false } 
                : m
        ));
      } finally {
        setIsLoading(false);
      }
  };

  const onSubmit = () => {
    if (!selectedNamespace) {
        toast.error("Please select a namespace.");
        return;
    }
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    const currentInput = input;
    setInput("");

    handleTriggerQuery(currentInput, selectedNamespace, newMessages);
  };

  if (isPageLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black cursor-wait">
        <LoaderSVG />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-black text-white overflow-hidden font-sans selection:bg-neutral-800">
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />

      {/* Sidebar */}
      <AnimatePresence mode="popLayout">
        {sidebarOpen && (
          <>
            {/* Mobile Overlay Background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar Content */}
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 w-80 border-r border-neutral-800 bg-neutral-950 flex flex-col z-50 md:hidden"
            >
              <div className="p-6 flex flex-col h-full gap-6 overflow-y-auto">
                {/* Close Button - Mobile Only */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSidebarOpen(false)}
                  className="absolute top-4 right-4 bg-neutral-900 p-2 rounded-lg border border-neutral-800 cursor-pointer hover:border-emerald-500/50 transition-colors"
                >
                  <X size={20} className="text-white" />
                </motion.button>

                {/* Header */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 cursor-pointer group pr-10"
                  onClick={() => {
                    router.push("/");
                  }}
                >
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-shadow group-hover:shadow-emerald-500/40 flex-shrink-0"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </motion.div>
                  <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                    Lexi AI
                  </h1>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Knowledge Base</label>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <NamespaceSelector
                      namespaces={namespaces}
                      isLoading={false}
                      onSelect={(value) => {
                        setSelectedNamespace(value);
                        setSidebarOpen(false);
                      }}
                      currentSelected={selectedNamespace}
                    />
                        </motion.div>
                    </motion.div>

                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-auto pt-4 border-t border-neutral-900"
                  >
                    <div className="text-xs text-neutral-500">
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="cursor-default"
                      >
                        Tap to close
                      </motion.span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Always Visible on MD+ */}
      <div className="hidden md:flex h-full border-r border-neutral-800 bg-neutral-950 flex-col w-[300px]">
        <div className="p-6 flex flex-col h-full gap-6 overflow-y-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => router.push("/")}
          >
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-shadow group-hover:shadow-emerald-500/40 flex-shrink-0"
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
            <h1 className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              Lexi AI
            </h1>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider ml-1">Knowledge Base</label>
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <NamespaceSelector
                namespaces={namespaces}
                isLoading={false}
                onSelect={(value) => setSelectedNamespace(value)}
                currentSelected={selectedNamespace}
              />
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-auto pt-4 border-t border-neutral-900"
          >
            <div className="text-xs text-neutral-500 flex items-center justify-between">
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="cursor-default"
              >
                Cmd + B to toggle
              </motion.span>
              <span className="opacity-50">v2.1.0</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Menu Toggle Button - Only Show When Sidebar Closed */}
      {!sidebarOpen && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed top-4 left-4 z-50 md:hidden bg-neutral-900 p-2 rounded-lg border border-neutral-800 cursor-pointer hover:border-emerald-500/50 transition-colors"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} className="text-white" />
        </motion.button>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative bg-black overflow-hidden min-w-0">
        <DotBackground />
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full z-10 p-3 sm:p-4 md:p-8 relative">
             <div className="max-w-2xl sm:max-w-3xl mx-auto space-y-6 sm:space-y-8 pb-40 sm:pb-32 w-full px-2 sm:px-0">
                {messages.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="h-[50vh] sm:h-[60vh] flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4"
                    >
                         <motion.div 
                            animate={{ 
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ 
                                duration: 4,
                                repeat: Infinity,
                                repeatDelay: 2
                            }}
                            className="w-12 sm:w-16 h-12 sm:h-16 rounded-2xl bg-neutral-900 flex items-center justify-center border border-neutral-800 shadow-xl mb-2 sm:mb-4 hover:border-emerald-500/50 transition-colors cursor-pointer"
                            onClick={() => setSidebarOpen(true)}
                         >
                            <Sparkles className="w-6 sm:w-8 h-6 sm:h-8 text-emerald-400" />
                         </motion.div>
                         <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-xl sm:text-2xl font-bold text-neutral-200"
                         >
                            How can I help you today?
                         </motion.h2>
                         <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm sm:text-base text-neutral-500 max-w-xs sm:max-w-md"
                         >
                            Select a namespace on the left and ask any question about your documentation.
                         </motion.p>
                         <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="mt-4 text-xs text-neutral-600"
                         >
                            💡 Tip: Use <code className="bg-neutral-800 px-2 py-1 rounded text-emerald-400">npx lexi-ai</code> to index new docs
                         </motion.div>
                    </motion.div>
                ) : (
                    messages.map((msg, idx) => (
                        <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex w-full",
                                msg.role === "user" ? "justify-end" : "justify-start"
                            )}
                            id={idx.toString()}
                        >
                            {msg.role === "user" ? (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-neutral-800 text-white px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl rounded-tr-none max-w-[85%] sm:max-w-[80%] min-w-0 shadow-lg hover:bg-neutral-750 transition-colors"
                                >
                                    <p className="text-sm sm:text-base leading-relaxed break-words">{msg.content}</p>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="flex gap-2 sm:gap-4 w-full max-w-full relative z-10"
                                >
                                    <motion.div 
                                        whileHover={{ scale: 1.1 }}
                                        className="w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0 flex items-center justify-center mt-0 sm:mt-1 relative z-10 shadow-lg shadow-emerald-500/20"
                                    >
                                        <Sparkles className="w-3 sm:w-4 h-3 sm:h-4 text-white" />
                                    </motion.div>
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex-1 min-w-0 bg-neutral-900/90 rounded-2xl rounded-tl-none px-4 sm:px-5 py-3 sm:py-4 border border-neutral-800 shadow-lg relative z-10 hover:border-emerald-500/30 transition-colors"
                                    >
                                        <Answer answer={msg.content || ""} isLoading={!!msg.isLoading} />
                                    </motion.div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))
                )}
                <div ref={messagesEndRef} />
             </div>
        </div>

        {/* Floating Input Area */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-0 left-0 w-full p-3 sm:p-4 md:p-6 bg-gradient-to-t from-black via-black to-transparent z-30"
        >
            <div className="max-w-2xl sm:max-w-3xl mx-auto relative">
                <motion.div
                    whileFocus={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <PlaceholdersAndVanishInput
                        placeholders={[
                            "Ask anything about your docs...",
                            "How do I configure this?",
                            "Explain the architecture...",
                        ]}
                        onChange={(e) => setInput(e.target.value)}
                        onSubmit={() => onSubmit()}
                        value={input}
                        disabled={!selectedNamespace}
                    />
                </motion.div>
                {!selectedNamespace && (
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-xs text-red-400 mt-2"
                    >
                        Please select a namespace to start chatting
                    </motion.p>
                )}
            </div>
        </motion.div>
      </div>
    </div>
  );
}
