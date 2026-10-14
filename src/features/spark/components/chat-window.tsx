"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { RotateCcw, SendHorizonal } from "lucide-react";
import { sendSparkMessageAction } from "@/actions/spark";
import { SPARK_SUGGESTIONS } from "@/features/spark/prompts";
import { SparkAvatar } from "@/components/brand/spark-avatar";
import { cn } from "cn";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  blocked?: boolean;
  error?: boolean;
  retryQuestion?: string;
};

type ChatWindowProps = {
  initialMessages: ChatMessage[];
  initialDraft?: string;
};

const WATCHDOG_MS = 75_000;

export function ChatWindow({
  initialMessages,
  initialDraft = "",
}: ChatWindowProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = React.useState(initialDraft);
  const [awaiting, setAwaiting] = React.useState(false);
  const [, startTransition] = React.useTransition();
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, awaiting]);

  React.useEffect(() => {
    if (initialDraft) inputRef.current?.focus();
  }, [initialDraft]);

  function sendQuestion(question: string, echoUser: boolean) {
    if (awaiting) return;

    if (echoUser) {
      setMessages((current) => [
        ...current,
        { id: `local-${Date.now()}`, role: "user", content: question },
      ]);
    }
    setInput("");
    setAwaiting(true);

    const watchdogId = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `timeout-${Date.now()}`,
          role: "assistant",
          content:
            "Aku butuh waktu lebih lama dari biasanya dan jawaban belum sampai. Coba kirim ulang pertanyaanmu, ya.",
          error: true,
          retryQuestion: question,
        },
      ]);
      setAwaiting(false);
    }, WATCHDOG_MS);

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("question", question);
        const state = await sendSparkMessageAction({}, formData);
        const replyContent =
          state.reply ?? state.error ?? "Maaf, terjadi kesalahan. Coba lagi ya.";
        setMessages((current) => [
          ...current,
          {
            id: `reply-${Date.now()}`,
            role: "assistant",
            content: replyContent,
            blocked: state.blocked,
            error: state.error ? true : undefined,
            retryQuestion: state.error ? question : undefined,
          },
        ]);
      } catch {
        setMessages((current) => [
          ...current,
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "Maaf, terjadi kesalahan. Coba kirim ulang ya.",
            error: true,
            retryQuestion: question,
          },
        ]);
      } finally {
        window.clearTimeout(watchdogId);
        setAwaiting(false);
      }
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();
    if (!question || awaiting) return;
    sendQuestion(question, true);
  }

  function handleSuggestion(suggestion: string) {
    if (awaiting) return;
    setInput(suggestion);
    inputRef.current?.focus();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
        <SparkAvatar size="md" thinking={awaiting} />
        <div className="flex flex-col">
          <span className="font-heading text-base font-semibold text-foreground">
            Spark
          </span>
          <span
            role="status"
            className="text-xs text-muted-foreground"
          >
            {awaiting ? "Sedang berpikir..." : "Siap membantu"}
          </span>
        </div>
      </div>

      <div
        role="log"
        aria-live="polite"
        aria-label="Percakapan dengan Spark"
        tabIndex={0}
        className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-xl border border-border bg-card p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {messages.length === 0 && (
          <div className="flex items-start gap-3 rounded-xl bg-ai-soft p-4">
            <SparkAvatar size="lg" label="" className="shrink-0" />
            <p className="text-sm leading-relaxed text-foreground">
              Halo! Aku Spark, teman belajarmu. Tanya apa saja tentang
              pelajaran sekolahmu, ya.
            </p>
          </div>
        )}

        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "flex gap-2",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {message.role === "assistant" && (
              <SparkAvatar size="sm" label="" className="mt-1 shrink-0" />
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                message.role === "user"
                  ? "bg-brand text-brand-ink"
                  : message.error
                    ? "border border-destructive/40 bg-destructive/5 text-foreground"
                    : message.blocked
                      ? "border border-border bg-muted text-foreground"
                      : "bg-ai-soft text-foreground"
              )}
            >
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
              {message.blocked && (
                <p className="mt-2 text-xs font-semibold text-muted-foreground">
                  Diblokir penjaga keamanan EduSpark
                </p>
              )}
              {message.error && message.retryQuestion && (
                <button
                  type="button"
                  onClick={() => sendQuestion(message.retryQuestion!, false)}
                  disabled={awaiting}
                  className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-destructive/40 bg-card px-3 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50 md:min-h-9"
                >
                  <RotateCcw className="size-3.5" aria-hidden />
                  Coba kirim ulang
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {awaiting && (
          <div aria-hidden className="flex items-center gap-2">
            <SparkAvatar size="sm" label="" thinking />
            <span className="flex items-center gap-1 rounded-xl bg-ai-soft px-4 py-3.5">
              <span className="typing-dot size-1.5 rounded-full bg-ai-strong" />
              <span className="typing-dot size-1.5 rounded-full bg-ai-strong [animation-delay:0.15s]" />
              <span className="typing-dot size-1.5 rounded-full bg-ai-strong [animation-delay:0.3s]" />
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2">
          {SPARK_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestion(suggestion)}
              disabled={awaiting}
              className="min-h-11 rounded-full border border-border bg-card px-4 text-left text-sm font-medium text-foreground transition-colors hover:border-brand hover:bg-brand-soft/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 rounded-xl border border-border bg-card p-3"
      >
        <label htmlFor="spark-input" className="sr-only">
          Tulis pertanyaan untuk Spark
        </label>
        <textarea
          id="spark-input"
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
          rows={1}
          placeholder="Tanya Spark tentang pelajaranmu..."
          className="max-h-32 min-h-11 flex-1 resize-none rounded-lg bg-background px-3 py-2.5 text-sm leading-relaxed outline-none transition-shadow focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        <button
          type="submit"
          disabled={awaiting || input.trim().length === 0}
          aria-label="Kirim pertanyaan"
          className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
        >
          <SendHorizonal className="size-5" aria-hidden />
        </button>
      </form>
    </div>
  );
}
