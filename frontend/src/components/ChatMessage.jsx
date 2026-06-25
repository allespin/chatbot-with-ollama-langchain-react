import React from "react";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChatMessage({ role, content, isStreaming }) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex w-full gap-3 animate-fade-in-up",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-violet-950/50">
          <Bot className="h-5 w-5 text-white" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md",
          isUser
            ? "rounded-br-md bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-violet-950/40"
            : "rounded-bl-md border border-white/10 bg-white/[0.04] text-foreground/90"
        )}
      >
        {content}
        {isStreaming && (
          <span className="ml-1 inline-flex gap-1 align-middle">
            <span className="typing-dot animate-pulse-glow" />
            <span className="typing-dot animate-pulse-glow [animation-delay:0.15s]" />
            <span className="typing-dot animate-pulse-glow [animation-delay:0.3s]" />
          </span>
        )}
      </div>

      {isUser && (
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-white/10 bg-white/5">
          <User className="h-5 w-5 text-foreground/80" />
        </div>
      )}
    </div>
  );
}
