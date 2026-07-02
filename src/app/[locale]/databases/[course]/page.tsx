"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useLocale } from "next-intl";
import { api } from "@/lib/api";
import { databasesMeta } from "@/content/databases/meta";

interface DbProgress {
  lesson_slug: string;
  completed: boolean;
  quiz_score: number | null;
  quiz_total: number | null;
}

const COURSE_COLORS: Record<string, string> = {
  foundations: "#e8854d",
};

const COURSE_ICONS: Record<string, string> = {
  foundations: "🗄️",
};

export default function DatabaseCoursePage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const params = useParams();
  const locale = useLocale();
  const courseSlug = params.course as string;

  const [progress, setProgress] = useState<DbProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const track = databasesMeta.find((t) => t.trackId === courseSlug);
  const color = COURSE_COLORS[courseSlug] ?? "#e8854d";
  const icon = COURSE_ICONS[courseSlug] ?? "🗄️";

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/${locale}/auth/login`);
      return;
    }
    if (!track) {
      router.push(`/${locale}/databases`);
      return;
    }

    setLoading(false);
    api.get("/databases/progress")
      .then((res) => setProgress(res.data))
      .catch(() => {});
  }, [isAuthenticated, courseSlug]);

  const getProgress = (slug: string) =>
    progress.find((p) => p.lesson_slug === slug);

  const isUnlocked = (index: number) => {
    if (index === 0) return true;
    const prevLesson = track?.lessons[index - 1];
    if (!prevLesson) return false;
    return getProgress(prevLesson.id)?.completed === true;
  };

  if (loading || !track) {
    return (
      <div style={{ minHeight: "100vh", background: "#0d1420", padding: "32px 24px", fontFamily: "monospace" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "700px" }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ height: "72px", background: "rgba(255,255,255,.04)", borderRadius: "10px" }} />
          ))}
        </div>
      </div>
    );
  }

  const completedCount = track.lessons.filter((l) => getProgress(l.id)?.completed).length;
  const pct = track.lessons.length > 0 ? Math.round((completedCount / track.lessons.length) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0d1420", padding: "32px 24px", fontFamily: "monospace", color: "#ddeeff" }}>
      <div style={{ maxWidth: "700px" }}>
        <Link href={`/${locale}/databases`} style={{ fontSize: "11px", color: "rgba(180,210,240,.4)", textDecoration: "none", display: "inline-block", marginBottom: "24px" }}>
          ← {locale === "fr" ? "Tous les cours" : "All courses"}
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "12px", background: `${color}22`, border: `1px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", flexShrink: 0 }}>
            {icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "9px", letterSpacing: ".12em", color: `${color}99`, marginBottom: "4px" }}>
              {locale === "fr" ? "COURS" : "COURSE"}
            </div>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#ddeeff", margin: "0 0 8px" }}>
              {track.track}
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,.06)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: "2px", transition: "width .4s" }} />
              </div>
              <span style={{ fontSize: "10px", color: "rgba(180,210,240,.4)" }}>
                {completedCount}/{track.lessons.length} {locale === "fr" ? "terminées" : "completed"}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {track.lessons.map((lesson, i) => {
            const prog = getProgress(lesson.id);
            const unlocked = isUnlocked(i);
            const completed = prog?.completed === true;
            const score = prog?.quiz_score;
            const total = prog?.quiz_total;

            return (
              <div key={lesson.id} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px", background: completed ? `${color}11` : "rgba(255,255,255,.025)", border: `1px solid ${completed ? `${color}33` : "rgba(255,255,255,.06)"}`, borderRadius: "10px", opacity: unlocked ? 1 : 0.4 }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: completed ? `${color}33` : "rgba(255,255,255,.06)", border: `1px solid ${completed ? color : "rgba(255,255,255,.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", flexShrink: 0 }}>
                  {completed ? "✓" : unlocked ? `${i + 1}` : "🔒"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", color: unlocked ? "#ddeeff" : "rgba(180,210,240,.4)", fontWeight: completed ? 600 : 400 }}>
                    {lesson.title}
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "3px" }}>
                    <span style={{ fontSize: "9px", color: "rgba(91,155,213,.6)" }}>
                      📝 Quiz
                    </span>
                    {score !== null && score !== undefined && total && (
                      <span style={{ fontSize: "9px", color: "rgba(180,210,240,.4)" }}>
                        {score}/{total} ({Math.round((score / total) * 100)}%)
                      </span>
                    )}
                  </div>
                </div>
                {unlocked && (
                  <Link href={`/${locale}/databases/${courseSlug}/${lesson.id}`} style={{ padding: "6px 14px", background: completed ? "rgba(255,255,255,.05)" : `${color}22`, border: `1px solid ${completed ? "rgba(255,255,255,.1)" : `${color}44`}`, borderRadius: "6px", color: completed ? "rgba(180,210,240,.5)" : color, fontSize: "10px", textDecoration: "none", flexShrink: 0 }}>
                    {completed ? (locale === "fr" ? "Revoir" : "Review") : (locale === "fr" ? "Commencer →" : "Start →")}
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
