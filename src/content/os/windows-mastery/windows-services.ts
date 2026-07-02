export const content = {
  en: `# Windows Services & Task Scheduler

Services and scheduled tasks are the foundation of Windows automation and system management. Understanding them deeply means understanding how Windows keeps itself running — and how to control it.

## What is a Windows Service?

A Windows service is a long-running executable that:
- Runs in the background without user interaction
- Can start automatically at boot before any user logs in
- Runs under a specific security context (user account)
- Is managed by the **Service Control Manager (SCM)** — services.exe

**Key difference from Linux**: Windows services are registered in the registry at \`HKLM\\SYSTEM\\CurrentControlSet\\Services\` and managed by SCM. Linux uses systemd unit files.

## Service Architecture

\`\`\`
Boot
 │
 ▼
services.exe (SCM — Service Control Manager)
 │
 ├── Reads HKLM\\SYSTEM\\CurrentControlSet\\Services\\
 │
 ├── Starts services in dependency order
 │   ├── Service A (no dependencies) → starts first
 │   ├── Service B (depends on A) → starts after A
 │   └── Service C (depends on A, B) → starts last
 │
 └── Monitors services — restarts on failure if configured
\`\`\`

## Service States

\`\`\`
Stopped     → Running      (Start)
Running     → Stopped      (Stop)
Running     → Paused       (Pause) — not all services support this
Paused      → Running      (Resume)
Running     → Stopped      (Restart = Stop + Start)
\`\`\`

## Service Account Types

The security context a service runs under is critical:

| Account | Description | Privilege Level |
|---|---|---|
| LocalSystem | Most powerful built-in account | Extremely high — avoid if possible |
| NetworkService | Limited local, network as computer | Medium |
| LocalService | Minimal local privileges, anonymous network | Low |
| Custom user | Specific AD or local user | Configurable — best practice |
| Virtual Account | Auto-managed, service-specific | Good for isolation |
| gMSA | Group Managed Service Account | Best practice for domain services |

**Security principle**: Always use the least privileged account that allows the service to function.

## Managing Services

### PowerShell (Preferred)
\`\`\`powershell
# List all services
Get-Service

# Filter services
Get-Service | Where-Object { $_.Status -eq "Running" }
Get-Service | Where-Object { $_.StartType -eq "Automatic" -and $_.Status -eq "Stopped" }

# Get specific service with all details
Get-Service -Name "wuauserv" | Select-Object *

# Service operations
Start-Service -Name "nginx"
Stop-Service -Name "nginx"
Restart-Service -Name "nginx"
Suspend-Service -Name "nginx"    # Pause
Resume-Service -Name "nginx"

# Change startup type
Set-Service -Name "nginx" -StartupType Automatic
Set-Service -Name "nginx" -StartupType Manual
Set-Service -Name "nginx" -StartupType Disabled

# Get service dependencies
Get-Service -Name "nginx" -DependentServices   # What depends on nginx
Get-Service -Name "nginx" -RequiredServices    # What nginx depends on

# Create a service
New-Service \`
    -Name "MyAppService" \`
    -DisplayName "My Application Service" \`
    -Description "Runs my application in the background" \`
    -BinaryPathName "C:\\MyApp\\myapp.exe --service" \`
    -StartupType Automatic \`
    -Credential (Get-Credential)

# Delete a service
Remove-Service -Name "MyAppService"     # PowerShell 6+
sc.exe delete MyAppService              # Works on all versions
\`\`\`

### sc.exe (Service Control)
\`\`\`cmd
:: Query service status
sc query nginx
sc query type= all state= all    :: All services

:: Service operations
sc start nginx
sc stop nginx

:: Configuration
sc config nginx start= auto      :: Auto start
sc config nginx start= demand    :: Manual start
sc config nginx start= disabled  :: Disabled

:: Failure recovery
sc failure nginx reset= 86400 actions= restart/60000/restart/60000/restart/60000
:: Reset failure count after 86400 seconds (1 day)
:: On 1st failure: restart after 60 seconds
:: On 2nd failure: restart after 60 seconds
:: On 3rd failure: restart after 60 seconds
\`\`\`

### services.msc (GUI)
\`\`\`
Win+R → services.msc
\`\`\`

## Service Recovery Options

Windows can automatically recover from service failures:

\`\`\`powershell
# Configure failure actions via registry
$serviceName = "MyAppService"
$recoveryPath = "HKLM:\\SYSTEM\\CurrentControlSet\\Services\\$serviceName"

# Or use sc.exe failure command
sc.exe failure MyAppService reset= 86400 actions= restart/30000/restart/60000/run/0
# 1st failure: restart after 30 seconds
# 2nd failure: restart after 60 seconds
# 3rd failure: run a program

# Check failure configuration
sc.exe qfailure MyAppService
\`\`\`

## Registry Structure for Services

\`\`\`
HKLM\\SYSTEM\\CurrentControlSet\\Services\\nginx\\
├── ImagePath    = "C:\\nginx\\nginx.exe"    (executable path)
├── DisplayName  = "nginx"
├── Description  = "High performance web server"
├── Start        = 2    (2=Auto, 3=Manual, 4=Disabled)
├── Type         = 16   (16=Own process, 32=Share process)
├── ObjectName   = "LocalSystem"    (service account)
├── ErrorControl = 1    (1=Normal, 2=Severe, 3=Critical)
└── DependOnService = "tcpip"
\`\`\`

**Start values:**
- 0 = Boot (loaded by bootloader)
- 1 = System (loaded by kernel during init)
- 2 = Automatic
- 3 = Manual (demand start)
- 4 = Disabled

## Task Scheduler

Task Scheduler runs programs on a schedule or in response to events — much more powerful than simple cron.

### Task Components
\`\`\`
Task
├── Triggers (WHEN to run)
│   ├── Schedule (daily, weekly, monthly, one time)
│   ├── At logon
│   ├── At startup
│   ├── On event (Event Log trigger)
│   ├── On idle
│   └── On workstation lock/unlock
│
├── Actions (WHAT to run)
│   ├── Start a program
│   ├── Send an email (deprecated)
│   └── Display a message (deprecated)
│
└── Conditions (additional requirements)
    ├── Only if AC power
    ├── Only if network available
    ├── Only if idle for X minutes
    └── Wake computer to run task
\`\`\`

### Managing Tasks with PowerShell
\`\`\`powershell
# List all tasks
Get-ScheduledTask

# Filter tasks
Get-ScheduledTask | Where-Object { $_.State -eq "Ready" }
Get-ScheduledTask -TaskPath "\\Microsoft\\Windows\\WindowsUpdate\\"

# Get task details
Get-ScheduledTask -TaskName "WindowsDefenderCacheMaintenanceTask" | Get-ScheduledTaskInfo

# Run a task immediately
Start-ScheduledTask -TaskName "MyTask"

# Enable/Disable task
Enable-ScheduledTask -TaskName "MyTask"
Disable-ScheduledTask -TaskName "MyTask"

# Create a simple scheduled task
$action = New-ScheduledTaskAction \`
    -Execute "PowerShell.exe" \`
    -Argument "-NonInteractive -File C:\\Scripts\\cleanup.ps1"

$trigger = New-ScheduledTaskTrigger \`
    -Daily \`
    -At "3:00AM"

$settings = New-ScheduledTaskSettingsSet \`
    -ExecutionTimeLimit (New-TimeSpan -Hours 1) \`
    -RestartCount 3 \`
    -RestartInterval (New-TimeSpan -Minutes 5)

$principal = New-ScheduledTaskPrincipal \`
    -UserId "SYSTEM" \`
    -RunLevel Highest

Register-ScheduledTask \`
    -TaskName "DailyCleanup" \`
    -TaskPath "\\MyCompany\\" \`
    -Action $action \`
    -Trigger $trigger \`
    -Settings $settings \`
    -Principal $principal \`
    -Description "Daily system cleanup"

# Create event-triggered task
$trigger = New-ScheduledTaskTrigger \`
    -AtStartup

# Event log trigger (run when specific event occurs)
$trigger = New-CimInstance \`
    -CimClass (Get-CimClass -ClassName MSFT_TaskEventTrigger -Namespace Root/Microsoft/Windows/TaskScheduler) \`
    -Property @{
        Enabled   = $true
        Subscription = '<QueryList><Query Id="0" Path="System"><Select Path="System">*[System[Provider[@Name="Microsoft-Windows-Security-Auditing"] and EventID=4625]]</Select></Query></QueryList>'
    } -ClientOnly

# Delete a task
Unregister-ScheduledTask -TaskName "DailyCleanup" -Confirm:$false
\`\`\`

### Task Scheduler via schtasks.exe
\`\`\`cmd
:: List all tasks
schtasks /query /fo LIST /v

:: Create task
schtasks /create /tn "MyTask" /tr "C:\\script.bat" /sc daily /st 03:00

:: Run task
schtasks /run /tn "MyTask"

:: Delete task
schtasks /delete /tn "MyTask" /f
\`\`\`

## Important Built-in Services

\`\`\`
Service Name        Display Name                    Purpose
─────────────────────────────────────────────────────────────
wuauserv           Windows Update                  Updates
WinDefend          Windows Defender                Antivirus
EventLog           Windows Event Log               System logging
Dnscache           DNS Client                      DNS caching
LanmanServer       Server                          File sharing
LanmanWorkstation  Workstation                     Network file access
RpcSs              Remote Procedure Call           Foundation for many services
Schedule           Task Scheduler                  Scheduled tasks
BITS               Background Intelligent Transfer Background downloads
SamSs              Security Accounts Manager       Local user accounts
Netlogon           Net Logon                       Domain authentication
w32tm              Windows Time                    Time synchronization
\`\`\`

## Security Considerations

\`\`\`powershell
# Find services running as LocalSystem (often overprivileged)
Get-WmiObject Win32_Service |
    Where-Object { $_.StartName -eq "LocalSystem" } |
    Select-Object Name, DisplayName, StartName

# Find services with unquoted paths (common vulnerability)
Get-WmiObject Win32_Service |
    Where-Object { $_.PathName -notlike '"*' -and $_.PathName -like '* *' } |
    Select-Object Name, PathName

# Check service binary permissions (can non-admins modify?)
Get-WmiObject Win32_Service |
    ForEach-Object {
        $path = ($_.PathName -split '"')[1]
        if ($path) { Get-Acl $path }
    }
\`\`\``,

  fr: `# Services Windows et Planificateur de tâches

Les services et les tâches planifiées sont le fondement de l'automatisation et de la gestion système Windows. Les comprendre profondément signifie comprendre comment Windows se maintient en fonctionnement — et comment le contrôler.

## Qu'est-ce qu'un service Windows ?

Un service Windows est un exécutable à longue durée qui :
- S'exécute en arrière-plan sans interaction utilisateur
- Peut démarrer automatiquement au boot avant qu'un utilisateur se connecte
- S'exécute sous un contexte de sécurité spécifique (compte utilisateur)
- Est géré par le **Gestionnaire de contrôle des services (SCM)** — services.exe

**Différence clé avec Linux** : Les services Windows sont enregistrés dans le registre à \`HKLM\\SYSTEM\\CurrentControlSet\\Services\` et gérés par SCM. Linux utilise les fichiers d'unité systemd.

## Architecture des services

\`\`\`
Démarrage
 │
 ▼
services.exe (SCM — Gestionnaire de contrôle des services)
 │
 ├── Lit HKLM\\SYSTEM\\CurrentControlSet\\Services\\
 │
 ├── Démarre les services dans l'ordre de dépendance
 │   ├── Service A (pas de dépendances) → démarre en premier
 │   ├── Service B (dépend de A) → démarre après A
 │   └── Service C (dépend de A, B) → démarre en dernier
 │
 └── Surveille les services — redémarre en cas d'échec si configuré
\`\`\`

## États des services

\`\`\`
Arrêté     → En cours      (Démarrer)
En cours   → Arrêté        (Arrêter)
En cours   → En pause      (Suspendre) — tous les services ne supportent pas ça
En pause   → En cours      (Reprendre)
En cours   → Arrêté        (Redémarrer = Arrêter + Démarrer)
\`\`\`

## Types de comptes de service

Le contexte de sécurité sous lequel un service s'exécute est critique :

| Compte | Description | Niveau de privilège |
|---|---|---|
| LocalSystem | Compte intégré le plus puissant | Extrêmement élevé — à éviter si possible |
| NetworkService | Local limité, réseau comme ordinateur | Moyen |
| LocalService | Privilèges locaux minimaux, réseau anonyme | Faible |
| Utilisateur personnalisé | Utilisateur AD ou local spécifique | Configurable — meilleure pratique |
| Compte virtuel | Géré automatiquement, spécifique au service | Bon pour l'isolation |
| gMSA | Compte de service géré par groupe | Meilleure pratique pour les services de domaine |

**Principe de sécurité** : Toujours utiliser le compte le moins privilégié qui permet au service de fonctionner.

## Gestion des services

### PowerShell (Préféré)
\`\`\`powershell
# Lister tous les services
Get-Service

# Filtrer les services
Get-Service | Where-Object { $_.Status -eq "Running" }
Get-Service | Where-Object { $_.StartType -eq "Automatic" -and $_.Status -eq "Stopped" }

# Obtenir un service spécifique avec tous les détails
Get-Service -Name "wuauserv" | Select-Object *

# Opérations sur les services
Start-Service -Name "nginx"
Stop-Service -Name "nginx"
Restart-Service -Name "nginx"

# Changer le type de démarrage
Set-Service -Name "nginx" -StartupType Automatic
Set-Service -Name "nginx" -StartupType Manual
Set-Service -Name "nginx" -StartupType Disabled

# Obtenir les dépendances du service
Get-Service -Name "nginx" -DependentServices   # Ce qui dépend de nginx
Get-Service -Name "nginx" -RequiredServices    # Ce dont nginx dépend

# Créer un service
New-Service \`
    -Name "MonServiceApp" \`
    -DisplayName "Mon service application" \`
    -Description "Exécute mon application en arrière-plan" \`
    -BinaryPathName "C:\\MonApp\\monapp.exe --service" \`
    -StartupType Automatic \`
    -Credential (Get-Credential)

# Supprimer un service
Remove-Service -Name "MonServiceApp"     # PowerShell 6+
sc.exe delete MonServiceApp              # Fonctionne sur toutes les versions
\`\`\`

### sc.exe (Contrôle des services)
\`\`\`cmd
:: Interroger l'état du service
sc query nginx

:: Opérations sur les services
sc start nginx
sc stop nginx

:: Configuration
sc config nginx start= auto      :: Démarrage automatique
sc config nginx start= demand    :: Démarrage manuel
sc config nginx start= disabled  :: Désactivé

:: Récupération en cas d'échec
sc failure nginx reset= 86400 actions= restart/60000/restart/60000/restart/60000
:: Réinitialiser le compteur après 86400 secondes (1 jour)
:: 1er échec : redémarrer après 60 secondes
:: 2ème échec : redémarrer après 60 secondes
:: 3ème échec : redémarrer après 60 secondes
\`\`\`

## Structure du registre pour les services

\`\`\`
HKLM\\SYSTEM\\CurrentControlSet\\Services\\nginx\\
├── ImagePath    = "C:\\nginx\\nginx.exe"    (chemin de l'exécutable)
├── DisplayName  = "nginx"
├── Description  = "Serveur web haute performance"
├── Start        = 2    (2=Auto, 3=Manuel, 4=Désactivé)
├── Type         = 16   (16=Processus propre, 32=Processus partagé)
├── ObjectName   = "LocalSystem"    (compte de service)
├── ErrorControl = 1    (1=Normal, 2=Grave, 3=Critique)
└── DependOnService = "tcpip"
\`\`\`

## Planificateur de tâches

Le Planificateur de tâches exécute des programmes selon un calendrier ou en réponse à des événements — bien plus puissant que le simple cron.

### Composants d'une tâche
\`\`\`
Tâche
├── Déclencheurs (QUAND exécuter)
│   ├── Planification (quotidien, hebdomadaire, mensuel, une fois)
│   ├── À la connexion
│   ├── Au démarrage
│   ├── Sur événement (déclencheur Journal d'événements)
│   ├── En cas d'inactivité
│   └── Au verrouillage/déverrouillage du poste
│
├── Actions (QUOI exécuter)
│   ├── Démarrer un programme
│   ├── Envoyer un e-mail (obsolète)
│   └── Afficher un message (obsolète)
│
└── Conditions (exigences supplémentaires)
    ├── Uniquement sur secteur
    ├── Uniquement si réseau disponible
    ├── Uniquement si inactif depuis X minutes
    └── Réveiller l'ordinateur pour exécuter la tâche
\`\`\`

### Gestion des tâches avec PowerShell
\`\`\`powershell
# Lister toutes les tâches
Get-ScheduledTask

# Filtrer les tâches
Get-ScheduledTask | Where-Object { $_.State -eq "Ready" }

# Exécuter une tâche immédiatement
Start-ScheduledTask -TaskName "MaTâche"

# Activer/Désactiver une tâche
Enable-ScheduledTask -TaskName "MaTâche"
Disable-ScheduledTask -TaskName "MaTâche"

# Créer une tâche planifiée simple
$action = New-ScheduledTaskAction \`
    -Execute "PowerShell.exe" \`
    -Argument "-NonInteractive -File C:\\Scripts\\nettoyage.ps1"

$trigger = New-ScheduledTaskTrigger \`
    -Daily \`
    -At "3:00AM"

$settings = New-ScheduledTaskSettingsSet \`
    -ExecutionTimeLimit (New-TimeSpan -Hours 1) \`
    -RestartCount 3 \`
    -RestartInterval (New-TimeSpan -Minutes 5)

$principal = New-ScheduledTaskPrincipal \`
    -UserId "SYSTEM" \`
    -RunLevel Highest

Register-ScheduledTask \`
    -TaskName "NettoyageQuotidien" \`
    -TaskPath "\\MaSociete\\" \`
    -Action $action \`
    -Trigger $trigger \`
    -Settings $settings \`
    -Principal $principal \`
    -Description "Nettoyage système quotidien"

# Supprimer une tâche
Unregister-ScheduledTask -TaskName "NettoyageQuotidien" -Confirm:$false
\`\`\`

## Considérations de sécurité

\`\`\`powershell
# Trouver les services s'exécutant en tant que LocalSystem (souvent surprivilégiés)
Get-WmiObject Win32_Service |
    Where-Object { $_.StartName -eq "LocalSystem" } |
    Select-Object Name, DisplayName, StartName

# Trouver les services avec des chemins non entre guillemets (vulnérabilité courante)
Get-WmiObject Win32_Service |
    Where-Object { $_.PathName -notlike '"*' -and $_.PathName -like '* *' } |
    Select-Object Name, PathName
\`\`\``,
};

