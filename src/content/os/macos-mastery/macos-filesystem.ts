export const content = {
  en: `# macOS Filesystem — APFS Internals

APFS (Apple File System) was introduced in 2017 and replaced HFS+ (which dated back to 1998). Understanding APFS deeply reveals how Apple engineered a modern filesystem specifically for flash storage, encryption, and multi-device consistency.

## Why Apple Replaced HFS+

HFS+ was designed in 1998 for spinning hard drives. By 2017 it had serious problems:

\`\`\`
HFS+ Problems:
├── No native encryption (FileVault was a layer on top)
├── File timestamps only had 1-second resolution
│   (bad for build systems, version control)
├── No native snapshot support
├── Single volume per partition — no dynamic resizing
├── Copy was a real copy (slow, wasteful on SSD)
├── No space sharing between volumes
└── Not designed for SSDs (wear leveling issues)
\`\`\`

APFS solves every one of these problems.

## APFS Architecture

\`\`\`
APFS Container (entire SSD/partition)
├── Managed as a single pool of space
├── Multiple volumes share space dynamically
│
├── Volume: Macintosh HD (System — read-only, signed by Apple)
├── Volume: Macintosh HD - Data (User data — writable)
├── Volume: Preboot (boot data)
├── Volume: Recovery (macOS Recovery)
└── Volume: VM (virtual memory swap files)

Each volume:
├── Has its own directory tree
├── Shares the container's free space dynamically
├── Can have its own encryption key
└── Can have independent snapshots
\`\`\`

**Why separate System and Data volumes?**
This separation (introduced in macOS Catalina) is a security feature. The System volume is cryptographically signed by Apple and mounted read-only. Even root cannot modify it. This is SSV — Signed System Volume.

## APFS Key Features

### Copy-on-Write (CoW)
Every write in APFS is copy-on-write:

\`\`\`
Traditional filesystem (HFS+):
Write to file → overwrite existing data blocks in place
Risk: if power fails mid-write → file corruption

APFS (Copy-on-Write):
Write to file → write new data to new blocks
           → update metadata to point to new blocks
           → old blocks become free
Benefit: if power fails → old data still intact (atomic writes)
\`\`\`

### Clones — Instant Copies

APFS clones are near-instantaneous copies that share blocks:

\`\`\`bash
# Traditional copy: 10GB file takes 10GB space and time to copy
cp largefile.dmg largefile_backup.dmg    # Slow — copies all blocks

# APFS clone: 10GB file clone is instant and takes ~0 extra space
cp -c largefile.dmg largefile_backup.dmg  # Instant — shares blocks

# Both files initially share the same physical blocks
# When one file is modified: only the changed blocks are duplicated (CoW)
# This is why Finder "duplicate" is instant on APFS
\`\`\`

### Snapshots

APFS snapshots are read-only point-in-time copies of a volume:

\`\`\`bash
# List snapshots
tmutil listlocalsnapshots /
# com.apple.TimeMachine.2024-01-15-143022

# Create a snapshot manually
tmutil localsnapshot

# Mount a snapshot (read-only)
mkdir /tmp/snapshot_mount
mount_apfs -s com.apple.TimeMachine.2024-01-15-143022 / /tmp/snapshot_mount

# Delete a snapshot
tmutil deletelocalsnapshots 2024-01-15-143022

# List APFS snapshots via diskutil
diskutil apfs listSnapshots disk1s1
\`\`\`

**How Time Machine uses snapshots:**
Time Machine on APFS takes hourly local snapshots. When you connect a backup drive, it efficiently transfers only changed data. The local snapshots allow recovering files even without the backup drive.

### Space Sharing

Unlike traditional partitions, APFS volumes dynamically share the container's free space:

\`\`\`
Traditional partitioning:
[Partition 1: 100GB] [Partition 2: 100GB] [Partition 3: 56GB]
 78GB used            45GB used             2GB used
 22GB wasted          55GB wasted           54GB available
 (wasted space cannot be shared)

APFS Container: 256GB total
├── Volume 1: uses 78GB (no fixed limit)
├── Volume 2: uses 45GB (no fixed limit)
├── Volume 3: uses 2GB  (no fixed limit)
└── Free pool: 131GB (available to ANY volume)

You can set quotas and reservations, but by default space is shared
\`\`\`

### Native Encryption

APFS has encryption built into the filesystem layer — not as an add-on:

\`\`\`
Encryption modes:
├── No encryption
├── Single-key encryption (one key for entire volume)
└── Multi-key encryption (different key per file + metadata key)

FileVault 2 on APFS:
├── Uses APFS native encryption
├── Keys derived from your login password + hardware key (Secure Enclave)
├── Instant encryption (metadata encrypted immediately, data encrypted on write)
└── Recovery key stored in iCloud or printed

Encryption keys:
├── Class keys — one per protection class
├── Volume key — encrypts all file keys
└── File keys — unique per file (multi-key mode)
\`\`\`

\`\`\`bash
# Check FileVault status
fdesetup status

# Enable FileVault
sudo fdesetup enable

# Get FileVault recovery key
sudo fdesetup changerecovery -personal
\`\`\`

### Nanosecond Timestamps

HFS+ had 1-second timestamp resolution. APFS has nanosecond resolution:

\`\`\`bash
# See nanosecond timestamps
stat -f "%Sm %N" -t "%Y-%m-%d %H:%M:%S.%f" file.txt
# 2024-01-15 14:30:22.847392000 file.txt

# This matters for:
# - make (build system) — determines if files need rebuilding
# - git — detects file changes
# - Xcode — incremental builds
# - Time Machine — precise backup deltas
\`\`\`

## APFS On-Disk Structure

\`\`\`
APFS Container Superblock (NX_Superblock_t):
├── Magic: 'NXSB'
├── Block size (typically 4096 bytes)
├── Block count (total blocks in container)
├── Feature flags (encryption, snapshots, etc.)
├── UUID of the container
├── Pointer to Container Object Map
└── Pointer to Space Manager

APFS Volume Superblock (APFS_Superblock_t):
├── Magic: 'APSB'
├── Volume UUID
├── Volume name
├── Pointer to Volume Object Map
├── Pointer to root directory (inode 2)
├── Feature flags
└── Encryption state

B-Trees everywhere:
APFS uses B-trees for almost everything:
├── Object Map B-tree (maps object ID → physical address)
├── Extent B-tree (file data block locations)
├── Directory B-tree (filename → inode mapping)
├── Snapshot B-tree (snapshot metadata)
└── Free Space B-tree
\`\`\`

## Extended Attributes and Resource Forks

macOS supports extended attributes — metadata attached to files:

\`\`\`bash
# List extended attributes
xattr file.txt
xattr -l file.txt         # List with values

# Common extended attributes:
# com.apple.quarantine     — downloaded file warning
# com.apple.FinderInfo     — Finder color labels
# com.apple.ResourceFork   — Legacy Mac resource fork

# Remove quarantine (unblock downloaded file)
xattr -d com.apple.quarantine /Applications/MyApp.app

# Remove all extended attributes
xattr -c file.txt

# Resource forks (legacy, still used by some apps)
ls -la@ file.txt          # Shows resource fork size
# file.txt/..namedfork/rsrc  — resource fork path
\`\`\`

## diskutil — APFS Management

\`\`\`bash
# List all disks and volumes
diskutil list

# APFS-specific commands
diskutil apfs list                          # List APFS containers
diskutil apfs listSnapshots disk1s1         # List snapshots
diskutil apfs createVolume disk1 APFS "NewVol"  # Create volume
diskutil apfs deleteVolume disk1s6          # Delete volume
diskutil apfs resizeContainer disk1 200GB   # Resize container

# Check filesystem
diskutil verifyVolume /
diskutil repairVolume /                     # Repair (only works unmounted)

# Mount/unmount
diskutil unmount /dev/disk1s1
diskutil mount /dev/disk1s1
diskutil eject disk2                        # Eject external disk

# Get detailed info
diskutil info /
diskutil info disk1s1
\`\`\`

## APFS vs HFS+ vs ext4 vs NTFS

| Feature | APFS | HFS+ | ext4 | NTFS |
|---|---|---|---|---|
| Native encryption | ✓ Multi-key | ✗ | ✗ (fscrypt add-on) | ✓ (BitLocker) |
| Snapshots | ✓ Native | ✗ | ✗ | ✓ (VSS) |
| Copy-on-write | ✓ | ✗ | ✗ | ✓ (partial) |
| Clones | ✓ Instant | ✗ | ✗ | ✗ |
| Space sharing | ✓ Between volumes | ✗ | ✗ | ✗ |
| Timestamp resolution | Nanosecond | 1 second | Nanosecond | 100ns |
| Max file size | 8EB | 8EB | 16TB | 16EB |
| Crash consistency | ✓ CoW | Journaling | Journaling | Journaling |
| SSD optimized | ✓ | ✗ | Partial | Partial |

## Fusion Drive and Storage Tiers

\`\`\`bash
# Older Macs with Fusion Drive (HDD + SSD)
diskutil list                              # Shows CoreStorage

# APFS Fusion (newer implementation)
# macOS automatically tiers hot data to SSD, cold to HDD
# Transparent to applications

# Check disk health (NVMe)
smartctl -a disk0                         # Requires smartmontools (Homebrew)
diskutil info disk0 | grep SMART          # Basic SMART status
\`\`\`

## The Signed System Volume (SSV)

Introduced in macOS Big Sur — the ultimate filesystem integrity guarantee:

\`\`\`
How SSV works:
1. Apple computes a cryptographic hash of every file in /System
2. Creates a Merkle tree of all hashes
3. Root hash signed with Apple's private key

At boot:
├── macOS verifies root hash signature
├── If any file in /System changed → boot fails
├── Even if attacker got root access and modified files
└── Hash would not match → system refuses to boot

To modify /System:
└── Must have Apple's private key (impossible)
└── Result: /System is provably unmodified Apple code
\`\`\`

\`\`\`bash
# Verify SSV seal
diskutil apfs verifySSV /               # Verify the SSV seal
# Should output: The volume /dev/disk1s1 is cryptographically valid
\`\`\``,

  fr: `# Système de fichiers macOS — Internals APFS

APFS (Apple File System) a été introduit en 2017 et a remplacé HFS+ (qui datait de 1998). Comprendre APFS en profondeur révèle comment Apple a conçu un système de fichiers moderne spécifiquement pour le stockage flash, le chiffrement et la cohérence multi-appareils.

## Pourquoi Apple a remplacé HFS+

HFS+ a été conçu en 1998 pour les disques durs à plateaux. En 2017, il avait de sérieux problèmes :

\`\`\`
Problèmes de HFS+ :
├── Pas de chiffrement natif (FileVault était une couche au-dessus)
├── Résolution des horodatages seulement d'une seconde
│   (mauvais pour les systèmes de build, le contrôle de version)
├── Pas de support natif des snapshots
├── Volume unique par partition — pas de redimensionnement dynamique
├── Copie = vraie copie (lente, gaspilleuse sur SSD)
├── Pas de partage d'espace entre volumes
└── Pas conçu pour les SSD (problèmes de wear leveling)
\`\`\`

APFS résout chacun de ces problèmes.

## Architecture APFS

\`\`\`
Conteneur APFS (SSD/partition entier)
├── Géré comme un pool d'espace unique
├── Plusieurs volumes partagent l'espace dynamiquement
│
├── Volume : Macintosh HD (Système — lecture seule, signé par Apple)
├── Volume : Macintosh HD - Data (Données utilisateur — inscriptible)
├── Volume : Preboot (données de démarrage)
├── Volume : Recovery (Récupération macOS)
└── Volume : VM (fichiers swap mémoire virtuelle)

Chaque volume :
├── A sa propre arborescence de répertoires
├── Partage l'espace libre du conteneur dynamiquement
├── Peut avoir sa propre clé de chiffrement
└── Peut avoir des snapshots indépendants
\`\`\`

**Pourquoi séparer les volumes Système et Données ?**
Cette séparation (introduite dans macOS Catalina) est une fonctionnalité de sécurité. Le volume Système est signé cryptographiquement par Apple et monté en lecture seule. Même root ne peut pas le modifier. C'est le SSV — Volume Système Signé.

## Fonctionnalités clés d'APFS

### Copy-on-Write (CoW)
Chaque écriture dans APFS est copy-on-write :

\`\`\`
Système de fichiers traditionnel (HFS+) :
Écriture → écrase les blocs de données existants en place
Risque : si la batterie tombe en pleine écriture → corruption

APFS (Copy-on-Write) :
Écriture → écrit les nouvelles données dans de nouveaux blocs
         → met à jour les métadonnées pour pointer vers les nouveaux blocs
         → les anciens blocs deviennent libres
Avantage : si la batterie tombe → les anciennes données restent intactes
\`\`\`

### Clones — Copies instantanées

Les clones APFS sont des copies quasi-instantanées qui partagent les blocs :

\`\`\`bash
# Copie traditionnelle : fichier 10 Go prend 10 Go d'espace et du temps
cp grosfichier.dmg grosfichier_backup.dmg    # Lent — copie tous les blocs

# Clone APFS : instantané et prend ~0 espace supplémentaire
cp -c grosfichier.dmg grosfichier_backup.dmg  # Instantané — partage les blocs

# Les deux fichiers partagent initialement les mêmes blocs physiques
# Quand un fichier est modifié : seuls les blocs modifiés sont dupliqués (CoW)
# C'est pourquoi "Dupliquer" dans le Finder est instantané sur APFS
\`\`\`

### Snapshots

Les snapshots APFS sont des copies en lecture seule d'un volume à un instant donné :

\`\`\`bash
# Lister les snapshots
tmutil listlocalsnapshots /

# Créer un snapshot manuellement
tmutil localsnapshot

# Monter un snapshot (lecture seule)
mkdir /tmp/montage_snapshot
mount_apfs -s com.apple.TimeMachine.2024-01-15-143022 / /tmp/montage_snapshot

# Supprimer un snapshot
tmutil deletelocalsnapshots 2024-01-15-143022

# Lister les snapshots APFS
diskutil apfs listSnapshots disk1s1
\`\`\`

### Partage d'espace

Contrairement aux partitions traditionnelles, les volumes APFS partagent dynamiquement l'espace libre du conteneur :

\`\`\`
Partitionnement traditionnel :
[Partition 1 : 100 Go] [Partition 2 : 100 Go] [Partition 3 : 56 Go]
 78 Go utilisés         45 Go utilisés          2 Go utilisés
 22 Go gaspillés        55 Go gaspillés         54 Go disponibles
 (l'espace gaspillé ne peut pas être partagé)

Conteneur APFS : 256 Go total
├── Volume 1 : utilise 78 Go (pas de limite fixe)
├── Volume 2 : utilise 45 Go (pas de limite fixe)
├── Volume 3 : utilise 2 Go  (pas de limite fixe)
└── Pool libre : 131 Go (disponible pour N'IMPORTE QUEL volume)
\`\`\`

### Chiffrement natif

APFS intègre le chiffrement dans la couche système de fichiers :

\`\`\`
Modes de chiffrement :
├── Pas de chiffrement
├── Chiffrement à clé unique (une clé pour tout le volume)
└── Chiffrement multi-clés (clé différente par fichier + clé de métadonnées)

FileVault 2 sur APFS :
├── Utilise le chiffrement natif APFS
├── Clés dérivées de votre mot de passe + clé matérielle (Secure Enclave)
├── Chiffrement instantané (métadonnées chiffrées immédiatement)
└── Clé de récupération stockée dans iCloud ou imprimée
\`\`\`

\`\`\`bash
# Vérifier l'état de FileVault
fdesetup status

# Activer FileVault
sudo fdesetup enable
\`\`\`

## Structure sur disque APFS

\`\`\`
Superbloc du conteneur APFS (NX_Superblock_t) :
├── Magic : 'NXSB'
├── Taille de bloc (typiquement 4096 octets)
├── Nombre de blocs (total dans le conteneur)
├── Drapeaux de fonctionnalités (chiffrement, snapshots, etc.)
├── UUID du conteneur
├── Pointeur vers la carte d'objets du conteneur
└── Pointeur vers le gestionnaire d'espace

Superbloc de volume APFS (APFS_Superblock_t) :
├── Magic : 'APSB'
├── UUID du volume
├── Nom du volume
├── Pointeur vers la carte d'objets du volume
├── Pointeur vers le répertoire racine (inode 2)
└── État de chiffrement

Arbres B partout :
APFS utilise des arbres B pour presque tout :
├── Arbre B de carte d'objets (mappe ID objet → adresse physique)
├── Arbre B d'étendue (emplacements des blocs de données fichier)
├── Arbre B de répertoire (nom de fichier → mappage inode)
├── Arbre B de snapshot (métadonnées de snapshot)
└── Arbre B d'espace libre
\`\`\`

## Attributs étendus et fourches de ressources

\`\`\`bash
# Lister les attributs étendus
xattr fichier.txt
xattr -l fichier.txt         # Lister avec valeurs

# Attributs étendus courants :
# com.apple.quarantine     — avertissement fichier téléchargé
# com.apple.FinderInfo     — étiquettes de couleur Finder
# com.apple.ResourceFork   — fourche de ressource Mac héritée

# Supprimer la quarantaine
xattr -d com.apple.quarantine /Applications/MonApp.app

# Supprimer tous les attributs étendus
xattr -c fichier.txt
\`\`\`

## diskutil — Gestion APFS

\`\`\`bash
# Lister tous les disques et volumes
diskutil list

# Commandes spécifiques APFS
diskutil apfs list                              # Lister les conteneurs APFS
diskutil apfs listSnapshots disk1s1             # Lister les snapshots
diskutil apfs createVolume disk1 APFS "NouveauVol"  # Créer un volume
diskutil apfs deleteVolume disk1s6              # Supprimer un volume

# Vérifier le système de fichiers
diskutil verifyVolume /
diskutil repairVolume /

# Monter/démonter
diskutil unmount /dev/disk1s1
diskutil mount /dev/disk1s1
diskutil eject disk2                            # Éjecter le disque externe

# Infos détaillées
diskutil info /
diskutil info disk1s1
\`\`\`

## Le Volume Système Signé (SSV)

Introduit dans macOS Big Sur — la garantie ultime d'intégrité du système de fichiers :

\`\`\`
Comment fonctionne SSV :
1. Apple calcule un hash cryptographique de chaque fichier dans /System
2. Crée un arbre de Merkle de tous les hashes
3. Hash racine signé avec la clé privée d'Apple

Au démarrage :
├── macOS vérifie la signature du hash racine
├── Si un fichier dans /System a changé → le démarrage échoue
├── Même si l'attaquant a obtenu l'accès root et a modifié des fichiers
└── Le hash ne correspondrait pas → le système refuse de démarrer

Pour modifier /System :
└── Doit avoir la clé privée d'Apple (impossible)
└── Résultat : /System est du code Apple prouvablement non modifié
\`\`\`

\`\`\`bash
# Vérifier le sceau SSV
diskutil apfs verifySSV /
\`\`\``,
};

