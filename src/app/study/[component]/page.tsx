"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { STUDY_DATA } from "@/lib/studyData";
import { notFound } from "next/navigation";
import { useProgressStore } from "@/store/useProgressStore";
import { useAuthStore } from "@/store/useAuthStore";

const TABS = [
  "overview",
  "history",
  "types",
  "connections",
  "commands",
] as const;
type Tab = (typeof TABS)[number];
type Platform = "windows" | "mac" | "linux";
type Lang = "en" | "fr";

type LT = { en: string; fr: string } | string;

function t(value: LT | undefined, lang: Lang): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value.en ?? "";
}

const COMPONENT_IMAGES: Record<string, string> = {
  keyboard:
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&q=80&auto=format&fit=crop",
  mouse:
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1200&q=80&auto=format&fit=crop",
  monitor:
    "https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=1200&q=80&auto=format&fit=crop",
  cpu: "https://images.unsplash.com/photo-1555617981-dac3772e4783?w=1200&q=80&auto=format&fit=crop",
  gpu: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1200&q=80&auto=format&fit=crop",
  ram: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=1200&q=80&auto=format&fit=crop",
  storage:
    "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=1200&q=80&auto=format&fit=crop",
  motherboard:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80&auto=format&fit=crop",
  ports:
    "https://images.unsplash.com/photo-1625891813207-f2de6e77c0d5?w=1200&q=80&auto=format&fit=crop",
  dataflow:
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80&auto=format&fit=crop",
};

const tabLabel = (tKey: string, lang: Lang) => {
  if (lang === "fr") {
    if (tKey === "overview") return "vue d'ensemble";
    if (tKey === "history") return "histoire";
    if (tKey === "types") return "types";
    if (tKey === "connections") return "connexions";
    return "commandes";
  }
  return tKey;
};

