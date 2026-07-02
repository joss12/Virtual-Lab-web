export const content = {
  en: `# PowerShell Mastery

PowerShell is not just a command line — it is a complete automation framework built on .NET. Unlike bash which works with text streams, PowerShell works with **.NET objects**. This fundamental difference makes it extraordinarily powerful for Windows administration.

## PowerShell vs CMD vs bash

| Feature | CMD | bash | PowerShell |
|---|---|---|---|
| Data type | Text | Text | .NET Objects |
| Pipeline | Text streams | Text streams | Object streams |
| Error handling | Exit codes | Exit codes | Exceptions |
| OOP support | None | None | Full .NET |
| Remote execution | Limited | SSH | WinRM/SSH |
| Built for | Legacy | Unix/Linux | Windows/.NET |

## The Object Pipeline — PowerShell's Superpower

In bash: \`ps aux | grep nginx | awk '{print $1}'\` — parsing text

In PowerShell:
\`\`\`powershell
Get-Process nginx | Select-Object -ExpandProperty Id
\`\`\`

The output of \`Get-Process\` is not text — it is an array of **Process objects** with properties like \`Name\`, \`Id\`, \`CPU\`, \`WorkingSet\`. You can filter, sort, and manipulate them without parsing text.

\`\`\`powershell
# Get all processes using more than 100MB RAM
Get-Process | Where-Object { $_.WorkingSet -gt 100MB }

# Sort by CPU usage
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10

# Get specific properties
Get-Process | Select-Object Name, Id, CPU, @{N='RAM(MB)';E={[math]::Round($_.WorkingSet/1MB,2)}}
\`\`\`

## Core Cmdlets

PowerShell cmdlets follow a **Verb-Noun** naming convention:

\`\`\`powershell
# Get-* — retrieve information
Get-Process              # Running processes
Get-Service              # Windows services
Get-EventLog -LogName System -Newest 50  # Event log
Get-Content file.txt     # Read file
Get-ChildItem C:\\       # List directory (alias: ls, dir)
Get-Item C:\\file.txt    # File/directory info
Get-Command             # All available commands
Get-Help Get-Process    # Help for a command
Get-Help Get-Process -Examples  # Show examples
Get-Member              # Properties and methods of an object

# Set-* — modify settings
Set-Location C:\\Windows  # Change directory (alias: cd)
Set-Content file.txt "text"  # Write file
Set-Service -Name nginx -Status Running

# New-* — create objects
New-Item -Path C:\\temp\\file.txt -ItemType File
New-Item -Path C:\\temp\\dir -ItemType Directory
New-Service -Name MyService -BinaryPathName C:\\app.exe

# Remove-* — delete objects
Remove-Item C:\\temp\\file.txt
Remove-Item C:\\temp\\dir -Recurse

# Start/Stop-* — control services and processes
Start-Service nginx
Stop-Service nginx
Restart-Service nginx
Start-Process notepad
Stop-Process -Name notepad
\`\`\`

## Variables and Data Types

\`\`\`powershell
# Variables
$name = "Alice"
$age = 30
$pi = 3.14159
$isAdmin = $true

# Strongly typed
[int]$count = 42
[string]$text = "hello"
[bool]$flag = $false
[datetime]$now = Get-Date

# Arrays
$servers = @("web01", "web02", "db01")
$servers[0]              # "web01"
$servers.Count           # 3
$servers += "cache01"    # Add element

# Hash tables (like dictionaries)
$config = @{
    Server = "192.168.1.100"
    Port   = 8080
    SSL    = $true
}
$config.Server           # "192.168.1.100"
$config["Port"]          # 8080
$config.Keys             # Server, Port, SSL

# String interpolation
$greeting = "Hello, $name! You are $age years old."
$path = "C:\\Users\\$env:USERNAME\\Documents"

# Multiline strings
$text = @"
This is line 1
This is line 2
Server: $($config.Server)
"@
\`\`\`

## Control Flow

\`\`\`powershell
# If/ElseIf/Else
$cpu = (Get-Process | Measure-Object CPU -Sum).Sum
if ($cpu -gt 80) {
    Write-Warning "High CPU usage: $cpu%"
} elseif ($cpu -gt 50) {
    Write-Host "Moderate CPU: $cpu%" -ForegroundColor Yellow
} else {
    Write-Host "CPU OK: $cpu%" -ForegroundColor Green
}

# Comparison operators
-eq    # Equal
-ne    # Not equal
-gt    # Greater than
-lt    # Less than
-ge    # Greater than or equal
-le    # Less than or equal
-like  # Wildcard match: "server01" -like "server*"
-match # Regex match: "error123" -match "error\d+"
-in    # In array: "web01" -in $servers
-contains  # Array contains: $servers -contains "web01"

# Foreach
foreach ($server in $servers) {
    Write-Host "Checking $server..."
    Test-Connection -ComputerName $server -Count 1
}

# ForEach-Object (pipeline)
$servers | ForEach-Object {
    Write-Host "Pinging $_..."
    Test-Connection -ComputerName $_ -Count 1
}

# Where-Object (filter)
Get-Service | Where-Object { $_.Status -eq "Running" }
Get-Process | Where-Object { $_.Name -like "chrome*" }

# Switch
switch ($env:COMPUTERNAME) {
    "WEB01"   { Write-Host "Web server" }
    "DB01"    { Write-Host "Database server" }
    default   { Write-Host "Unknown server" }
}
\`\`\`

## Functions and Scripts

\`\`\`powershell
# Function definition
function Get-DiskSpace {
    param(
        [string]$Drive = "C:",
        [switch]$InGB
    )
    
    $disk = Get-PSDrive -Name ($Drive.TrimEnd(':'))
    $free = $disk.Free
    $used = $disk.Used
    $total = $free + $used
    
    if ($InGB) {
        [PSCustomObject]@{
            Drive = $Drive
            TotalGB = [math]::Round($total/1GB, 2)
            UsedGB  = [math]::Round($used/1GB, 2)
            FreeGB  = [math]::Round($free/1GB, 2)
            UsePct  = [math]::Round(($used/$total)*100, 1)
        }
    } else {
        [PSCustomObject]@{
            Drive   = $Drive
            TotalMB = [math]::Round($total/1MB, 2)
            UsedMB  = [math]::Round($used/1MB, 2)
            FreeMB  = [math]::Round($free/1MB, 2)
            UsePct  = [math]::Round(($used/$total)*100, 1)
        }
    }
}

# Usage
Get-DiskSpace -Drive "C:" -InGB
Get-DiskSpace  # Uses defaults

# Script with parameters
# Save as: Check-Servers.ps1
param(
    [string[]]$Servers = @("localhost"),
    [int]$Timeout = 1000
)

foreach ($server in $Servers) {
    $result = Test-Connection -ComputerName $server -Count 1 -Quiet
    $status = if ($result) { "Online" } else { "Offline" }
    [PSCustomObject]@{
        Server = $server
        Status = $status
        Time   = Get-Date
    }
}
\`\`\`

## Error Handling

\`\`\`powershell
# Try/Catch/Finally
try {
    $content = Get-Content "C:\\missing\\file.txt" -ErrorAction Stop
    Write-Host "File content: $content"
}
catch [System.IO.FileNotFoundException] {
    Write-Error "File not found: $_"
}
catch {
    Write-Error "Unexpected error: $_"
}
finally {
    Write-Host "Cleanup complete"
}

# ErrorAction preference
Get-Process -Name "notexist" -ErrorAction SilentlyContinue  # Suppress error
Get-Process -Name "notexist" -ErrorAction Stop              # Throw exception
$ErrorActionPreference = "Stop"  # Global setting
\`\`\`

## Remote Management

\`\`\`powershell
# Enable PowerShell Remoting (run as admin on target)
Enable-PSRemoting -Force

# Connect to remote computer
$session = New-PSSession -ComputerName "server01"
Enter-PSSession -ComputerName "server01"
Exit-PSSession

# Run command on remote computer
Invoke-Command -ComputerName "server01" -ScriptBlock {
    Get-Service | Where-Object { $_.Status -eq "Stopped" }
}

# Run on multiple computers
Invoke-Command -ComputerName "web01","web02","db01" -ScriptBlock {
    Get-Process | Sort-Object CPU -Descending | Select-Object -First 5
}

# Copy files to/from remote
Copy-Item -Path C:\\script.ps1 -Destination C:\\Scripts\\ -ToSession $session
Copy-Item -Path C:\\logs\\app.log -Destination C:\\local\\ -FromSession $session
\`\`\`

## Windows Administration Tasks

\`\`\`powershell
# Services
Get-Service | Where-Object { $_.StartType -eq "Automatic" -and $_.Status -eq "Stopped" }
Set-Service -Name "Spooler" -StartupType Disabled

# Event logs
Get-EventLog -LogName System -EntryType Error -Newest 20
Get-WinEvent -FilterHashtable @{LogName="System"; Level=2; StartTime=(Get-Date).AddHours(-24)}

# Registry
Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion"
Set-ItemProperty "HKCU:\\SOFTWARE\\MyApp" -Name "Theme" -Value "Dark"

# Scheduled tasks
Get-ScheduledTask | Where-Object { $_.State -eq "Running" }
New-ScheduledTask...

# Network
Get-NetAdapter                          # Network interfaces
Get-NetIPAddress                        # IP addresses
Get-NetRoute                            # Routing table
Test-NetConnection -ComputerName google.com -Port 443

# Firewall
Get-NetFirewallRule | Where-Object { $_.Enabled -eq $true }
New-NetFirewallRule -DisplayName "Allow HTTP" -Direction Inbound -Port 80 -Protocol TCP -Action Allow

# Users and groups
Get-LocalUser
New-LocalUser -Name "alice" -Password (ConvertTo-SecureString "P@ssw0rd" -AsPlainText -Force)
Add-LocalGroupMember -Group "Administrators" -Member "alice"
\`\`\`

## PowerShell Profiles

\`\`\`powershell
# Profile locations (from most to least specific)
$PROFILE.AllUsersAllHosts        # All users, all hosts
$PROFILE.AllUsersCurrentHost     # All users, current host
$PROFILE.CurrentUserAllHosts     # Current user, all hosts
$PROFILE.CurrentUserCurrentHost  # Current user, current host (most common)

# Edit your profile
notepad $PROFILE

# Example profile
function prompt { "PS [$env:COMPUTERNAME] $PWD> " }
Set-Alias ll Get-ChildItem
function which($name) { Get-Command $name | Select-Object -ExpandProperty Source }

Import-Module PSReadLine
Set-PSReadLineOption -PredictionSource History
\`\`\``,

  fr: `# Maîtrise de PowerShell

PowerShell n'est pas juste une ligne de commande — c'est un framework d'automatisation complet construit sur .NET. Contrairement à bash qui travaille avec des flux de texte, PowerShell travaille avec des **objets .NET**. Cette différence fondamentale le rend extraordinairement puissant pour l'administration Windows.

## PowerShell vs CMD vs bash

| Fonctionnalité | CMD | bash | PowerShell |
|---|---|---|---|
| Type de données | Texte | Texte | Objets .NET |
| Pipeline | Flux de texte | Flux de texte | Flux d'objets |
| Gestion des erreurs | Codes de sortie | Codes de sortie | Exceptions |
| Support POO | Aucun | Aucun | .NET complet |
| Exécution distante | Limitée | SSH | WinRM/SSH |
| Conçu pour | Héritage | Unix/Linux | Windows/.NET |

## Le pipeline d'objets — La superpuissance de PowerShell

Dans bash : \`ps aux | grep nginx | awk '{print $1}'\` — analyse de texte

Dans PowerShell :
\`\`\`powershell
Get-Process nginx | Select-Object -ExpandProperty Id
\`\`\`

La sortie de \`Get-Process\` n'est pas du texte — c'est un tableau d'**objets Process** avec des propriétés comme \`Name\`, \`Id\`, \`CPU\`, \`WorkingSet\`. Vous pouvez filtrer, trier et manipuler sans analyser du texte.

\`\`\`powershell
# Obtenir tous les processus utilisant plus de 100 Mo de RAM
Get-Process | Where-Object { $_.WorkingSet -gt 100MB }

# Trier par utilisation CPU
Get-Process | Sort-Object CPU -Descending | Select-Object -First 10

# Obtenir des propriétés spécifiques
Get-Process | Select-Object Name, Id, CPU, @{N='RAM(Mo)';E={[math]::Round($_.WorkingSet/1MB,2)}}
\`\`\`

## Cmdlets essentielles

Les cmdlets PowerShell suivent la convention **Verbe-Nom** :

\`\`\`powershell
# Get-* — récupérer des informations
Get-Process              # Processus en cours
Get-Service              # Services Windows
Get-EventLog -LogName System -Newest 50  # Journal d'événements
Get-Content fichier.txt  # Lire un fichier
Get-ChildItem C:\\       # Lister un répertoire (alias : ls, dir)
Get-Item C:\\fichier.txt # Infos fichier/répertoire
Get-Command             # Toutes les commandes disponibles
Get-Help Get-Process    # Aide pour une commande
Get-Help Get-Process -Examples  # Afficher les exemples
Get-Member              # Propriétés et méthodes d'un objet

# Set-* — modifier les paramètres
Set-Location C:\\Windows  # Changer de répertoire (alias : cd)
Set-Content fichier.txt "texte"  # Écrire dans un fichier
Set-Service -Name nginx -Status Running

# New-* — créer des objets
New-Item -Path C:\\temp\\fichier.txt -ItemType File
New-Item -Path C:\\temp\\dir -ItemType Directory
New-Service -Name MonService -BinaryPathName C:\\app.exe

# Remove-* — supprimer des objets
Remove-Item C:\\temp\\fichier.txt
Remove-Item C:\\temp\\dir -Recurse

# Start/Stop-* — contrôler les services et processus
Start-Service nginx
Stop-Service nginx
Restart-Service nginx
Start-Process notepad
Stop-Process -Name notepad
\`\`\`

## Variables et types de données

\`\`\`powershell
# Variables
$nom = "Alice"
$age = 30
$pi = 3.14159
$estAdmin = $true

# Fortement typé
[int]$compteur = 42
[string]$texte = "bonjour"
[bool]$drapeau = $false
[datetime]$maintenant = Get-Date

# Tableaux
$serveurs = @("web01", "web02", "db01")
$serveurs[0]              # "web01"
$serveurs.Count           # 3
$serveurs += "cache01"    # Ajouter un élément

# Tables de hachage (comme des dictionnaires)
$config = @{
    Serveur = "192.168.1.100"
    Port    = 8080
    SSL     = $true
}
$config.Serveur           # "192.168.1.100"
$config["Port"]           # 8080

# Interpolation de chaînes
$salutation = "Bonjour, $nom ! Vous avez $age ans."
$chemin = "C:\\Users\\$env:USERNAME\\Documents"
\`\`\`

## Flux de contrôle

\`\`\`powershell
# If/ElseIf/Else
$cpu = (Get-Process | Measure-Object CPU -Sum).Sum
if ($cpu -gt 80) {
    Write-Warning "Utilisation CPU élevée : $cpu%"
} elseif ($cpu -gt 50) {
    Write-Host "CPU modéré : $cpu%" -ForegroundColor Yellow
} else {
    Write-Host "CPU OK : $cpu%" -ForegroundColor Green
}

# Opérateurs de comparaison
-eq    # Égal
-ne    # Différent
-gt    # Supérieur à
-lt    # Inférieur à
-ge    # Supérieur ou égal
-le    # Inférieur ou égal
-like  # Correspondance joker : "server01" -like "server*"
-match # Correspondance regex : "erreur123" -match "erreur\d+"
-in    # Dans un tableau : "web01" -in $serveurs
-contains  # Le tableau contient : $serveurs -contains "web01"

# Foreach
foreach ($serveur in $serveurs) {
    Write-Host "Vérification de $serveur..."
    Test-Connection -ComputerName $serveur -Count 1
}

# ForEach-Object (pipeline)
$serveurs | ForEach-Object {
    Write-Host "Ping de $_..."
    Test-Connection -ComputerName $_ -Count 1
}

# Where-Object (filtre)
Get-Service | Where-Object { $_.Status -eq "Running" }
Get-Process | Where-Object { $_.Name -like "chrome*" }
\`\`\`

## Fonctions et scripts

\`\`\`powershell
# Définition de fonction
function Get-EspaceDisque {
    param(
        [string]$Lecteur = "C:",
        [switch]$EnGo
    )
    
    $disque = Get-PSDrive -Name ($Lecteur.TrimEnd(':'))
    $libre = $disque.Free
    $utilise = $disque.Used
    $total = $libre + $utilise
    
    if ($EnGo) {
        [PSCustomObject]@{
            Lecteur   = $Lecteur
            TotalGo   = [math]::Round($total/1GB, 2)
            UtiliseGo = [math]::Round($utilise/1GB, 2)
            LibreGo   = [math]::Round($libre/1GB, 2)
            UsagePct  = [math]::Round(($utilise/$total)*100, 1)
        }
    }
}

# Utilisation
Get-EspaceDisque -Lecteur "C:" -EnGo
\`\`\`

## Gestion des erreurs

\`\`\`powershell
# Try/Catch/Finally
try {
    $contenu = Get-Content "C:\\manquant\\fichier.txt" -ErrorAction Stop
    Write-Host "Contenu : $contenu"
}
catch [System.IO.FileNotFoundException] {
    Write-Error "Fichier non trouvé : $_"
}
catch {
    Write-Error "Erreur inattendue : $_"
}
finally {
    Write-Host "Nettoyage terminé"
}

# Préférence ErrorAction
Get-Process -Name "inexistant" -ErrorAction SilentlyContinue  # Supprimer l'erreur
Get-Process -Name "inexistant" -ErrorAction Stop              # Lever une exception
$ErrorActionPreference = "Stop"  # Paramètre global
\`\`\`

## Gestion à distance

\`\`\`powershell
# Activer PowerShell Remoting (en tant qu'admin sur la cible)
Enable-PSRemoting -Force

# Se connecter à un ordinateur distant
$session = New-PSSession -ComputerName "serveur01"
Enter-PSSession -ComputerName "serveur01"
Exit-PSSession

# Exécuter une commande sur un ordinateur distant
Invoke-Command -ComputerName "serveur01" -ScriptBlock {
    Get-Service | Where-Object { $_.Status -eq "Stopped" }
}

# Exécuter sur plusieurs ordinateurs
Invoke-Command -ComputerName "web01","web02","db01" -ScriptBlock {
    Get-Process | Sort-Object CPU -Descending | Select-Object -First 5
}
\`\`\`

## Tâches d'administration Windows

\`\`\`powershell
# Services
Get-Service | Where-Object { $_.StartType -eq "Automatic" -and $_.Status -eq "Stopped" }
Set-Service -Name "Spooler" -StartupType Disabled

# Journaux d'événements
Get-EventLog -LogName System -EntryType Error -Newest 20
Get-WinEvent -FilterHashtable @{LogName="System"; Level=2; StartTime=(Get-Date).AddHours(-24)}

# Registre
Get-ItemProperty "HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion"
Set-ItemProperty "HKCU:\\SOFTWARE\\MonApp" -Name "Theme" -Value "Sombre"

# Réseau
Get-NetAdapter                          # Interfaces réseau
Get-NetIPAddress                        # Adresses IP
Get-NetRoute                            # Table de routage
Test-NetConnection -ComputerName google.com -Port 443

# Pare-feu
Get-NetFirewallRule | Where-Object { $_.Enabled -eq $true }
New-NetFirewallRule -DisplayName "Autoriser HTTP" -Direction Inbound -Port 80 -Protocol TCP -Action Allow

# Utilisateurs et groupes
Get-LocalUser
New-LocalUser -Name "alice" -Password (ConvertTo-SecureString "P@ssw0rd" -AsPlainText -Force)
Add-LocalGroupMember -Group "Administrators" -Member "alice"
\`\`\``,
};