export const quiz = {
  en: [
    {
      question: "What manages Windows services?",
      options: [
        "winlogon.exe",
        "The Service Control Manager (services.exe)",
        "The Task Scheduler",
        "The Registry Editor",
      ],
      correct: 1,
    },
    {
      question:
        "Which service account has the least privilege for a local service?",
      options: [
        "LocalSystem",
        "NetworkService",
        "LocalService",
        "Administrator",
      ],
      correct: 2,
    },
    {
      question: "What registry key stores Windows service configuration?",
      options: [
        "HKLM\\SOFTWARE\\Services",
        "HKCU\\SYSTEM\\Services",
        "HKLM\\SYSTEM\\CurrentControlSet\\Services",
        "HKLM\\SYSTEM\\Services\\Config",
      ],
      correct: 2,
    },
    {
      question:
        "What does a Start value of 4 mean in a service registry entry?",
      options: ["Automatic start", "Manual start", "Boot start", "Disabled"],
      correct: 3,
    },
    {
      question: "Which PowerShell cmdlet creates a new scheduled task?",
      options: [
        "New-ScheduledTask",
        "Register-ScheduledTask",
        "Add-ScheduledTask",
        "Create-ScheduledTask",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Qui gère les services Windows ?",
      options: [
        "winlogon.exe",
        "Le Gestionnaire de contrôle des services (services.exe)",
        "Le Planificateur de tâches",
        "L'Éditeur du registre",
      ],
      correct: 1,
    },
    {
      question:
        "Quel compte de service a le moins de privilèges pour un service local ?",
      options: [
        "LocalSystem",
        "NetworkService",
        "LocalService",
        "Administrateur",
      ],
      correct: 2,
    },
    {
      question:
        "Quelle clé de registre stocke la configuration des services Windows ?",
      options: [
        "HKLM\\SOFTWARE\\Services",
        "HKCU\\SYSTEM\\Services",
        "HKLM\\SYSTEM\\CurrentControlSet\\Services",
        "HKLM\\SYSTEM\\Services\\Config",
      ],
      correct: 2,
    },
    {
      question:
        "Que signifie une valeur Start de 4 dans une entrée de registre de service ?",
      options: [
        "Démarrage automatique",
        "Démarrage manuel",
        "Démarrage au boot",
        "Désactivé",
      ],
      correct: 3,
    },
    {
      question: "Quelle cmdlet PowerShell crée une nouvelle tâche planifiée ?",
      options: [
        "New-ScheduledTask",
        "Register-ScheduledTask",
        "Add-ScheduledTask",
        "Create-ScheduledTask",
      ],
      correct: 1,
    },
  ],
};
