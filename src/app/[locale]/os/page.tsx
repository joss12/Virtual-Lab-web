"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useLocale } from "next-intl";
import { api } from "@/lib/api";

interface OsCourse {
  id: string;
  slug: string;
  track: string;
  title_en: string;
  title_fr: string;
  description_en: string;
  description_fr: string;
  order_index: number;
}

interface OsProgress {
  lesson_slug: string;
  completed: boolean;
}

const TRACK_ICONS: Record<string, string> = {
  foundations: "🏗️",
  linux: "🐧",
  windows: "🪟",
  macos: "🍎",
  advanced: "🚀",
};

const TRACK_COLORS: Record<string, string> = {
  foundations: "#5b9bd5",
  linux: "#44cc88",
  windows: "#00adef",
  macos: "#a0a0a0",
  advanced: "#aa44ff",
};

const LESSON_COUNTS: Record<string, number> = {
  foundations: 7,
  linux: 8,
  windows: 7,
  macos: 7,
  advanced: 5,
};

export default function OsCoursesPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();
  const [courses, setCourses] = useState<OsCourse[]>([]);
  const [progress, setProgress] = useState<OsProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    Promise.all([api.get("/os/courses"), api.get("/os/progress")])
      .then(([coursesRes, progressRes]) => {
        setCourses(coursesRes.data);
        setProgress(progressRes.data);
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const getCompletedCount = (track: string) => {
    const trackLessons = progress.filter(
      (p) => p.completed && isTrackLesson(track, p.lesson_slug),
    );
    return trackLessons.length;
  };

  const isTrackLesson = (track: string, slug: string) => {
    const prefixes: Record<string, string[]> = {
      foundations: [
        "what-is-an-os",
        "the-kernel",
        "process-management",
        "memory-management",
        "file-systems",
        "io-and-drivers",
        "boot-process",
      ],
      linux: ["linux-"],
      windows: ["windows-"],
      macos: ["macos-"],
      advanced: [
        "virtual-memory",
        "hypervisors",
        "containers",
        "os-security",
        "performance-tuning",
      ],
    };
    const trackPrefixes = prefixes[track] ?? [];
    return trackPrefixes.some((p) => slug === p || slug.startsWith(p));
  };

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
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              style={{
                height: "120px",
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
        <div style={{ marginBottom: "40px" }}>
          <div
            style={{
              fontSize: "9px",
              letterSpacing: ".14em",
              color: "rgba(91,155,213,.6)",
              marginBottom: "6px",
            }}
          >
            {locale === "fr" ? "INFORMATIQUE" : "COMPUTER SCIENCE"}
          </div>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#ddeeff",
              margin: "0 0 8px",
            }}
          >
            {locale === "fr" ? "Systèmes d'exploitation" : "Operating Systems"}
          </h1>
          <p
            style={{
              fontSize: "13px",
              color: "rgba(180,210,240,.5)",
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            {locale === "fr"
              ? "Du noyau à la maîtrise complète — Linux, Windows, macOS et au-delà. Du débutant à l'expert."
              : "From the kernel to complete mastery — Linux, Windows, macOS and beyond. Beginner to expert."}
          </p>
        </div>

        {/* Stats banner */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          {[
            { label: locale === "fr" ? "Tracks" : "Tracks", value: "5" },
            { label: locale === "fr" ? "Leçons" : "Lessons", value: "34" },
            {
              label: locale === "fr" ? "Langues" : "Languages",
              value: "EN + FR",
            },
            {
              label: locale === "fr" ? "Niveau" : "Level",
              value:
                locale === "fr" ? "Débutant → Expert" : "Beginner → Expert",
            },
          ].map(({ label, value }) => (
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
              <div
                style={{ fontSize: "16px", fontWeight: 700, color: "#5b9bd5" }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Courses */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {courses.map((course, i) => {
            const title = locale === "fr" ? course.title_fr : course.title_en;
            const description =
              locale === "fr" ? course.description_fr : course.description_en;
            const icon = TRACK_ICONS[course.track] ?? "📚";
            const color = TRACK_COLORS[course.track] ?? "#5b9bd5";
            const total = LESSON_COUNTS[course.track] ?? 0;
            const completed = getCompletedCount(course.track);
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            const isLocked =
              i > 0 &&
              course.track !== "foundations" &&
              getCompletedCount("foundations") < 7;

            return (
              <div
                key={course.slug}
                style={{
                  background: "rgba(255,255,255,.03)",
                  border: `1px solid ${isLocked ? "rgba(255,255,255,.06)" : `${color}33`}`,
                  borderRadius: "12px",
                  padding: "24px",
                  opacity: isLocked ? 0.5 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "10px",
                      background: `${color}22`,
                      border: `1px solid ${color}44`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginBottom: "6px",
                      }}
                    >
                      <h2
                        style={{
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#ddeeff",
                          margin: 0,
                        }}
                      >
                        {title}
                      </h2>
                      {isLocked && (
                        <span
                          style={{
                            fontSize: "9px",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            background: "rgba(255,255,255,.08)",
                            color: "rgba(180,210,240,.4)",
                          }}
                        >
                          {locale === "fr"
                            ? "🔒 COMPLÉTEZ LES FONDEMENTS"
                            : "🔒 COMPLETE FOUNDATIONS FIRST"}
                        </span>
                      )}
                      {pct === 100 && (
                        <span
                          style={{
                            fontSize: "9px",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            background: "rgba(68,204,136,.15)",
                            color: "#44cc88",
                          }}
                        >
                          ✓ {locale === "fr" ? "TERMINÉ" : "COMPLETE"}
                        </span>
                      )}
                    </div>

                    <p
                      style={{
                        fontSize: "12px",
                        color: "rgba(180,210,240,.5)",
                        margin: "0 0 14px",
                        lineHeight: 1.6,
                      }}
                    >
                      {description}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
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
                      <span
                        style={{
                          fontSize: "10px",
                          color: "rgba(180,210,240,.4)",
                          flexShrink: 0,
                        }}
                      >
                        {completed}/{total}{" "}
                        {locale === "fr" ? "leçons" : "lessons"}
                      </span>
                      {!isLocked && (
                        <Link
                          href={`/${locale}/os/${course.slug}`}
                          style={{
                            padding: "6px 16px",
                            background: `${color}22`,
                            border: `1px solid ${color}44`,
                            borderRadius: "6px",
                            color,
                            fontSize: "11px",
                            textDecoration: "none",
                            flexShrink: 0,
                          }}
                        >
                          {pct === 0
                            ? locale === "fr"
                              ? "Commencer →"
                              : "Start →"
                            : pct === 100
                              ? locale === "fr"
                                ? "Revoir →"
                                : "Review →"
                              : locale === "fr"
                                ? "Continuer →"
                                : "Continue →"}
                        </Link>
                      )}
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
