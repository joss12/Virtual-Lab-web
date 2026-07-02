export const content = {
  en: `# Windows Security

Windows security is a multi-layered system. Understanding it deeply — not just "turn on Windows Defender" — is what separates administrators from security professionals. This lesson covers the actual mechanisms Windows uses to enforce security.

## The Windows Security Model

Windows security is built on four pillars:

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                  WINDOWS SECURITY MODEL                 │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Identification│  │Authentication│  │Authorization │  │
│  │ Who are you? │  │ Prove it     │  │ What can you │  │
│  │ (username)   │  │ (password/   │  │ do?          │  │
│  │              │  │  cert/MFA)   │  │ (ACLs/tokens)│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │                    Auditing                      │   │
│  │         Track what was done and by whom          │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
\`\`\`

## Access Tokens

When you log in, Windows creates an **Access Token** for your session. This token is attached to every process you start and contains:

\`\`\`
Access Token
├── User SID (Security Identifier)
│   └── S-1-5-21-3623811015-3361044348-30300820-1013
├── Group SIDs
│   ├── S-1-5-32-544 (Administrators)
│   ├── S-1-5-32-545 (Users)
│   └── S-1-1-0 (Everyone)
├── Privileges
│   ├── SeShutdownPrivilege (enabled)
│   ├── SeDebugPrivilege (disabled)
│   └── SeBackupPrivilege (disabled)
├── Integrity Level
│   └── Medium (standard user), High (admin), System
└── Logon session information
\`\`\`

\`\`\`powershell
# View your token
whoami /all
whoami /priv     # Your privileges
whoami /groups   # Your group memberships

# View process token
Get-Process -Name "notepad" | ForEach-Object {
    [System.Diagnostics.Process]::GetCurrentProcess().StartInfo
}
\`\`\`

## Security Identifiers (SIDs)

Every security principal (user, group, computer) has a unique **SID**:

\`\`\`
S-1-5-21-3623811015-3361044348-30300820-1013
│ │ │ └─────────────────────────────────┘ └──┤
│ │ │           Domain Identifier          RID (Relative ID)
│ │ └── NT Authority (5)
│ └── SID revision (1)
└── S prefix

Well-known SIDs:
S-1-1-0          Everyone
S-1-5-18         LocalSystem
S-1-5-19         LocalService
S-1-5-20         NetworkService
S-1-5-32-544     Administrators (local group)
S-1-5-32-545     Users (local group)
S-1-5-domain-500 Administrator account
S-1-5-domain-501 Guest account
S-1-5-domain-512 Domain Admins
S-1-5-domain-513 Domain Users
\`\`\`

\`\`\`powershell
# Get your SID
[System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value

# Get SID for a user
Get-ADUser alice | Select-Object SID

# Translate SID to name
$sid = New-Object System.Security.Principal.SecurityIdentifier("S-1-5-32-544")
$sid.Translate([System.Security.Principal.NTAccount]).Value
\`\`\`

## Access Control Lists (ACLs)

Every securable object (file, registry key, service, process) has a **Security Descriptor** containing:

\`\`\`
Security Descriptor
├── Owner SID
├── Group SID
├── DACL (Discretionary ACL) — who can access
│   ├── ACE: Allow DOMAIN\\alice Read
│   ├── ACE: Allow DOMAIN\\IT-Admins Full Control
│   └── ACE: Deny Everyone Delete
└── SACL (System ACL) — auditing rules
    ├── Audit: DOMAIN\\alice Write (Success+Failure)
    └── Audit: Everyone Delete (Failure)
\`\`\`

\`\`\`powershell
# View file ACL
Get-Acl C:\\sensitive\\data.txt | Format-List

# View registry key ACL
Get-Acl HKLM:\\SOFTWARE\\MyApp | Format-List

# Modify ACL
$acl = Get-Acl C:\\myfile.txt
$rule = New-Object System.Security.AccessControl.FileSystemAccessRule(
    "DOMAIN\\alice",          # Identity
    "Read",                   # Rights
    "Allow"                   # Type
)
$acl.SetAccessRule($rule)
Set-Acl C:\\myfile.txt $acl

# Take ownership
takeown /f C:\\file.txt
icacls C:\\file.txt /grant administrators:F

# icacls examples
icacls C:\\folder /grant alice:(R)          # Read
icacls C:\\folder /grant alice:(M)          # Modify
icacls C:\\folder /grant alice:(F)          # Full control
icacls C:\\folder /grant alice:(OI)(CI)(F)  # Including subdirectories
icacls C:\\folder /remove alice             # Remove permissions
icacls C:\\folder /inheritance:d            # Disable inheritance
\`\`\`

## UAC — User Account Control

UAC is one of the most misunderstood Windows security features. It is NOT just an annoyance — it is a fundamental security boundary.

### How UAC Works

\`\`\`
Standard user logs in
        │
        ▼
Two tokens created:
├── Filtered Token (standard privileges)  ← Used for normal activity
└── Full Token (admin privileges)         ← Only used when elevated
        │
        ▼
User double-clicks program requiring admin rights
        │
        ▼
UAC prompt appears (consent.exe runs on secure desktop)
        │
        ├── User clicks YES → process starts with Full Token
        └── User clicks NO  → process starts with Filtered Token
\`\`\`

### UAC Integrity Levels

Every process has an **Integrity Level**:
\`\`\`
System   (IL = 16384) — SYSTEM account processes
High     (IL = 12288) — Elevated admin processes
Medium   (IL = 8192)  — Standard user processes (default)
Low      (IL = 4096)  — Internet Explorer, sandboxed apps
Untrusted (IL = 0)    — Blocked from almost everything
\`\`\`

Processes cannot write to objects with a higher integrity level. This is why a Medium integrity browser cannot modify High integrity system files — even if the user is an admin.

\`\`\`powershell
# Check process integrity level
Get-Process | ForEach-Object {
    $handle = [System.Diagnostics.Process]::GetProcessById($_.Id)
    $token = [System.Security.Principal.WindowsIdentity]::GetCurrent()
    # Use Sysinternals Process Explorer for easy GUI view
}

# Disable UAC (NOT recommended — understand why first)
Set-ItemProperty -Path "HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System" \`
    -Name "EnableLUA" -Value 0
\`\`\`

## Windows Defender and Security Center

\`\`\`powershell
# Windows Defender status
Get-MpComputerStatus

# Scan
Start-MpScan -ScanType QuickScan
Start-MpScan -ScanType FullScan
Start-MpScan -ScanType CustomScan -ScanPath "C:\\Downloads"

# Update definitions
Update-MpSignature

# Exclusions (use carefully — exclusions are attack vectors)
Add-MpPreference -ExclusionPath "C:\\MyApp"
Get-MpPreference | Select-Object ExclusionPath

# Check for threats
Get-MpThreat
Get-MpThreatDetection
\`\`\`

## Windows Firewall

\`\`\`powershell
# Firewall status
Get-NetFirewallProfile

# Enable/disable
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True

# List rules
Get-NetFirewallRule | Where-Object { $_.Enabled -eq $true -and $_.Direction -eq "Inbound" }

# Create rules
New-NetFirewallRule \`
    -DisplayName "Allow HTTPS Inbound" \`
    -Direction Inbound \`
    -Protocol TCP \`
    -LocalPort 443 \`
    -Action Allow \`
    -Profile Domain,Private

New-NetFirewallRule \`
    -DisplayName "Block Telnet" \`
    -Direction Outbound \`
    -Protocol TCP \`
    -RemotePort 23 \`
    -Action Block

# Remove rule
Remove-NetFirewallRule -DisplayName "Allow HTTPS Inbound"

# Export/Import rules
netsh advfirewall export "C:\\fw-backup.wfw"
netsh advfirewall import "C:\\fw-backup.wfw"
\`\`\`

## Credential Guard and Secure Boot

### Credential Guard
Protects credential hashes by running lsass.exe in a virtualization-based security (VBS) environment — even if the kernel is compromised, credentials cannot be extracted.

\`\`\`powershell
# Check if Credential Guard is enabled
Get-CimInstance -ClassName Win32_DeviceGuard -Namespace root\\Microsoft\\Windows\\DeviceGuard |
    Select-Object SecurityServicesRunning
# 1 = Credential Guard running
# 2 = HVCI running
\`\`\`

### BitLocker
\`\`\`powershell
# Check BitLocker status
Get-BitLockerVolume

# Enable BitLocker
Enable-BitLocker -MountPoint "C:" -EncryptionMethod XtsAes256 \`
    -UsedSpaceOnly \`
    -TpmProtector

# Backup recovery key to AD
Backup-BitLockerKeyProtector -MountPoint "C:" \`
    -KeyProtectorId (Get-BitLockerVolume -MountPoint "C:").KeyProtector[1].KeyProtectorId
\`\`\`

## Security Auditing

\`\`\`powershell
# Enable audit policies
auditpol /set /subcategory:"Logon" /success:enable /failure:enable
auditpol /set /subcategory:"Logoff" /success:enable
auditpol /set /subcategory:"Account Lockout" /failure:enable
auditpol /set /subcategory:"Privilege Use" /success:enable /failure:enable
auditpol /get /category:*

# Query security event log
Get-WinEvent -FilterHashtable @{LogName="Security"; Id=4625} |
    Select-Object TimeCreated, @{N="User";E={$_.Properties[5].Value}} |
    Sort-Object TimeCreated -Descending |
    Select-Object -First 20

# Important Security Event IDs
# 4624 — Successful logon
# 4625 — Failed logon
# 4648 — Logon with explicit credentials
# 4720 — User account created
# 4732 — User added to security group
# 4756 — User added to universal group
# 4768 — Kerberos TGT requested
# 4771 — Kerberos pre-authentication failed
# 4776 — NTLM authentication attempted
# 7045 — New service installed
\`\`\`

## AppLocker and Software Restriction

\`\`\`powershell
# AppLocker — control which applications can run
# Configure via Group Policy or PowerShell

# Get AppLocker policy
Get-AppLockerPolicy -Effective | Test-AppLockerPolicy -Path "C:\\untrusted\\app.exe"

# Create AppLocker rule
$rule = New-AppLockerPolicy -FileInformation (Get-AppLockerFileInformation "C:\\Windows\\System32\\notepad.exe") \`
    -RuleType Publisher, Path, Hash \`
    -User Everyone

# WDAC (Windows Defender Application Control) — stronger than AppLocker
# Applied via Code Integrity policies — cannot be bypassed by local admin
\`\`\``,

  fr: `# Sécurité Windows

La sécurité Windows est un système multicouche. La comprendre profondément — pas juste "activer Windows Defender" — est ce qui sépare les administrateurs des professionnels de la sécurité. Cette leçon couvre les mécanismes réels que Windows utilise pour appliquer la sécurité.

## Le modèle de sécurité Windows

La sécurité Windows repose sur quatre piliers :

\`\`\`
┌─────────────────────────────────────────────────────────┐
│             MODÈLE DE SÉCURITÉ WINDOWS                  │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │Identification│  │Authentification│ │Autorisation  │  │
│  │ Qui êtes-vous│  │ Prouvez-le   │  │ Que pouvez-  │  │
│  │ (nom         │  │ (mot de passe│  │ vous faire ? │  │
│  │ d'utilisateur)│  │  cert/MFA)  │  │ (ACL/jetons) │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │                    Audit                         │   │
│  │     Suivre ce qui a été fait et par qui          │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
\`\`\`

## Jetons d'accès

Quand vous vous connectez, Windows crée un **Jeton d'accès** pour votre session. Ce jeton est attaché à chaque processus que vous démarrez et contient :

\`\`\`
Jeton d'accès
├── SID utilisateur (Identificateur de sécurité)
│   └── S-1-5-21-3623811015-3361044348-30300820-1013
├── SID de groupe
│   ├── S-1-5-32-544 (Administrateurs)
│   ├── S-1-5-32-545 (Utilisateurs)
│   └── S-1-1-0 (Tout le monde)
├── Privilèges
│   ├── SeShutdownPrivilege (activé)
│   ├── SeDebugPrivilege (désactivé)
│   └── SeBackupPrivilege (désactivé)
├── Niveau d'intégrité
│   └── Moyen (utilisateur standard), Élevé (admin), Système
└── Informations de session de connexion
\`\`\`

\`\`\`powershell
# Voir votre jeton
whoami /all
whoami /priv     # Vos privilèges
whoami /groups   # Vos appartenances aux groupes
\`\`\`

## Identificateurs de sécurité (SID)

Chaque principal de sécurité (utilisateur, groupe, ordinateur) a un **SID** unique :

\`\`\`
S-1-5-21-3623811015-3361044348-30300820-1013
│ │ │ └─────────────────────────────────┘ └──┤
│ │ │           Identificateur de domaine   RID (ID relatif)
│ │ └── NT Authority (5)
│ └── Révision SID (1)
└── Préfixe S

SID bien connus :
S-1-1-0          Tout le monde
S-1-5-18         LocalSystem
S-1-5-19         LocalService
S-1-5-20         NetworkService
S-1-5-32-544     Administrateurs (groupe local)
S-1-5-32-545     Utilisateurs (groupe local)
S-1-5-domaine-500 Compte Administrateur
S-1-5-domaine-512 Admins du domaine
\`\`\`

## Listes de contrôle d'accès (ACL)

Chaque objet sécurisable (fichier, clé de registre, service, processus) a un **Descripteur de sécurité** contenant :

\`\`\`
Descripteur de sécurité
├── SID propriétaire
├── SID de groupe
├── DACL (ACL discrétionnaire) — qui peut accéder
│   ├── ACE : Autoriser DOMAINE\\alice Lecture
│   ├── ACE : Autoriser DOMAINE\\IT-Admins Contrôle total
│   └── ACE : Refuser Tout le monde Suppression
└── SACL (ACL système) — règles d'audit
    ├── Audit : DOMAINE\\alice Écriture (Succès+Échec)
    └── Audit : Tout le monde Suppression (Échec)
\`\`\`

\`\`\`powershell
# Voir l'ACL d'un fichier
Get-Acl C:\\sensible\\donnees.txt | Format-List

# Modifier l'ACL
$acl = Get-Acl C:\\monfichier.txt
$regle = New-Object System.Security.AccessControl.FileSystemAccessRule(
    "DOMAINE\\alice",         # Identité
    "Read",                   # Droits
    "Allow"                   # Type
)
$acl.SetAccessRule($regle)
Set-Acl C:\\monfichier.txt $acl

# Exemples icacls
icacls C:\\dossier /grant alice:(R)          # Lecture
icacls C:\\dossier /grant alice:(M)          # Modification
icacls C:\\dossier /grant alice:(F)          # Contrôle total
icacls C:\\dossier /grant alice:(OI)(CI)(F)  # Incluant les sous-répertoires
icacls C:\\dossier /remove alice             # Supprimer les permissions
\`\`\`

## UAC — Contrôle de compte d'utilisateur

L'UAC est l'une des fonctionnalités de sécurité Windows les plus mal comprises. Ce n'est PAS juste une nuisance — c'est une frontière de sécurité fondamentale.

### Comment fonctionne l'UAC

\`\`\`
L'utilisateur standard se connecte
        │
        ▼
Deux jetons créés :
├── Jeton filtré (privilèges standard) ← Utilisé pour l'activité normale
└── Jeton complet (privilèges admin)   ← Utilisé uniquement lors de l'élévation
        │
        ▼
L'utilisateur double-clique sur un programme nécessitant des droits admin
        │
        ▼
Invite UAC apparaît (consent.exe s'exécute sur le bureau sécurisé)
        │
        ├── L'utilisateur clique OUI → processus démarre avec le jeton complet
        └── L'utilisateur clique NON → processus démarre avec le jeton filtré
\`\`\`

### Niveaux d'intégrité UAC

Chaque processus a un **Niveau d'intégrité** :
\`\`\`
Système   (IL = 16384) — Processus du compte SYSTEM
Élevé     (IL = 12288) — Processus admin élevés
Moyen     (IL = 8192)  — Processus utilisateur standard (défaut)
Faible    (IL = 4096)  — Internet Explorer, apps en sandbox
Non fiable (IL = 0)   — Bloqué de presque tout
\`\`\`

Les processus ne peuvent pas écrire dans des objets avec un niveau d'intégrité plus élevé. C'est pourquoi un navigateur à intégrité Moyenne ne peut pas modifier les fichiers système à intégrité Élevée.

## Windows Defender et Centre de sécurité

\`\`\`powershell
# État de Windows Defender
Get-MpComputerStatus

# Analyse
Start-MpScan -ScanType QuickScan
Start-MpScan -ScanType FullScan
Start-MpScan -ScanType CustomScan -ScanPath "C:\\Téléchargements"

# Mettre à jour les définitions
Update-MpSignature

# Exclusions (utiliser avec précaution)
Add-MpPreference -ExclusionPath "C:\\MonApp"
Get-MpPreference | Select-Object ExclusionPath

# Vérifier les menaces
Get-MpThreat
Get-MpThreatDetection
\`\`\`

## Pare-feu Windows

\`\`\`powershell
# État du pare-feu
Get-NetFirewallProfile

# Activer/désactiver
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True

# Lister les règles
Get-NetFirewallRule | Where-Object { $_.Enabled -eq $true -and $_.Direction -eq "Inbound" }

# Créer des règles
New-NetFirewallRule \`
    -DisplayName "Autoriser HTTPS entrant" \`
    -Direction Inbound \`
    -Protocol TCP \`
    -LocalPort 443 \`
    -Action Allow \`
    -Profile Domain,Private

# Supprimer une règle
Remove-NetFirewallRule -DisplayName "Autoriser HTTPS entrant"
\`\`\`

## Audit de sécurité

\`\`\`powershell
# Activer les politiques d'audit
auditpol /set /subcategory:"Logon" /success:enable /failure:enable
auditpol /set /subcategory:"Account Lockout" /failure:enable

# Interroger le journal d'événements de sécurité
Get-WinEvent -FilterHashtable @{LogName="Security"; Id=4625} |
    Select-Object TimeCreated, @{N="Utilisateur";E={$_.Properties[5].Value}} |
    Sort-Object TimeCreated -Descending |
    Select-Object -First 20

# IDs d'événements de sécurité importants
# 4624 — Connexion réussie
# 4625 — Connexion échouée
# 4720 — Compte utilisateur créé
# 4732 — Utilisateur ajouté à un groupe de sécurité
# 4768 — TGT Kerberos demandé
# 7045 — Nouveau service installé
\`\`\`

## BitLocker

\`\`\`powershell
# Vérifier l'état de BitLocker
Get-BitLockerVolume

# Activer BitLocker
Enable-BitLocker -MountPoint "C:" -EncryptionMethod XtsAes256 \`
    -UsedSpaceOnly \`
    -TpmProtector

# Sauvegarder la clé de récupération dans AD
Backup-BitLockerKeyProtector -MountPoint "C:" \`
    -KeyProtectorId (Get-BitLockerVolume -MountPoint "C:").KeyProtector[1].KeyProtectorId
\`\`\``,
};

