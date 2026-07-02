"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useQuizStore } from "@/store/useQuizStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useTranslations, useLocale } from "next-intl";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    month: "short",
    day: "numeric",
  });
}

const COMPONENT_LABELS: Record<string, string> = {
  keyboard: "Keyboard",
  mouse: "Mouse",
  monitor: "Monitor",
  cpu: "CPU",
  gpu: "GPU",
  ram: "RAM",
  storage: "Storage",
  motherboard: "Motherboard",
  ports: "Ports",
  dataflow: "Data Flow",
};

const COMPONENTS = [
  "keyboard",
  "mouse",
  "monitor",
  "cpu",
  "gpu",
  "ram",
  "storage",
  "motherboard",
  "ports",
  "dataflow",
];

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart({
  completed,
  total,
}: {
  completed: number;
  total: number;
}) {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const pct = completed / total;
  const dash = pct * circumference;
  const gap = circumference - dash;

  return (
    <div
      style={{
        position: "relative",
        width: "140px",
        height: "140px",
        flexShrink: 0,
      }}
    >
      <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="12"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#5b9bd5"
          strokeWidth="12"
          strokeDasharray={`${dash} ${gap}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: "28px",
            fontWeight: 700,
            color: "#ddeeff",
            fontFamily: "monospace",
          }}
        >
          {completed}
        </span>
        <span
          style={{
            fontSize: "11px",
            color: "rgba(180,210,240,.4)",
            fontFamily: "monospace",
          }}
        >
          of {total}
        </span>
      </div>
    </div>
  );
}

// ─── Line Chart ───────────────────────────────────────────────────────────────

function ScoreChart({
  scores,
  message,
  locale,
}: {
  scores: { score: number; total: number; created_at: string }[];
  message: string;
  locale: string;
}) {
  const last10 = [...scores].reverse().slice(0, 10);
  if (last10.length < 2) {
    return (
      <div
        style={{
          height: "120px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(180,210,240,.3)",
          fontSize: "11px",
          fontFamily: "monospace",
        }}
      >
        {message}
      </div>
    );
  }

  const W = 500,
    H = 100,
    pad = 20;
  const points = last10.map((s, i) => {
    const pct = s.score / s.total;
    const x = pad + (i / (last10.length - 1)) * (W - pad * 2);
    const y = pad + (1 - pct) * (H - pad * 2);
    return {
      x,
      y,
      pct,
      label: formatDate(s.created_at, locale),
      score: s.score,
      total: s.total,
    };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area =
    `M${points[0].x},${H} ` +
    points.map((p) => `L${p.x},${p.y}`).join(" ") +
    ` L${points[points.length - 1].x},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "120px" }}>
      <defs>
        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5b9bd5" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#5b9bd5" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#scoreGrad)" />
      <polyline
        points={polyline}
        fill="none"
        stroke="#5b9bd5"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((p, i) => (
        <g key={i}>
          <circle
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#0d1420"
            stroke="#5b9bd5"
            strokeWidth="2"
          />
          <title>{`${p.label}: ${p.score}/${p.total} (${Math.round(p.pct * 100)}%)`}</title>
        </g>
      ))}
    </svg>
  );
}

// ─── Quick Action Button ──────────────────────────────────────────────────────

