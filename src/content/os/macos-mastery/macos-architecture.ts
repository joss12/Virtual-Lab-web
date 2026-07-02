export const content = {
  en: `# macOS Architecture

macOS is built on a foundation that is radically different from Windows — yet shares Unix DNA with Linux. Understanding its architecture reveals why macOS behaves the way it does, and why it is uniquely positioned between consumer simplicity and Unix power.

## The macOS Stack

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                    USER EXPERIENCE                      │
│  Aqua UI │ Cocoa Framework │ AppKit │ SwiftUI           │
├─────────────────────────────────────────────────────────┤
│                APPLICATION FRAMEWORKS                   │
│  Foundation │ Core Data │ Core Animation │ AVFoundation │
│  Core Graphics │ Core Text │ WebKit │ Metal             │
├─────────────────────────────────────────────────────────┤
│                    DARWIN LAYER                         │
│  ┌────────────────┐  ┌──────────────────────────────┐   │
│  │  BSD Subsystem │  │    Mach Microkernel           │   │
│  │  POSIX API     │  │    IPC │ VM │ Scheduling      │   │
│  │  BSD sockets   │  │    Mach messages │ ports      │   │
│  └────────────────┘  └──────────────────────────────┘   │
│                    XNU Kernel                           │
├─────────────────────────────────────────────────────────┤
│                  I/O KIT (Drivers)                      │
│  C++ driver framework │ Power management │ USB, PCI     │
├─────────────────────────────────────────────────────────┤
│                    HARDWARE                             │
│  Apple Silicon (M-series) │ Intel (legacy)              │
│  Secure Enclave │ Neural Engine │ T2 Chip               │
└─────────────────────────────────────────────────────────┘
\`\`\`

## XNU — The Kernel

XNU stands for **X is Not Unix**. It is a hybrid kernel combining:
- **Mach microkernel** (from Carnegie Mellon University, 1985)
- **BSD (Berkeley Software Distribution)** subsystem
- **I/O Kit** driver framework

This hybrid design gives macOS the theoretical stability of a microkernel with the performance of a monolithic kernel.

### Mach Microkernel Layer

Mach handles the lowest-level OS primitives:

\`\`\`
Mach responsibilities:
├── Virtual memory management
│   ├── VM objects and memory mappings
│   ├── Copy-on-write (COW) — forking is fast because memory is shared until written
│   └── Named memory entries (shared memory between processes)
│
├── Task and thread management
│   ├── Mach tasks ≈ processes (but lower level)
│   ├── Mach threads ≈ threads
│   └── Each task has its own virtual address space
│
├── IPC via Mach Ports
│   ├── Ports are communication endpoints (like file descriptors for messages)
│   ├── Messages sent between tasks via ports
│   ├── Port rights: send, receive, send-once
│   └── Bootstrap server manages well-known ports
│
└── Scheduling
    └── Mach scheduler with priority bands
        ├── Normal threads
        ├── Real-time threads (audio, video)
        └── Kernel threads
\`\`\`

### Why Mach Ports Matter

Mach IPC is used everywhere in macOS:

\`\`\`
App launches → gets a send right to the bootstrap port
    │
    ▼
App registers services: com.apple.WindowServer
    │
    ▼
Another app gets send right to WindowServer port
    │
    ▼
App sends Mach message to draw on screen
    │
    ▼
WindowServer receives message, renders to framebuffer
\`\`\`

This is how every GUI operation works — not direct hardware access, but message passing through Mach ports. It is elegant, secure, and auditable.

### BSD Subsystem Layer

On top of Mach sits a complete BSD Unix implementation:

\`\`\`
BSD provides:
├── POSIX API — open(), read(), write(), fork(), exec()
├── BSD process model (PIDs, signals, process groups)
├── Network stack (TCP/IP, sockets, BSD routing)
├── VFS — Virtual File System (HFS+, APFS, NFS, SMB)
├── File descriptors
├── Users and groups (UID/GID, /etc/passwd)
├── Signals (SIGKILL, SIGTERM, SIGHUP...)
└── sysctl interface
\`\`\`

**Critical insight**: When you use the macOS Terminal and run \`ls\`, \`grep\`, \`ssh\` — you are using the BSD layer. macOS is a certified UNIX (The Open Group UNIX 03). This is why Linux skills transfer almost perfectly to macOS.

## Darwin — The Open Source Foundation

Darwin is the open-source core of macOS:
\`\`\`
Darwin = XNU kernel + BSD userland tools + launchd
\`\`\`

Apple open-sources Darwin but keeps the upper layers (Aqua GUI, Cocoa frameworks, App Store) proprietary. This is why projects like PureDarwin exist but cannot run macOS apps.

\`\`\`bash
# Darwin version maps to macOS version
uname -r         # Kernel version (e.g., 23.0.0 = macOS Sonoma)
uname -a         # Full system info
sw_vers          # macOS version details
system_profiler SPSoftwareDataType  # Detailed system info
\`\`\`

## Apple Silicon — The M-Series Architecture

Apple Silicon (M1, M2, M3, M4) represents the most significant OS-hardware co-design since the iPhone:

\`\`\`
Apple Silicon SoC (System on Chip):
┌─────────────────────────────────────────────────────────┐
│                      M4 Pro (example)                   │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │ P-cores  │  │ E-cores  │  │   Neural Engine       │   │
│  │(perf)    │  │(efficncy)│  │   38 TOPS            │   │
│  └──────────┘  └──────────┘  └──────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Unified Memory (shared by CPU+GPU)      │   │
│  │          No discrete VRAM — GPU uses system RAM  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   GPU    │  │  Secure  │  │  Media   │              │
│  │          │  │ Enclave  │  │  Engine  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
\`\`\`

**Why Unified Memory changes everything:**
- CPU, GPU, and Neural Engine all access the same physical memory
- No PCIe bus transfer between CPU RAM and GPU VRAM (eliminates a major bottleneck)
- Extremely low latency for GPU compute tasks
- macOS memory pressure system can dynamically allocate between CPU and GPU

## Rosetta 2 — Binary Translation

When Apple transitioned from Intel to Apple Silicon, they built **Rosetta 2** — a binary translator that runs x86-64 code on ARM64:

\`\`\`
Intel binary launched
    │
    ▼
Rosetta 2 checks: is this translated already? (ahead-of-time)
    │
    ├── YES → Run translated ARM64 binary directly (near-native speed)
    └── NO  → Translate on first launch, cache result
                    │
                    ▼
              ~70-80% of native performance
              (impressive for full ISA translation)
\`\`\`

\`\`\`bash
# Check if running under Rosetta
arch                          # Returns arm64 or i386 (i386 = Rosetta)
sysctl -n sysctl.proc_translated  # 1 = running under Rosetta

# Force Rosetta for an app
arch -x86_64 /Applications/MyApp.app/Contents/MacOS/MyApp

# Check binary architectures
file /usr/bin/ls              # Universal binary or arm64/x86_64
lipo -info /usr/bin/ls        # Architectures in a universal binary
\`\`\`

## The Secure Enclave

The Secure Enclave is a separate security processor inside every Apple device:

\`\`\`
Secure Enclave Processor (SEP):
├── Separate CPU core with its own encrypted memory
├── Runs its own OS (sepOS) — completely isolated from macOS
├── Stores:
│   ├── Touch ID / Face ID templates
│   ├── Device encryption keys
│   ├── Apple Pay private keys
│   └── Private keys for iCloud Keychain
│
├── Operations happen INSIDE — keys NEVER leave the SEP
│   "Did this fingerprint match?" → YES/NO (not the fingerprint itself)
│
└── Even Apple cannot extract keys from the SEP
    (This is why FBI vs Apple was a real legal battle)
\`\`\`

## System Integrity Protection (SIP)

SIP is macOS's most powerful security feature, introduced in OS X El Capitan:

\`\`\`
SIP protects:
├── /System      — macOS system files
├── /usr         — Unix programs
├── /bin         — Essential binaries
├── /sbin        — System binaries
└── Kernel extensions (kexts)

Even root (sudo) CANNOT modify these paths
Even if you have admin access
Even if you have physical access

To modify: must boot to Recovery Mode and disable SIP
→ csrutil disable
→ This is a deliberate security barrier
\`\`\`

\`\`\`bash
# Check SIP status
csrutil status

# From Recovery Mode only:
csrutil disable
csrutil enable
csrutil enable --without kext   # Enable SIP but allow unsigned kexts
\`\`\`

## I/O Kit — The Driver Framework

Unlike Linux (C kernel modules) or Windows (WDM/KMDF), macOS drivers are written in **C++** using the I/O Kit framework:

\`\`\`
I/O Kit features:
├── Object-oriented C++ driver model
├── Automatic device matching (no manual driver loading)
│   Device plugged in → IOKit matches to correct driver class
├── Power management built into the framework
├── Hot-plug support built-in
└── User-space drivers possible via IOUserClient
\`\`\`

\`\`\`bash
# List I/O Kit device tree
ioreg -l | head -100
ioreg -l -w 0 | grep -i "product"    # All products

# System Information (GUI)
system_profiler

# List loaded kexts (kernel extensions)
kextstat                              # Legacy kexts
# Modern drivers use DriverKit (user space) or System Extensions
\`\`\`

## macOS vs Linux vs Windows: Architecture Comparison

| Aspect | macOS (XNU) | Linux | Windows NT |
|---|---|---|---|
| Kernel type | Hybrid (Mach+BSD) | Monolithic | Hybrid |
| IPC mechanism | Mach ports + BSD sockets | Pipes, sockets, shared mem | Named pipes, COM, RPC |
| Driver model | I/O Kit (C++) | Kernel modules (C) | WDM/KMDF (C) |
| Init system | launchd | systemd | SCM (services.exe) |
| Package mgmt | Homebrew (unofficial) | apt/dnf/pacman | winget/chocolatey |
| Security model | SIP + Gatekeeper + Notarization + SEP | DAC + capabilities + SELinux | ACLs + UAC + Defender |
| POSIX compliant | Yes (certified UNIX) | Yes | Partial (via WSL) |
| Open source core | Yes (Darwin) | Yes (Linux kernel) | No |

\`\`\`bash
# Explore macOS kernel internals
sysctl -a                    # All kernel parameters
sysctl kern.version          # Kernel version
sysctl hw.physmem            # Physical memory
sysctl hw.ncpu               # CPU count
sysctl vm.swapusage          # Swap usage
sysctl net.inet.tcp          # TCP settings

# Process information (BSD layer)
ps aux
top -l 1                     # One snapshot (macOS top is different from Linux)
htop                         # Install via Homebrew — better
\`\`\``,

  fr: `# Architecture macOS

macOS est construit sur une fondation radicalement différente de Windows — tout en partageant l'ADN Unix avec Linux. Comprendre son architecture révèle pourquoi macOS se comporte comme il le fait, et pourquoi il est uniquement positionné entre la simplicité grand public et la puissance Unix.

## La pile macOS

\`\`\`
┌─────────────────────────────────────────────────────────┐
│               EXPÉRIENCE UTILISATEUR                    │
│  Aqua UI │ Framework Cocoa │ AppKit │ SwiftUI           │
├─────────────────────────────────────────────────────────┤
│              FRAMEWORKS D'APPLICATION                   │
│  Foundation │ Core Data │ Core Animation │ AVFoundation │
│  Core Graphics │ Core Text │ WebKit │ Metal             │
├─────────────────────────────────────────────────────────┤
│                   COUCHE DARWIN                         │
│  ┌────────────────┐  ┌──────────────────────────────┐   │
│  │ Sous-système   │  │    Micronoyau Mach            │   │
│  │ BSD            │  │    IPC │ VM │ Ordonnancement  │   │
│  │ API POSIX      │  │    Messages Mach │ ports      │   │
│  └────────────────┘  └──────────────────────────────┘   │
│                    Noyau XNU                            │
├─────────────────────────────────────────────────────────┤
│                  I/O KIT (Pilotes)                      │
│  Framework pilotes C++ │ Gestion énergie │ USB, PCI    │
├─────────────────────────────────────────────────────────┤
│                    MATÉRIEL                             │
│  Apple Silicon (série M) │ Intel (héritage)             │
│  Secure Enclave │ Neural Engine │ Puce T2               │
└─────────────────────────────────────────────────────────┘
\`\`\`

## XNU — Le Noyau

XNU signifie **X is Not Unix** (X n'est pas Unix). C'est un noyau hybride combinant :
- **Micronoyau Mach** (de l'Université Carnegie Mellon, 1985)
- **Sous-système BSD (Berkeley Software Distribution)**
- **Framework de pilotes I/O Kit**

Cette conception hybride donne à macOS la stabilité théorique d'un micronoyau avec les performances d'un noyau monolithique.

### Couche micronoyau Mach

Mach gère les primitives OS de plus bas niveau :

\`\`\`
Responsabilités de Mach :
├── Gestion de la mémoire virtuelle
│   ├── Objets VM et mappages mémoire
│   ├── Copy-on-write (COW) — le fork est rapide car la mémoire est partagée jusqu'à l'écriture
│   └── Entrées de mémoire nommées (mémoire partagée entre processus)
│
├── Gestion des tâches et threads
│   ├── Tâches Mach ≈ processus (mais plus bas niveau)
│   ├── Threads Mach ≈ threads
│   └── Chaque tâche a son propre espace d'adressage virtuel
│
├── IPC via les ports Mach
│   ├── Les ports sont des points de communication (comme des descripteurs de fichiers pour les messages)
│   ├── Messages envoyés entre tâches via des ports
│   ├── Droits de port : envoyer, recevoir, envoyer-une-fois
│   └── Le serveur bootstrap gère les ports bien connus
│
└── Ordonnancement
    └── Ordonnanceur Mach avec bandes de priorité
        ├── Threads normaux
        ├── Threads temps réel (audio, vidéo)
        └── Threads noyau
\`\`\`

### Pourquoi les ports Mach sont importants

L'IPC Mach est utilisée partout dans macOS :

\`\`\`
L'app se lance → obtient un droit d'envoi vers le port bootstrap
    │
    ▼
L'app enregistre des services : com.apple.WindowServer
    │
    ▼
Une autre app obtient le droit d'envoi vers le port WindowServer
    │
    ▼
L'app envoie un message Mach pour dessiner à l'écran
    │
    ▼
WindowServer reçoit le message, rend dans le framebuffer
\`\`\`

C'est ainsi que fonctionne chaque opération GUI — pas d'accès direct au matériel, mais passage de messages via des ports Mach. C'est élégant, sécurisé et auditable.

### Couche sous-système BSD

Au-dessus de Mach se trouve une implémentation BSD Unix complète :

\`\`\`
BSD fournit :
├── API POSIX — open(), read(), write(), fork(), exec()
├── Modèle de processus BSD (PIDs, signaux, groupes de processus)
├── Pile réseau (TCP/IP, sockets, routage BSD)
├── VFS — Système de fichiers virtuel (HFS+, APFS, NFS, SMB)
├── Descripteurs de fichiers
├── Utilisateurs et groupes (UID/GID, /etc/passwd)
├── Signaux (SIGKILL, SIGTERM, SIGHUP...)
└── Interface sysctl
\`\`\`

**Point critique** : Quand vous utilisez le Terminal macOS et exécutez \`ls\`, \`grep\`, \`ssh\` — vous utilisez la couche BSD. macOS est un UNIX certifié (The Open Group UNIX 03). C'est pourquoi les compétences Linux se transfèrent presque parfaitement à macOS.

## Darwin — La fondation open source

Darwin est le cœur open source de macOS :
\`\`\`
Darwin = noyau XNU + outils userland BSD + launchd
\`\`\`

Apple open-source Darwin mais garde les couches supérieures (GUI Aqua, frameworks Cocoa, App Store) propriétaires.

\`\`\`bash
# La version Darwin correspond à la version macOS
uname -r         # Version du noyau (ex : 23.0.0 = macOS Sonoma)
uname -a         # Informations système complètes
sw_vers          # Détails de la version macOS
system_profiler SPSoftwareDataType  # Infos système détaillées
\`\`\`

## Apple Silicon — L'architecture série M

Apple Silicon (M1, M2, M3, M4) représente la co-conception OS-matériel la plus significative depuis l'iPhone :

\`\`\`
SoC Apple Silicon (Système sur puce) :
┌─────────────────────────────────────────────────────────┐
│                      M4 Pro (exemple)                   │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐   │
│  │ Cœurs P  │  │ Cœurs E  │  │   Neural Engine       │   │
│  │(perf)    │  │(efficacité│  │   38 TOPS            │   │
│  └──────────┘  └──────────┘  └──────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │      Mémoire unifiée (partagée CPU+GPU)          │   │
│  │      Pas de VRAM discrète — le GPU utilise la RAM│   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   GPU    │  │  Secure  │  │  Moteur  │              │
│  │          │  │ Enclave  │  │  Média   │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
\`\`\`

**Pourquoi la mémoire unifiée change tout :**
- Le CPU, GPU et Neural Engine accèdent tous à la même mémoire physique
- Pas de transfert PCIe entre la RAM CPU et la VRAM GPU (élimine un goulot d'étranglement majeur)
- Latence extrêmement faible pour les tâches de calcul GPU
- Le système de pression mémoire macOS peut allouer dynamiquement entre CPU et GPU

## Rosetta 2 — Traduction binaire

Quand Apple a transitionné d'Intel vers Apple Silicon, ils ont construit **Rosetta 2** — un traducteur binaire qui exécute du code x86-64 sur ARM64 :

\`\`\`
Binaire Intel lancé
    │
    ▼
Rosetta 2 vérifie : est-ce déjà traduit ? (à l'avance)
    │
    ├── OUI → Exécuter le binaire ARM64 traduit directement (vitesse quasi-native)
    └── NON → Traduire au premier lancement, mettre en cache le résultat
                    │
                    ▼
              ~70-80% des performances natives
              (impressionnant pour une traduction ISA complète)
\`\`\`

\`\`\`bash
# Vérifier si on tourne sous Rosetta
arch                          # Retourne arm64 ou i386 (i386 = Rosetta)
sysctl -n sysctl.proc_translated  # 1 = tourne sous Rosetta

# Forcer Rosetta pour une app
arch -x86_64 /Applications/MonApp.app/Contents/MacOS/MonApp

# Vérifier les architectures binaires
file /usr/bin/ls              # Binaire universel ou arm64/x86_64
lipo -info /usr/bin/ls        # Architectures dans un binaire universel
\`\`\`

## Le Secure Enclave

Le Secure Enclave est un processeur de sécurité séparé dans chaque appareil Apple :

\`\`\`
Processeur Secure Enclave (SEP) :
├── Cœur CPU séparé avec sa propre mémoire chiffrée
├── Exécute son propre OS (sepOS) — complètement isolé de macOS
├── Stocke :
│   ├── Modèles Touch ID / Face ID
│   ├── Clés de chiffrement de l'appareil
│   ├── Clés privées Apple Pay
│   └── Clés privées pour iCloud Keychain
│
├── Les opérations se passent À L'INTÉRIEUR — les clés ne quittent JAMAIS le SEP
│   "Cette empreinte correspond-elle ?" → OUI/NON (pas l'empreinte elle-même)
│
└── Même Apple ne peut pas extraire les clés du SEP
\`\`\`

## System Integrity Protection (SIP)

SIP est la fonctionnalité de sécurité la plus puissante de macOS :

\`\`\`
SIP protège :
├── /System      — Fichiers système macOS
├── /usr         — Programmes Unix
├── /bin         — Binaires essentiels
├── /sbin        — Binaires système
└── Extensions noyau (kexts)

Même root (sudo) NE PEUT PAS modifier ces chemins
Même si vous avez un accès admin
Même si vous avez un accès physique

Pour modifier : démarrer en mode Récupération et désactiver SIP
→ csrutil disable
→ C'est une barrière de sécurité délibérée
\`\`\`

\`\`\`bash
# Vérifier l'état de SIP
csrutil status

# Depuis le mode Récupération uniquement :
csrutil disable
csrutil enable
csrutil enable --without kext   # Activer SIP mais autoriser les kexts non signés
\`\`\`

## Comparaison d'architecture : macOS vs Linux vs Windows

| Aspect | macOS (XNU) | Linux | Windows NT |
|---|---|---|---|
| Type de noyau | Hybride (Mach+BSD) | Monolithique | Hybride |
| Mécanisme IPC | Ports Mach + sockets BSD | Pipes, sockets, mém partagée | Named pipes, COM, RPC |
| Modèle pilotes | I/O Kit (C++) | Modules noyau (C) | WDM/KMDF (C) |
| Système init | launchd | systemd | SCM (services.exe) |
| Gest. paquets | Homebrew (non officiel) | apt/dnf/pacman | winget/chocolatey |
| Modèle sécurité | SIP + Gatekeeper + Notarisation + SEP | DAC + capacités + SELinux | ACLs + UAC + Defender |
| Conforme POSIX | Oui (UNIX certifié) | Oui | Partiel (via WSL) |
| Cœur open source | Oui (Darwin) | Oui (noyau Linux) | Non |

\`\`\`bash
# Explorer les internals du noyau macOS
sysctl -a                    # Tous les paramètres noyau
sysctl kern.version          # Version du noyau
sysctl hw.physmem            # Mémoire physique
sysctl hw.ncpu               # Nombre de CPU
sysctl vm.swapusage          # Utilisation du swap
sysctl net.inet.tcp          # Paramètres TCP

# Informations processus (couche BSD)
ps aux
top -l 1                     # Un instantané
htop                         # Installer via Homebrew — meilleur
\`\`\``,
};

