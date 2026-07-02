"use client";

import { useEffect, useRef, useState } from "react";

type Lang = "en" | "fr";

type Card = {
  id: number;
  value: string;
  flipped: boolean;
  matched: boolean;
};

type RamRun = {
  moves: number;
  time: number;
};

const SYMBOLS = ["💾", "🧠", "⚡", "📦", "🔁", "🧩"];

const BEST_KEY = "vlab_ram_best";
const HISTORY_KEY = "vlab_ram_history";

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

function createBoard(): Card[] {
  return shuffle([...SYMBOLS, ...SYMBOLS]).map((value, i) => ({
    id: i,
    value,
    flipped: false,
    matched: false,
  }));
}

function isBetterRun(next: RamRun, current: RamRun | null): boolean {
  if (!current) return true;
  if (next.moves < current.moves) return true;
  return next.moves === current.moves && next.time < current.time;
}

function loadBest(): RamRun | null {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    return raw ? (JSON.parse(raw) as RamRun) : null;
  } catch {
    return null;
  }
}

function loadHistory(): RamRun[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
  } catch {
    return [];
  }
}

export default function RamGame({ lang = "en" }: { lang?: Lang }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [first, setFirst] = useState<Card | null>(null);
  const [second, setSecond] = useState<Card | null>(null);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [best, setBest] = useState<RamRun | null>(null);
  const [history, setHistory] = useState<RamRun[]>([]);

  const hasSavedRunRef = useRef(false);

  useEffect(() => {
    setCards(createBoard());
    setBest(loadBest());
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    if (!started || finished) return;

    const timer = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [started, finished]);

  useEffect(() => {
    if (!first || !second) return;

    setMoves((m) => m + 1);

    if (first.value === second.value) {
      setCards((prev) =>
        prev.map((card) =>
          card.value === first.value ? { ...card, matched: true } : card,
        ),
      );
      setFirst(null);
      setSecond(null);
      return;
    }

    const timeout = setTimeout(() => {
      setCards((prev) =>
        prev.map((card) =>
          card.id === first.id || card.id === second.id
            ? { ...card, flipped: false }
            : card,
        ),
      );
      setFirst(null);
      setSecond(null);
    }, 700);

    return () => clearTimeout(timeout);
  }, [first, second]);

  useEffect(() => {
    if (cards.length === 0) return;
    if (!cards.every((card) => card.matched)) return;

    setFinished(true);
  }, [cards]);

  useEffect(() => {
    if (!finished || hasSavedRunRef.current) return;

    hasSavedRunRef.current = true;

    const run: RamRun = {
      moves,
      time,
    };

    setBest((prev) => {
      if (!isBetterRun(run, prev)) return prev;

      localStorage.setItem(BEST_KEY, JSON.stringify(run));
      return run;
    });

    setHistory((prev) => {
      const updated = [run, ...prev].slice(0, 5);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [finished, moves, time]);

  const handleClick = (card: Card) => {
    if (card.flipped || card.matched || second || finished) return;

    if (!started) setStarted(true);

    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, flipped: true } : c)),
    );

    if (!first) {
      setFirst(card);
    } else {
      setSecond(card);
    }
  };

  const restart = () => {
    setCards(createBoard());
    setFirst(null);
    setSecond(null);
    setMoves(0);
    setTime(0);
    setStarted(false);
    setFinished(false);
    hasSavedRunRef.current = false;
  };

  const resetStats = () => {
    const ok = confirm(
      lang === "fr"
        ? "Réinitialiser les statistiques RAM ?"
        : "Reset RAM stats?",
    );

    if (!ok) return;

    localStorage.removeItem(BEST_KEY);
    localStorage.removeItem(HISTORY_KEY);
    setBest(null);
    setHistory([]);
  };

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
        {lang === "fr" ? "Jeu de mémoire RAM" : "RAM Memory Game"}
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
          ? "Associez les paires comme des blocs de mémoire"
          : "Match pairs like memory blocks"}
      </div>

      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "14px",
          fontFamily: "monospace",
          fontSize: "12px",
          color: "rgba(255,255,255,.75)",
        }}
      >
        <span>
          {lang === "fr" ? "Coups" : "Moves"}: {moves}
        </span>
        <span>
          {lang === "fr" ? "Temps" : "Time"}: {time}s
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(58px, 72px))",
          gap: "10px",
        }}
      >
        {cards.map((card) => {
          const visible = card.flipped || card.matched;

          return (
            <button
              key={card.id}
              onClick={() => handleClick(card)}
              style={{
                height: "70px",
                borderRadius: "10px",
                border: card.matched
                  ? "1px solid rgba(68,204,136,.45)"
                  : "1px solid rgba(255,255,255,.12)",
                background: visible
                  ? card.matched
                    ? "rgba(68,204,136,.18)"
                    : "rgba(91,155,213,.18)"
                  : "rgba(0,0,0,.35)",
                color: "#ddeeff",
                fontSize: "24px",
                cursor: visible || second ? "default" : "pointer",
                fontFamily: "monospace",
                transition: "all .2s",
              }}
            >
              {visible ? card.value : "?"}
            </button>
          );
        })}
      </div>

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
          <div style={{ fontWeight: 700, marginBottom: "6px" }}>
            🔥 {lang === "fr" ? "Terminé" : "Completed"}
          </div>
          <div>
            {lang === "fr" ? "Coups" : "Moves"}: {moves}
          </div>
          <div>
            {lang === "fr" ? "Temps" : "Time"}: {time}s
          </div>

          <button
            onClick={restart}
            style={{
              marginTop: "10px",
              padding: "7px 11px",
              borderRadius: "6px",
              border: "1px solid rgba(91,155,213,.35)",
              background: "rgba(91,155,213,.12)",
              color: "#7ab3e8",
              cursor: "pointer",
              fontFamily: "monospace",
              fontSize: "12px",
            }}
          >
            {lang === "fr" ? "Recommencer" : "Restart"}
          </button>
        </div>
      )}

      <div
        style={{
          marginTop: "16px",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid rgba(91,155,213,.16)",
          background: "rgba(91,155,213,.06)",
          fontFamily: "monospace",
          fontSize: "12px",
          color: "rgba(255,255,255,.8)",
        }}
      >
        <div style={{ color: "#7ab3e8", fontWeight: 700, marginBottom: "8px" }}>
          {lang === "fr" ? "Statistiques" : "Stats"}
        </div>

        <div>
          {lang === "fr" ? "Meilleur" : "Best"}:{" "}
          {best
            ? `${best.moves} ${lang === "fr" ? "coups" : "moves"} · ${best.time}s`
            : "—"}
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
              {run.moves} {lang === "fr" ? "coups" : "moves"} · {run.time}s
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
  );
}
