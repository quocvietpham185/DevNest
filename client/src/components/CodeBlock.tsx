import { useState, type ReactNode } from "react";

interface CodeProps {
  className?: string;
  children?: ReactNode;
  node?: unknown;
}

export function CodeBlock({ className, children, ...props }: CodeProps) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";
  const codeString = String(children).replace(/\n$/, "");

  // If it's inline code without language prefix or line breaks
  const isInline = !match && !codeString.includes("\n");

  if (isInline) {
    return (
      <code
        className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.875em] text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200"
        {...props}
      >
        {children}
      </code>
    );
  }

  function handleCopy() {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="group relative my-4 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-950 text-zinc-100 dark:border-zinc-800">
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/90 px-4 py-1.5 text-xs font-mono text-zinc-400">
        <span className="font-semibold uppercase tracking-wider text-accent-400">{language || "text"}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
          title="Sao chép đoạn mã"
          aria-label="Sao chép đoạn mã"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium text-emerald-400">Đã chép!</span>
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span>Sao chép</span>
            </>
          )}
        </button>
      </div>
      <pre className="!m-0 !rounded-none !bg-transparent p-4 overflow-x-auto text-[13.5px] leading-relaxed">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

