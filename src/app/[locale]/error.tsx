"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      <div className="mb-2 font-mono text-xs tracking-widest text-red-400">
        SOMETHING WENT WRONG
      </div>
      <h1 className="mb-4 font-mono text-3xl font-bold text-white">
        Unexpected error
      </h1>
      <p className="mb-8 font-mono text-sm text-white/40">
        {error.message ?? "An unexpected error occurred."}
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-blue-600 px-6 py-3 font-mono text-sm font-bold text-white transition hover:bg-blue-500"
      >
        Try again
      </button>
    </div>
  );
}
