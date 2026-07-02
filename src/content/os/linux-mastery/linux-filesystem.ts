export const content = {
  en: `# Linux Filesystem Hierarchy

The Linux filesystem is a single tree starting from \`/\` (root). Everything — files, devices, processes — lives somewhere in this tree.

## The Filesystem Hierarchy Standard (FHS)

\`\`\`
/
├── bin/        Essential user binaries (ls, cp, mv, rm, cat)
├── boot/       Boot files (kernel, GRUB config, initrd)
├── dev/        Device files (sda, tty, null, random)
├── etc/        System configuration files
├── home/       User home directories (/home/alice, /home/bob)
├── lib/        Shared libraries needed by /bin and /sbin
├── media/      Mount points for removable media (USB, CD)
├── mnt/        Temporary mount points
├── opt/        Optional/third-party software
├── proc/       Virtual FS — kernel and process information
├── root/       Home directory for the root user
├── run/        Runtime data (PIDs, sockets)
├── sbin/       System binaries (for root: fdisk, iptables)
├── srv/        Data for services (web server files)
├── sys/        Virtual FS — hardware and kernel info
├── tmp/        Temporary files (cleared on reboot)
├── usr/        User programs and libraries
│   ├── bin/    Most user commands
│   ├── lib/    Libraries for /usr/bin
│   ├── local/  Locally installed software
│   └── share/  Architecture-independent data
└── var/        Variable data
    ├── log/    Log files
    ├── cache/  Application cache
    ├── mail/   User mailboxes
    └── spool/  Print and mail queues
\`\`\`

## Key Directories Explained

### /etc — Configuration
All system-wide configuration files live here:
\`\`\`bash
/etc/passwd         # User accounts
/etc/shadow         # Encrypted passwords
/etc/group          # Group definitions
/etc/hosts          # Hostname to IP mappings
/etc/fstab          # Filesystem mount table
/etc/ssh/sshd_config # SSH server config
/etc/nginx/         # Nginx web server config
/etc/systemd/       # systemd service files
\`\`\`

### /proc — Process Information
A virtual filesystem created by the kernel in memory:
\`\`\`bash
/proc/cpuinfo       # CPU details
/proc/meminfo       # Memory details
/proc/uptime        # System uptime
/proc/1/            # Directory for process PID 1
/proc/1/cmdline     # Command that started PID 1
/proc/net/dev       # Network interface stats
\`\`\`

### /sys — Hardware Information
Another virtual filesystem for hardware:
\`\`\`bash
/sys/class/net/     # Network interfaces
/sys/block/         # Block devices (disks)
/sys/bus/pci/       # PCI devices
\`\`\`

### /dev — Device Files
\`\`\`bash
/dev/sda            # First SATA/SCSI disk
/dev/sda1           # First partition of sda
/dev/nvme0n1        # NVMe SSD
/dev/tty1           # First terminal
/dev/null           # Discard output
/dev/zero           # Infinite stream of zeros
/dev/random         # Random bytes
\`\`\`

### /var — Variable Data
\`\`\`bash
/var/log/syslog     # System log
/var/log/auth.log   # Authentication log
/var/log/nginx/     # Nginx logs
/var/lib/mysql/     # MySQL database files
\`\`\`

## Essential Navigation Commands

\`\`\`bash
pwd                 # Print working directory
ls                  # List files
ls -la              # List all files with details
ls -lh              # Human-readable sizes
cd /etc             # Change to /etc
cd ~                # Go to home directory
cd -                # Go to previous directory
tree /etc           # Tree view of directory

# Find files
find / -name "*.log"           # Find all .log files
find /home -user alice         # Find files owned by alice
find /tmp -mtime +7            # Files older than 7 days
locate filename                # Fast search using database

# Disk usage
df -h               # Disk free space
du -sh /var/log     # Size of /var/log
du -sh /*           # Size of each root directory
\`\`\`

## File Operations

\`\`\`bash
# Create
touch file.txt              # Create empty file
mkdir -p dir/subdir         # Create directory tree
cp source dest              # Copy file
cp -r source/ dest/         # Copy directory recursively
mv source dest              # Move or rename
rm file.txt                 # Delete file
rm -rf directory/           # Delete directory (careful!)

# View
cat file.txt                # Print file content
less file.txt               # Paginated view
head -20 file.txt           # First 20 lines
tail -20 file.txt           # Last 20 lines
tail -f /var/log/syslog     # Follow log in real time

# Links
ln -s /path/to/file link    # Symbolic link
ln /path/to/file hardlink   # Hard link
\`\`\``,

  fr: `# Hiérarchie du système de fichiers Linux

Le système de fichiers Linux est un arbre unique commençant par \`/\` (racine). Tout — fichiers, périphériques, processus — se trouve quelque part dans cet arbre.

## Le standard de hiérarchie du système de fichiers (FHS)

\`\`\`
/
├── bin/        Binaires utilisateur essentiels (ls, cp, mv, rm, cat)
├── boot/       Fichiers de démarrage (noyau, config GRUB, initrd)
├── dev/        Fichiers de périphériques (sda, tty, null, random)
├── etc/        Fichiers de configuration système
├── home/       Répertoires personnels (/home/alice, /home/bob)
├── lib/        Bibliothèques partagées pour /bin et /sbin
├── media/      Points de montage pour médias amovibles (USB, CD)
├── mnt/        Points de montage temporaires
├── opt/        Logiciels optionnels/tiers
├── proc/       FS virtuel — informations noyau et processus
├── root/       Répertoire personnel de l'utilisateur root
├── run/        Données d'exécution (PIDs, sockets)
├── sbin/       Binaires système (pour root : fdisk, iptables)
├── srv/        Données pour les services (fichiers serveur web)
├── sys/        FS virtuel — infos matériel et noyau
├── tmp/        Fichiers temporaires (effacés au redémarrage)
├── usr/        Programmes et bibliothèques utilisateur
│   ├── bin/    La plupart des commandes utilisateur
│   ├── lib/    Bibliothèques pour /usr/bin
│   ├── local/  Logiciels installés localement
│   └── share/  Données indépendantes de l'architecture
└── var/        Données variables
    ├── log/    Fichiers journaux
    ├── cache/  Cache des applications
    ├── mail/   Boîtes aux lettres utilisateur
    └── spool/  Files d'impression et de courrier
\`\`\`

## Répertoires clés expliqués

### /etc — Configuration
Tous les fichiers de configuration système se trouvent ici :
\`\`\`bash
/etc/passwd         # Comptes utilisateurs
/etc/shadow         # Mots de passe chiffrés
/etc/group          # Définitions des groupes
/etc/hosts          # Correspondances nom d'hôte vers IP
/etc/fstab          # Table de montage des systèmes de fichiers
/etc/ssh/sshd_config # Config serveur SSH
/etc/nginx/         # Config serveur web Nginx
/etc/systemd/       # Fichiers de service systemd
\`\`\`

### /proc — Informations sur les processus
Un système de fichiers virtuel créé par le noyau en mémoire :
\`\`\`bash
/proc/cpuinfo       # Détails CPU
/proc/meminfo       # Détails mémoire
/proc/uptime        # Temps de fonctionnement système
/proc/1/            # Répertoire pour le processus PID 1
/proc/1/cmdline     # Commande qui a démarré PID 1
/proc/net/dev       # Stats des interfaces réseau
\`\`\`

### /sys — Informations matériel
Un autre système de fichiers virtuel pour le matériel :
\`\`\`bash
/sys/class/net/     # Interfaces réseau
/sys/block/         # Périphériques de blocs (disques)
/sys/bus/pci/       # Périphériques PCI
\`\`\`

### /dev — Fichiers de périphériques
\`\`\`bash
/dev/sda            # Premier disque SATA/SCSI
/dev/sda1           # Première partition de sda
/dev/nvme0n1        # SSD NVMe
/dev/tty1           # Premier terminal
/dev/null           # Jeter la sortie
/dev/zero           # Flux infini de zéros
/dev/random         # Octets aléatoires
\`\`\`

### /var — Données variables
\`\`\`bash
/var/log/syslog     # Journal système
/var/log/auth.log   # Journal d'authentification
/var/log/nginx/     # Journaux Nginx
/var/lib/mysql/     # Fichiers base de données MySQL
\`\`\`

## Commandes de navigation essentielles

\`\`\`bash
pwd                 # Afficher le répertoire courant
ls                  # Lister les fichiers
ls -la              # Lister tous les fichiers avec détails
ls -lh              # Tailles lisibles par l'homme
cd /etc             # Aller dans /etc
cd ~                # Aller dans le répertoire personnel
cd -                # Aller dans le répertoire précédent
tree /etc           # Vue arborescente du répertoire

# Trouver des fichiers
find / -name "*.log"           # Trouver tous les fichiers .log
find /home -user alice         # Fichiers appartenant à alice
find /tmp -mtime +7            # Fichiers plus vieux que 7 jours
locate fichier                 # Recherche rapide via base de données

# Utilisation du disque
df -h               # Espace disque libre
du -sh /var/log     # Taille de /var/log
du -sh /*           # Taille de chaque répertoire racine
\`\`\`

## Opérations sur les fichiers

\`\`\`bash
# Créer
touch fichier.txt              # Créer un fichier vide
mkdir -p dir/sousdir           # Créer une arborescence
cp source dest                 # Copier un fichier
cp -r source/ dest/            # Copier un répertoire récursivement
mv source dest                 # Déplacer ou renommer
rm fichier.txt                 # Supprimer un fichier
rm -rf repertoire/             # Supprimer un répertoire (attention !)

# Voir
cat fichier.txt                # Afficher le contenu
less fichier.txt               # Vue paginée
head -20 fichier.txt           # 20 premières lignes
tail -20 fichier.txt           # 20 dernières lignes
tail -f /var/log/syslog        # Suivre le journal en temps réel

# Liens
ln -s /chemin/vers/fichier lien    # Lien symbolique
ln /chemin/vers/fichier lien-dur   # Lien physique
\`\`\``,
};

