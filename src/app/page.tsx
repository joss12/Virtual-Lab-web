import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      <div className="mb-6 font-mono text-xs tracking-widest text-blue-400">
        VIRTUAL COMPUTER LAB
      </div>

      <h1 className="mb-4 font-mono text-5xl font-bold text-white">
        Learn hardware.
        <br />
        No degree needed.
      </h1>

      <p className="mb-10 max-w-xl font-mono text-sm leading-relaxed text-white/40">
        Interactive 3D models, deep study guides for every component, real-time
        data flow visualization, and quizzes to test your knowledge.
      </p>

      <div className="flex gap-4">
        <Link
          href="/study"
          className="rounded-md bg-blue-600 px-6 py-3 font-mono text-sm font-bold text-white transition hover:bg-blue-500"
        >
          Start studying →
        </Link>
        <Link
          href="/auth/register"
          className="rounded-md border border-white/20 px-6 py-3 font-mono text-sm text-white/60 transition hover:border-white/60 hover:text-white"
        >
          Create account
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            title: "10 components",
            desc: "Keyboard to GPU — every part of your PC explained",
          },
          {
            title: "3D Lab",
            desc: "Interactive motherboard with data flow and power visualization",
          },
          {
            title: "Quiz mode",
            desc: "15 questions to test what you've learned",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-lg border border-white/10 bg-white/5 p-6 text-left"
          >
            <div className="mb-2 font-mono text-sm font-bold text-blue-400">
              {f.title}
            </div>
            <div className="font-mono text-xs text-white/40">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
