"use client";

import { useState, useMemo } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Component {
  id: string;
  name: string;
  price: number;
  watts: number;
  specs: Record<string, string>;
  socket?: string;
  ramType?: string;
  ramSlots?: number;
  psuWatts?: number;
  tdp?: number;
}

const CPUS: Component[] = [
  {
    id: "r9-7950x",
    name: "AMD Ryzen 9 7950X",
    price: 699,
    watts: 170,
    socket: "AM5",
    ramType: "DDR5",
    specs: { Cores: "16C/32T", Boost: "5.7 GHz", TDP: "170W", Socket: "AM5" },
  },
  {
    id: "r7-7700x",
    name: "AMD Ryzen 7 7700X",
    price: 299,
    watts: 105,
    socket: "AM5",
    ramType: "DDR5",
    specs: { Cores: "8C/16T", Boost: "5.4 GHz", TDP: "105W", Socket: "AM5" },
  },
  {
    id: "r5-7600x",
    name: "AMD Ryzen 5 7600X",
    price: 199,
    watts: 105,
    socket: "AM5",
    ramType: "DDR5",
    specs: { Cores: "6C/12T", Boost: "5.3 GHz", TDP: "105W", Socket: "AM5" },
  },
  {
    id: "i9-14900k",
    name: "Intel Core i9-14900K",
    price: 589,
    watts: 253,
    socket: "LGA1700",
    ramType: "DDR5",
    specs: {
      Cores: "24C/32T",
      Boost: "6.0 GHz",
      TDP: "253W",
      Socket: "LGA1700",
    },
  },
  {
    id: "i7-14700k",
    name: "Intel Core i7-14700K",
    price: 409,
    watts: 253,
    socket: "LGA1700",
    ramType: "DDR5",
    specs: {
      Cores: "20C/28T",
      Boost: "5.6 GHz",
      TDP: "253W",
      Socket: "LGA1700",
    },
  },
  {
    id: "i5-14600k",
    name: "Intel Core i5-14600K",
    price: 319,
    watts: 181,
    socket: "LGA1700",
    ramType: "DDR5",
    specs: {
      Cores: "14C/20T",
      Boost: "5.3 GHz",
      TDP: "181W",
      Socket: "LGA1700",
    },
  },
];

const MOTHERBOARDS: Component[] = [
  {
    id: "x670e-hero",
    name: "ASUS ROG X670E Hero",
    price: 499,
    watts: 15,
    socket: "AM5",
    ramType: "DDR5",
    ramSlots: 4,
    specs: { Socket: "AM5", Chipset: "X670E", RAM: "DDR5", Slots: "4×DIMM" },
  },
  {
    id: "x670-tomahawk",
    name: "MSI MAG X670 Tomahawk",
    price: 299,
    watts: 12,
    socket: "AM5",
    ramType: "DDR5",
    ramSlots: 4,
    specs: { Socket: "AM5", Chipset: "X670", RAM: "DDR5", Slots: "4×DIMM" },
  },
  {
    id: "b650-pro",
    name: "Gigabyte B650 Aorus Pro",
    price: 199,
    watts: 10,
    socket: "AM5",
    ramType: "DDR5",
    ramSlots: 4,
    specs: { Socket: "AM5", Chipset: "B650", RAM: "DDR5", Slots: "4×DIMM" },
  },
  {
    id: "z790-apex",
    name: "ASUS ROG Maximus Z790 Apex",
    price: 599,
    watts: 18,
    socket: "LGA1700",
    ramType: "DDR5",
    ramSlots: 2,
    specs: { Socket: "LGA1700", Chipset: "Z790", RAM: "DDR5", Slots: "2×DIMM" },
  },
  {
    id: "z790-tomahawk",
    name: "MSI MAG Z790 Tomahawk",
    price: 299,
    watts: 12,
    socket: "LGA1700",
    ramType: "DDR5",
    ramSlots: 4,
    specs: { Socket: "LGA1700", Chipset: "Z790", RAM: "DDR5", Slots: "4×DIMM" },
  },
  {
    id: "b760-ds3h",
    name: "Gigabyte B760 DS3H",
    price: 129,
    watts: 8,
    socket: "LGA1700",
    ramType: "DDR5",
    ramSlots: 4,
    specs: { Socket: "LGA1700", Chipset: "B760", RAM: "DDR5", Slots: "4×DIMM" },
  },
];

