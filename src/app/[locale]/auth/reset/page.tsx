"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useTranslations, useLocale } from "next-intl";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError(t("passwordMin"));
      return;
    }
    if (password !== confirm) {
      setError(t("passwordMismatch"));
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset", { token, new_password: password });
      setSuccess(true);
      setTimeout(() => router.push(`/${locale}/auth/login`), 3000);
    } catch (e: any) {
      setError(e?.response?.data?.error ?? t("invalidOrExpired"));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-md text-center">
          <h1 className="mb-2 font-mono text-2xl font-bold text-white">
            {t("invalidLink")}
          </h1>
          <p className="mb-6 font-mono text-sm text-white/40">
            {t("invalidLinkMessage")}
          </p>
          <Link
            href={`/${locale}/auth/forgot`}
            className="font-mono text-sm text-blue-400 hover:text-blue-300"
          >
            {t("requestNewLink")}
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="w-full max-w-md text-center">
          <div className="mb-4 text-4xl">✅</div>
          <h1 className="mb-2 font-mono text-2xl font-bold text-white">
            {t("resetSuccess")}
          </h1>
          <p className="font-mono text-sm text-white/40">
            {t("resetRedirecting")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <h1 className="font-mono text-2xl font-bold text-white">
            {t("resetTitle")}
          </h1>
          <p className="mt-1 font-mono text-sm text-white/40">
            {t("resetSubtitle")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block font-mono text-xs text-white/50">
              {t("newPassword").toUpperCase()}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder-white/20 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="min. 8 characters"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-mono text-xs text-white/50">
              {t("confirmPassword").toUpperCase()}
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white placeholder-white/20 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="font-mono text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-blue-600 px-4 py-3 font-mono text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? t("resetting") : t("resetPassword")}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}
