"use client";
import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import { motion } from "framer-motion";

export function Features() {
  return (
    <>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-3xl md:text-4xl font-bold text-center text-white mb-6"
      >
        Powerful Features
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-center text-neutral-400 text-base mb-16 max-w-2xl mx-auto"
      >
        Everything you need to build intelligent documentation search
      </motion.p>
      <BentoGrid className="max-w-6xl mx-auto">
        {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <BentoGridItem
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                className={i === 3 || i === 6 ? "md:col-span-2" : ""}
              />
            </motion.div>
        ))}
      </BentoGrid>
    </>
  );
}

import { FeatureIconContainer, MockTerminal, MockSearch, MockGraph } from "@/components/ui/feature-visuals";

// ... existing code ...

const items = [
  {
    title: "Smart CLI Tool",
    description: "Use 'npx lexi-ai-docs scrape' to index any GitHub repo. AI automatically generates semantic namespace names from repo context—no manual setup needed.",
    header: <FeatureIconContainer><MockTerminal /></FeatureIconContainer>,
    icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Semantic Search",
    description: "Understands the intent behind questions, not just keywords. Ask 'how do I deploy?' and get actual deployment guides, not just keyword matches.",
    header: <FeatureIconContainer><MockSearch /></FeatureIconContainer>,
    icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Multi-turn Conversations",
    description: "The AI remembers context across messages. Ask follow-ups like 'show me in code' or 'also explain this part' and get coherent, connected answers.",
    header: <FeatureIconContainer><MockGraph /></FeatureIconContainer>,
    icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Multi-Source Knowledge",
    description: "Index React, Next.js, Vue, your internal wikis—all into one unified brain. Query across namespaces and get answers combining knowledge from multiple sources.",
    header: <FeatureIconContainer><MockTerminal /></FeatureIconContainer>,
    icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
  },
];
