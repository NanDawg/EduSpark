import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { SignJWT } from "jose";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

const prisma = new PrismaClient();

type CheckResult = { name: string; pass: boolean; detail: string };
const results: CheckResult[] = [];

function record(name: string, pass: boolean, detail: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"} | ${name} | ${detail}`);
}

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET missing");
  return new TextEncoder().encode(secret);
}

async function makeSessionCookie(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(getSecret());
  return `eduspark_session=${token}`;
}

async function main() {
  const siswa = await prisma.user.findUnique({
    where: { username: "siswa1" },
  });
  if (!siswa) {
    record("setup: siswa1 exists", false, "run db:seed first");
    return;
  }
  const cookie = await makeSessionCookie(siswa.id);

  const firstNode = await prisma.lessonNode.findFirst({
    where: { path: { classLevel: 3 } },
    include: { path: { include: { subject: true } } },
    orderBy: [{ path: { order: "asc" } }, { order: "asc" }],
  });
  if (!firstNode) {
    record("setup: lesson node exists", false, "run db:seed first");
    return;
  }
  const lockedNode = await prisma.lessonNode.findFirst({
    where: { pathId: firstNode.pathId, order: 1 },
  });

  const noAuth = await fetch(`${BASE}/adventure`, { redirect: "manual" });
  record(
    "GET /adventure without session redirects to /login",
    noAuth.status >= 300 &&
      noAuth.status < 400 &&
      (noAuth.headers.get("location") ?? "").includes("/login"),
    `status=${noAuth.status} location=${noAuth.headers.get("location")}`
  );

  const map = await fetch(`${BASE}/adventure`, { headers: { cookie } });
  const mapHtml = (await map.text()).replace(/<!-- -->/g, "");
  record(
    "GET /adventure renders journey heading and summary",
    map.status === 200 &&
      mapHtml.includes("Petualangan Belajar") &&
      mapHtml.includes("Perjalanan Belajar") &&
      mapHtml.includes("Progres kelasmu"),
    `status=${map.status}`
  );
  record(
    "GET /adventure shows node states (Sekarang + Terkunci + Bab labels)",
    mapHtml.includes("Sekarang") &&
      mapHtml.includes("Terkunci") &&
      mapHtml.includes("Bab 1"),
    "state labels present"
  );
  record(
    "GET /adventure node links point to /adventure/",
    mapHtml.includes(`/adventure/${firstNode.id}`),
    `href to first node present`
  );

  const mission = await fetch(`${BASE}/adventure/${firstNode.id}`, {
    headers: { cookie },
  });
  const missionHtml = (await mission.text()).replace(/<!-- -->/g, "");
  record(
    "GET mission detail renders objective and steps",
    mission.status === 200 &&
      missionHtml.includes("Tujuan pembelajaran") &&
      missionHtml.includes("Langkah misi") &&
      missionHtml.includes("Kembali ke peta"),
    `status=${mission.status}`
  );
  record(
    "GET mission detail shows quiz locked before lesson",
    missionHtml.includes("Kuis terkunci") &&
      missionHtml.includes("Kuis terbuka setelah materi"),
    "quiz lock hint present"
  );

  if (lockedNode) {
    const locked = await fetch(`${BASE}/adventure/${lockedNode.id}`, {
      headers: { cookie },
    });
    const lockedHtml = (await locked.text()).replace(/<!-- -->/g, "");
    record(
      "GET locked node shows lock banner and no action card",
      locked.status === 200 &&
        lockedHtml.includes("Misi terkunci") &&
        !lockedHtml.includes("Aksi misi"),
      `status=${locked.status}`
    );
  }

  const bogus = await fetch(`${BASE}/adventure/not-a-real-node-id`, {
    headers: { cookie },
  });
  const bogusHtml = (await bogus.text()).replace(/<!-- -->/g, "");
  record(
    "GET unknown node streams not-found (same as /learn and /quiz)",
    bogusHtml.includes("404") && !bogusHtml.includes("Aksi misi"),
    `status=${bogus.status} streamed404=${bogusHtml.includes("404")}`
  );

  const dash = await fetch(`${BASE}/dashboard`, { headers: { cookie } });
  const dashHtml = (await dash.text()).replace(/<!-- -->/g, "");
  record(
    "GET /dashboard renders journey card",
    dashHtml.includes("Petualangan Belajar") &&
      dashHtml.includes("Progres perjalanan"),
    `status=${dash.status}`
  );

  const nav = await fetch(`${BASE}/dashboard`, { headers: { cookie } });
  const navHtml = (await nav.text()).replace(/<!-- -->/g, "");
  record(
    "nav contains Peta link to /adventure on both surfaces",
    navHtml.includes('href="/adventure"') && navHtml.includes(">Peta<"),
    "nav item present"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    const failed = results.filter((r) => !r.pass);
    console.log(
      `\n${results.length - failed.length}/${results.length} checks passed`
    );
    if (failed.length > 0) process.exitCode = 1;
  });
