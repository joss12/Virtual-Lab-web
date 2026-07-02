"use client";

import { useEffect, useState, useRef, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuthStore } from "@/store/useAuthStore";
import { useLocale } from "next-intl";
import { api } from "@/lib/api";
import { projectsContent } from "@/content/learn/projects";
import type { PyodideInterface } from "@/types/global";

const LANGUAGE_COLORS: Record<string, string> = {
  python:     "#4b9cd3",
  javascript: "#f7df1e",
  sql:        "#44cc88",
};

const LANGUAGE_LABELS: Record<string, string> = {
  python:     "Python",
  javascript: "JavaScript",
  sql:        "SQL",
};

export default function ProjectPage({
  params,
}: {
  params: Promise<{ language: string; project: string }>;
}) {
  const { language, project } = use(params);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const locale = useLocale();

  const color = LANGUAGE_COLORS[language] ?? "#ddeeff";

  // Content
  const projectData = projectsContent[language]?.[project];
  const steps = projectData?.steps ?? [];

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [engineLoading, setEngineLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [projectDone, setProjectDone] = useState(false);

  const pyodideRef = useRef<PyodideInterface | null>(null);
  const sqlRef = useRef<Awaited<ReturnType<typeof window.initSqlJs>> | null>(null);

  const step = steps[currentStep];

  // Set starter code when step changes
  useEffect(() => {
    if (!step) return;
    const starter = step.starterCode?.[language] ?? step.starterCode?.default ?? "";
    setCode(starter);
    setOutput("");
  }, [currentStep, language]);

  // Auth + progress
  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }
    if (!projectData) {
      router.push(`/${locale}/learn/${language}/projects`);
      return;
    }
    api.get(`/learn/${language}/progress`)
      .then((res) => {
        const prog = res.data.find((p: any) => p.lesson_slug === project);
        if (prog?.completed) setProjectDone(true);
      })
      .catch(() => {});
  }, [isAuthenticated, project]);

  // Load engine on mount
  useEffect(() => {
    if (!projectData) return;
    loadEngine();
  }, [language]);

  const loadEngine = async () => {
    if (language === "javascript") {
      setEngineReady(true);
      return;
    }
    setEngineLoading(true);
    try {
      if (language === "python") {
        if (!document.getElementById("pyodide-script")) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.id = "pyodide-script";
            script.src = "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js";
            script.onload = () => resolve();
            script.onerror = () => reject();
            document.head.appendChild(script);
          });
        }
        if (!pyodideRef.current) {
          pyodideRef.current = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
          });
        }
      } else if (language === "sql") {
        if (!document.getElementById("sqljs-script")) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.id = "sqljs-script";
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js";
            script.onload = () => resolve();
            script.onerror = () => reject();
            document.head.appendChild(script);
          });
        }
        if (!sqlRef.current) {
          sqlRef.current = await window.initSqlJs({
            locateFile: (file: string) =>
              `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`,
          });
        }
      }
      setEngineReady(true);
    } catch {
      setOutput("❌ Failed to load engine. Please refresh the page.");
    } finally {
      setEngineLoading(false);
    }
  };

  const runCode = async () => {
    setRunning(true);
    setOutput("▶ Running...");

    try {
      if (language === "python") {
        const pyodide = pyodideRef.current!;
        pyodide.runPython(`
import sys, io
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
        const logs: string[] = [];
        const orig = { log: console.log, error: console.error, warn: console.warn };
        console.log = (...a) => logs.push(a.map(String).join(" "));
        console.error = (...a) => logs.push("❌ " + a.map(String).join(" "));
        console.warn = (...a) => logs.push("⚠️ " + a.map(String).join(" "));
        try {
          // eslint-disable-next-line no-new-func
          const fn = new Function(code);
          const result = fn();
          if (result !== undefined) logs.push(String(result));
          setOutput(logs.join("\n") || "(no output)");
        } catch (err: any) {
          setOutput(`❌ Error:\n${err.message}`);
        } finally {
          Object.assign(console, orig);
        }
      } else if (language === "sql") {
        const SQL = sqlRef.current!;
        const db = new SQL.Database();
        try {
          const results = db.exec(code);
          if (results.length === 0) {
            setOutput("✅ Query executed. (no rows returned)");
          } else {
            const lines: string[] = [];
            results.forEach((r) => {
              lines.push(r.columns.join(" | "));
              lines.push(r.columns.map((c) => "-".repeat(Math.max(c.length, 4) + 2)).join("-+-"));
              r.values.forEach((row) =>
                lines.push(row.map((v) => (v === null ? "NULL" : String(v))).join(" | "))
              );
              lines.push(`(${r.values.length} row${r.values.length !== 1 ? "s" : ""})`);
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

  const markStepDone = () => {
    const next = new Set(completedSteps);
    next.add(currentStep);
    setCompletedSteps(next);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const finishProject = async () => {
    const next = new Set(completedSteps);
    next.add(currentStep);
    setCompletedSteps(next);
    setProjectDone(true);
    await api.post(`/learn/${language}/progress`, {
      lesson_slug: project,
      completed: true,
      quiz_score: steps.length,
      quiz_total: steps.length,
    }).catch(() => {});
  };

  if (!projectData) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d1420", padding: "32px 24px", fontFamily: "monospace", margin: "-32px -24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px" }}>
          {[200, 300, 100].map((h, i) => (
            <div key={i} style={{ height: `${h}px`, background: "rgba(255,255,255,.04)", borderRadius: "12px" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0d1420", padding: "32px 24px", fontFamily: "monospace", color: "#ddeeff", margin: "-32px -24px" }}>
      <div style={{ maxWidth: "1100px" }}>

        {/* Back */}
        <Link href={`/${locale}/learn/${language}/projects`} style={{ fontSize: "11px", color: "rgba(180,210,240,.4)", textDecoration: "none", display: "inline-block", marginBottom: "24px" }}>
          ← {locale === "fr" ? "Tous les projets" : "All projects"}
        </Link>

        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontSize: "9px", letterSpacing: ".12em", color: `${color}88`, marginBottom: "6px" }}>
            {LANGUAGE_LABELS[language]} · {locale === "fr" ? "PROJET GUIDÉ" : "GUIDED PROJECT"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#ddeeff", margin: 0 }}>
              {locale === "fr" ? projectData.titleFr : projectData.titleEn}
            </h1>
            {projectDone && (
              <span style={{ fontSize: "9px", padding: "2px 10px", borderRadius: "4px", background: "rgba(68,204,136,.15)", color: "#44cc88" }}>
                ✓ {locale === "fr" ? "TERMINÉ" : "COMPLETED"}
              </span>
            )}
          </div>
          <p style={{ fontSize: "12px", color: "rgba(180,210,240,.5)", margin: 0, lineHeight: 1.6 }}>
            {locale === "fr" ? projectData.descriptionFr : projectData.descriptionEn}
          </p>
        </div>

        {/* Engine loading banner */}
        {engineLoading && (
          <div style={{ marginBottom: "16px", padding: "12px 16px", background: `${color}0d`, border: `1px solid ${color}30`, borderRadius: "8px", fontSize: "12px", color: `${color}cc` }}>
            ⏳ {language === "python"
              ? locale === "fr" ? "Chargement de Python (Pyodide)..." : "Loading Python (Pyodide)..."
              : locale === "fr" ? "Chargement du moteur SQL..." : "Loading SQL engine..."}
          </div>
        )}

        {/* Main layout: steps sidebar + content */}
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: "24px", alignItems: "start" }}>

          {/* Steps sidebar */}
          <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: "12px", padding: "16px", position: "sticky", top: "24px" }}>
            <div style={{ fontSize: "9px", letterSpacing: ".1em", color: "rgba(180,210,240,.3)", marginBottom: "12px" }}>
              {locale === "fr" ? "ÉTAPES" : "STEPS"} ({completedSteps.size}/{steps.length})
            </div>

            {/* Overall progress bar */}
            <div style={{ height: "3px", background: "rgba(255,255,255,.06)", borderRadius: "2px", overflow: "hidden", marginBottom: "14px" }}>
              <div style={{ height: "100%", width: `${Math.round((completedSteps.size / steps.length) * 100)}%`, background: color, borderRadius: "2px", transition: "width .4s" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {steps.map((s: any, i: number) => {
                const done = completedSteps.has(i);
                const active = i === currentStep;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentStep(i)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 10px",
                      background: active ? `${color}18` : "transparent",
                      border: `1px solid ${active ? `${color}44` : "transparent"}`,
                      borderRadius: "7px",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <div style={{ width: "20px", height: "20px", borderRadius: "5px", background: done ? `${color}33` : active ? `${color}18` : "rgba(255,255,255,.05)", border: `1px solid ${done ? color : active ? `${color}44` : "rgba(255,255,255,.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "9px", color: done ? color : active ? `${color}cc` : "rgba(180,210,240,.3)", flexShrink: 0, fontWeight: 700 }}>
                      {done ? "✓" : i + 1}
                    </div>
                    <span style={{ fontSize: "11px", color: done ? color : active ? "#ddeeff" : "rgba(180,210,240,.4)", lineHeight: 1.3 }}>
                      {locale === "fr" ? s.titleFr : s.titleEn}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step content */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Step header */}
            <div style={{ padding: "20px 24px", background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "12px" }}>
              <div style={{ fontSize: "9px", letterSpacing: ".1em", color: `${color}88`, marginBottom: "6px" }}>
                {locale === "fr" ? `ÉTAPE ${currentStep + 1} SUR ${steps.length}` : `STEP ${currentStep + 1} OF ${steps.length}`}
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#ddeeff", margin: "0 0 14px" }}>
                {locale === "fr" ? step.titleFr : step.titleEn}
              </h2>
              <div className="project-step-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {locale === "fr" ? step.contentFr : step.contentEn}
                </ReactMarkdown>
              </div>
            </div>

            {/* Code editor */}
            <div style={{ background: "rgba(0,0,0,.4)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "10px", overflow: "hidden" }}>
              {/* Editor header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,.06)", background: "rgba(255,255,255,.02)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
                  <span style={{ fontSize: "10px", color: "rgba(180,210,240,.4)" }}>
                    {language === "python" ? "main.py" : language === "sql" ? "query.sql" : "main.js"}
                  </span>
                  {step.starterCode && (
                    <button
                      onClick={() => setCode(step.starterCode?.[language] ?? step.starterCode?.default ?? "")}
                      style={{ marginLeft: "8px", padding: "2px 8px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "4px", color: "rgba(180,210,240,.4)", fontSize: "9px", fontFamily: "monospace", cursor: "pointer" }}
                    >
                      {locale === "fr" ? "↺ Reset" : "↺ Reset"}
                    </button>
                  )}
                </div>
                <button
                  onClick={runCode}
                  disabled={running || (!engineReady && language !== "javascript")}
                  style={{ padding: "5px 14px", background: running ? "rgba(255,255,255,.05)" : `${color}22`, border: `1px solid ${running ? "rgba(255,255,255,.1)" : `${color}44`}`, borderRadius: "5px", color: running ? "rgba(180,210,240,.3)" : color, fontSize: "10px", fontFamily: "monospace", cursor: running ? "not-allowed" : "pointer" }}
                >
                  {running ? "▶ Running..." : `▶ Run`}
                </button>
              </div>

              {/* Textarea */}
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                style={{ width: "100%", minHeight: "220px", background: "transparent", border: "none", padding: "16px", fontFamily: "monospace", fontSize: "13px", color: "#ddeeff", resize: "vertical", outline: "none", lineHeight: 1.7, boxSizing: "border-box" }}
                onKeyDown={(e) => {
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
                  <div style={{ fontSize: "9px", letterSpacing: ".08em", color: "rgba(180,210,240,.3)", marginBottom: "8px" }}>OUTPUT</div>
                  <pre style={{ margin: 0, fontSize: "12px", color: output.startsWith("❌") ? "#ff6622" : output.startsWith("✅") ? "#44cc88" : "rgba(180,210,240,.8)", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.6 }}>
                    {output}
                  </pre>
                </div>
              )}
            </div>

            {/* Expected output hint */}
            {step.expectedOutput && (
              <div style={{ padding: "12px 16px", background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.06)", borderRadius: "8px" }}>
                <div style={{ fontSize: "9px", letterSpacing: ".08em", color: "rgba(180,210,240,.3)", marginBottom: "6px" }}>
                  {locale === "fr" ? "SORTIE ATTENDUE" : "EXPECTED OUTPUT"}
                </div>
                <pre style={{ margin: 0, fontSize: "11px", color: "rgba(180,210,240,.5)", lineHeight: 1.6 }}>
                  {step.expectedOutput}
                </pre>
              </div>
            )}

            {/* Navigation buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                style={{ padding: "10px 20px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "8px", color: currentStep === 0 ? "rgba(180,210,240,.2)" : "rgba(180,210,240,.6)", fontSize: "11px", fontFamily: "monospace", cursor: currentStep === 0 ? "not-allowed" : "pointer" }}
              >
                ← {locale === "fr" ? "Étape précédente" : "Previous step"}
              </button>

              {currentStep < steps.length - 1 ? (
                <button
                  onClick={markStepDone}
                  style={{ padding: "10px 24px", background: `${color}22`, border: `1px solid ${color}44`, borderRadius: "8px", color, fontSize: "11px", fontFamily: "monospace", cursor: "pointer", fontWeight: 600 }}
                >
                  {locale === "fr" ? "Étape suivante →" : "Next step →"}
                </button>
              ) : (
                <button
                  onClick={finishProject}
                  style={{ padding: "10px 24px", background: "rgba(68,204,136,.2)", border: "1px solid rgba(68,204,136,.4)", borderRadius: "8px", color: "#44cc88", fontSize: "11px", fontFamily: "monospace", cursor: "pointer", fontWeight: 600 }}
                >
                  {locale === "fr" ? "🎉 Terminer le projet !" : "🎉 Finish project!"}
                </button>
              )}
            </div>

            {/* Project completed banner */}
            {projectDone && (
              <div style={{ padding: "20px", background: "rgba(68,204,136,.1)", border: "1px solid rgba(68,204,136,.3)", borderRadius: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "28px", marginBottom: "8px" }}>🎉</div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#44cc88", marginBottom: "4px" }}>
                  {locale === "fr" ? "Projet terminé !" : "Project completed!"}
                </div>
                <div style={{ fontSize: "12px", color: "rgba(180,210,240,.5)", marginBottom: "16px" }}>
                  {locale === "fr"
                    ? "Excellent travail. Vous avez construit quelque chose de réel."
                    : "Excellent work. You built something real."}
                </div>
                <Link
                  href={`/${locale}/learn/${language}/projects`}
                  style={{ display: "inline-block", padding: "10px 24px", background: "rgba(68,204,136,.2)", border: "1px solid rgba(68,204,136,.4)", borderRadius: "8px", color: "#44cc88", fontSize: "12px", textDecoration: "none" }}
                >
                  {locale === "fr" ? "Voir tous les projets →" : "See all projects →"}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .project-step-content { color: rgba(180,210,240,.8); font-family: monospace; line-height: 1.8; font-size: 13px; }
        .project-step-content h1, .project-step-content h2 { font-size: 15px; font-weight: 700; color: #ddeeff; margin: 0 0 10px; }
        .project-step-content h3 { font-size: 13px; font-weight: 700; color: ${color}; margin: 14px 0 6px; }
        .project-step-content p { margin: 0 0 12px; }
        .project-step-content ul, .project-step-content ol { margin: 0 0 12px; padding-left: 20px; }
        .project-step-content li { margin-bottom: 4px; }
        .project-step-content code { background: ${color}18; border: 1px solid ${color}30; padding: 1px 6px; border-radius: 4px; font-size: 12px; color: ${color}; }
        .project-step-content pre { background: rgba(0,0,0,.4); border: 1px solid rgba(255,255,255,.08); border-radius: 8px; padding: 14px; overflow-x: auto; margin: 0 0 12px; }
        .project-step-content pre code { background: transparent; border: none; padding: 0; color: #44cc88; font-size: 12px; }
        .project-step-content strong { color: #ddeeff; font-weight: 700; }
      `}</style>
    </div>
  );
}
