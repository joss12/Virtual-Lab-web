"use client";

import { useState, useMemo } from "react";

// ─── Data ─────────────────────────────────────────────────────────────────────

type Category =
  | "Boot"
  | "Display"
  | "Performance"
  | "Thermal"
  | "Connectivity"
  | "Audio";

interface Problem {
  id: string;
  title: string;
  category: Category;
  difficulty: 1 | 2 | 3;
  symptoms: string[];
  cause: string;
  steps: string[];
  warning?: string;
}

const PROBLEMS: Problem[] = [
  {
    id: "no-post",
    title: "PC Powers On But No POST",
    category: "Boot",
    difficulty: 3,
    symptoms: [
      "Fans spin but no beep",
      "No image on screen",
      "RGB lights on but nothing happens",
      "Power LED on but blank screen",
    ],
    cause:
      "Usually faulty RAM seating, incompatible RAM, or a dead CMOS battery.",
    steps: [
      "Unplug the PC from the wall completely.",
      "Remove all RAM sticks. Reseat one stick in slot A2 only.",
      "Clear CMOS — remove the coin cell battery for 30 seconds, reinsert.",
      "Remove the GPU and connect display directly to motherboard HDMI.",
      "Try booting with bare minimum: CPU, one RAM stick, PSU, no drives.",
      "If still no POST, test RAM stick in slot B2 instead.",
      "If the board has a Q-Code LED or debug lights, photograph them and look up the code.",
      "Try a known-good PSU if available — a failing PSU can prevent POST.",
    ],
    warning: "Never reseat components while the PC is plugged in.",
  },
  {
    id: "black-screen",
    title: "Black Screen After Boot",
    category: "Display",
    difficulty: 2,
    symptoms: [
      "Windows loading spinner appears then black screen",
      "Can hear Windows startup sound",
      "Cursor visible on black background",
      "Works fine in Safe Mode",
    ],
    cause:
      "Usually a GPU driver crash, corrupted Windows display driver, or wrong display output.",
    steps: [
      "Boot into Safe Mode: hold Shift while clicking Restart → Troubleshoot → Advanced → Startup Settings → F4.",
      'In Safe Mode, open Device Manager → Display Adapters → right-click GPU → Uninstall device (check "Delete driver software").',
      "Restart normally. Windows will install a basic display driver.",
      "Download the latest GPU driver from NVIDIA or AMD website directly.",
      "If Safe Mode also black screens, boot from Windows USB and run Startup Repair.",
      "Check that your monitor cable is connected to the GPU ports, not the motherboard.",
    ],
  },
  {
    id: "bsod",
    title: "Blue Screen of Death (BSOD)",
    category: "Boot",
    difficulty: 2,
    symptoms: [
      "Random blue screen with error code",
      "PC restarts unexpectedly",
      "WHEA_UNCORRECTABLE_ERROR",
      "MEMORY_MANAGEMENT or PAGE_FAULT",
    ],
    cause:
      "RAM errors, overclocking instability, failing drive, or driver conflicts.",
    steps: [
      "Note the exact error code shown on the blue screen.",
      'Run Windows Memory Diagnostic: search "mdsched" → restart now and check for problems.',
      'Run chkdsk: open CMD as admin → type "chkdsk C: /f /r" → restart.',
      "If overclocking, disable XMP/EXPO in BIOS and test at stock speeds.",
      "Update all drivers — especially chipset, GPU, and storage drivers.",
      'Check Event Viewer: search "eventvwr" → Windows Logs → System → look for red errors.',
      "If WHEA_UNCORRECTABLE_ERROR: check CPU and RAM voltages in BIOS, reseat RAM.",
    ],
    warning:
      "If BSOD occurs during POST or before Windows loads, this is a hardware issue, not software.",
  },
  {
    id: "overheating",
    title: "CPU / GPU Overheating",
    category: "Thermal",
    difficulty: 2,
    symptoms: [
      "Temperatures above 90°C under load",
      "PC throttles or slows down",
      "System shuts off during gaming",
      "HWiNFO shows thermal throttling",
    ],
    cause:
      "Dried thermal paste, blocked airflow, or inadequate cooling for the component TDP.",
    steps: [
      "Download HWiNFO64 and monitor temps under load for 10 minutes.",
      "Check case airflow: front fans should intake, rear/top fans should exhaust.",
      "Clean all dust filters and heatsink fins with compressed air.",
      "If CPU is over 90°C: replace thermal paste. Use Thermal Grizzly Kryonaut.",
      "To replace paste: remove cooler, clean old paste with 99% isopropyl alcohol, apply pea-sized dot to CPU center.",
      "Check cooler mounting — screws should be equally tight in X pattern.",
      "For GPU: check that the card has 2-3cm clearance below it for airflow.",
      "If temps are still high after paste replacement, consider upgrading the cooler.",
    ],
  },
  {
    id: "wont-turn-on",
    title: "PC Will Not Turn On At All",
    category: "Boot",
    difficulty: 3,
    symptoms: [
      "Nothing happens when pressing power button",
      "No fans spin at all",
      "No lights anywhere",
      "PSU makes clicking sound",
    ],
    cause: "Dead PSU, loose power connections, or failed power button header.",
    steps: [
      "Check the PSU rocker switch on the back — make sure it is set to I (on).",
      "Check the wall outlet works by plugging in another device.",
      "Check the 24-pin ATX and 8-pin EPS cables are fully seated.",
      "Try the PSU paperclip test: unplug all cables from board, short the green and any black pin on the 24-pin connector with a paperclip. If PSU fan spins, PSU is alive.",
      "Check the front panel power button header on the motherboard — consult manual for correct pinout.",
      "Try shorting the power button pins directly with a screwdriver to rule out broken power button.",
      "If PSU fan does not spin in paperclip test, the PSU is dead — replace it.",
    ],
    warning:
      "The paperclip test is safe but do not run the PSU without a load for more than a few seconds.",
  },
  {
    id: "random-restart",
    title: "Random Restarts / Shutdowns",
    category: "Boot",
    difficulty: 2,
    symptoms: [
      "PC restarts without warning",
      "No BSOD before restart",
      "Happens more under load",
      "Event log shows critical power error",
    ],
    cause: "PSU failing under load, overheating, or RAM instability.",
    steps: [
      "Check all temperatures in HWiNFO — shutdowns under load are usually thermal.",
      "Check PSU wattage — calculate your system draw and ensure PSU has 20% headroom.",
      "Run Prime95 small FFTs for 10 minutes — if PC restarts, CPU power delivery or thermals.",
      "Run FurMark for 5 minutes — if restart, GPU power or thermals.",
      'Check Event Viewer for "Kernel-Power Event ID 41" — this confirms unexpected power loss.',
      "Test with XMP/EXPO disabled in BIOS — RAM instability causes sudden restarts.",
      "If restarts only happen under load and PSU is old (3+ years), replace the PSU.",
    ],
  },
  {
    id: "slow-performance",
    title: "PC Suddenly Slow",
    category: "Performance",
    difficulty: 1,
    symptoms: [
      "Everything feels sluggish",
      "High disk usage in Task Manager",
      "CPU usage at 100% idle",
      "Games have low FPS vs before",
    ],
    cause: "Background processes, full storage drive, or thermal throttling.",
    steps: [
      "Open Task Manager (Ctrl+Shift+Esc) → sort by CPU, then Memory, then Disk.",
      "Kill any process using excessive resources that you do not recognise.",
      "Check disk space — Windows slows dramatically below 10% free space.",
      'Run "cleanmgr" (Disk Cleanup) and clear temporary files.',
      "Check HWiNFO for CPU throttling — a throttled CPU runs at base clock only.",
      "Disable startup programs: Task Manager → Startup tab → disable unnecessary apps.",
      'Run "sfc /scannow" in admin CMD to check for corrupted Windows files.',
      "Check if Windows Update or antivirus is running in the background.",
    ],
  },
  {
    id: "no-display",
    title: "No Display Signal",
    category: "Display",
    difficulty: 2,
    symptoms: [
      '"No signal" on monitor',
      "Monitor shows input source but nothing from PC",
      "Works on integrated graphics but not GPU",
      "Only works on one of multiple ports",
    ],
    cause: "Wrong display output, loose cable, or GPU not seated properly.",
    steps: [
      "Check that your cable is connected to the GPU ports (bottom of PC), not the motherboard ports.",
      "Try a different cable — HDMI and DisplayPort cables can fail.",
      "Try a different port on the GPU — use DisplayPort over HDMI when possible.",
      "Reseat the GPU: remove it fully, clean the PCIe slot with compressed air, firmly reinsert until the clip clicks.",
      "Check that the PCIe power cables are connected to the GPU.",
      "Try connecting to the motherboard HDMI to confirm CPU has integrated graphics and system boots.",
      "In BIOS, ensure primary display is set to PCIe/GPU, not iGPU.",
    ],
  },
  {
    id: "usb-not-detected",
    title: "USB Device Not Detected",
    category: "Connectivity",
    difficulty: 1,
    symptoms: [
      "USB device not recognised",
      'Device shows as "Unknown Device"',
      "Intermittent connection",
      "Only back panel USB works",
    ],
    cause:
      "Driver issue, faulty USB header connection, or power delivery problem.",
    steps: [
      "Try the device on a different USB port — front panel headers are sometimes loose.",
      "Try a different USB cable if applicable.",
      "Open Device Manager → View → Show hidden devices → look for Unknown Device with warning icon.",
      "Right-click the Unknown Device → Update driver → Search automatically.",
      'Check USB power settings: Device Manager → Universal Serial Bus Controllers → right-click each hub → Properties → Power Management → uncheck "Allow computer to turn off this device to save power".',
      "For front panel USB issues: check the USB header cable is fully seated on the motherboard.",
      "In BIOS, ensure USB ports are not disabled.",
    ],
  },
  {
    id: "loud-fans",
    title: "Fans Extremely Loud",
    category: "Thermal",
    difficulty: 1,
    symptoms: [
      "Fans spin at full speed on startup",
      "Fan noise louder than usual under load",
      "GPU fans spin at 100% at idle",
      "Fans never slow down",
    ],
    cause:
      "Fan curve not configured, thermal sensor fault, or high ambient temperature.",
    steps: [
      "Download HWiNFO to check actual temperatures — loud fans may be a correct response to heat.",
      "Open BIOS → Hardware Monitor → configure fan curves. Set fans to ramp up above 60°C, not 40°C.",
      "For GPU fans: open MSI Afterburner → Fan tab → set a custom fan curve.",
      "If fans run at 100% on POST before Windows loads, it is a BIOS fan curve issue.",
      "Check that CPU cooler fan headers are connected to CPU_FAN not CHA_FAN — some boards handle them differently.",
      "If a case fan is grinding or rattling, it may have a failing bearing — replace it.",
    ],
  },
  {
    id: "pc-freezes",
    title: "PC Freezes / Hangs",
    category: "Performance",
    difficulty: 2,
    symptoms: [
      "Screen freezes with audio loop",
      "Mouse cursor stops moving",
      "Requires hard reset",
      "Freezes during specific tasks only",
    ],
    cause: "RAM instability, failing storage, or GPU driver crash.",
    steps: [
      "Run MemTest86 from a USB drive — let it complete at least 2 passes to check RAM.",
      "Run CrystalDiskInfo to check storage drive health — look for reallocated sectors.",
      "If freezes happen in specific games: update GPU drivers, lower in-game settings.",
      "Check Event Viewer for errors 5-10 minutes before the freeze timestamp.",
      "Disable XMP/EXPO in BIOS and test — overclocked RAM is a common freeze cause.",
      'Run "chkdsk C: /f /r" to check drive integrity.',
      "If using multiple RAM sticks, test with one stick at a time to isolate a faulty module.",
    ],
  },
  {
    id: "no-sound",
    title: "No Sound / Audio Not Working",
    category: "Audio",
    difficulty: 1,
    symptoms: [
      "No audio from speakers or headphones",
      "Audio device not found",
      "Sound plays but very quiet",
      "Only one channel works",
    ],
    cause:
      "Wrong audio output device selected, driver issue, or muted channel.",
    steps: [
      "Right-click the speaker icon in taskbar → Open Sound settings → check correct output device is selected.",
      "Check volume mixer — individual apps can be muted: right-click speaker → Open Volume Mixer.",
      'Right-click speaker → Sound settings → scroll to "Advanced" → More sound settings → check all devices.',
      "In Device Manager → Sound, video and game controllers — uninstall Realtek or HD Audio device, restart, let Windows reinstall.",
      "Download Realtek drivers directly from your motherboard manufacturer website.",
      "If using front panel audio: check HD Audio header is connected to the motherboard (not AC97).",
      "For GPU audio (HDMI/DP): ensure the correct HDMI audio output is selected, not the motherboard audio.",
    ],
  },
];

