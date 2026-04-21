"use client";

import { useState } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const CPU_BENCHMARKS = [
  {
    id: "r9-7950x",
    name: "Ryzen 9 7950X",
    price: 699,
    tdp: 170,
    cinebench_multi: 38500,
    cinebench_single: 2050,
    blender: 3800,
    color: "#E8631A",
  },
  {
    id: "i9-14900k",
    name: "Core i9-14900K",
    price: 589,
    tdp: 253,
    cinebench_multi: 40200,
    cinebench_single: 2250,
    blender: 3500,
    color: "#0078D4",
  },
  {
    id: "r7-7700x",
    name: "Ryzen 7 7700X",
    price: 299,
    tdp: 105,
    cinebench_multi: 19800,
    cinebench_single: 1990,
    blender: 2100,
    color: "#E8631A",
  },
  {
    id: "i7-14700k",
    name: "Core i7-14700K",
    price: 409,
    tdp: 253,
    cinebench_multi: 33500,
    cinebench_single: 2180,
    blender: 3100,
    color: "#0078D4",
  },
  {
    id: "r5-7600x",
    name: "Ryzen 5 7600X",
    price: 199,
    tdp: 105,
    cinebench_multi: 15200,
    cinebench_single: 1960,
    blender: 1650,
    color: "#E8631A",
  },
  {
    id: "i5-14600k",
    name: "Core i5-14600K",
    price: 319,
    tdp: 181,
    cinebench_multi: 24100,
    cinebench_single: 2080,
    blender: 2400,
    color: "#0078D4",
  },
];

const GPU_BENCHMARKS = [
  {
    id: "rtx-4090",
    name: "RTX 4090",
    price: 1599,
    tdp: 450,
    fps_4k: 142,
    fps_1440p: 221,
    fps_1080p: 260,
    vram: 24,
    color: "#76b900",
  },
  {
    id: "rtx-4080s",
    name: "RTX 4080 Super",
    price: 999,
    tdp: 320,
    fps_4k: 108,
    fps_1440p: 178,
    fps_1080p: 215,
    vram: 16,
    color: "#76b900",
  },
  {
    id: "rx-7900xtx",
    name: "RX 7900 XTX",
    price: 899,
    tdp: 355,
    fps_4k: 98,
    fps_1440p: 162,
    fps_1080p: 198,
    vram: 24,
    color: "#ED1C24",
  },
  {
    id: "rtx-4070ti",
    name: "RTX 4070 Ti Super",
    price: 799,
    tdp: 285,
    fps_4k: 89,
    fps_1440p: 152,
    fps_1080p: 188,
    vram: 16,
    color: "#76b900",
  },
  {
    id: "rtx-4070s",
    name: "RTX 4070 Super",
    price: 599,
    tdp: 220,
    fps_4k: 72,
    fps_1440p: 128,
    fps_1080p: 165,
    vram: 12,
    color: "#76b900",
  },
  {
    id: "rx-7800xt",
    name: "RX 7800 XT",
    price: 499,
    tdp: 263,
    fps_4k: 58,
    fps_1440p: 108,
    fps_1080p: 142,
    vram: 16,
    color: "#ED1C24",
  },
];

type CPUMetric = "cinebench_multi" | "cinebench_single" | "blender";
type GPUMetric = "fps_4k" | "fps_1440p" | "fps_1080p";
type Tab = "cpu" | "gpu" | "efficiency";

const CPU_METRIC_LABELS: Record<CPUMetric, string> = {
  cinebench_multi: "Cinebench R23 Multi-core",
  cinebench_single: "Cinebench R23 Single-core",
  blender: "Blender BMW (samples/min)",
};

const GPU_METRIC_LABELS: Record<GPUMetric, string> = {
  fps_4k: "Avg FPS — 4K Ultra",
  fps_1440p: "Avg FPS — 1440p Ultra",
  fps_1080p: "Avg FPS — 1080p Ultra",
};

