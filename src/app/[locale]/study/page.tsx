"use client";

import { useState } from "react";
import Link from "next/link";
import { STUDY_DATA } from "@/lib/studyData";
import { useProgressStore } from "@/store/useProgressStore";
import { useAuthStore } from "@/store/useAuthStore";

const CATEGORIES = [
  "All",
  "Input",
  "Output",
  "Processing",
  "Memory",
  "Core",
  "Connectivity",
  "Architecture",
] as const;

type Lang = "en" | "fr";
type LT = { en: string; fr: string } | string;

function t(value: LT | undefined, lang: Lang): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value.en ?? "";
}

const CATEGORY_LABELS: Record<
  Exclude<(typeof CATEGORIES)[number], "All">,
  { en: string; fr: string }
> = {
  Input: { en: "Input", fr: "Entrée" },
  Output: { en: "Output", fr: "Sortie" },
  Processing: { en: "Processing", fr: "Traitement" },
  Memory: { en: "Memory", fr: "Mémoire" },
  Core: { en: "Core", fr: "Noyau" },
  Connectivity: { en: "Connectivity", fr: "Connectivité" },
  Architecture: { en: "Architecture", fr: "Architecture" },
};

function categoryLabel(category: (typeof CATEGORIES)[number], lang: Lang) {
  if (category === "All") return lang === "fr" ? "Tous" : "All";
  return CATEGORY_LABELS[category][lang];
}