export const quiz = {
  en: [
    {
      question:
        "What is the fundamental difference between PowerShell and bash pipelines?",
      options: [
        "PowerShell is slower than bash",
        "PowerShell pipelines pass .NET objects, bash pipelines pass text streams",
        "bash supports more commands than PowerShell",
        "PowerShell cannot pipe to files",
      ],
      correct: 1,
    },
    {
      question: "What naming convention do PowerShell cmdlets follow?",
      options: [
        "noun-verb (get-process)",
        "Verb-Noun (Get-Process)",
        "VERB_NOUN (GET_PROCESS)",
        "verb.noun (get.process)",
      ],
      correct: 1,
    },
    {
      question: "Which operator filters objects in a PowerShell pipeline?",
      options: [
        "Filter-Object",
        "Select-Object",
        "Where-Object",
        "Find-Object",
      ],
      correct: 2,
    },
    {
      question: "What does Invoke-Command do?",
      options: [
        "Runs a local PowerShell script",
        "Executes a command on one or more remote computers",
        "Invokes a Windows API function",
        "Starts a new PowerShell process",
      ],
      correct: 1,
    },
    {
      question:
        "Which comparison operator checks if a string matches a wildcard pattern?",
      options: ["-match", "-eq", "-like", "-contains"],
      correct: 2,
    },
  ],
  fr: [
    {
      question:
        "Quelle est la différence fondamentale entre les pipelines PowerShell et bash ?",
      options: [
        "PowerShell est plus lent que bash",
        "Les pipelines PowerShell transmettent des objets .NET, les pipelines bash transmettent des flux de texte",
        "bash supporte plus de commandes que PowerShell",
        "PowerShell ne peut pas rediriger vers des fichiers",
      ],
      correct: 1,
    },
    {
      question:
        "Quelle convention de nommage les cmdlets PowerShell suivent-elles ?",
      options: [
        "nom-verbe (get-process)",
        "Verbe-Nom (Get-Process)",
        "VERBE_NOM (GET_PROCESS)",
        "verbe.nom (get.process)",
      ],
      correct: 1,
    },
    {
      question:
        "Quel opérateur filtre les objets dans un pipeline PowerShell ?",
      options: [
        "Filter-Object",
        "Select-Object",
        "Where-Object",
        "Find-Object",
      ],
      correct: 2,
    },
    {
      question: "Que fait Invoke-Command ?",
      options: [
        "Exécute un script PowerShell local",
        "Exécute une commande sur un ou plusieurs ordinateurs distants",
        "Invoque une fonction de l'API Windows",
        "Démarre un nouveau processus PowerShell",
      ],
      correct: 1,
    },
    {
      question:
        "Quel opérateur de comparaison vérifie si une chaîne correspond à un motif joker ?",
      options: ["-match", "-eq", "-like", "-contains"],
      correct: 2,
    },
  ],
};
