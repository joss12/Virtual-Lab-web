"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useLocale } from "next-intl";
import { api } from "@/lib/api";

interface Progress {
  lesson_slug: string;
  completed: boolean;
}

const TRACK_CONFIG: Record<string, Record<string, {
  titleEn: string;
  titleFr: string;
  color: string;
  icon: string;
  lessons: { id: string; titleEn: string; titleFr: string }[];
}>> = {
  python: {
    fundamentals: {
      titleEn: "Python Fundamentals",
      titleFr: "Fondamentaux Python",
      color: "#4b9cd3",
      icon: "📚",
      lessons: [
        { id: "variables-and-types",  titleEn: "Variables & Types",    titleFr: "Variables et types" },
        { id: "control-flow",         titleEn: "Control Flow",          titleFr: "Structures de contrôle" },
        { id: "functions",            titleEn: "Functions",             titleFr: "Fonctions" },
        { id: "lists-and-loops",      titleEn: "Lists & Loops",         titleFr: "Listes et boucles" },
        { id: "dictionaries",         titleEn: "Dictionaries",          titleFr: "Dictionnaires" },
        { id: "file-io",              titleEn: "File I/O",              titleFr: "Fichiers I/O" },
        { id: "classes-and-oop",      titleEn: "Classes & OOP",         titleFr: "Classes et POO" },
      ],
    },
    algorithms: {
      titleEn: "Python Algorithms",
      titleFr: "Algorithmes Python",
      color: "#4b9cd3",
      icon: "⚙️",
      lessons: [
        { id: "big-o-notation",       titleEn: "Big O Notation",        titleFr: "Notation Big O" },
        { id: "sorting-algorithms",   titleEn: "Sorting Algorithms",    titleFr: "Algorithmes de tri" },
        { id: "searching-algorithms", titleEn: "Searching Algorithms",  titleFr: "Algorithmes de recherche" },
        { id: "recursion",            titleEn: "Recursion",             titleFr: "Récursion" },
        { id: "data-structures",      titleEn: "Data Structures",       titleFr: "Structures de données" },
        { id: "problem-solving",      titleEn: "Problem Solving",       titleFr: "Résolution de problèmes" },
      ],
    },
  },
  javascript: {
    fundamentals: {
      titleEn: "JavaScript Fundamentals",
      titleFr: "Fondamentaux JavaScript",
      color: "#f7df1e",
      icon: "📚",
      lessons: [
        { id: "variables-and-types",  titleEn: "Variables & Types",    titleFr: "Variables et types" },
        { id: "control-flow",         titleEn: "Control Flow",          titleFr: "Structures de contrôle" },
        { id: "functions",            titleEn: "Functions",             titleFr: "Fonctions" },
        { id: "arrays-and-loops",     titleEn: "Arrays & Loops",        titleFr: "Tableaux et boucles" },
        { id: "objects",              titleEn: "Objects",               titleFr: "Objets" },
        { id: "dom-basics",           titleEn: "DOM Basics",            titleFr: "Bases du DOM" },
        { id: "async-and-promises",   titleEn: "Async & Promises",      titleFr: "Async et Promises" },
      ],
    },
    algorithms: {
      titleEn: "JavaScript Algorithms",
      titleFr: "Algorithmes JavaScript",
      color: "#f7df1e",
      icon: "⚙️",
      lessons: [
        { id: "big-o-notation",       titleEn: "Big O Notation",        titleFr: "Notation Big O" },
        { id: "sorting-algorithms",   titleEn: "Sorting Algorithms",    titleFr: "Algorithmes de tri" },
        { id: "searching-algorithms", titleEn: "Searching Algorithms",  titleFr: "Algorithmes de recherche" },
        { id: "recursion",            titleEn: "Recursion",             titleFr: "Récursion" },
        { id: "data-structures",      titleEn: "Data Structures",       titleFr: "Structures de données" },
        { id: "problem-solving",      titleEn: "Problem Solving",       titleFr: "Résolution de problèmes" },
      ],
    },
  },

};

