"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";

const LINE1 = "See inside";
const LINE2 = "the machine.";

const CARDS = [
  {
    ref: "U1",
    tag: "STUDY",
    title: "10 components",
    desc: "Keyboard to GPU — every part of your PC explained",
    href: "/study",
  },
  {
    ref: "U2",
    tag: "3D LAB",
    title: "3D Lab",
    desc: "Interactive motherboard with data flow and power visualization",
    href: "/lab",
  },
  {
    ref: "U3",
    tag: "QUIZ",
    title: "Quiz mode",
    desc: "15 questions to test what you've learned",
    href: "/quiz",
  },
];

export default function HomePage() {
  const locale = useLocale();

  const [typed, setTyped] = useState("");
  const [typingDone, setTypingDone] = useState(false);

  const fullText = LINE1 + "\n" + LINE2;

  // Typewriter — skipped entirely for reduced-motion users
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTyped(fullText);
      setTypingDone(true);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setTyped(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(id);
        setTypingDone(true);
      }
    }, 55);
    return () => clearInterval(id);
  }, []);

  const [l1, l2 = ""] = typed.split("\n");

  return (
    <main className="relative min-h-[calc(100vh-65px)] overflow-hidden">
      {/* PCB grid + ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="pointer-events-none absolute left-1/2 top-[-10%] h-[480px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[130px]" />

      <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-20 sm:px-6 sm:pt-28">
        {/* hero */}
        <div className="text-center">
          <div className="boot boot-1 font-mono text-xs tracking-[0.35em] text-blue-400">
            <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400 align-middle" />
            VIRTUAL COMPUTER LAB
          </div>

          {/* fixed height so layout doesn't jump while typing */}
          <h1 className="mt-6 min-h-[2.4em] font-mono text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
            {l1}
            {typed.includes("\n") && (
              <>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-white bg-clip-text text-transparent">
                  {l2}
                </span>
              </>
            )}
            <span
              className={`cursor ml-1 inline-block h-[0.9em] w-[0.5em] translate-y-[0.12em] bg-blue-400 ${
                typingDone ? "cursor-blink" : ""
              }`}
              aria-hidden="true"
            />
          </h1>

          <p className={`boot ${typingDone ? "boot-go" : ""} mx-auto mt-6 max-w-xl font-mono text-xs leading-relaxed text-white/40 sm:text-sm`}>
            Interactive 3D models, deep study guides for every component,
            real-time data flow visualization, and quizzes to test your
            knowledge.
          </p>

          <div className={`boot ${typingDone ? "boot-go boot-d1" : ""} mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4`}>
            <Link
              href={`/${locale}/study`}
              className="w-full rounded-md bg-blue-600 px-6 py-3 font-mono text-sm font-bold text-white shadow-[0_0_28px_rgba(37,99,235,0.35)] transition hover:bg-blue-500 hover:shadow-[0_0_42px_rgba(59,130,246,0.55)] sm:w-auto"
            >
              Start studying →
            </Link>
            <Link
              href={`/${locale}/auth/register`}
              className="w-full rounded-md border border-white/20 px-6 py-3 font-mono text-sm text-white/60 transition hover:border-white/60 hover:bg-white/5 hover:text-white sm:w-auto"
            >
              Create account
            </Link>
          </div>
        </div>

        {/* circuit traces: draw in after typing, then pulses flow */}
        <div
          className={`mx-auto hidden h-28 max-w-4xl sm:block ${typingDone ? "traces-on" : "traces-off"}`}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 800 110"
            fill="none"
            className="h-full w-full"
            preserveAspectRatio="none"
          >
            <circle cx="400" cy="8" r="4" className="fill-blue-500" />
            <circle cx="140" cy="102" r="3.5" className="pad fill-blue-500/70" />
            <circle cx="400" cy="102" r="3.5" className="pad fill-blue-500/70" />
            <circle cx="660" cy="102" r="3.5" className="pad fill-blue-500/70" />

            <path id="tr-l" d="M400 8 V40 L340 60 H180 L140 80 V102" className="trace" pathLength={1} />
            <path id="tr-c" d="M400 8 V102" className="trace" pathLength={1} />
            <path id="tr-r" d="M400 8 V40 L460 60 H620 L660 80 V102" className="trace" pathLength={1} />

            <circle r="3" className="pulse">
              <animateMotion dur="2.6s" repeatCount="indefinite">
                <mpath href="#tr-l" />
              </animateMotion>
            </circle>
            <circle r="3" className="pulse">
              <animateMotion dur="2s" begin="0.5s" repeatCount="indefinite">
                <mpath href="#tr-c" />
              </animateMotion>
            </circle>
            <circle r="3" className="pulse">
              <animateMotion dur="2.6s" begin="1s" repeatCount="indefinite">
                <mpath href="#tr-r" />
              </animateMotion>
            </circle>
          </svg>
        </div>

        {/* feature cards, staggered mount */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:mt-0 sm:grid-cols-3">
          {CARDS.map((c, i) => (
            <Link
              key={c.ref}
              href={`/${locale}${c.href}`}
              className={`boot ${typingDone ? `boot-go boot-d${i + 2}` : ""} group relative rounded-lg border border-white/10 bg-white/5 p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-blue-500/50 hover:bg-blue-500/[0.06] hover:shadow-[0_8px_40px_rgba(37,99,235,0.15)]`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.25em] text-white/30 transition group-hover:text-blue-400/70">
                  {c.ref} · {c.tag}
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-white/15 transition group-hover:bg-blue-400 group-hover:shadow-[0_0_8px_rgba(96,165,250,0.9)]" />
              </div>
              <div className="mt-4 font-mono text-sm font-bold text-blue-400 transition group-hover:text-blue-300">
                {c.title}
              </div>
              <div className="mt-2 font-mono text-xs leading-relaxed text-white/40 transition group-hover:text-white/60">
                {c.desc}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <style>{`
        /* --- boot sequence: fade-up reveal --- */
        .boot {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity .6s ease, transform .6s ease;
        }
        .boot-1 { /* eyebrow appears immediately on load */
          animation: bootIn .6s ease .1s forwards;
        }
        .boot-go { opacity: 1; transform: translateY(0); }
        .boot-d1 { transition-delay: .15s; }
        .boot-d2 { transition-delay: .45s; }
        .boot-d3 { transition-delay: .6s; }
        .boot-d4 { transition-delay: .75s; }
        @keyframes bootIn {
          to { opacity: 1; transform: translateY(0); }
        }

        /* --- headline cursor --- */
        .cursor-blink { animation: blink 1.1s steps(1) infinite; }
        @keyframes blink { 50% { opacity: 0; } }

        /* --- traces draw in, pads + pulses light up after --- */
        .trace {
          stroke: rgba(59, 130, 246, 0.35);
          stroke-width: 1.5;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
        }
        .traces-on .trace {
          animation: draw .9s ease .25s forwards;
        }
        @keyframes draw { to { stroke-dashoffset: 0; } }
        .pad, .pulse { opacity: 0; }
        .traces-on .pad { animation: fadeIn .4s ease 1.1s forwards; }
        .traces-on .pulse { animation: fadeIn .4s ease 1.3s forwards; }
        @keyframes fadeIn { to { opacity: 1; } }
        .pulse {
          fill: #60a5fa;
          filter: drop-shadow(0 0 5px rgba(96, 165, 250, 0.9));
        }

        /* --- reduced motion: everything just appears, pulses hidden --- */
        @media (prefers-reduced-motion: reduce) {
          .boot, .boot-1 { opacity: 1; transform: none; transition: none; animation: none; }
          .trace { stroke-dashoffset: 0; animation: none; }
          .pad { opacity: 1; animation: none; }
          .pulse { display: none; }
          .cursor { display: none; }
        }
      `}</style>
    </main>
  );
}
