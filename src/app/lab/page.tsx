"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const LabCanvas = dynamic(() => import("@/components/3d/LabCanvas"), {
  ssr: false,
});

export default function LabPage() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ fontFamily: "monospace" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            fontSize: "30px",
            fontWeight: 700,
            color: "white",
            marginBottom: "4px",
          }}
        >
          3D Lab
        </h1>
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)" }}>
          Interactive motherboard — drag to rotate, scroll to zoom, click to
          inspect
        </p>
      </div>
      <div style={{ position: "relative" }}>
        {!loaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 10,
              height: "620px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#0d1810",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.1)",
              fontFamily: "monospace",
              fontSize: "12px",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            Loading 3D Lab...
          </div>
        )}
        <div onPointerEnter={() => setLoaded(true)}>
          <LabCanvas />
        </div>
      </div>
    </div>
  );
}