const GPUS: Component[] = [
  {
    id: "rtx-4090",
    name: "NVIDIA RTX 4090",
    price: 1599,
    watts: 450,
    specs: {
      VRAM: "24GB GDDR6X",
      Cores: "16384 CUDA",
      TDP: "450W",
      Interface: "PCIe 5.0 x16",
    },
  },
  {
    id: "rtx-4080",
    name: "NVIDIA RTX 4080 Super",
    price: 999,
    watts: 320,
    specs: {
      VRAM: "16GB GDDR6X",
      Cores: "10240 CUDA",
      TDP: "320W",
      Interface: "PCIe 4.0 x16",
    },
  },
  {
    id: "rtx-4070ti",
    name: "NVIDIA RTX 4070 Ti Super",
    price: 799,
    watts: 285,
    specs: {
      VRAM: "16GB GDDR6X",
      Cores: "8448 CUDA",
      TDP: "285W",
      Interface: "PCIe 4.0 x16",
    },
  },
  {
    id: "rtx-4070",
    name: "NVIDIA RTX 4070 Super",
    price: 599,
    watts: 220,
    specs: {
      VRAM: "12GB GDDR6X",
      Cores: "7168 CUDA",
      TDP: "220W",
      Interface: "PCIe 4.0 x16",
    },
  },
  {
    id: "rx-7900xtx",
    name: "AMD RX 7900 XTX",
    price: 899,
    watts: 355,
    specs: {
      VRAM: "24GB GDDR6",
      Cores: "6144 SP",
      TDP: "355W",
      Interface: "PCIe 4.0 x16",
    },
  },
  {
    id: "rx-7800xt",
    name: "AMD RX 7800 XT",
    price: 499,
    watts: 263,
    specs: {
      VRAM: "16GB GDDR6",
      Cores: "3840 SP",
      TDP: "263W",
      Interface: "PCIe 4.0 x16",
    },
  },
];

const RAMS: Component[] = [
  {
    id: "ddr5-32-6000",
    name: "G.Skill Trident Z5 32GB DDR5-6000",
    price: 129,
    watts: 8,
    ramType: "DDR5",
    specs: {
      Capacity: "32GB (2×16)",
      Speed: "DDR5-6000",
      Latency: "CL36",
      Voltage: "1.35V",
    },
  },
  {
    id: "ddr5-64-6000",
    name: "G.Skill Trident Z5 64GB DDR5-6000",
    price: 219,
    watts: 12,
    ramType: "DDR5",
    specs: {
      Capacity: "64GB (2×32)",
      Speed: "DDR5-6000",
      Latency: "CL36",
      Voltage: "1.35V",
    },
  },
  {
    id: "ddr5-32-5600",
    name: "Corsair Vengeance 32GB DDR5-5600",
    price: 99,
    watts: 8,
    ramType: "DDR5",
    specs: {
      Capacity: "32GB (2×16)",
      Speed: "DDR5-5600",
      Latency: "CL40",
      Voltage: "1.25V",
    },
  },
  {
    id: "ddr5-16-5200",
    name: "Kingston Fury Beast 16GB DDR5-5200",
    price: 59,
    watts: 5,
    ramType: "DDR5",
    specs: {
      Capacity: "16GB (2×8)",
      Speed: "DDR5-5200",
      Latency: "CL40",
      Voltage: "1.25V",
    },
  },
];

