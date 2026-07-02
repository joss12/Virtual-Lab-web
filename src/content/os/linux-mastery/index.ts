import * as linuxArchitecture from "./linux-architecture";
import * as linuxFilesystem from "./linux-filesystem";
import * as linuxShell from "./linux-shell";
import * as linuxUsers from "./linux-users";
import * as linuxPackages from "./linux-packages";
import * as linuxServices from "./linux-services";
import * as linuxNetworking from "./linux-networking";
import * as linuxAdvanced from "./linux-advanced";

export const linuxMasteryLessons = [
  {
    id: "linux-architecture",
    title: "Linux Architecture",
    description: "Linux kernel architecture, system calls, and core components",
    ...linuxArchitecture,
  },
  {
    id: "linux-filesystem",
    title: "Linux Filesystem",
    description: "ext4, XFS, Btrfs internals, and filesystem hierarchy",
    ...linuxFilesystem,
  },
  {
    id: "linux-shell",
    title: "Shell & Bash",
    description: "Bash scripting, shell internals, and command-line mastery",
    ...linuxShell,
  },
  {
    id: "linux-users",
    title: "Users & Permissions",
    description: "User management, permissions, ACLs, and sudo",
    ...linuxUsers,
  },
  {
    id: "linux-packages",
    title: "Package Management",
    description: "apt, yum, pacman internals and package building",
    ...linuxPackages,
  },
  {
    id: "linux-services",
    title: "systemd & Services",
    description: "systemd architecture, unit files, and service management",
    ...linuxServices,
  },
  {
    id: "linux-networking",
    title: "Linux Networking",
    description:
      "Network stack, iptables, routing, and network troubleshooting",
    ...linuxNetworking,
  },
  {
    id: "linux-advanced",
    title: "Linux Advanced",
    description: "Kernel modules, SELinux, cgroups, and performance tuning",
    ...linuxAdvanced,
  },
];
