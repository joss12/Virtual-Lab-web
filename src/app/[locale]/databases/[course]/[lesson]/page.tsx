"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuthStore } from "@/store/useAuthStore";
import { useLocale } from "next-intl";
import { api } from "@/lib/api";
import { databasesContent } from "@/content/databases";

const COURSE_COLORS: Record<string, string> = {
  foundations: "#e8854d",
};

type Tab = "lesson" | "quiz" | "solution";

export default function DatabaseLessonPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const courseSlug = params.course as string;
  const lessonSlug = params.lesson as string;
  const color = COURSE_COLORS[courseSlug] ?? "#e8854d";

  const [tab, setTab] = useState<Tab>("lesson");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);
  const [progressSaved, setProgressSaved] = useState(false);

  const track = databasesContent.find((t) => t.trackId === courseSlug);
  const lessonData = track?.lessons.find((l) => l.id === lessonSlug);
  const allLessons = track?.lessons ?? [];
  const currentIndex = allLessons.findIndex((l) => l.id === lessonSlug);
  const nextLesson = allLessons[currentIndex + 1] ?? null;
  const prevLesson = allLessons[currentIndex - 1] ?? null;

  const lessonContent = lessonData?.content[locale as "en" | "fr"] ?? lessonData?.content.en ?? "";
  const quizQuestions = lessonData?.quiz[locale as "en" | "fr"] ?? lessonData?.quiz.en ?? [];

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }
    if (!lessonData) {
      router.push(`/${locale}/databases/${courseSlug}`);
      return;
    }

    api.get("/databases/progress")
      .then((res) => {
        const prog = res.data.find((p: any) => p.lesson_slug === lessonSlug);
        if (prog?.quiz_score !== null && prog?.quiz_score !== undefined) {
          setSubmitted(true);
          setScore(prog.quiz_score);
          setQuizPassed(prog.quiz_score / (prog.quiz_total ?? 1) >= 0.75);
          setProgressSaved(true);
        }
      })
      .catch(() => {});
  }, [isAuthenticated, lessonSlug]);

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

    await api.post("/databases/progress", {
      lesson_slug: lessonSlug,
      completed: passed,
      quiz_score: correct,
      quiz_total: quizQuestions.length,
    }).catch(() => {});

    setProgressSaved(true);
  };

  if (!lessonData) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d1420", padding: "32px 24px", fontFamily: "monospace" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "800px" }}>
          {[120, 300, 200, 100].map((h, i) => (
            <div key={i} style={{ height: `${h}px`, background: "rgba(255,255,255,.04)", borderRadius: "12px" }} />
          ))}
        </div>
      </div>
    );
  }

  const pct = submitted ? Math.round((score / quizQuestions.length) * 100) : null;

  return (
    <div style={{ minHeight: "100vh", background: "#0d1420", padding: "32px 24px", fontFamily: "monospace", color: "#ddeeff" }}>
      <div style={{ maxWidth: "800px" }}>
        <Link href={`/${locale}/databases/${courseSlug}`} style={{ fontSize: "11px", color: "rgba(180,210,240,.4)", textDecoration: "none", display: "inline-block", marginBottom: "24px" }}>
          ← {locale === "fr" ? "Retour au cours" : "Back to course"}
        </Link>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontSize: "9px", letterSpacing: ".12em", color: `${color}99`, marginBottom: "6px" }}>
            {locale === "fr" ? `LEÇON ${currentIndex + 1}` : `LESSON ${currentIndex + 1}`}
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#ddeeff", margin: "0 0 12px" }}>
            {lessonData.title}
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
          {(["lesson", "quiz", "solution"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 20px", fontFamily: "monospace", fontSize: "11px", cursor: "pointer", border: "none", background: "transparent", color: tab === t ? color : "rgba(180,210,240,.4)", borderBottom: `2px solid ${tab === t ? color : "transparent"}`, marginBottom: "-1px" }}>
              {t === "lesson" ? (locale === "fr" ? "📖 Leçon" : "📖 Lesson") : t === "quiz" ? "📝 Quiz" : (locale === "fr" ? "✅ Solution" : "✅ Solution")}
            </button>
          ))}
        </div>

        {/* Lesson tab */}
        {tab === "lesson" && (
          <div>
            <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "12px", padding: "32px" }}>
              <div className="db-lesson-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{lessonContent}</ReactMarkdown>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "24px" }}>
              {prevLesson ? (
                <Link href={`/${locale}/databases/${courseSlug}/${prevLesson.id}`} style={{ padding: "10px 20px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "8px", color: "rgba(180,210,240,.6)", fontSize: "11px", textDecoration: "none" }}>
                  ← {locale === "fr" ? "Leçon précédente" : "Previous lesson"}
                </Link>
              ) : <div />}
              <button onClick={() => setTab("quiz")} style={{ padding: "10px 20px", background: `${color}22`, border: `1px solid ${color}44`, borderRadius: "8px", color, fontSize: "11px", fontFamily: "monospace", cursor: "pointer" }}>
                {locale === "fr" ? "Passer le quiz →" : "Take the quiz →"}
              </button>
            </div>
          </div>
        )}

        {/* Quiz tab */}
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
                            <button key={j} onClick={() => !submitted && setAnswers((prev) => ({ ...prev, [i]: j }))} style={{ padding: "10px 14px", background: isAnswer ? "rgba(68,204,136,.15)" : isWrongSelected ? "rgba(255,102,34,.15)" : isSelected ? `${color}22` : "rgba(255,255,255,.03)", border: `1px solid ${isAnswer ? "rgba(68,204,136,.4)" : isWrongSelected ? "rgba(255,102,34,.4)" : isSelected ? `${color}44` : "rgba(255,255,255,.08)"}`, borderRadius: "6px", color: isAnswer ? "#44cc88" : isWrongSelected ? "#ff6622" : isSelected ? color : "rgba(180,210,240,.7)", fontSize: "12px", fontFamily: "monospace", textAlign: "left", cursor: submitted ? "default" : "pointer" }}>
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
                      <Link href={`/${locale}/databases/${courseSlug}/${nextLesson.id}`} style={{ display: "inline-block", padding: "10px 24px", background: "rgba(68,204,136,.2)", border: "1px solid rgba(68,204,136,.4)", borderRadius: "8px", color: "#44cc88", fontSize: "12px", textDecoration: "none" }}>
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
                  <button onClick={handleSubmitQuiz} disabled={Object.keys(answers).length < quizQuestions.length} style={{ padding: "12px", background: Object.keys(answers).length < quizQuestions.length ? "rgba(255,255,255,.05)" : `${color}22`, border: `1px solid ${Object.keys(answers).length < quizQuestions.length ? "rgba(255,255,255,.1)" : `${color}44`}`, borderRadius: "8px", color: Object.keys(answers).length < quizQuestions.length ? "rgba(180,210,240,.3)" : color, fontSize: "12px", fontFamily: "monospace", cursor: Object.keys(answers).length < quizQuestions.length ? "not-allowed" : "pointer" }}>
                    {locale === "fr" ? `Soumettre (${Object.keys(answers).length}/${quizQuestions.length} répondues)` : `Submit (${Object.keys(answers).length}/${quizQuestions.length} answered)`}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Solution tab */}
        {tab === "solution" && (
          <div style={{ background: "rgba(255,255,255,.02)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "12px", padding: "32px" }}>
            <div style={{ marginBottom: "20px", padding: "12px 16px", background: "rgba(68,204,136,.08)", border: "1px solid rgba(68,204,136,.2)", borderRadius: "8px" }}>
              <p style={{ fontSize: "12px", color: "rgba(68,204,136,.8)", margin: 0 }}>
                {locale === "fr" ? "💡 Les solutions sont toujours disponibles. L'objectif est d'apprendre, pas de mémoriser." : "💡 Solutions are always available. The goal is learning, not memorization."}
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {quizQuestions.map((q: any, i: number) => (
                <div key={i} style={{ background: "rgba(68,204,136,.05)", border: "1px solid rgba(68,204,136,.15)", borderRadius: "8px", padding: "16px" }}>
                  <div style={{ fontSize: "12px", color: "#ddeeff", marginBottom: "10px", lineHeight: 1.6 }}>
                    <span style={{ color: `${color}99`, marginRight: "8px" }}>{i + 1}.</span>
                    {q.question}
                  </div>
                  <div style={{ fontSize: "12px", color: "#44cc88" }}>✓ {q.options[q.correct]}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .db-lesson-content { color: #ddeeff; font-family: monospace; line-height: 1.8; font-size: 13px; }
        .db-lesson-content h1 { font-size: 22px; font-weight: 700; color: #ddeeff; margin: 0 0 20px; border-bottom: 1px solid rgba(255,255,255,.07); padding-bottom: 12px; }
        .db-lesson-content h2 { font-size: 16px; font-weight: 700; color: #ddeeff; margin: 28px 0 12px; }
        .db-lesson-content h3 { font-size: 13px; font-weight: 700; color: ${color}; margin: 20px 0 8px; }
        .db-lesson-content p { margin: 0 0 14px; color: rgba(180,210,240,.8); }
        .db-lesson-content ul, .db-lesson-content ol { margin: 0 0 14px; padding-left: 20px; color: rgba(180,210,240,.8); }
        .db-lesson-content li { margin-bottom: 6px; }
        .db-lesson-content code { background: rgba(232,133,77,.15); border: 1px solid rgba(232,133,77,.2); padding: 1px 6px; border-radius: 4px; font-size: 12px; color: #e8854d; }
        .db-lesson-content pre { background: rgba(0,0,0,.4); border: 1px solid rgba(255,255,255,.08); border-radius: 8px; padding: 16px; overflow-x: auto; margin: 0 0 14px; }
        .db-lesson-content pre code { background: transparent; border: none; padding: 0; color: #44cc88; font-size: 12px; }
        .db-lesson-content strong { color: #ddeeff; font-weight: 700; }
        .db-lesson-content table { width: 100%; border-collapse: collapse; margin: 0 0 14px; font-size: 12px; }
        .db-lesson-content th { background: rgba(232,133,77,.1); border: 1px solid rgba(255,255,255,.08); padding: 8px 12px; color: #e8854d; text-align: left; }
        .db-lesson-content td { border: 1px solid rgba(255,255,255,.06); padding: 8px 12px; color: rgba(180,210,240,.7); }
        .db-lesson-content blockquote { border-left: 3px solid ${color}; margin: 0 0 14px; padding: 8px 16px; background: rgba(232,133,77,.05); color: rgba(180,210,240,.7); }
      `}</style>
    </div>
  );
}
