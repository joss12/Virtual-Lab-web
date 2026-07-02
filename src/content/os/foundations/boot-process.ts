export const content = {
  en: `# The Boot Process

When you press the power button, a precise sequence of events happens before you see the desktop. Understanding the boot process is fundamental to OS mastery.

## The Complete Boot Sequence

### Step 1 — Power On Self Test (POST)
The moment you press the power button:
1. Power supply sends power to motherboard
2. CPU starts executing code from a fixed memory address (0xFFFFFFF0 on x86)
3. This code is the **BIOS** or **UEFI** firmware stored in ROM
4. **POST** runs — checks that RAM, CPU, and essential hardware are working
5. If POST fails, you hear beep codes or see error messages

### Step 2 — BIOS vs UEFI

**BIOS (Basic Input/Output System)**:
- Old standard from 1975
- 16-bit code, limited to 1MB memory access
- Reads the first 512 bytes of the boot disk (**Master Boot Record**)
- MBR contains the bootloader code and partition table
- Cannot boot from disks larger than 2TB

**UEFI (Unified Extensible Firmware Interface)**:
- Modern replacement for BIOS
- 32/64-bit, can access full memory
- Reads from the **EFI System Partition (ESP)** — a FAT32 partition
- Supports disks up to 9.4 zettabytes
- Secure Boot — verifies bootloader signature
- Faster boot times

### Step 3 — The Bootloader

The bootloader is a small program that loads the OS kernel.

**GRUB2 (Linux)**:
- Most common Linux bootloader
- Shows a menu if multiple OS installed
- Loads the kernel image (\`vmlinuz\`) and initial RAM disk (\`initrd\`)
- Passes boot parameters to the kernel

**Windows Boot Manager**:
- Stored in the EFI System Partition
- Loads \`winload.efi\` which loads the Windows kernel

**macOS**:
- Uses Apple's own bootloader
- Loads the XNU kernel

### Step 4 — Kernel Initialization

Once the kernel is loaded:
1. Decompresses itself into memory
2. Initializes CPU and memory management
3. Detects and initializes hardware (using device drivers)
4. Mounts the root filesystem
5. Starts the **init system**

### Step 5 — Init System

The init system is the first process started by the kernel (PID 1). It is responsible for starting all other processes.

**systemd (Modern Linux)**:
- Starts services in parallel (faster boot)
- Manages service dependencies
- \`systemctl start nginx\` — start a service
- \`journalctl\` — view logs

**SysV init (Old Linux)**:
- Sequential startup — slower
- Run levels (0=halt, 1=single user, 3=multi-user, 5=graphical, 6=reboot)

**launchd (macOS)**:
- Apple's init system
- Handles both system and user services

**Windows**:
- \`smss.exe\` → \`csrss.exe\` → \`winlogon.exe\` → login screen

### Step 6 — Login

Finally, the login screen appears and the user can authenticate.

## Boot Time Analysis

\`\`\`bash
# Linux: analyze boot time
systemd-analyze
systemd-analyze blame        # which services took longest
systemd-analyze plot > boot.svg  # visual timeline

# Check boot messages
dmesg | head -50
journalctl -b               # all logs from current boot
\`\`\`

## Common Boot Problems

| Problem | Likely Cause |
|---|---|
| Black screen after POST | Bootloader not found |
| "No bootable device" | Boot order wrong or disk failed |
| Kernel panic | Corrupted kernel or driver crash |
| Stuck at login | Display manager crash |
| Very slow boot | Service taking too long — use systemd-analyze blame |

## Secure Boot

Secure Boot (UEFI feature) verifies that the bootloader and kernel are signed by a trusted key. Prevents malware from loading before the OS. Can be disabled in UEFI settings — sometimes needed for Linux installation.`,

  fr: `# Le processus de démarrage

Quand vous appuyez sur le bouton d'alimentation, une séquence précise d'événements se produit avant que vous voyiez le bureau. Comprendre le processus de démarrage est fondamental pour maîtriser les OS.

## La séquence de démarrage complète

### Étape 1 — Test automatique au démarrage (POST)
Au moment où vous appuyez sur le bouton d'alimentation :
1. L'alimentation envoie du courant à la carte mère
2. Le CPU commence à exécuter le code d'une adresse mémoire fixe (0xFFFFFFF0 sur x86)
3. Ce code est le firmware **BIOS** ou **UEFI** stocké en ROM
4. Le **POST** s'exécute — vérifie que la RAM, le CPU et le matériel essentiel fonctionnent
5. Si le POST échoue, vous entendez des bips ou voyez des messages d'erreur

### Étape 2 — BIOS vs UEFI

**BIOS (Basic Input/Output System)** :
- Ancien standard de 1975
- Code 16 bits, limité à 1 Mo d'accès mémoire
- Lit les premiers 512 octets du disque de démarrage (**Master Boot Record**)
- Le MBR contient le code du bootloader et la table de partitions
- Ne peut pas démarrer depuis des disques de plus de 2 To

**UEFI (Unified Extensible Firmware Interface)** :
- Remplacement moderne du BIOS
- 32/64 bits, peut accéder à toute la mémoire
- Lit depuis la **Partition système EFI (ESP)** — une partition FAT32
- Supporte des disques jusqu'à 9,4 zettaoctets
- Secure Boot — vérifie la signature du bootloader
- Temps de démarrage plus rapides

### Étape 3 — Le bootloader

Le bootloader est un petit programme qui charge le noyau OS.

**GRUB2 (Linux)** :
- Bootloader Linux le plus courant
- Affiche un menu si plusieurs OS sont installés
- Charge l'image du noyau (\`vmlinuz\`) et le disque RAM initial (\`initrd\`)
- Passe les paramètres de démarrage au noyau

**Gestionnaire de démarrage Windows** :
- Stocké dans la Partition système EFI
- Charge \`winload.efi\` qui charge le noyau Windows

**macOS** :
- Utilise le propre bootloader d'Apple
- Charge le noyau XNU

### Étape 4 — Initialisation du noyau

Une fois le noyau chargé :
1. Se décompresse en mémoire
2. Initialise le CPU et la gestion de la mémoire
3. Détecte et initialise le matériel (via les pilotes de périphériques)
4. Monte le système de fichiers racine
5. Démarre le **système init**

### Étape 5 — Système init

Le système init est le premier processus démarré par le noyau (PID 1). Il est responsable du démarrage de tous les autres processus.

**systemd (Linux moderne)** :
- Démarre les services en parallèle (démarrage plus rapide)
- Gère les dépendances de services
- \`systemctl start nginx\` — démarrer un service
- \`journalctl\` — voir les journaux

**SysV init (Ancien Linux)** :
- Démarrage séquentiel — plus lent
- Niveaux d'exécution (0=arrêt, 1=mono-utilisateur, 3=multi-utilisateur, 5=graphique, 6=redémarrage)

**launchd (macOS)** :
- Système init d'Apple
- Gère les services système et utilisateur

**Windows** :
- \`smss.exe\` → \`csrss.exe\` → \`winlogon.exe\` → écran de connexion

### Étape 6 — Connexion

Finalement, l'écran de connexion apparaît et l'utilisateur peut s'authentifier.

## Analyse du temps de démarrage

\`\`\`bash
# Linux : analyser le temps de démarrage
systemd-analyze
systemd-analyze blame            # quels services ont pris le plus de temps
systemd-analyze plot > boot.svg  # chronologie visuelle

# Vérifier les messages de démarrage
dmesg | head -50
journalctl -b                    # tous les journaux du démarrage actuel
\`\`\`

## Problèmes de démarrage courants

| Problème | Cause probable |
|---|---|
| Écran noir après POST | Bootloader non trouvé |
| "Aucun périphérique démarrable" | Ordre de démarrage incorrect ou disque défaillant |
| Kernel panic | Noyau corrompu ou crash de pilote |
| Bloqué à l'écran de connexion | Crash du gestionnaire d'affichage |
| Démarrage très lent | Service trop long — utiliser systemd-analyze blame |

## Secure Boot

Secure Boot (fonctionnalité UEFI) vérifie que le bootloader et le noyau sont signés par une clé de confiance. Empêche les malwares de se charger avant l'OS. Peut être désactivé dans les paramètres UEFI — parfois nécessaire pour l'installation de Linux.`,
};

