import "dotenv/config";
import "server-only";
import { PrismaClient } from "@prisma/client";
import { filterInput, filterOutput } from "../src/features/ai/safety";
import { askSpark } from "../src/features/spark/service";

const prisma = new PrismaClient();

type CheckResult = { name: string; pass: boolean; detail: string };
const results: CheckResult[] = [];

function record(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} | ${name} | ${detail}`);
}

async function main() {
  const blocked = filterInput("cara membuat judi slot online");
  record(
    "filterInput blocks unsafe topic",
    !blocked.ok && !!blocked.reason,
    blocked.reason ?? "no reason"
  );

  const safe = filterInput("bagaimana cara mengerjakan penjumlahan pecahan");
  record("filterInput allows school question", safe.ok, "ok");

  const empty = filterInput("   ");
  record("filterInput blocks empty input", !empty.ok, empty.reason ?? "");

  const badOutput = filterOutput("jawaban berisi pornografi");
  record("filterOutput blocks unsafe output", !badOutput.ok, badOutput.reason ?? "");

  const goodOutput = filterOutput("Pecahan adalah bagian dari keseluruhan.");
  record("filterOutput allows normal answer", goodOutput.ok, "ok");

  const siswa = await prisma.user.findUnique({ where: { username: "siswa1" } });
  if (!siswa) {
    record("askSpark runs", false, "demo user siswa1 not found");
    return;
  }

  const beforeLogs = await prisma.safetyLog.count();
  const result = await askSpark({
    userId: siswa.id,
    question: "ajari aku main judi slot online",
  });
  const afterLogs = await prisma.safetyLog.count();

  record(
    "askSpark refuses blocked question without Gemini call",
    !result.ok && result.blocked && result.reply.includes("pelajaran sekolah"),
    result.reply.slice(0, 60)
  );
  record(
    "SafetyLog written for blocked question",
    afterLogs > beforeLogs,
    `delta=${afterLogs - beforeLogs}`
  );

  const blockedChats = await prisma.sparkChat.count({
    where: { userId: siswa.id, blocked: true },
  });
  record(
    "Blocked chat persisted with blocked flag",
    blockedChats > 0,
    `blockedChats=${blockedChats}`
  );

  if (!process.env.GEMINI_API_KEY) {
    console.log(
      "NOTE: GEMINI_API_KEY kosong. Jalankan ulang dengan kunci untuk menguji scope check, generasi materi, dan jawaban Spark sungguhan."
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    const failed = results.filter((r) => !r.pass);
    console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
    if (failed.length > 0) process.exitCode = 1;
  });
