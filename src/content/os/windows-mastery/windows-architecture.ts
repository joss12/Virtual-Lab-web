export const content = {
  en: `# Windows Architecture

Windows is built on the **Windows NT kernel** — a completely different codebase from the original MS-DOS based Windows. Understanding its architecture is the foundation of Windows mastery.

## The Big Picture

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                    USER MODE                            │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Win32 Apps │  │  .NET Apps   │  │  UWP Apps     │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                │                  │           │
│  ┌──────▼──────────────────────────────────▼───────┐   │
│  │           Subsystem DLLs                        │   │
│  │  kernel32.dll  ntdll.dll  user32.dll  gdi32.dll │   │
│  └──────────────────────┬──────────────────────────┘   │
├─────────────────────────┼───────────────────────────────┤
│                KERNEL MODE                │             │
│  ┌──────────────────────▼──────────────────────────┐   │
│  │           NT Executive                          │   │
│  │  Process Mgr │ Memory Mgr │ I/O Mgr │ Security  │   │
│  │  Object Mgr  │ Cache Mgr  │ PnP Mgr │ Power Mgr │   │
│  └──────────────────────┬──────────────────────────┘   │
│  ┌──────────────────────▼──────────────────────────┐   │
│  │           NT Kernel (ntoskrnl.exe)              │   │
│  │  Thread Scheduling │ Interrupt Handling         │   │
│  │  Synchronization   │ Exception Handling         │   │
│  └──────────────────────┬──────────────────────────┘   │
│  ┌──────────────────────▼──────────────────────────┐   │
│  │  HAL (Hardware Abstraction Layer)               │   │
│  └──────────────────────┬──────────────────────────┘   │
├─────────────────────────┼───────────────────────────────┤
│              HARDWARE   │                               │
│         CPU │ RAM │ Disk │ Network │ GPU                │
└─────────────────────────────────────────────────────────┘
\`\`\`

## The NT Kernel (ntoskrnl.exe)

The NT kernel is the heart of Windows. Unlike Linux's monolithic kernel, the NT kernel is a **hybrid kernel** — it has a microkernel-like base with monolithic executive services built on top.

**What the NT kernel does:**
- Thread scheduling and dispatching
- Interrupt and exception handling
- Synchronization primitives (mutexes, semaphores, events)
- Low-level hardware interaction via HAL

**Key insight**: The NT kernel itself is intentionally minimal. The real work happens in the **NT Executive** layer above it.

## Hardware Abstraction Layer (HAL)

The HAL sits between the kernel and the hardware. Its job is to make the kernel hardware-independent.

**Why HAL matters:**
- The same ntoskrnl.exe can run on x86, x64, and ARM
- HAL handles differences between APIC, ACPI, and platform-specific timers
- Hardware vendors can provide custom HAL extensions

\`\`\`
Without HAL: Kernel → specific hardware
With HAL:    Kernel → HAL → any hardware
\`\`\`

## NT Executive

The NT Executive runs in kernel mode and provides essential OS services:

### Object Manager
Everything in Windows is an **object** — files, processes, threads, registry keys, mutexes, events. The Object Manager:
- Creates, tracks, and destroys objects
- Manages reference counting (object lives until reference count = 0)
- Provides a unified namespace (\\Device\\HarddiskVolume1)
- Handles security descriptors on every object

\`\`\`
Object = Header + Body
Header: Type, Name, Reference Count, Security Descriptor
Body: Type-specific data (process: PID, threads, handles)
\`\`\`

### Process Manager
- Creates and terminates processes and threads
- Manages the **Process Environment Block (PEB)** and **Thread Environment Block (TEB)**
- Each process has a private virtual address space

### Memory Manager
- Virtual memory using a two-level page table
- **Working Set**: pages currently in physical RAM for a process
- **Page File** (pagefile.sys): virtual memory overflow to disk
- **Memory Mapped Files**: used for executables and shared libraries
- **Pool Memory**: kernel memory allocation (Paged Pool and NonPaged Pool)

### I/O Manager
- Manages all I/O in Windows through a unified model
- Creates **I/O Request Packets (IRPs)** — the fundamental unit of I/O
- Manages the driver stack: filter drivers → function driver → bus driver

### Security Reference Monitor (SRM)
- Enforces access control on every object access
- Checks the process **access token** against the object's **security descriptor**
- Implements **Discretionary Access Control (DAC)** and **Mandatory Integrity Control (MIC)**

## User Mode vs Kernel Mode Transition

When a Win32 app calls \`CreateFile()\`:

1. App calls \`CreateFile()\` in kernel32.dll
2. kernel32.dll calls \`NtCreateFile()\` in ntdll.dll
3. ntdll.dll executes a **syscall** instruction (switches to kernel mode)
4. The kernel's **System Service Dispatcher** routes to the correct handler
5. NT Executive handles the request
6. Returns to user mode with a handle or error code

This transition is expensive (~100ns) which is why minimizing syscalls is important for performance.

## Windows Subsystems

Windows supports multiple personality subsystems:

**Win32 Subsystem (csrss.exe)**:
- The primary Windows subsystem
- Handles Win32 console I/O and some GUI operations
- All Windows programs use this

**Windows Subsystem for Linux (WSL)**:
- WSL1: Translates Linux syscalls to NT syscalls
- WSL2: Full Linux kernel running in a lightweight VM (Hyper-V)
- Allows running Linux binaries natively on Windows

## Key Windows Processes

\`\`\`
System Idle Process (PID 0)  — represents idle CPU time
System (PID 4)               — kernel threads
smss.exe                     — Session Manager, first user-mode process
csrss.exe                    — Client Server Runtime (Win32 subsystem)
wininit.exe                  — starts services.exe, lsass.exe, lsm.exe
services.exe                 — Service Control Manager
lsass.exe                    — Local Security Authority (authentication)
winlogon.exe                 — handles login/logout
explorer.exe                 — Windows shell (desktop, taskbar)
\`\`\`

## Windows vs Linux: Key Architectural Differences

| Aspect | Windows NT | Linux |
|---|---|---|
| Kernel type | Hybrid | Monolithic |
| Object model | Everything is an object | Everything is a file |
| Security model | ACL + tokens + integrity levels | DAC + capabilities |
| Driver model | WDM/KMDF/UMDF | Kernel modules |
| IPC | COM, DCOM, RPC, named pipes | Pipes, sockets, shared memory |
| Init system | Services (services.exe) | systemd |
| Config storage | Registry | Text files in /etc |

## Viewing Windows Internals

\`\`\`powershell
# PowerShell — explore processes
Get-Process
Get-Process -Name explorer | Select-Object *

# Task Manager (GUI)
# Process Explorer (Sysinternals — better than Task Manager)
# WinObj (Sysinternals — explore the Object namespace)
# Process Monitor (Sysinternals — trace all system activity)

# View loaded drivers
driverquery

# View system info
systeminfo
Get-ComputerInfo
\`\`\``,

  fr: `# Architecture Windows

Windows est construit sur le **noyau Windows NT** — une base de code complètement différente du Windows original basé sur MS-DOS. Comprendre son architecture est le fondement de la maîtrise de Windows.

## Vue d'ensemble

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                  MODE UTILISATEUR                       │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │ Apps Win32  │  │  Apps .NET   │  │   Apps UWP    │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  │
│         │                │                  │           │
│  ┌──────▼──────────────────────────────────▼───────┐   │
│  │           DLL de sous-systèmes                  │   │
│  │  kernel32.dll  ntdll.dll  user32.dll  gdi32.dll │   │
│  └──────────────────────┬──────────────────────────┘   │
├─────────────────────────┼───────────────────────────────┤
│               MODE NOYAU                │               │
│  ┌──────────────────────▼──────────────────────────┐   │
│  │           Exécutif NT                           │   │
│  │  Gst. Proc │ Gst. Mém │ Gst. E/S │ Sécurité    │   │
│  │  Gst. Obj  │ Gst. Cache│ Gst. PnP │ Gst. Énergie│   │
│  └──────────────────────┬──────────────────────────┘   │
│  ┌──────────────────────▼──────────────────────────┐   │
│  │           Noyau NT (ntoskrnl.exe)               │   │
│  │  Ordonnancement │ Gestion des interruptions      │   │
│  │  Synchronisation │ Gestion des exceptions        │   │
│  └──────────────────────┬──────────────────────────┘   │
│  ┌──────────────────────▼──────────────────────────┐   │
│  │  HAL (Couche d'abstraction matérielle)          │   │
│  └──────────────────────┬──────────────────────────┘   │
├─────────────────────────┼───────────────────────────────┤
│              MATÉRIEL   │                               │
│         CPU │ RAM │ Disque │ Réseau │ GPU               │
└─────────────────────────────────────────────────────────┘
\`\`\`

## Le noyau NT (ntoskrnl.exe)

Le noyau NT est le cœur de Windows. Contrairement au noyau monolithique de Linux, le noyau NT est un **noyau hybride** — il a une base de type micronoyau avec des services exécutifs monolithiques construits dessus.

**Ce que fait le noyau NT :**
- Ordonnancement et distribution des threads
- Gestion des interruptions et exceptions
- Primitives de synchronisation (mutex, sémaphores, événements)
- Interaction matérielle de bas niveau via HAL

**Point clé** : Le noyau NT lui-même est intentionnellement minimal. Le vrai travail se passe dans la couche **Exécutif NT** au-dessus.

## Couche d'abstraction matérielle (HAL)

La HAL se situe entre le noyau et le matériel. Son rôle est de rendre le noyau indépendant du matériel.

**Pourquoi la HAL est importante :**
- Le même ntoskrnl.exe peut tourner sur x86, x64 et ARM
- HAL gère les différences entre APIC, ACPI et les minuteries spécifiques à la plateforme
- Les fabricants de matériel peuvent fournir des extensions HAL personnalisées

\`\`\`
Sans HAL : Noyau → matériel spécifique
Avec HAL : Noyau → HAL → n'importe quel matériel
\`\`\`

## Exécutif NT

L'Exécutif NT s'exécute en mode noyau et fournit les services OS essentiels :

### Gestionnaire d'objets
Tout dans Windows est un **objet** — fichiers, processus, threads, clés de registre, mutex, événements. Le Gestionnaire d'objets :
- Crée, suit et détruit les objets
- Gère le comptage de références (l'objet vit jusqu'à ce que le compteur = 0)
- Fournit un espace de noms unifié (\\Device\\HarddiskVolume1)
- Gère les descripteurs de sécurité sur chaque objet

\`\`\`
Objet = En-tête + Corps
En-tête : Type, Nom, Compteur de références, Descripteur de sécurité
Corps : Données spécifiques au type (processus : PID, threads, handles)
\`\`\`

### Gestionnaire de processus
- Crée et termine les processus et threads
- Gère le **Bloc d'environnement de processus (PEB)** et le **Bloc d'environnement de thread (TEB)**
- Chaque processus a un espace d'adressage virtuel privé

### Gestionnaire de mémoire
- Mémoire virtuelle utilisant une table de pages à deux niveaux
- **Ensemble de travail** : pages actuellement en RAM physique pour un processus
- **Fichier de page** (pagefile.sys) : débordement de mémoire virtuelle sur le disque
- **Fichiers mappés en mémoire** : utilisés pour les exécutables et bibliothèques partagées
- **Mémoire de pool** : allocation mémoire noyau (Pool paginé et Pool non paginé)

### Gestionnaire d'E/S
- Gère toutes les E/S dans Windows via un modèle unifié
- Crée des **Paquets de requête d'E/S (IRP)** — l'unité fondamentale d'E/S
- Gère la pile de pilotes : pilotes de filtre → pilote de fonction → pilote de bus

### Moniteur de référence de sécurité (SRM)
- Applique le contrôle d'accès sur chaque accès aux objets
- Vérifie le **jeton d'accès** du processus par rapport au **descripteur de sécurité** de l'objet
- Implémente le **Contrôle d'accès discrétionnaire (DAC)** et le **Contrôle d'intégrité obligatoire (MIC)**

## Transition mode utilisateur vers mode noyau

Quand une app Win32 appelle \`CreateFile()\` :

1. L'app appelle \`CreateFile()\` dans kernel32.dll
2. kernel32.dll appelle \`NtCreateFile()\` dans ntdll.dll
3. ntdll.dll exécute une instruction **syscall** (bascule en mode noyau)
4. Le **Distributeur de services système** du noyau route vers le bon gestionnaire
5. L'Exécutif NT traite la requête
6. Retourne en mode utilisateur avec un handle ou un code d'erreur

Cette transition coûte ~100ns, c'est pourquoi minimiser les syscalls est important pour les performances.

## Sous-systèmes Windows

Windows supporte plusieurs sous-systèmes de personnalité :

**Sous-système Win32 (csrss.exe)** :
- Le sous-système Windows principal
- Gère les E/S console Win32 et certaines opérations GUI
- Tous les programmes Windows utilisent ceci

**Sous-système Windows pour Linux (WSL)** :
- WSL1 : Traduit les syscalls Linux en syscalls NT
- WSL2 : Noyau Linux complet dans une VM légère (Hyper-V)
- Permet d'exécuter des binaires Linux nativement sur Windows

## Processus Windows clés

\`\`\`
System Idle Process (PID 0)  — représente le temps CPU inactif
System (PID 4)               — threads noyau
smss.exe                     — Gestionnaire de session, premier processus mode utilisateur
csrss.exe                    — Runtime Client Server (sous-système Win32)
wininit.exe                  — démarre services.exe, lsass.exe, lsm.exe
services.exe                 — Gestionnaire de contrôle des services
lsass.exe                    — Autorité de sécurité locale (authentification)
winlogon.exe                 — gère la connexion/déconnexion
explorer.exe                 — Shell Windows (bureau, barre des tâches)
\`\`\`

## Windows vs Linux : Différences architecturales clés

| Aspect | Windows NT | Linux |
|---|---|---|
| Type de noyau | Hybride | Monolithique |
| Modèle d'objets | Tout est un objet | Tout est un fichier |
| Modèle de sécurité | ACL + jetons + niveaux d'intégrité | DAC + capacités |
| Modèle de pilotes | WDM/KMDF/UMDF | Modules noyau |
| IPC | COM, DCOM, RPC, pipes nommés | Pipes, sockets, mémoire partagée |
| Système init | Services (services.exe) | systemd |
| Stockage config | Registre | Fichiers texte dans /etc |

## Explorer les internals Windows

\`\`\`powershell
# PowerShell — explorer les processus
Get-Process
Get-Process -Name explorer | Select-Object *

# Gestionnaire des tâches (GUI)
# Process Explorer (Sysinternals — meilleur que le Gestionnaire des tâches)
# WinObj (Sysinternals — explorer l'espace de noms des objets)
# Process Monitor (Sysinternals — tracer toute l'activité système)

# Voir les pilotes chargés
driverquery

# Infos système
systeminfo
Get-ComputerInfo
\`\`\``,
};

