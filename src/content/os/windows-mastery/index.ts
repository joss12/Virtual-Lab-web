import * as windowsArchitecture from "./windows-architecture";
import * as windowsRegistry from "./windows-registry";
import * as windowsPowershell from "./windows-powershell";
import * as windowsActiveDirectory from "./windows-active-directory";
import * as windowsServices from "./windows-services";
import * as windowsSecurity from "./windows-security";
import * as windowsAdvanced from "./windows-advanced";

export const windowsMasteryLessons = [
  {
    id: "windows-architecture",
    title: "Windows Architecture",
    description: "NT kernel, HAL, Win32 subsystem, and Windows internals",
    ...windowsArchitecture,
  },
  {
    id: "windows-registry",
    title: "Windows Registry",
    description: "Registry structure, hives, keys, and registry manipulation",
    ...windowsRegistry,
  },
  {
    id: "windows-powershell",
    title: "PowerShell",
    description: "PowerShell scripting, cmdlets, pipeline, and automation",
    ...windowsPowershell,
  },
  {
    id: "windows-active-directory",
    title: "Active Directory",
    description: "AD architecture, domains, GPOs, and authentication",
    ...windowsActiveDirectory,
  },
  {
    id: "windows-services",
    title: "Windows Services",
    description: "Service Control Manager, service creation, and management",
    ...windowsServices,
  },
  {
    id: "windows-security",
    title: "Windows Security",
    description: "UAC, Windows Defender, BitLocker, and security features",
    ...windowsSecurity,
  },
  {
    id: "windows-advanced",
    title: "Windows Advanced",
    description: "WMI, ETW, Performance Monitor, and advanced troubleshooting",
    ...windowsAdvanced,
  },
];
