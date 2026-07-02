"use client";

import { useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { STUDY_DATA } from "@/lib/studyData";
import { useProgressStore } from "@/store/useProgressStore";
import { useAuthStore } from "@/store/useAuthStore";
import TypingTest from "../typingTest";
import PortsQuiz from "../PortsQuiz";
import RamGame from "../RamGame";

const TABS = [
  "overview",
  "history",
  "types",
  "connections",
  "commands",
  "typing",
  "practice",
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

const HERO_IMAGES: Record<string, string> = {
  keyboard:
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1400&q=85&auto=format&fit=crop",
  mouse:
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=1400&q=85&auto=format&fit=crop",
  monitor:
    "https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=1400&q=85&auto=format&fit=crop",
  cpu: "https://images.unsplash.com/photo-1555617981-dac3772e4783?w=1400&q=85&auto=format&fit=crop",
  gpu: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1400&q=85&auto=format&fit=crop",
  ram: "https://images.unsplash.com/photo-1562976540-1502c2145186?w=1400&q=85&auto=format&fit=crop",
  storage:
    "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=1400&q=85&auto=format&fit=crop",
  motherboard:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&q=85&auto=format&fit=crop",
  ports:
    "https://images.unsplash.com/photo-1625891813207-f2de6e77c0d5?w=1400&q=85&auto=format&fit=crop",
  dataflow:
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1400&q=85&auto=format&fit=crop",
};

const TYPE_IMAGES: Record<string, string[]> = {
  keyboard: [
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1595225353945-c05ba2028a41?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1510771463146-e89e6e86560e?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601445638532-3b6313b0a5b9?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1638213368993-bfaf6a8b8cce?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1636536736967-82c56b7e6d31?w=600&q=75&auto=format&fit=crop",
  ],
  mouse: [
    "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1586349906319-47f4e28a5cdd?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1536850348-c9d7b62e4a52?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1563241527-3004b7be0b80?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1616788494672-ec7ca25fdda9?w=600&q=75&auto=format&fit=crop",
  ],
  monitor: [
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1593640495253-23196b27a87f?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504270997636-07ddfbd48945?w=600&q=75&auto=format&fit=crop",
  ],
  cpu: [
    "https://images.unsplash.com/photo-1555617981-dac3772e4783?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1603732551681-2e91159b9dc2?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1574920162043-b872873f19bc?w=600&q=75&auto=format&fit=crop",
  ],
  gpu: [
    "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555617981-dac3772e4783?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1542393545-10f5b85e14fc?w=600&q=75&auto=format&fit=crop",
  ],
  ram: [
    "https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601665040048-d1b6f91a3bb1?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1624705013726-8f0fdb40c3c1?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1553481187-be93c21490a9?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=75&auto=format&fit=crop",
  ],
  storage: [
    "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1546872006-1e8e9e7e1efa?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601665040048-d1b6f91a3bb1?w=600&q=75&auto=format&fit=crop",
  ],
  motherboard: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555617748-4a9c5cb26080?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1603732551681-2e91159b9dc2?w=600&q=75&auto=format&fit=crop",
  ],
  ports: [
    "https://images.unsplash.com/photo-1625891813207-f2de6e77c0d5?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551645120-d70bfe84c826?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1531492746076-161ca9bcad58?w=600&q=75&auto=format&fit=crop",
    // "https://images.unsplash.com/photo-1555617117-08a49e46f04a?q=80&w=1200",
  ],
  dataflow: [
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555617981-dac3772e4783?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=75&auto=format&fit=crop",
  ],
};

const CONN_IMAGES: Record<string, string[]> = {
  keyboard: [
    "https://images.unsplash.com/photo-1586349906319-47f4e28a5cdd?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1625891813207-f2de6e77c0d5?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=75&auto=format&fit=crop",
  ],
  mouse: [
    "https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1625891813207-f2de6e77c0d5?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=75&auto=format&fit=crop",
  ],
  monitor: [
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1625891813207-f2de6e77c0d5?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=75&auto=format&fit=crop",
  ],
  cpu: [
    "https://images.unsplash.com/photo-1555617981-dac3772e4783?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1624705013726-8f0fdb40c3c1?w=600&q=75&auto=format&fit=crop",
  ],
  gpu: [
    "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1624705013726-8f0fdb40c3c1?w=600&q=75&auto=format&fit=crop",
  ],
  ram: [
    "https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1553481187-be93c21490a9?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&q=75&auto=format&fit=crop",
  ],
  storage: [
    "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1546872006-1e8e9e7e1efa?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1625891813207-f2de6e77c0d5?w=600&q=75&auto=format&fit=crop",
  ],
  motherboard: [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=75&auto=format&fit=crop",
  ],
  ports: [
    "https://images.unsplash.com/photo-1625891813207-f2de6e77c0d5?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=75&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=75&auto=format&fit=crop",
  ],
  dataflow: [],
};

const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&q=85&auto=format&fit=crop";

const TYPE_FALLBACK =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=75&auto=format&fit=crop";

const CONN_FALLBACK =
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=75&auto=format&fit=crop";

function tabLabel(tKey: string, lang: Lang) {
  if (lang === "fr") {
    if (tKey === "overview") return "vue d'ensemble";
    if (tKey === "history") return "histoire";
    if (tKey === "types") return "types";
    if (tKey === "connections") return "connexions";
    if (tKey === "commands") return "commandes";
    if (tKey === "typing") return "frappe";
    if (tKey === "practice") return "pratique";
  }
  if (tKey === "practice") return lang === "fr" ? "pratique" : "practice";

  if (tKey === "typing") return "typing";
  return tKey;
}

function pickImage(
  images: string[] | undefined,
  index: number,
  fallback: string,
): string {
  if (!images || images.length === 0) return fallback;
  return images[index % images.length] || fallback;
}

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
    if (tk === "history") return Boolean(data.hist);
    if (tk === "types") return Boolean(data.types);
    if (tk === "connections") return Boolean(data.conn);
    if (tk === "commands") return Boolean(data.cmds);
    if (tk === "typing") return id === "keyboard";
    if (tk === "practice") return id === "ports" || id === "ram";
    return true;
  });

  const handleTabChange = (tk: Tab) => {
    setTab(tk);
    const newVisited = visited.includes(tk) ? visited : [...visited, tk];
    setVisited(newVisited);

    const completed = availableTabs.every((tabName) =>
      newVisited.includes(tabName),
    );

    if (isAuthenticated) {
      updateProgress(id, newVisited, completed);
    }
  };

  const pct = Math.round((visited.length / availableTabs.length) * 100);
  const heroImage = HERO_IMAGES[id] ?? HERO_FALLBACK;
  const tagText = t(data.tag, lang);
  const typeImages = TYPE_IMAGES[id] ?? [];
  const connImages = CONN_IMAGES[id] ?? [];

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

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "320px",
          borderRadius: "14px",
          overflow: "hidden",
          marginBottom: "28px",
        }}
      >
        <img
          src={heroImage}
          alt={t(data.name, lang)}
          onError={(e) => {
            e.currentTarget.src = HERO_FALLBACK;
          }}
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
              "linear-gradient(to bottom, rgba(13,20,32,0.1) 0%, rgba(13,20,32,0.75) 60%, rgba(13,20,32,0.97) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            left: "24px",
            right: "120px",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              letterSpacing: ".16em",
              color: "rgba(180,210,240,.6)",
              marginBottom: "6px",
              textTransform: "uppercase",
            }}
          >
            {t(data.cat, lang)} · {data.icon}
          </div>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#fff",
              margin: "0 0 6px",
              fontFamily: "monospace",
              lineHeight: 1.1,
            }}
          >
            {t(data.name, lang)}
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "rgba(180,210,240,.7)",
              margin: 0,
              fontFamily: "monospace",
              fontStyle: "italic",
            }}
          >
            {tagText}
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
                padding: "5px 13px",
                fontFamily: "monospace",
                fontSize: "11px",
                borderRadius: "5px",
                cursor: "pointer",
                border:
                  lang === l
                    ? "1px solid #5b9bd5"
                    : "1px solid rgba(255,255,255,.25)",
                background:
                  lang === l ? "rgba(91,155,213,.35)" : "rgba(0,0,0,.5)",
                color: lang === l ? "#5b9bd5" : "rgba(255,255,255,.8)",
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

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

      <div>
        {tab === "overview" && (
          <p className="whitespace-pre-line font-mono text-sm leading-relaxed text-white/70">
            {t(data.ov, lang)}
          </p>
        )}{" "}
        {tab === "history" && data.hist && (
          <div className="space-y-4">
            {data.hist.map((entry, index) => (
              <div key={`${String(entry[0])}-${index}`} className="flex gap-4">
                <span className="w-12 shrink-0 font-mono text-xs text-blue-400">
                  {String(entry[0])}
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
          <div className="space-y-4">
            {data.types.map((entry, index) => {
              const img = pickImage(typeImages, index, TYPE_FALLBACK);
              const name = t(entry[0], lang);
              const desc = t(entry[1], lang);

              return (
                <div
                  key={`${id}-type-${index}`}
                  style={{
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "1px solid rgba(91,155,213,.2)",
                    background: "rgba(255,255,255,.03)",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "180px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <img
                      src={img}
                      alt={name}
                      onError={(e) => {
                        e.currentTarget.src = TYPE_FALLBACK;
                      }}
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
                          "linear-gradient(to bottom, transparent 40%, rgba(13,20,32,.92) 100%)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "12px",
                        left: "16px",
                        fontFamily: "monospace",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#7ab3e8",
                      }}
                    >
                      {name}
                    </div>
                  </div>

                  <div style={{ padding: "14px 16px" }}>
                    <div className="font-mono text-sm leading-relaxed text-white/60">
                      {desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {tab === "connections" && data.conn && (
          <div className="space-y-4">
            {data.conn.map((entry, index) => {
              const img = pickImage(connImages, index, CONN_FALLBACK);
              const name = t(entry[0], lang);
              const desc = t(entry[1], lang);

              return (
                <div
                  key={`${id}-conn-${index}`}
                  style={{
                    borderRadius: "10px",
                    overflow: "hidden",
                    border: "1px solid rgba(91,155,213,.2)",
                    background: "rgba(255,255,255,.03)",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "160px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <img
                      src={img}
                      alt={name}
                      onError={(e) => {
                        e.currentTarget.src = CONN_FALLBACK;
                      }}
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
                          "linear-gradient(to bottom, transparent 40%, rgba(13,20,32,.92) 100%)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: "12px",
                        left: "16px",
                        fontFamily: "monospace",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#7ab3e8",
                      }}
                    >
                      {name}
                    </div>
                  </div>

                  <div style={{ padding: "14px 16px" }}>
                    <div className="font-mono text-sm leading-relaxed text-white/60">
                      {desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {tab === "commands" && data.cmds && (
          <div>
            <div className="mb-4 flex gap-2">
              {(["windows", "mac", "linux"] as Platform[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`rounded-md border px-3 py-1 font-mono text-xs transition ${
                    platform === p
                      ? "border-blue-500 bg-blue-500/10 text-blue-400"
                      : "border-white/10 text-white/40 hover:border-white/30"
                  }`}
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
        {tab === "typing" && id === "keyboard" && <TypingTest lang={lang} />}
        {tab === "practice" && id === "ports" && <PortsQuiz lang={lang} />}
        {tab === "practice" && id === "ram" && <RamGame lang={lang} />}
      </div>
    </div>
  );
}
