export const content = {
  en: `# Process Management

A process is a running instance of a program. When you open your browser, the OS creates a process for it. When you open a second tab, the browser might create another process or a thread.

## Process vs Program

A **program** is a static file on disk — the executable code.
A **process** is a program in execution — it has memory, CPU time, and state.

The same program can have multiple processes. You can open two terminal windows and each is a separate process running the same shell program.

## Process States

A process moves through several states during its lifetime:

- **New**: The process is being created
- **Ready**: Waiting for CPU time
- **Running**: Currently executing on the CPU
- **Waiting**: Blocked waiting for I/O or an event
- **Terminated**: Finished execution

## Process Control Block (PCB)

The OS tracks every process using a data structure called the **Process Control Block**. It contains:
- Process ID (PID)
- Process state
- Program counter (next instruction to execute)
- CPU registers
- Memory limits
- Open file handles
- Priority

## Process Scheduling

The kernel scheduler decides which ready process gets CPU time next. Common algorithms:

**First Come First Served (FCFS)**: Simple but can cause long wait times if a slow process runs first.

**Round Robin**: Each process gets a fixed time slice (quantum), then the next process runs. Fair and widely used.

**Priority Scheduling**: Higher priority processes run first. Used in real-time systems.

**Completely Fair Scheduler (CFS)**: What Linux uses. Tracks how much CPU time each process has received and always runs the process that has received the least.

## Processes and Threads

A **thread** is a lightweight unit of execution within a process. A process can have multiple threads that share the same memory space.

Example: A web browser has one process but many threads — one for the UI, one for downloading, one for rendering each tab.

**Advantages of threads over processes**:
- Faster to create
- Share memory (no need to copy data)
- Faster context switching

**Disadvantage**:
- One thread crashing can crash the entire process
- Shared memory creates race conditions

## Viewing Processes

On Linux/macOS:
\`\`\`bash
ps aux          # list all processes
top             # live view of processes
htop            # better live view
kill -9 PID     # force kill a process
\`\`\`

On Windows:
\`\`\`
Task Manager (Ctrl+Shift+Esc)
Get-Process     # PowerShell
taskkill /PID 1234 /F
\`\`\``,

  fr: `# Gestion des processus

Un processus est une instance en cours d'exécution d'un programme. Quand vous ouvrez votre navigateur, l'OS crée un processus pour lui. Quand vous ouvrez un deuxième onglet, le navigateur peut créer un autre processus ou un thread.

## Processus vs Programme

Un **programme** est un fichier statique sur disque — le code exécutable.
Un **processus** est un programme en cours d'exécution — il a de la mémoire, du temps CPU et un état.

Le même programme peut avoir plusieurs processus. Vous pouvez ouvrir deux fenêtres de terminal et chacune est un processus séparé exécutant le même programme shell.

## États d'un processus

Un processus passe par plusieurs états pendant sa vie :

- **Nouveau** : Le processus est en cours de création
- **Prêt** : En attente de temps CPU
- **En cours d'exécution** : S'exécute actuellement sur le CPU
- **En attente** : Bloqué en attente d'E/S ou d'un événement
- **Terminé** : A fini son exécution

## Bloc de contrôle de processus (PCB)

L'OS suit chaque processus en utilisant une structure de données appelée le **Bloc de contrôle de processus**. Il contient :
- ID du processus (PID)
- État du processus
- Compteur de programme (prochaine instruction à exécuter)
- Registres CPU
- Limites mémoire
- Descripteurs de fichiers ouverts
- Priorité

## Ordonnancement des processus

L'ordonnanceur du noyau décide quel processus prêt obtient du temps CPU ensuite. Algorithmes courants :

**Premier arrivé premier servi (FCFS)** : Simple mais peut causer de longs temps d'attente si un processus lent s'exécute en premier.

**Round Robin** : Chaque processus obtient une tranche de temps fixe (quantum), puis le processus suivant s'exécute. Équitable et largement utilisé.

**Ordonnancement par priorité** : Les processus de haute priorité s'exécutent en premier. Utilisé dans les systèmes temps réel.

**Completely Fair Scheduler (CFS)** : Ce que Linux utilise. Suit combien de temps CPU chaque processus a reçu et exécute toujours le processus qui en a reçu le moins.

## Processus et threads

Un **thread** est une unité légère d'exécution au sein d'un processus. Un processus peut avoir plusieurs threads qui partagent le même espace mémoire.

Exemple : Un navigateur web a un processus mais plusieurs threads — un pour l'interface, un pour les téléchargements, un pour le rendu de chaque onglet.

**Avantages des threads par rapport aux processus** :
- Plus rapides à créer
- Partagent la mémoire (pas besoin de copier les données)
- Changement de contexte plus rapide

**Inconvénient** :
- Un thread qui plante peut faire planter tout le processus
- La mémoire partagée crée des conditions de course

## Voir les processus

Sur Linux/macOS :
\`\`\`bash
ps aux          # lister tous les processus
top             # vue en direct des processus
htop            # meilleure vue en direct
kill -9 PID     # forcer la fin d'un processus
\`\`\`

Sur Windows :
\`\`\`
Gestionnaire des tâches (Ctrl+Shift+Échap)
Get-Process     # PowerShell
taskkill /PID 1234 /F
\`\`\``,
};

export const quiz = {
  en: [
    {
      question: "What is the difference between a program and a process?",
      options: [
        "They are the same thing",
        "A program is running, a process is on disk",
        "A program is on disk, a process is a running instance",
        "A process is faster than a program",
      ],
      correct: 2,
    },
    {
      question: "What scheduling algorithm does Linux use?",
      options: [
        "First Come First Served",
        "Round Robin",
        "Priority Scheduling",
        "Completely Fair Scheduler",
      ],
      correct: 3,
    },
    {
      question: "What is a thread?",
      options: [
        "A separate process",
        "A lightweight unit of execution within a process",
        "A type of memory",
        "A CPU register",
      ],
      correct: 1,
    },
    {
      question: "What does PCB stand for?",
      options: [
        "Process Control Block",
        "Program Control Bus",
        "Processor Core Buffer",
        "Primary CPU Block",
      ],
      correct: 0,
    },
    {
      question: "Which command lists all processes on Linux?",
      options: ["ls -a", "ps aux", "top -all", "proc list"],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Quelle est la différence entre un programme et un processus ?",
      options: [
        "Ils sont la même chose",
        "Un programme s'exécute, un processus est sur disque",
        "Un programme est sur disque, un processus est une instance en cours d'exécution",
        "Un processus est plus rapide qu'un programme",
      ],
      correct: 2,
    },
    {
      question: "Quel algorithme d'ordonnancement Linux utilise-t-il ?",
      options: [
        "Premier arrivé premier servi",
        "Round Robin",
        "Ordonnancement par priorité",
        "Completely Fair Scheduler",
      ],
      correct: 3,
    },
    {
      question: "Qu'est-ce qu'un thread ?",
      options: [
        "Un processus séparé",
        "Une unité légère d'exécution au sein d'un processus",
        "Un type de mémoire",
        "Un registre CPU",
      ],
      correct: 1,
    },
    {
      question: "Que signifie PCB ?",
      options: [
        "Process Control Block",
        "Program Control Bus",
        "Processor Core Buffer",
        "Primary CPU Block",
      ],
      correct: 0,
    },
    {
      question: "Quelle commande liste tous les processus sur Linux ?",
      options: ["ls -a", "ps aux", "top -all", "proc list"],
      correct: 1,
    },
  ],
};
