"use client";

import { useEffect, useState } from "react";

type Lang = "en" | "fr";

type PortName = "USB-C" | "HDMI" | "RJ45" | "DisplayPort";

type Question = {
  name: PortName;
  options: string[];
};

type QuizRun = {
  score: number;
  total: number;
  percent: number;
};

const BASE_PORTS: Question[] = [
  {
    name: "USB-C",
    options: ["USB-C", "HDMI", "Ethernet", "VGA"],
  },
  {
    name: "HDMI",
    options: ["DisplayPort", "HDMI", "USB-A", "PS/2"],
  },
  {
    name: "RJ45",
    options: ["RJ45", "USB-C", "HDMI", "VGA"],
  },
  {
    name: "DisplayPort",
    options: ["HDMI", "DisplayPort", "USB-A", "DVI"],
  },
];

const TOTAL_QUESTIONS = 5;
const BEST_KEY = "vlab_ports_quiz_best";
const HISTORY_KEY = "vlab_ports_quiz_history";

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function createInitialQuestions(): Question[] {
  const result: Question[] = [];

  for (let i = 0; i < TOTAL_QUESTIONS; i++) {
    result.push(BASE_PORTS[i % BASE_PORTS.length]);
  }

  return result;
}

function createQuizQuestions(): Question[] {
  return shuffle(createInitialQuestions());
}

function loadBest(): QuizRun | null {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    return raw ? (JSON.parse(raw) as QuizRun) : null;
  } catch {
    return null;
  }
}

function loadHistory(): QuizRun[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
}

function PortDrawing({ name }: { name: PortName }) {
  if (name === "USB-C") {
    return (
      <svg width="170" height="110" viewBox="0 0 170 110">
        <rect width="170" height="110" rx="14" fill="#f8fafc" />
        <rect x="35" y="38" width="100" height="34" rx="17" fill="#111827" />
        <rect x="44" y="47" width="82" height="16" rx="8" fill="#e5e7eb" />
      </svg>
    );
  }

  if (name === "HDMI") {
    return (
      <svg width="170" height="110" viewBox="0 0 170 110">
        <rect width="170" height="110" rx="14" fill="#f8fafc" />
        <path d="M40 36 H130 L120 75 H50 Z" fill="#111827" />
        <path d="M55 47 H115 L110 65 H60 Z" fill="#e5e7eb" />
      </svg>
    );
  }

  if (name === "RJ45") {
    return (
      <svg width="170" height="110" viewBox="0 0 170 110">
        <rect width="170" height="110" rx="14" fill="#f8fafc" />
        <path d="M42 35 H128 V78 H42 Z" fill="#111827" />
        <path d="M58 35 H112 V48 H58 Z" fill="#f8fafc" />
        {[50, 62, 74, 86, 98, 110].map((x) => (
          <rect key={x} x={x} y="58" width="6" height="14" fill="#facc15" />
        ))}
      </svg>
    );
  }

  return (
    <svg width="170" height="110" viewBox="0 0 170 110">
      <rect width="170" height="110" rx="14" fill="#f8fafc" />
      <path d="M38 36 H132 V72 H92 L82 82 H38 Z" fill="#111827" />
      <path d="M52 48 H118 V62 H88 L80 70 H52 Z" fill="#e5e7eb" />
    </svg>
  );
}

