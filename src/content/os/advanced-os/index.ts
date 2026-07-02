import * as virtualMemoryDeepDive from "./virtual-memory-deep-dive";
import * as hypervisors from "./hypervisors";
import * as containers from "./containers";
import * as osSecurity from "./os-security";
import * as performanceTuning from "./performance-tuning";

export const advancedLessons = [
  {
    id: "virtual-memory-deep-dive",
    title: "Virtual Memory Deep Dive",
    description:
      "Page tables, TLB, demand paging, copy-on-write, huge pages, and NUMA architecture",
    ...virtualMemoryDeepDive,
  },
  {
    id: "hypervisors",
    title: "Hypervisors",
    description:
      "VT-x, VMCS, EPT, KVM architecture, SR-IOV, and live migration internals",
    ...hypervisors,
  },
  {
    id: "containers",
    title: "Containers",
    description:
      "Namespaces, cgroups, OCI runtime, OverlayFS, and container security",
    ...containers,
  },
  {
    id: "os-security",
    title: "OS Security",
    description:
      "Dirty COW, KASLR, SMEP/SMAP, exploit techniques, and hardening strategies",
    ...osSecurity,
  },
  {
    id: "performance-tuning",
    title: "Performance Tuning",
    description:
      "perf, eBPF, flamegraphs, cache optimization, and real-world case studies",
    ...performanceTuning,
  },
];
