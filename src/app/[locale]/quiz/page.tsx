"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuizStore } from "@/store/useQuizStore";
import { useAuthStore } from "@/store/useAuthStore";

const QUESTIONS = [
  {
    q: "What does CPU stand for?",
    a: "Central Processing Unit",
    o: [
      "Central Processing Unit",
      "Core Processing Utility",
      "Computer Program Unit",
      "Central Peripheral Unit",
    ],
    e: "CPU stands for Central Processing Unit — the primary chip that executes all program instructions in your computer.",
  },
  {
    q: "Which keyboard switch type is most common in offices?",
    a: "Membrane",
    o: ["Mechanical", "Optical", "Membrane", "Scissor switch"],
    e: "Membrane keyboards use a rubber dome under each key. They are quiet, cheap, and found in the vast majority of office environments worldwide.",
  },
  {
    q: "What does RAM stand for?",
    a: "Random Access Memory",
    o: [
      "Read Access Memory",
      "Random Access Memory",
      "Rapid Access Module",
      "Real-time Access Memory",
    ],
    e: "RAM stands for Random Access Memory — volatile memory that loses all data when power is cut. It holds everything the CPU is actively working on.",
  },
  {
    q: "Which port connector is reversible?",
    a: "USB-C",
    o: ["USB-A", "HDMI", "USB-C", "DisplayPort"],
    e: "USB-C has a symmetrical oval shape that can be inserted either way up. USB-A, HDMI, and DisplayPort all have a specific orientation.",
  },
  {
    q: "Main advantage of NVMe over SATA SSD?",
    a: "Much higher data transfer speed",
    o: [
      "Lower cost",
      "Much higher data transfer speed",
      "Less power use",
      "Better compatibility",
    ],
    e: "NVMe uses PCIe lanes directly to the CPU, reaching 7,000 MB/s on PCIe 4.0. SATA SSDs are capped at ~550 MB/s — a 13× difference.",
  },
  {
    q: "What replaced the North Bridge in modern PCs?",
    a: "Memory controller integrated into CPU",
    o: [
      "A dedicated RAM chip",
      "Memory controller integrated into CPU",
      "South Bridge expanded",
      "GPU took over memory",
    ],
    e: "Starting with Intel Nehalem (2008), the memory controller moved into the CPU die itself, eliminating the North Bridge and reducing latency significantly.",
  },
  {
    q: "Lowest latency wireless standard for gaming mice?",
    a: "2.4GHz RF dongle",
    o: ["Bluetooth 5.0", "Wi-Fi Direct", "2.4GHz RF dongle", "Infrared"],
    e: "2.4GHz RF dongles (like Logitech LIGHTSPEED) achieve ~1ms latency. Bluetooth typically runs at 8ms+ — too slow for competitive gaming.",
  },
  {
    q: "Which display panel has the best contrast ratio?",
    a: "OLED",
    o: ["TN", "IPS", "VA", "OLED"],
    e: "OLED pixels are self-emissive — each pixel generates its own light and can turn fully off. This gives infinite contrast ratio versus LCD panels which always have backlight bleed.",
  },
  {
    q: "Windows shortcut to lock the screen?",
    a: "Win + L",
    o: ["Ctrl + Alt + Del", "Win + L", "Win + D", "Alt + F4"],
    e: "Win + L instantly locks your Windows session. Win + D shows the desktop, Alt + F4 closes the active window, and Ctrl + Alt + Del opens the security screen.",
  },
  {
    q: "Which slot does a GPU use on the motherboard?",
    a: "PCIe x16",
    o: ["SATA III", "USB 3.2", "PCIe x16", "M.2 NVMe"],
    e: "GPUs use the PCIe x16 slot — 16 lanes of PCIe directly connected to the CPU. PCIe 5.0 x16 provides 128 GB/s of bandwidth in each direction.",
  },
  {
    q: "What does the VRM do on a motherboard?",
    a: "Converts 12V PSU power down to CPU voltage",
    o: [
      "Controls fan speed",
      "Converts 12V PSU power down to CPU voltage",
      "Manages USB power",
      "Stores BIOS firmware",
    ],
    e: "The VRM (Voltage Regulator Module) converts the PSU's 12V to the ~1.1V the CPU needs. It handles enormous current — up to 300A on high-end CPUs.",
  },
  {
    q: "Fastest storage technology?",
    a: "PCIe 5.0 NVMe SSD",
    o: ["7200 RPM HDD", "SATA SSD", "PCIe 3.0 NVMe", "PCIe 5.0 NVMe SSD"],
    e: "PCIe 5.0 NVMe SSDs reach 14,000 MB/s read speed. That is 70× faster than a 7200 RPM HDD (~200 MB/s) and 25× faster than a SATA SSD (~550 MB/s).",
  },
  {
    q: "What does the CMOS battery do?",
    a: "Powers BIOS settings when PC is unplugged",
    o: [
      "Charges PSU capacitors",
      "Backup power to RAM",
      "Powers BIOS settings when PC is unplugged",
      "Keeps GPU memory active",
    ],
    e: "The CR2032 coin cell battery powers a tiny CMOS SRAM chip that stores BIOS settings — date, time, boot order, XMP profiles — when the PC is unplugged.",
  },
  {
    q: "What is dual-channel RAM mode?",
    a: "Two matched sticks doubling memory bus width",
    o: [
      "Two different RAM speeds",
      "Two matched sticks doubling memory bus width",
      "Using DDR5 instead of DDR4",
      "Installing ECC RAM",
    ],
    e: "Installing two matched RAM sticks in the correct paired slots (A2+B2) doubles the memory bus from 64-bit to 128-bit, effectively doubling bandwidth for free.",
  },
  {
    q: "HDMI 2.1 supports what HDMI 2.0 does not?",
    a: "4K at 144Hz and 8K at 60Hz",
    o: [
      "Audio-only mode",
      "4K at 144Hz and 8K at 60Hz",
      "USB-C shape",
      "Display daisy-chaining",
    ],
    e: "HDMI 2.1 increased bandwidth from 18Gbps to 48Gbps, enabling 4K at 144Hz and 8K at 60Hz. HDMI 2.0 is limited to 4K at 60Hz.",
  },
];

