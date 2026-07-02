export const content = {
  en: `# The Kernel

The kernel is the core of the operating system. It is the first program loaded after the bootloader and it stays in memory for the entire time your computer is on.

## What the Kernel Does

The kernel has four primary jobs:

**1. Process Management**
The kernel decides which process gets CPU time and for how long. This is called scheduling. On a modern computer, hundreds of processes appear to run simultaneously — but the CPU can only run one thing at a time per core. The kernel switches between processes so fast it feels simultaneous.

**2. Memory Management**
Every process needs memory. The kernel allocates memory to processes, ensures they cannot access each other's memory, and manages virtual memory (using disk space as extra RAM when needed).

**3. Device Drivers**
The kernel communicates with hardware through device drivers. When you plug in a USB drive, the kernel loads the appropriate driver and makes the device available to user programs.

**4. System Calls**
User programs cannot directly access hardware. Instead they make **system calls** — requests to the kernel to do something on their behalf. \`read()\`, \`write()\`, \`open()\`, \`fork()\` are all system calls.

## Kernel Space vs User Space

This is one of the most important concepts in OS design.

**Kernel Space**: Where the kernel runs. Has unrestricted access to all hardware and memory. A crash here crashes the entire system.

**User Space**: Where your applications run. Has restricted access — cannot directly touch hardware. Must ask the kernel via system calls. A crash here only crashes that one program.

This separation is what makes modern OS stable. Your browser can crash without taking down the entire system.

## Types of Kernels

**Monolithic Kernel**: All OS services run in kernel space. Fast but complex. Linux uses this approach.

**Microkernel**: Only essential services in kernel space. Everything else in user space. More stable but slower.

**Hybrid Kernel**: A mix of both. Windows NT and macOS XNU are hybrid kernels.

## The Linux Kernel

The Linux kernel was created by Linus Torvalds in 1991. Today it powers:
- Most web servers on the internet
- Android phones
- Supercomputers
- Embedded devices (routers, TVs, cars)
- The International Space Station

It is one of the largest open source projects in history with over 27 million lines of code.`,

  fr: `# Le Noyau

Le noyau est le cœur du système d'exploitation. C'est le premier programme chargé après le bootloader et il reste en mémoire pendant toute la durée de fonctionnement de votre ordinateur.

## Ce que fait le noyau

Le noyau a quatre missions principales :

**1. Gestion des processus**
Le noyau décide quel processus obtient du temps CPU et pour combien de temps. C'est ce qu'on appelle l'ordonnancement. Sur un ordinateur moderne, des centaines de processus semblent s'exécuter simultanément — mais le CPU ne peut exécuter qu'une chose à la fois par cœur. Le noyau bascule entre les processus si rapidement que cela semble simultané.

**2. Gestion de la mémoire**
Chaque processus a besoin de mémoire. Le noyau alloue la mémoire aux processus, s'assure qu'ils ne peuvent pas accéder à la mémoire des autres, et gère la mémoire virtuelle (utilisant l'espace disque comme RAM supplémentaire si nécessaire).

**3. Pilotes de périphériques**
Le noyau communique avec le matériel via des pilotes de périphériques. Quand vous branchez une clé USB, le noyau charge le pilote approprié et rend le périphérique disponible aux programmes utilisateur.

**4. Appels système**
Les programmes utilisateur ne peuvent pas accéder directement au matériel. Ils font plutôt des **appels système** — des demandes au noyau pour faire quelque chose en leur nom. \`read()\`, \`write()\`, \`open()\`, \`fork()\` sont tous des appels système.

## Espace noyau vs espace utilisateur

C'est l'un des concepts les plus importants de la conception d'OS.

**Espace noyau** : Là où le noyau s'exécute. A un accès illimité à tout le matériel et la mémoire. Un crash ici fait planter tout le système.

**Espace utilisateur** : Là où vos applications s'exécutent. A un accès restreint — ne peut pas toucher directement le matériel. Doit demander au noyau via des appels système. Un crash ici ne fait planter que ce programme.

Cette séparation est ce qui rend les OS modernes stables. Votre navigateur peut planter sans faire tomber tout le système.

## Types de noyaux

**Noyau monolithique** : Tous les services OS s'exécutent dans l'espace noyau. Rapide mais complexe. Linux utilise cette approche.

**Micronoyau** : Seuls les services essentiels dans l'espace noyau. Tout le reste dans l'espace utilisateur. Plus stable mais plus lent.

**Noyau hybride** : Un mélange des deux. Windows NT et macOS XNU sont des noyaux hybrides.

## Le noyau Linux

Le noyau Linux a été créé par Linus Torvalds en 1991. Aujourd'hui il propulse :
- La plupart des serveurs web sur internet
- Les téléphones Android
- Les supercalculateurs
- Les appareils embarqués (routeurs, téléviseurs, voitures)
- La Station spatiale internationale

C'est l'un des plus grands projets open source de l'histoire avec plus de 27 millions de lignes de code.`,
};

export const quiz = {
  en: [
    {
      question: "What is the kernel?",
      options: [
        "A user application",
        "The core of the OS that controls hardware",
        "A type of file system",
        "A network protocol",
      ],
      correct: 1,
    },
    {
      question: "What is a system call?",
      options: [
        "A phone call to tech support",
        "A request from a user program to the kernel",
        "A kernel crash",
        "A hardware interrupt",
      ],
      correct: 1,
    },
    {
      question: "What happens if the kernel crashes?",
      options: [
        "Only the current app crashes",
        "Nothing happens",
        "The entire system crashes",
        "The CPU restarts automatically",
      ],
      correct: 2,
    },
    {
      question: "Which kernel type does Linux use?",
      options: [
        "Microkernel",
        "Hybrid kernel",
        "Monolithic kernel",
        "Exokernel",
      ],
      correct: 2,
    },
    {
      question: "Who created the Linux kernel?",
      options: ["Bill Gates", "Steve Jobs", "Dennis Ritchie", "Linus Torvalds"],
      correct: 3,
    },
  ],
  fr: [
    {
      question: "Qu'est-ce que le noyau ?",
      options: [
        "Une application utilisateur",
        "Le cœur de l'OS qui contrôle le matériel",
        "Un type de système de fichiers",
        "Un protocole réseau",
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce qu'un appel système ?",
      options: [
        "Un appel téléphonique au support technique",
        "Une demande d'un programme utilisateur au noyau",
        "Un crash du noyau",
        "Une interruption matérielle",
      ],
      correct: 1,
    },
    {
      question: "Que se passe-t-il si le noyau plante ?",
      options: [
        "Seule l'application en cours plante",
        "Rien ne se passe",
        "Tout le système plante",
        "Le CPU redémarre automatiquement",
      ],
      correct: 2,
    },
    {
      question: "Quel type de noyau Linux utilise-t-il ?",
      options: [
        "Micronoyau",
        "Noyau hybride",
        "Noyau monolithique",
        "Exonoyau",
      ],
      correct: 2,
    },
    {
      question: "Qui a créé le noyau Linux ?",
      options: ["Bill Gates", "Steve Jobs", "Dennis Ritchie", "Linus Torvalds"],
      correct: 3,
    },
  ],
};