export default function PortsQuiz({ lang }: { lang: Lang }) {
  const [questions, setQuestions] = useState<Question[]>(
    createInitialQuestions,
  );
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>(
    BASE_PORTS[0].options,
  );
  const [finished, setFinished] = useState(false);
  const [best, setBest] = useState<QuizRun | null>(null);
  const [history, setHistory] = useState<QuizRun[]>([]);

  const current = questions[index] ?? questions[0];

  useEffect(() => {
    setBest(loadBest());
    setHistory(loadHistory());
    setQuestions(createQuizQuestions());
  }, []);

  useEffect(() => {
    if (!current) return;

    setShuffledOptions(shuffle(current.options));
    setSelected(null);
  }, [current]);

  const saveRun = (finalScore: number) => {
    const run: QuizRun = {
      score: finalScore,
      total: TOTAL_QUESTIONS,
      percent: Math.round((finalScore / TOTAL_QUESTIONS) * 100),
    };

    setBest((prev) => {
      if (!prev || run.score > prev.score) {
        localStorage.setItem(BEST_KEY, JSON.stringify(run));
        return run;
      }

      return prev;
    });

    setHistory((prev) => {
      const updated = [run, ...prev].slice(0, 5);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const restart = () => {
    setQuestions(createQuizQuestions());
    setIndex(0);
    setScore(0);
    setSelected(null);
    setFinished(false);
  };

  const resetStats = () => {
    const ok = confirm(
      lang === "fr" ? "Réinitialiser les statistiques ?" : "Reset quiz stats?",
    );

    if (!ok) return;

    localStorage.removeItem(BEST_KEY);
    localStorage.removeItem(HISTORY_KEY);
    setBest(null);
    setHistory([]);
  };

  const handleAnswer = (choice: string) => {
    if (selected || finished || !current) return;

    setSelected(choice);

    const isCorrect = choice === current.name;
    const finalScore = isCorrect ? score + 1 : score;

    if (isCorrect) {
      setScore((s) => s + 1);
    }

    const nextIndex = index + 1;

    if (nextIndex >= questions.length) {
      setTimeout(() => {
        saveRun(finalScore);
        setFinished(true);
      }, 400);
      return;
    }

    setTimeout(() => {
      setIndex(nextIndex);
    }, 600);
  };

  const percent = Math.round((score / TOTAL_QUESTIONS) * 100);

  return (
    <div
      style={{
        marginTop: "24px",
        border: "1px solid rgba(91,155,213,.18)",
        borderRadius: "12px",
        background: "rgba(255,255,255,.03)",
        padding: "18px",
      }}
    >
      <div
        style={{
          fontFamily: "monospace",
          fontSize: "12px",
          color: "#7ab3e8",
          marginBottom: "6px",
        }}
      >
        {lang === "fr" ? "Quiz des ports" : "Ports Quiz"}
      </div>

      <div
        style={{
          fontFamily: "monospace",
          fontSize: "11px",
          color: "rgba(255,255,255,.45)",
          marginBottom: "14px",
        }}
      >
        {lang === "fr"
          ? "Identifiez les ports matériels courants"
          : "Identify common hardware ports"}
      </div>

      {finished ? (
        <div>
          <div
            style={{
              padding: "14px",
              borderRadius: "10px",
              background: "rgba(68,204,136,.08)",
              border: "1px solid rgba(68,204,136,.2)",
              fontFamily: "monospace",
              color: "#44cc88",
              marginBottom: "14px",
            }}
          >
            <div style={{ fontSize: "14px", fontWeight: 700 }}>
              {lang === "fr" ? "Résultat final" : "Final Result"}
            </div>

            <div style={{ marginTop: "8px", fontSize: "12px" }}>
              {lang === "fr" ? "Score" : "Score"}: {score}/{TOTAL_QUESTIONS}
            </div>

            <div style={{ fontSize: "12px" }}>
              {lang === "fr" ? "Réussite" : "Success"}: {percent}%
            </div>
          </div>

          <button
            onClick={restart}
            style={{
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(91,155,213,.35)",
              background: "rgba(91,155,213,.12)",
              color: "#7ab3e8",
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: "12px",
            }}
          >
            {lang === "fr" ? "Recommencer" : "Try again"}
          </button>

          <div
            style={{
              marginTop: "14px",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid rgba(91,155,213,.16)",
              background: "rgba(91,155,213,.06)",
              fontFamily: "monospace",
              fontSize: "12px",
              color: "rgba(255,255,255,.8)",
            }}
          >
            <div
              style={{ color: "#7ab3e8", fontWeight: 700, marginBottom: "8px" }}
            >
              {lang === "fr" ? "Statistiques" : "Stats"}
            </div>

            <div>
              {lang === "fr" ? "Meilleur" : "Best"}:{" "}
              {best ? `${best.score}/${best.total} · ${best.percent}%` : "—"}
            </div>

            <div style={{ marginTop: "8px", color: "#7ab3e8" }}>
              {lang === "fr" ? "Sessions récentes" : "Recent Runs"}
            </div>

            {history.length === 0 ? (
              <div style={{ opacity: 0.5 }}>
                {lang === "fr" ? "Aucune session" : "No runs yet"}
              </div>
            ) : (
              history.map((run, i) => (
                <div key={i}>
                  {run.score}/{run.total} · {run.percent}%
                </div>
              ))
            )}

            <button
              onClick={resetStats}
              style={{
                marginTop: "10px",
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid rgba(255,100,100,.25)",
                background: "transparent",
                color: "rgba(255,120,120,.8)",
                fontFamily: "monospace",
                fontSize: "11px",
                cursor: "pointer",
              }}
            >
              {lang === "fr" ? "Réinitialiser" : "Reset stats"}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              marginBottom: "12px",
              fontFamily: "monospace",
              fontSize: "12px",
              color: "rgba(255,255,255,.65)",
            }}
          >
            <span>
              {lang === "fr" ? "Question" : "Question"} {index + 1}/
              {TOTAL_QUESTIONS}
            </span>
            <span>
              {lang === "fr" ? "Score" : "Score"}: {score}
            </span>
          </div>

          <div
            style={{
              height: "4px",
              background: "rgba(255,255,255,.08)",
              borderRadius: "999px",
              overflow: "hidden",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${((index + 1) / TOTAL_QUESTIONS) * 100}%`,
                background: "#5b9bd5",
                transition: "width .25s",
              }}
            />
          </div>

          <div
            style={{
              marginBottom: "14px",
              fontFamily: "monospace",
              fontSize: "14px",
              color: "#ddeeff",
            }}
          >
            {lang === "fr" ? "Quel est ce port ?" : "Which port is this?"}
          </div>

          <div
            style={{
              marginBottom: "16px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <PortDrawing name={current.name} />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {shuffledOptions.map((opt) => {
              const isCorrect = opt === current.name;
              const isSelected = selected === opt;

              let bg = "transparent";
              let color = "#ddeeff";
              let border = "1px solid rgba(255,255,255,.2)";

              if (selected) {
                if (isCorrect) {
                  bg = "rgba(68,204,136,.18)";
                  color = "#44cc88";
                  border = "1px solid rgba(68,204,136,.45)";
                } else if (isSelected) {
                  bg = "rgba(255,100,100,.18)";
                  color = "#ff6b6b";
                  border = "1px solid rgba(255,100,100,.45)";
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  disabled={Boolean(selected)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border,
                    background: bg,
                    color,
                    cursor: selected ? "default" : "pointer",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    transition: "all .2s",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
