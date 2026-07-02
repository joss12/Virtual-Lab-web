export const content = {
  en: `# The Windows Registry

The Registry is one of the most misunderstood components of Windows. It is not just a "settings database" — it is the central nervous system of the entire OS, and understanding it deeply separates Windows power users from true administrators.

## What the Registry Actually Is

The Registry is a **hierarchical database** stored in binary files called **hives**. It stores:
- OS configuration (hardware, drivers, services)
- User preferences and application settings
- Security policies and access control
- Hardware device information
- Installed software information
- Boot configuration

**Critical insight**: The Registry is loaded into memory at boot. What you see in regedit is a live view of in-memory data structures, not a direct file read. Changes take effect immediately in memory — some require a reboot to propagate to all components.

## Registry Structure

\`\`\`
HKEY_LOCAL_MACHINE (HKLM)
│   Machine-wide settings — requires admin to modify
├── HARDWARE\\          Volatile — rebuilt at every boot from hardware detection
├── SAM\\               Security Account Manager — local user accounts
├── SECURITY\\          Security policies — only accessible by SYSTEM
├── SOFTWARE\\          Installed applications and OS settings
└── SYSTEM\\            Driver and service configuration

HKEY_CURRENT_USER (HKCU)
│   Per-user settings — loaded from user's NTUSER.DAT hive
├── Software\\          User-specific app settings
├── Environment\\       User environment variables
└── Control Panel\\     User interface preferences

HKEY_CLASSES_ROOT (HKCR)
│   File associations and COM object registration
│   Merged view of HKLM\\SOFTWARE\\Classes and HKCU\\SOFTWARE\\Classes

HKEY_USERS (HKU)
│   All loaded user hives
├── .DEFAULT\\          Default user profile template
├── S-1-5-18\\          SYSTEM account
└── S-1-5-21-...\\      Each logged-in user's SID

HKEY_CURRENT_CONFIG (HKCC)
    Current hardware profile — alias for HKLM\\SYSTEM\\CurrentControlSet\\Hardware Profiles\\Current
\`\`\`

## Registry Hive Files

The Registry lives in these files on disk:

\`\`\`
C:\\Windows\\System32\\config\\
├── SYSTEM          → HKLM\\SYSTEM
├── SOFTWARE        → HKLM\\SOFTWARE
├── SAM             → HKLM\\SAM
├── SECURITY        → HKLM\\SECURITY
└── DEFAULT         → HKU\\.DEFAULT

C:\\Users\\Username\\
├── NTUSER.DAT      → HKCU (loaded at login)
└── AppData\\Local\\Microsoft\\Windows\\UsrClass.dat → HKCU\\Software\\Classes
\`\`\`

**Why this matters**: When forensically analyzing a Windows system, or when Windows won't boot, you can mount these hive files on another system and read the registry offline.

## Data Types

| Type | Name | Description | Example |
|---|---|---|---|
| REG_SZ | String | Plain text | "C:\\Windows" |
| REG_EXPAND_SZ | Expandable String | Text with env vars | "%SystemRoot%\\system32" |
| REG_MULTI_SZ | Multi-String | Multiple strings | "driver1\\0driver2\\0" |
| REG_DWORD | 32-bit Integer | 4-byte number | 0x00000001 |
| REG_QWORD | 64-bit Integer | 8-byte number | Large numbers |
| REG_BINARY | Binary Data | Raw bytes | Hardware info |
| REG_NONE | No type | Untyped data | Rare |

## Critical Registry Locations

### Startup Programs
\`\`\`
HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run
HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce
HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run
HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce

# Services (more powerful than Run keys)
HKLM\\SYSTEM\\CurrentControlSet\\Services\\
\`\`\`

### System Configuration
\`\`\`
# Installed software
HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\

# Environment variables
HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment
HKCU\\Environment

# Computer name
HKLM\\SYSTEM\\CurrentControlSet\\Control\\ComputerName\\ComputerName

# Time zone
HKLM\\SYSTEM\\CurrentControlSet\\Control\\TimeZoneInformation

# Windows version
HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion
\`\`\`

### Security and UAC
\`\`\`
# UAC settings
HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System
  EnableLUA = 1        (UAC enabled)
  ConsentPromptBehaviorAdmin = 5  (prompt for consent)

# Windows Defender
HKLM\\SOFTWARE\\Microsoft\\Windows Defender\\

# AppLocker policies
HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\SrpV2\\
\`\`\`

### File Associations
\`\`\`
# How .txt opens Notepad
HKCR\\.txt\\               → Default = "txtfile"
HKCR\\txtfile\\shell\\open\\command → "notepad.exe %1"

# COM object registration
HKCR\\CLSID\\{GUID}\\      → COM class information
HKCR\\CLSID\\{GUID}\\InprocServer32 → DLL path
\`\`\`

## Registry Internals — How It Works

### Hive Structure on Disk
Each hive file has:
- **Base block**: Magic number, version, checksum, root cell offset
- **Bins**: 4KB aligned blocks containing cells
- **Cells**: Individual data units (key cells, value cells, data cells)

\`\`\`
Hive File Layout:
[Base Block 4KB][Bin 4KB][Bin 4KB][Bin 4KB]...

Each Bin:
[Bin Header][Cell][Cell][Cell][Free Space]

Key Cell (HIVE_CELL):
Signature | SubKeys count | Values count | 
SecurityOffset | ClassOffset | LastWriteTime | 
NameLength | Name[]
\`\`\`

### Registry Transactions
The Registry uses **transactions** for reliability:
- Changes are written to a log file first
- Then applied to the hive
- If a crash occurs during write, the log allows recovery
- This is why registry corruption is rare despite frequent writes

### Registry Virtualization
For compatibility with older 32-bit applications on 64-bit Windows:
- 32-bit apps writing to \`HKLM\\SOFTWARE\` are redirected to \`HKLM\\SOFTWARE\\Wow6432Node\`
- This allows 32-bit and 64-bit versions of the same software to coexist

## Working with the Registry

### regedit (GUI)
\`\`\`
Win+R → regedit
\`\`\`

### reg.exe (Command Line)
\`\`\`cmd
:: Query a value
reg query "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion" /v ProductName

:: Add a value
reg add "HKCU\\SOFTWARE\\MyApp" /v Setting /t REG_SZ /d "value"

:: Delete a value
reg delete "HKCU\\SOFTWARE\\MyApp" /v Setting

:: Export a key
reg export "HKLM\\SOFTWARE\\MyApp" C:\\backup\\myapp.reg

:: Import a .reg file
reg import C:\\backup\\myapp.reg

:: Copy a key
reg copy "HKLM\\SOFTWARE\\MyApp" "HKLM\\SOFTWARE\\MyAppBackup" /s
\`\`\`

### PowerShell
\`\`\`powershell
# Navigate the registry like a filesystem
Set-Location HKLM:\\SOFTWARE\\Microsoft
Get-ChildItem HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run

# Read a value
Get-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion" -Name ProductName

# Set a value
Set-ItemProperty -Path "HKCU:\\SOFTWARE\\MyApp" -Name "Setting" -Value "value"

# Create a key
New-Item -Path "HKCU:\\SOFTWARE\\MyApp"

# Delete a key
Remove-Item -Path "HKCU:\\SOFTWARE\\MyApp" -Recurse

# Search the registry
Get-ChildItem -Path HKLM:\\SOFTWARE -Recurse |
  Get-ItemProperty |
  Where-Object { $_ -match "MyApp" }
\`\`\`

## Registry Security

Each registry key has a **security descriptor** with:
- **Owner**: Who owns the key
- **DACL**: Who can read/write/create subkeys
- **SACL**: Auditing settings

\`\`\`powershell
# View registry key permissions
Get-Acl -Path "HKLM:\\SOFTWARE\\Microsoft" | Format-List

# Check if a key exists and is accessible
Test-Path "HKLM:\\SOFTWARE\\Microsoft\\Windows"
\`\`\`

## Registry Forensics

The Registry is a goldmine for forensic analysis:

\`\`\`
# Recently accessed files
HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RecentDocs

# Recently run programs (Run dialog)
HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RunMRU

# USB devices ever connected
HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR

# Network connections history
HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\NetworkList\\Signatures

# User's timezone (for timeline analysis)
HKLM\\SYSTEM\\CurrentControlSet\\Control\\TimeZoneInformation

# Last shutdown time
HKLM\\SYSTEM\\CurrentControlSet\\Control\\Windows → ShutdownTime (FILETIME format)
\`\`\`

## Common Registry Mistakes

**Never do this:**
- Delete HKLM\\SYSTEM or HKLM\\SOFTWARE — Windows will not boot
- Modify SAM or SECURITY without understanding consequences
- Trust registry "cleaners" — they often cause more harm than good

**Safe practices:**
- Always export a key before modifying it (\`reg export\`)
- Use System Restore point before major changes
- Test changes in a VM first`,

  fr: `# Le Registre Windows

Le Registre est l'un des composants les plus mal compris de Windows. Ce n'est pas juste une "base de données de paramètres" — c'est le système nerveux central de tout l'OS, et le comprendre profondément sépare les utilisateurs expérimentés des vrais administrateurs.

## Ce qu'est vraiment le Registre

Le Registre est une **base de données hiérarchique** stockée dans des fichiers binaires appelés **ruches**. Il stocke :
- La configuration OS (matériel, pilotes, services)
- Les préférences utilisateur et paramètres d'application
- Les politiques de sécurité et contrôle d'accès
- Les informations sur les périphériques matériels
- Les informations sur les logiciels installés
- La configuration du démarrage

**Point critique** : Le Registre est chargé en mémoire au démarrage. Ce que vous voyez dans regedit est une vue en direct des structures de données en mémoire, pas une lecture directe de fichier. Les modifications prennent effet immédiatement en mémoire — certaines nécessitent un redémarrage pour se propager à tous les composants.

## Structure du Registre

\`\`\`
HKEY_LOCAL_MACHINE (HKLM)
│   Paramètres machine — nécessite admin pour modifier
├── HARDWARE\\          Volatile — reconstruit à chaque boot
├── SAM\\               Gestionnaire de comptes de sécurité
├── SECURITY\\          Politiques de sécurité — accessible uniquement par SYSTEM
├── SOFTWARE\\          Applications installées et paramètres OS
└── SYSTEM\\            Configuration des pilotes et services

HKEY_CURRENT_USER (HKCU)
│   Paramètres par utilisateur — chargé depuis NTUSER.DAT
├── Software\\          Paramètres app spécifiques à l'utilisateur
├── Environment\\       Variables d'environnement utilisateur
└── Control Panel\\     Préférences interface utilisateur

HKEY_CLASSES_ROOT (HKCR)
│   Associations de fichiers et enregistrement COM
│   Vue fusionnée de HKLM\\SOFTWARE\\Classes et HKCU\\SOFTWARE\\Classes

HKEY_USERS (HKU)
│   Toutes les ruches utilisateur chargées
├── .DEFAULT\\          Modèle de profil utilisateur par défaut
├── S-1-5-18\\          Compte SYSTEM
└── S-1-5-21-...\\      SID de chaque utilisateur connecté

HKEY_CURRENT_CONFIG (HKCC)
    Profil matériel actuel — alias pour HKLM\\SYSTEM\\CurrentControlSet\\Hardware Profiles\\Current
\`\`\`

## Fichiers de ruche du Registre

Le Registre vit dans ces fichiers sur le disque :

\`\`\`
C:\\Windows\\System32\\config\\
├── SYSTEM          → HKLM\\SYSTEM
├── SOFTWARE        → HKLM\\SOFTWARE
├── SAM             → HKLM\\SAM
├── SECURITY        → HKLM\\SECURITY
└── DEFAULT         → HKU\\.DEFAULT

C:\\Users\\NomUtilisateur\\
├── NTUSER.DAT      → HKCU (chargé à la connexion)
└── AppData\\Local\\Microsoft\\Windows\\UsrClass.dat → HKCU\\Software\\Classes
\`\`\`

**Pourquoi c'est important** : Lors d'une analyse forensique d'un système Windows, ou quand Windows ne démarre pas, vous pouvez monter ces fichiers de ruche sur un autre système et lire le registre hors ligne.

## Types de données

| Type | Nom | Description | Exemple |
|---|---|---|---|
| REG_SZ | Chaîne | Texte simple | "C:\\Windows" |
| REG_EXPAND_SZ | Chaîne extensible | Texte avec vars d'env | "%SystemRoot%\\system32" |
| REG_MULTI_SZ | Multi-chaîne | Plusieurs chaînes | "driver1\\0driver2\\0" |
| REG_DWORD | Entier 32 bits | Nombre 4 octets | 0x00000001 |
| REG_QWORD | Entier 64 bits | Nombre 8 octets | Grands nombres |
| REG_BINARY | Données binaires | Octets bruts | Infos matériel |
| REG_NONE | Aucun type | Données sans type | Rare |

## Emplacements critiques du Registre

### Programmes au démarrage
\`\`\`
HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run
HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce
HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run
HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\RunOnce

# Services (plus puissants que les clés Run)
HKLM\\SYSTEM\\CurrentControlSet\\Services\\
\`\`\`

### Configuration système
\`\`\`
# Logiciels installés
HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\

# Variables d'environnement
HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment
HKCU\\Environment

# Nom de l'ordinateur
HKLM\\SYSTEM\\CurrentControlSet\\Control\\ComputerName\\ComputerName

# Fuseau horaire
HKLM\\SYSTEM\\CurrentControlSet\\Control\\TimeZoneInformation

# Version Windows
HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion
\`\`\`

### Sécurité et UAC
\`\`\`
# Paramètres UAC
HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System
  EnableLUA = 1        (UAC activé)
  ConsentPromptBehaviorAdmin = 5  (demande de consentement)

# Windows Defender
HKLM\\SOFTWARE\\Microsoft\\Windows Defender\\

# Politiques AppLocker
HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\SrpV2\\
\`\`\`

### Associations de fichiers
\`\`\`
# Comment .txt ouvre Notepad
HKCR\\.txt\\               → Défaut = "txtfile"
HKCR\\txtfile\\shell\\open\\command → "notepad.exe %1"

# Enregistrement d'objets COM
HKCR\\CLSID\\{GUID}\\      → Informations de classe COM
HKCR\\CLSID\\{GUID}\\InprocServer32 → Chemin de la DLL
\`\`\`

## Internals du Registre — Comment ça fonctionne

### Structure de ruche sur disque
Chaque fichier de ruche a :
- **Bloc de base** : Nombre magique, version, somme de contrôle, décalage de cellule racine
- **Bacs** : Blocs alignés sur 4 Ko contenant des cellules
- **Cellules** : Unités de données individuelles (cellules de clé, cellules de valeur, cellules de données)

\`\`\`
Disposition du fichier de ruche :
[Bloc de base 4 Ko][Bac 4 Ko][Bac 4 Ko][Bac 4 Ko]...

Chaque bac :
[En-tête de bac][Cellule][Cellule][Cellule][Espace libre]

Cellule de clé (HIVE_CELL) :
Signature | Nombre de sous-clés | Nombre de valeurs |
Décalage sécurité | Décalage classe | Heure dernière écriture |
Longueur nom | Nom[]
\`\`\`

### Transactions du Registre
Le Registre utilise des **transactions** pour la fiabilité :
- Les modifications sont d'abord écrites dans un fichier journal
- Puis appliquées à la ruche
- Si un crash se produit pendant l'écriture, le journal permet la récupération
- C'est pourquoi la corruption du registre est rare malgré les écritures fréquentes

### Virtualisation du Registre
Pour la compatibilité avec les anciennes applications 32 bits sur Windows 64 bits :
- Les apps 32 bits écrivant dans \`HKLM\\SOFTWARE\` sont redirigées vers \`HKLM\\SOFTWARE\\Wow6432Node\`
- Cela permet aux versions 32 bits et 64 bits du même logiciel de coexister

## Travailler avec le Registre

### regedit (GUI)
\`\`\`
Win+R → regedit
\`\`\`

### reg.exe (Ligne de commande)
\`\`\`cmd
:: Interroger une valeur
reg query "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion" /v ProductName

:: Ajouter une valeur
reg add "HKCU\\SOFTWARE\\MonApp" /v Parametre /t REG_SZ /d "valeur"

:: Supprimer une valeur
reg delete "HKCU\\SOFTWARE\\MonApp" /v Parametre

:: Exporter une clé
reg export "HKLM\\SOFTWARE\\MonApp" C:\\sauvegarde\\monapp.reg

:: Importer un fichier .reg
reg import C:\\sauvegarde\\monapp.reg

:: Copier une clé
reg copy "HKLM\\SOFTWARE\\MonApp" "HKLM\\SOFTWARE\\MonAppSauvegarde" /s
\`\`\`

### PowerShell
\`\`\`powershell
# Naviguer dans le registre comme un système de fichiers
Set-Location HKLM:\\SOFTWARE\\Microsoft
Get-ChildItem HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run

# Lire une valeur
Get-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion" -Name ProductName

# Définir une valeur
Set-ItemProperty -Path "HKCU:\\SOFTWARE\\MonApp" -Name "Parametre" -Value "valeur"

# Créer une clé
New-Item -Path "HKCU:\\SOFTWARE\\MonApp"

# Supprimer une clé
Remove-Item -Path "HKCU:\\SOFTWARE\\MonApp" -Recurse

# Rechercher dans le registre
Get-ChildItem -Path HKLM:\\SOFTWARE -Recurse |
  Get-ItemProperty |
  Where-Object { $_ -match "MonApp" }
\`\`\`

## Sécurité du Registre

Chaque clé de registre a un **descripteur de sécurité** avec :
- **Propriétaire** : Qui possède la clé
- **DACL** : Qui peut lire/écrire/créer des sous-clés
- **SACL** : Paramètres d'audit

\`\`\`powershell
# Voir les permissions d'une clé
Get-Acl -Path "HKLM:\\SOFTWARE\\Microsoft" | Format-List

# Vérifier si une clé existe et est accessible
Test-Path "HKLM:\\SOFTWARE\\Microsoft\\Windows"
\`\`\`

## Forensique du Registre

Le Registre est une mine d'or pour l'analyse forensique :

\`\`\`
# Fichiers récemment accédés
HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RecentDocs

# Programmes récemment exécutés (boîte de dialogue Exécuter)
HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Explorer\\RunMRU

# Périphériques USB jamais connectés
HKLM\\SYSTEM\\CurrentControlSet\\Enum\\USBSTOR

# Historique des connexions réseau
HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\NetworkList\\Signatures

# Fuseau horaire de l'utilisateur (pour analyse de chronologie)
HKLM\\SYSTEM\\CurrentControlSet\\Control\\TimeZoneInformation

# Heure du dernier arrêt
HKLM\\SYSTEM\\CurrentControlSet\\Control\\Windows → ShutdownTime (format FILETIME)
\`\`\`

## Erreurs courantes avec le Registre

**Ne jamais faire :**
- Supprimer HKLM\\SYSTEM ou HKLM\\SOFTWARE — Windows ne démarrera pas
- Modifier SAM ou SECURITY sans comprendre les conséquences
- Faire confiance aux "nettoyeurs de registre" — ils causent souvent plus de mal que de bien

**Bonnes pratiques :**
- Toujours exporter une clé avant de la modifier (\`reg export\`)
- Créer un point de restauration système avant des modifications majeures
- Tester les modifications dans une VM d'abord`,
};

