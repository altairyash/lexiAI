"use client";

import { Github, Twitter, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-black py-8 relative z-20">
      <div className="mx-auto max-w-screen-xl px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm text-neutral-500"
        >
          Made with ❤️ by
          <motion.a
            href="https://github.com/altairyash"
            whileHover={{ scale: 1.05 }}
            className="ml-1 font-bold text-neutral-300 hover:text-emerald-400 transition-colors underline decoration-dotted underline-offset-4"
          >
            Yash
          </motion.a>
        </motion.p>
        
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-medium text-neutral-600"
        >
          &copy; {new Date().getFullYear()} LexiAI Open-Source.
        </motion.p>
        
        <div className="flex items-center gap-6">
          {[
            { href: "https://github.com/altairyash", icon: Github, label: "GitHub" },
            { href: "https://x.com/atomicphoenix14", icon: Twitter, label: "Twitter" },
            { href: "https://www.linkedin.com/in/yash-yadav14/", icon: Linkedin, label: "LinkedIn" },
          ].map(({ href, icon: Icon, label }, index) => (
            <motion.a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className="text-neutral-500 transition-colors hover:text-emerald-400"
            >
              <Icon className="h-5 w-5" />
            </motion.a>
          ))}
        </div>
      </div>
    </footer>
  );
}
