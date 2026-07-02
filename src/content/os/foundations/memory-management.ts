export const content = {
  en: `# Memory Management

Memory management is one of the most critical jobs of an OS. Every running process needs memory, and the OS must allocate it fairly, efficiently, and securely.

## Types of Memory

**RAM (Random Access Memory)**: Fast, volatile memory. Lost when power is off. Where running programs and data live.

**ROM (Read-Only Memory)**: Permanent memory. Contains firmware like BIOS/UEFI.

**Cache**: Extremely fast memory built into the CPU. L1, L2, L3 caches store frequently accessed data.

**Virtual Memory**: Uses disk space to simulate extra RAM.

## How Memory Allocation Works

When a process starts, the OS gives it a block of memory divided into segments:

- **Text segment**: The program's executable code
- **Data segment**: Global and static variables
- **Heap**: Dynamically allocated memory (\`malloc()\`, \`new\`)
- **Stack**: Function calls, local variables, return addresses

## Virtual Memory

Physical RAM is limited. Virtual memory lets processes use more memory than physically available by using disk space (swap space on Linux, pagefile.sys on Windows).

**How it works**:
1. Memory is divided into fixed-size blocks called **pages** (usually 4KB)
2. Not all pages need to be in RAM at once
3. Rarely used pages are moved to disk (**paged out**)
4. When needed again, they are loaded back (**paged in**)
5. This is transparent to the program — it thinks it has all the memory

## Page Faults

When a program accesses a page that is not in RAM:
1. The CPU triggers a **page fault**
2. The OS pauses the process
3. Loads the required page from disk into RAM
4. Resumes the process

Too many page faults = **thrashing** — the system spends more time moving pages than running programs.

## Memory Protection

Each process has its own **virtual address space**. Process A cannot access Process B's memory. If it tries, the OS raises a **segmentation fault** and kills the offending process.

This is enforced by the **Memory Management Unit (MMU)** — hardware built into the CPU that translates virtual addresses to physical addresses.

## vmalloc and mmap

**vmalloc**: Used by the Linux kernel to allocate virtually contiguous memory. The pages do not need to be physically contiguous — the MMU handles the mapping.

**mmap**: A system call that maps files or devices into memory. Used for:
- Loading shared libraries
- Inter-process communication
- Memory-mapped file I/O (faster than read/write)

\`\`\`c
// Example: map a file into memory
int fd = open("data.bin", O_RDONLY);
void *ptr = mmap(NULL, size, PROT_READ, MAP_PRIVATE, fd, 0);
// Now you can access the file like an array
\`\`\``,

  fr: `# Gestion de la mémoire

La gestion de la mémoire est l'un des travaux les plus critiques d'un OS. Chaque processus en cours d'exécution a besoin de mémoire, et l'OS doit l'allouer équitablement, efficacement et en toute sécurité.

## Types de mémoire

**RAM (Mémoire vive)** : Mémoire rapide et volatile. Perdue quand le courant est coupé. Où vivent les programmes en cours d'exécution et les données.

**ROM (Mémoire morte)** : Mémoire permanente. Contient le firmware comme le BIOS/UEFI.

**Cache** : Mémoire extrêmement rapide intégrée au CPU. Les caches L1, L2, L3 stockent les données fréquemment consultées.

**Mémoire virtuelle** : Utilise l'espace disque pour simuler de la RAM supplémentaire.

## Comment fonctionne l'allocation de mémoire

Quand un processus démarre, l'OS lui donne un bloc de mémoire divisé en segments :

- **Segment texte** : Le code exécutable du programme
- **Segment données** : Variables globales et statiques
- **Tas (Heap)** : Mémoire allouée dynamiquement (\`malloc()\`, \`new\`)
- **Pile (Stack)** : Appels de fonctions, variables locales, adresses de retour

## Mémoire virtuelle

La RAM physique est limitée. La mémoire virtuelle permet aux processus d'utiliser plus de mémoire que disponible physiquement en utilisant l'espace disque (espace swap sur Linux, pagefile.sys sur Windows).

**Comment ça marche** :
1. La mémoire est divisée en blocs de taille fixe appelés **pages** (généralement 4 Ko)
2. Toutes les pages n'ont pas besoin d'être en RAM en même temps
3. Les pages rarement utilisées sont déplacées sur le disque (**paginées**)
4. Quand nécessaire, elles sont rechargées (**dépaginées**)
5. C'est transparent pour le programme — il pense avoir toute la mémoire

## Défauts de page

Quand un programme accède à une page qui n'est pas en RAM :
1. Le CPU déclenche un **défaut de page**
2. L'OS met le processus en pause
3. Charge la page requise du disque vers la RAM
4. Reprend le processus

Trop de défauts de page = **thrashing** — le système passe plus de temps à déplacer des pages qu'à exécuter des programmes.

## Protection de la mémoire

Chaque processus a son propre **espace d'adressage virtuel**. Le processus A ne peut pas accéder à la mémoire du processus B. S'il essaie, l'OS déclenche un **segmentation fault** et tue le processus fautif.

C'est appliqué par l'**Unité de gestion de mémoire (MMU)** — du matériel intégré au CPU qui traduit les adresses virtuelles en adresses physiques.

## vmalloc et mmap

**vmalloc** : Utilisé par le noyau Linux pour allouer de la mémoire virtuellement contiguë. Les pages n'ont pas besoin d'être physiquement contiguës — la MMU gère le mappage.

**mmap** : Un appel système qui mappe des fichiers ou des périphériques en mémoire. Utilisé pour :
- Charger des bibliothèques partagées
- La communication inter-processus
- Les E/S de fichiers mappés en mémoire (plus rapide que read/write)

\`\`\`c
// Exemple : mapper un fichier en mémoire
int fd = open("data.bin", O_RDONLY);
void *ptr = mmap(NULL, size, PROT_READ, MAP_PRIVATE, fd, 0);
// Maintenant vous pouvez accéder au fichier comme un tableau
\`\`\``,
};