const CATEGORIES: Category[] = [
  "Boot",
  "Display",
  "Performance",
  "Thermal",
  "Connectivity",
  "Audio",
];

const CATEGORY_COLORS: Record<Category, string> = {
  Boot: "#5b9bd5",
  Display: "#aa44ff",
  Performance: "#22ccaa",
  Thermal: "#ff6622",
  Connectivity: "#ffcc22",
  Audio: "#44cc88",
};

const DIFFICULTY_LABELS = ["", "Easy", "Medium", "Advanced"];
const DIFFICULTY_COLORS = ["", "#44cc88", "#ffcc22", "#ff6622"];

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Troubleshoot() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return PROBLEMS.filter((p) => {
      const matchCategory = !activeCategory || p.category === activeCategory;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.symptoms.some((s) => s.toLowerCase().includes(q)) ||
        p.cause.toLowerCase().includes(q) ||
        p.steps.some((s) => s.toLowerCase().includes(q));
      return matchCategory && matchSearch;
    });
  }, [search, activeCategory]);

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
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div
          style={{
            fontSize: "9px",
            letterSpacing: ".14em",
            color: "rgba(91,155,213,.6)",
            marginBottom: "6px",
          }}
        >
          DIAGNOSTIC GUIDE
        </div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#ddeeff",
            margin: "0 0 4px",
          }}
        >
          Troubleshooting
        </h1>
        <p
          style={{
            fontSize: "11px",
            color: "rgba(180,210,240,.45)",
            margin: 0,
          }}
        >
          {PROBLEMS.length} common PC problems with step-by-step fixes.
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "16px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search symptoms, errors, or components..."
          style={{
            width: "100%",
            padding: "10px 14px",
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(91,155,213,.25)",
            borderRadius: "8px",
            color: "#ddeeff",
            fontFamily: "monospace",
            fontSize: "12px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Category filters */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "28px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setActiveCategory(null)}
          style={{
            padding: "5px 14px",
            fontFamily: "monospace",
            fontSize: "10px",
            borderRadius: "5px",
            cursor: "pointer",
            border: !activeCategory
              ? "1px solid #5b9bd5"
              : "1px solid rgba(255,255,255,.1)",
            background: !activeCategory ? "rgba(91,155,213,.15)" : "none",
            color: !activeCategory ? "#5b9bd5" : "rgba(180,210,240,.5)",
          }}
        >
          All ({PROBLEMS.length})
        </button>
        {CATEGORIES.map((cat) => {
          const count = PROBLEMS.filter((p) => p.category === cat).length;
          const active = activeCategory === cat;
          const col = CATEGORY_COLORS[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(active ? null : cat)}
              style={{
                padding: "5px 14px",
                fontFamily: "monospace",
                fontSize: "10px",
                borderRadius: "5px",
                cursor: "pointer",
                border: active
                  ? `1px solid ${col}`
                  : "1px solid rgba(255,255,255,.1)",
                background: active ? `${col}22` : "none",
                color: active ? col : "rgba(180,210,240,.5)",
              }}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Results count */}
      {(search || activeCategory) && (
        <div
          style={{
            fontSize: "10px",
            color: "rgba(180,210,240,.4)",
            marginBottom: "16px",
          }}
        >
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>
      )}

      {/* Problem cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "rgba(180,210,240,.3)",
              fontSize: "12px",
            }}
          >
            No problems found matching your search.
          </div>
        )}
        {filtered.map((problem) => {
          const isOpen = expanded === problem.id;
          const col = CATEGORY_COLORS[problem.category];

          return (
            <div
              key={problem.id}
              style={{
                background: isOpen
                  ? "rgba(255,255,255,.04)"
                  : "rgba(255,255,255,.025)",
                border: `1px solid ${isOpen ? "rgba(91,155,213,.3)" : "rgba(255,255,255,.07)"}`,
                borderRadius: "10px",
                overflow: "hidden",
                transition: "border-color .2s",
              }}
            >
              {/* Card header */}
              <div
                onClick={() => setExpanded(isOpen ? null : problem.id)}
                style={{
                  padding: "16px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "4px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#ddeeff",
                      }}
                    >
                      {problem.title}
                    </span>
                    <span
                      style={{
                        fontSize: "8px",
                        padding: "2px 7px",
                        borderRadius: "3px",
                        background: `${col}22`,
                        color: col,
                        letterSpacing: ".08em",
                      }}
                    >
                      {problem.category.toUpperCase()}
                    </span>
                    <span
                      style={{
                        fontSize: "8px",
                        padding: "2px 7px",
                        borderRadius: "3px",
                        background: `${DIFFICULTY_COLORS[problem.difficulty]}22`,
                        color: DIFFICULTY_COLORS[problem.difficulty],
                        letterSpacing: ".08em",
                      }}
                    >
                      {DIFFICULTY_LABELS[problem.difficulty].toUpperCase()}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "rgba(180,210,240,.5)",
                      lineHeight: 1.5,
                    }}
                  >
                    {problem.symptoms.slice(0, 2).join(" · ")}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    color: "rgba(91,155,213,.5)",
                    flexShrink: 0,
                  }}
                >
                  {isOpen ? "▲" : "▼"}
                </span>
              </div>

              {/* Expanded content */}
              {isOpen && (
                <div
                  style={{
                    padding: "0 18px 20px",
                    borderTop: "1px solid rgba(255,255,255,.06)",
                  }}
                >
                  {/* Symptoms */}
                  <div style={{ marginTop: "16px", marginBottom: "16px" }}>
                    <div
                      style={{
                        fontSize: "9px",
                        letterSpacing: ".1em",
                        color: "rgba(91,155,213,.5)",
                        marginBottom: "8px",
                      }}
                    >
                      SYMPTOMS
                    </div>
                    <div
                      style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}
                    >
                      {problem.symptoms.map((s, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: "10px",
                            padding: "3px 9px",
                            background: "rgba(255,255,255,.05)",
                            border: "1px solid rgba(255,255,255,.08)",
                            borderRadius: "4px",
                            color: "rgba(180,210,240,.7)",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Likely cause */}
                  <div
                    style={{
                      marginBottom: "16px",
                      padding: "10px 14px",
                      background: "rgba(255,180,0,.06)",
                      border: "1px solid rgba(255,180,0,.15)",
                      borderLeft: `3px solid #ffcc44`,
                      borderRadius: "0 6px 6px 0",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "9px",
                        color: "#ffdd66",
                        marginBottom: "3px",
                        letterSpacing: ".08em",
                      }}
                    >
                      LIKELY CAUSE
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "rgba(255,220,120,.8)",
                        lineHeight: 1.6,
                      }}
                    >
                      {problem.cause}
                    </div>
                  </div>

                  {/* Warning */}
                  {problem.warning && (
                    <div
                      style={{
                        marginBottom: "16px",
                        padding: "10px 14px",
                        background: "rgba(255,60,60,.06)",
                        border: "1px solid rgba(255,60,60,.2)",
                        borderLeft: "3px solid #ff4444",
                        borderRadius: "0 6px 6px 0",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "9px",
                          color: "#ff8888",
                          marginBottom: "3px",
                          letterSpacing: ".08em",
                        }}
                      >
                        ⚠ WARNING
                      </div>
                      <div
                        style={{
                          fontSize: "10px",
                          color: "rgba(255,150,150,.8)",
                          lineHeight: 1.6,
                        }}
                      >
                        {problem.warning}
                      </div>
                    </div>
                  )}

                  {/* Steps */}
                  <div>
                    <div
                      style={{
                        fontSize: "9px",
                        letterSpacing: ".1em",
                        color: "rgba(91,155,213,.5)",
                        marginBottom: "10px",
                      }}
                    >
                      FIX — STEP BY STEP
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                      }}
                    >
                      {problem.steps.map((step, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            gap: "12px",
                            alignItems: "flex-start",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "10px",
                              color: col,
                              fontWeight: 700,
                              minWidth: "18px",
                              paddingTop: "1px",
                              flexShrink: 0,
                            }}
                          >
                            {i + 1}.
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              color: "rgba(180,210,240,.8)",
                              lineHeight: 1.7,
                            }}
                          >
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
