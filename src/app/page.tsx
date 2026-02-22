"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { NeuralBackground } from "@/components/ui/neural-background";
import { Typewriter } from "react-simple-typewriter";
import {
  Github,
  Terminal,
  Zap,
  Search,
  MessageSquare,
  Database,
  ArrowRight,
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

// ── Tiny helper ─────────────────────────────────────────────────────────────
function cn(...classes: (string | undefined | false | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// ── Floating navbar ──────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-10 h-16 transition-all duration-500",
        scrolled
          ? "bg-black/70 backdrop-blur-xl border-b border-white/5 shadow-xl shadow-black/40"
          : "bg-transparent"
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Zap className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-bold text-white tracking-tight text-sm">Lexi AI</span>
      </div>
      <div className="hidden md:flex items-center gap-8 text-sm text-neutral-400">
        <a href="#how" className="hover:text-white transition-colors">How it works</a>
        <a href="#features" className="hover:text-white transition-colors">Features</a>
        <a
          href="https://github.com/altairyash/lexiAI"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-white transition-colors no-underline"
        >
          <Github className="w-3.5 h-3.5" /> GitHub
        </a>
      </div>
    </motion.nav>
  );
}

// ── Command snippet with copy ─────────────────────────────────────────────────
function CommandSnippet({ cmd }: { cmd: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm font-mono text-sm w-full max-w-lg">
      <span className="text-neutral-600 select-none">$</span>
      <span className="flex-1 text-neutral-300 truncate">{cmd}</span>
      <button
        onClick={copy}
        className="text-neutral-500 hover:text-white transition-colors cursor-pointer p-1 rounded min-h-0 min-w-0"
        aria-label="Copy command"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-violet-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// ── Bento feature card ────────────────────────────────────────────────────────
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
  delay?: number;
  wide?: boolean;
}
function FeatureCard({ icon, title, description, accent, delay = 0, wide = false }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.55, ease: "easeOut" }}
      className={cn(
        "group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 overflow-hidden hover:border-white/[0.12] transition-all duration-500 hover:bg-white/[0.04]",
        wide ? "md:col-span-2" : ""
      )}
    >
      {/* Mesh gradient glow */}
      <div className={cn("absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700", accent)} />
      <div className="mb-5 w-10 h-10 rounded-xl flex items-center justify-center bg-white/[0.05] border border-white/[0.08]">
        {icon}
      </div>
      <h3 className="text-white font-semibold text-base mb-2 tracking-tight">{title}</h3>
      <p className="text-neutral-500 text-sm leading-relaxed max-w-none">{description}</p>
      <div className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-violet-500 to-indigo-500 group-hover:w-full transition-all duration-700" />
    </motion.div>
  );
}

