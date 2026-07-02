export const content = {
  en: `# Active Directory

Active Directory (AD) is Microsoft's directory service — the backbone of enterprise Windows environments. Understanding AD is essential for any Windows administrator. Even if you work in a small company, understanding AD will make you significantly more valuable.

## What is Active Directory?

Active Directory is a **distributed directory service** that:
- Stores information about network objects (users, computers, printers, groups)
- Authenticates and authorizes users and computers
- Enforces security policies across an entire organization
- Provides a centralized management point for thousands of machines

**Real world scale**: A large enterprise might have 100,000+ users, 50,000+ computers, and thousands of groups — all managed through AD.

## Core Concepts

### Domain
A **domain** is the basic unit of AD. It is a collection of objects (users, computers, groups) that share:
- A common database (stored on Domain Controllers)
- A common security policy
- A common namespace (e.g., company.com)

\`\`\`
company.com (domain)
├── Users: alice@company.com, bob@company.com
├── Computers: LAPTOP001, SERVER01, WORKSTATION042
├── Groups: IT-Admins, HR-Staff, Developers
└── Policies: Password policy, Screen lock policy
\`\`\`

### Domain Controller (DC)
A **Domain Controller** is a server running Active Directory Domain Services (AD DS). It:
- Stores a copy of the AD database (NTDS.dit)
- Authenticates login requests using Kerberos
- Replicates changes to other DCs
- Enforces Group Policy

Every domain needs at least one DC. Production environments always have multiple DCs for redundancy.

### Organizational Units (OUs)
OUs are containers within a domain used to organize objects and apply Group Policy:

\`\`\`
company.com
├── OU=Headquarters
│   ├── OU=IT
│   │   ├── User: alice (IT Admin)
│   │   └── Computer: IT-LAPTOP001
│   ├── OU=HR
│   │   ├── User: bob (HR Manager)
│   │   └── Computer: HR-DESKTOP042
│   └── OU=Finance
│       └── User: carol (Accountant)
└── OU=Branch-Paris
    └── OU=Sales
        └── User: david (Sales Rep)
\`\`\`

### Forest and Trees
- **Forest**: The top-level AD container. Multiple domains that trust each other.
- **Tree**: A hierarchy of domains sharing a contiguous namespace (company.com, eu.company.com, us.company.com)
- **Trust**: A relationship allowing users in one domain to access resources in another

\`\`\`
Forest: company.com
├── Tree: company.com
│   ├── eu.company.com
│   │   ├── fr.eu.company.com
│   │   └── de.eu.company.com
│   └── us.company.com
└── Tree: subsidiary.net (separate trust)
\`\`\`

## Authentication — How Kerberos Works

Active Directory uses **Kerberos** for authentication — not passwords sent over the network.

\`\`\`
1. User types password at login
   ↓
2. Client sends encrypted timestamp to DC (Key Distribution Center)
   ↓
3. DC verifies and issues Ticket Granting Ticket (TGT)
   ↓
4. TGT is stored in memory (valid 10 hours by default)
   ↓
5. User accesses a file server:
   Client sends TGT to DC → DC issues Service Ticket
   ↓
6. Client presents Service Ticket to file server
   File server verifies ticket — NO password transmitted
\`\`\`

**Why Kerberos is secure**: Passwords never cross the network. Tickets are time-limited. Mutual authentication (both client and server verify each other).

## Group Policy

**Group Policy Objects (GPOs)** are collections of settings applied to users and computers in OUs.

\`\`\`
Examples of what GPOs can enforce:
├── Password policy (min length, complexity, expiration)
├── Screen lock after 10 minutes of inactivity
├── Disable USB storage devices
├── Deploy software automatically
├── Configure Windows Firewall rules
├── Map network drives at login
├── Set desktop wallpaper
├── Restrict access to Control Panel
├── Configure Windows Update settings
└── Deploy certificates
\`\`\`

### GPO Processing Order (LSDOU)
GPOs are applied in this order — later GPOs win:
1. **L**ocal — local computer policy
2. **S**ite — site-level GPO
3. **D**omain — domain-level GPO
4. **OU** — OU-level GPO (most specific wins)

\`\`\`powershell
# Check applied GPOs
gpresult /r
gpresult /h C:\\gpo-report.html   # HTML report

# Force GPO update
gpupdate /force

# View GPO in GUI
# Group Policy Management Console (GPMC): gpmc.msc
\`\`\`

## Active Directory Database

The AD database is stored in **NTDS.dit** on Domain Controllers:
\`\`\`
C:\\Windows\\NTDS\\
├── ntds.dit        ← The database (Extensible Storage Engine format)
├── edb.log         ← Transaction log
└── edb.chk         ← Checkpoint file
\`\`\`

**NTDS.dit contains**:
- All user accounts and password hashes
- All computer accounts
- All group memberships
- All GPO links
- Replication metadata

**Security implication**: If an attacker gets NTDS.dit + SYSTEM hive, they can extract all password hashes offline — this is why DC security is paramount.

## Managing Active Directory with PowerShell

\`\`\`powershell
# Install AD module
Import-Module ActiveDirectory

# User management
Get-ADUser alice
Get-ADUser -Filter * | Select-Object Name, SamAccountName, Enabled
Get-ADUser alice -Properties *  # All properties

# Create user
New-ADUser \`
    -Name "Alice Smith" \`
    -SamAccountName "alice.smith" \`
    -UserPrincipalName "alice.smith@company.com" \`
    -Path "OU=IT,OU=Headquarters,DC=company,DC=com" \`
    -AccountPassword (ConvertTo-SecureString "P@ssw0rd!" -AsPlainText -Force) \`
    -Enabled $true \`
    -GivenName "Alice" \`
    -Surname "Smith" \`
    -Department "IT" \`
    -Title "System Administrator"

# Modify user
Set-ADUser alice -Title "Senior System Administrator"
Set-ADUser alice -Department "Infrastructure"
Disable-ADAccount alice
Enable-ADAccount alice
Unlock-ADAccount alice  # After lockout

# Reset password
Set-ADAccountPassword alice -NewPassword (ConvertTo-SecureString "NewP@ss!" -AsPlainText -Force)

# Group management
Get-ADGroup "IT-Admins"
Get-ADGroupMember "IT-Admins"
Add-ADGroupMember "IT-Admins" -Members alice, bob
Remove-ADGroupMember "IT-Admins" -Members alice -Confirm:$false

# Computer management
Get-ADComputer -Filter * | Select-Object Name, OperatingSystem
Get-ADComputer LAPTOP001 -Properties *

# Search
Get-ADUser -Filter { Department -eq "IT" -and Enabled -eq $true }
Get-ADUser -Filter { PasswordExpired -eq $true }
Get-ADUser -Filter { LastLogonDate -lt (Get-Date).AddDays(-90) }
\`\`\`

## Common AD Attack Vectors (Know to Defend)

Understanding how attackers exploit AD helps you defend it:

**Pass the Hash**: Attacker captures NTLM hash and uses it to authenticate without knowing the password.
- Defense: Use Kerberos only, enable Protected Users security group, use credential guard

**Kerberoasting**: Attacker requests service tickets for service accounts, then cracks them offline.
- Defense: Use long random passwords for service accounts, use gMSA (group Managed Service Accounts)

**DCSync**: Attacker with replication rights requests all password hashes from DC.
- Defense: Restrict replication permissions, monitor for unusual replication activity

**Golden Ticket**: Attacker with KRBTGT hash can forge Kerberos tickets.
- Defense: Rotate KRBTGT password twice after compromise, use privileged identity management

\`\`\`powershell
# Detect potentially compromised accounts
# Accounts with no password expiration
Get-ADUser -Filter { PasswordNeverExpires -eq $true -and Enabled -eq $true }

# Accounts not logged in for 90 days
Get-ADUser -Filter { LastLogonDate -lt (Get-Date).AddDays(-90) -and Enabled -eq $true }

# Members of privileged groups
Get-ADGroupMember "Domain Admins"
Get-ADGroupMember "Enterprise Admins"
Get-ADGroupMember "Schema Admins"
\`\`\`

## AD Best Practices

\`\`\`
Tier 0: Domain Controllers, AD infrastructure (highest privilege)
Tier 1: Servers and applications
Tier 2: Workstations and end users

Rules:
- Tier 0 admins ONLY log into Tier 0 systems
- Never use Domain Admin account for daily tasks
- Use separate admin accounts (alice vs alice-admin)
- Enable audit logging on all DCs
- Back up NTDS.dit regularly
- Monitor for privileged group membership changes
\`\`\``,

  fr: `# Active Directory

Active Directory (AD) est le service d'annuaire de Microsoft — l'épine dorsale des environnements Windows d'entreprise. Comprendre AD est essentiel pour tout administrateur Windows. Même si vous travaillez dans une petite entreprise, comprendre AD vous rendra significativement plus précieux.

## Qu'est-ce qu'Active Directory ?

Active Directory est un **service d'annuaire distribué** qui :
- Stocke des informations sur les objets réseau (utilisateurs, ordinateurs, imprimantes, groupes)
- Authentifie et autorise les utilisateurs et ordinateurs
- Applique des politiques de sécurité dans toute une organisation
- Fournit un point de gestion centralisé pour des milliers de machines

**Échelle réelle** : Une grande entreprise peut avoir 100 000+ utilisateurs, 50 000+ ordinateurs et des milliers de groupes — tous gérés via AD.

## Concepts fondamentaux

### Domaine
Un **domaine** est l'unité de base d'AD. C'est une collection d'objets (utilisateurs, ordinateurs, groupes) qui partagent :
- Une base de données commune (stockée sur les contrôleurs de domaine)
- Une politique de sécurité commune
- Un espace de noms commun (ex. : company.com)

\`\`\`
company.com (domaine)
├── Utilisateurs : alice@company.com, bob@company.com
├── Ordinateurs : LAPTOP001, SERVER01, WORKSTATION042
├── Groupes : IT-Admins, RH-Staff, Developpeurs
└── Politiques : Politique de mot de passe, Verrouillage d'écran
\`\`\`

### Contrôleur de domaine (DC)
Un **Contrôleur de domaine** est un serveur exécutant Active Directory Domain Services (AD DS). Il :
- Stocke une copie de la base de données AD (NTDS.dit)
- Authentifie les demandes de connexion via Kerberos
- Réplique les modifications vers d'autres DC
- Applique les stratégies de groupe

Chaque domaine a besoin d'au moins un DC. Les environnements de production ont toujours plusieurs DC pour la redondance.

### Unités organisationnelles (UO)
Les UO sont des conteneurs dans un domaine utilisés pour organiser les objets et appliquer les stratégies de groupe :

\`\`\`
company.com
├── UO=SiegeSocial
│   ├── UO=IT
│   │   ├── Utilisateur : alice (Admin IT)
│   │   └── Ordinateur : IT-LAPTOP001
│   ├── UO=RH
│   │   ├── Utilisateur : bob (Responsable RH)
│   │   └── Ordinateur : RH-DESKTOP042
│   └── UO=Finance
│       └── Utilisateur : carol (Comptable)
└── UO=SuccursaleParis
    └── UO=Ventes
        └── Utilisateur : david (Commercial)
\`\`\`

### Forêt et arbres
- **Forêt** : Le conteneur AD de plus haut niveau. Plusieurs domaines qui se font confiance.
- **Arbre** : Une hiérarchie de domaines partageant un espace de noms contigu (company.com, eu.company.com, us.company.com)
- **Approbation** : Une relation permettant aux utilisateurs d'un domaine d'accéder aux ressources d'un autre

## Authentification — Comment fonctionne Kerberos

Active Directory utilise **Kerberos** pour l'authentification — pas des mots de passe envoyés sur le réseau.

\`\`\`
1. L'utilisateur tape son mot de passe à la connexion
   ↓
2. Le client envoie un horodatage chiffré au DC (Centre de distribution de clés)
   ↓
3. Le DC vérifie et émet un Ticket d'octroi de ticket (TGT)
   ↓
4. Le TGT est stocké en mémoire (valide 10 heures par défaut)
   ↓
5. L'utilisateur accède à un serveur de fichiers :
   Le client envoie le TGT au DC → le DC émet un ticket de service
   ↓
6. Le client présente le ticket de service au serveur de fichiers
   Le serveur vérifie le ticket — AUCUN mot de passe transmis
\`\`\`

**Pourquoi Kerberos est sécurisé** : Les mots de passe ne traversent jamais le réseau. Les tickets sont limités dans le temps. Authentification mutuelle (client et serveur se vérifient mutuellement).

## Stratégie de groupe

Les **Objets de stratégie de groupe (GPO)** sont des collections de paramètres appliqués aux utilisateurs et ordinateurs dans les UO.

\`\`\`
Exemples de ce que les GPO peuvent imposer :
├── Politique de mot de passe (longueur min, complexité, expiration)
├── Verrouillage d'écran après 10 minutes d'inactivité
├── Désactiver les périphériques de stockage USB
├── Déployer des logiciels automatiquement
├── Configurer les règles du pare-feu Windows
├── Mapper les lecteurs réseau à la connexion
├── Définir le fond d'écran du bureau
├── Restreindre l'accès au Panneau de configuration
├── Configurer les paramètres Windows Update
└── Déployer des certificats
\`\`\`

### Ordre de traitement des GPO (LSDOU)
Les GPO sont appliquées dans cet ordre — les dernières l'emportent :
1. **L**ocal — politique de l'ordinateur local
2. **S**ite — GPO au niveau du site
3. **D**omaine — GPO au niveau du domaine
4. **UO** — GPO au niveau de l'UO (la plus spécifique l'emporte)

\`\`\`powershell
# Vérifier les GPO appliquées
gpresult /r
gpresult /h C:\\rapport-gpo.html   # Rapport HTML

# Forcer la mise à jour des GPO
gpupdate /force
\`\`\`

## Base de données Active Directory

La base de données AD est stockée dans **NTDS.dit** sur les contrôleurs de domaine :
\`\`\`
C:\\Windows\\NTDS\\
├── ntds.dit        ← La base de données (format Extensible Storage Engine)
├── edb.log         ← Journal des transactions
└── edb.chk         ← Fichier de point de contrôle
\`\`\`

**NTDS.dit contient** :
- Tous les comptes utilisateurs et hachages de mots de passe
- Tous les comptes d'ordinateurs
- Toutes les appartenances aux groupes
- Tous les liens GPO
- Les métadonnées de réplication

**Implication de sécurité** : Si un attaquant obtient NTDS.dit + la ruche SYSTEM, il peut extraire tous les hachages de mots de passe hors ligne — c'est pourquoi la sécurité du DC est primordiale.

## Gestion d'Active Directory avec PowerShell

\`\`\`powershell
# Installer le module AD
Import-Module ActiveDirectory

# Gestion des utilisateurs
Get-ADUser alice
Get-ADUser -Filter * | Select-Object Name, SamAccountName, Enabled

# Créer un utilisateur
New-ADUser \`
    -Name "Alice Martin" \`
    -SamAccountName "alice.martin" \`
    -UserPrincipalName "alice.martin@company.com" \`
    -Path "OU=IT,OU=SiegeSocial,DC=company,DC=com" \`
    -AccountPassword (ConvertTo-SecureString "P@ssw0rd!" -AsPlainText -Force) \`
    -Enabled $true \`
    -GivenName "Alice" \`
    -Surname "Martin" \`
    -Department "IT" \`
    -Title "Administratrice système"

# Modifier un utilisateur
Set-ADUser alice -Title "Administratrice système senior"
Disable-ADAccount alice
Enable-ADAccount alice
Unlock-ADAccount alice  # Après verrouillage

# Réinitialiser le mot de passe
Set-ADAccountPassword alice -NewPassword (ConvertTo-SecureString "NouveauP@ss!" -AsPlainText -Force)

# Gestion des groupes
Get-ADGroup "IT-Admins"
Get-ADGroupMember "IT-Admins"
Add-ADGroupMember "IT-Admins" -Members alice, bob
Remove-ADGroupMember "IT-Admins" -Members alice -Confirm:$false

# Recherche
Get-ADUser -Filter { Department -eq "IT" -and Enabled -eq $true }
Get-ADUser -Filter { PasswordExpired -eq $true }
Get-ADUser -Filter { LastLogonDate -lt (Get-Date).AddDays(-90) }
\`\`\`

## Vecteurs d'attaque AD courants (Savoir pour défendre)

**Pass the Hash** : L'attaquant capture le hachage NTLM et l'utilise pour s'authentifier sans connaître le mot de passe.
- Défense : Utiliser uniquement Kerberos, activer le groupe de sécurité Utilisateurs protégés, utiliser Credential Guard

**Kerberoasting** : L'attaquant demande des tickets de service pour les comptes de service, puis les casse hors ligne.
- Défense : Utiliser des mots de passe longs et aléatoires pour les comptes de service, utiliser des gMSA

**DCSync** : L'attaquant avec des droits de réplication demande tous les hachages de mots de passe au DC.
- Défense : Restreindre les permissions de réplication, surveiller l'activité de réplication inhabituelle

**Golden Ticket** : L'attaquant avec le hachage KRBTGT peut falsifier des tickets Kerberos.
- Défense : Faire tourner le mot de passe KRBTGT deux fois après compromission

## Meilleures pratiques AD

\`\`\`
Niveau 0 : Contrôleurs de domaine, infrastructure AD (privilège le plus élevé)
Niveau 1 : Serveurs et applications
Niveau 2 : Postes de travail et utilisateurs finaux

Règles :
- Les admins de niveau 0 se connectent UNIQUEMENT aux systèmes de niveau 0
- Ne jamais utiliser le compte Administrateur de domaine pour les tâches quotidiennes
- Utiliser des comptes admin séparés (alice vs alice-admin)
- Activer la journalisation d'audit sur tous les DC
- Sauvegarder NTDS.dit régulièrement
- Surveiller les changements d'appartenance aux groupes privilégiés
\`\`\``,
};

