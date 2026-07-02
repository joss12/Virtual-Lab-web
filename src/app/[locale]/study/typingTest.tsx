"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const WORDS = [
  "keyboard",
  "switch",
  "typing",
  "monitor",
  "memory",
  "signal",
  "input",
  "system",
  "network",
  "window",
  "layout",
  "device",
  "digital",
  "cursor",
  "command",
  "screen",
  "processor",
  "circuit",
  "computer",
  "hardware",
  "software",
  "response",
  "matrix",
  "driver",
  "language",
  "function",
  "performance",
  "accuracy",
  "practice",
  "engine",
  "module",
  "logic",
  "interface",
  "output",
  "storage",
  "motherboard",
  "thread",
  "buffer",
  "latency",
  "time",
  "people",
  "year",
  "way",
  "day",
  "thing",
  "world",
  "life",
  "place",
  "work",
  "week",
  "case",
  "point",
  "company",
  "number",
  "group",
  "problem",
  "fact",
  "make",
  "go",
  "know",
  "take",
  "see",
  "come",
  "think",
  "look",
  "want",
  "give",
  "use",
  "find",
  "tell",
  "ask",
  "seem",
  "feel",
  "try",
  "leave",
  "call",
  "different",
  "important",
  "development",
  "experience",
  "information",
  "understanding",
  "application",
  "architecture",
  "interaction",
  "component",
  "structure",
  "execution",
  "environment",
  "efficiency",
  "optimization",
  "configuration",
  "implementation",
  "responsiveness",
  "communication",
  "visualization",
  "initialization",
  "compatibility",
  "responsibility",
  "characteristic",
  "interpretation",
];

const QUOTES = [
  "Typing is not only speed but rhythm accuracy and control.",
  "A good keyboard teaches your fingers to trust the machine.",
  "Practice every day and your hands will learn what your mind already knows.",
  "Fast typing comes from calm repetition not from rushing.",
  "The best interface disappears and lets your thoughts move freely.",
  "Precision matters more than noise when building real skill.",
  "Small daily improvements become serious ability over time.",
  "Consistency is what turns practice into performance.",
];

type Lang = "en" | "fr";
type Mode = "words" | "quotes";
type BestScore = {
  wpm: number;
  accuracy: number;
};

type BestScores = {
  15: BestScore;
  30: BestScore;
  60: BestScore;
};

type HistoryEntry = {
  duration: 15 | 30 | 60;
  mode: Mode;
  wpm: number;
  accuracy: number;
};

const STORAGE_KEY = "vlab_typing_best_scores";
const HISTORY_KEY = "vlab_typing_history";

const EMPTY_BEST_SCORES: BestScores = {
  15: { wpm: 0, accuracy: 0 },
  30: { wpm: 0, accuracy: 0 },
  60: { wpm: 0, accuracy: 0 },
};

function generateWords(count = 80): string[] {
  return Array.from(
    { length: count },
    () => WORDS[Math.floor(Math.random() * WORDS.length)],
  );
}

function generateQuoteWords(): string[] {
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  return quote.split(" ");
}

function refillWords(mode: Mode): string[] {
  if (mode === "quotes") return generateQuoteWords();
  return generateWords();
}

function initialWords(count = 60): string[] {
  return Array.from({ length: count }, (_, i) => WORDS[i % WORDS.length]);
}

function loadBestScores(): BestScores {
  if (typeof window === "undefined") return EMPTY_BEST_SCORES;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_BEST_SCORES;

    const parsed = JSON.parse(raw);

    return {
      15: {
        wpm: Number(parsed?.[15]?.wpm ?? 0),
        accuracy: Number(parsed?.[15]?.accuracy ?? 0),
      },
      30: {
        wpm: Number(parsed?.[30]?.wpm ?? 0),
        accuracy: Number(parsed?.[30]?.accuracy ?? 0),
      },
      60: {
        wpm: Number(parsed?.[60]?.wpm ?? 0),
        accuracy: Number(parsed?.[60]?.accuracy ?? 0),
      },
    };
  } catch {
    return EMPTY_BEST_SCORES;
  }
}

