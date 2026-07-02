"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuthStore } from "@/store/useAuthStore";
import { useLocale } from "next-intl";
import { api } from "@/lib/api";
import { learnContent } from "@/content/learn";
import type { PyodideInterface } from "@/types/global";

const LANGUAGE_COLORS: Record<string, string> = {
  python:     "#4b9cd3",
  javascript: "#f7df1e",
  sql:        "#44cc88",
};

const LANGUAGE_LABELS: Record<string, string> = {
  python:     "Python",
  javascript: "JavaScript",
};

type Tab = "lesson" | "code" | "quiz" | "solution";

export default function LessonPage({
  params,
}: {
  params: Promise<{ language: string; track: string; lesson: string }>;
}) {
  const { language, track, lesson } = use(params);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();

  const color = LANGUAGE_COLORS[language] ?? "#ddeeff";

  // Content
  const trackData = learnContent[language]?.[track];
  const lessonData = trackData?.find((l: any) => l.id === lesson);
  const allLessons = trackData ?? [];
  const currentIndex = allLessons.findIndex((l: any) => l.id === lesson);
  const nextLesson = allLessons[currentIndex + 1] ?? null;
  const prevLesson = allLessons[currentIndex - 1] ?? null;

  const lessonContent = lessonData?.content?.[locale as "en" | "fr"] ?? lessonData?.content?.en ?? "";
  const quizQuestions = lessonData?.quiz?.[locale as "en" | "fr"] ?? lessonData?.quiz?.en ?? [];
  const starterCode = lessonData?.starterCode?.[language] ?? lessonData?.starterCode?.default ?? "";

  // UI state
  const [tab, setTab] = useState<Tab>("lesson");
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [engineLoading, setEngineLoading] = useState(false);

  // Quiz state
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);

  const pyodideRef = useRef<PyodideInterface | null>(null);
  const sqlRef = useRef<ReturnType<typeof window.initSqlJs> extends Promise<infer T> ? T : never | null>(null);

  // Auth guard
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }
    if (!lessonData) {
      router.push(`/${locale}/learn/${language}/${track}`);
      return;
    }
    // Load progress
    api.get(`/learn/${language}/progress`)
      .then((res) => {
        const prog = res.data.find((p: any) => p.lesson_slug === lesson);
        if (prog?.quiz_score !== null && prog?.quiz_score !== undefined) {
          setSubmitted(true);
          setScore(prog.quiz_score);
          setQuizPassed(prog.quiz_score / (prog.quiz_total ?? 1) >= 0.75);
          setProgressSaved(true);
        }
      })
      .catch(() => {});
  }, [isAuthenticated, lesson]);

  // Load engine when switching to code tab
  useEffect(() => {
    if (tab !== "code") return;
    if (engineReady || engineLoading) return;
    loadEngine();
  }, [tab]);

  const loadEngine = async () => {
    setEngineLoading(true);
    setOutput(
      language === "python"
        ? "⏳ Loading Python (Pyodide)... this takes ~5 seconds the first time."
        : language === "sql"
        ? "⏳ Loading SQL engine (sql.js)..."
        : ""
    );

    try {
      if (language === "python") {
        if (!document.getElementById("pyodide-script")) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.id = "pyodide-script";
            script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Pyodide"));
            document.head.appendChild(script);
          });
        }
        if (!pyodideRef.current) {
          pyodideRef.current = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
          });
        }
        setOutput("✅ Python ready! Click Run to execute your code.");
      } else if (language === "sql") {
        if (!document.getElementById("sqljs-script")) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.id = "sqljs-script";
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load sql.js"));
            document.head.appendChild(script);
          });
        }
        if (!sqlRef.current) {
          sqlRef.current = await window.initSqlJs({
            locateFile: (file: string) =>
              `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`,
          });
        }
        setOutput("✅ SQL ready! Click Run to execute your queries.");
      } else {
        // JavaScript — always ready
        setOutput("✅ JavaScript ready! Click Run to execute your code.");
      }
      setEngineReady(true);
    } catch (err) {
      setOutput(`❌ Failed to load engine: ${err}`);
    } finally {
      setEngineLoading(false);
    }
  };

  const runCode = async () => {
    if (!engineReady && language !== "javascript") return;
    setRunning(true);
    setOutput("▶ Running...");

    try {
      if (language === "python") {
        const pyodide = pyodideRef.current!;
        // Capture stdout
        pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
        `);
        try {
          pyodide.runPython(code);
          const stdout = pyodide.runPython("sys.stdout.getvalue()") as string;
          const stderr = pyodide.runPython("sys.stderr.getvalue()") as string;
          setOutput(stdout + (stderr ? `\n⚠️ ${stderr}` : "") || "(no output)");
        } catch (err: any) {
          setOutput(`❌ Error:\n${err.message}`);
        }
      } else if (language === "javascript") {
        // Capture console.log output
        const logs: string[] = [];
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        console.log = (...args) => logs.push(args.map(String).join(" "));
        console.error = (...args) => logs.push("❌ " + args.map(String).join(" "));
        console.warn = (...args) => logs.push("⚠️ " + args.map(String).join(" "));
        try {
          // eslint-disable-next-line no-new-func
          const fn = new Function(code);
          const result = fn();
          if (result !== undefined) logs.push(String(result));
          setOutput(logs.join("\n") || "(no output)");
        } catch (err: any) {
          setOutput(`❌ Error:\n${err.message}`);
        } finally {
          console.log = originalLog;
          console.error = originalError;
          console.warn = originalWarn;
        }
      } else if (language === "sql") {
        const SQL = sqlRef.current!;
        const db = new SQL.Database();
        try {
          const results = db.exec(code);
          if (results.length === 0) {
            setOutput("✅ Query executed successfully. (no rows returned)");
          } else {
            const lines: string[] = [];
            results.forEach((result) => {
              // Header
              lines.push(result.columns.join(" | "));
              lines.push(result.columns.map((c) => "-".repeat(c.length + 2)).join("-+-"));
              // Rows
              result.values.forEach((row) => {
                lines.push(row.map((v) => (v === null ? "NULL" : String(v))).join(" | "));
              });
              lines.push(`(${result.values.length} row${result.values.length !== 1 ? "s" : ""})`);
            });
            setOutput(lines.join("\n"));
          }
        } catch (err: any) {
          setOutput(`❌ SQL Error:\n${err.message}`);
        }
      }
    } finally {
      setRunning(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (quizQuestions.length === 0) return;
    let correct = 0;
    quizQuestions.forEach((q: any, i: number) => {
      if (answers[i] === q.correct) correct++;
    });
    setScore(correct);
    setSubmitted(true);
    const passed = correct / quizQuestions.length >= 0.75;
    setQuizPassed(passed);
    await api.post(`/learn/${language}/progress`, {
      lesson_slug: lesson,
      completed: passed,
      quiz_score: correct,
      quiz_total: quizQuestions.length,
    }).catch(() => {});
    setProgressSaved(true);
  };

  if (!lessonData) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d1420", padding: "32px 24px", fontFamily: "monospace", margin: "-32px -24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px" }}>
          {[120, 300, 200, 100].map((h, i) => (
            <div key={i} style={{ height: `${h}px`, background: "rgba(255,255,255,.04)", borderRadius: "12px" }} />
          ))}
        </div>
      </div>
    );
  }

  const pct = submitted ? Math.round((score / quizQuestions.length) * 100) : null;

  const tabs: { id: Tab; label: string }[] = [
    { id: "lesson",   label: locale === "fr" ? "📖 Leçon"   : "📖 Lesson" },
    { id: "code",     label: locale === "fr" ? "💻 Code"    : "💻 Code" },
    { id: "quiz",     label: "📝 Quiz" },
    { id: "solution", label: locale === "fr" ? "✅ Solution" : "✅ Solution" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#0d1420", padding: "32px 24px", fontFamily: "monospace", color: "#ddeeff", margin: "-32px -24px" }}>
      <div style={{ maxWidth: "900px" }}>

        {/* Back */}
        <Link href={`/${locale}/learn/${language}/${track}`} style={{ fontSize: "11px", color: "rgba(180,210,240,.4)", textDecoration: "none", display: "inline-block", marginBottom: "24px" }}>
          ← {locale === "fr" ? "Retour au track" : "Back to track"}
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "9px", letterSpacing: ".12em", color: `${color}99`, marginBottom: "6px" }}>
            {LANGUAGE_LABELS[language]} · {locale === "fr" ? `LEÇON ${currentIndex + 1}` : `LESSON ${currentIndex + 1}`}
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#ddeeff", margin: "0 0 10px" }}>
            {locale === "fr" ? lessonData.titleFr : lessonData.titleEn}
          </h1>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" as const }}>
            {progressSaved && quizPassed && (
              <span style={{ fontSize: "9px", padding: "2px 10px", borderRadius: "4px", background: "rgba(68,204,136,.15)", color: "#44cc88" }}>
                ✓ {locale === "fr" ? "TERMINÉ" : "COMPLETED"}
              </span>
            )}
            {submitted && pct !== null && (
              <span style={{ fontSize: "9px", padding: "2px 10px", borderRadius: "4px", background: quizPassed ? "rgba(68,204,136,.15)" : "rgba(255,102,34,.15)", color: quizPassed ? "#44cc88" : "#ff6622" }}>
                Quiz: {score}/{quizQuestions.length} ({pct}%)
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "24px", borderBottom: "1px solid rgba(255,255,255,.07)" }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{ padding: "8px 20px", fontFamily: "monospace", fontSize: "11px", cursor: "pointer", border: "none", background: "transparent", color: tab === t.id ? color : "rgba(180,210,240,.4)", borderBottom: `2px solid ${tab === t.id ? color : "transparent"}`, marginBottom: "-1px" }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── LESSON TAB ── */}
        {tab === "lesson" && (
          <div>
            <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "12px", padding: "32px" }}>
              <div className="learn-lesson-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{lessonContent}</ReactMarkdown>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
              {prevLesson ? (
                <Link href={`/${locale}/learn/${language}/${track}/${prevLesson.id}`} style={{ padding: "10px 20px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "8px", color: "rgba(180,210,240,.6)", fontSize: "11px", textDecoration: "none" }}>
                  ← {locale === "fr" ? "Leçon précédente" : "Previous lesson"}
                </Link>
              ) : <div />}
              <button onClick={() => setTab("code")} style={{ padding: "10px 20px", background: `${color}22`, border: `1px solid ${color}44`, borderRadius: "8px", color, fontSize: "11px", fontFamily: "monospace", cursor: "pointer" }}>
                {locale === "fr" ? "Coder →" : "Write code →"}
              </button>
            </div>
          </div>
        )}

        {/* ── CODE TAB ── */}
        {tab === "code" && (
          <div>
            {/* Instructions */}
            {lessonData.exerciseEn && (
              <div style={{ marginBottom: "16px", padding: "16px 20px", background: `${color}0d`, border: `1px solid ${color}30`, borderRadius: "10px" }}>
                <div style={{ fontSize: "10px", letterSpacing: ".08em", color: `${color}99`, marginBottom: "6px" }}>
                  {locale === "fr" ? "EXERCICE" : "EXERCISE"}
                </div>
                <p style={{ fontSize: "13px", color: "rgba(180,210,240,.8)", margin: 0, lineHeight: 1.7 }}>
                  {locale === "fr" ? lessonData.exerciseFr : lessonData.exerciseEn}
                </p>
              </div>
            )}

            {/* Editor */}
            <div style={{ background: "rgba(0,0,0,.4)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "10px", overflow: "hidden" }}>
              {/* Editor header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
                  <span style={{ fontSize: "10px", color: "rgba(180,210,240,.4)" }}>
                    {language === "python" ? "main.py" : language === "sql" ? "query.sql" : "main.js"}
                  </span>
                </div>
                <button
                  onClick={runCode}
                  disabled={running || (engineLoading && language !== "javascript")}
                  style={{ padding: "5px 14px", background: running ? "rgba(255,255,255,.05)" : `${color}22`, border: `1px solid ${running ? "rgba(255,255,255,.1)" : `${color}44`}`, borderRadius: "5px", color: running ? "rgba(180,210,240,.3)" : color, fontSize: "10px", fontFamily: "monospace", cursor: running ? "not-allowed" : "pointer" }}
                >
                  {running ? "▶ Running..." : engineLoading ? "⏳ Loading..." : `▶ Run ${LANGUAGE_LABELS[language]}`}
                </button>
              </div>

              {/* Textarea editor */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                style={{
                  width: "100%",
                  minHeight: "280px",
                  background: "transparent",
                  border: "none",
                  padding: "16px",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  color: "#ddeeff",
                  resize: "vertical",
                  outline: "none",
                  lineHeight: 1.7,
                  boxSizing: "border-box",
                  tabSize: 2,
                }}
                onKeyDown={(e) => {
                  // Tab key inserts spaces instead of changing focus
                  if (e.key === "Tab") {
                    e.preventDefault();
                    const start = e.currentTarget.selectionStart;
                    const end = e.currentTarget.selectionEnd;
                    const spaces = language === "python" ? "    " : "  ";
                    setCode(code.substring(0, start) + spaces + code.substring(end));
                    setTimeout(() => {
                      e.currentTarget.selectionStart = start + spaces.length;
                      e.currentTarget.selectionEnd = start + spaces.length;
                    }, 0);
                  }
                }}
              />

              {/* Output */}
              {output && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", padding: "14px 16px", background: "rgba(0,0,0,.3)" }}>
                  <div style={{ fontSize: "9px", letterSpacing: ".08em", color: "rgba(180,210,240,.3)", marginBottom: "8px" }}>
                    OUTPUT
                  </div>
                  <pre style={{ margin: 0, fontSize: "12px", color: output.startsWith("❌") ? "#ff6622" : output.startsWith("✅") ? "#44cc88" : "rgba(180,210,240,.8)", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6 }}>
                    {output}
                  </pre>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "16px" }}>
              <button onClick={() => setTab("quiz")} style={{ padding: "10px 20px", background: `${color}22`, border: `1px solid ${color}44`, borderRadius: "8px", color, fontSize: "11px", fontFamily: "monospace", cursor: "pointer" }}>
                {locale === "fr" ? "Passer le quiz →" : "Take the quiz →"}
              </button>
            </div>
          </div>
        )}

        {/* ── QUIZ TAB ── */}
        {tab === "quiz" && (
          <div>
            {quizQuestions.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px", color: "rgba(180,210,240,.3)", fontSize: "13px" }}>
                {locale === "fr" ? "Aucune question disponible." : "No questions available."}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {quizQuestions.map((q: any, i: number) => {
                  const selected = answers[i];
                  const isCorrect = submitted && selected === q.correct;
                  const isWrong = submitted && selected !== undefined && selected !== q.correct;
                  return (
                    <div key={i} style={{ background: "rgba(255,255,255,.02)", border: `1px solid ${submitted ? (isCorrect ? "rgba(68,204,136,.3)" : isWrong ? "rgba(255,102,34,.3)" : "rgba(255,255,255,.07)") : "rgba(255,255,255,.07)"}`, borderRadius: "10px", padding: "20px" }}>
                      <div style={{ fontSize: "13px", color: "#ddeeff", marginBottom: "14px", lineHeight: 1.6 }}>
                        <span style={{ color: `${color}99`, marginRight: "8px" }}>{i + 1}.</span>
                        {q.question}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {q.options.map((opt: string, j: number) => {
                          const isSelected = selected === j;
                          const isAnswer = submitted && j === q.correct;
                          const isWrongSelected = submitted && isSelected && j !== q.correct;
                          return (
                            <button
                              key={j}
                              onClick={() => !submitted && setAnswers((prev) => ({ ...prev, [i]: j }))}
                              style={{ padding: "10px 14px", background: isAnswer ? "rgba(68,204,136,.15)" : isWrongSelected ? "rgba(255,102,34,.15)" : isSelected ? `${color}22` : "rgba(255,255,255,.03)", border: `1px solid ${isAnswer ? "rgba(68,204,136,.4)" : isWrongSelected ? "rgba(255,102,34,.4)" : isSelected ? `${color}44` : "rgba(255,255,255,.08)"}`, borderRadius: "6px", color: isAnswer ? "#44cc88" : isWrongSelected ? "#ff6622" : isSelected ? color : "rgba(180,210,240,.7)", fontSize: "12px", fontFamily: "monospace", textAlign: "left", cursor: submitted ? "default" : "pointer" }}
                            >
                              {isAnswer && "✓ "}{isWrongSelected && "✗ "}{opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {submitted && (
                  <div style={{ padding: "20px", background: quizPassed ? "rgba(68,204,136,.1)" : "rgba(255,102,34,.1)", border: `1px solid ${quizPassed ? "rgba(68,204,136,.3)" : "rgba(255,102,34,.3)"}`, borderRadius: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "28px", marginBottom: "8px" }}>{quizPassed ? "🎉" : "😔"}</div>
                    <div style={{ fontSize: "16px", fontWeight: 700, color: quizPassed ? "#44cc88" : "#ff6622", marginBottom: "4px" }}>
                      {score}/{quizQuestions.length} ({pct}%)
                    </div>
                    <div style={{ fontSize: "12px", color: "rgba(180,210,240,.5)", marginBottom: "16px" }}>
                      {quizPassed
                        ? locale === "fr" ? "Félicitations ! Leçon débloquée." : "Congratulations! Next lesson unlocked."
                        : locale === "fr" ? "Vous avez besoin de 75% pour continuer. Réessayez !" : "You need 75% to continue. Try again!"}
                    </div>
                    {quizPassed && nextLesson && (
                      <Link href={`/${locale}/learn/${language}/${track}/${nextLesson.id}`} style={{ display: "inline-block", padding: "10px 24px", background: "rgba(68,204,136,.2)", border: "1px solid rgba(68,204,136,.4)", borderRadius: "8px", color: "#44cc88", fontSize: "12px", textDecoration: "none" }}>
                        {locale === "fr" ? "Leçon suivante →" : "Next lesson →"}
                      </Link>
                    )}
                    {!quizPassed && (
                      <button onClick={() => { setSubmitted(false); setAnswers({}); setScore(0); }} style={{ padding: "10px 24px", background: "rgba(255,102,34,.15)", border: "1px solid rgba(255,102,34,.3)", borderRadius: "8px", color: "#ff6622", fontSize: "12px", fontFamily: "monospace", cursor: "pointer" }}>
                        {locale === "fr" ? "Réessayer" : "Try again"}
                      </button>
                    )}
                  </div>
                )}

                {!submitted && (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(answers).length < quizQuestions.length}
                    style={{ padding: "12px", background: Object.keys(answers).length < quizQuestions.length ? "rgba(255,255,255,.05)" : `${color}22`, border: `1px solid ${Object.keys(answers).length < quizQuestions.length ? "rgba(255,255,255,.1)" : `${color}44`}`, borderRadius: "8px", color: Object.keys(answers).length < quizQuestions.length ? "rgba(180,210,240,.3)" : color, fontSize: "12px", fontFamily: "monospace", cursor: Object.keys(answers).length < quizQuestions.length ? "not-allowed" : "pointer" }}
                  >
                    {locale === "fr" ? `Soumettre (${Object.keys(answers).length}/${quizQuestions.length} répondues)` : `Submit (${Object.keys(answers).length}/${quizQuestions.length} answered)`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── SOLUTION TAB ── */}
        {tab === "solution" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "12px 16px", background: "rgba(68,204,136,.08)", border: "1px solid rgba(68,204,136,.2)", borderRadius: "8px" }}>
              <p style={{ fontSize: "12px", color: "rgba(68,204,136,.8)", margin: 0 }}>
                {locale === "fr" ? "💡 Les solutions sont toujours disponibles. L'objectif est d'apprendre, pas de mémoriser." : "💡 Solutions are always available. The goal is learning, not memorization."}
              </p>
            </div>

            {/* Code solution */}
            {lessonData.solutionCode && (
              <div>
                <div style={{ fontSize: "10px", letterSpacing: ".08em", color: "rgba(180,210,240,.4)", marginBottom: "8px" }}>
                  {locale === "fr" ? "CODE DE LA SOLUTION" : "SOLUTION CODE"}
                </div>
                <div style={{ background: "rgba(0,0,0,.4)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "10px", padding: "16px", overflow: "auto" }}>
                  <pre style={{ margin: 0, fontSize: "12px", color: "#44cc88", lineHeight: 1.7 }}>
                    {lessonData.solutionCode[language] ?? lessonData.solutionCode.default ?? ""}
                  </pre>
                </div>
              </div>
            )}

            {/* Quiz solutions */}
            {quizQuestions.length > 0 && (
              <div>
                <div style={{ fontSize: "10px", letterSpacing: ".08em", color: "rgba(180,210,240,.4)", marginBottom: "8px" }}>
                  {locale === "fr" ? "RÉPONSES DU QUIZ" : "QUIZ ANSWERS"}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {quizQuestions.map((q: any, i: number) => (
                    <div key={i} style={{ background: "rgba(68,204,136,.05)", border: "1px solid rgba(68,204,136,.15)", borderRadius: "8px", padding: "14px 16px" }}>
                      <div style={{ fontSize: "12px", color: "#ddeeff", marginBottom: "8px", lineHeight: 1.5 }}>
                        <span style={{ color: `${color}99`, marginRight: "8px" }}>{i + 1}.</span>{q.question}
                      </div>
                      <div style={{ fontSize: "12px", color: "#44cc88" }}>✓ {q.options[q.correct]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      <style>{`
        .learn-lesson-content { color: #ddeeff; font-family: monospace; line-height: 1.8; font-size: 13px; }
        .learn-lesson-content h1 { font-size: 22px; font-weight: 700; color: #ddeeff; margin: 0 0 20px; border-bottom: 1px solid rgba(255,255,255,.07); padding-bottom: 12px; }
        .learn-lesson-content h2 { font-size: 16px; font-weight: 700; color: #ddeeff; margin: 28px 0 12px; }
        .learn-lesson-content h3 { font-size: 13px; font-weight: 700; color: ${color}; margin: 20px 0 8px; }
        .learn-lesson-content p { margin: 0 0 14px; color: rgba(180,210,240,.8); }
        .learn-lesson-content ul, .learn-lesson-content ol { margin: 0 0 14px; padding-left: 20px; color: rgba(180,210,240,.8); }
        .learn-lesson-content li { margin-bottom: 6px; }
        .learn-lesson-content code { background: ${color}18; border: 1px solid ${color}30; padding: 1px 6px; border-radius: 4px; font-size: 12px; color: ${color}; }
        .learn-lesson-content pre { background: rgba(0,0,0,.4); border: 1px solid rgba(255,255,255,.08); border-radius: 8px; padding: 16px; overflow-x: auto; margin: 0 0 14px; }
        .learn-lesson-content pre code { background: transparent; border: none; padding: 0; color: #44cc88; font-size: 12px; }
        .learn-lesson-content strong { color: #ddeeff; font-weight: 700; }
        .learn-lesson-content table { width: 100%; border-collapse: collapse; margin: 0 0 14px; font-size: 12px; }
        .learn-lesson-content th { background: ${color}18; border: 1px solid rgba(255,255,255,.08); padding: 8px 12px; color: ${color}; text-align: left; }
        .learn-lesson-content td { border: 1px solid rgba(255,255,255,.06); padding: 8px 12px; color: rgba(180,210,240,.7); }
        .learn-lesson-content blockquote { border-left: 3px solid ${color}; margin: 0 0 14px; padding: 8px 16px; background: ${color}08; color: rgba(180,210,240,.7); }
      `}</style>
    </div>
  );
}