export const quiz = {
  en: [
    {
      question: "What does an Access Token contain?",
      options: [
        "Only the username and password",
        "User SID, group SIDs, privileges, and integrity level",
        "Only the user's permissions",
        "The user's registry settings",
      ],
      correct: 1,
    },
    {
      question:
        "What integrity level do standard user processes run at by default?",
      options: ["Low", "Medium", "High", "System"],
      correct: 1,
    },
    {
      question: "What is a DACL?",
      options: [
        "Dynamic Access Control List — changes based on time",
        "Discretionary ACL — specifies who can access an object",
        "Domain Access Control Layer — network-level access",
        "Default ACL — applied when no other ACL exists",
      ],
      correct: 1,
    },
    {
      question: "What does Credential Guard protect?",
      options: [
        "Browser saved passwords",
        "BitLocker encryption keys",
        "LSASS credential hashes by running it in a virtualized environment",
        "Windows Defender definitions",
      ],
      correct: 2,
    },
    {
      question: "What Security Event ID indicates a failed logon?",
      options: ["4624", "4625", "4648", "4720"],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Que contient un jeton d'accès ?",
      options: [
        "Uniquement le nom d'utilisateur et le mot de passe",
        "SID utilisateur, SID de groupe, privilèges et niveau d'intégrité",
        "Uniquement les permissions de l'utilisateur",
        "Les paramètres de registre de l'utilisateur",
      ],
      correct: 1,
    },
    {
      question:
        "À quel niveau d'intégrité les processus utilisateur standard s'exécutent-ils par défaut ?",
      options: ["Faible", "Moyen", "Élevé", "Système"],
      correct: 1,
    },
    {
      question: "Qu'est-ce qu'une DACL ?",
      options: [
        "Liste de contrôle d'accès dynamique — change selon le temps",
        "ACL discrétionnaire — spécifie qui peut accéder à un objet",
        "Couche de contrôle d'accès au domaine — accès au niveau réseau",
        "ACL par défaut — appliquée quand aucune autre ACL n'existe",
      ],
      correct: 1,
    },
    {
      question: "Que protège Credential Guard ?",
      options: [
        "Les mots de passe sauvegardés dans le navigateur",
        "Les clés de chiffrement BitLocker",
        "Les hachages de credentials LSASS en l'exécutant dans un environnement virtualisé",
        "Les définitions de Windows Defender",
      ],
      correct: 2,
    },
    {
      question:
        "Quel ID d'événement de sécurité indique une connexion échouée ?",
      options: ["4624", "4625", "4648", "4720"],
      correct: 1,
    },
  ],
};