function QuickAction({
  href,
  icon,
  label,
  color,
}: {
  href: string;
  icon: string;
  label: string;
  color: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          padding: "16px 12px",
          background: "rgba(255,255,255,.03)",
          border: `1px solid ${color}22`,
          borderRadius: "10px",
          cursor: "pointer",
          transition: "all .2s",
          fontFamily: "monospace",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = `${color}11`)}
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,.03)")
        }
      >
        <span style={{ fontSize: "22px" }}>{icon}</span>
        <span style={{ fontSize: "10px", color, letterSpacing: ".08em" }}>
          {label.toUpperCase()}
        </span>
      </div>
    </Link>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { isAuthenticated } = useAuthStore();
  const { scores, fetchScores } = useQuizStore();
  const { progress, fetchProgress } = useProgressStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [avatarURL, setAvatarURL] = useState<string | null>(null);
  const t = useTranslations("dashboard");
  const tNav = useTranslations("nav");
  const locale = useLocale();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    api.get("/me").then((r) => {
      setAvatarURL(r.data.avatar_url);
    });

    Promise.all([fetchScores(), fetchProgress()]).finally(() =>
      setLoading(false),
    );
  }, [isAuthenticated]);

  const completedComponents = progress.filter((p) => p.completed).length;
  const bestScore =
    scores.length > 0
      ? Math.max(...scores.map((s) => Math.round((s.score / s.total) * 100)))
      : null;
  const avgScore =
    scores.length > 0
      ? Math.round(
          scores.reduce((sum, s) => sum + (s.score / s.total) * 100, 0) /
            scores.length,
        )
      : null;
  const studyPct = Math.round((completedComponents / 10) * 100);

  const recentActivity = useMemo(() => {
    const quizActs = scores.slice(0, 3).map((s) => ({
      type: "quiz",
      label: `Quiz: ${s.score}/${s.total} (${Math.round((s.score / s.total) * 100)}%)`,
      date: s.created_at,
    }));
    const studyActs = [...progress]
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
      )
      .slice(0, 3)
      .map((p) => ({
        type: "study",
        label: `${locale === "fr" ? "Étudié" : "Studied"}: ${COMPONENT_LABELS[p.component] ?? p.component}`,
        date: p.updated_at,
      }));
    return [...quizActs, ...studyActs]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [scores, progress, locale]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0d1420",
          padding: "32px 24px",
          fontFamily: "monospace",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            maxWidth: "900px",
          }}
        >
          {[200, 120, 300, 200].map((h, i) => (
            <div
              key={i}
              style={{
                height: `${h}px`,
                background: "rgba(255,255,255,.04)",
                borderRadius: "12px",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1420",
        padding: "32px 24px",
        fontFamily: "monospace",
        color: "#ddeeff",
      }}
    >
      <div style={{ maxWidth: "900px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          {avatarURL ? (
            <img
              src={avatarURL}
              alt="avatar"
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                flexShrink: 0,
                background: "rgba(255,255,255,.05)",
              }}
            />
          ) : (
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                flexShrink: 0,
                background: "rgba(255,255,255,.05)",
              }}
            />
          )}
          <div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#ddeeff",
                margin: "0 0 2px",
              }}
            >
              {t("welcomeBack")}
            </h1>
            <p
              style={{
                fontSize: "11px",
                color: "rgba(180,210,240,.4)",
                margin: 0,
              }}
            >
              {studyPct === 0
                ? t("startStudying")
                : studyPct === 100
                  ? `🎉 ${t("completedAll")}`
                  : t("throughCurriculum", { pct: studyPct })}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          {[
            {
              label: t("quizzesTaken"),
              value: scores.length,
              color: "#5b9bd5",
            },
            {
              label: t("bestScore"),
              value: bestScore !== null ? `${bestScore}%` : "—",
              color: "#44cc88",
            },
            {
              label: t("averageScore"),
              value: avgScore !== null ? `${avgScore}%` : "—",
              color: "#ffcc22",
            },
            {
              label: t("componentsDone"),
              value: `${completedComponents}/10`,
              color: "#aa44ff",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,.03)",
                border: "1px solid rgba(255,255,255,.07)",
                borderRadius: "10px",
                padding: "14px 16px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  letterSpacing: ".1em",
                  color: "rgba(180,210,240,.4)",
                  marginBottom: "6px",
                }}
              >
                {label.toUpperCase()}
              </div>
              <div style={{ fontSize: "22px", fontWeight: 700, color }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          {/* Study progress */}
          <div
            style={{
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "9px",
                letterSpacing: ".1em",
                color: "rgba(91,155,213,.5)",
                marginBottom: "16px",
              }}
            >
              {t("studyProgress").toUpperCase()}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
              <DonutChart completed={completedComponents} total={10} />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                {COMPONENTS.map((id) => {
                  const p = progress.find((x) => x.component === id);
                  const pct = p
                    ? Math.round((p.tabs_visited.length / 5) * 100)
                    : 0;
                  const color = p?.completed
                    ? "#44cc88"
                    : pct > 0
                      ? "#5b9bd5"
                      : "rgba(255,255,255,.1)";
                  return (
                    <Link
                      key={id}
                      href={`/${locale}/study/${id}`}
                      style={{
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "9px",
                          color: "rgba(180,210,240,.5)",
                          width: "72px",
                        }}
                      >
                        {COMPONENT_LABELS[id]}
                      </span>
                      <div
                        style={{
                          flex: 1,
                          height: "3px",
                          background: "rgba(255,255,255,.06)",
                          borderRadius: "2px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: color,
                            borderRadius: "2px",
                            transition: "width .4s",
                          }}
                        />
                      </div>
                      {p?.completed && (
                        <span style={{ fontSize: "8px", color: "#44cc88" }}>
                          ✓
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Score trend */}
          <div
            style={{
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "9px",
                letterSpacing: ".1em",
                color: "rgba(91,155,213,.5)",
                marginBottom: "16px",
              }}
            >
              {t("quizScoreTrend").toUpperCase()}
            </div>
            <ScoreChart
              scores={scores}
              message={t("takeQuizzes")}
              locale={locale}
            />
            {scores.length >= 2 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "8px",
                }}
              >
                <span
                  style={{ fontSize: "9px", color: "rgba(180,210,240,.3)" }}
                >
                  {formatDate(scores[scores.length - 1]?.created_at, locale)}
                </span>
                <span
                  style={{ fontSize: "9px", color: "rgba(180,210,240,.3)" }}
                >
                  {formatDate(scores[0]?.created_at, locale)}
                </span>
              </div>
            )}
            {scores.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px 0",
                  fontSize: "11px",
                  color: "rgba(180,210,240,.3)",
                }}
              >
                {t("noQuizYet")}{" "}
                <Link
                  href={`/${locale}/quiz`}
                  style={{ color: "#5b9bd5", textDecoration: "none" }}
                >
                  {t("takeQuiz")}
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent activity + Quick actions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          {/* Recent activity */}
          <div
            style={{
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "9px",
                letterSpacing: ".1em",
                color: "rgba(91,155,213,.5)",
                marginBottom: "14px",
              }}
            >
              {t("recentActivity").toUpperCase()}
            </div>
            {recentActivity.length === 0 ? (
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(180,210,240,.3)",
                  padding: "8px 0",
                }}
              >
                {t("noActivity")}
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {recentActivity.map((a, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 0",
                      borderBottom: "1px solid rgba(255,255,255,.04)",
                    }}
                  >
                    <span style={{ fontSize: "14px" }}>
                      {a.type === "quiz" ? "🎯" : "📖"}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "11px", color: "#ddeeff" }}>
                        {a.label}
                      </div>
                      <div
                        style={{
                          fontSize: "9px",
                          color: "rgba(180,210,240,.3)",
                          marginTop: "1px",
                        }}
                      >
                        {formatDate(a.date, locale)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div
            style={{
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "9px",
                letterSpacing: ".1em",
                color: "rgba(91,155,213,.5)",
                marginBottom: "14px",
              }}
            >
              {t("quickActions").toUpperCase()}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "8px",
              }}
            >
              <QuickAction
                href={`/${locale}/study`}
                icon="📚"
                label={tNav("study")}
                color="#5b9bd5"
              />
              <QuickAction
                href={`/${locale}/quiz`}
                icon="🎯"
                label={tNav("quiz")}
                color="#44cc88"
              />
              <QuickAction
                href={`/${locale}/lab`}
                icon="🔬"
                label={tNav("lab")}
                color="#aa44ff"
              />
              <QuickAction
                href={`/${locale}/leaderboard`}
                icon="🏆"
                label={tNav("ranks")}
                color="#ffcc22"
              />
              <QuickAction
                href={`/${locale}/glossary`}
                icon="📖"
                label={tNav("glossary")}
                color="#22ccaa"
              />
              <QuickAction
                href={`/${locale}/troubleshoot`}
                icon="🔧"
                label={tNav("fix")}
                color="#ff6622"
              />
            </div>
          </div>
        </div>

        {/* Quiz history */}
        {scores.length > 0 && (
          <div
            style={{
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "9px",
                letterSpacing: ".1em",
                color: "rgba(91,155,213,.5)",
                marginBottom: "14px",
              }}
            >
              {t("quizHistory").toUpperCase()}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 160px 80px 100px",
                gap: "12px",
                padding: "4px 8px",
                fontSize: "9px",
                letterSpacing: ".08em",
                color: "rgba(91,155,213,.4)",
              }}
            >
              <span>DATE</span>
              <span>SCORE</span>
              <span>PCT</span>
              <span>COMPONENT</span>
            </div>
            {scores.slice(0, 8).map((s, i) => {
              const pct = Math.round((s.score / s.total) * 100);
              const color =
                pct >= 80 ? "#44cc88" : pct >= 60 ? "#ffcc22" : "#ff6622";
              return (
                <div
                  key={s.id ?? i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 160px 80px 100px",
                    gap: "12px",
                    padding: "10px 8px",
                    borderTop: "1px solid rgba(255,255,255,.04)",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{ fontSize: "11px", color: "rgba(180,210,240,.5)" }}
                  >
                    {formatDate(s.created_at, locale)}
                  </span>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: "4px",
                        background: "rgba(255,255,255,.08)",
                        borderRadius: "2px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: color,
                          borderRadius: "2px",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "10px", color, flexShrink: 0 }}>
                      {s.score}/{s.total}
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: 700, color }}>
                    {pct}%
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      color: "rgba(180,210,240,.4)",
                      textTransform: "capitalize",
                    }}
                  >
                    {s.component
                      ? (COMPONENT_LABELS[s.component] ?? s.component)
                      : "Mixed"}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
