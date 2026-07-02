export const content = {
  en: `# I/O and Device Drivers

Every computer needs to communicate with the outside world — keyboard, mouse, screen, disk, network. This is handled by the I/O subsystem and device drivers.

## What is I/O?

**Input/Output (I/O)** refers to any communication between the CPU/memory and external devices.

- **Input**: Keyboard, mouse, microphone, camera, network packets
- **Output**: Monitor, speakers, printer, network packets
- **Both**: Hard drive, SSD, USB drives, network interfaces

## How I/O Works

When your program calls \`read()\` to read from disk:

1. The program makes a system call
2. The kernel passes the request to the appropriate **device driver**
3. The device driver sends commands to the hardware controller
4. The hardware performs the operation
5. The result is returned back up the chain

This abstraction means your program does not need to know whether the disk is an HDD, SSD, or network drive.

## Device Drivers

A **device driver** is a software component that allows the OS to communicate with a specific piece of hardware. It acts as a translator between generic OS calls and hardware-specific commands.

**Types of drivers**:
- **Character drivers**: Handle data one byte at a time (keyboards, mice, serial ports)
- **Block drivers**: Handle data in fixed blocks (hard drives, SSDs)
- **Network drivers**: Handle network packets (ethernet, WiFi)

On Linux, drivers can be:
- Built into the kernel
- Loaded as **kernel modules** (.ko files)

\`\`\`bash
lsmod          # list loaded kernel modules
modprobe usb   # load a module
dmesg          # kernel messages (useful for driver debugging)
lspci          # list PCI devices
lsusb          # list USB devices
\`\`\`

## Interrupts

Hardware devices use **interrupts** to signal the CPU that they need attention.

Example: You press a key on the keyboard:
1. Keyboard controller sends an interrupt signal to the CPU
2. CPU pauses current task
3. Runs the **interrupt handler** (part of the keyboard driver)
4. Handler reads the keypress data
5. CPU resumes previous task

This is much more efficient than **polling** (constantly checking if the device has data).

## DMA (Direct Memory Access)

For high-speed I/O (like disk reads), having the CPU copy data byte by byte is too slow. **DMA** allows devices to transfer data directly to/from memory without CPU involvement.

1. CPU tells DMA controller: "copy X bytes from disk to memory address Y"
2. CPU continues doing other work
3. DMA controller handles the transfer
4. DMA controller sends interrupt when done

This frees the CPU to do useful work while data transfers happen in the background.

## Buffering and Caching

**Buffer**: Temporary storage used to smooth out speed differences between devices. Example: data coming from a slow network is buffered before being processed.

**Cache**: Frequently accessed data stored in fast memory to avoid slow device reads. The OS caches disk reads in RAM — this is why reading the same file twice is faster.

## I/O Scheduling

When multiple processes request disk I/O simultaneously, the OS must decide the order. The **I/O scheduler** optimizes disk access patterns to minimize seek time.

Linux I/O schedulers:
- **CFQ (Completely Fair Queuing)**: Fair allocation for all processes
- **Deadline**: Guarantees requests are served within a time limit
- **NOOP**: No scheduling — just FIFO. Good for SSDs since they have no seek time.

\`\`\`bash
# Check current I/O scheduler
cat /sys/block/sda/queue/scheduler

# Change scheduler
echo deadline > /sys/block/sda/queue/scheduler
\`\`\``,

  fr: `# E/S et pilotes de périphériques

Chaque ordinateur doit communiquer avec le monde extérieur — clavier, souris, écran, disque, réseau. Ceci est géré par le sous-système E/S et les pilotes de périphériques.

## Qu'est-ce que l'E/S ?

Les **Entrées/Sorties (E/S)** désignent toute communication entre le CPU/mémoire et les périphériques externes.

- **Entrée** : Clavier, souris, microphone, caméra, paquets réseau
- **Sortie** : Moniteur, haut-parleurs, imprimante, paquets réseau
- **Les deux** : Disque dur, SSD, clés USB, interfaces réseau

## Comment fonctionne l'E/S

Quand votre programme appelle \`read()\` pour lire depuis le disque :

1. Le programme fait un appel système
2. Le noyau transmet la demande au **pilote de périphérique** approprié
3. Le pilote envoie des commandes au contrôleur matériel
4. Le matériel effectue l'opération
5. Le résultat est retourné en remontant la chaîne

Cette abstraction signifie que votre programme n'a pas besoin de savoir si le disque est un HDD, SSD ou disque réseau.

## Pilotes de périphériques

Un **pilote de périphérique** est un composant logiciel qui permet à l'OS de communiquer avec un matériel spécifique. Il agit comme traducteur entre les appels OS génériques et les commandes spécifiques au matériel.

**Types de pilotes** :
- **Pilotes de caractères** : Gèrent les données octet par octet (claviers, souris, ports série)
- **Pilotes de blocs** : Gèrent les données en blocs fixes (disques durs, SSD)
- **Pilotes réseau** : Gèrent les paquets réseau (ethernet, WiFi)

Sur Linux, les pilotes peuvent être :
- Intégrés au noyau
- Chargés comme **modules noyau** (fichiers .ko)

\`\`\`bash
lsmod          # lister les modules noyau chargés
modprobe usb   # charger un module
dmesg          # messages noyau (utile pour déboguer les pilotes)
lspci          # lister les périphériques PCI
lsusb          # lister les périphériques USB
\`\`\`

## Interruptions

Les périphériques matériels utilisent des **interruptions** pour signaler au CPU qu'ils ont besoin d'attention.

Exemple : Vous appuyez sur une touche du clavier :
1. Le contrôleur du clavier envoie un signal d'interruption au CPU
2. Le CPU met en pause la tâche actuelle
3. Exécute le **gestionnaire d'interruption** (partie du pilote clavier)
4. Le gestionnaire lit les données de la touche
5. Le CPU reprend la tâche précédente

C'est beaucoup plus efficace que le **polling** (vérification constante si le périphérique a des données).

## DMA (Accès direct à la mémoire)

Pour les E/S à haute vitesse (comme les lectures disque), avoir le CPU copier les données octet par octet est trop lent. Le **DMA** permet aux périphériques de transférer des données directement vers/depuis la mémoire sans implication du CPU.

1. Le CPU dit au contrôleur DMA : "copie X octets du disque vers l'adresse mémoire Y"
2. Le CPU continue à faire d'autres travaux
3. Le contrôleur DMA gère le transfert
4. Le contrôleur DMA envoie une interruption quand c'est terminé

Cela libère le CPU pour faire du travail utile pendant que les transferts de données se font en arrière-plan.

## Mise en mémoire tampon et mise en cache

**Tampon** : Stockage temporaire utilisé pour lisser les différences de vitesse entre les périphériques. Exemple : les données provenant d'un réseau lent sont mises en tampon avant d'être traitées.

**Cache** : Les données fréquemment consultées sont stockées en mémoire rapide pour éviter les lectures lentes des périphériques. L'OS met en cache les lectures disque en RAM — c'est pourquoi lire le même fichier deux fois est plus rapide.

## Ordonnancement des E/S

Quand plusieurs processus demandent des E/S disque simultanément, l'OS doit décider l'ordre. L'**ordonnanceur d'E/S** optimise les schémas d'accès disque pour minimiser le temps de recherche.

Ordonnanceurs E/S Linux :
- **CFQ (Completely Fair Queuing)** : Allocation équitable pour tous les processus
- **Deadline** : Garantit que les demandes sont servies dans un délai
- **NOOP** : Pas d'ordonnancement — juste FIFO. Bon pour les SSD car ils n'ont pas de temps de recherche.

\`\`\`bash
# Vérifier l'ordonnanceur E/S actuel
cat /sys/block/sda/queue/scheduler

# Changer l'ordonnanceur
echo deadline > /sys/block/sda/queue/scheduler
\`\`\``,
};

