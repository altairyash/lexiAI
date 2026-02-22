"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

// Custom dark theme matching our violet aesthetic
const customTheme: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    color: "#d4d4d8",
    fontFamily: "var(--font-mono)",
    fontSize: "0.82rem",
    lineHeight: "1.6",
  },
  'pre[class*="language-"]': {
    background: "#0d0d12",
  },
  keyword: { color: "#a78bfa" },
  builtin: { color: "#c4b5fd" },
  function: { color: "#818cf8" },
  string: { color: "#86efac" },
  comment: { color: "#4b5563", fontStyle: "italic" },
  number: { color: "#fca5a5" },
  operator: { color: "#c4b5fd" },
  punctuation: { color: "#94a3b8" },
  property: { color: "#7dd3fc" },
  tag: { color: "#f472b6" },
  boolean: { color: "#fca5a5" },
  variable: { color: "#d4d4d8" },
  "class-name": { color: "#c4b5fd" },
};

interface AnswerProps {
  answer: string;
  isLoading: boolean;
}

const Answer: React.FC<AnswerProps> = ({ answer, isLoading }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  if (!isLoading && !answer) return null;

  return (
    <div className="w-full flex flex-col min-w-0 overflow-hidden">
      <div className="markdown prose prose-invert max-w-none w-full">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            pre: ({ children }) => (
              <div className="not-prose my-5 w-full">{children}</div>
            ),
            code: ({
              inline = false,
              className,
              children,
            }: {
              inline?: boolean;
              className?: string;
              children?: React.ReactNode;
            }) => {
              const match = /language-(\w+)/.exec(className || "");
              const codeString = String(children).trim();
              const language = match ? match[1] : "text";

              if (!codeString) return null;

              return !inline && match ? (
                <div className="rounded-xl overflow-hidden border border-white/[0.07] bg-[#0d0d12] shadow-2xl w-full max-w-full">
                  {/* Code header */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.05] bg-[#111118]">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/80" />
                      </div>
                      <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest font-mono">
                        {language}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(codeString)}
                      className="flex items-center gap-1.5 text-[10px] font-medium text-neutral-500 hover:text-violet-300 transition-colors cursor-pointer min-h-0 min-w-0 px-2 py-1 rounded-md hover:bg-white/[0.05]"
                    >
                      {copiedCode === codeString ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </button>
                  </div>
                  <SyntaxHighlighter
                    style={customTheme as any}
                    language={language}
                    PreTag="div"
                    showLineNumbers={codeString.split("\n").length > 3}
                    wrapLongLines={false}
                    customStyle={{
                      margin: 0,
                      padding: "1.25rem 1.5rem",
                      backgroundColor: "transparent",
                      fontSize: "0.82rem",
                      lineHeight: "1.65",
                      maxWidth: "100%",
                      overflowX: "auto",
                      fontFamily: "var(--font-mono)",
                    }}
                    lineNumberStyle={{
                      minWidth: "2.25em",
                      paddingRight: "1.25em",
                      color: "#374151",
                      textAlign: "right",
                    }}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <code className="bg-violet-500/10 text-violet-300 px-1.5 py-0.5 rounded-md text-[0.82em] font-mono border border-violet-500/20 leading-none">
                  {children}
                </code>
              );
            },
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-white mb-4 mt-8 pb-2 border-b border-white/[0.06]">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-bold text-white mb-3 mt-7">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base font-semibold text-white mb-2.5 mt-5">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="text-[#d4d4d8] leading-relaxed mb-4 text-sm">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-none mb-4 space-y-1.5">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-outside ml-5 mb-4 space-y-1.5 text-sm text-[#d4d4d8]">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="flex items-start gap-2 text-sm text-[#d4d4d8]">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-500/60 flex-shrink-0" />
                <span>{children}</span>
              </li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-violet-500/50 pl-4 py-1 my-4 bg-violet-500/[0.06] rounded-r-lg text-violet-200 italic text-sm">
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-400 hover:text-violet-300 underline underline-offset-3 transition-colors"
              >
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-4 rounded-xl border border-white/[0.07]">
                <table className="w-full text-sm">{children}</table>
              </div>
            ),
            th: ({ children }) => (
              <th className="bg-violet-500/10 text-violet-300 px-3 py-2 text-left text-[10px] uppercase tracking-wider font-semibold">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-2 text-[#d4d4d8] border-b border-white/[0.05] text-xs">
                {children}
              </td>
            ),
            hr: () => <hr className="border-white/[0.07] my-6" />,
            strong: ({ children }) => (
              <strong className="text-white font-semibold">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="text-neutral-300 italic">{children}</em>
            ),
          }}
        >
          {answer || ""}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default Answer;