export const quiz = {
  en: [
    {
      question: "What does POST stand for?",
      options: [
        "Power On Self Test",
        "Primary OS Startup Test",
        "Processor Output System Test",
        "Pre-OS Storage Test",
      ],
      correct: 0,
    },
    {
      question: "What is the main advantage of UEFI over BIOS?",
      options: [
        "UEFI is older and more stable",
        "UEFI supports larger disks, faster boot, and Secure Boot",
        "UEFI uses less power",
        "UEFI is simpler to configure",
      ],
      correct: 1,
    },
    {
      question: "What is GRUB2?",
      options: [
        "A Linux kernel",
        "A file system",
        "The most common Linux bootloader",
        "A system monitoring tool",
      ],
      correct: 2,
    },
    {
      question: "What is PID 1 in Linux?",
      options: [
        "The kernel itself",
        "The first process started by the kernel — the init system",
        "The login process",
        "The first user process",
      ],
      correct: 1,
    },
    {
      question:
        "Which command shows which services took longest to start in Linux?",
      options: [
        "systemctl status",
        "journalctl -b",
        "systemd-analyze blame",
        "dmesg | grep slow",
      ],
      correct: 2,
    },
  ],
  fr: [
    {
      question: "Que signifie POST ?",
      options: [
        "Power On Self Test",
        "Primary OS Startup Test",
        "Processor Output System Test",
        "Pre-OS Storage Test",
      ],
      correct: 0,
    },
    {
      question: "Quel est le principal avantage de l'UEFI sur le BIOS ?",
      options: [
        "L'UEFI est plus ancien et plus stable",
        "L'UEFI supporte des disques plus grands, un démarrage plus rapide et le Secure Boot",
        "L'UEFI consomme moins d'énergie",
        "L'UEFI est plus simple à configurer",
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce que GRUB2 ?",
      options: [
        "Un noyau Linux",
        "Un système de fichiers",
        "Le bootloader Linux le plus courant",
        "Un outil de surveillance système",
      ],
      correct: 2,
    },
    {
      question: "Qu'est-ce que le PID 1 sous Linux ?",
      options: [
        "Le noyau lui-même",
        "Le premier processus démarré par le noyau — le système init",
        "Le processus de connexion",
        "Le premier processus utilisateur",
      ],
      correct: 1,
    },
    {
      question:
        "Quelle commande montre quels services ont pris le plus de temps à démarrer sous Linux ?",
      options: [
        "systemctl status",
        "journalctl -b",
        "systemd-analyze blame",
        "dmesg | grep slow",
      ],
      correct: 2,
    },
  ],
};
