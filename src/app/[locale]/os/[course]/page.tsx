"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useLocale } from "next-intl";
import { api } from "@/lib/api";

interface OsLesson {
  id: string;
  slug: string;
  title_en: string;
  title_fr: string;
  order_index: number;
  has_terminal: boolean;
  has_quiz: boolean;
}

interface OsProgress {
  lesson_slug: string;
  completed: boolean;
  quiz_score: number | null;
  quiz_total: number | null;
}

const COURSE_COLORS: Record<string, string> = {
  foundations: "#5b9bd5",
  "linux-mastery": "#44cc88",
  "windows-mastery": "#00adef",
  "macos-mastery": "#a0a0a0",
  "advanced-os": "#aa44ff",
};

const COURSE_ICONS: Record<string, string> = {
  foundations: "🏗️",
  "linux-mastery": "🐧",
  "windows-mastery": "🪟",
  "macos-mastery": "🍎",
  "advanced-os": "🚀",
};

export default function CoursePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const courseSlug = params.course as string;

  const [lessons, setLessons] = useState<OsLesson[]>([]);
  const [progress, setProgress] = useState<OsProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    Promise.all([
      api.get(`/os/courses/${courseSlug}/lessons`),
      api.get("/os/progress"),
    ])
      .then(([lessonsRes, progressRes]) => {
        setLessons(lessonsRes.data);
        setProgress(progressRes.data);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, courseSlug]);

  const getProgress = (slug: string) =>
    progress.find((p) => p.lesson_slug === slug);

  const isUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevLesson = lessons[index - 1];
    const prevProgress = getProgress(prevLesson.slug);
    return prevProgress?.completed === true;
  };

  const completedCount = lessons.filter(
    (l) => getProgress(l.slug)?.completed,
  ).length;
  const pct =
    lessons.length > 0
      ? Math.round((completedCount / lessons.length) * 100)
      : 0;
  const color = COURSE_COLORS[courseSlug] ?? "#5b9bd5";
  const icon = COURSE_ICONS[courseSlug] ?? "📚";

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
            gap: "12px",
            maxWidth: "700px",
          }}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                height: "72px",
                background: "rgba(255,255,255,.04)",
                borderRadius: "10px",
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
      <div style={{ maxWidth: "700px" }}>
        {/* Back */}
        <Link
          href={`/${locale}/os`}
          style={{
            fontSize: "11px",
            color: "rgba(180,210,240,.4)",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: "24px",
          }}
        >
          ← {locale === "fr" ? "Tous les cours" : "All courses"}
        </Link>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              background: `${color}22`,
              border: `1px solid ${color}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "26px",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "9px",
                letterSpacing: ".12em",
                color: "rgba(91,155,213,.6)",
                marginBottom: "4px",
              }}
            >
              {locale === "fr" ? "COURS" : "COURSE"}
            </div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#ddeeff",
                margin: "0 0 8px",
              }}
            >
              {courseSlug
                .replace(/-/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  flex: 1,
                  height: "4px",
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
              <span style={{ fontSize: "10px", color: "rgba(180,210,240,.4)" }}>
                {completedCount}/{lessons.length}{" "}
                {locale === "fr" ? "terminées" : "completed"}
              </span>
            </div>
          </div>
        </div>

        {/* Lessons list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {lessons.map((lesson, i) => {
            const prog = getProgress(lesson.slug);
            const unlocked = isUnlocked(i);
            const completed = prog?.completed === true;
            const title = locale === "fr" ? lesson.title_fr : lesson.title_en;
            const score = prog?.quiz_score;
            const total = prog?.quiz_total;

            return (
              <div
                key={lesson.slug}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "16px 20px",
                  background: completed
                    ? `${color}11`
                    : "rgba(255,255,255,.025)",
                  border: `1px solid ${completed ? `${color}33` : "rgba(255,255,255,.06)"}`,
                  borderRadius: "10px",
                  opacity: unlocked ? 1 : 0.4,
                }}
              >
                {/* Status icon */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: completed
                      ? `${color}33`
                      : "rgba(255,255,255,.06)",
                    border: `1px solid ${completed ? color : "rgba(255,255,255,.1)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    flexShrink: 0,
                  }}
                >
                  {completed ? "✓" : unlocked ? `${i + 1}` : "🔒"}
                </div>

                {/* Title */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      color: unlocked ? "#ddeeff" : "rgba(180,210,240,.4)",
                      fontWeight: completed ? 600 : 400,
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{ display: "flex", gap: "8px", marginTop: "3px" }}
                  >
                    {lesson.has_terminal && (
                      <span
                        style={{
                          fontSize: "9px",
                          color: "rgba(68,204,136,.6)",
                        }}
                      >
                        ⌨️ {locale === "fr" ? "Terminal" : "Terminal"}
                      </span>
                    )}
                    {lesson.has_quiz && (
                      <span
                        style={{
                          fontSize: "9px",
                          color: "rgba(91,155,213,.6)",
                        }}
                      >
                        📝 {locale === "fr" ? "Quiz" : "Quiz"}
                      </span>
                    )}
                    {score !== null && score !== undefined && total && (
                      <span
                        style={{
                          fontSize: "9px",
                          color: "rgba(180,210,240,.4)",
                        }}
                      >
                        {score}/{total} ({Math.round((score / total) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>

                {/* Action */}
                {unlocked && (
                  <Link
                    href={`/${locale}/os/${courseSlug}/${lesson.slug}`}
                    style={{
                      padding: "6px 14px",
                      background: completed
                        ? "rgba(255,255,255,.05)"
                        : `${color}22`,
                      border: `1px solid ${completed ? "rgba(255,255,255,.1)" : `${color}44`}`,
                      borderRadius: "6px",
                      color: completed ? "rgba(180,210,240,.5)" : color,
                      fontSize: "10px",
                      textDecoration: "none",
                      flexShrink: 0,
                    }}
                  >
                    {completed
                      ? locale === "fr"
                        ? "Revoir"
                        : "Review"
                      : locale === "fr"
                        ? "Commencer →"
                        : "Start →"}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
