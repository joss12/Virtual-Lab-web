"use client";

import Link from "next/link";
import { useLocale } from "next-intl";

export default function Footer() {
  const locale = useLocale();
  const year = new Date().getFullYear();

  const links = [
    { label: "Study", href: `/${locale}/study` },
    { label: "3D Lab", href: `/${locale}/lab` },
    { label: "Quiz", href: `/${locale}/quiz` },
    { label: "Glossary", href: `/${locale}/glossary` },
  ];

  return (
    <footer className="relative border-t border-white/10 bg-[#0e1420]">
      {/* silkscreen trace detail along the top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center" aria-hidden="true">
        <svg width="220" height="10" viewBox="0 0 220 10" fill="none" className="-translate-y-[5px]">
          <path d="M0 5 H80 L90 1 H130 L140 5 H220" stroke="rgba(59,130,246,0.35)" strokeWidth="1.5" />
          <circle cx="110" cy="1" r="2.5" className="fill-blue-500" />
        </svg>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        {/* brand */}
        <div className="flex flex-col gap-1">
          <span className="font-mono text-base font-bold text-white">
            vlab<span className="text-blue-500">_</span>
          </span>
          <span className="font-mono text-[11px] text-white/30">
            {locale === "fr"
              ? "Laboratoire informatique virtuel"
              : "Virtual computer lab"}
          </span>
        </div>

        {/* quick links */}
        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="font-mono text-xs text-white/40 transition hover:text-blue-400"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* copyright + credit */}
        <div className="flex flex-col gap-1 font-mono text-[11px] text-white/30 md:items-end">
          <span>© {year} vlab. {locale === "fr" ? "Tous droits réservés." : "All rights reserved."}</span>
          <span>
            {locale === "fr" ? "Conçu par" : "Built by"}{" "}
            <a
              href="https://eddymouity.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 transition hover:text-blue-400"
            >
              eddymouity.dev ↗
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