export const quiz = {
  en: [
    {
      question: "Where are system configuration files stored in Linux?",
      options: ["/var", "/etc", "/sys", "/config"],
      correct: 1,
    },
    {
      question: "What is /proc in Linux?",
      options: [
        "A directory for programs",
        "A virtual filesystem with kernel and process information",
        "A directory for processor drivers",
        "A temporary storage location",
      ],
      correct: 1,
    },
    {
      question: "Which command shows disk free space?",
      options: ["du -h", "ls -lh", "df -h", "free -h"],
      correct: 2,
    },
    {
      question: "What does rm -rf do?",
      options: [
        "Removes a file safely",
        "Renames a file",
        "Deletes a directory and all its contents forcefully",
        "Refreshes the filesystem",
      ],
      correct: 2,
    },
    {
      question: "Where are user home directories stored?",
      options: ["/home", "/users", "/var/home", "/etc/home"],
      correct: 0,
    },
  ],
  fr: [
    {
      question:
        "Où sont stockés les fichiers de configuration système sous Linux ?",
      options: ["/var", "/etc", "/sys", "/config"],
      correct: 1,
    },
    {
      question: "Qu'est-ce que /proc sous Linux ?",
      options: [
        "Un répertoire pour les programmes",
        "Un système de fichiers virtuel avec les informations noyau et processus",
        "Un répertoire pour les pilotes processeur",
        "Un emplacement de stockage temporaire",
      ],
      correct: 1,
    },
    {
      question: "Quelle commande affiche l'espace disque libre ?",
      options: ["du -h", "ls -lh", "df -h", "free -h"],
      correct: 2,
    },
    {
      question: "Que fait rm -rf ?",
      options: [
        "Supprime un fichier en toute sécurité",
        "Renomme un fichier",
        "Supprime un répertoire et tout son contenu de force",
        "Rafraîchit le système de fichiers",
      ],
      correct: 2,
    },
    {
      question: "Où sont stockés les répertoires personnels des utilisateurs ?",
      options: ["/home", "/users", "/var/home", "/etc/home"],
      correct: 0,
    },
  ],
};