export const quiz = {
  en: [
    {
      question: "What type of kernel is the Windows NT kernel?",
      options: [
        "Monolithic kernel",
        "Microkernel",
        "Hybrid kernel",
        "Exokernel",
      ],
      correct: 2,
    },
    {
      question: "What is the role of the HAL (Hardware Abstraction Layer)?",
      options: [
        "To run user applications",
        "To make the kernel hardware-independent",
        "To manage the registry",
        "To handle network connections",
      ],
      correct: 1,
    },
    {
      question: "What is an IRP in Windows?",
      options: [
        "Internet Routing Protocol",
        "Internal Registry Package",
        "I/O Request Packet — the fundamental unit of I/O",
        "Interrupt Request Priority",
      ],
      correct: 2,
    },
    {
      question: "Which process is responsible for authentication in Windows?",
      options: ["winlogon.exe", "csrss.exe", "services.exe", "lsass.exe"],
      correct: 3,
    },
    {
      question: "What is the key difference between WSL1 and WSL2?",
      options: [
        "WSL1 is faster than WSL2",
        "WSL1 translates Linux syscalls to NT syscalls; WSL2 runs a real Linux kernel in a VM",
        "WSL2 only supports Ubuntu",
        "WSL1 uses more memory than WSL2",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Quel type de noyau est le noyau Windows NT ?",
      options: [
        "Noyau monolithique",
        "Micronoyau",
        "Noyau hybride",
        "Exonoyau",
      ],
      correct: 2,
    },
    {
      question:
        "Quel est le rôle de la HAL (Couche d'abstraction matérielle) ?",
      options: [
        "Exécuter les applications utilisateur",
        "Rendre le noyau indépendant du matériel",
        "Gérer le registre",
        "Gérer les connexions réseau",
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce qu'un IRP dans Windows ?",
      options: [
        "Protocole de routage Internet",
        "Paquet de registre interne",
        "Paquet de requête d'E/S — l'unité fondamentale d'E/S",
        "Priorité de requête d'interruption",
      ],
      correct: 2,
    },
    {
      question:
        "Quel processus est responsable de l'authentification dans Windows ?",
      options: ["winlogon.exe", "csrss.exe", "services.exe", "lsass.exe"],
      correct: 3,
    },
    {
      question: "Quelle est la différence clé entre WSL1 et WSL2 ?",
      options: [
        "WSL1 est plus rapide que WSL2",
        "WSL1 traduit les syscalls Linux en syscalls NT ; WSL2 exécute un vrai noyau Linux dans une VM",
        "WSL2 ne supporte qu'Ubuntu",
        "WSL1 utilise plus de mémoire que WSL2",
      ],
      correct: 1,
    },
  ],
};
