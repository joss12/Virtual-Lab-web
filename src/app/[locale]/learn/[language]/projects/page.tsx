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

const PROJECTS_CONFIG: Record<string, {
  color: string;
  icon: string;
  projects: {
    id: string;
    titleEn: string;
    titleFr: string;
    descriptionEn: string;
    descriptionFr: string;
    difficulty: "beginner" | "intermediate";
    steps: number;
    icon: string;
  }[];
}> = {
  python: {
    color: "#4b9cd3",
    icon: "🐍",
    projects: [
      {
        id: "calculator",
        titleEn: "Calculator",
        titleFr: "Calculatrice",
        descriptionEn: "Build a command-line calculator that handles +, -, ×, ÷ and edge cases like division by zero.",
        descriptionFr: "Construisez une calculatrice en ligne de commande gérant +, -, ×, ÷ et les cas limites.",
        difficulty: "beginner",
        steps: 6,
        icon: "🧮",
      },
      {
        id: "grade-manager",
        titleEn: "Grade Manager",
        titleFr: "Gestionnaire de notes",
        descriptionEn: "Manage student grades — add grades, compute averages, find highest/lowest, sort students.",
        descriptionFr: "Gérez les notes des étudiants — ajoutez des notes, calculez les moyennes, triez les étudiants.",
        difficulty: "beginner",
        steps: 7,
        icon: "📊",
      },
      {
        id: "password-generator",
        titleEn: "Password Generator",
        titleFr: "Générateur de mots de passe",
        descriptionEn: "Generate secure random passwords with custom length, character sets, and strength scoring.",
        descriptionFr: "Générez des mots de passe aléatoires sécurisés avec longueur et jeux de caractères personnalisés.",
        difficulty: "beginner",
        steps: 6,
        icon: "🔐",
      },
      {
        id: "contact-book",
        titleEn: "Contact Book",
        titleFr: "Carnet de contacts",
        descriptionEn: "A full CRUD contact manager — add, search, update, delete contacts stored in a dictionary.",
        descriptionFr: "Un gestionnaire de contacts CRUD complet — ajoutez, recherchez, modifiez, supprimez des contacts.",
        difficulty: "intermediate",
        steps: 8,
        icon: "📒",
      },
      {
        id: "bank-account",
        titleEn: "Bank Account Simulator",
        titleFr: "Simulateur de compte bancaire",
        descriptionEn: "Simulate a bank account with deposits, withdrawals, transaction history and balance checks.",
        descriptionFr: "Simulez un compte bancaire avec dépôts, retraits, historique des transactions et vérification du solde.",
        difficulty: "intermediate",
        steps: 8,
        icon: "🏦",
      },
      {
        id: "quiz-game",
        titleEn: "Quiz Game Engine",
        titleFr: "Moteur de quiz",
        descriptionEn: "Build a quiz engine that loads questions, tracks scores, shows results and supports multiple rounds.",
        descriptionFr: "Construisez un moteur de quiz qui charge des questions, suit les scores et supporte plusieurs manches.",
        difficulty: "intermediate",
        steps: 9,
        icon: "🎯",
      },
    ],
  },
  javascript: {
    color: "#f7df1e",
    icon: "⚡",
    projects: [
      {
        id: "unit-converter",
        titleEn: "Unit Converter",
        titleFr: "Convertisseur d'unités",
        descriptionEn: "Convert temperature, weight and distance between units — Celsius/Fahrenheit, km/miles, kg/lbs.",
        descriptionFr: "Convertissez température, poids et distance — Celsius/Fahrenheit, km/miles, kg/lbs.",
        difficulty: "beginner",
        steps: 6,
        icon: "📐",
      },
      {
        id: "inventory-tracker",
        titleEn: "Inventory Tracker",
        titleFr: "Suivi d'inventaire",
        descriptionEn: "Track product inventory — add items, update quantities, search by name, show low stock alerts.",
        descriptionFr: "Suivez l'inventaire produit — ajoutez des articles, mettez à jour les quantités, alertes de stock bas.",
        difficulty: "beginner",
        steps: 7,
        icon: "📦",
      },
      {
        id: "todo-list",
        titleEn: "Todo List",
        titleFr: "Liste de tâches",
        descriptionEn: "A full todo list with add, complete, delete, filter by status, and priority sorting.",
        descriptionFr: "Une liste de tâches complète avec ajout, complétion, suppression, filtrage et tri par priorité.",
        difficulty: "beginner",
        steps: 7,
        icon: "✅",
      },
      {
        id: "word-frequency",
        titleEn: "Word Frequency Counter",
        titleFr: "Compteur de fréquence de mots",
        descriptionEn: "Parse text, count word frequencies, sort by occurrence, find top N words, ignore stop words.",
        descriptionFr: "Analysez du texte, comptez les fréquences, triez par occurrence, trouvez les N premiers mots.",
        difficulty: "intermediate",
        steps: 7,
        icon: "📝",
      },
      {
        id: "json-database",
        titleEn: "Mini JSON Database",
        titleFr: "Mini base JSON",
        descriptionEn: "Build a simple in-memory database with insert, find, update, delete and query operations on JSON objects.",
        descriptionFr: "Construisez une base de données en mémoire avec insertion, recherche, mise à jour et suppression.",
        difficulty: "intermediate",
        steps: 8,
        icon: "🗄️",
      },
      {
        id: "expense-tracker",
        titleEn: "Expense Tracker",
        titleFr: "Suivi des dépenses",
        descriptionEn: "Track expenses by category, filter by date, compute totals, find the biggest spend, set budget alerts.",
        descriptionFr: "Suivez les dépenses par catégorie, filtrez par date, calculez les totaux, définissez des alertes de budget.",
        difficulty: "intermediate",
        steps: 9,
        icon: "💰",
      },
    ],
  },
};

