"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ClipboardCheck, House, LogOut, Map, MessageCircle } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { cn } from "cn";
import { LogoMark } from "@/components/brand/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { href: "/dashboard", label: "Beranda", icon: House },
  { href: "/adventure", label: "Peta", icon: Map },
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
        <div className="flex items-center gap-2.5 px-5 py-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-lg"
            aria-label="EduSpark, ke beranda"
          >
            <LogoMark aria-hidden className="size-9" />
            <span className="font-heading text-xl font-semibold text-foreground">
              EduSpark
            </span>
          </Link>
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
        <Link
          href="/dashboard"
          aria-label="EduSpark, ke beranda"
          className="flex items-center gap-2 rounded-lg"
        >
          <LogoMark aria-hidden className="size-8" />
          <span className="font-heading text-lg font-semibold text-foreground">
            EduSpark
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarFallback className="bg-brand-soft text-sm font-bold text-brand-strong">
              {initial}
            </AvatarFallback>
          </Avatar>
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
        aria-label="Navigasi utama bawah"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <div className="grid grid-cols-5">
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