export default function StudyPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<(typeof CATEGORIES)[number]>("All");
  const [lang, setLang] = useState<Lang>("en");

  const { progress } = useProgressStore();
  const { isAuthenticated } = useAuthStore();

  const components = Object.entries(STUDY_DATA);

  const filtered = components.filter(([_id, data]) => {
    const matchCategory =
      activeCategory === "All" ||
      t(data.cat, lang) === categoryLabel(activeCategory, lang);

    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t(data.name, lang).toLowerCase().includes(q) ||
      t(data.cat, lang).toLowerCase().includes(q) ||
      t(data.tag, lang).toLowerCase().includes(q);

    return matchCategory && matchSearch;
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
      <div
        style={{
          marginBottom: "28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "9px",
              letterSpacing: ".14em",
              color: "rgba(91,155,213,.6)",
              marginBottom: "6px",
            }}
          >
            VIRTUAL LAB
          </div>

          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#ddeeff",
              margin: "0 0 4px",
            }}
          >
            {lang === "fr" ? "Étudier" : "Study"}
          </h1>

          <p
            style={{
              fontSize: "11px",
              color: "rgba(180,210,240,.45)",
              margin: 0,
            }}
          >
            {components.length}{" "}
            {lang === "fr"
              ? "composants — cliquez pour apprendre"
              : "components — click any to start learning"}
          </p>
        </div>

        <div style={{ display: "flex", gap: "6px" }}>
          {(["en", "fr"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                padding: "5px 14px",
                fontFamily: "monospace",
                fontSize: "10px",
                borderRadius: "5px",
                cursor: "pointer",
                border:
                  lang === l
                    ? "1px solid #5b9bd5"
                    : "1px solid rgba(255,255,255,.1)",
                background: lang === l ? "rgba(91,155,213,.15)" : "none",
                color: lang === l ? "#5b9bd5" : "rgba(180,210,240,.5)",
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            lang === "fr"
              ? "Rechercher des composants..."
              : "Search components..."
          }
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

      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "28px",
          flexWrap: "wrap",
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "5px 14px",
              fontFamily: "monospace",
              fontSize: "10px",
              borderRadius: "5px",
              cursor: "pointer",
              border:
                activeCategory === cat
                  ? "1px solid #5b9bd5"
                  : "1px solid rgba(255,255,255,.1)",
              background:
                activeCategory === cat ? "rgba(91,155,213,.15)" : "none",
              color:
                activeCategory === cat ? "#5b9bd5" : "rgba(180,210,240,.5)",
            }}
          >
            {categoryLabel(cat, lang)}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "12px",
        }}
      >
        {filtered.map(([id, data]) => {
          const p = progress.find((x) => x.component === id);
          const pct = p ? Math.round((p.tabs_visited.length / 5) * 100) : 0;
          const completed = p?.completed ?? false;

          return (
            <Link
              key={id}
              href={`/study/${id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,.025)",
                  border: `1px solid ${
                    completed ? "rgba(68,204,136,.3)" : "rgba(255,255,255,.07)"
                  }`,
                  borderRadius: "10px",
                  padding: "18px",
                  cursor: "pointer",
                  transition: "all .2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(91,155,213,.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = completed
                    ? "rgba(68,204,136,.3)"
                    : "rgba(255,255,255,.07)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <span style={{ fontSize: "28px" }}>{data.icon}</span>

                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      alignItems: "center",
                    }}
                  >
                    {completed && (
                      <span
                        style={{
                          fontSize: "8px",
                          padding: "2px 7px",
                          borderRadius: "3px",
                          background: "rgba(68,204,136,.15)",
                          color: "#44cc88",
                        }}
                      >
                        {lang === "fr" ? "TERMINÉ" : "COMPLETE"}
                      </span>
                    )}

                    <span
                      style={{
                        fontSize: "8px",
                        padding: "2px 7px",
                        borderRadius: "3px",
                        background: "rgba(91,155,213,.1)",
                        color: "rgba(91,155,213,.7)",
                      }}
                    >
                      {t(data.cat, lang)}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 700,
                    color: "#ddeeff",
                    marginBottom: "4px",
                  }}
                >
                  {t(data.name, lang)}
                </div>

                <div
                  style={{
                    fontSize: "10px",
                    color: "rgba(180,210,240,.5)",
                    marginBottom: "12px",
                    lineHeight: 1.5,
                  }}
                >
                  {t(data.tag, lang)}
                </div>

                {isAuthenticated && (
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "9px",
                        color: "rgba(180,210,240,.35)",
                        marginBottom: "4px",
                      }}
                    >
                      <span>{lang === "fr" ? "Progression" : "Progress"}</span>
                      <span>{pct}%</span>
                    </div>

                    <div
                      style={{
                        height: "3px",
                        background: "rgba(255,255,255,.06)",
                        borderRadius: "2px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: completed ? "#44cc88" : "#5b9bd5",
                          borderRadius: "2px",
                          transition: "width .4s",
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            color: "rgba(180,210,240,.3)",
            fontSize: "12px",
          }}
        >
          {lang === "fr"
            ? "Aucun composant trouvé."
            : "No components found matching your search."}
        </div>
      )}
    </div>
  );
}

// "use client";
//
// import { useState } from "react";
// import Link from "next/link";
// import { STUDY_DATA } from "@/lib/studyData";
// import { useProgressStore } from "@/store/useProgressStore";
// import { useAuthStore } from "@/store/useAuthStore";
//
// const CATEGORIES = [
//   "All",
//   "Input",
//   "Output",
//   "Processing",
//   "Memory",
//   "Core",
//   "Connectivity",
//   "Architecture",
// ];
//
// type Lang = "en" | "fr";
//
// function t(
//   value: { en: string; fr: string } | string | undefined,
//   lang: Lang,
// ): string {
//   if (!value) return "";
//   if (typeof value === "string") return value;
//   return value[lang] ?? value.en ?? "";
// }
//
// export default function StudyPage() {
//   const [search, setSearch] = useState("");
//   const [activeCategory, setActiveCategory] = useState("All");
//   const [lang, setLang] = useState<Lang>("en");
//   const { progress } = useProgressStore();
//   const { isAuthenticated } = useAuthStore();
//
//   const components = Object.entries(STUDY_DATA);
//
//   const filtered = components.filter(([_id, data]) => {
//     const matchCategory =
//       activeCategory === "All" || t(data.cat, lang) === activeCategory;
//     const q = search.toLowerCase();
//     const matchSearch =
//       !q ||
//       t(data.name, lang).toLowerCase().includes(q) ||
//       t(data.cat, lang).toLowerCase().includes(q) ||
//       t(data.tag, lang).toLowerCase().includes(q);
//     return matchCategory && matchSearch;
//   });
//
//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: "#0d1420",
//         fontFamily: "monospace",
//         color: "#ddeeff",
//         padding: "32px 24px",
//       }}
//     >
//       <div
//         style={{
//           marginBottom: "28px",
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "flex-start",
//         }}
//       >
//         <div>
//           <div
//             style={{
//               fontSize: "9px",
//               letterSpacing: ".14em",
//               color: "rgba(91,155,213,.6)",
//               marginBottom: "6px",
//             }}
//           >
//             VIRTUAL LAB
//           </div>
//           <h1
//             style={{
//               fontSize: "24px",
//               fontWeight: 700,
//               color: "#ddeeff",
//               margin: "0 0 4px",
//             }}
//           >
//             {lang === "fr" ? "Étudier" : "Study"}
//           </h1>
//           <p
//             style={{
//               fontSize: "11px",
//               color: "rgba(180,210,240,.45)",
//               margin: 0,
//             }}
//           >
//             {components.length}{" "}
//             {lang === "fr"
//               ? "composants — cliquez pour apprendre"
//               : "components — click any to start learning"}
//           </p>
//         </div>
//         <div style={{ display: "flex", gap: "6px" }}>
//           {(["en", "fr"] as Lang[]).map((l) => (
//             <button
//               key={l}
//               onClick={() => setLang(l)}
//               style={{
//                 padding: "5px 14px",
//                 fontFamily: "monospace",
//                 fontSize: "10px",
//                 borderRadius: "5px",
//                 cursor: "pointer",
//                 border:
//                   lang === l
//                     ? "1px solid #5b9bd5"
//                     : "1px solid rgba(255,255,255,.1)",
//                 background: lang === l ? "rgba(91,155,213,.15)" : "none",
//                 color: lang === l ? "#5b9bd5" : "rgba(180,210,240,.5)",
//               }}
//             >
//               {l.toUpperCase()}
//             </button>
//           ))}
//         </div>
//       </div>
//
//       <div style={{ marginBottom: "16px" }}>
//         <input
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           placeholder={
//             lang === "fr"
//               ? "Rechercher des composants..."
//               : "Search components..."
//           }
//           style={{
//             width: "100%",
//             padding: "10px 14px",
//             background: "rgba(255,255,255,.05)",
//             border: "1px solid rgba(91,155,213,.25)",
//             borderRadius: "8px",
//             color: "#ddeeff",
//             fontFamily: "monospace",
//             fontSize: "12px",
//             outline: "none",
//             boxSizing: "border-box",
//           }}
//         />
//       </div>
//
//       <div
//         style={{
//           display: "flex",
//           gap: "6px",
//           marginBottom: "28px",
//           flexWrap: "wrap",
//         }}
//       >
//         {CATEGORIES.map((cat) => (
//           <button
//             key={cat}
//             onClick={() => setActiveCategory(cat)}
//             style={{
//               padding: "5px 14px",
//               fontFamily: "monospace",
//               fontSize: "10px",
//               borderRadius: "5px",
//               cursor: "pointer",
//               border:
//                 activeCategory === cat
//                   ? "1px solid #5b9bd5"
//                   : "1px solid rgba(255,255,255,.1)",
//               background:
//                 activeCategory === cat ? "rgba(91,155,213,.15)" : "none",
//               color:
//                 activeCategory === cat ? "#5b9bd5" : "rgba(180,210,240,.5)",
//             }}
//           >
//             {cat}
//           </button>
//         ))}
//       </div>
//
//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
//           gap: "12px",
//         }}
//       >
//         {filtered.map(([id, data]) => {
//           const p = progress.find((x) => x.component === id);
//           const pct = p ? Math.round((p.tabs_visited.length / 5) * 100) : 0;
//           const completed = p?.completed ?? false;
//           return (
//             <Link
//               key={id}
//               href={`/study/${id}`}
//               style={{ textDecoration: "none" }}
//             >
//               <div
//                 style={{
//                   background: "rgba(255,255,255,.025)",
//                   border: `1px solid ${completed ? "rgba(68,204,136,.3)" : "rgba(255,255,255,.07)"}`,
//                   borderRadius: "10px",
//                   padding: "18px",
//                   cursor: "pointer",
//                   transition: "all .2s",
//                 }}
//                 onMouseEnter={(e) =>
//                   (e.currentTarget.style.borderColor = "rgba(91,155,213,.4)")
//                 }
//                 onMouseLeave={(e) =>
//                   (e.currentTarget.style.borderColor = completed
//                     ? "rgba(68,204,136,.3)"
//                     : "rgba(255,255,255,.07)")
//                 }
//               >
//                 <div
//                   style={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     alignItems: "flex-start",
//                     marginBottom: "10px",
//                   }}
//                 >
//                   <span style={{ fontSize: "28px" }}>{data.icon}</span>
//                   <div
//                     style={{
//                       display: "flex",
//                       gap: "6px",
//                       alignItems: "center",
//                     }}
//                   >
//                     {completed && (
//                       <span
//                         style={{
//                           fontSize: "8px",
//                           padding: "2px 7px",
//                           borderRadius: "3px",
//                           background: "rgba(68,204,136,.15)",
//                           color: "#44cc88",
//                         }}
//                       >
//                         {lang === "fr" ? "TERMINÉ" : "COMPLETE"}
//                       </span>
//                     )}
//                     <span
//                       style={{
//                         fontSize: "8px",
//                         padding: "2px 7px",
//                         borderRadius: "3px",
//                         background: "rgba(91,155,213,.1)",
//                         color: "rgba(91,155,213,.7)",
//                       }}
//                     >
//                       {t(data.cat, lang)}
//                     </span>
//                   </div>
//                 </div>
//                 <div
//                   style={{
//                     fontSize: "14px",
//                     fontWeight: 700,
//                     color: "#ddeeff",
//                     marginBottom: "4px",
//                   }}
//                 >
//                   {t(data.name, lang)}
//                 </div>
//                 <div
//                   style={{
//                     fontSize: "10px",
//                     color: "rgba(180,210,240,.5)",
//                     marginBottom: "12px",
//                     lineHeight: 1.5,
//                   }}
//                 >
//                   {t(data.tag, lang)}
//                 </div>
//                 {isAuthenticated && (
//                   <div>
//                     <div
//                       style={{
//                         display: "flex",
//                         justifyContent: "space-between",
//                         fontSize: "9px",
//                         color: "rgba(180,210,240,.35)",
//                         marginBottom: "4px",
//                       }}
//                     >
//                       <span>{lang === "fr" ? "Progression" : "Progress"}</span>
//                       <span>{pct}%</span>
//                     </div>
//                     <div
//                       style={{
//                         height: "3px",
//                         background: "rgba(255,255,255,.06)",
//                         borderRadius: "2px",
//                         overflow: "hidden",
//                       }}
//                     >
//                       <div
//                         style={{
//                           height: "100%",
//                           width: `${pct}%`,
//                           background: completed ? "#44cc88" : "#5b9bd5",
//                           borderRadius: "2px",
//                           transition: "width .4s",
//                         }}
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </Link>
//           );
//         })}
//       </div>
//
//       {filtered.length === 0 && (
//         <div
//           style={{
//             textAlign: "center",
//             padding: "40px",
//             color: "rgba(180,210,240,.3)",
//             fontSize: "12px",
//           }}
//         >
//           {lang === "fr"
//             ? "Aucun composant trouvé."
//             : "No components found matching your search."}
//         </div>
//       )}
//     </div>
//   );
// }