const DIFFICULTY_LABELS: Record<string, { en: string; fr: string; color: string }> = {
  beginner:     { en: "Beginner",     fr: "Débutant",     color: "#44cc88" },
  intermediate: { en: "Intermediate", fr: "Intermédiaire", color: "#f7df1e" },
};

export default function ProjectsPage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = use(params);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  const config = PROJECTS_CONFIG[language];
  const color = config?.color ?? "#ddeeff";

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }
    if (!config) {
      router.push(`/${locale}/learn`);
      return;
    }
    setLoading(false);
    api.get(`/learn/${language}/progress`)
      .then((res) => setProgress(res.data))
      .catch(() => {});
  }, [isAuthenticated, language]);

  const isDone = (id: string) =>
    progress.some((p) => p.lesson_slug === id && p.completed);

  const completedCount = config?.projects.filter((p) => isDone(p.id)).length ?? 0;
  const totalCount = config?.projects.length ?? 0;

  if (loading || !config) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d1420", padding: "32px 24px", fontFamily: "monospace", margin: "-32px -24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "900px" }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: "140px", background: "rgba(255,255,255,.04)", borderRadius: "12px" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0d1420", padding: "32px 24px", fontFamily: "monospace", color: "#ddeeff", margin: "-32px -24px" }}>
      <div style={{ maxWidth: "900px" }}>

        {/* Back */}
        <Link href={`/${locale}/learn/${language}`} style={{ fontSize: "11px", color: "rgba(180,210,240,.4)", textDecoration: "none", display: "inline-block", marginBottom: "24px" }}>
          ← {locale === "fr" ? "Retour" : "Back"}
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontSize: "9px", letterSpacing: ".14em", color: `${color}88`, marginBottom: "6px" }}>
            {language.toUpperCase()} · {locale === "fr" ? "PROJETS GUIDÉS" : "GUIDED PROJECTS"}
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#ddeeff", margin: "0 0 8px" }}>
            {locale === "fr" ? "Projets guidés" : "Guided Projects"}
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(180,210,240,.5)", margin: "0 0 20px", lineHeight: 1.7 }}>
            {locale === "fr"
              ? "Construisez de vrais projets étape par étape. Chaque projet est un tutoriel détaillé — suivez comme une recette et écrivez du vrai code."
              : "Build real projects step by step. Each project is a detailed tutorial — follow like a recipe and write real code."}
          </p>

          {/* Overall progress */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,.06)", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.round((completedCount / totalCount) * 100)}%`, background: color, borderRadius: "2px", transition: "width .4s" }} />
            </div>
            <span style={{ fontSize: "11px", color: "rgba(180,210,240,.4)", flexShrink: 0 }}>
              {completedCount}/{totalCount} {locale === "fr" ? "projets terminés" : "projects completed"}
            </span>
          </div>
        </div>

        {/* How it works banner */}
        <div style={{ marginBottom: "32px", padding: "16px 20px", background: `${color}08`, border: `1px solid ${color}22`, borderRadius: "10px", display: "flex", gap: "20px", flexWrap: "wrap" as const }}>
          {[
            { icon: "📖", en: "Read the explanation", fr: "Lisez l'explication" },
            { icon: "💻", en: "Write the code step by step", fr: "Écrivez le code étape par étape" },
            { icon: "▶",  en: "Run it and see the output", fr: "Exécutez-le et voyez le résultat" },
            { icon: "✅", en: "Move to the next step", fr: "Passez à l'étape suivante" },
          ].map(({ icon, en, fr }) => (
            <div key={en} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px" }}>{icon}</span>
              <span style={{ fontSize: "11px", color: "rgba(180,210,240,.5)" }}>
                {locale === "fr" ? fr : en}
              </span>
            </div>
          ))}
        </div>

        {/* Projects grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "16px" }}>
          {config.projects.map((project, i) => {
            const done = isDone(project.id);
            const diff = DIFFICULTY_LABELS[project.difficulty];

            return (
              <div
                key={project.id}
                style={{
                  background: done ? `${color}08` : "rgba(255,255,255,.03)",
                  border: `1px solid ${done ? `${color}33` : "rgba(255,255,255,.07)"}`,
                  borderRadius: "12px",
                  padding: "22px",
                  display: "flex",
                  flexDirection: "column" as const,
                  gap: "12px",
                }}
              >
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "24px" }}>{project.icon}</span>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: done ? color : "#ddeeff", marginBottom: "2px" }}>
                        {locale === "fr" ? project.titleFr : project.titleEn}
                      </div>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <span style={{ fontSize: "9px", padding: "1px 7px", borderRadius: "3px", background: `${diff.color}18`, border: `1px solid ${diff.color}30`, color: diff.color }}>
                          {locale === "fr" ? diff.fr : diff.en}
                        </span>
                        <span style={{ fontSize: "9px", color: "rgba(180,210,240,.3)" }}>
                          {project.steps} {locale === "fr" ? "étapes" : "steps"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {done && (
                    <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "4px", background: "rgba(68,204,136,.15)", color: "#44cc88", flexShrink: 0 }}>
                      ✓ {locale === "fr" ? "TERMINÉ" : "DONE"}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p style={{ fontSize: "12px", color: "rgba(180,210,240,.5)", margin: 0, lineHeight: 1.6 }}>
                  {locale === "fr" ? project.descriptionFr : project.descriptionEn}
                </p>

                {/* CTA */}
                <Link
                  href={`/${locale}/learn/${language}/projects/${project.id}`}
                  style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "8px 16px", background: done ? "rgba(255,255,255,.05)" : `${color}18`, border: `1px solid ${done ? "rgba(255,255,255,.1)" : `${color}44`}`, borderRadius: "7px", color: done ? "rgba(180,210,240,.5)" : color, fontSize: "11px", textDecoration: "none", fontWeight: 600 }}
                >
                  {done
                    ? locale === "fr" ? "Revoir le projet →" : "Review project →"
                    : i === 0 || isDone(config.projects[i - 1].id)
                    ? locale === "fr" ? "Commencer le projet →" : "Start project →"
                    : locale === "fr" ? "Commencer le projet →" : "Start project →"}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