export const quiz = {
  en: [
    {
      question:
        "What does XNU stand for and what two major components make up the XNU kernel?",
      options: [
        "X Native Unix — combining Linux and BSD",
        "X is Not Unix — combining the Mach microkernel and the BSD subsystem",
        "Extended Unix — combining POSIX and proprietary Apple code",
        "X Networked Unix — combining TCP/IP and Mach",
      ],
      correct: 1,
    },
    {
      question:
        "What is the key advantage of Apple Silicon's Unified Memory architecture?",
      options: [
        "It uses less power than discrete GPU memory",
        "The CPU, GPU, and Neural Engine share the same physical memory — eliminating PCIe transfer overhead",
        "It allows more RAM to be installed",
        "It makes memory upgrades easier",
      ],
      correct: 1,
    },
    {
      question: "What does System Integrity Protection (SIP) prevent?",
      options: [
        "Installing unsigned applications",
        "Network connections to untrusted servers",
        "Even root/sudo from modifying protected system paths like /System and /usr",
        "Apps from accessing the internet without permission",
      ],
      correct: 2,
    },
    {
      question: "What is Rosetta 2?",
      options: [
        "Apple's translation service for foreign languages",
        "A binary translator that allows x86-64 Intel apps to run on ARM64 Apple Silicon",
        "A compatibility layer for running iOS apps on macOS",
        "Apple's code signing verification system",
      ],
      correct: 1,
    },
    {
      question:
        "What makes the Secure Enclave fundamentally different from regular CPU security features?",
      options: [
        "It uses stronger encryption algorithms",
        "It is a completely separate processor with its own OS and encrypted memory — keys never leave it",
        "It is faster than the main CPU",
        "It is controlled by Apple's servers",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Que signifie XNU et quels deux composants majeurs constituent le noyau XNU ?",
      options: [
        "X Native Unix — combinant Linux et BSD",
        "X is Not Unix — combinant le micronoyau Mach et le sous-système BSD",
        "Extended Unix — combinant POSIX et du code Apple propriétaire",
        "X Networked Unix — combinant TCP/IP et Mach",
      ],
      correct: 1,
    },
    {
      question:
        "Quel est l'avantage clé de l'architecture Mémoire Unifiée d'Apple Silicon ?",
      options: [
        "Elle consomme moins d'énergie que la mémoire GPU discrète",
        "Le CPU, GPU et Neural Engine partagent la même mémoire physique — éliminant le surcoût de transfert PCIe",
        "Elle permet d'installer plus de RAM",
        "Elle facilite les mises à niveau de mémoire",
      ],
      correct: 1,
    },
    {
      question: "Que prévient System Integrity Protection (SIP) ?",
      options: [
        "L'installation d'applications non signées",
        "Les connexions réseau vers des serveurs non fiables",
        "Même root/sudo de modifier les chemins système protégés comme /System et /usr",
        "Les apps d'accéder à internet sans permission",
      ],
      correct: 2,
    },
    {
      question: "Qu'est-ce que Rosetta 2 ?",
      options: [
        "Le service de traduction de langues d'Apple",
        "Un traducteur binaire qui permet aux apps Intel x86-64 de tourner sur Apple Silicon ARM64",
        "Une couche de compatibilité pour exécuter des apps iOS sur macOS",
        "Le système de vérification de signature de code d'Apple",
      ],
      correct: 1,
    },
    {
      question:
        "Qu'est-ce qui rend le Secure Enclave fondamentalement différent des fonctionnalités de sécurité CPU ordinaires ?",
      options: [
        "Il utilise des algorithmes de chiffrement plus puissants",
        "C'est un processeur complètement séparé avec son propre OS et sa mémoire chiffrée — les clés ne le quittent jamais",
        "Il est plus rapide que le CPU principal",
        "Il est contrôlé par les serveurs d'Apple",
      ],
      correct: 1,
    },
  ],
};