export default function ComponentPage() {
  const params = useParams();
  const id = params.component as string;
  const data = STUDY_DATA[id];

  const [tab, setTab] = useState<Tab>("overview");
  const [platform, setPlatform] = useState<Platform>("windows");
  const [visited, setVisited] = useState<string[]>(["overview"]);
  const [lang, setLang] = useState<Lang>("en");

  const { isAuthenticated } = useAuthStore();
  const { updateProgress } = useProgressStore();

  if (!data) return notFound();

  const availableTabs = TABS.filter((tk) => {
    if (tk === "history") return !!data.hist;
    if (tk === "types") return !!data.types;
    if (tk === "connections") return !!data.conn;
    if (tk === "commands") return !!data.cmds;
    return true;
  });

  const handleTabChange = (tk: Tab) => {
    setTab(tk);
    const newVisited = visited.includes(tk) ? visited : [...visited, tk];
    setVisited(newVisited);
    const completed = availableTabs.every((tab) => newVisited.includes(tab));
    if (isAuthenticated) updateProgress(id, newVisited, completed);
  };

  const pct = Math.round((visited.length / availableTabs.length) * 100);
  const heroImage = COMPONENT_IMAGES[id];

  return (
    <div className="max-w-3xl">
      <Link
        href="/study"
        className="mb-6 inline-flex items-center gap-2 font-mono text-xs text-white/30 transition hover:text-white"
      >
        ←{" "}
        {lang === "fr"
          ? "Retour à tous les composants"
          : "Back to all components"}
      </Link>

      {/* Hero Image */}
      {heroImage ? (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "220px",
            borderRadius: "12px",
            overflow: "hidden",
            marginBottom: "28px",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={t(data.name, "en")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom, rgba(13,20,32,0.3) 0%, rgba(13,20,32,0.85) 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              right: "100px",
            }}
          >
            <div
              style={{
                fontSize: "9px",
                letterSpacing: ".14em",
                color: "rgba(180,210,240,.6)",
                marginBottom: "4px",
              }}
            >
              {t(data.cat, lang)} · {data.icon}
            </div>
            <h1
              style={{
                fontSize: "28px",
                fontWeight: 700,
                color: "#fff",
                margin: "0 0 4px",
                fontFamily: "monospace",
              }}
            >
              {t(data.name, lang)}
            </h1>
            <p
              style={{
                fontSize: "12px",
                color: "rgba(180,210,240,.7)",
                margin: 0,
                fontFamily: "monospace",
                fontStyle: "italic",
              }}
            >
              {t(data.tag, lang)}
            </p>
          </div>
          <div
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              display: "flex",
              gap: "6px",
            }}
          >
            {(["en", "fr"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  padding: "4px 12px",
                  fontFamily: "monospace",
                  fontSize: "10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  border:
                    lang === l
                      ? "1px solid #5b9bd5"
                      : "1px solid rgba(255,255,255,.2)",
                  background:
                    lang === l ? "rgba(91,155,213,.3)" : "rgba(0,0,0,.4)",
                  color: lang === l ? "#5b9bd5" : "rgba(255,255,255,.7)",
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="font-mono text-xs tracking-widest text-white/30">
              {t(data.cat, lang)} · {data.icon}
            </div>
            <div className="flex gap-2">
              {(["en", "fr"] as Lang[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`rounded-md border px-3 py-1 font-mono text-xs transition ${lang === l ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-white/10 text-white/40 hover:border-white/30"}`}
                >
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <h1 className="font-mono text-3xl font-bold text-white">
            {t(data.name, lang)}
          </h1>
          <p className="mt-1 font-mono text-sm italic text-white/40">
            {t(data.tag, lang)}
          </p>
        </div>
      )}

      {/* Progress bar */}
      {isAuthenticated && (
        <div className="mb-6">
          <div className="mb-1 flex justify-between font-mono text-xs text-white/30">
            <span>{lang === "fr" ? "Progression" : "Progress"}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-white/10">
        {availableTabs.map((tKey) => (
          <button
            key={tKey}
            onClick={() => handleTabChange(tKey)}
            className={`px-4 py-2 font-mono text-xs capitalize transition ${
              tab === tKey
                ? "border-b-2 border-blue-500 text-blue-400"
                : visited.includes(tKey)
                  ? "text-white/60 hover:text-white"
                  : "text-white/30 hover:text-white"
            }`}
          >
            {tabLabel(tKey, lang)}
            {visited.includes(tKey) && tKey !== tab && (
              <span className="ml-1 text-green-500">·</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {tab === "overview" && (
          <p className="whitespace-pre-line font-mono text-sm leading-relaxed text-white/70">
            {t(data.ov, lang)}
          </p>
        )}

        {tab === "history" && data.hist && (
          <div className="space-y-4">
            {data.hist.map((entry, index) => (
              <div key={`${entry[0]}-${index}`} className="flex gap-4">
                <span className="w-12 shrink-0 font-mono text-xs text-blue-400">
                  {entry[0]}
                </span>
                <span className="font-mono text-xs text-white/30">·</span>
                <span className="font-mono text-sm text-white/70">
                  {t(entry[1], lang)}
                </span>
              </div>
            ))}
          </div>
        )}

        {tab === "types" && data.types && (
          <div className="space-y-3">
            {data.types.map((entry, index) => (
              <div
                key={`${id}-type-${index}`}
                className="rounded-lg border-l-4 border-blue-500/50 bg-white/5 p-4"
              >
                <div className="mb-1 font-mono text-sm font-bold text-blue-400">
                  {t(entry[0], lang)}
                </div>
                <div className="font-mono text-sm text-white/60">
                  {t(entry[1], lang)}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "connections" && data.conn && (
          <div className="space-y-3">
            {data.conn.map((entry, index) => (
              <div
                key={`${id}-conn-${index}`}
                className="rounded-lg border-l-4 border-blue-500/50 bg-white/5 p-4"
              >
                <div className="mb-1 font-mono text-sm font-bold text-blue-400">
                  {t(entry[0], lang)}
                </div>
                <div className="font-mono text-sm text-white/60">
                  {t(entry[1], lang)}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "commands" && data.cmds && (
          <div>
            <div className="mb-4 flex gap-2">
              {(["windows", "mac", "linux"] as Platform[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`rounded-md border px-3 py-1 font-mono text-xs transition ${platform === p ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-white/10 text-white/40 hover:border-white/30"}`}
                >
                  {p === "windows"
                    ? "Windows"
                    : p === "mac"
                      ? "macOS"
                      : "Linux"}
                </button>
              ))}
            </div>
            <div className="overflow-hidden rounded-lg border border-white/10">
              {data.cmds[platform].map((entry, index) => (
                <div
                  key={`${platform}-${index}`}
                  className="flex items-center gap-4 border-b border-white/5 px-4 py-3 last:border-0"
                >
                  <span className="min-w-[160px] rounded bg-blue-500/10 px-2 py-1 font-mono text-xs text-blue-400">
                    {entry[0]}
                  </span>
                  <span className="font-mono text-sm text-white/60">
                    {t(entry[1], lang)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
