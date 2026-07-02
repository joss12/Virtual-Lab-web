"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const t = useTranslations("auth");
  const locale = useLocale();

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage(t("noToken"));
      return;
    }
    api
      .get(`/auth/verify?token=${token}`)
      .then(() => {
        setStatus("success");
        setMessage(t("verified"));
      })
      .catch((e: any) => {
        setStatus("error");
        setMessage(e?.response?.data?.error ?? t("invalidToken"));
      });
  }, [token]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1420",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "monospace",
        color: "#ddeeff",
        padding: "24px",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,.03)",
          border: "1px solid rgba(255,255,255,.07)",
          borderRadius: "12px",
          padding: "40px",
          textAlign: "center",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        {status === "loading" && (
          <p style={{ color: "rgba(180,210,240,.5)", fontSize: "13px" }}>
            {t("verifying")}
          </p>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>✓</div>
            <h1
              style={{ fontSize: "20px", fontWeight: 700, margin: "0 0 8px" }}
            >
              {message}
            </h1>
            <p
              style={{
                color: "rgba(180,210,240,.5)",
                fontSize: "12px",
                marginBottom: "24px",
              }}
            >
              {t("verifiedMessage")}
            </p>
            <Link
              href={`/${locale}/dashboard`}
              style={{
                display: "inline-block",
                padding: "10px 24px",
                background: "#2563eb",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontFamily: "monospace",
              }}
            >
              {t("goToDashboard")}
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>✗</div>
            <h1
              style={{
                fontSize: "20px",
                fontWeight: 700,
                margin: "0 0 8px",
                color: "rgba(255,120,120,.9)",
              }}
            >
              {t("verifyFailed")}
            </h1>
            <p
              style={{
                color: "rgba(180,210,240,.5)",
                fontSize: "12px",
                marginBottom: "24px",
              }}
            >
              {message}
            </p>
            <Link
              href={`/${locale}/auth/login`}
              style={{
                display: "inline-block",
                padding: "10px 24px",
                background: "rgba(91,155,213,.12)",
                border: "1px solid rgba(91,155,213,.3)",
                color: "#5b9bd5",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "13px",
                fontFamily: "monospace",
              }}
            >
              {t("goToLogin")}
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