export const quiz = {
  en: [
    {
      question: "What authentication protocol does Active Directory use?",
      options: ["NTLM", "LDAP", "Kerberos", "RADIUS"],
      correct: 2,
    },
    {
      question: "What is a Domain Controller?",
      options: [
        "A workstation that manages user files",
        "A server that stores the AD database and handles authentication",
        "A network switch that controls domain traffic",
        "A firewall that protects the domain",
      ],
      correct: 1,
    },
    {
      question: "What does GPO stand for and what does it do?",
      options: [
        "Global Policy Object — manages internet access",
        "Group Policy Object — applies settings to users and computers in OUs",
        "Group Permission Override — controls file permissions",
        "General Protection Order — enforces security boundaries",
      ],
      correct: 1,
    },
    {
      question: "What file contains the Active Directory database?",
      options: ["active_directory.db", "NTDS.dit", "SAM.hive", "AD.mdb"],
      correct: 1,
    },
    {
      question: "In what order are GPOs applied (LSDOU)?",
      options: [
        "Local, Site, Domain, OU",
        "OU, Domain, Site, Local",
        "Domain, Local, Site, OU",
        "Site, OU, Local, Domain",
      ],
      correct: 0,
    },
  ],
  fr: [
    {
      question:
        "Quel protocole d'authentification Active Directory utilise-t-il ?",
      options: ["NTLM", "LDAP", "Kerberos", "RADIUS"],
      correct: 2,
    },
    {
      question: "Qu'est-ce qu'un contrôleur de domaine ?",
      options: [
        "Un poste de travail qui gère les fichiers utilisateurs",
        "Un serveur qui stocke la base de données AD et gère l'authentification",
        "Un commutateur réseau qui contrôle le trafic du domaine",
        "Un pare-feu qui protège le domaine",
      ],
      correct: 1,
    },
    {
      question: "Que signifie GPO et que fait-il ?",
      options: [
        "Global Policy Object — gère l'accès internet",
        "Group Policy Object — applique des paramètres aux utilisateurs et ordinateurs dans les UO",
        "Group Permission Override — contrôle les permissions des fichiers",
        "General Protection Order — applique les limites de sécurité",
      ],
      correct: 1,
    },
    {
      question: "Quel fichier contient la base de données Active Directory ?",
      options: ["active_directory.db", "NTDS.dit", "SAM.hive", "AD.mdb"],
      correct: 1,
    },
    {
      question: "Dans quel ordre les GPO sont-elles appliquées (LSDOU) ?",
      options: [
        "Local, Site, Domaine, UO",
        "UO, Domaine, Site, Local",
        "Domaine, Local, Site, UO",
        "Site, UO, Local, Domaine",
      ],
      correct: 0,
    },
  ],
};
