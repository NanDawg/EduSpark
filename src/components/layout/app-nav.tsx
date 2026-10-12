"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ClipboardCheck, House, LogOut, MessageCircle } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { cn } from "cn";

const navItems = [
  { href: "/dashboard", label: "Beranda", icon: House },
  { href: "/learn", label: "Belajar", icon: BookOpen },
  { href: "/quiz", label: "Kuis", icon: ClipboardCheck },
  { href: "/spark", label: "Spark", icon: MessageCircle },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppNav({
  user,
}: {
  user: { name: string; classLevel: number };
}) {
  const pathname = usePathname();
  const initial = user.name.trim().charAt(0).toUpperCase() || "S";

  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex items-center gap-2 px-5 py-6">
          <span
            aria-hidden
            className="flex size-9 items-center justify-center rounded-xl bg-brand font-heading text-lg font-semibold text-brand-ink"
          >
            E
          </span>
          <span className="font-heading text-xl font-semibold text-foreground">
            EduSpark
          </span>
        </div>

        <nav aria-label="Navigasi utama" className="flex flex-1 flex-col gap-1 px-3">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors",
                  active
                    ? "bg-brand-soft text-brand-strong"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4.5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-4.5" aria-hidden />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-lg bg-brand font-heading text-base font-semibold text-brand-ink"
          >
            E
          </span>
          <span className="font-heading text-lg font-semibold text-foreground">
            EduSpark
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-strong"
          >
            {initial}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Keluar dari akun"
              className="flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-5" aria-hidden />
            </button>
          </form>
        </div>
      </header>

      <nav
        aria-label="Navigasi utama"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <div className="grid grid-cols-4">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 py-1.5 text-xs font-semibold transition-colors",
                  active ? "text-brand-strong" : "text-muted-foreground"
                )}
              >
                <Icon className="size-5" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
