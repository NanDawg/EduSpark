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

function getSetCookieToken(res: Response): string | null {
  const raw = res.headers.get("set-cookie") ?? "";
  const match = raw.match(/eduspark_session=([^;]+)/);
  return match ? match[1] : null;
}

async function main() {
  const homeRes = await fetch(`${BASE}/`, { redirect: "manual" });
  record(
    "GET / redirects guests to /login",
    homeRes.status >= 300 && homeRes.status < 400 && (homeRes.headers.get("location") ?? "").includes("/login"),
    `status=${homeRes.status} location=${homeRes.headers.get("location")}`
  );

  const loginRes = await fetch(`${BASE}/login`);
  const loginHtml = await loginRes.text();
  record(
    "GET /login renders form",
    loginRes.status === 200 && loginHtml.includes("Selamat datang kembali"),
    `status=${loginRes.status}`
  );

  const dashNoAuth = await fetch(`${BASE}/dashboard`, { redirect: "manual" });
  record(
    "GET /dashboard without session redirects to /login",
    dashNoAuth.status >= 300 && dashNoAuth.status < 400 && (dashNoAuth.headers.get("location") ?? "").includes("/login"),
    `status=${dashNoAuth.status}`
  );

  const forged = await fetch(`${BASE}/dashboard`, {
    redirect: "manual",
    headers: { cookie: "eduspark_session=forged.token.value" },
  });
  record(
    "Forged session cookie is rejected",
    forged.status >= 300 && forged.status < 400 && (forged.headers.get("location") ?? "").includes("/login"),
    `status=${forged.status}`
  );

  const username = `smoke_${Date.now()}`;
  const registerPage = await fetch(`${BASE}/register`);
  const registerHtml = await registerPage.text();
  const actionRef = registerHtml.match(/name="(\$ACTION_REF_\d+)"\s*\/?>/);
  const actionBody = registerHtml.match(
    /name="(\$ACTION_\d+:0)"\s+value="([^"]*)"/
  );
  const actionBound = registerHtml.match(
    /name="(\$ACTION_\d+:1)"\s+value="([^"]*)"/
  );
  const actionKey = registerHtml.match(/name="(\$ACTION_KEY)"\s+value="([^"]*)"/);

  if (!actionRef || !actionBody || !actionBound || !actionKey) {
    record("Register server action found in HTML", false, "action inputs missing");
  } else {
    const decodeHtml = (value: string) =>
      value
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&amp;/g, "&");

    const buildRegisterForm = (name: string, user: string) => {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("username", user);
      fd.set("password", "rahasia123");
      fd.set("classLevel", "2");
      fd.set(actionRef[1], "");
      fd.set(actionBody[1], decodeHtml(actionBody[2]));
      fd.set(actionBound[1], decodeHtml(actionBound[2]));
      fd.set(actionKey[1], actionKey[2]);
      return fd;
    };

    const registerRes = await fetch(`${BASE}/register`, {
      method: "POST",
      redirect: "manual",
      body: buildRegisterForm("Siswa Uji", username),
    });

    const token = getSetCookieToken(registerRes);
    record(
      "POST /register (no-JS) creates user and sets session",
      registerRes.status >= 300 && registerRes.status < 400 && !!token,
      `status=${registerRes.status} cookie=${token ? "set" : "missing"}`
    );

    if (token) {
      const cookieHeader = `eduspark_session=${token}`;
      const dashRes = await fetch(`${BASE}/dashboard`, {
        headers: { cookie: cookieHeader },
      });
      const dashHtml = await dashRes.text();
      const cleanHtml = dashHtml.replace(/<!-- -->/g, "");
      record(
        "GET /dashboard with session shows greeting",
        dashRes.status === 200 && cleanHtml.includes("Halo, Siswa Uji"),
        `status=${dashRes.status}`
      );

      const learnRes = await fetch(`${BASE}/learn`, {
        headers: { cookie: cookieHeader },
      });
      const learnHtml = await learnRes.text();
      record(
        "GET /learn with session renders",
        learnRes.status === 200 && learnHtml.includes("Buat materi belajar"),
        `status=${learnRes.status}`
      );

      const sparkRes = await fetch(`${BASE}/spark`, {
        headers: { cookie: cookieHeader },
      });
      const sparkHtml = await sparkRes.text();
      record(
        "GET /spark with session renders",
        sparkRes.status === 200 && sparkHtml.includes("Teman belajarmu"),
        `status=${sparkRes.status}`
      );

      const learnNoAuthRedirect = await fetch(`${BASE}/learn`, {
        redirect: "manual",
      });
      record(
        "GET /learn without session redirects to /login",
        learnNoAuthRedirect.status >= 300 &&
          learnNoAuthRedirect.status < 400 &&
          (learnNoAuthRedirect.headers.get("location") ?? "").includes("/login"),
        `status=${learnNoAuthRedirect.status}`
      );
    }

    const dupRes = await fetch(`${BASE}/register`, {
      method: "POST",
      redirect: "manual",
      body: buildRegisterForm("Duplikat", username),
    });
    const dupHtml = await dupRes.text();
    record(
      "Duplicate username shows validation error",
      dupHtml.includes("sudah dipakai"),
      `status=${dupRes.status}`
    );

    const loginPage = await fetch(`${BASE}/login`);
    const loginPageHtml = await loginPage.text();
    const loginRef = loginPageHtml.match(/name="(\$ACTION_REF_\d+)"\s*\/?>/);
    const loginBody = loginPageHtml.match(
      /name="(\$ACTION_\d+:0)"\s+value="([^"]*)"/
    );
    const loginBound = loginPageHtml.match(
      /name="(\$ACTION_\d+:1)"\s+value="([^"]*)"/
    );
    const loginKey = loginPageHtml.match(/name="(\$ACTION_KEY)"\s+value="([^"]*)"/);

    if (loginRef && loginBody && loginBound && loginKey) {
      const loginFd = new FormData();
      loginFd.set("username", username);
      loginFd.set("password", "salah-sandi");
      loginFd.set(loginRef[1], "");
      loginFd.set(loginBody[1], loginBody[2].replace(/&quot;/g, '"'));
      loginFd.set(loginBound[1], loginBound[2].replace(/&quot;/g, '"'));
      loginFd.set(loginKey[1], loginKey[2]);
      const wrongPassRes = await fetch(`${BASE}/login`, {
        method: "POST",
        redirect: "manual",
        body: loginFd,
      });
      const wrongPassHtml = (await wrongPassRes.text()).replace(/<!-- -->/g, "");
      record(
        "Wrong password shows error",
        wrongPassHtml.includes("salah"),
        `status=${wrongPassRes.status}`
      );

      const correctFd = new FormData();
      correctFd.set("username", username);
      correctFd.set("password", "rahasia123");
      correctFd.set(loginRef[1], "");
      correctFd.set(loginBody[1], loginBody[2].replace(/&quot;/g, '"'));
      correctFd.set(loginBound[1], loginBound[2].replace(/&quot;/g, '"'));
      correctFd.set(loginKey[1], loginKey[2]);
      const loginOkRes = await fetch(`${BASE}/login`, {
        method: "POST",
        redirect: "manual",
        body: correctFd,
      });
      const loginToken = getSetCookieToken(loginOkRes);
      record(
        "POST /login (no-JS) with correct password sets session",
        loginOkRes.status >= 300 && loginOkRes.status < 400 && !!loginToken,
        `status=${loginOkRes.status}`
      );
    } else {
      record("Login server action found in HTML", false, "action inputs missing");
    }
  }

  const user = await prisma.user.findUnique({ where: { username } });
  record(
    "Registered user stored with hashed password",
    !!user && user.passwordHash !== "rahasia123" && user.passwordHash.startsWith("$2"),
    user ? `hashPrefix=${user.passwordHash.slice(0, 4)}` : "user missing"
  );

  const siswa = await prisma.user.findUnique({ where: { username: "siswa1" } });
  if (siswa) {
    const cookie = await makeSessionCookie(siswa.id);
    const validRes = await fetch(`${BASE}/dashboard`, {
      headers: { cookie },
    });
    const validHtml = (await validRes.text()).replace(/<!-- -->/g, "");
    record(
      "Valid jose session cookie grants dashboard",
      validRes.status === 200 && validHtml.includes("Halo, Budi"),
      `status=${validRes.status}`
    );
  }

  const subjectCount = await prisma.subject.count();
  record(
    "Seed subjects present",
    subjectCount === 3,
    `count=${subjectCount}`
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
    console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
    if (failed.length > 0) process.exitCode = 1;
  });