const STORAGES: Component[] = [
  {
    id: "sn850x-2tb",
    name: "WD Black SN850X 2TB NVMe",
    price: 149,
    watts: 8,
    specs: {
      Type: "NVMe PCIe 4.0",
      Capacity: "2TB",
      Read: "7300 MB/s",
      Write: "6600 MB/s",
    },
  },
  {
    id: "sn850x-1tb",
    name: "WD Black SN850X 1TB NVMe",
    price: 99,
    watts: 6,
    specs: {
      Type: "NVMe PCIe 4.0",
      Capacity: "1TB",
      Read: "7300 MB/s",
      Write: "6300 MB/s",
    },
  },
  {
    id: "990pro-2tb",
    name: "Samsung 990 Pro 2TB NVMe",
    price: 159,
    watts: 7,
    specs: {
      Type: "NVMe PCIe 4.0",
      Capacity: "2TB",
      Read: "7450 MB/s",
      Write: "6900 MB/s",
    },
  },
  {
    id: "870evo-1tb",
    name: "Samsung 870 EVO 1TB SATA",
    price: 79,
    watts: 4,
    specs: {
      Type: 'SATA III 2.5"',
      Capacity: "1TB",
      Read: "560 MB/s",
      Write: "530 MB/s",
    },
  },
  {
    id: "barracuda-4tb",
    name: "Seagate Barracuda 4TB HDD",
    price: 69,
    watts: 9,
    specs: {
      Type: 'HDD 3.5" SATA',
      Capacity: "4TB",
      Read: "190 MB/s",
      RPM: "5400 RPM",
    },
  },
];

const COOLERS: Component[] = [
  {
    id: "nh-d15",
    name: "Noctua NH-D15",
    price: 109,
    watts: 3,
    tdp: 250,
    specs: {
      Type: "Dual-tower air",
      "TDP rating": "250W",
      Fans: "2× 140mm",
      Noise: "24 dB(A)",
    },
  },
  {
    id: "nh-u12a",
    name: "Noctua NH-U12A",
    price: 99,
    watts: 3,
    tdp: 200,
    specs: {
      Type: "Single-tower air",
      "TDP rating": "200W",
      Fans: "2× 120mm",
      Noise: "22 dB(A)",
    },
  },
  {
    id: "lc360",
    name: "Corsair iCUE H150i Elite 360mm AIO",
    price: 199,
    watts: 18,
    tdp: 350,
    specs: {
      Type: "360mm AIO",
      "TDP rating": "350W",
      Fans: "3× 120mm",
      Noise: "37 dB(A)",
    },
  },
  {
    id: "lc240",
    name: "Arctic Liquid Freezer III 240mm AIO",
    price: 99,
    watts: 12,
    tdp: 300,
    specs: {
      Type: "240mm AIO",
      "TDP rating": "300W",
      Fans: "2× 120mm",
      Noise: "29 dB(A)",
    },
  },
  {
    id: "hyper212",
    name: "Cooler Master Hyper 212 Black",
    price: 39,
    watts: 2,
    tdp: 150,
    specs: {
      Type: "Single-tower air",
      "TDP rating": "150W",
      Fans: "1× 120mm",
      Noise: "26 dB(A)",
    },
  },
];

