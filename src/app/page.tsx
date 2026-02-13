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
import { HomeIcon, Book, Search, Github } from "lucide-react";

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
      // Save query to localStorage so dashboard can pick it up
      localStorage.setItem("query", question);
      // Clear specific namespace so dashboard triggers auto-detect
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

      {/* Hero Section */}
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden">
        <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="white" />
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center pt-20">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center space-x-2 rounded-full border border-neutral-800 bg-neutral-900/50 px-3 py-1 text-sm text-neutral-300 backdrop-blur-xl mb-8 cursor-default hover:border-emerald-500/50 transition-colors"
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
              animate={{ opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Lexi AI v2.0 Now Live
            </motion.span>
          </motion.div>

          {/* Main Title with Text Generate Effect */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mb-6"
          >
             <motion.h1 
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ delay: 0.4, duration: 0.5 }}
               className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50 font-serif leading-tight"
             >
              Query any <br />
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-white inline-block"
              >
                Documentation
              </motion.span>{" "}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="inline-block"
              >
                using AI
              </motion.span>
            </motion.h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 font-normal text-base text-neutral-400 max-w-lg text-center mx-auto mb-10 h-10"
          >
            Open-Source AI-powered search for
            <motion.span 
              className="text-emerald-500 font-semibold ml-1 inline-block"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.3 }}
            >
                <Typewriter
                  words={["React.js", "Next.js", "Github", "Express", "Python"]}
                  loop={true}
                  cursor
                  cursorStyle="|"
                  typeSpeed={80}
                  deleteSpeed={50}
                  delaySpeed={1000}
                />
            </motion.span>
          </motion.p>
          
          {/* npx Command Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 backdrop-blur-sm"
            >
              <span className="text-xs text-neutral-500 font-mono">$</span>
              <code className="text-sm text-emerald-400 font-mono">npx lexi-ai</code>
              <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-emerald-500"
              >
                index
              </motion.span>
            </motion.div>
          </motion.div>

          {/* Functional Search Input */}
          <motion.div 
            initial={{ opacity: 0, width: "50%" }}
            whileInView={{ opacity: 1, width: "100%" }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="w-full max-w-2xl relative mb-12 hidden md:block"
          >
             <PlaceholdersAndVanishInput
                placeholders={[
                    "How do I implement middleware in Next.js 15?",
                    "Explain Python's async/await pattern...",
                    "What is the useEffect dependency array?",
                    "How to deploy to Vercel?",
                ]}
                onChange={(e) => setQuestion(e.target.value)}
                onSubmit={(e) => handleSearchSubmit(e)}
                value={question}
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col md:flex-row gap-6 items-center"
          >
            {/* High-end Moving Border Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MovingBorderBtn
                  borderRadius="1.75rem"
                  className="bg-neutral-900 text-white border-neutral-800 font-semibold text-base hover:border-emerald-500/50 transition-colors"
                  onClick={handleGetStarted}
              >
                  Get Started
              </MovingBorderBtn>
            </motion.div>

            <motion.button 
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open("https://github.com/altairyash/lexiAI", "_blank")}
                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-neutral-950 px-8 font-medium text-neutral-200 transition-all duration-300 hover:bg-neutral-900 hover:text-white border border-neutral-800 hover:border-emerald-500/50"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Github className="mr-2 h-4 w-4" />
              </motion.div>
              <span>Star on GitHub</span>
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </motion.button>
          </motion.div>
        </div>
        
        <BackgroundBeams />
      </div>

      {/* Features Section - Bento Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-black"
      >
         <Features />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Footer />
      </motion.div>
    </motion.div>
  );
}
