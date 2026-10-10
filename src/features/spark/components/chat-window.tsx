"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { SendHorizonal } from "lucide-react";
import { sendSparkMessageAction } from "@/actions/spark";
import { SPARK_SUGGESTIONS } from "@/features/spark/prompts";
import { cn } from "cn";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  blocked?: boolean;
};

type ChatWindowProps = {
  initialMessages: ChatMessage[];
};

export function ChatWindow({ initialMessages }: ChatWindowProps) {
  const [messages, setMessages] = React.useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = input.trim();
    if (!question || pending) return;

    setMessages((current) => [
      ...current,
      { id: `local-${Date.now()}`, role: "user", content: question },
    ]);
    setInput("");

    startTransition(async () => {
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
        },
      ]);
    });
  }

  function handleSuggestion(suggestion: string) {
    if (pending) return;
    setInput(suggestion);
    inputRef.current?.focus();
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div
        aria-label="Percakapan dengan Spark"
        className="flex flex-1 flex-col gap-3 overflow-y-auto rounded-xl border border-border bg-card p-4"
      >
        {messages.length === 0 && (
          <div className="flex items-start gap-3 rounded-xl bg-ai-soft p-4">
            <span
              aria-hidden
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ai font-heading text-base font-semibold text-brand-ink"
            >
              S
            </span>
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
              "flex",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                message.role === "user"
                  ? "bg-brand text-brand-ink"
                  : message.blocked
                    ? "border border-border bg-muted text-foreground"
                    : "bg-ai-soft text-foreground"
              )}
            >
              {message.role === "assistant" && (
                <span
                  aria-hidden
                  className="mb-1.5 flex size-7 items-center justify-center rounded-full bg-ai font-heading text-xs font-semibold text-brand-ink"
                >
                  S
                </span>
              )}
              <p className="whitespace-pre-wrap">{message.content}</p>
              {message.blocked && (
                <p className="mt-2 text-xs font-semibold text-muted-foreground">
                  Diblokir penjaga keamanan EduSpark
                </p>
              )}
            </div>
          </motion.div>
        ))}

        {pending && (
          <p role="status" className="text-sm text-muted-foreground">
            Spark sedang berpikir...
          </p>
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
              disabled={pending}
              className="min-h-11 rounded-full border border-border bg-card px-4 text-left text-sm font-medium text-foreground transition-colors hover:border-brand hover:bg-brand-soft/50 disabled:opacity-50"
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
          disabled={pending || input.trim().length === 0}
          aria-label="Kirim pertanyaan"
          className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50"
        >
          <SendHorizonal className="size-5" aria-hidden />
        </button>
      </form>
    </div>
  );
}
