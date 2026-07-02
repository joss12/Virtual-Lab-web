"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";
import { useTranslations, useLocale } from "next-intl";

interface LeaderboardEntry {
  rank: number;
  email: string;
  score: number;
  total: number;
  created_at: string;
  avatar_url: string;
}

function getEmailFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.email ?? null;
  } catch {
    return null;
  }
}

const MEDALS = ["🥇", "🥈", "🥉"];

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (user.length <= 2) return `${user}***@${domain}`;
  return `${user[0]}${user[1]}***@${domain}`;
}

function ScoreBar({ score, total }: { score: number; total: number }) {
  const pct = Math.round((score / total) * 100);
  const color = pct >= 80 ? "#44cc88" : pct >= 60 ? "#ffcc22" : "#ff6622";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div
        style={{
          flex: 1,
          height: "4px",
          background: "rgba(255,255,255,.08)",
          borderRadius: "2px",
          overflow: "hidden",
          minWidth: "60px",
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
      <span
        style={{
          fontSize: "10px",
          color,
          fontFamily: "monospace",
          flexShrink: 0,
        }}
      >
        {score}/{total}
      </span>
    </div>
  );
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const { token, isAuthenticated } = useAuthStore();
  const myEmail = getEmailFromToken(token);
  const t = useTranslations("leaderboard");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/leaderboard");
      setEntries(res.data);
      setLastUpdated(new Date());
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const myBestScore = entries.find(
    (e) => isAuthenticated && myEmail && e.email === myEmail,
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1420",
        fontFamily: "monospace",
        color: "#ddeeff",
        padding: "32px 24px",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "9px",
              letterSpacing: ".14em",
              color: "rgba(91,155,213,.6)",
              marginBottom: "6px",
            }}
          >
            {t("globalRankings").toUpperCase()}
          </div>

          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#ddeeff",
              margin: "0 0 4px",
            }}
          >
            {t("title")}
          </h1>

          <p
            style={{
              fontSize: "11px",
              color: "rgba(180,210,240,.45)",
              margin: 0,
            }}
          >
            {t("subtitle")}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "6px",
          }}
        >
          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            style={{
              padding: "8px 16px",
              fontFamily: "monospace",
              fontSize: "10px",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              border: "1px solid rgba(91,155,213,.3)",
              background: "rgba(91,155,213,.1)",
              color: "#5b9bd5",
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? tCommon("loading") : `↻ ${t("refresh")}`}
          </button>

          {lastUpdated && (
            <span style={{ fontSize: "9px", color: "rgba(180,210,240,.3)" }}>
              {lastUpdated.toLocaleTimeString(
                locale === "fr" ? "fr-FR" : "en-US",
              )}
            </span>
          )}
        </div>
      </div>

      {/* Your score banner */}
      {isAuthenticated && myBestScore && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 18px",
            background: "rgba(91,155,213,.1)",
            border: "1px solid rgba(91,155,213,.3)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span style={{ fontSize: "18px" }}>
            {MEDALS[myBestScore.rank - 1] ?? "🏅"}
          </span>

          <div>
            <div
              style={{
                fontSize: "10px",
                color: "rgba(91,155,213,.7)",
                marginBottom: "2px",
              }}
            >
              {t("yourBestScore").toUpperCase()}
            </div>

            <div style={{ fontSize: "13px", color: "#ddeeff" }}>
              {t("rank")} #{myBestScore.rank} — {myBestScore.score}/
              {myBestScore.total} (
              {Math.round((myBestScore.score / myBestScore.total) * 100)}%)
            </div>
          </div>
        </div>
      )}

      {isAuthenticated && !myBestScore && !loading && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 18px",
            background: "rgba(255,255,255,.03)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "8px",
            fontSize: "11px",
            color: "rgba(180,210,240,.5)",
          }}
        >
          {t("notRanked")}
        </div>
      )}

      {!isAuthenticated && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px 18px",
            background: "rgba(255,255,255,.03)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: "8px",
            fontSize: "11px",
            color: "rgba(180,210,240,.5)",
          }}
        >
          <Link
            href={`/${locale}/auth/login`}
            style={{ color: "#5b9bd5", textDecoration: "none" }}
          >
            {t("loginPrompt")}
          </Link>{" "}
          {t("loginMessage")}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            marginBottom: "20px",
            padding: "14px",
            background: "rgba(255,60,60,.08)",
            border: "1px solid rgba(255,60,60,.2)",
            borderRadius: "8px",
            fontSize: "11px",
            color: "rgba(255,120,120,.9)",
          }}
        >
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: "56px",
                background: "rgba(255,255,255,.03)",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,.06)",
                animation: "pulse 1.5s infinite",
              }}
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px",
            color: "rgba(180,210,240,.3)",
            fontSize: "12px",
          }}
        >
          {t("noScores")}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "48px 1fr 120px 100px 110px",
              gap: "12px",
              padding: "8px 16px",
              fontSize: "9px",
              letterSpacing: ".1em",
              color: "rgba(91,155,213,.5)",
            }}
          >
            <span>{t("rank").toUpperCase()}</span>
            <span>{t("player").toUpperCase()}</span>
            <span>{t("score").toUpperCase()}</span>
            <span>{t("pct").toUpperCase()}</span>
            <span>{t("date").toUpperCase()}</span>
          </div>

          {entries.map((entry, i) => {
            const isMe = isAuthenticated && myEmail && entry.email === myEmail;
            const pct = Math.round((entry.score / entry.total) * 100);
            const medal = MEDALS[i];

            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "48px 1fr 120px 100px 110px",
                  gap: "12px",
                  padding: "14px 16px",
                  background: isMe
                    ? "rgba(91,155,213,.1)"
                    : i === 0
                      ? "rgba(255,215,0,.05)"
                      : "rgba(255,255,255,.025)",
                  border: `1px solid ${
                    isMe
                      ? "rgba(91,155,213,.4)"
                      : i === 0
                        ? "rgba(255,215,0,.2)"
                        : "rgba(255,255,255,.06)"
                  }`,
                  borderRadius: "8px",
                  alignItems: "center",
                }}
              >
                {/* Rank */}
                <div
                  style={{
                    fontSize: medal ? "18px" : "13px",
                    fontWeight: 700,
                    color:
                      i === 0
                        ? "#ffd700"
                        : i === 1
                          ? "#c0c0c0"
                          : i === 2
                            ? "#cd7f32"
                            : "rgba(180,210,240,.5)",
                  }}
                >
                  {medal ?? `#${entry.rank}`}
                </div>

                {/* Player */}
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <img
                    src={entry.avatar_url}
                    alt=""
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,.05)",
                    }}
                  />

                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: isMe ? "#5b9bd5" : "#ddeeff",
                        fontWeight: isMe ? 700 : 400,
                      }}
                    >
                      {maskEmail(entry.email)}

                      {isMe && (
                        <span
                          style={{
                            marginLeft: "6px",
                            fontSize: "9px",
                            color: "#5b9bd5",
                          }}
                        >
                          YOU
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score bar */}
                <ScoreBar score={entry.score} total={entry.total} />

                {/* Percentage */}
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color:
                      pct >= 80 ? "#44cc88" : pct >= 60 ? "#ffcc22" : "#ff6622",
                  }}
                >
                  {pct}%
                </div>

                {/* Date */}
                <div
                  style={{ fontSize: "10px", color: "rgba(180,210,240,.4)" }}
                >
                  {formatDate(entry.created_at, locale)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      <div
        style={{
          marginTop: "24px",
          fontSize: "10px",
          color: "rgba(180,210,240,.25)",
          textAlign: "center",
        }}
      >
        {t("footer")}
      </div>
    </div>
  );
}
