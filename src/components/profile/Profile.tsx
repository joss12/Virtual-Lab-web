"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";

interface QuizScore {
  id: string;
  score: number;
  total: number;
  component: string;
  created_at: string;
}

interface Progress {
  component: string;
  tabs_visited: string[];
  completed: boolean;
  updated_at: string;
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

function getMemberSince(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const iat = payload.iat;
    if (!iat) return null;
    return new Date(iat * 1000).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

function getInitials(email: string | null): string {
  if (!email) return "?";
  return email[0].toUpperCase();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
        {pct}%
      </span>
    </div>
  );
}

export default function Profile() {
  const { token, logout } = useAuthStore();
  const email = getEmailFromToken(token);
  const memberSince = getMemberSince(token);
  const initials = getInitials(email);

  const [scores, setScores] = useState<QuizScore[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loadingScores, setLoadingScores] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(true);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/quiz/scores")
      .then((r) => {
        setScores(r.data);
        setLoadingScores(false);
      })
      .catch(() => setLoadingScores(false));

    api
      .get("/progress")
      .then((r) => {
        setProgress(r.data);
        setLoadingProgress(false);
      })
      .catch(() => setLoadingProgress(false));
  }, []);

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
  const completedComponents = progress.filter((p) => p.completed).length;
  const totalComponents = 10;

  const handleChangePassword = async () => {
    setPwError(null);
    setPwSuccess(false);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError("All fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    setPwLoading(true);
    try {
      await api.put("/auth/password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setShowPasswordForm(false), 2000);
    } catch (e: any) {
      setPwError(e?.response?.data?.error ?? "Could not update password.");
    } finally {
      setPwLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    background: "rgba(255,255,255,.05)",
    border: "1px solid rgba(91,155,213,.2)",
    borderRadius: "6px",
    color: "#ddeeff",
    fontFamily: "monospace",
    fontSize: "11px",
    outline: "none",
    boxSizing: "border-box" as const,
  };

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
      <div style={{ marginBottom: "32px" }}>
        <div
          style={{
            fontSize: "9px",
            letterSpacing: ".14em",
            color: "rgba(91,155,213,.6)",
            marginBottom: "6px",
          }}
        >
          ACCOUNT
        </div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#ddeeff",
            margin: 0,
          }}
        >
          Profile
        </h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Avatar card */}
          <div
            style={{
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.07)",
              borderRadius: "12px",
              padding: "24px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "72px",
                height: "72px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0066cc, #00aaff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
                fontSize: "28px",
                fontWeight: 700,
                color: "white",
              }}
            >
              {initials}
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#ddeeff",
                marginBottom: "4px",
                wordBreak: "break-all",
              }}
            >
              {email}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "rgba(180,210,240,.4)",
                marginBottom: "16px",
              }}
            >
              Member since {memberSince}
            </div>
            <button
              onClick={logout}
              style={{
                width: "100%",
                padding: "8px",
                background: "rgba(255,60,60,.08)",
                border: "1px solid rgba(255,60,60,.2)",
                borderRadius: "6px",
                color: "rgba(255,120,120,.8)",
                fontSize: "11px",
                fontFamily: "monospace",
                cursor: "pointer",
              }}
            >
              Log out
            </button>
          </div>

          {/* Stats card */}
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
              STATS
            </div>
            {[
              { label: "Quiz attempts", value: scores.length },
              {
                label: "Best score",
                value: bestScore !== null ? `${bestScore}%` : "—",
              },
              {
                label: "Average score",
                value: avgScore !== null ? `${avgScore}%` : "—",
              },
              {
                label: "Components studied",
                value: `${completedComponents}/${totalComponents}`,
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "7px 0",
                  borderBottom: "1px solid rgba(255,255,255,.05)",
                }}
              >
                <span
                  style={{ fontSize: "10px", color: "rgba(180,210,240,.5)" }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#ddeeff",
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Security card */}
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: showPasswordForm ? "14px" : 0,
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  letterSpacing: ".1em",
                  color: "rgba(91,155,213,.5)",
                }}
              >
                SECURITY
              </div>
              <button
                onClick={() => {
                  setShowPasswordForm(!showPasswordForm);
                  setPwError(null);
                  setPwSuccess(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                style={{
                  padding: "5px 12px",
                  fontFamily: "monospace",
                  fontSize: "10px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  border: "1px solid rgba(91,155,213,.3)",
                  background: "rgba(91,155,213,.08)",
                  color: "#5b9bd5",
                }}
              >
                {showPasswordForm ? "Cancel" : "Change password"}
              </button>
            </div>

            {showPasswordForm && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={inputStyle}
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                />
                {pwError && (
                  <div
                    style={{ fontSize: "10px", color: "rgba(255,120,120,.9)" }}
                  >
                    {pwError}
                  </div>
                )}
                {pwSuccess && (
                  <div style={{ fontSize: "10px", color: "#44cc88" }}>
                    ✓ Password updated successfully
                  </div>
                )}
                <button
                  onClick={handleChangePassword}
                  disabled={pwLoading}
                  style={{
                    padding: "9px",
                    background: "rgba(91,155,213,.12)",
                    border: "1px solid rgba(91,155,213,.3)",
                    borderRadius: "6px",
                    color: "#5b9bd5",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    cursor: pwLoading ? "not-allowed" : "pointer",
                    opacity: pwLoading ? 0.5 : 1,
                    marginTop: "4px",
                  }}
                >
                  {pwLoading ? "Updating..." : "Update password"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Quiz history */}
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
              QUIZ HISTORY
            </div>
            {loadingScores ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: "44px",
                      background: "rgba(255,255,255,.04)",
                      borderRadius: "6px",
                    }}
                  />
                ))}
              </div>
            ) : scores.length === 0 ? (
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(180,210,240,.4)",
                  padding: "12px 0",
                }}
              >
                No quiz attempts yet.{" "}
                <a
                  href="/quiz"
                  style={{ color: "#5b9bd5", textDecoration: "none" }}
                >
                  Take the quiz →
                </a>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 160px 80px",
                    gap: "12px",
                    padding: "4px 10px",
                    fontSize: "9px",
                    letterSpacing: ".08em",
                    color: "rgba(91,155,213,.4)",
                  }}
                >
                  <span>DATE</span>
                  <span>SCORE</span>
                  <span>RESULT</span>
                </div>
                {scores.map((s, i) => {
                  const pct = Math.round((s.score / s.total) * 100);
                  const color =
                    pct >= 80 ? "#44cc88" : pct >= 60 ? "#ffcc22" : "#ff6622";
                  return (
                    <div
                      key={s.id ?? i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 160px 80px",
                        gap: "12px",
                        padding: "10px",
                        background: "rgba(255,255,255,.02)",
                        borderRadius: "6px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: "rgba(180,210,240,.6)",
                        }}
                      >
                        {formatDate(s.created_at)}
                      </span>
                      <ScoreBar score={s.score} total={s.total} />
                      <span
                        style={{ fontSize: "12px", fontWeight: 700, color }}
                      >
                        {s.score}/{s.total}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

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
                marginBottom: "14px",
              }}
            >
              STUDY PROGRESS
            </div>
            {loadingProgress ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: "36px",
                      background: "rgba(255,255,255,.04)",
                      borderRadius: "6px",
                    }}
                  />
                ))}
              </div>
            ) : progress.length === 0 ? (
              <div
                style={{
                  fontSize: "11px",
                  color: "rgba(180,210,240,.4)",
                  padding: "12px 0",
                }}
              >
                No study activity yet.{" "}
                <a
                  href="/study"
                  style={{ color: "#5b9bd5", textDecoration: "none" }}
                >
                  Start studying →
                </a>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {progress.map((p, i) => {
                  const tabPct = Math.round((p.tabs_visited.length / 5) * 100);
                  const color = p.completed
                    ? "#44cc88"
                    : tabPct >= 60
                      ? "#ffcc22"
                      : "#5b9bd5";
                  return (
                    <div key={p.component ?? i}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "11px",
                            color: "#ddeeff",
                            textTransform: "capitalize",
                          }}
                        >
                          {p.component.replace(/-/g, " ")}
                        </span>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          {p.completed && (
                            <span
                              style={{
                                fontSize: "8px",
                                padding: "1px 6px",
                                borderRadius: "3px",
                                background: "rgba(68,204,136,.15)",
                                color: "#44cc88",
                              }}
                            >
                              COMPLETE
                            </span>
                          )}
                          <span style={{ fontSize: "10px", color }}>
                            {p.tabs_visited.length}/5 tabs
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          height: "4px",
                          background: "rgba(255,255,255,.06)",
                          borderRadius: "2px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${tabPct}%`,
                            background: color,
                            borderRadius: "2px",
                            transition: "width .4s",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
