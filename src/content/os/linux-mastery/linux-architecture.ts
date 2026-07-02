export const content = {
  en: `# Linux Architecture

Linux is not just an operating system — it is a kernel. The full operating system is called GNU/Linux, combining the Linux kernel with GNU tools and utilities.

## The Linux Stack

\`\`\`
┌─────────────────────────────────┐
│         User Applications       │  ← Firefox, VS Code, Terminal
├─────────────────────────────────┤
│         GNU Utilities           │  ← bash, ls, grep, gcc
├─────────────────────────────────┤
│         System Libraries        │  ← glibc, libm, libpthread
├─────────────────────────────────┤
│         System Call Interface   │  ← open(), read(), write(), fork()
├─────────────────────────────────┤
│         Linux Kernel            │  ← Process, Memory, FS, Network
├─────────────────────────────────┤
│         Hardware                │  ← CPU, RAM, Disk, Network
└─────────────────────────────────┘
\`\`\`

## The Linux Kernel

The Linux kernel is a **monolithic kernel** — all core OS services run in kernel space:

- **Process scheduler**: Decides which process runs next (CFS — Completely Fair Scheduler)
- **Memory manager**: Virtual memory, paging, mmap
- **Virtual File System (VFS)**: Abstraction layer over ext4, NTFS, FAT32
- **Network stack**: TCP/IP implementation
- **Device drivers**: Hardware communication
- **IPC**: Pipes, sockets, shared memory, signals

## GNU Tools

The kernel alone cannot do much. GNU tools provide the essential utilities:

| Tool | Purpose |
|---|---|
| bash | The default shell |
| gcc | C/C++ compiler |
| glibc | C standard library |
| coreutils | ls, cp, mv, rm, cat, echo... |
| grep, sed, awk | Text processing |
| make | Build automation |

## Linux Distributions

A **Linux distribution (distro)** is the kernel + package manager + default software:

| Distro | Based on | Package Manager | Use Case |
|---|---|---|---|
| Ubuntu | Debian | apt | Desktop, beginners |
| Debian | - | apt | Servers, stability |
| Fedora | RHEL | dnf | Developers |
| Arch Linux | - | pacman | Advanced users |
| CentOS/RHEL | - | yum/dnf | Enterprise servers |
| Alpine | - | apk | Containers, Docker |
| Kali | Debian | apt | Security/Penetration testing |

## The Linux Philosophy

Linux follows the **Unix philosophy**:
- Do one thing and do it well
- Programs work together through pipes and text streams
- Everything is a file (devices, processes, network sockets)

## Everything is a File

In Linux, almost everything is represented as a file:

\`\`\`bash
/dev/sda        # Your hard drive
/dev/null       # Discard output (the "black hole")
/dev/random     # Random number generator
/proc/cpuinfo   # CPU information (virtual file)
/proc/meminfo   # Memory information (virtual file)
/sys/class/net  # Network interfaces
\`\`\`

\`\`\`bash
# Read CPU info like a file
cat /proc/cpuinfo

# Read memory info
cat /proc/meminfo

# Discard output
command > /dev/null 2>&1
\`\`\`

## Linux Versions

\`\`\`bash
uname -r        # kernel version
uname -a        # full system info
lsb_release -a  # distro info
cat /etc/os-release  # distro details
\`\`\``,

  fr: `# Architecture Linux

Linux n'est pas juste un système d'exploitation — c'est un noyau. Le système d'exploitation complet s'appelle GNU/Linux, combinant le noyau Linux avec les outils et utilitaires GNU.

## La pile Linux

\`\`\`
┌─────────────────────────────────┐
│      Applications utilisateur  │  ← Firefox, VS Code, Terminal
├─────────────────────────────────┤
│         Utilitaires GNU         │  ← bash, ls, grep, gcc
├─────────────────────────────────┤
│       Bibliothèques système     │  ← glibc, libm, libpthread
├─────────────────────────────────┤
│    Interface d'appels système   │  ← open(), read(), write(), fork()
├─────────────────────────────────┤
│         Noyau Linux             │  ← Processus, Mémoire, FS, Réseau
├─────────────────────────────────┤
│           Matériel              │  ← CPU, RAM, Disque, Réseau
└─────────────────────────────────┘
\`\`\`

## Le noyau Linux

Le noyau Linux est un **noyau monolithique** — tous les services OS essentiels s'exécutent dans l'espace noyau :

- **Ordonnanceur de processus** : Décide quel processus s'exécute ensuite (CFS — Completely Fair Scheduler)
- **Gestionnaire de mémoire** : Mémoire virtuelle, pagination, mmap
- **Système de fichiers virtuel (VFS)** : Couche d'abstraction sur ext4, NTFS, FAT32
- **Pile réseau** : Implémentation TCP/IP
- **Pilotes de périphériques** : Communication matérielle
- **IPC** : Pipes, sockets, mémoire partagée, signaux

## Outils GNU

Le noyau seul ne peut pas faire grand-chose. Les outils GNU fournissent les utilitaires essentiels :

| Outil | Utilité |
|---|---|
| bash | Le shell par défaut |
| gcc | Compilateur C/C++ |
| glibc | Bibliothèque standard C |
| coreutils | ls, cp, mv, rm, cat, echo... |
| grep, sed, awk | Traitement de texte |
| make | Automatisation de compilation |

## Distributions Linux

Une **distribution Linux (distro)** est le noyau + gestionnaire de paquets + logiciels par défaut :

| Distro | Basée sur | Gestionnaire | Cas d'utilisation |
|---|---|---|---|
| Ubuntu | Debian | apt | Bureau, débutants |
| Debian | - | apt | Serveurs, stabilité |
| Fedora | RHEL | dnf | Développeurs |
| Arch Linux | - | pacman | Utilisateurs avancés |
| CentOS/RHEL | - | yum/dnf | Serveurs d'entreprise |
| Alpine | - | apk | Conteneurs, Docker |
| Kali | Debian | apt | Sécurité/Tests de pénétration |

## La philosophie Linux

Linux suit la **philosophie Unix** :
- Faire une chose et la faire bien
- Les programmes travaillent ensemble via des pipes et des flux de texte
- Tout est un fichier (périphériques, processus, sockets réseau)

## Tout est un fichier

Sous Linux, presque tout est représenté comme un fichier :

\`\`\`bash
/dev/sda        # Votre disque dur
/dev/null       # Jeter la sortie (le "trou noir")
/dev/random     # Générateur de nombres aléatoires
/proc/cpuinfo   # Informations CPU (fichier virtuel)
/proc/meminfo   # Informations mémoire (fichier virtuel)
/sys/class/net  # Interfaces réseau
\`\`\`

\`\`\`bash
# Lire les infos CPU comme un fichier
cat /proc/cpuinfo

# Lire les infos mémoire
cat /proc/meminfo

# Jeter la sortie
commande > /dev/null 2>&1
\`\`\`

## Versions Linux

\`\`\`bash
uname -r        # version du noyau
uname -a        # informations système complètes
lsb_release -a  # infos distro
cat /etc/os-release  # détails distro
\`\`\``,
};

