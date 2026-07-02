"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setToken } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (token) {
      setToken(token);
      router.replace("/dashboard");
      router.replace("/profile");
    } else {
      router.replace("/auth/login?error=" + (error ?? "unknown"));
    }
  }, [searchParams, setToken, router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d1420",
        fontFamily: "monospace",
        color: "rgba(180,210,240,.6)",
        fontSize: "12px",
      }}
    >
      Signing you in...
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}
