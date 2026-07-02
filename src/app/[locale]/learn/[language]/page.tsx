"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useLocale } from "next-intl";
import { api } from "@/lib/api";

interface LangProgress {
  lesson_slug: string;
  completed: boolean;
}

type Lesson = {
  id: string;
  titleEn: string;
  titleFr: string;
};

type Track = {
  id: string;
  titleEn: string;
  titleFr: string;
  icon: string;
  descriptionEn: string;
  descriptionFr: string;
  type: "lessons" | "projects";
  lessons: Lesson[];
};

type LanguageConfig = {
  name: string;
  icon: string;
  color: string;
  descriptionEn: string;
  descriptionFr: string;
  tracks: Track[];
};

const LANGUAGE_CONFIG: Record<string, LanguageConfig> = {
  python: {
    name: "Python",
    icon: "🐍",
    color: "#4b9cd3",
    descriptionEn:
      "The most beginner-friendly language. Data science, automation, backend, AI — Python does everything.",
    descriptionFr:
      "Le langage le plus accessible. Data science, automatisation, backend, IA — Python fait tout.",
    tracks: [
      {
        id: "fundamentals",
        titleEn: "Fundamentals",
        titleFr: "Fondamentaux",
        icon: "📚",
        descriptionEn:
          "Variables, control flow, functions, lists, dictionaries, classes — Python from zero.",
        descriptionFr:
          "Variables, structures de contrôle, fonctions, listes, dictionnaires, classes — Python de zéro.",
        type: "lessons",
        lessons: [
          { id: "variables-and-types", titleEn: "Variables & Types", titleFr: "Variables et types" },
          { id: "control-flow", titleEn: "Control Flow", titleFr: "Structures de contrôle" },
          { id: "functions", titleEn: "Functions", titleFr: "Fonctions" },
          { id: "lists-and-loops", titleEn: "Lists & Loops", titleFr: "Listes et boucles" },
          { id: "dictionaries", titleEn: "Dictionaries", titleFr: "Dictionnaires" },
          { id: "file-io", titleEn: "File I/O", titleFr: "Fichiers I/O" },
          { id: "classes-and-oop", titleEn: "Classes & OOP", titleFr: "Classes et POO" },
        ],
      },
      {
        id: "algorithms",
        titleEn: "Algorithms",
        titleFr: "Algorithmes",
        icon: "⚙️",
        descriptionEn:
          "Sorting, searching, recursion, Big O notation, data structures, problem solving.",
        descriptionFr:
          "Tri, recherche, récursion, notation Big O, structures de données, résolution de problèmes.",
        type: "lessons",
        lessons: [
          { id: "big-o-notation", titleEn: "Big O Notation", titleFr: "Notation Big O" },
          { id: "sorting-algorithms", titleEn: "Sorting Algorithms", titleFr: "Algorithmes de tri" },
          { id: "searching-algorithms", titleEn: "Searching Algorithms", titleFr: "Algorithmes de recherche" },
          { id: "recursion", titleEn: "Recursion", titleFr: "Récursion" },
          { id: "data-structures", titleEn: "Data Structures", titleFr: "Structures de données" },
          { id: "problem-solving", titleEn: "Problem Solving", titleFr: "Résolution de problèmes" },
        ],
      },
      {
        id: "projects",
        titleEn: "Guided Projects",
        titleFr: "Projets guidés",
        icon: "🚀",
        descriptionEn:
          "Build 6 real projects step by step. Follow along like a recipe — beginner-friendly.",
        descriptionFr:
          "Construisez 6 vrais projets étape par étape. Suivez comme une recette — accessible aux débutants.",
        type: "projects",
        lessons: [
          { id: "calculator", titleEn: "Calculator", titleFr: "Calculatrice" },
          { id: "grade-manager", titleEn: "Grade Manager", titleFr: "Gestionnaire de notes" },
          { id: "password-generator", titleEn: "Password Generator", titleFr: "Générateur de mots de passe" },
          { id: "contact-book", titleEn: "Contact Book", titleFr: "Carnet de contacts" },
          { id: "bank-account", titleEn: "Bank Account Simulator", titleFr: "Simulateur de compte bancaire" },
          { id: "quiz-game", titleEn: "Quiz Game Engine", titleFr: "Moteur de quiz" },
        ],
      },
    ],
  },

  javascript: {
    name: "JavaScript",
    icon: "⚡",
    color: "#f7df1e",
    descriptionEn:
      "The language of the web. Runs in every browser, powers frontend and backend with Node.js.",
    descriptionFr:
      "Le langage du web. Tourne dans chaque navigateur, alimente le frontend et le backend.",
    tracks: [
      {
        id: "fundamentals",
        titleEn: "Fundamentals",
        titleFr: "Fondamentaux",
        icon: "📚",
        descriptionEn:
          "Variables, control flow, functions, arrays, objects, DOM, async — JS from zero.",
        descriptionFr:
          "Variables, structures de contrôle, fonctions, tableaux, objets, DOM, async — JS de zéro.",
        type: "lessons",
        lessons: [
          { id: "variables-and-types", titleEn: "Variables & Types", titleFr: "Variables et types" },
          { id: "control-flow", titleEn: "Control Flow", titleFr: "Structures de contrôle" },
          { id: "functions", titleEn: "Functions", titleFr: "Fonctions" },
          { id: "arrays-and-loops", titleEn: "Arrays & Loops", titleFr: "Tableaux et boucles" },
          { id: "objects", titleEn: "Objects", titleFr: "Objets" },
          { id: "dom-basics", titleEn: "DOM Basics", titleFr: "Bases du DOM" },
          { id: "async-and-promises", titleEn: "Async & Promises", titleFr: "Async et Promises" },
        ],
      },
      {
        id: "algorithms",
        titleEn: "Algorithms",
        titleFr: "Algorithmes",
        icon: "⚙️",
        descriptionEn:
          "Sorting, searching, recursion, Big O notation, data structures, problem solving.",
        descriptionFr:
          "Tri, recherche, récursion, notation Big O, structures de données, résolution de problèmes.",
        type: "lessons",
        lessons: [
          { id: "big-o-notation", titleEn: "Big O Notation", titleFr: "Notation Big O" },
          { id: "sorting-algorithms", titleEn: "Sorting Algorithms", titleFr: "Algorithmes de tri" },
          { id: "searching-algorithms", titleEn: "Searching Algorithms", titleFr: "Algorithmes de recherche" },
          { id: "recursion", titleEn: "Recursion", titleFr: "Récursion" },
          { id: "data-structures", titleEn: "Data Structures", titleFr: "Structures de données" },
          { id: "problem-solving", titleEn: "Problem Solving", titleFr: "Résolution de problèmes" },
        ],
      },
      {
        id: "projects",
        titleEn: "Guided Projects",
        titleFr: "Projets guidés",
        icon: "🚀",
        descriptionEn:
          "Build 6 real projects step by step. Follow along like a recipe — beginner-friendly.",
        descriptionFr:
          "Construisez 6 vrais projets étape par étape. Suivez comme une recette — accessible aux débutants.",
        type: "projects",
        lessons: [
          { id: "unit-converter", titleEn: "Unit Converter", titleFr: "Convertisseur d'unités" },
          { id: "inventory-tracker", titleEn: "Inventory Tracker", titleFr: "Suivi d'inventaire" },
          { id: "todo-list", titleEn: "Todo List", titleFr: "Liste de tâches" },
          { id: "word-frequency", titleEn: "Word Frequency Counter", titleFr: "Compteur de fréquence de mots" },
          { id: "json-database", titleEn: "Mini JSON Database", titleFr: "Mini base JSON" },
          { id: "expense-tracker", titleEn: "Expense Tracker", titleFr: "Suivi des dépenses" },
        ],
      },
    ],
  },

  // sql: {
  //   name: "SQL",
  //   icon: "🗃️",
  //   color: "#44cc88",
  //   descriptionEn:
  //     "The language every developer needs. Query and manipulate databases used by every company on earth.",
  //   descriptionFr:
  //     "Le langage dont chaque développeur a besoin. Interrogez et manipulez des bases de données.",
  //   tracks: [
  //     {
  //       id: "topics",
  //       titleEn: "Core SQL",
  //       titleFr: "SQL essentiel",
  //       icon: "📚",
  //       descriptionEn:
  //         "SELECT, filtering, sorting, joins, aggregations — everything you need to query any database.",
  //       descriptionFr:
  //         "SELECT, filtrage, tri, jointures, agrégations — tout ce qu'il faut pour interroger n'importe quelle base.",
  //       type: "lessons",
  //       lessons: [
  //         { id: "select-and-where", titleEn: "SELECT & WHERE", titleFr: "SELECT et WHERE" },
  //         { id: "insert-update-delete", titleEn: "INSERT, UPDATE, DELETE", titleFr: "INSERT, UPDATE, DELETE" },
  //         { id: "order-and-limit", titleEn: "ORDER BY & LIMIT", titleFr: "ORDER BY et LIMIT" },
  //         { id: "joins", titleEn: "JOINs", titleFr: "Jointures" },
  //         { id: "aggregations", titleEn: "GROUP BY & Aggregations", titleFr: "GROUP BY et Agrégations" },
  //       ],
  //     },
  //     {
  //       id: "projects",
  //       titleEn: "Guided Projects",
  //       titleFr: "Projets guidés",
  //       icon: "🚀",
  //       descriptionEn:
  //         "Build 4 real database schemas and write queries against them step by step.",
  //       descriptionFr:
  //         "Construisez 4 vrais schémas de base de données et écrivez des requêtes étape par étape.",
  //       type: "projects",
  //       lessons: [
  //         { id: "school-database", titleEn: "School Database", titleFr: "Base de données scolaire" },
  //         { id: "library-system", titleEn: "Library System", titleFr: "Système de bibliothèque" },
  //         { id: "ecommerce-queries", titleEn: "E-Commerce Queries", titleFr: "Requêtes e-commerce" },
  //         { id: "employee-analytics", titleEn: "Employee Analytics", titleFr: "Analytique employés" },
  //       ],
  //     },
  //   ],
  // },
};