export const quiz = {
  en: [
    {
      question:
        "What is the key advantage of APFS Copy-on-Write over traditional overwrite?",
      options: [
        "It is faster for large files",
        "Writes are atomic — if power fails mid-write, the original data is still intact",
        "It uses less disk space",
        "It allows multiple processes to write simultaneously",
      ],
      correct: 1,
    },
    {
      question: "What is an APFS clone?",
      options: [
        "A full copy of a volume",
        "An encrypted backup",
        "An instant copy that shares blocks with the original until modified",
        "A read-only snapshot",
      ],
      correct: 2,
    },
    {
      question:
        "Why did macOS Catalina split into separate System and Data volumes?",
      options: [
        "To improve performance",
        "To allow easier backups",
        "The System volume is cryptographically signed and read-only — even root cannot modify it",
        "To support multiple users",
      ],
      correct: 2,
    },
    {
      question: "What does the Signed System Volume (SSV) guarantee?",
      options: [
        "That user files cannot be deleted",
        "That every file in /System matches Apple's cryptographic hash — provably unmodified",
        "That the volume is encrypted",
        "That snapshots are valid",
      ],
      correct: 1,
    },
    {
      question:
        "How does APFS space sharing differ from traditional partitioning?",
      options: [
        "APFS volumes have fixed sizes like traditional partitions",
        "Multiple APFS volumes dynamically share the container's free space pool",
        "APFS requires more space than traditional partitions",
        "APFS volumes cannot be resized",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Quel est l'avantage clé du Copy-on-Write APFS par rapport à l'écrasement traditionnel ?",
      options: [
        "C'est plus rapide pour les gros fichiers",
        "Les écritures sont atomiques — si la batterie tombe en pleine écriture, les données originales restent intactes",
        "Ça utilise moins d'espace disque",
        "Ça permet à plusieurs processus d'écrire simultanément",
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce qu'un clone APFS ?",
      options: [
        "Une copie complète d'un volume",
        "Une sauvegarde chiffrée",
        "Une copie instantanée qui partage les blocs avec l'original jusqu'à modification",
        "Un snapshot en lecture seule",
      ],
      correct: 2,
    },
    {
      question:
        "Pourquoi macOS Catalina a-t-il séparé en volumes Système et Données distincts ?",
      options: [
        "Pour améliorer les performances",
        "Pour faciliter les sauvegardes",
        "Le volume Système est signé cryptographiquement et en lecture seule — même root ne peut pas le modifier",
        "Pour supporter plusieurs utilisateurs",
      ],
      correct: 2,
    },
    {
      question: "Que garantit le Volume Système Signé (SSV) ?",
      options: [
        "Que les fichiers utilisateur ne peuvent pas être supprimés",
        "Que chaque fichier dans /System correspond au hash cryptographique d'Apple — prouvablement non modifié",
        "Que le volume est chiffré",
        "Que les snapshots sont valides",
      ],
      correct: 1,
    },
    {
      question:
        "En quoi le partage d'espace APFS diffère-t-il du partitionnement traditionnel ?",
      options: [
        "Les volumes APFS ont des tailles fixes comme les partitions traditionnelles",
        "Plusieurs volumes APFS partagent dynamiquement le pool d'espace libre du conteneur",
        "APFS nécessite plus d'espace que les partitions traditionnelles",
        "Les volumes APFS ne peuvent pas être redimensionnés",
      ],
      correct: 1,
    },
  ],
};
