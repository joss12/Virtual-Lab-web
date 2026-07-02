export const content = {
  en: `# File Systems

A file system is how an OS organizes and stores data on a storage device. Without a file system, a disk is just a sequence of raw bytes with no structure.

## What a File System Does

- **Organizes data** into files and directories
- **Tracks free space** — knows which blocks are available
- **Manages metadata** — name, size, permissions, timestamps
- **Ensures integrity** — prevents corruption from crashes

## Key Concepts

### Inodes (Linux/macOS)
An **inode** is a data structure that stores metadata about a file:
- File size
- Owner and permissions
- Timestamps (created, modified, accessed)
- Pointers to the actual data blocks on disk

The filename is NOT stored in the inode — it is stored in the directory. This is why you can have multiple filenames pointing to the same inode (hard links).

### Blocks
Data is stored in fixed-size **blocks** (typically 4KB). A large file uses many blocks. A small file wastes part of its block.

### Journaling
Modern file systems use a **journal** — a log of pending changes. If the system crashes mid-write, the journal allows recovery without full disk scan.

## Common File Systems

| File System | OS | Notes |
|---|---|---|
| ext4 | Linux | Most common Linux FS. Journaled. |
| NTFS | Windows | Supports large files, permissions, encryption |
| APFS | macOS | Apple's modern FS. Optimized for SSDs. |
| FAT32 | Universal | Old but compatible everywhere. 4GB file limit. |
| exFAT | Universal | Modern FAT. No file size limit. Used on USB drives. |
| ZFS | Linux/BSD | Advanced. Checksums, snapshots, RAID built in. |
| Btrfs | Linux | Modern Linux FS. Snapshots, compression. |

## Directory Structure

### Linux/macOS
\`\`\`
/               Root — everything starts here
├── bin/        Essential binaries (ls, cp, mv)
├── etc/        Configuration files
├── home/       User home directories
├── var/        Variable data (logs, databases)
├── tmp/        Temporary files
├── proc/       Virtual FS — kernel and process info
├── sys/        Virtual FS — hardware info
└── usr/        User programs and libraries
\`\`\`

### Windows
\`\`\`
C:\\
├── Windows\\        OS files
├── Users\\          User profiles
├── Program Files\\  Installed applications
└── System32\\       Core system files
\`\`\`

## Permissions

### Linux permissions
\`\`\`
-rwxr-xr-- 1 alice staff 4096 May 1 file.txt
\`\`\`
- \`-\` = file type (- for file, d for directory)
- \`rwx\` = owner permissions (read, write, execute)
- \`r-x\` = group permissions
- \`r--\` = others permissions

\`\`\`bash
chmod 755 file.txt   # rwxr-xr-x
chown alice file.txt # change owner
ls -la               # list files with permissions
\`\`\`

## Mounting

On Linux, storage devices are **mounted** to a directory:
\`\`\`bash
mount /dev/sdb1 /mnt/usb   # mount USB drive
umount /mnt/usb             # unmount
df -h                       # show mounted filesystems and space
\`\`\`

On Windows, devices get drive letters (C:, D:, E:).
On macOS, devices mount to \`/Volumes/\`.`,

  fr: `# Systèmes de fichiers

Un système de fichiers est la façon dont un OS organise et stocke les données sur un dispositif de stockage. Sans système de fichiers, un disque n'est qu'une séquence d'octets bruts sans structure.

## Ce que fait un système de fichiers

- **Organise les données** en fichiers et répertoires
- **Suit l'espace libre** — sait quels blocs sont disponibles
- **Gère les métadonnées** — nom, taille, permissions, horodatages
- **Assure l'intégrité** — prévient la corruption lors des pannes

## Concepts clés

### Inodes (Linux/macOS)
Un **inode** est une structure de données qui stocke les métadonnées d'un fichier :
- Taille du fichier
- Propriétaire et permissions
- Horodatages (créé, modifié, accédé)
- Pointeurs vers les blocs de données réels sur le disque

Le nom du fichier N'EST PAS stocké dans l'inode — il est stocké dans le répertoire. C'est pourquoi vous pouvez avoir plusieurs noms de fichiers pointant vers le même inode (liens physiques).

### Blocs
Les données sont stockées dans des **blocs** de taille fixe (généralement 4 Ko). Un gros fichier utilise beaucoup de blocs. Un petit fichier gaspille une partie de son bloc.

### Journalisation
Les systèmes de fichiers modernes utilisent un **journal** — un journal des modifications en attente. Si le système plante en pleine écriture, le journal permet la récupération sans analyse complète du disque.

## Systèmes de fichiers courants

| Système de fichiers | OS | Notes |
|---|---|---|
| ext4 | Linux | FS Linux le plus courant. Journalisé. |
| NTFS | Windows | Supporte les gros fichiers, permissions, chiffrement |
| APFS | macOS | FS moderne d'Apple. Optimisé pour les SSD. |
| FAT32 | Universel | Ancien mais compatible partout. Limite de 4 Go. |
| exFAT | Universel | FAT moderne. Pas de limite de taille. Utilisé sur les clés USB. |
| ZFS | Linux/BSD | Avancé. Checksums, snapshots, RAID intégré. |
| Btrfs | Linux | FS Linux moderne. Snapshots, compression. |

## Structure des répertoires

### Linux/macOS
\`\`\`
/               Racine — tout commence ici
├── bin/        Binaires essentiels (ls, cp, mv)
├── etc/        Fichiers de configuration
├── home/       Répertoires personnels des utilisateurs
├── var/        Données variables (journaux, bases de données)
├── tmp/        Fichiers temporaires
├── proc/       FS virtuel — infos noyau et processus
├── sys/        FS virtuel — infos matériel
└── usr/        Programmes et bibliothèques utilisateur
\`\`\`

### Windows
\`\`\`
C:\\
├── Windows\\        Fichiers OS
├── Users\\          Profils utilisateurs
├── Program Files\\  Applications installées
└── System32\\       Fichiers système essentiels
\`\`\`

## Permissions

### Permissions Linux
\`\`\`
-rwxr-xr-- 1 alice staff 4096 1 mai fichier.txt
\`\`\`
- \`-\` = type de fichier (- pour fichier, d pour répertoire)
- \`rwx\` = permissions du propriétaire (lecture, écriture, exécution)
- \`r-x\` = permissions du groupe
- \`r--\` = permissions des autres

\`\`\`bash
chmod 755 fichier.txt   # rwxr-xr-x
chown alice fichier.txt # changer le propriétaire
ls -la                  # lister les fichiers avec permissions
\`\`\`

## Montage

Sur Linux, les périphériques de stockage sont **montés** dans un répertoire :
\`\`\`bash
mount /dev/sdb1 /mnt/usb   # monter une clé USB
umount /mnt/usb             # démonter
df -h                       # afficher les systèmes de fichiers montés
\`\`\`

Sur Windows, les périphériques reçoivent des lettres de lecteur (C:, D:, E:).
Sur macOS, les périphériques se montent dans \`/Volumes/\`.`,
};

