import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      <div className="mb-2 font-mono text-xs tracking-widest text-white/30">
        404
      </div>
      <h1 className="mb-4 font-mono text-4xl font-bold text-white">
        Page not found
      </h1>
      <p className="mb-8 font-mono text-sm text-white/40">
        The page you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="rounded-md bg-blue-600 px-6 py-3 font-mono text-sm font-bold text-white transition hover:bg-blue-500"
      >
        Go home →
      </Link>
    </div>
  );
}
