export const content = {
  en: `# What is an Operating System?

An operating system (OS) is the most important software on a computer. It acts as an intermediary between hardware and user applications.

## Core Responsibilities

**Resource Management**: The OS manages CPU time, memory, storage, and I/O devices. Without it, every program would need to directly control hardware — an impossible task.

**Abstraction**: Instead of writing code that talks directly to a specific hard drive model, your program calls \`open("file.txt")\` and the OS handles the rest.

**Security & Isolation**: The OS ensures that one program cannot read or corrupt another program's memory. Each process runs in its own isolated space.

## Types of Operating Systems

- **General Purpose**: Windows, Linux, macOS — designed for a wide range of tasks
- **Real-Time OS (RTOS)**: Used in embedded systems, medical devices, aircraft
- **Mobile OS**: Android, iOS — optimized for touch and battery life
- **Server OS**: Linux Server, Windows Server — optimized for uptime and network services

## A Brief History

- **1950s**: No OS — programmers loaded programs manually with punch cards
- **1960s**: Batch processing OS — jobs queued and run automatically
- **1970s**: Unix created at Bell Labs — the ancestor of Linux and macOS
- **1980s**: MS-DOS, early Mac OS — personal computers for everyone
- **1990s**: Windows 95, Linux kernel — graphical interfaces become standard
- **2000s**: macOS X, Windows XP — modern OS era begins
- **2010s**: iOS, Android — mobile OS explosion
- **Today**: Cloud, containers, and hypervisors redefine what an OS means

## The Kernel

At the heart of every OS is the **kernel** — the core program that has complete control over the hardware. Everything else (your browser, your terminal, your games) runs on top of the kernel.

We will study the kernel in depth in the next lesson.`,

  fr: `# Qu'est-ce qu'un système d'exploitation ?

Un système d'exploitation (OS) est le logiciel le plus important d'un ordinateur. Il sert d'intermédiaire entre le matériel et les applications utilisateur.

## Responsabilités principales

**Gestion des ressources** : L'OS gère le temps CPU, la mémoire, le stockage et les périphériques E/S. Sans lui, chaque programme devrait contrôler directement le matériel — une tâche impossible.

**Abstraction** : Au lieu d'écrire du code qui parle directement à un modèle de disque dur spécifique, votre programme appelle \`open("file.txt")\` et l'OS s'occupe du reste.

**Sécurité et isolation** : L'OS garantit qu'un programme ne peut pas lire ou corrompre la mémoire d'un autre programme. Chaque processus s'exécute dans son propre espace isolé.

## Types de systèmes d'exploitation

- **Usage général** : Windows, Linux, macOS — conçus pour une large gamme de tâches
- **OS temps réel (RTOS)** : Utilisés dans les systèmes embarqués, dispositifs médicaux, avions
- **OS mobile** : Android, iOS — optimisés pour le tactile et l'autonomie
- **OS serveur** : Linux Server, Windows Server — optimisés pour la disponibilité et les services réseau

## Une brève histoire

- **1950s** : Pas d'OS — les programmeurs chargeaient les programmes manuellement avec des cartes perforées
- **1960s** : OS de traitement par lots — les tâches sont mises en file d'attente et exécutées automatiquement
- **1970s** : Unix créé aux Bell Labs — l'ancêtre de Linux et macOS
- **1980s** : MS-DOS, premier Mac OS — ordinateurs personnels pour tous
- **1990s** : Windows 95, noyau Linux — les interfaces graphiques deviennent standard
- **2000s** : macOS X, Windows XP — l'ère OS moderne commence
- **2010s** : iOS, Android — explosion des OS mobiles
- **Aujourd'hui** : Le cloud, les conteneurs et les hyperviseurs redéfinissent ce que signifie un OS

## Le noyau

Au cœur de chaque OS se trouve le **noyau** — le programme central qui a un contrôle total sur le matériel. Tout le reste (votre navigateur, votre terminal, vos jeux) s'exécute au-dessus du noyau.

Nous étudierons le noyau en profondeur dans la prochaine leçon.`,
};

export const quiz = {
  en: [
    {
      question: "What is the primary role of an operating system?",
      options: [
        "To run video games",
        "To act as intermediary between hardware and applications",
        "To connect to the internet",
        "To store files on disk",
      ],
      correct: 1,
    },
    {
      question: "Which of these is NOT a type of operating system?",
      options: ["Real-Time OS", "Mobile OS", "Compiler OS", "Server OS"],
      correct: 2,
    },
    {
      question: "What is the kernel?",
      options: [
        "A type of CPU",
        "A file storage system",
        "The core program with complete control over hardware",
        "A network protocol",
      ],
      correct: 2,
    },
    {
      question: "Where was Unix created?",
      options: ["MIT", "Stanford", "Bell Labs", "IBM"],
      correct: 2,
    },
    {
      question: "What does OS abstraction mean for developers?",
      options: [
        "They must write hardware-specific code",
        "They can use generic calls like open() without knowing hardware details",
        "They need to manage memory manually",
        "They must program in Assembly",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Quel est le rôle principal d'un système d'exploitation ?",
      options: [
        "Faire tourner des jeux vidéo",
        "Servir d'intermédiaire entre le matériel et les applications",
        "Se connecter à internet",
        "Stocker des fichiers sur le disque",
      ],
      correct: 1,
    },
    {
      question:
        "Lequel de ces éléments N'EST PAS un type de système d'exploitation ?",
      options: ["OS temps réel", "OS mobile", "OS compilateur", "OS serveur"],
      correct: 2,
    },
    {
      question: "Qu'est-ce que le noyau ?",
      options: [
        "Un type de CPU",
        "Un système de stockage de fichiers",
        "Le programme central avec un contrôle total sur le matériel",
        "Un protocole réseau",
      ],
      correct: 2,
    },
    {
      question: "Où Unix a-t-il été créé ?",
      options: ["MIT", "Stanford", "Bell Labs", "IBM"],
      correct: 2,
    },
    {
      question: "Que signifie l'abstraction OS pour les développeurs ?",
      options: [
        "Ils doivent écrire du code spécifique au matériel",
        "Ils peuvent utiliser des appels génériques comme open() sans connaître les détails du matériel",
        "Ils doivent gérer la mémoire manuellement",
        "Ils doivent programmer en Assembly",
      ],
      correct: 1,
    },
  ],
};
