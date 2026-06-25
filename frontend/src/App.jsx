import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Send, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/components/ChatMessage";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const WELCOME_MESSAGE = {
  role: "assistant",
  content:
    "Olá! Eu sou seu assistente local, rodando com Ollama + LangChain. Pergunte qualquer coisa.",
};

export default function App() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  async function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const history = messages.filter((m) => m !== WELCOME_MESSAGE || messages.length > 1);
    const userMessage = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage, { role: "assistant", content: "" }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Falha na conexão com o servidor.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullReply = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") continue;

          try {
            const parsed = JSON.parse(payload);
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.token) {
              fullReply += parsed.token;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: fullReply,
                };
                return updated;
              });
            }
          } catch {
            // ignora linhas que não são JSON válido
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content:
            "Não consegui falar com o servidor. Verifique se o back-end (FastAPI) e o Ollama estão rodando. Detalhe: " +
            err.message,
        };
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setMessages([WELCOME_MESSAGE]);
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden px-4 py-10">
      <div className="aurora-bg" />

      <Card className="relative z-10 flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-violet-950/50">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-base font-semibold text-foreground">
                Chatbot IA
              </h1>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.6)]" />
                <p className="text-xs text-muted-foreground">
                  Ollama + LangChain · conectado
                </p>
              </div>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={handleReset} title="Nova conversa">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Quadro de conversa */}
        <div ref={scrollRef} className="chat-scroll flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {messages.map((msg, idx) => (
            <ChatMessage
              key={idx}
              role={msg.role}
              content={msg.content}
              isStreaming={
                isLoading && idx === messages.length - 1 && msg.role === "assistant"
              }
            />
          ))}
        </div>

        {/* Campo de entrada */}
        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-white/10 px-4 py-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </div>
  );
}
