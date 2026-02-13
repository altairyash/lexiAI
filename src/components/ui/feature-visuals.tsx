"use client";
import { cn } from "@/lib/utils";

export const FeatureIconContainer = ({ className, children }: { className?: string, children: React.ReactNode }) => {
  return (
    <div
      className={cn(
        "flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-800 overflow-hidden relative group",
        className
      )}
    >
        <div className="absolute inset-0 bg-dot-white/[0.2] [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />
        <div className="relative z-10 flex items-center justify-center w-full h-full">
            {children}
        </div>
    </div>
  );
};

export const MockTerminal = () => (
    <div className="w-full h-full p-4 font-mono text-xs text-green-400 bg-neutral-950/80">
        <div className="flex gap-1 mb-2">
            <span className="w-2 h-2 rounded-full bg-red-500"/>
            <span className="w-2 h-2 rounded-full bg-yellow-500"/>
            <span className="w-2 h-2 rounded-full bg-green-500"/>
        </div>
        <div>
            <span className="text-blue-400">➜</span> <span className="text-white">~</span> npx lexi-ai index --url https://react.dev<br/>
            <span className="opacity-50">Indexing React Documentation...</span><br/>
            <span className="text-green-500">✓ Done in 1.2s</span>
        </div>
    </div>
);

export const MockSearch = () => (
    <div className="w-full h-full flex items-center justify-center">
        <div className="w-3/4 h-8 bg-neutral-800 rounded-full flex items-center px-3 gap-2 border border-neutral-700 shadow-xl">
            <div className="w-4 h-4 rounded-full border border-neutral-500" />
            <div className="w-1/2 h-2 bg-neutral-600 rounded-full" />
        </div>
    </div>
);

export const MockGraph = () => (
    <div className="flex items-end justify-center gap-1 w-full h-1/2 pb-4">
        {[40, 70, 50, 90, 60, 80].map((h, i) => (
            <div key={i} style={{ height: `${h}%` }} className="w-2 bg-neutral-700 hover:bg-emerald-500 transition-colors rounded-t-sm" />
        ))}
    </div>
);
