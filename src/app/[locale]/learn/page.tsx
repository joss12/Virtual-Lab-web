"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useLocale } from "next-intl";
import { api } from "@/lib/api";

interface LangProgress {
  language: string;
  completed: number;
  total: number;
}

const LANGUAGES = [
  {
    id: "python",
    name: "Python",
    icon: "🐍",
    color: "#4b9cd3",
    description:
      "The most beginner-friendly language. Data science, automation, backend, AI — Python does everything.",
    descriptionFr:
      "Le langage le plus accessible aux débutants. Data science, automatisation, backend, IA — Python fait tout.",
    tracks: 3,
    lessons: 19,
    projects: 6,
    level: "Beginner → Advanced",
    levelFr: "Débutant → Avancé",
  },
  {
    id: "javascript",
    name: "JavaScript",
    icon: "⚡",
    color: "#f7df1e",
    description:
      "The language of the web. Runs in every browser, powers frontend and backend with Node.js.",
    descriptionFr:
      "Le langage du web. Tourne dans chaque navigateur, alimente le frontend et le backend avec Node.js.",
    tracks: 3,
    lessons: 19,
    projects: 6,
    level: "Beginner → Advanced",
    levelFr: "Débutant → Avancé",
  },

];

export default function LearnPage() {
  const { isAuthenticated } = useAuthStore();

  const router = useRouter();
  const locale = useLocale();

  const [progress, setProgress] = useState<LangProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    setLoading(false);

    api
      .get("/learn/progress/summary")
      .then((res) => setProgress(res.data))
      .catch(() => {});
  }, [isAuthenticated, locale, router]);

  const getLangProgress = (id: string) =>
    progress.find((p) => p.language === id);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0d1420",
          padding: "32px 24px",
          fontFamily: "monospace",
          margin: "-32px -24px",
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
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                height: "160px",
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
        margin: "-32px -24px",
      }}
    >
      <div style={{ maxWidth: "900px" }}>
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <div
            style={{
              fontSize: "9px",
              letterSpacing: ".14em",
              color: "rgba(180,210,240,.4)",
              marginBottom: "6px",
            }}
          >
            {locale === "fr"
              ? "LANGAGES DE PROGRAMMATION"
              : "PROGRAMMING LANGUAGES"}
          </div>

          <h1
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#ddeeff",
              margin: "0 0 8px",
            }}
          >
            {locale === "fr" ? "Apprendre à coder" : "Learn to Code"}
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
              ? "Leçons interactives avec éditeur de code intégré. Écrivez et exécutez du vrai code directement dans le navigateur."
              : "Interactive lessons with integrated code editor. Write and run real code directly in the browser."}
          </p>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          {[
            {
              id: "languages-count",
              label: locale === "fr" ? "Langages" : "Languages",
              value: "3",
            },
            {
              id: "lessons",
              label: locale === "fr" ? "Leçons" : "Lessons",
              value: "47",
            },
            {
              id: "projects",
              label:
                locale === "fr"
                  ? "Projets guidés"
                  : "Guided Projects",
              value: "16",
            },
            {
              id: "supported-languages",
              label:
                locale === "fr"
                  ? "Langues supportées"
                  : "Supported Languages",
              value: "EN + FR",
            },
          ].map(({ id, label, value }) => (
            <div
              key={id}
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
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "#ddeeff",
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Language cards */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          {LANGUAGES.map((lang) => {
            const prog = getLangProgress(lang.id);

            const completed = prog?.completed ?? 0;

            const total =
              prog?.total ?? lang.lessons + lang.projects;

            const pct =
              total > 0
                ? Math.round((completed / total) * 100)
                : 0;

            const color = lang.color;

            return (
              <div
                key={lang.id}
                style={{
                  background: "rgba(255,255,255,.03)",
                  border: `1px solid ${color}33`,
                  borderRadius: "12px",
                  padding: "28px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "20px",
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: "56px",
                      height: "56px",
                      borderRadius: "12px",
                      background: `${color}18`,
                      border: `1px solid ${color}33`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "26px",
                      flexShrink: 0,
                    }}
                  >
                    {lang.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    {/* Title */}
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
                          fontSize: "18px",
                          fontWeight: 700,
                          color: "#ddeeff",
                          margin: 0,
                        }}
                      >
                        {lang.name}
                      </h2>

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
                          ✓{" "}
                          {locale === "fr"
                            ? "TERMINÉ"
                            : "COMPLETE"}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p
                      style={{
                        fontSize: "12px",
                        color: "rgba(180,210,240,.5)",
                        margin: "0 0 16px",
                        lineHeight: 1.6,
                      }}
                    >
                      {locale === "fr"
                        ? lang.descriptionFr
                        : lang.description}
                    </p>

                    {/* Pills */}
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                        marginBottom: "16px",
                      }}
                    >
                      {[
                        {
                          id: `${lang.id}-tracks`,
                          label: `${lang.tracks} tracks`,
                        },
                        {
                          id: `${lang.id}-lessons`,
                          label:
                            locale === "fr"
                              ? `${lang.lessons} leçons`
                              : `${lang.lessons} lessons`,
                        },
                        {
                          id: `${lang.id}-projects`,
                          label:
                            locale === "fr"
                              ? `${lang.projects} projets guidés`
                              : `${lang.projects} guided projects`,
                        },
                        {
                          id: `${lang.id}-level`,
                          label:
                            locale === "fr"
                              ? lang.levelFr
                              : lang.level,
                        },
                      ].map(({ id, label }) => (
                        <span
                          key={id}
                          style={{
                            fontSize: "10px",
                            padding: "3px 10px",
                            borderRadius: "4px",
                            background: `${color}10`,
                            border: `1px solid ${color}25`,
                            color: `${color}cc`,
                          }}
                        >
                          {label}
                        </span>
                      ))}
                    </div>

                    {/* Progress */}
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
                        {locale === "fr"
                          ? "terminées"
                          : "completed"}
                      </span>

                      <Link
                        href={`/${locale}/learn/${lang.id}`}
                        style={{
                          padding: "7px 18px",
                          background: `${color}18`,
                          border: `1px solid ${color}44`,
                          borderRadius: "6px",
                          color,
                          fontSize: "11px",
                          textDecoration: "none",
                          flexShrink: 0,
                          fontWeight: 600,
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
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "40px",
            padding: "16px 20px",
            background: "rgba(255,255,255,.02)",
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: "10px",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              color: "rgba(180,210,240,.35)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {locale === "fr"
              ? "💡 Le code s'exécute directement dans votre navigateur — Python via Pyodide, JavaScript nativement, SQL via SQLite. Aucune installation requise."
              : "💡 Code runs directly in your browser — Python via Pyodide, JavaScript natively, SQL via SQLite. No installation required."}
          </p>
        </div>
      </div>
    </div>
  );
}
