import * as macosArchitecture from "./macos-architecture";
import * as macosFilesystem from "./macos-filesystem";
import * as macosTerminal from "./macos-terminal";
import * as macosHomebrew from "./macos-homebrew";
import * as macosSecurity from "./macos-security";
import * as macosServices from "./macos-services";
import * as macosAdvanced from "./macos-advanced";

export const macosMasteryLessons = [
  {
    id: "macos-architecture",
    title: "macOS Architecture",
    description:
      "XNU kernel, Mach microkernel, BSD subsystem, Apple Silicon, and Secure Enclave",
    ...macosArchitecture,
  },
  {
    id: "macos-filesystem",
    title: "macOS Filesystem",
    description:
      "APFS internals, copy-on-write, snapshots, encryption, and Signed System Volume",
    ...macosFilesystem,
  },
  {
    id: "macos-terminal",
    title: "Terminal & zsh",
    description:
      "zsh mastery, oh-my-zsh, macOS-specific commands, and defaults system",
    ...macosTerminal,
  },
  {
    id: "macos-homebrew",
    title: "Homebrew",
    description:
      "Package management, formulae vs casks, Brewfile, and performance tips",
    ...macosHomebrew,
  },
  {
    id: "macos-security",
    title: "macOS Security",
    description:
      "Code signing, Gatekeeper, notarization, TCC, sandboxing, and Keychain internals",
    ...macosSecurity,
  },
  {
    id: "macos-services",
    title: "launchd & Services",
    description:
      "launchd architecture, LaunchDaemons vs LaunchAgents, XPC, and socket activation",
    ...macosServices,
  },
  {
    id: "macos-advanced",
    title: "macOS Advanced",
    description:
      "Instruments, DTrace, fs_usage, Activity Monitor internals, and performance tuning",
    ...macosAdvanced,
  },
];