export const quiz = {
  en: [
    {
      question: "What is an inode?",
      options: [
        "A type of network packet",
        "A data structure storing file metadata",
        "A CPU instruction",
        "A type of RAM",
      ],
      correct: 1,
    },
    {
      question: "Which file system does Linux use most commonly?",
      options: ["NTFS", "APFS", "FAT32", "ext4"],
      correct: 3,
    },
    {
      question: "What is journaling in a file system?",
      options: [
        "Writing a diary of user activity",
        "A log of pending changes that allows recovery after crashes",
        "Compressing files automatically",
        "Encrypting sensitive data",
      ],
      correct: 1,
    },
    {
      question: "Where is the filename stored in Linux?",
      options: [
        "In the inode",
        "In the data block",
        "In the directory",
        "In the boot sector",
      ],
      correct: 2,
    },
    {
      question: "What does chmod 755 mean?",
      options: [
        "Owner can read only, others have no access",
        "Owner has full access, group and others can read and execute",
        "Everyone has full access",
        "No one has access",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Qu'est-ce qu'un inode ?",
      options: [
        "Un type de paquet réseau",
        "Une structure de données stockant les métadonnées d'un fichier",
        "Une instruction CPU",
        "Un type de RAM",
      ],
      correct: 1,
    },
    {
      question:
        "Quel système de fichiers Linux utilise-t-il le plus couramment ?",
      options: ["NTFS", "APFS", "FAT32", "ext4"],
      correct: 3,
    },
    {
      question: "Qu'est-ce que la journalisation dans un système de fichiers ?",
      options: [
        "Écrire un journal de l'activité utilisateur",
        "Un journal des modifications en attente permettant la récupération après un crash",
        "Compresser les fichiers automatiquement",
        "Chiffrer les données sensibles",
      ],
      correct: 1,
    },
    {
      question: "Où est stocké le nom de fichier sous Linux ?",
      options: [
        "Dans l'inode",
        "Dans le bloc de données",
        "Dans le répertoire",
        "Dans le secteur de démarrage",
      ],
      correct: 2,
    },
    {
      question: "Que signifie chmod 755 ?",
      options: [
        "Le propriétaire peut seulement lire, les autres n'ont pas d'accès",
        "Le propriétaire a un accès complet, le groupe et les autres peuvent lire et exécuter",
        "Tout le monde a un accès complet",
        "Personne n'a accès",
      ],
      correct: 1,
    },
  ],
};
