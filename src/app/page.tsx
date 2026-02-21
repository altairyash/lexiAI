"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { Spotlight } from "@/components/ui/spotlight";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { MovingBorderBtn } from "@/components/ui/moving-border";
import { Features } from "@/components/dashboard/features";
import { Footer } from "@/components/dashboard/footer";
import { motion } from "framer-motion";
import LoaderSVG from "@/custom-components/ui/loader-svg";
import { Typewriter } from "react-simple-typewriter";
import { HomeIcon, Book, Search, Github, Terminal, RefreshCw, List as ListIcon } from "lucide-react";

import { PlaceholdersAndVanishInput } from "@/components/ui/vanish-input";

export default function Home() {
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isNavigating, setIsNavigating] = useState(false);
  const [question, setQuestion] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      if (!question.trim()) return;

      setIsNavigating(true);
      localStorage.setItem("query", question);
      localStorage.removeItem("selectedNamespace"); 
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
  };

  const handleGetStarted = () => {
    setIsNavigating(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
  };

  const navItems = [
    { name: "Home", link: "#", icon: <HomeIcon className="h-4 w-4" /> },
    { name: "Features", link: "#features", icon: <Search className="h-4 w-4" /> },
    { name: "Dashboard", link: "/dashboard", icon: <Book className="h-4 w-4" /> },
  ];

  if (isPageLoading || isNavigating) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black cursor-wait">
        <LoaderSVG />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full overflow-hidden bg-black/[0.96] antialiased"
    >
      <FloatingNav navItems={navItems} />

      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden pt-20 md:pt-0">
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="white" />
        
        <div className="relative pt-40 pb-20 z-10 w-full max-w-6xl mx-auto px-4 md:px-6 flex flex-col items-center justify-center text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="inline-flex items-center space-x-2 rounded-full border border-neutral-800 bg-neutral-900/50 px-4 py-1.5 text-sm text-neutral-300 backdrop-blur-xl mb-12 cursor-default hover:border-emerald-500/50 transition-colors"
          >
            <motion.span 
              className="relative flex h-2 w-2"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </motion.span>
            <motion.span
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="font-medium"
            >
              Lexi AI v2.0 — Now Live
            </motion.span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="mb-8 md:mb-10 max-w-4xl"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-center text-white leading-tight md:leading-snug tracking-tight">
              Query Any<br />
              <motion.span 
                className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Documentation
              </motion.span>
              <br />
              <motion.span
                className="text-neutral-300"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                with AI
              </motion.span>
            </h1>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12 md:mb-16 max-w-2xl"
          >
            <p className="text-base md:text-lg text-neutral-400 leading-relaxed">
              Index GitHub repos instantly • AI-powered semantic search • Multi-turn conversations
            </p>
            <p className="text-sm md:text-base text-neutral-500 mt-4 font-mono">
              Works with&nbsp;
              <motion.span 
                className="text-emerald-400 font-semibold"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 0.3 }}
              >
                <Typewriter
                  words={["React", "Next.js", "Python", "Express", "Vue", "Laravel"]}
                  loop={true}
                  cursor
                  cursorStyle="_"
                  typeSpeed={60}
                  deleteSpeed={40}
                  delaySpeed={1200}
                />
              </motion.span>
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
            className="mb-12 md:mb-16 group"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-lg blur-xl group-hover:from-emerald-500/30 group-hover:to-cyan-500/30 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              <div className="relative inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-neutral-900/60 border border-neutral-700 backdrop-blur-sm hover:border-emerald-500/50 transition-all duration-300 shadow-2xl">
                <span className="text-xs text-neutral-500 font-mono">$</span>
                <code className="text-sm md:text-base text-emerald-400 font-mono whitespace-nowrap">npx lexi-ai-docs scrape&nbsp;</code>
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-cyan-400 text-sm"
                >
                  &lt;url&gt;&nbsp;
                </motion.span>
                <code className="text-sm md:text-base text-emerald-400 font-mono">--token</code>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="w-full max-w-3xl relative mb-12 hidden md:block"
          >
            <div className="relative z-10">
              <PlaceholdersAndVanishInput
                placeholders={[
                    "How do I implement middleware in Next.js?",
                    "Explain async/await patterns in Python...",
                    "What is the useEffect dependency array?",
                    "How to deploy to production?",
                ]}
                onChange={(e) => setQuestion(e.target.value)}
                onSubmit={(e) => handleSearchSubmit(e)}
                value={question}
              />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full px-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <MovingBorderBtn
                borderRadius="1.75rem"
                className="bg-neutral-900 text-white border-neutral-800 font-semibold text-base px-8 py-3 hover:border-emerald-500/50 transition-all duration-200 cursor-pointer min-h-11 min-w-11 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black"
                onClick={handleGetStarted}
              >
                Go to Dashboard
              </MovingBorderBtn>
            </motion.div>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.open("https://github.com/altairyash/lexiAI", "_blank")}
              className="group relative inline-flex h-12 min-h-11 items-center justify-center overflow-hidden rounded-full bg-neutral-950 px-8 font-semibold text-neutral-200 transition-all duration-200 hover:bg-neutral-900 hover:text-white border border-neutral-700 hover:border-emerald-500/50 w-full sm:w-auto cursor-pointer min-h-11 min-w-11 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black"
              aria-label="Star on GitHub"
            >
              <Github className="mr-2 h-5 w-5 transition-transform group-hover:scale-110 duration-200" />
              <span>Star on GitHub</span>
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </motion.button>
          </motion.div>
        </div>

        <BackgroundBeams />
      </div>

      {/* Getting Started Section */}
      <section className="relative z-10 w-full bg-black/40 border-t border-neutral-900 py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="space-y-16"
          >
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Get Started in <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">3 Steps</span>
                </h2>
              </motion.div>
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-base md:text-lg text-neutral-400 leading-relaxed"
              >
                Index any GitHub repository, then search your documentation with natural language queries powered by AI.
              </motion.p>
            </div>

            {/* Steps Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 - Scrape */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="group relative h-full cursor-pointer transition-all duration-200 focus-within:ring-2 focus-within:ring-emerald-500 rounded-xl"
                role="region"
                aria-label="Index Your Docs - Step 1"
                tabIndex={0}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-xl -z-10"></div>
                <div className="relative h-full border border-neutral-800 rounded-xl p-8 bg-gradient-to-br from-neutral-900/50 to-neural-950/30 backdrop-blur-sm group-hover:bg-neutral-900/40 group-hover:border-emerald-500/30 transition-all duration-200 flex flex-col">
                  {/* Step Number */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 border border-emerald-500/50 flex items-center justify-center">
                        <Terminal className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                      </div>
                      <span className="text-2xl font-bold text-neutral-700 group-hover:text-neutral-600 transition-colors">01</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4">Index Your Docs</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-8 flex-grow">
                    Point to any public GitHub repository. Our CLI tool automatically indexes your documentation and generates smart semantic namespaces.
                  </p>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-neutral-500 font-semibold">Example command:</p>
                    <div className="bg-neutral-950/80 rounded-lg p-4 border border-neutral-800 overflow-hidden">
                      <p className="text-neutral-300 font-mono text-xs break-all" aria-label="Example scrape command">
                        <span className="text-neutral-600">$</span> npx lexi-ai-docs scrape&nbsp;
                        <span className="text-cyan-400">https://github.com/owner/repo</span>&nbsp;
                        <span className="text-emerald-400">--token</span>&nbsp;
                        <span className="text-cyan-300">ghp_xxx</span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 2 - Search */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 }}
                className="group relative h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"></div>
                <div className="relative h-full border border-neutral-800 rounded-xl p-8 bg-gradient-to-br from-neutral-900/50 to-neural-950/30 backdrop-blur-sm group-hover:bg-neutral-900/40 group-hover:border-blue-500/30 transition-all duration-300 flex flex-col">
                  {/* Step Number */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400/20 to-blue-600/20 border border-blue-500/50 flex items-center justify-center">
                        <Search className="w-5 h-5 text-blue-400" />
                      </div>
                      <span className="text-2xl font-bold text-neutral-700 group-hover:text-neutral-600 transition-colors">02</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4">Ask Questions</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-8 flex-grow">
                    Query your documentation using natural language. The AI understands intent, context, and multi-turn conversations—not just keyword matching.
                  </p>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-neutral-500 font-semibold">Example queries:</p>
                    <div className="space-y-2">
                      <div className="bg-neutral-950/80 rounded-lg p-3 border border-neutral-800">
                        <p className="text-neutral-300 font-mono text-sm">"How do I deploy to production?"</p>
                      </div>
                      <div className="bg-neutral-950/80 rounded-lg p-3 border border-neutral-800">
                        <p className="text-neutral-300 font-mono text-sm">"What's the best practice for authentication?"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Step 3 - Keep Fresh */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="group relative h-full"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl -z-10"></div>
                <div className="relative h-full border border-neutral-800 rounded-xl p-8 bg-gradient-to-br from-neutral-900/50 to-neural-950/30 backdrop-blur-sm group-hover:bg-neutral-900/40 group-hover:border-cyan-500/30 transition-all duration-300 flex flex-col">
                  {/* Step Number */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400/20 to-cyan-600/20 border border-cyan-500/50 flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="text-2xl font-bold text-neutral-700 group-hover:text-neutral-600 transition-colors">03</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-4">Keep It Fresh</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mb-8 flex-grow">
                    When your documentation updates, simply re-scrape to keep your indexed knowledge base current. One command keeps everything in sync.
                  </p>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-neutral-500 font-semibold">Re-scrape command:</p>
                    <div className="bg-neutral-950/80 rounded-lg p-4 border border-neutral-800 overflow-hidden">
                      <p className="text-neutral-300 font-mono text-xs break-all" aria-label="Example rescrape command">
                        <span className="text-neutral-600">$</span> npx lexi-ai-docs rescrape&nbsp;
                        <span className="text-cyan-400">my-repo-namespace</span>&nbsp;
                        <span className="text-emerald-400">--token</span>&nbsp;
                        <span className="text-cyan-300">ghp_xxx</span>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Requirements Box */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="max-w-2xl mx-auto"
            >
              <div className="border border-neutral-800 rounded-xl p-8 bg-gradient-to-r from-neutral-900/30 to-neutral-950/20 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <Github className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-white font-bold mb-2">You'll need a GitHub token</h4>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                      Generate a personal access token at&nbsp;
                      <a 
                        href="https://github.com/settings/tokens/new" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors underline"
                      >
                        github.com/settings/tokens/new
                      </a>
                      . Use it with the <code className="bg-neutral-900 text-emerald-400 px-2 py-1 rounded font-mono text-sm">--token</code> flag.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        id="features"
        className="relative z-10 w-full bg-black border-t border-neutral-900 py-24 md:py-32"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Features />
        </div>
      </motion.section>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10"
      >
        <Footer />
      </motion.div>
    </motion.div>
  );
}
