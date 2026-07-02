"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useTranslations, useLocale } from "next-intl";

export default function ForgotPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot", { email });
      setSent(true);
    } catch {
      setError(tCommon("error"));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 text-4xl">📧</div>
          <h1 className="mb-2 font-mono text-2xl font-bold text-white">
            {t("checkEmail")}
          </h1>
          <p className="mb-6 font-mono text-sm text-white/40">
            {t("checkEmailMessage")}
          </p>
          <Link
            href={`/${locale}/auth/login`}
            className="font-mono text-sm text-blue-400 hover:text-blue-300"
          >
            {t("backToLogin")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="font-mono text-2xl font-bold text-white">
            {t("forgotTitle")}
          </h1>
          <p className="mt-1 font-mono text-sm text-white/40">
            {t("forgotSubtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-xs text-white/50">
              {t("email").toUpperCase()}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder-white/20 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          {error && <p className="font-mono text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-3 font-mono text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? t("sending") : t("sendResetLink")}
          </button>
        </form>

        <p className="mt-6 text-center font-mono text-sm text-white/40">
          {t("rememberPassword")}{" "}
          <Link
            href={`/${locale}/auth/login`}
            className="text-blue-400 hover:text-blue-300"
          >
            {t("login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
