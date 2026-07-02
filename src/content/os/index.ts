import { foundationsLessons } from "./foundations";
import { linuxMasteryLessons } from "./linux-mastery";
import { windowsMasteryLessons } from "./windows-mastery";
import { macosMasteryLessons } from "./macos-mastery";
import { advancedLessons } from "./advanced-os";

export const osTracks = [
  {
    id: "foundations",
    title: "Foundations",
    description:
      "Core operating system concepts that apply across all platforms",
    lessons: foundationsLessons,
  },
  {
    id: "linux-mastery",
    title: "Linux Mastery",
    description:
      "Deep dive into Linux: architecture, shell, services, networking, and advanced topics",
    lessons: linuxMasteryLessons,
  },
  {
    id: "windows-mastery",
    title: "Windows Mastery",
    description:
      "Windows internals: NT architecture, Registry, PowerShell, Active Directory, and security",
    lessons: windowsMasteryLessons,
  },
  {
    id: "macos-mastery",
    title: "macOS Mastery",
    description:
      "macOS deep dive: XNU kernel, APFS, zsh, Homebrew, security, and performance tools",
    lessons: macosMasteryLessons,
  },
  {
    id: "advanced",
    title: "Advanced OS",
    description:
      "Expert-level topics: virtual memory, hypervisors, containers, security, and performance",
    lessons: advancedLessons,
  },
];

export const allOsLessons = [
  ...foundationsLessons,
  ...linuxMasteryLessons,
  ...windowsMasteryLessons,
  ...macosMasteryLessons,
  ...advancedLessons,
];

// Create osContent object for easy lookup by slug/id
export const osContent: Record<
  string,
  { content: { en: string; fr: string }; quiz: { en: any[]; fr: any[] } }
> = {};

// Map all lessons to osContent by their id
allOsLessons.forEach((lesson: any) => {
  osContent[lesson.id] = {
    content: lesson.content,
    quiz: lesson.quiz,
  };
});

// DEBUG: Log what we created
console.log("=== osContent keys ===", Object.keys(osContent));
console.log("=== First lesson ===", allOsLessons[0]);
console.log("=== windowsMasteryLessons ===", windowsMasteryLessons);