export default function TrackPage({
  params,
}: {
  params: Promise<{ language: string; track: string }>;
}) {
  const { language, track } = use(params);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();
  const [progress, setProgress]   = useState<Progress[]>([]);
  const [loading, setLoading]     = useState(true);
  const [fetchKey, setFetchKey]   = useState(0);

  const config = TRACK_CONFIG[language]?.[track];
  const color  = config?.color ?? "#ddeeff";

  // Re-fetch whenever the window regains focus
  // (user finishes a lesson and comes back)
  useEffect(() => {
    const handleFocus = () => setFetchKey((k) => k + 1);
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }
    if (!config) {
      router.push(`/${locale}/learn/${language}`);
      return;
    }

    // ← Reset loading BEFORE the API call so we never render stale progress
    setLoading(true);

    // Safety net: never stay stuck longer than 5 seconds
    const timeout = setTimeout(() => setLoading(false), 5000);

    api
      .get(`/learn/${language}/progress`)
      .then((res) => setProgress(res.data ?? []))
      .catch(() => setProgress([]))
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);   // ← Only set false AFTER data arrives
      });

    return () => clearTimeout(timeout);
  }, [isAuthenticated, language, track, locale, fetchKey]);

  const isLessonDone = (id: string) =>
    progress.some((p) => {
      if (!p.completed) return false;
      // Handle both "async-and-promises" and "javascript/fundamentals/async-and-promises"
      const slug = p.lesson_slug.includes("/")
        ? p.lesson_slug.split("/").pop()!
        : p.lesson_slug;
      return slug === id || p.lesson_slug === id;
    });

  if (loading || !config) {
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
            gap: "10px",
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

  const completedCount = config.lessons.filter((l) => isLessonDone(l.id)).length;
  const pct = Math.round((completedCount / config.lessons.length) * 100);

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
      <div style={{ maxWidth: "700px" }}>

        {/* Back */}
        <Link
          href={`/${locale}/learn/${language}`}
          style={{
            fontSize: "11px",
            color: "rgba(180,210,240,.4)",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: "24px",
          }}
        >
          ← {locale === "fr" ? "Retour" : "Back"}
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
              width: "52px",
              height: "52px",
              borderRadius: "12px",
              background: `${color}18`,
              border: `1px solid ${color}33`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              flexShrink: 0,
            }}
          >
            {config.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "9px",
                letterSpacing: ".12em",
                color: `${color}88`,
                marginBottom: "4px",
              }}
            >
              {language.toUpperCase()}
            </div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#ddeeff",
                margin: "0 0 8px",
              }}
            >
              {locale === "fr" ? config.titleFr : config.titleEn}
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
                {completedCount}/{config.lessons.length}{" "}
                {locale === "fr" ? "terminées" : "completed"}
              </span>
            </div>
          </div>
        </div>

        {/* Lessons list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {config.lessons.map((lesson, i) => {
            const done   = isLessonDone(lesson.id);
            const prevDone = i === 0 || isLessonDone(config.lessons[i - 1].id);
            const isNext = !done && prevDone;

            return (
              <Link
                key={lesson.id}
                href={`/${locale}/learn/${language}/${track}/${lesson.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "16px 20px",
                    background: done
                      ? `${color}0d`
                      : isNext
                      ? "rgba(255,255,255,.05)"
                      : "rgba(255,255,255,.02)",
                    border: `1px solid ${
                      done
                        ? `${color}44`
                        : isNext
                        ? "rgba(255,255,255,.1)"
                        : "rgba(255,255,255,.05)"
                    }`,
                    borderRadius: "10px",
                    cursor: "pointer",
                    transition: "border-color .2s",
                  }}
                >
                  {/* Step indicator */}
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: done
                        ? `${color}33`
                        : "rgba(255,255,255,.05)",
                      border: `1px solid ${
                        done ? color : "rgba(255,255,255,.1)"
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      color: done ? color : "rgba(180,210,240,.3)",
                      flexShrink: 0,
                      fontWeight: 700,
                    }}
                  >
                    {done ? "✓" : i + 1}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: done
                          ? color
                          : isNext
                          ? "#ddeeff"
                          : "rgba(180,210,240,.4)",
                        marginBottom: "2px",
                      }}
                    >
                      {locale === "fr" ? lesson.titleFr : lesson.titleEn}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "rgba(180,210,240,.3)",
                      }}
                    >
                      {done
                        ? locale === "fr"
                          ? "Terminé · Cliquer pour revoir"
                          : "Completed · Click to review"
                        : isNext
                        ? locale === "fr"
                          ? "Suivant · Commencer →"
                          : "Up next · Start →"
                        : locale === "fr"
                        ? "Non commencé"
                        : "Not started"}
                    </div>
                  </div>

                  {isNext && (
                    <span style={{ fontSize: "18px", color }}>→</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