export const quiz = {
  en: [
    {
      question: "What is the full name of the Linux operating system?",
      options: ["Linux", "GNU/Linux", "Unix/Linux", "Linus/Linux"],
      correct: 1,
    },
    {
      question: "What type of kernel is the Linux kernel?",
      options: [
        "Microkernel",
        "Hybrid kernel",
        "Monolithic kernel",
        "Exokernel",
      ],
      correct: 2,
    },
    {
      question: "Which package manager does Ubuntu use?",
      options: ["pacman", "dnf", "apt", "apk"],
      correct: 2,
    },
    {
      question: "What does /dev/null do?",
      options: [
        "Stores temporary files",
        "Discards any output sent to it",
        "Stores device drivers",
        "Contains kernel modules",
      ],
      correct: 1,
    },
    {
      question: "What scheduling algorithm does the Linux kernel use?",
      options: [
        "Round Robin",
        "First Come First Served",
        "Priority Scheduling",
        "Completely Fair Scheduler",
      ],
      correct: 3,
    },
  ],
  fr: [
    {
      question: "Quel est le nom complet du système d'exploitation Linux ?",
      options: ["Linux", "GNU/Linux", "Unix/Linux", "Linus/Linux"],
      correct: 1,
    },
    {
      question: "Quel type de noyau est le noyau Linux ?",
      options: [
        "Micronoyau",
        "Noyau hybride",
        "Noyau monolithique",
        "Exonoyau",
      ],
      correct: 2,
    },
    {
      question: "Quel gestionnaire de paquets Ubuntu utilise-t-il ?",
      options: ["pacman", "dnf", "apt", "apk"],
      correct: 2,
    },
    {
      question: "Que fait /dev/null ?",
      options: [
        "Stocke les fichiers temporaires",
        "Jette toute sortie qui lui est envoyée",
        "Stocke les pilotes de périphériques",
        "Contient les modules noyau",
      ],
      correct: 1,
    },
    {
      question:
        "Quel algorithme d'ordonnancement le noyau Linux utilise-t-il ?",
      options: [
        "Round Robin",
        "Premier arrivé premier servi",
        "Ordonnancement par priorité",
        "Completely Fair Scheduler",
      ],
      correct: 3,
    },
  ],
};