export default function QuizPage() {
  const { isAuthenticated } = useAuthStore();
  const {
    currentIndex,
    score,
    answer,
    isDone,
    answerQuestion,
    nextQuestion,
    saveScore,
    reset,
  } = useQuizStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const current = QUESTIONS[currentIndex];
  const pct = Math.round(
    ((currentIndex + (answer ? 1 : 0)) / QUESTIONS.length) * 100,
  );

  const handleAnswer = (option: string) => {
    if (answer) return;
    answerQuestion(option, current.a);
  };

  const handleNext = () => {
    nextQuestion(QUESTIONS.length);
  };

  const handleSave = async () => {
    if (!isAuthenticated || saving || saved) return;
    setSaving(true);
    try {
      await saveScore(QUESTIONS.length);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    reset();
    setSaved(false);
  };

  if (isDone) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
        <div className="mb-2 font-mono text-xs tracking-widest text-white/30">
          QUIZ COMPLETE
        </div>
        <div className="mb-2 font-mono text-6xl font-bold text-blue-400">
          {score} / {QUESTIONS.length}
        </div>
        <p className="mb-8 font-mono text-sm text-white/40">
          {score >= 12
            ? "Outstanding — you know your hardware."
            : score >= 8
              ? "Good progress — keep studying."
              : "Keep at it — explore the study section."}
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="rounded-md border border-white/20 px-5 py-2.5 font-mono text-sm text-white/60 transition hover:border-white/60 hover:text-white"
          >
            Try again
          </button>

          {isAuthenticated ? (
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="rounded-md bg-blue-600 px-5 py-2.5 font-mono text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
            >
              {saved ? "Score saved ✓" : saving ? "Saving..." : "Save score"}
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-md border border-blue-500 px-5 py-2.5 font-mono text-sm text-blue-400 transition hover:bg-blue-500/10"
            >
              Login to save your score →
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between font-mono text-xs text-white/30">
          <span>
            Question {currentIndex + 1} of {QUESTIONS.length}
          </span>
          <span>{score} correct</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <p className="mb-8 font-mono text-xl font-bold leading-relaxed text-white">
        {current.q}
      </p>

      <div className="space-y-3">
        {current.o.map((option) => {
          let style =
            "border-white/10 bg-white/5 text-white hover:border-blue-500/50 hover:bg-blue-500/5";
          if (answer) {
            if (option === current.a)
              style = "border-green-500 bg-green-500/10 text-green-400";
            else if (option === answer)
              style = "border-red-500 bg-red-500/10 text-red-400";
            else style = "border-white/5 bg-white/5 text-white/30";
          }
          return (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className={`w-full rounded-lg border p-4 text-left font-mono text-sm transition ${style}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {answer && (
        <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
          <div className="mb-1 font-mono text-xs text-blue-400">
            explanation
          </div>
          <p className="font-mono text-sm text-white/70">{current.e}</p>
        </div>
      )}

      {answer && (
        <button
          onClick={handleNext}
          className="mt-4 w-full rounded-md bg-blue-600 py-3 font-mono text-sm font-bold text-white transition hover:bg-blue-500"
        >
          {currentIndex + 1 >= QUESTIONS.length ? "See results →" : "Next →"}
        </button>
      )}
    </div>
  );
}
