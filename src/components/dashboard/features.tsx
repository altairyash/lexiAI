"use client";
import React from "react";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import {
  IconArrowWaveRightUp,
  IconBoxAlignRightFilled,
  IconBoxMarked,
  IconClipboardCopy,
  IconFileBroken,
  IconSignature,
  IconTableColumn,
} from "@tabler/icons-react";
import { motion } from "framer-motion";

export function Features() {
  return (
    <section id="features" className="py-20 relative z-20">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-5xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-500 font-serif mb-12"
        >
           Intelligent & Automated
        </motion.h2>
        <BentoGrid className="max-w-4xl mx-auto">
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
      </div>
    </section>
  );
}

import { FeatureIconContainer, MockTerminal, MockSearch, MockGraph } from "@/components/ui/feature-visuals";

// ... existing code ...

const items = [
  {
    title: "Instant Indexing",
    description: "Point to any URL, and we'll scrape and vectorise it effectively immediately.",
    header: <FeatureIconContainer><MockTerminal /></FeatureIconContainer>,
    icon: <IconClipboardCopy className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Semantic Search",
    description: "We don't just match keywords. We understand the intent behind your query.",
    header: <FeatureIconContainer><MockSearch /></FeatureIconContainer>,
    icon: <IconFileBroken className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Context Aware",
    description: "The AI retains context across queries to provide more accurate answers.",
    header: <FeatureIconContainer><MockGraph /></FeatureIconContainer>,
    icon: <IconSignature className="h-4 w-4 text-neutral-500" />,
  },
  {
    title: "Multi-Source Knowledge",
    description:
      "Combine documentation from React, Next.js, and your own internal wikis into one unified brain.",
    header: <FeatureIconContainer><MockTerminal /></FeatureIconContainer>,
    icon: <IconTableColumn className="h-4 w-4 text-neutral-500" />,
  },
];