export default function LanguagePage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = use(params);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();

  const [progress, setProgress] = useState<LangProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchKey, setFetchKey] = useState(0);

  const config = LANGUAGE_CONFIG[language];
  const color = config?.color ?? "#ddeeff";

  useEffect(() => {
    const handleFocus = () => setFetchKey((key) => key + 1);

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }

    if (!config) {
      router.push(`/${locale}/learn`);
      return;
    }

    setLoading(true);

    const timeout = window.setTimeout(() => {
      setLoading(false);
    }, 5000);

    api
      .get(`/learn/${language}/progress`)
      .then((res) => {
        setProgress(res.data ?? []);
      })
      .catch(() => {
        setProgress([]);
      })
      .finally(() => {
        window.clearTimeout(timeout);
        setLoading(false);
      });

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isAuthenticated, language, locale, router, config, fetchKey]);

  const getCompletedCount = (lessonIds: string[]) => {
    return progress.filter(
      (item) => item.completed && lessonIds.includes(item.lesson_slug),
    ).length;
  };

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
            gap: "12px",
            maxWidth: "900px",
          }}
        >
          {[1, 2, 3].map((item) => (
            <div
              key={item}
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
        margin: "-32px -24px",
      }}
    >
      <div style={{ maxWidth: "900px" }}>
        <Link
          href={`/${locale}/learn`}
          style={{
            fontSize: "11px",
            color: "rgba(180,210,240,.4)",
            textDecoration: "none",
            display: "inline-block",
            marginBottom: "32px",
          }}
        >
          ← {locale === "fr" ? "Tous les langages" : "All languages"}
        </Link>

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
              background: `${color}18`,
              border: `1px solid ${color}33`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              flexShrink: 0,
            }}
          >
            {config.icon}
          </div>

          <div>
            <div
              style={{
                fontSize: "9px",
                letterSpacing: ".14em",
                color: `${color}88`,
                marginBottom: "4px",
              }}
            >
              {locale === "fr"
                ? "LANGAGES DE PROGRAMMATION"
                : "PROGRAMMING LANGUAGES"}
            </div>

            <h1
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#ddeeff",
                margin: "0 0 4px",
              }}
            >
              {config.name}
            </h1>

            <p
              style={{
                fontSize: "12px",
                color: "rgba(180,210,240,.5)",
                margin: 0,
              }}
            >
              {locale === "fr" ? config.descriptionFr : config.descriptionEn}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {config.tracks.map((track, trackIndex) => {
            const lessonIds = track.lessons.map((lesson) => lesson.id);
            const completed = getCompletedCount(lessonIds);
            const total = track.lessons.length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

            const previousTrack = config.tracks[trackIndex - 1];

            const isLocked =
              trackIndex > 0 &&
              previousTrack &&
              getCompletedCount(previousTrack.lessons.map((lesson) => lesson.id)) <
                previousTrack.lessons.length;

            const isProject = track.type === "projects";

            const href = isProject
              ? `/${locale}/learn/${language}/projects`
              : `/${locale}/learn/${language}/${track.id}`;

            return (
              <div
                key={track.id}
                style={{
                  background: "rgba(255,255,255,.03)",
                  border: `1px solid ${
                    isLocked ? "rgba(255,255,255,.06)" : `${color}33`
                  }`,
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
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: `${color}15`,
                      border: `1px solid ${color}30`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "20px",
                      flexShrink: 0,
                    }}
                  >
                    {track.icon}
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
                        {locale === "fr" ? track.titleFr : track.titleEn}
                      </h2>

                      {isLocked && (
                        <span
                          style={{
                            fontSize: "9px",
                            padding: "2px 8px",
                            borderRadius: "4px",
                            background: "rgba(255,255,255,.06)",
                            color: "rgba(180,210,240,.4)",
                          }}
                        >
                          🔒{" "}
                          {locale === "fr"
                            ? "TERMINEZ LE TRACK PRÉCÉDENT"
                            : "COMPLETE PREVIOUS TRACK"}
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
                      {locale === "fr"
                        ? track.descriptionFr
                        : track.descriptionEn}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        marginBottom: "14px",
                      }}
                    >
                      {track.lessons.map((lesson) => {
                        const done = progress.some(
                          (item) =>
                            item.lesson_slug === lesson.id && item.completed,
                        );

                        return (
                          <span
                            key={lesson.id}
                            style={{
                              fontSize: "10px",
                              padding: "3px 10px",
                              borderRadius: "4px",
                              background: done
                                ? `${color}18`
                                : "rgba(255,255,255,.04)",
                              border: `1px solid ${
                                done
                                  ? `${color}44`
                                  : "rgba(255,255,255,.08)"
                              }`,
                              color: done ? color : "rgba(180,210,240,.35)",
                            }}
                          >
                            {done ? "✓ " : ""}
                            {locale === "fr"
                              ? lesson.titleFr
                              : lesson.titleEn}
                          </span>
                        );
                      })}
                    </div>

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
                          ? isProject
                            ? "projets"
                            : "leçons"
                          : isProject
                            ? "projects"
                            : "lessons"}
                      </span>

                      {!isLocked && (
                        <Link
                          href={href}
                          style={{
                            padding: "6px 16px",
                            background: `${color}18`,
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