export const quiz = {
  en: [
    {
      question: "What type of database is the Windows Registry?",
      options: [
        "Relational database",
        "Hierarchical database stored in binary hive files",
        "Flat text file database",
        "SQL database",
      ],
      correct: 1,
    },
    {
      question: "Which registry hive contains per-user settings?",
      options: [
        "HKEY_LOCAL_MACHINE",
        "HKEY_CLASSES_ROOT",
        "HKEY_CURRENT_USER",
        "HKEY_USERS",
      ],
      correct: 2,
    },
    {
      question: "What file contains the current user's registry hive?",
      options: ["SYSTEM.DAT", "USER.DAT", "NTUSER.DAT", "REGISTRY.DAT"],
      correct: 2,
    },
    {
      question: "Where are startup programs stored in the registry?",
      options: [
        "HKLM\\SYSTEM\\Boot\\Run",
        "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run",
        "HKCU\\SOFTWARE\\Startup",
        "HKLM\\SOFTWARE\\Startup\\Programs",
      ],
      correct: 1,
    },
    {
      question: "Why does the registry use transactions?",
      options: [
        "To speed up registry access",
        "To allow multiple users to edit simultaneously",
        "To ensure reliability — if a crash occurs during write, the log allows recovery",
        "To compress registry data",
      ],
      correct: 2,
    },
  ],
  fr: [
    {
      question: "Quel type de base de données est le Registre Windows ?",
      options: [
        "Base de données relationnelle",
        "Base de données hiérarchique stockée dans des fichiers de ruche binaires",
        "Base de données de fichiers texte plats",
        "Base de données SQL",
      ],
      correct: 1,
    },
    {
      question:
        "Quelle ruche du registre contient les paramètres par utilisateur ?",
      options: [
        "HKEY_LOCAL_MACHINE",
        "HKEY_CLASSES_ROOT",
        "HKEY_CURRENT_USER",
        "HKEY_USERS",
      ],
      correct: 2,
    },
    {
      question:
        "Quel fichier contient la ruche du registre de l'utilisateur courant ?",
      options: ["SYSTEM.DAT", "USER.DAT", "NTUSER.DAT", "REGISTRY.DAT"],
      correct: 2,
    },
    {
      question:
        "Où sont stockés les programmes au démarrage dans le registre ?",
      options: [
        "HKLM\\SYSTEM\\Boot\\Run",
        "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run",
        "HKCU\\SOFTWARE\\Startup",
        "HKLM\\SOFTWARE\\Startup\\Programs",
      ],
      correct: 1,
    },
    {
      question: "Pourquoi le registre utilise-t-il des transactions ?",
      options: [
        "Pour accélérer l'accès au registre",
        "Pour permettre à plusieurs utilisateurs de modifier simultanément",
        "Pour assurer la fiabilité — si un crash se produit pendant l'écriture, le journal permet la récupération",
        "Pour compresser les données du registre",
      ],
      correct: 2,
    },
  ],
};