// ── Step card ─────────────────────────────────────────────────────────────────
interface StepProps {
  num: string;
  title: string;
  desc: string;
  code?: string;
  delay?: number;
}
function StepCard({ num, title, desc, code, delay = 0 }: StepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay, duration: 0.5 }}
      className="relative flex gap-6 pb-12 last:pb-0"
    >
      {/* Vertical connector */}
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-violet-500/30 flex-shrink-0 z-10">
          {num}
        </div>
        <div className="flex-1 w-px bg-gradient-to-b from-violet-600/40 to-transparent mt-2" />
      </div>
      <div className="flex-1 pt-1">
        <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
        <p className="text-neutral-500 text-sm leading-relaxed mb-4">{desc}</p>
        {code && <CommandSnippet cmd={code} />}
      </div>
    </motion.div>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, 60]);

  const navigate = (path: string) => {
    setIsNavigating(true);
    setTimeout(() => router.push(path), 400);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question.trim()) return;
    localStorage.setItem("query", question);
    localStorage.removeItem("selectedNamespace");
    navigate("/dashboard");
  };

  return (
    <div className="relative min-h-screen bg-[#050507] text-white overflow-x-hidden">
      <AnimatePresence>
        {isNavigating && (
          <motion.div
            key="nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[999] bg-[#050507] flex items-center justify-center"
          >
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/40"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Nav />

      {/* ───── HERO ───── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Three.js neural net */}
        <NeuralBackground
          particleCount={110}
          color="#7c3aed"
          accentColor="#4f46e5"
          interactive
        />

        {/* Radial vignette */}
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,transparent_40%,#050507_100%)] pointer-events-none" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto w-full pt-20"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="mb-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium backdrop-blur-sm"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-400" />
            </span>
            Lexi AI v2.1 · Now live
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.95] mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-white">Query any</span>
            <br />
            <span
              className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent"
            >
              documentation
            </span>
            <br />
            <span className="text-neutral-400">with AI</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="text-neutral-500 text-base md:text-lg max-w-lg leading-relaxed mb-3 max-w-none"
          >
            Index GitHub repositories in seconds. Ask questions in natural language.
            Get intelligent answers powered by semantic search + OpenAI.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-sm text-neutral-600 font-mono mb-10 max-w-none"
          >
            Works with{" "}
            <span className="text-violet-400 font-semibold">
              <Typewriter
                words={["React", "Next.js", "Python", "Vue", "Express", "Laravel", "Rust"]}
                loop
                cursor
                cursorStyle="_"
                typeSpeed={65}
                deleteSpeed={40}
                delaySpeed={1300}
              />
            </span>
          </motion.p>

          {/* Search bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            onSubmit={handleSearch}
            className="w-full max-w-xl mb-8 group"
          >
            <div className="relative flex items-center rounded-2xl border border-white/[0.08] bg-white/[0.03] hover:border-violet-500/30 focus-within:border-violet-500/50 transition-all duration-300 shadow-2xl shadow-black/50 backdrop-blur-sm">
              <Search className="absolute left-4 w-4 h-4 text-neutral-600 group-focus-within:text-violet-400 transition-colors" />
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="How do I implement authentication in Next.js?"
                className="flex-1 bg-transparent pl-11 pr-4 py-4 text-sm text-white placeholder-neutral-600 outline-none font-sans"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="m-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 shadow-lg shadow-violet-600/30 cursor-pointer flex items-center gap-1.5 min-h-0 min-w-0"
              >
                Search <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </motion.form>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-sm font-bold hover:bg-neutral-100 transition-all duration-200 cursor-pointer min-h-0 min-w-0 shadow-lg shadow-white/10"
            >
              Open Dashboard <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              href="https://github.com/altairyash/lexiAI"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/[0.1] bg-white/[0.03] text-neutral-300 text-sm font-semibold hover:bg-white/[0.07] hover:text-white transition-all duration-200 no-underline min-h-0 min-w-0"
            >
              <Github className="w-4 h-4" /> Star on GitHub
            </motion.a>
          </motion.div>

          {/* Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-neutral-700 text-xs"
          >
            <span>Scroll</span>
            <motion.div
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ───── HOW IT WORKS ───── */}
      <section id="how" className="relative py-28 md:py-36 border-t border-white/[0.04]">
        {/* Background accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              How it works
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold tracking-tighter text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Three steps to{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                instant answers
              </span>
            </h2>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <StepCard
              num="01"
              title="Index your repository"
              desc="Run the CLI tool pointing at any public GitHub repo. Lexi AI automatically crawls all Markdown/docs, generates embeddings, and stores them in a named vector namespace."
              code="npx lexi-ai-docs scrape https://github.com/facebook/react --token ghp_xxx"
              delay={0}
            />
            <StepCard
              num="02"
              title="Ask in natural language"
              desc="Open the dashboard, select your namespace, and start asking questions. The AI understands intent and context — not just keywords."
              delay={0.1}
            />
            <StepCard
              num="03"
              title="Keep it fresh"
              desc="When docs update, re-index with a single command. One namespace per project, always in sync."
              code="npx lexi-ai-docs rescrape my-namespace --token ghp_xxx"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section id="features" className="relative py-28 md:py-36 border-t border-white/[0.04]">
        <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <p className="text-violet-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              Features
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold tracking-tighter text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Everything you need
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={<Terminal className="w-5 h-5 text-violet-400" />}
              title="Smart CLI"
              description="One command to index any GitHub repo. AI auto-generates namespace names from repo context — no configuration needed."
              accent="bg-violet-500"
              delay={0}
            />
            <FeatureCard
              icon={<Search className="w-5 h-5 text-indigo-400" />}
              title="Semantic Search"
              description="Understands intent behind questions, not just keyword matches. Vector similarity powered by OpenAI embeddings."
              accent="bg-indigo-500"
              delay={0.08}
            />
            <FeatureCard
              icon={<MessageSquare className="w-5 h-5 text-purple-400" />}
              title="Multi-turn Chat"
              description="The AI remembers conversation context. Ask follow-ups like 'show me in code' or 'explain that further' naturally."
              accent="bg-purple-500"
              delay={0.16}
            />
            <FeatureCard
              icon={<Database className="w-5 h-5 text-blue-400" />}
              title="Vector Database"
              description="Powered by Pinecone for ultra-fast retrieval. Thousands of docs indexed and searchable in milliseconds."
              accent="bg-blue-500"
              delay={0.24}
              wide
            />
            <FeatureCard
              icon={<Zap className="w-5 h-5 text-yellow-400" />}
              title="Multi-Source Knowledge"
              description="Index React, Next.js, your internal wikis — all in separate namespaces. Query and cross-reference as needed."
              accent="bg-yellow-500"
              delay={0.32}
            />
          </div>
        </div>
      </section>

      {/* ───── CTA STRIP ───── */}
      <section className="relative py-24 border-t border-white/[0.04] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/20 via-indigo-900/20 to-violet-900/20 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,rgba(124,58,237,0.12),transparent)] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-2xl mx-auto px-6 text-center"
        >
          <h2
            className="text-3xl md:text-5xl font-bold tracking-tighter text-white mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ready to skip the docs digging?
          </h2>
          <p className="text-neutral-500 mb-10 text-base leading-relaxed max-w-none">
            Stop Ctrl+F-ing through pages of documentation. Ask Lexi AI anything, instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-sm hover:from-violet-500 hover:to-indigo-500 transition-all duration-200 cursor-pointer min-h-0 min-w-0 shadow-xl shadow-violet-600/25"
            >
              Get started free <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.04 }}
              href="https://github.com/altairyash/lexiAI"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/[0.1] bg-white/[0.03] text-neutral-300 font-semibold text-sm hover:bg-white/[0.07] hover:text-white transition-all duration-200 no-underline min-h-0 min-w-0"
            >
              <ExternalLink className="w-4 h-4" /> View source
            </motion.a>
          </div>
        </motion.div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="border-t border-white/[0.04] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-neutral-500 text-xs font-medium">
              Lexi AI · Open Source · MIT License
            </span>
          </div>
          <p className="text-neutral-700 text-xs">
            Made with care by{" "}
            <a
              href="https://github.com/altairyash"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-violet-400 transition-colors no-underline"
            >
              Yash
            </a>{" "}
            · © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
