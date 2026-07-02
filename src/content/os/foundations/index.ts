import * as whatIsAnOs from "./what-is-an-os";
import * as theKernel from "./the-kernel";
import * as processManagement from "./process-management";
import * as memoryManagement from "./memory-management";
import * as fileSystems from "./file-systems";
import * as ioAndDrivers from "./io-and-drivers";
import * as bootProcess from "./boot-process";

export const foundationsLessons = [
  {
    id: "what-is-an-os",
    title: "What is an Operating System?",
    description: "Understanding the role and purpose of operating systems",
    ...whatIsAnOs,
  },
  {
    id: "the-kernel",
    title: "The Kernel",
    description:
      "Core kernel concepts: monolithic, microkernel, and hybrid architectures",
    ...theKernel,
  },
  {
    id: "process-management",
    title: "Process Management",
    description: "How the OS manages processes, threads, and scheduling",
    ...processManagement,
  },
  {
    id: "memory-management",
    title: "Memory Management",
    description: "Virtual memory, paging, segmentation, and memory allocation",
    ...memoryManagement,
  },
  {
    id: "file-systems",
    title: "File Systems",
    description: "How operating systems organize and manage data on disk",
    ...fileSystems,
  },
  {
    id: "io-and-drivers",
    title: "I/O and Drivers",
    description: "Device drivers, I/O management, and hardware interaction",
    ...ioAndDrivers,
  },
  {
    id: "boot-process",
    title: "Boot Process",
    description:
      "From power-on to running OS: BIOS, bootloader, and kernel initialization",
    ...bootProcess,
  },
];
