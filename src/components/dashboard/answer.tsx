"use client";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import LoaderSVG from "@/custom-components/ui/loader-svg";

interface AnswerProps {
  answer: string;
  isLoading: boolean;
}

const Answer: React.FC<AnswerProps> = ({ answer, isLoading }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  if (!isLoading && !answer) {
    return null;
  }

  return (
    <div className="w-full flex flex-col min-w-0 overflow-hidden">
      {isLoading ? (
        <div className="flex items-center justify-center h-64 w-full">
          <LoaderSVG />
        </div>
      ) : (
        <div className="markdown prose prose-invert max-w-none w-full overflow-x-auto">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              pre: ({ children }) => <div className="not-prose my-4">{children}</div>,
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
                  <div className="rounded-xl overflow-x-auto bg-neutral-900 border border-neutral-800 shadow-2xl my-6 w-full max-w-full">
                    <div className="flex items-center justify-between px-4 py-2 bg-neutral-800/50 border-b border-neutral-800">
                      <div className="flex items-center gap-2">
                         <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                         </div>
                         <span className="text-xs font-medium text-neutral-400 ml-2 uppercase">{language}</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(codeString)}
                        className="text-xs font-medium text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
                      >
                        {copiedCode === codeString ? (
                            <><span>✓</span> Copied</>
                        ) : (
                            <><span>❐</span> Copy</>
                        )}
                      </button>
                    </div>
                    <SyntaxHighlighter
                      style={oneDark}
                      language={language}
                      PreTag="div"
                      showLineNumbers={true}
                      wrapLongLines={true}
                      customStyle={{
                        margin: 0,
                        padding: "1.5rem",
                        backgroundColor: "transparent",
                        fontSize: "0.9rem",
                        lineHeight: "1.6",
                        maxWidth: "100%",
                        overflowX: "auto",
                        wordBreak: "break-word",
                      }}
                      lineNumberStyle={{
                        minWidth: "2.5em",
                        paddingRight: "1em",
                        color: "#4b5563",
                        textAlign: "right",
                      }}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  </div>
                ) : (
                  <code className="bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-sm font-mono border border-neutral-700/50">
                    {children}
                  </code>
                );
              },
              h1: ({children}) => <h1 className="text-3xl font-bold text-white mb-6 mt-8 pb-2 border-b border-neutral-800">{children}</h1>,
              h2: ({children}) => <h2 className="text-2xl font-bold text-white mb-4 mt-8">{children}</h2>,
              h3: ({children}) => <h3 className="text-xl font-semibold text-white mb-3 mt-6">{children}</h3>,
              p: ({children}) => <p className="text-neutral-200 leading-relaxed mb-4 text-base">{children}</p>,
              ul: ({children}) => <ul className="list-disc list-outside ml-6 mb-4 text-neutral-200 space-y-2">{children}</ul>,
              ol: ({children}) => <ol className="list-decimal list-outside ml-6 mb-4 text-neutral-200 space-y-2">{children}</ol>,
              li: ({children}) => <li className="pl-1 text-neutral-200">{children}</li>,
              blockquote: ({children}) => <blockquote className="border-l-4 border-emerald-500 pl-4 py-1 my-4 bg-emerald-500/10 rounded-r text-emerald-200 italic">{children}</blockquote>,
              a: ({href, children}) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 transition-colors">{children}</a>
            }}
          >
            {answer || ""}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default Answer;
