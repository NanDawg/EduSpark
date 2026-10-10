import type { Metadata } from "next";
import { getCurrentUser } from "@/features/auth/user";
import { getChatHistory } from "@/features/spark/service";
import {
  ChatWindow,
  type ChatMessage,
} from "@/features/spark/components/chat-window";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Spark | EduSpark",
};

export const instant = false;

export default async function SparkPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const history = await getChatHistory(user.id);
  const messages: ChatMessage[] = history
    .slice()
    .reverse()
    .map((chat) => ({
      id: chat.id,
      role: chat.role === "user" ? "user" : "assistant",
      content: chat.content,
      blocked: chat.blocked,
    }));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6 md:py-10">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold text-foreground">
          Spark
        </h1>
        <p className="text-muted-foreground">
          Teman belajarmu. Tanya pelajaran apa saja sesuai kelasmu.
        </p>
      </header>

      <ChatWindow initialMessages={messages} />
    </div>
  );
}
