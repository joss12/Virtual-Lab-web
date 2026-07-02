"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useLocale } from "next-intl";
import { api } from "@/lib/api";
import { databasesMeta } from "@/content/databases/meta";

interface DbProgress {
  lesson_slug: string;
  completed: boolean;
}

const TRACK_ICONS: Record<string, string> = {
  foundations: "🗄️",
};

const TRACK_COLORS: Record<string, string> = {
  foundations: "#e8854d",
};

const LESSON_COUNTS: Record<string, number> = {
  foundations: 7,
};

const TRACK_LESSON_IDS: Record<string, string[]> = {
  foundations: [
    "database-architecture",
    "data-structures",
    "storage-engines",
    "transaction-management",
    "write-ahead-logging",
    "indexes",
    "query-processing",
  ],
};

export default function DatabasesPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();
  const [progress, setProgress] = useState<DbProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    setLoading(false);
    api.get("/databases/progress")
      .then((res) => setProgress(res.data))
      .catch(() => {});
  }, [isAuthenticated]);

  const getCompletedCount = (trackId: string) => {
    const ids = TRACK_LESSON_IDS[trackId] ?? [];
    return progress.filter((p) => p.completed && ids.includes(p.lesson_slug)).length;
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d1420", padding: "32px 24px", fontFamily: "monospace" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ height: "120px", background: "rgba(255,255,255,.04)", borderRadius: "12px" }} />
          ))}
        </div>
      </div>
    );
  }

  const totalLessons = Object.values(LESSON_COUNTS).reduce((a, b) => a + b, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#0d1420", padding: "32px 24px", fontFamily: "monospace", color: "#ddeeff" }}>
      <div style={{ maxWidth: "900px" }}>
        <div style={{ marginBottom: "40px" }}>
          <div style={{ fontSize: "9px", letterSpacing: ".14em", color: "rgba(232,133,77,.6)", marginBottom: "6px" }}>
            {locale === "fr" ? "INFORMATIQUE" : "COMPUTER SCIENCE"}
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#ddeeff", margin: "0 0 8px" }}>
            {locale === "fr" ? "Bases de données" : "Databases"}
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(180,210,240,.5)", margin: 0, lineHeight: 1.7 }}>
            {locale === "fr"
              ? "Plongée dans les internals des bases de données — moteurs de stockage, transactions, index et traitement des requêtes."
              : "Deep dive into database internals — storage engines, transactions, indexes, and query processing."}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "32px" }}>
          {[
            { label: "Tracks", value: String(databasesMeta.length) },
            { label: locale === "fr" ? "Leçons" : "Lessons", value: String(totalLessons) },
            { label: locale === "fr" ? "Langues" : "Languages", value: "EN + FR" },
            { label: locale === "fr" ? "Niveau" : "Level", value: locale === "fr" ? "Intermédiaire → Expert" : "Intermediate → Expert" },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "10px", padding: "14px 16px" }}>
              <div style={{ fontSize: "9px", letterSpacing: ".1em", color: "rgba(180,210,240,.4)", marginBottom: "6px" }}>
                {label.toUpperCase()}
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#e8854d" }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {databasesMeta.map((track) => {
            const icon = TRACK_ICONS[track.trackId] ?? "🗄️";
            const color = TRACK_COLORS[track.trackId] ?? "#e8854d";
            const total = LESSON_COUNTS[track.trackId] ?? track.lessons.length;
            const completed = getCompletedCount(track.trackId);
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <div key={track.trackId} style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${color}33`, borderRadius: "12px", padding: "24px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "10px", background: `${color}22`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                      <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#ddeeff", margin: 0 }}>{track.track}</h2>
                      {pct === 100 && (
                        <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "4px", background: "rgba(68,204,136,.15)", color: "#44cc88" }}>
                          ✓ {locale === "fr" ? "TERMINÉ" : "COMPLETE"}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: "12px", color: "rgba(180,210,240,.5)", margin: "0 0 14px", lineHeight: 1.6 }}>
                      {track.description}
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,.06)", borderRadius: "2px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "2px", transition: "width .4s" }} />
                      </div>
                      <span style={{ fontSize: "10px", color: "rgba(180,210,240,.4)", flexShrink: 0 }}>
                        {completed}/{total} {locale === "fr" ? "leçons" : "lessons"}
                      </span>
                      <Link href={`/${locale}/databases/${track.trackId}`} style={{ padding: "6px 16px", background: `${color}22`, border: `1px solid ${color}44`, borderRadius: "6px", color, fontSize: "11px", textDecoration: "none", flexShrink: 0 }}>
                        {pct === 0 ? (locale === "fr" ? "Commencer →" : "Start →") : pct === 100 ? (locale === "fr" ? "Revoir →" : "Review →") : (locale === "fr" ? "Continuer →" : "Continue →")}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