const PSUS: Component[] = [
  {
    id: "rm1000x",
    name: "Corsair RM1000x 1000W Gold",
    price: 189,
    watts: 0,
    psuWatts: 1000,
    specs: {
      Output: "1000W",
      Rating: "80+ Gold",
      Type: "Fully modular",
      Fan: "135mm",
    },
  },
  {
    id: "rm850x",
    name: "Corsair RM850x 850W Gold",
    price: 149,
    watts: 0,
    psuWatts: 850,
    specs: {
      Output: "850W",
      Rating: "80+ Gold",
      Type: "Fully modular",
      Fan: "135mm",
    },
  },
  {
    id: "rm750x",
    name: "Corsair RM750x 750W Gold",
    price: 119,
    watts: 0,
    psuWatts: 750,
    specs: {
      Output: "750W",
      Rating: "80+ Gold",
      Type: "Fully modular",
      Fan: "135mm",
    },
  },
  {
    id: "rmx650",
    name: "Corsair RMx 650W Gold",
    price: 99,
    watts: 0,
    psuWatts: 650,
    specs: {
      Output: "650W",
      Rating: "80+ Gold",
      Type: "Fully modular",
      Fan: "135mm",
    },
  },
  {
    id: "focus850",
    name: "Seasonic Focus GX-850W Gold",
    price: 139,
    watts: 0,
    psuWatts: 850,
    specs: {
      Output: "850W",
      Rating: "80+ Gold",
      Type: "Fully modular",
      Fan: "120mm",
    },
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type SlotKey =
  | "cpu"
  | "motherboard"
  | "gpu"
  | "ram"
  | "storage"
  | "cooler"
  | "psu";

interface Build {
  cpu: Component | null;
  motherboard: Component | null;
  gpu: Component | null;
  ram: Component | null;
  storage: Component | null;
  cooler: Component | null;
  psu: Component | null;
}

const SLOT_OPTIONS: Record<SlotKey, Component[]> = {
  cpu: CPUS,
  motherboard: MOTHERBOARDS,
  gpu: GPUS,
  ram: RAMS,
  storage: STORAGES,
  cooler: COOLERS,
  psu: PSUS,
};

const SLOT_LABELS: Record<SlotKey, string> = {
  cpu: "CPU",
  motherboard: "Motherboard",
  gpu: "GPU",
  ram: "RAM",
  storage: "Storage",
  cooler: "CPU Cooler",
  psu: "Power Supply",
};

const SLOT_ICONS: Record<SlotKey, string> = {
  cpu: "🧠",
  motherboard: "🖥️",
  gpu: "🎮",
  ram: "💾",
  storage: "💿",
  cooler: "❄️",
  psu: "⚡",
};

// ─── Compatibility checks ─────────────────────────────────────────────────────
interface Issue {
  type: "error" | "warning";
  message: string;
}

function getIssues(build: Build): Issue[] {
  const issues: Issue[] = [];

  // Socket match
  if (build.cpu && build.motherboard) {
    if (build.cpu.socket !== build.motherboard.socket) {
      issues.push({
        type: "error",
        message: `CPU socket ${build.cpu.socket} does not match motherboard socket ${build.motherboard.socket}`,
      });
    }
  }

  // RAM type match
  if (build.ram && build.motherboard) {
    if (build.ram.ramType !== build.motherboard.ramType) {
      issues.push({
        type: "error",
        message: `RAM type ${build.ram.ramType} is not compatible with motherboard ${build.motherboard.ramType}`,
      });
    }
  }

  // PSU wattage
  const totalWatts = [
    build.cpu,
    build.gpu,
    build.ram,
    build.storage,
    build.cooler,
    build.motherboard,
  ].reduce((sum, c) => sum + (c?.watts ?? 0), 0);
  if (build.psu) {
    if (totalWatts > (build.psu.psuWatts ?? 0)) {
      issues.push({
        type: "error",
        message: `System draws ~${totalWatts}W but PSU only provides ${build.psu.psuWatts}W`,
      });
    } else if (totalWatts > (build.psu.psuWatts ?? 0) * 0.8) {
      issues.push({
        type: "warning",
        message: `PSU is above 80% load (~${totalWatts}W / ${build.psu.psuWatts}W) — consider upgrading`,
      });
    }
  }

  // Cooler TDP
  if (build.cooler && build.cpu) {
    if ((build.cooler.tdp ?? 0) < (build.cpu.watts ?? 0)) {
      issues.push({
        type: "warning",
        message: `Cooler rated for ${build.cooler.tdp}W but CPU TDP is ${build.cpu.watts}W — may throttle under load`,
      });
    }
  }

  return issues;
}

// ─── Component selector ───────────────────────────────────────────────────────
function Selector({
  slot,
  selected,
  onSelect,
}: {
  slot: SlotKey;
  selected: Component | null;
  onSelect: (c: Component | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const options = SLOT_OPTIONS[slot];

  return (
    <div style={{ marginBottom: "12px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "4px",
        }}
      >
        <span style={{ fontSize: "14px" }}>{SLOT_ICONS[slot]}</span>
        <span
          style={{
            fontSize: "10px",
            letterSpacing: ".1em",
            color: "rgba(91,155,213,.7)",
          }}
        >
          {SLOT_LABELS[slot].toUpperCase()}
        </span>
      </div>
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: "10px 12px",
          background: selected
            ? "rgba(91,155,213,.1)"
            : "rgba(255,255,255,.04)",
          border: `1px solid ${selected ? "rgba(91,155,213,.4)" : "rgba(255,255,255,.08)"}`,
          borderRadius: "6px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "11px",
              color: selected ? "#ddeeff" : "rgba(180,210,240,.4)",
            }}
          >
            {selected ? selected.name : `Select ${SLOT_LABELS[slot]}`}
          </div>
          {selected && (
            <div
              style={{
                fontSize: "10px",
                color: "rgba(91,155,213,.7)",
                marginTop: "2px",
              }}
            >
              ${selected.price} · {selected.watts}W
            </div>
          )}
        </div>
        <span style={{ fontSize: "10px", color: "rgba(91,155,213,.5)" }}>
          {open ? "▲" : "▼"}
        </span>
      </div>

      {open && (
        <div
          style={{
            border: "1px solid rgba(91,155,213,.2)",
            borderTop: "none",
            borderRadius: "0 0 6px 6px",
            background: "#0a1018",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {selected && (
            <div
              onClick={() => {
                onSelect(null);
                setOpen(false);
              }}
              style={{
                padding: "8px 12px",
                fontSize: "10px",
                color: "rgba(255,100,100,.7)",
                cursor: "pointer",
                borderBottom: "1px solid rgba(255,255,255,.05)",
              }}
            >
              ✕ Remove
            </div>
          )}
          {options.map((opt) => (
            <div
              key={opt.id}
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
              style={{
                padding: "10px 12px",
                cursor: "pointer",
                background:
                  selected?.id === opt.id ? "rgba(91,155,213,.15)" : "none",
                borderBottom: "1px solid rgba(255,255,255,.04)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    color: "#ddeeff",
                    flex: 1,
                    paddingRight: "8px",
                  }}
                >
                  {opt.name}
                </span>
                <span
                  style={{ fontSize: "11px", color: "#5b9bd5", flexShrink: 0 }}
                >
                  ${opt.price}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "3px",
                  flexWrap: "wrap",
                }}
              >
                {Object.entries(opt.specs)
                  .slice(0, 3)
                  .map(([k, v]) => (
                    <span
                      key={k}
                      style={{
                        fontSize: "9px",
                        color: "rgba(180,210,240,.45)",
                      }}
                    >
                      {k}: {v}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SpecBuilder() {
  const [build, setBuild] = useState<Build>({
    cpu: null,
    motherboard: null,
    gpu: null,
    ram: null,
    storage: null,
    cooler: null,
    psu: null,
  });
  const [copied, setCopied] = useState(false);

  const select = (slot: SlotKey) => (c: Component | null) =>
    setBuild((prev) => ({ ...prev, [slot]: c }));

  const totalPrice = useMemo(
    () => Object.values(build).reduce((sum, c) => sum + (c?.price ?? 0), 0),
    [build],
  );

  const totalWatts = useMemo(
    () => Object.values(build).reduce((sum, c) => sum + (c?.watts ?? 0), 0),
    [build],
  );

  const psuWatts = build.psu?.psuWatts ?? 0;
  const psuLoad = psuWatts > 0 ? Math.round((totalWatts / psuWatts) * 100) : 0;
  const issues = useMemo(() => getIssues(build), [build]);
  const errors = issues.filter((i) => i.type === "error");
  const warnings = issues.filter((i) => i.type === "warning");
  const slotsFilled = Object.values(build).filter(Boolean).length;

  const handleCopy = () => {
    const lines = Object.entries(build)
      .filter(([, v]) => v !== null)
      .map(
        ([k, v]) => `${SLOT_LABELS[k as SlotKey]}: ${v!.name} — $${v!.price}`,
      );
    const summary = [
      "── PC Build Summary ──",
      ...lines,
      `─────────────────────`,
      `Total: $${totalPrice} · ~${totalWatts}W draw`,
      errors.length > 0
        ? `⚠ ${errors.length} compatibility error(s)`
        : "✓ No compatibility errors",
    ].join("\n");
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#0d1420",
        fontFamily: "monospace",
        color: "#ddeeff",
      }}
    >
      {/* Left — selectors */}
      <div
        style={{
          flex: 1,
          padding: "32px 24px",
          overflowY: "auto",
          maxWidth: "640px",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              fontSize: "9px",
              letterSpacing: ".14em",
              color: "rgba(91,155,213,.6)",
              marginBottom: "6px",
            }}
          >
            PC SPEC BUILDER
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#ddeeff",
              margin: "0 0 4px",
            }}
          >
            Build Your PC
          </h1>
          <p
            style={{
              fontSize: "11px",
              color: "rgba(180,210,240,.45)",
              margin: 0,
            }}
          >
            Select components to check compatibility, wattage, and total cost.
          </p>
        </div>

        {(Object.keys(SLOT_OPTIONS) as SlotKey[]).map((slot) => (
          <Selector
            key={slot}
            slot={slot}
            selected={build[slot]}
            onSelect={select(slot)}
          />
        ))}
      </div>

      {/* Right — summary */}
      <div
        style={{
          width: "300px",
          flexShrink: 0,
          background: "#0a1018",
          borderLeft: "1px solid rgba(255,255,255,.07)",
          padding: "32px 20px",
          overflowY: "auto",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* Progress */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                fontSize: "9px",
                letterSpacing: ".1em",
                color: "rgba(91,155,213,.6)",
              }}
            >
              BUILD PROGRESS
            </span>
            <span style={{ fontSize: "9px", color: "rgba(91,155,213,.6)" }}>
              {slotsFilled}/7
            </span>
          </div>
          <div
            style={{
              height: "3px",
              background: "rgba(255,255,255,.08)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "linear-gradient(90deg,#0066cc,#00aaff)",
                width: `${(slotsFilled / 7) * 100}%`,
                transition: "width .3s",
                borderRadius: "2px",
              }}
            />
          </div>
        </div>

        {/* Price */}
        <div
          style={{
            marginBottom: "20px",
            padding: "14px",
            background: "rgba(91,155,213,.08)",
            border: "1px solid rgba(91,155,213,.15)",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              letterSpacing: ".1em",
              color: "rgba(91,155,213,.6)",
              marginBottom: "4px",
            }}
          >
            TOTAL PRICE
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#5b9bd5" }}>
            ${totalPrice.toLocaleString()}
          </div>
        </div>

        {/* Wattage */}
        <div
          style={{
            marginBottom: "20px",
            padding: "14px",
            background: "rgba(255,180,0,.06)",
            border: "1px solid rgba(255,180,0,.15)",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              letterSpacing: ".1em",
              color: "rgba(255,180,0,.7)",
              marginBottom: "6px",
            }}
          >
            POWER DRAW
          </div>
          <div
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#ffcc44",
              marginBottom: "6px",
            }}
          >
            {totalWatts}W
          </div>
          {psuWatts > 0 && (
            <>
              <div
                style={{
                  height: "4px",
                  background: "rgba(255,255,255,.08)",
                  borderRadius: "2px",
                  overflow: "hidden",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background:
                      psuLoad > 90
                        ? "#ff4444"
                        : psuLoad > 80
                          ? "#ffaa00"
                          : "#44cc88",
                    width: `${Math.min(100, psuLoad)}%`,
                    transition: "width .3s",
                    borderRadius: "2px",
                  }}
                />
              </div>
              <div style={{ fontSize: "9px", color: "rgba(180,210,240,.4)" }}>
                {psuLoad}% of {psuWatts}W PSU · {psuWatts - totalWatts}W
                headroom
              </div>
            </>
          )}
        </div>

        {/* Compatibility */}
        {(errors.length > 0 || warnings.length > 0) && (
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                fontSize: "9px",
                letterSpacing: ".1em",
                color: "rgba(91,155,213,.5)",
                marginBottom: "8px",
              }}
            >
              COMPATIBILITY
            </div>
            {errors.map((e, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "8px",
                  padding: "8px 10px",
                  background: "rgba(255,60,60,.08)",
                  border: "1px solid rgba(255,60,60,.2)",
                  borderRadius: "6px",
                  marginBottom: "6px",
                }}
              >
                <span style={{ fontSize: "11px", flexShrink: 0 }}>✕</span>
                <span
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,120,120,.9)",
                    lineHeight: 1.5,
                  }}
                >
                  {e.message}
                </span>
              </div>
            ))}
            {warnings.map((w, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "8px",
                  padding: "8px 10px",
                  background: "rgba(255,180,0,.06)",
                  border: "1px solid rgba(255,180,0,.2)",
                  borderRadius: "6px",
                  marginBottom: "6px",
                }}
              >
                <span style={{ fontSize: "11px", flexShrink: 0 }}>⚠</span>
                <span
                  style={{
                    fontSize: "10px",
                    color: "rgba(255,200,80,.9)",
                    lineHeight: 1.5,
                  }}
                >
                  {w.message}
                </span>
              </div>
            ))}
          </div>
        )}

        {errors.length === 0 && slotsFilled > 0 && (
          <div
            style={{
              display: "flex",
              gap: "6px",
              alignItems: "center",
              padding: "8px 10px",
              background: "rgba(30,180,60,.08)",
              border: "1px solid rgba(30,180,60,.2)",
              borderRadius: "6px",
              marginBottom: "20px",
            }}
          >
            <span style={{ fontSize: "11px" }}>✓</span>
            <span style={{ fontSize: "10px", color: "rgba(80,220,120,.9)" }}>
              {slotsFilled === 7
                ? "All components compatible"
                : "No issues so far"}
            </span>
          </div>
        )}

        {/* Component list */}
        {slotsFilled > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                fontSize: "9px",
                letterSpacing: ".1em",
                color: "rgba(91,155,213,.5)",
                marginBottom: "8px",
              }}
            >
              SELECTED COMPONENTS
            </div>
            {(Object.entries(build) as [SlotKey, Component | null][])
              .filter(([, v]) => v !== null)
              .map(([slot, c]) => (
                <div
                  key={slot}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "5px 0",
                    borderBottom: "1px solid rgba(255,255,255,.05)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "9px",
                      color: "rgba(180,210,240,.4)",
                      width: "80px",
                      flexShrink: 0,
                    }}
                  >
                    {SLOT_LABELS[slot]}
                  </span>
                  <span
                    style={{
                      fontSize: "9px",
                      color: "#ddeeff",
                      flex: 1,
                      paddingRight: "8px",
                      lineHeight: 1.4,
                    }}
                  >
                    {c!.name}
                  </span>
                  <span
                    style={{ fontSize: "9px", color: "#5b9bd5", flexShrink: 0 }}
                  >
                    ${c!.price}
                  </span>
                </div>
              ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={handleCopy}
            disabled={slotsFilled === 0}
            style={{
              padding: "11px",
              background: "rgba(91,155,213,.12)",
              border: "1px solid rgba(91,155,213,.3)",
              borderRadius: "6px",
              color: "#5b9bd5",
              fontSize: "11px",
              fontFamily: "monospace",
              cursor: slotsFilled === 0 ? "not-allowed" : "pointer",
              opacity: slotsFilled === 0 ? 0.4 : 1,
            }}
          >
            {copied ? "✓ Copied to clipboard" : "📋 Copy build summary"}
          </button>
          <button
            onClick={() =>
              setBuild({
                cpu: null,
                motherboard: null,
                gpu: null,
                ram: null,
                storage: null,
                cooler: null,
                psu: null,
              })
            }
            disabled={slotsFilled === 0}
            style={{
              padding: "11px",
              background: "none",
              border: "1px solid rgba(255,255,255,.1)",
              borderRadius: "6px",
              color: "rgba(180,210,240,.45)",
              fontSize: "11px",
              fontFamily: "monospace",
              cursor: slotsFilled === 0 ? "not-allowed" : "pointer",
              opacity: slotsFilled === 0 ? 0.4 : 1,
            }}
          >
            Reset build
          </button>
        </div>
      </div>
    </div>
  );
}