function saveBestScores(scores: BestScores) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.slice(0, 8).map((item) => ({
      duration: item?.duration,
      mode: item?.mode,
      wpm: Number(item?.wpm ?? 0),
      accuracy: Number(item?.accuracy ?? 0),
    })) as HistoryEntry[];
  } catch {
    return [];
  }
}

function saveHistory(history: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function makeWordsForMode(mode: Mode): string[] {
  if (mode === "quotes") return generateQuoteWords();
  return generateWords();
}

function modeLabel(mode: Mode, lang: Lang) {
  if (lang === "fr") {
    if (mode === "words") return "mots";
    if (mode === "quotes") return "phrases";
  }
  return mode;
}

export default function TypingTest({ lang = "en" }: { lang?: Lang }) {
  const [duration, setDuration] = useState<15 | 30 | 60>(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [mode, setMode] = useState<Mode>("words");
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [words, setWords] = useState<string[]>(initialWords);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");

  const [correctChars, setCorrectChars] = useState(0);
  const [typedChars, setTypedChars] = useState(0);

  const [bestScores, setBestScores] = useState<BestScores>(EMPTY_BEST_SCORES);
  const [isNewBest, setIsNewBest] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const hasSavedResultRef = useRef(false);

  const currentWord = words[currentIndex] ?? "";

  useEffect(() => {
    setMounted(true);
    setWords(makeWordsForMode("words"));
    setBestScores(loadBestScores());
    setHistory(loadHistory());
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!started || finished) return;

    if (timeLeft <= 0) {
      setFinished(true);
      setStarted(false);
      setInput("");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [started, finished, timeLeft]);

  const elapsedSeconds = duration - timeLeft;

  const wpm = useMemo(() => {
    const minutes = elapsedSeconds / 60;
    if (minutes <= 0) return 0;
    return Math.round(correctChars / 5 / minutes);
  }, [correctChars, elapsedSeconds]);

  const accuracy = useMemo(() => {
    const liveTypedChars = typedChars + input.length;
    if (liveTypedChars === 0) return 100;

    let liveCorrect = correctChars;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === currentWord[i]) {
        liveCorrect++;
      }
    }

    return Math.max(0, Math.round((liveCorrect / liveTypedChars) * 100));
  }, [typedChars, input, correctChars, currentWord]);

  useEffect(() => {
    if (!finished || !mounted || hasSavedResultRef.current) return;

    hasSavedResultRef.current = true;

    const newEntry: HistoryEntry = {
      duration,
      mode,
      wpm,
      accuracy,
    };

    setHistory((prev) => {
      const updatedHistory = [newEntry, ...prev].slice(0, 8);
      saveHistory(updatedHistory);
      return updatedHistory;
    });

    setBestScores((prev) => {
      const currentBest = prev[duration];
      const isBetter =
        wpm > currentBest.wpm ||
        (wpm === currentBest.wpm && accuracy > currentBest.accuracy);

      if (!isBetter) {
        setIsNewBest(false);
        return prev;
      }

      const updated: BestScores = {
        ...prev,
        [duration]: { wpm, accuracy },
      };

      saveBestScores(updated);
      setIsNewBest(true);
      return updated;
    });
  }, [finished, mounted, duration, mode, wpm, accuracy]);

  const restart = (nextDuration = duration, nextMode = mode) => {
    setDuration(nextDuration);
    setTimeLeft(nextDuration);
    setMode(nextMode);
    setStarted(false);
    setFinished(false);
    setWords(makeWordsForMode(nextMode));
    setCurrentIndex(0);
    setInput("");
    setCorrectChars(0);
    setTypedChars(0);
    setIsNewBest(false);
    hasSavedResultRef.current = false;

    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const handleDurationChange = (value: 15 | 30 | 60) => {
    restart(value, mode);
  };

  const handleModeChange = (value: Mode) => {
    restart(duration, value);
  };

  const handleChange = (value: string) => {
    if (finished) return;

    if (!started && value.length > 0) {
      setStarted(true);
    }

    // ✅ NORMAL TYPING (this was missing!)
    if (!value.endsWith(" ")) {
      setInput(value);
      return;
    }

    // ✅ WORD COMPLETION
    const typedWord = value.trim();
    const targetWord = currentWord;

    let wordCorrectChars = 0;
    const maxLen = Math.max(typedWord.length, targetWord.length);

    for (let i = 0; i < maxLen; i++) {
      if (typedWord[i] === targetWord[i]) {
        wordCorrectChars++;
      }
    }
    setCorrectChars((prev) => prev + wordCorrectChars);
    setTypedChars((prev) => prev + typedWord.length);

    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + 1;

      // words mode refill
      if (mode === "words" && nextIndex + 20 >= words.length) {
        setWords((prevWords) => [...prevWords, ...generateWords(30)]);
      }

      // quotes mode refill
      if (mode === "quotes" && nextIndex >= words.length - 2) {
        setWords((prevWords) => [...prevWords, ...generateQuoteWords()]);
      }

      return nextIndex;
    });

    setInput("");
  };

  const visibleWords =
    mode === "words"
      ? words.slice(currentIndex, currentIndex + 20)
      : words.slice(currentIndex);

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
        {lang === "fr" ? "Test de frappe" : "Typing Test"}
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
          ? "Entraînez votre vitesse et votre précision"
          : "Practice your speed and accuracy"}
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "10px",
        }}
      >
        {(["words", "quotes"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "11px",
              cursor: "pointer",
              border:
                mode === m
                  ? "1px solid #5b9bd5"
                  : "1px solid rgba(255,255,255,.15)",
              background: mode === m ? "rgba(91,155,213,.18)" : "transparent",
              color: mode === m ? "#5b9bd5" : "rgba(255,255,255,.7)",
            }}
          >
            {modeLabel(m, lang)}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "14px",
        }}
      >
        {[15, 30, 60].map((sec) => (
          <button
            key={sec}
            onClick={() => handleDurationChange(sec as 15 | 30 | 60)}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              fontFamily: "monospace",
              fontSize: "11px",
              cursor: "pointer",
              border:
                duration === sec
                  ? "1px solid #5b9bd5"
                  : "1px solid rgba(255,255,255,.15)",
              background:
                duration === sec ? "rgba(91,155,213,.18)" : "transparent",
              color: duration === sec ? "#5b9bd5" : "rgba(255,255,255,.7)",
            }}
          >
            {sec}s
          </button>
        ))}

        <button
          onClick={() => restart()}
          style={{
            padding: "6px 10px",
            borderRadius: "6px",
            fontFamily: "monospace",
            fontSize: "11px",
            cursor: "pointer",
            border: "1px solid rgba(255,255,255,.15)",
            background: "transparent",
            color: "rgba(255,255,255,.7)",
          }}
        >
          {lang === "fr" ? "Recommencer" : "Restart"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "14px",
          fontFamily: "monospace",
          fontSize: "12px",
          color: "rgba(255,255,255,.75)",
        }}
      >
        <span>
          {lang === "fr" ? "Temps" : "Time"}: {timeLeft}s
        </span>
        <span>WPM: {wpm}</span>
        <span>
          {lang === "fr" ? "Précision" : "Accuracy"}: {accuracy}%
        </span>
      </div>

      <div
        style={{
          padding: "14px",
          borderRadius: "10px",
          background: "rgba(0,0,0,.28)",
          border: "1px solid rgba(255,255,255,.08)",
          marginBottom: "12px",
          lineHeight: 1.9,
          fontFamily: "monospace",
          fontSize: "18px",
          minHeight: "110px",
          color: "rgba(255,255,255,.45)",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
          whiteSpace: mode === "words" ? "normal" : "pre-wrap",
        }}
      >
        {visibleWords.map((word, i) => {
          const isCurrent = i === 0;

          return (
            <span
              key={`${word}-${i}-${currentIndex}`}
              style={{ marginRight: "10px" }}
            >
              {word.split("").map((char, charIndex) => {
                let color = "rgba(255,255,255,.45)";

                if (isCurrent) {
                  if (charIndex < input.length) {
                    color = input[charIndex] === char ? "#ffffff" : "#ff6b6b";
                  } else if (charIndex === input.length) {
                    color = "#5b9bd5";
                  }
                }

                return (
                  <span key={charIndex} style={{ color }}>
                    {char}
                  </span>
                );
              })}
            </span>
          );
        })}
      </div>

      <input
        ref={inputRef}
        value={input}
        onChange={(e) => handleChange(e.target.value)}
        disabled={finished || !mounted}
        placeholder={lang === "fr" ? "Commencez à taper..." : "Start typing..."}
        style={{
          width: "100%",
          padding: "12px 14px",
          borderRadius: "8px",
          border: "1px solid rgba(91,155,213,.25)",
          background: finished
            ? "rgba(255,255,255,.03)"
            : "rgba(255,255,255,.05)",
          color: finished ? "rgba(221,238,255,.45)" : "#ddeeff",
          fontFamily: "monospace",
          fontSize: "14px",
          outline: "none",
          boxSizing: "border-box",
        }}
      />

      {finished && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            borderRadius: "8px",
            background: "rgba(68,204,136,.08)",
            border: "1px solid rgba(68,204,136,.2)",
            fontFamily: "monospace",
            fontSize: "12px",
            color: "#44cc88",
          }}
        >
          <div style={{ marginBottom: "6px", fontWeight: 700 }}>
            🔥 {lang === "fr" ? "Résultat" : "Result"}
          </div>
          <div>
            {lang === "fr" ? "Mode" : "Mode"}: {modeLabel(mode, lang)}
          </div>
          <div>WPM: {wpm}</div>
          <div>
            {lang === "fr" ? "Précision" : "Accuracy"}: {accuracy}%
          </div>
          <div>
            {lang === "fr" ? "Caractères corrects" : "Correct chars"}:{" "}
            {correctChars}
          </div>
          <div>
            {lang === "fr" ? "Caractères tapés" : "Typed chars"}: {typedChars}
          </div>
          {isNewBest && (
            <div
              style={{ marginTop: "8px", color: "#7ee787", fontWeight: 700 }}
            >
              {lang === "fr" ? "Nouveau meilleur score !" : "New best score!"}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          marginTop: "16px",
          padding: "12px",
          borderRadius: "8px",
          background: "rgba(91,155,213,.06)",
          border: "1px solid rgba(91,155,213,.16)",
          fontFamily: "monospace",
          fontSize: "12px",
          color: "rgba(255,255,255,.82)",
        }}
      >
        <div style={{ marginBottom: "8px", color: "#7ab3e8", fontWeight: 700 }}>
          {lang === "fr" ? "Meilleurs scores" : "Best Scores"}
        </div>

        <div style={{ display: "grid", gap: "4px" }}>
          {[15, 30, 60].map((sec) => {
            const score = bestScores[sec as 15 | 30 | 60];
            return (
              <div key={sec}>
                {sec}s: {score.wpm} WPM · {score.accuracy}%
              </div>
            );
          })}
        </div>

        <button
          onClick={() => {
            const ok = confirm(
              lang === "fr"
                ? "Réinitialiser les scores et l’historique ?"
                : "Reset all scores and history?",
            );
            if (!ok) return;

            setBestScores(EMPTY_BEST_SCORES);
            setHistory([]);
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(HISTORY_KEY);
          }}
          style={{
            marginTop: "10px",
            padding: "6px 10px",
            fontSize: "11px",
            borderRadius: "6px",
            cursor: "pointer",
            border: "1px solid rgba(255,100,100,.25)",
            background: "transparent",
            color: "rgba(255,120,120,.8)",
            fontFamily: "monospace",
          }}
        >
          {lang === "fr" ? "Réinitialiser" : "Reset scores"}
        </button>

        <div
          style={{
            marginTop: "14px",
            paddingTop: "10px",
            borderTop: "1px solid rgba(255,255,255,.08)",
          }}
        >
          <div
            style={{ marginBottom: "8px", color: "#7ab3e8", fontWeight: 700 }}
          >
            {lang === "fr" ? "Sessions récentes" : "Recent Runs"}
          </div>

          {history.length === 0 && (
            <div style={{ opacity: 0.5 }}>
              {lang === "fr" ? "Aucune session" : "No runs yet"}
            </div>
          )}

          {history.map((run, i) => (
            <div key={i}>
              {run.duration}s · {modeLabel(run.mode, lang)} · {run.wpm} WPM ·{" "}
              {run.accuracy}%
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