// ─── Bar chart ────────────────────────────────────────────────────────────────
function BarChart({
  items,
  getValue,
  getLabel,
  getColor,
  getPrice,
  getTdp,
  unit = "",
}: {
  items: any[];
  getValue: (item: any) => number;
  getLabel: (item: any) => string;
  getColor: (item: any) => string;
  getPrice: (item: any) => number;
  getTdp: (item: any) => number;
  unit?: string;
}) {
  const sorted = [...items].sort((a, b) => getValue(b) - getValue(a));
  const max = getValue(sorted[0]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {sorted.map((item) => {
        const val = getValue(item);
        const pct = (val / max) * 100;

        return (
          <div key={item.id}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "4px",
                alignItems: "flex-end",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "#ddeeff",
                  fontFamily: "monospace",
                }}
              >
                {getLabel(item)}
              </span>
              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                <span
                  style={{
                    fontSize: "9px",
                    color: "rgba(180,210,240,.4)",
                    fontFamily: "monospace",
                  }}
                >
                  ${getPrice(item)}
                </span>
                <span
                  style={{
                    fontSize: "9px",
                    color: "rgba(180,210,240,.4)",
                    fontFamily: "monospace",
                  }}
                >
                  {getTdp(item)}W
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: getColor(item),
                    fontFamily: "monospace",
                  }}
                >
                  {val.toLocaleString()}
                  {unit}
                </span>
              </div>
            </div>
            <div
              style={{
                height: "10px",
                background: "rgba(255,255,255,.06)",
                borderRadius: "5px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${getColor(item)}cc, ${getColor(item)})`,
                  borderRadius: "5px",
                  transition: "width .6s ease",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Efficiency chart ─────────────────────────────────────────────────────────
function EfficiencyChart() {
  const cpuData = CPU_BENCHMARKS.map((c) => ({
    id: c.id,
    name: c.name,
    ppw: Math.round(c.cinebench_multi / c.tdp),
    color: c.color,
  })).sort((a, b) => b.ppw - a.ppw);

  const gpuData = GPU_BENCHMARKS.map((g) => ({
    id: g.id,
    name: g.name,
    ppw: Math.round((g.fps_4k / g.tdp) * 100),
    color: g.color,
  })).sort((a, b) => b.ppw - a.ppw);

  const maxCPU = cpuData[0].ppw;
  const maxGPU = gpuData[0].ppw;

  return (
    <div style={{ display: "flex", gap: "32px" }}>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "10px",
            letterSpacing: ".1em",
            color: "rgba(91,155,213,.6)",
            marginBottom: "16px",
          }}
        >
          CPU — CINEBENCH POINTS PER WATT
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {cpuData.map((item) => (
            <div key={item.id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "#ddeeff",
                    fontFamily: "monospace",
                  }}
                >
                  {item.name}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: item.color,
                    fontFamily: "monospace",
                  }}
                >
                  {item.ppw} pts/W
                </span>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "rgba(255,255,255,.06)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(item.ppw / maxCPU) * 100}%`,
                    background: `linear-gradient(90deg, ${item.color}aa, ${item.color})`,
                    borderRadius: "4px",
                    transition: "width .6s",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "10px",
            letterSpacing: ".1em",
            color: "rgba(91,155,213,.6)",
            marginBottom: "16px",
          }}
        >
          GPU — 4K FPS × 100 PER WATT
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {gpuData.map((item) => (
            <div key={item.id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "#ddeeff",
                    fontFamily: "monospace",
                  }}
                >
                  {item.name}
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: item.color,
                    fontFamily: "monospace",
                  }}
                >
                  {item.ppw}
                </span>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "rgba(255,255,255,.06)",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${(item.ppw / maxGPU) * 100}%`,
                    background: `linear-gradient(90deg, ${item.color}aa, ${item.color})`,
                    borderRadius: "4px",
                    transition: "width .6s",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Compare panel ────────────────────────────────────────────────────────────
function ComparePanel({ tab }: { tab: "cpu" | "gpu" }) {
  const items = tab === "cpu" ? CPU_BENCHMARKS : GPU_BENCHMARKS;
  const [a, setA] = useState(items[0].id);
  const [b, setB] = useState(items[1].id);

  const itemA = items.find((i) => i.id === a) ?? items[0];
  const itemB = items.find((i) => i.id === b) ?? items[1];

  const metrics =
    tab === "cpu"
      ? [
          { key: "cinebench_multi", label: "CB R23 Multi" },
          { key: "cinebench_single", label: "CB R23 Single" },
          { key: "blender", label: "Blender (samples/min)" },
          { key: "tdp", label: "TDP (W)", lowerBetter: true },
          { key: "price", label: "Price ($)", lowerBetter: true },
        ]
      : [
          { key: "fps_4k", label: "Avg FPS 4K" },
          { key: "fps_1440p", label: "Avg FPS 1440p" },
          { key: "fps_1080p", label: "Avg FPS 1080p" },
          { key: "vram", label: "VRAM (GB)" },
          { key: "tdp", label: "TDP (W)", lowerBetter: true },
          { key: "price", label: "Price ($)", lowerBetter: true },
        ];

  const selectStyle = {
    background: "#0a1018",
    border: "1px solid rgba(91,155,213,.3)",
    borderRadius: "6px",
    color: "#ddeeff",
    fontFamily: "monospace",
    fontSize: "11px",
    padding: "8px 10px",
    width: "100%",
    cursor: "pointer",
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "9px",
              letterSpacing: ".1em",
              color: "rgba(91,155,213,.6)",
              marginBottom: "6px",
            }}
          >
            COMPONENT A
          </div>
          <select
            value={a}
            onChange={(e) => setA(e.target.value)}
            style={selectStyle}
          >
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingTop: "20px",
            color: "rgba(180,210,240,.4)",
            fontSize: "14px",
          }}
        >
          vs
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "9px",
              letterSpacing: ".1em",
              color: "rgba(91,155,213,.6)",
              marginBottom: "6px",
            }}
          >
            COMPONENT B
          </div>
          <select
            value={b}
            onChange={(e) => setB(e.target.value)}
            style={selectStyle}
          >
            {items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {metrics.map(({ key, label, lowerBetter }) => {
          const valA = (itemA as any)[key];
          const valB = (itemB as any)[key];
          const aWins = lowerBetter ? valA < valB : valA > valB;
          const bWins = lowerBetter ? valB < valA : valB > valA;
          const max = Math.max(valA, valB);

          return (
            <div
              key={key}
              style={{
                background: "rgba(255,255,255,.03)",
                borderRadius: "8px",
                padding: "12px 14px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  letterSpacing: ".08em",
                  color: "rgba(180,210,240,.4)",
                  marginBottom: "8px",
                }}
              >
                {label.toUpperCase()}
              </div>
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "3px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "9px",
                        color: itemA.color,
                        fontFamily: "monospace",
                      }}
                    >
                      {itemA.name.split(" ").slice(-2).join(" ")}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: aWins ? "#44ff88" : "#ddeeff",
                        fontFamily: "monospace",
                      }}
                    >
                      {valA?.toLocaleString()}
                      {aWins ? " ✓" : ""}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      background: "rgba(255,255,255,.06)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(valA / max) * 100}%`,
                        background: aWins ? "#44ff88" : itemA.color,
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "3px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "9px",
                        color: itemB.color,
                        fontFamily: "monospace",
                      }}
                    >
                      {itemB.name.split(" ").slice(-2).join(" ")}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: bWins ? "#44ff88" : "#ddeeff",
                        fontFamily: "monospace",
                      }}
                    >
                      {valB?.toLocaleString()}
                      {bWins ? " ✓" : ""}
                    </span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      background: "rgba(255,255,255,.06)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(valB / max) * 100}%`,
                        background: bWins ? "#44ff88" : itemB.color,
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Benchmarks() {
  const [tab, setTab] = useState<Tab>("cpu");
  const [cpuMetric, setCpuMetric] = useState<CPUMetric>("cinebench_multi");
  const [gpuMetric, setGpuMetric] = useState<GPUMetric>("fps_4k");
  const [mode, setMode] = useState<"chart" | "compare">("chart");

  const tabStyle = (active: boolean) => ({
    padding: "7px 18px",
    fontFamily: "monospace",
    fontSize: "11px",
    borderRadius: "6px",
    cursor: "pointer",
    border: active ? "1px solid #5b9bd5" : "1px solid rgba(255,255,255,.1)",
    background: active ? "rgba(91,155,213,.15)" : "none",
    color: active ? "#5b9bd5" : "rgba(180,210,240,.5)",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1420",
        fontFamily: "monospace",
        color: "#ddeeff",
        padding: "32px 24px",
      }}
    >
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            fontSize: "9px",
            letterSpacing: ".14em",
            color: "rgba(91,155,213,.6)",
            marginBottom: "6px",
          }}
        >
          PERFORMANCE DATA
        </div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#ddeeff",
            margin: "0 0 4px",
          }}
        >
          Benchmarks
        </h1>
        <p
          style={{
            fontSize: "11px",
            color: "rgba(180,210,240,.45)",
            margin: 0,
          }}
        >
          Real-world performance data for CPUs and GPUs. All scores from
          published reviews.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "28px",
          flexWrap: "wrap",
        }}
      >
        <button onClick={() => setTab("cpu")} style={tabStyle(tab === "cpu")}>
          CPU
        </button>
        <button onClick={() => setTab("gpu")} style={tabStyle(tab === "gpu")}>
          GPU
        </button>
        <button
          onClick={() => setTab("efficiency")}
          style={tabStyle(tab === "efficiency")}
        >
          Efficiency
        </button>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          <button
            onClick={() => setMode("chart")}
            style={tabStyle(mode === "chart")}
          >
            Chart
          </button>
          <button
            onClick={() => setMode("compare")}
            style={tabStyle(mode === "compare")}
          >
            Compare
          </button>
        </div>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,.03)",
          border: "1px solid rgba(255,255,255,.07)",
          borderRadius: "12px",
          padding: "28px",
        }}
      >
        {tab === "cpu" && mode === "chart" && (
          <>
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "24px",
                flexWrap: "wrap",
              }}
            >
              {(Object.entries(CPU_METRIC_LABELS) as [CPUMetric, string][]).map(
                ([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setCpuMetric(key)}
                    style={tabStyle(cpuMetric === key)}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: ".1em",
                color: "rgba(91,155,213,.6)",
                marginBottom: "16px",
              }}
            >
              {CPU_METRIC_LABELS[cpuMetric].toUpperCase()}
            </div>
            <BarChart
              items={CPU_BENCHMARKS}
              getValue={(item) => item[cpuMetric]}
              getLabel={(item) => item.name}
              getColor={(item) => item.color}
              getPrice={(item) => item.price}
              getTdp={(item) => item.tdp}
            />
            <div
              style={{
                marginTop: "20px",
                padding: "12px",
                background: "rgba(91,155,213,.06)",
                borderRadius: "6px",
                fontSize: "10px",
                color: "rgba(180,210,240,.5)",
                lineHeight: 1.7,
              }}
            >
              💡 The i9-14900K leads in single-core but its 253W TDP runs hot.
              The Ryzen 9 7950X leads multi-core with a more efficient 170W
              envelope. For gaming, single-core score matters most.
            </div>
          </>
        )}

        {tab === "gpu" && mode === "chart" && (
          <>
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "24px",
                flexWrap: "wrap",
              }}
            >
              {(Object.entries(GPU_METRIC_LABELS) as [GPUMetric, string][]).map(
                ([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setGpuMetric(key)}
                    style={tabStyle(gpuMetric === key)}
                  >
                    {label}
                  </button>
                ),
              )}
            </div>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: ".1em",
                color: "rgba(91,155,213,.6)",
                marginBottom: "16px",
              }}
            >
              {GPU_METRIC_LABELS[gpuMetric].toUpperCase()} — AVERAGE ACROSS 5
              TITLES
            </div>
            <BarChart
              items={GPU_BENCHMARKS}
              getValue={(item) => item[gpuMetric]}
              getLabel={(item) => item.name}
              getColor={(item) => item.color}
              getPrice={(item) => item.price}
              getTdp={(item) => item.tdp}
              unit=" fps"
            />
            <div
              style={{
                marginTop: "20px",
                padding: "12px",
                background: "rgba(91,155,213,.06)",
                borderRadius: "6px",
                fontSize: "10px",
                color: "rgba(180,210,240,.5)",
                lineHeight: 1.7,
              }}
            >
              💡 FPS averaged across Cyberpunk 2077, Call of Duty, Forza Horizon
              5, Hogwarts Legacy, and Alan Wake 2 at max settings.
            </div>
          </>
        )}

        {tab === "efficiency" && mode === "chart" && (
          <>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: ".1em",
                color: "rgba(91,155,213,.6)",
                marginBottom: "20px",
              }}
            >
              PERFORMANCE PER WATT
            </div>
            <EfficiencyChart />
            <div
              style={{
                marginTop: "20px",
                padding: "12px",
                background: "rgba(91,155,213,.06)",
                borderRadius: "6px",
                fontSize: "10px",
                color: "rgba(180,210,240,.5)",
                lineHeight: 1.7,
              }}
            >
              💡 Efficiency matters for thermals, electricity cost, and cooling
              requirements. The Ryzen 5 7600X and RTX 4070 Super offer the best
              performance-per-watt in their segments.
            </div>
          </>
        )}

        {mode === "compare" && tab !== "efficiency" && (
          <ComparePanel tab={tab as "cpu" | "gpu"} />
        )}

        {mode === "compare" && tab === "efficiency" && (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "rgba(180,210,240,.4)",
              fontSize: "11px",
            }}
          >
            Switch to CPU or GPU tab to use compare mode.
          </div>
        )}
      </div>
    </div>
  );
}