export const quiz = {
  en: [
    {
      question: "What is virtual memory?",
      options: [
        "A type of CPU cache",
        "Using disk space to simulate extra RAM",
        "A faster type of RAM",
        "Memory inside the GPU",
      ],
      correct: 1,
    },
    {
      question: "What is a page fault?",
      options: [
        "A hardware failure",
        "When a program crashes",
        "When a program accesses a page not currently in RAM",
        "When the CPU overheats",
      ],
      correct: 2,
    },
    {
      question: "What does the MMU do?",
      options: [
        "Manages network connections",
        "Translates virtual addresses to physical addresses",
        "Controls CPU speed",
        "Manages file permissions",
      ],
      correct: 1,
    },
    {
      question: "What is thrashing?",
      options: [
        "A type of virus",
        "When the CPU runs too hot",
        "When the system spends more time moving pages than running programs",
        "When RAM is full",
      ],
      correct: 2,
    },
    {
      question: "What is the heap used for?",
      options: [
        "Storing the OS kernel",
        "Dynamically allocated memory",
        "CPU instructions",
        "Network buffers",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Qu'est-ce que la mémoire virtuelle ?",
      options: [
        "Un type de cache CPU",
        "Utiliser l'espace disque pour simuler de la RAM supplémentaire",
        "Un type de RAM plus rapide",
        "De la mémoire dans le GPU",
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce qu'un défaut de page ?",
      options: [
        "Une panne matérielle",
        "Quand un programme plante",
        "Quand un programme accède à une page qui n'est pas en RAM",
        "Quand le CPU surchauffe",
      ],
      correct: 2,
    },
    {
      question: "Que fait la MMU ?",
      options: [
        "Gère les connexions réseau",
        "Traduit les adresses virtuelles en adresses physiques",
        "Contrôle la vitesse du CPU",
        "Gère les permissions des fichiers",
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce que le thrashing ?",
      options: [
        "Un type de virus",
        "Quand le CPU est trop chaud",
        "Quand le système passe plus de temps à déplacer des pages qu'à exécuter des programmes",
        "Quand la RAM est pleine",
      ],
      correct: 2,
    },
    {
      question: "À quoi sert le tas (heap) ?",
      options: [
        "Stocker le noyau OS",
        "Mémoire allouée dynamiquement",
        "Instructions CPU",
        "Tampons réseau",
      ],
      correct: 1,
    },
  ],
};
