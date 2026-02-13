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
  const [cache, setCache] = useState<{ [key: string]: string }>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial state
  useEffect(() => {
    setTimeout(() => setIsPageLoading(false), 800);

    const storedCache = localStorage.getItem("cache");
    const storedNamespace = localStorage.getItem("selectedNamespace");
    const storedQuery = localStorage.getItem("query");

    if (storedCache) setCache(JSON.parse(storedCache));
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

  // Sync cache
  useEffect(() => localStorage.setItem("cache", JSON.stringify(cache)), [cache]);
  useEffect(() => { if (selectedNamespace) localStorage.setItem("selectedNamespace", selectedNamespace); }, [selectedNamespace]);

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

      // Check cache
      const cacheKey = `${namespace}-${queryText.trim().toLowerCase()}`;
      if (cache[cacheKey]) {
           setMessages(prev => prev.map(m => 
                m.id === loadingId ? { ...m, content: cache[cacheKey], isLoading: false } : m
           ));
           setIsLoading(false);
           return;
      }

      try {
        const res = await fetch("/api/query", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ question: queryText, namespace: namespace }),
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
        setCache(prev => ({ ...prev, [cacheKey]: answer }));

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

      {/* Mobile Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed top-4 left-4 z-50 md:hidden bg-neutral-900 p-2 rounded-lg border border-neutral-800 cursor-pointer hover:border-emerald-500/50 transition-colors"
        onClick={() => setSidebarOpen((prev) => !prev)}
      >
        <motion.div
          animate={{ rotate: sidebarOpen ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </motion.div>
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence mode="popLayout">
        {sidebarOpen && (
             <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                className="h-full border-r border-neutral-800 bg-neutral-950 flex flex-col z-40"
             >
                <div className="p-6 flex flex-col h-full gap-6 w-[300px]">
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
                            className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-shadow group-hover:shadow-emerald-500/40"
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
             </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative bg-black overflow-hidden min-w-0">
        <DotBackground />
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full z-10 p-4 md:p-8 relative">
             <div className="max-w-3xl mx-auto space-y-8 pb-32 w-full">
                {messages.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4"
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
                            className="w-16 h-16 rounded-2xl bg-neutral-900 flex items-center justify-center border border-neutral-800 shadow-xl mb-4 hover:border-emerald-500/50 transition-colors cursor-pointer"
                            onClick={() => setSidebarOpen(true)}
                         >
                            <Sparkles className="w-8 h-8 text-emerald-400" />
                         </motion.div>
                         <motion.h2 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-2xl font-bold text-neutral-200"
                         >
                            How can I help you today?
                         </motion.h2>
                         <motion.p 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-neutral-500 max-w-md"
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
                                    className="bg-neutral-800 text-white px-5 py-3.5 rounded-2xl rounded-tr-none max-w-[80%] min-w-0 shadow-lg hover:bg-neutral-750 transition-colors"
                                >
                                    <p className="text-sm md:text-base leading-relaxed break-words">{msg.content}</p>
                                </motion.div>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="flex gap-4 w-full max-w-full relative z-10"
                                >
                                    <motion.div 
                                        whileHover={{ scale: 1.1 }}
                                        className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex-shrink-0 flex items-center justify-center mt-1 relative z-10 shadow-lg shadow-emerald-500/20"
                                    >
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </motion.div>
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex-1 min-w-0 bg-neutral-900/90 rounded-2xl rounded-tl-none px-5 py-4 border border-neutral-800 shadow-lg relative z-10 hover:border-emerald-500/30 transition-colors"
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
            className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-black via-black to-transparent z-30"
        >
            <div className="max-w-3xl mx-auto relative">
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
