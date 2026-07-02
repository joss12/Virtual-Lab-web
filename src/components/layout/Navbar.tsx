"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";

const LINKS = [
  { href: "/study", key: "study" },
  { href: "/os", key: "os" },
  { href: "/databases", key: "databases" },
  { href: "/learn", key: "learn" },
  { href: "/lab", key: "lab" },
  { href: "/quiz", key: "quiz" },
  { href: "/build", key: "build" },
  { href: "/specs", key: "specs" },
  { href: "/benchmarks", key: "benchmarks" },
  { href: "/glossary", key: "glossary" },
  { href: "/troubleshoot", key: "fix" },
  { href: "/leaderboard", key: "ranks" },
];

export default function Navbar() {
  const { isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    router.push(`/${locale}/auth/login`);
  };

  const switchLocale = () => {
    const newLocale = locale === "en" ? "fr" : "en";
    router.push(pathname.replace(`/${locale}`, `/${newLocale}`));
  };

  const isActive = (href: string) => {
    const localized = `/${locale}${href}`;
    return pathname === localized || pathname.startsWith(localized + "/");
  };

  const desktopLink = (href: string, label: string) => (
    <Link
      key={href}
      href={`/${locale}${href}`}
      className={`font-mono text-sm transition ${
        isActive(href)
          ? "text-white border-b border-violet-500 pb-0.5"
          : "text-white/50 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  const mobileLink = (href: string, label: string) => (
    <Link
      key={href}
      href={`/${locale}${href}`}
      className={`rounded-md px-3 py-2.5 font-mono text-sm transition ${
        isActive(href)
          ? "bg-violet-600/15 text-violet-300"
          : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );

  const allLinks = [
    ...LINKS,
    ...(isAuthenticated
      ? [
          { href: "/dashboard", key: "dashboard" },
          { href: "/profile", key: "profile" },
        ]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0e1420]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href={`/${locale}`}
          className="font-mono text-lg font-bold text-white"
        >
          vlab<span className="text-violet-500">_</span>
        </Link>

        {/* Desktop links — only on xl and up, hamburger below that */}
        <div className="hidden items-center gap-5 xl:flex">
          {allLinks.map((l) => desktopLink(l.href, t(l.key)))}

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="font-mono text-sm text-red-400 transition hover:text-red-300"
            >
              {t("logout")}
            </button>
          ) : (
            <Link
              href={`/${locale}/auth/login`}
              className={`rounded-md border px-4 py-1.5 font-mono text-sm text-white transition hover:border-white/60 ${
                pathname.includes("/auth/login")
                  ? "border-white/60"
                  : "border-white/20"
              }`}
            >
              {t("login")}
            </Link>
          )}

          <button
            onClick={switchLocale}
            className="rounded-md border border-white/20 px-3 py-1 font-mono text-xs text-white/60 transition hover:border-white/40 hover:text-white"
          >
            {locale === "en" ? "FR" : "EN"}
          </button>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-3 xl:hidden">
          <button
            onClick={switchLocale}
            className="rounded-md border border-white/20 px-2.5 py-1 font-mono text-xs text-white/60 transition hover:text-white"
          >
            {locale === "en" ? "FR" : "EN"}
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] rounded-md border border-white/15 transition hover:border-white/40"
          >
            <span
              className={`h-px w-4 bg-white transition-transform duration-200 ${
                open ? "translate-y-[6px] rotate-45" : ""
              }`}
            />
            <span
              className={`h-px w-4 bg-white transition-opacity duration-200 ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-px w-4 bg-white transition-transform duration-200 ${
                open ? "-translate-y-[6px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        className={`grid overflow-hidden transition-all duration-300 xl:hidden ${
          open ? "grid-rows-[1fr] border-t border-white/10" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0">
          <div className="grid grid-cols-2 gap-1 px-4 py-4 sm:px-6">
            {allLinks.map((l) => mobileLink(l.href, t(l.key)))}
          </div>
          <div className="border-t border-white/10 px-4 py-4 sm:px-6">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full rounded-md border border-red-400/30 px-4 py-2.5 font-mono text-sm text-red-400 transition hover:bg-red-400/10"
              >
                {t("logout")}
              </button>
            ) : (
              <Link
                href={`/${locale}/auth/login`}
                className="block w-full rounded-md bg-violet-600 px-4 py-2.5 text-center font-mono text-sm font-semibold text-white transition hover:bg-violet-500"
              >
                {t("login")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
