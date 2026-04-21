"use client";

import dynamic from "next/dynamic";

const BuildCanvas = dynamic(() => import("@/components/3d/BuildCanvas"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d1810",
        fontFamily: "monospace",
        fontSize: "12px",
        color: "rgba(255,255,255,0.3)",
      }}
    >
      Loading Build Mode...
    </div>
  ),
});

export default function BuildPage() {
  return (
    <div style={{ margin: "-2rem -1.5rem" }}>
      <BuildCanvas />
    </div>
  );
}