export const quiz = {
  en: [
    {
      question: "What is a device driver?",
      options: [
        "A person who delivers hardware",
        "Software that allows the OS to communicate with hardware",
        "A type of file system",
        "A network protocol",
      ],
      correct: 1,
    },
    {
      question: "What is the advantage of interrupts over polling?",
      options: [
        "Interrupts are slower but more reliable",
        "Polling uses less CPU",
        "Interrupts are more efficient — CPU only acts when device needs attention",
        "Polling is always preferred for modern hardware",
      ],
      correct: 2,
    },
    {
      question: "What does DMA allow?",
      options: [
        "Direct memory access — devices transfer data without CPU involvement",
        "Dynamic memory allocation",
        "Disk management automation",
        "Driver module activation",
      ],
      correct: 0,
    },
    {
      question: "Which command lists loaded kernel modules on Linux?",
      options: ["dmesg", "lspci", "lsmod", "modprobe"],
      correct: 2,
    },
    {
      question: "Which I/O scheduler is best for SSDs?",
      options: ["CFQ", "Deadline", "NOOP", "Priority"],
      correct: 2,
    },
  ],
  fr: [
    {
      question: "Qu'est-ce qu'un pilote de périphérique ?",
      options: [
        "Une personne qui livre du matériel",
        "Un logiciel qui permet à l'OS de communiquer avec le matériel",
        "Un type de système de fichiers",
        "Un protocole réseau",
      ],
      correct: 1,
    },
    {
      question:
        "Quel est l'avantage des interruptions par rapport au polling ?",
      options: [
        "Les interruptions sont plus lentes mais plus fiables",
        "Le polling utilise moins de CPU",
        "Les interruptions sont plus efficaces — le CPU n'agit que quand le périphérique en a besoin",
        "Le polling est toujours préféré pour le matériel moderne",
      ],
      correct: 2,
    },
    {
      question: "Que permet le DMA ?",
      options: [
        "Accès direct à la mémoire — les périphériques transfèrent des données sans implication du CPU",
        "Allocation dynamique de mémoire",
        "Automatisation de la gestion des disques",
        "Activation des modules de pilotes",
      ],
      correct: 0,
    },
    {
      question: "Quelle commande liste les modules noyau chargés sur Linux ?",
      options: ["dmesg", "lspci", "lsmod", "modprobe"],
      correct: 2,
    },
    {
      question: "Quel ordonnanceur E/S est le meilleur pour les SSD ?",
      options: ["CFQ", "Deadline", "NOOP", "Priority"],
      correct: 2,
    },
  ],
};
