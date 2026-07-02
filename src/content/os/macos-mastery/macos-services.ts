export const content = {
  en: `# launchd — The God Process

**launchd is not just an init system. It is PID 1, the service manager, the socket activator, the cron replacement, the inetd replacement, the session manager, and the bootstrap namespace coordinator.** Understanding launchd deeply means understanding how macOS fundamentally differs from Linux.

## Why launchd Exists — The systemd Comparison

\`\`\`
Linux (systemd):
├── systemd (PID 1)
├── systemd-journald (logging)
├── systemd-logind (session management)
├── systemd-networkd (networking)
└── systemd-resolved (DNS)
Many separate processes

macOS (launchd):
└── launchd (PID 1)
    ├── Does ALL of the above
    ├── Plus: XPC broker, Mach port namespace manager
    └── Single monolithic process that survives kernel panics
\`\`\`

**Critical insight**: launchd is designed to be unkillable. Even if the kernel panics, launchd can restart the userspace without rebooting.

## The launchd Bootstrap Namespace

This is the most misunderstood part of launchd:

\`\`\`
macOS has THREE bootstrap namespaces:

1. System domain (root, always running)
   /System/Library/LaunchDaemons/
   /Library/LaunchDaemons/
   └── com.apple.syslogd.plist
   └── com.apple.mDNSResponder.plist
   └── org.postgresql.postgres.plist (Homebrew)

2. User domain (per-user, session-based)
   ~/Library/LaunchAgents/
   /Library/LaunchAgents/
   /System/Library/LaunchAgents/
   └── com.apple.Dock.plist
   └── com.apple.Spotlight.plist

3. Login domain (GUI session, between system and user)
   /Library/LaunchAgents/ (runs before user login)
   └── com.apple.loginwindow.plist

Namespace isolation means:
├── System services cannot see user services
├── User services cannot see other users' services
├── Each user has their own isolated namespace
└── XPC connections cross namespace boundaries via launchd
\`\`\`

\`\`\`bash
# List services in current bootstrap namespace
launchctl list
# PID    Status  Label
# 521    0       com.apple.Dock
# 523    0       com.apple.Finder
# -      0       com.apple.nsurlsessiond (not running, will launch on demand)

# List ALL services across ALL domains (requires root)
sudo launchctl list | wc -l
# ~400 services on a typical Mac

# Print service configuration
launchctl print system/com.apple.syslogd
# Shows: Domain, PID, path, state, properties, endpoints

# Inspect bootstrap namespace
launchctl print gui/501
# 501 = UID (your user's namespace)
# Shows all services in that namespace
\`\`\`

## LaunchDaemons vs LaunchAgents — The Real Difference

\`\`\`
LaunchDaemons:
├── Run as root (even if User key specified)
├── Start at boot (before any user login)
├── No GUI access (DISPLAY not set)
├── Survive logout/login
├── Location: /Library/LaunchDaemons/, /System/Library/LaunchDaemons/
└── Use case: System services, databases, web servers

LaunchAgents:
├── Run as user
├── Start at login
├── Have GUI access (can show windows)
├── Die at logout
├── Location: ~/Library/LaunchAgents/, /Library/LaunchAgents/
└── Use case: User apps, menu bar items, Spotlight indexing

The "Agent" in LaunchAgent means "agent of the user"
The "Daemon" in LaunchDaemon means "system daemon"
\`\`\`

## The plist Format — Deep Dive

Every launchd job is defined by a property list (plist):

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" 
 "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Required: Unique reverse-DNS identifier -->
    <key>Label</key>
    <string>com.example.myservice</string>
    
    <!-- Required: What to execute -->
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/myapp</string>
        <string>--config</string>
        <string>/etc/myapp.conf</string>
    </array>
    
    <!-- When to run -->
    <key>RunAtLoad</key>
    <true/>  <!-- Start immediately when launchd loads this plist -->
    
    <key>KeepAlive</key>
    <dict>
        <!-- Restart if crashes -->
        <key>SuccessfulExit</key>
        <false/>
        
        <!-- Only keep alive if this path exists -->
        <key>PathState</key>
        <dict>
            <key>/var/run/trigger</key>
            <true/>
        </dict>
        
        <!-- Only keep alive if other service is running -->
        <key>OtherJobEnabled</key>
        <dict>
            <key>com.example.database</key>
            <true/>
        </dict>
    </dict>
    
    <!-- On-demand activation (socket activation like systemd) -->
    <key>Sockets</key>
    <dict>
        <key>Listener</key>
        <dict>
            <key>SockServiceName</key>
            <string>8080</string>  <!-- Port number or /etc/services name -->
            <key>SockType</key>
            <string>stream</string>  <!-- TCP -->
            <key>SockFamily</key>
            <string>IPv4</string>
        </dict>
    </dict>
    <!-- launchd listens on port 8080, launches service when connection arrives -->
    
    <!-- File system watching (inotify-like) -->
    <key>WatchPaths</key>
    <array>
        <string>/etc/myapp.conf</string>
    </array>
    <!-- Restart service when this file changes -->
    
    <key>QueueDirectories</key>
    <array>
        <string>/var/spool/myapp</string>
    </array>
    <!-- Launch when files appear in this directory -->
    
    <!-- Scheduling (cron replacement) -->
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>2</integer>
        <key>Minute</key>
        <integer>30</integer>
    </dict>
    <!-- Runs daily at 2:30 AM -->
    
    <!-- Or multiple intervals -->
    <key>StartCalendarInterval</key>
    <array>
        <dict>
            <key>Hour</key>
            <integer>9</integer>
            <key>Minute</key>
            <integer>0</integer>
        </dict>
        <dict>
            <key>Hour</key>
            <integer>17</integer>
            <key>Minute</key>
            <integer>0</integer>
        </dict>
    </array>
    <!-- Runs at 9 AM and 5 PM -->
    
    <!-- Environment -->
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin</string>
        <key>CONFIG_FILE</key>
        <string>/etc/myapp.conf</string>
    </dict>
    
    <!-- Working directory -->
    <key>WorkingDirectory</key>
    <string>/var/myapp</string>
    
    <!-- User/Group (LaunchDaemons only, must be root initially) -->
    <key>UserName</key>
    <string>www</string>
    <key>GroupName</key>
    <string>www</string>
    
    <!-- I/O redirection -->
    <key>StandardOutPath</key>
    <string>/var/log/myapp.log</string>
    <key>StandardErrorPath</key>
    <string>/var/log/myapp.error.log</string>
    
    <!-- Resource limits -->
    <key>SoftResourceLimits</key>
    <dict>
        <key>NumberOfFiles</key>
        <integer>1024</integer>
    </dict>
    <key>HardResourceLimits</key>
    <dict>
        <key>NumberOfFiles</key>
        <integer>2048</integer>
    </dict>
    
    <!-- Process type (affects priority, scheduling) -->
    <key>ProcessType</key>
    <string>Interactive</string>
    <!-- Standard, Adaptive, Interactive, Background -->
    
    <!-- Throttling (prevent rapid restart loops) -->
    <key>ThrottleInterval</key>
    <integer>30</integer>
    <!-- Wait 30 seconds between restarts -->
    
    <!-- Nice level -->
    <key>Nice</key>
    <integer>10</integer>
    
    <!-- Only run on specific macOS versions -->
    <key>LimitLoadToSessionType</key>
    <string>Aqua</string>
    <!-- Aqua, StandardIO, LoginWindow, Background, System -->
</dict>
</plist>
\`\`\`

## Socket Activation — The Killer Feature

launchd can listen on sockets and start your service only when a connection arrives:

\`\`\`
Without socket activation:
├── Service runs 24/7
├── Consumes memory even when idle
└── Must implement connection handling

With socket activation:
├── launchd listens on socket
├── Connection arrives → launchd launches service
├── Service inherits already-accepted socket
├── Service processes request, exits
└── No memory consumption when idle

Example: SSH on macOS
├── sshd not running by default
├── launchd listens on port 22
├── SSH connection → launchd starts sshd
├── sshd inherits socket, handles connection
└── sshd exits when connection closes
\`\`\`

\`\`\`xml
<!-- /System/Library/LaunchDaemons/ssh.plist (simplified) -->
<key>Sockets</key>
<dict>
    <key>Listeners</key>
    <dict>
        <key>SockServiceName</key>
        <string>ssh</string>
        <key>Bonjour</key>
        <array>
            <string>ssh</string>
            <string>sftp-ssh</string>
        </array>
    </dict>
</dict>
\`\`\`

\`\`\`c
// How service receives socket from launchd (C example)
#include <launch.h>

launch_data_t sockets_dict, listening_fd_array;
launch_data_t checkin_response = launch_msg(launch_data_new_string(LAUNCH_KEY_CHECKIN));
sockets_dict = launch_data_dict_lookup(checkin_response, LAUNCH_JOBKEY_SOCKETS);
listening_fd_array = launch_data_dict_lookup(sockets_dict, "Listeners");

int fd = launch_data_get_fd(launch_data_array_get_index(listening_fd_array, 0));
// fd is the listening socket, already bound and listening
// Just call accept(fd, ...) to get connections
\`\`\`

## XPC Services — launchd's Secret Weapon

XPC (Cross-Process Communication) is how macOS apps talk to each other — and launchd is the broker:

\`\`\`
Traditional IPC:
App A                    App B
  │                        │
  └────── socket ──────────┘
Direct connection, fragile

XPC via launchd:
App A                         App B
  │                             │
  ├──→ launchd ←────────────────┤
  │      ↓                      
  │   Validates                 
  │   Brokers                   
  │   Manages lifecycle         
  └──→ XPC Connection ←─────────┘

Benefits:
├── Privilege separation (App B can run as different user)
├── On-demand launching (App B starts only when needed)
├── Crash isolation (App B crash doesn't affect App A)
└── Built-in serialization (no manual protocol design)
\`\`\`

\`\`\`bash
# List XPC services
launchctl list | grep xpc
# com.apple.xpc.activity
# com.apple.xpc.proxy

# XPC service bundles
ls /System/Library/XPCServices/
# com.apple.akd.xpc
# com.apple.appkit.xpc.openAndSavePanelService.xpc
# ...

# User XPC services
ls ~/Library/Application\ Support/*/XPCServices/
\`\`\`

## launchctl — The Control Interface

\`\`\`bash
# Modern launchctl (macOS 10.11+) uses subcommands

# Bootstrap (load) a plist
sudo launchctl bootstrap system /Library/LaunchDaemons/com.example.service.plist
# For user agents:
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.example.agent.plist

# Bootout (unload) a plist
sudo launchctl bootout system/com.example.service
launchctl bootout gui/$(id -u)/com.example.agent

# Enable/disable (persists across reboots)
sudo launchctl enable system/com.example.service
sudo launchctl disable system/com.example.service

# Start/stop (immediate, non-persistent)
sudo launchctl kickstart system/com.example.service
sudo launchctl kill SIGTERM system/com.example.service

# Print service details
launchctl print system/com.example.service
# Output shows:
# - state (running, stopped, waiting)
# - pid
# - path to plist
# - last exit status
# - properties
# - endpoints (XPC, sockets)

# Debugging: run service in foreground (bypasses launchd)
sudo launchctl debug system/com.example.service --stdout --stderr
# Runs service with stdout/stderr to terminal

# Blame: what triggered this service
launchctl print system/com.example.service | grep -A5 "state"
# Shows: RunAtLoad, socket activation, path watching, etc.

# Examine bootstrap namespace
launchctl print gui/$(id -u)
# Shows all services in your user domain

# Legacy commands (still work, but deprecated):
# launchctl load/unload — use bootstrap/bootout
# launchctl start/stop — use kickstart/kill
\`\`\`

## Creating Your Own LaunchDaemon

Real-world example: PostgreSQL service

\`\`\`xml
<!-- /Library/LaunchDaemons/org.postgresql.postgres.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
 "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>org.postgresql.postgres</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/opt/homebrew/bin/postgres</string>
        <string>-D</string>
        <string>/opt/homebrew/var/postgresql@15</string>
    </array>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>
    
    <key>UserName</key>
    <string>postgres</string>
    
    <key>StandardOutPath</key>
    <string>/opt/homebrew/var/log/postgres.log</string>
    
    <key>StandardErrorPath</key>
    <string>/opt/homebrew/var/log/postgres.error.log</string>
    
    <key>WorkingDirectory</key>
    <string>/opt/homebrew/var/postgresql@15</string>
</dict>
</plist>
\`\`\`

\`\`\`bash
# Install the service
sudo cp org.postgresql.postgres.plist /Library/LaunchDaemons/
sudo chown root:wheel /Library/LaunchDaemons/org.postgresql.postgres.plist
sudo chmod 644 /Library/LaunchDaemons/org.postgresql.postgres.plist

# Load it
sudo launchctl bootstrap system /Library/LaunchDaemons/org.postgresql.postgres.plist

# Verify it's running
sudo launchctl list | grep postgres
# 1234   0   org.postgresql.postgres

# Check logs
tail -f /opt/homebrew/var/log/postgres.log

# Stop it
sudo launchctl kill SIGTERM system/org.postgresql.postgres

# Unload it permanently
sudo launchctl bootout system/org.postgresql.postgres
sudo rm /Library/LaunchDaemons/org.postgresql.postgres.plist
\`\`\`

## Debugging launchd Issues

\`\`\`bash
# Service won't start
# 1. Check plist syntax
plutil -lint /Library/LaunchDaemons/com.example.service.plist
# Outputs: OK or syntax error

# 2. Check launchd logs
sudo log show --predicate 'process == "launchd"' --last 1h
# Look for errors related to your service

# 3. Check service-specific logs
sudo log show --predicate 'subsystem == "com.example.service"' --last 1h

# 4. Run service manually (bypass launchd)
sudo launchctl debug system/com.example.service --stdout --stderr
# Runs service in foreground, shows output

# 5. Check permissions
ls -la /Library/LaunchDaemons/com.example.service.plist
# Should be: -rw-r--r--  1 root  wheel

# 6. Check if service is disabled
sudo launchctl print-disabled system
# Shows disabled services

# 7. Get service state
sudo launchctl print system/com.example.service
# Look at "state =" line

# Service crashes immediately
# Check exit code:
sudo launchctl print system/com.example.service | grep "last exit code"
# last exit code = 1 (or whatever)

# Check crash logs
ls -lt ~/Library/Logs/DiagnosticReports/ | head
# or
sudo ls -lt /Library/Logs/DiagnosticReports/ | head

# Service runs but doesn't work
# Check environment:
sudo launchctl print system/com.example.service | grep -A20 "environment"
# PATH might not include /usr/local/bin, etc.

# Check if it's actually running:
ps aux | grep com.example.service
pgrep -fl com.example

# Mysterious failures
# Enable debug logging for launchd:
sudo launchctl log level debug
# Then check system log:
log stream --predicate 'process == "launchd"'
# Reset when done:
sudo launchctl log level default
\`\`\`

## Performance Impact

\`\`\`
launchd overhead:
├── Memory: ~5 MB (PID 1 must be lean)
├── CPU: Nearly zero when idle
└── Context switches: Minimal (epoll/kqueue-based)

Launch time for on-demand service:
├── Socket activation: ~10-50ms
├── Path watching: ~5-20ms
└── Faster than systemd due to simpler architecture

Service count on typical Mac:
├── ~200 system daemons
├── ~100-200 user agents
└── launchd manages all with single process
\`\`\`

## The Login Window Special Case

\`\`\`
Boot sequence:
1. Kernel starts launchd (PID 1)
2. launchd loads system domain (LaunchDaemons)
3. launchd starts loginwindow.app
4. User logs in
5. loginwindow.app tells launchd: "user 501 logged in"
6. launchd creates user bootstrap namespace (gui/501)
7. launchd loads user domain (LaunchAgents)
8. Dock, Finder, etc. start

Logout sequence:
1. User logs out
2. loginwindow.app tells launchd: "user 501 logged out"
3. launchd kills all services in gui/501 namespace
4. launchd destroys gui/501 namespace
5. System domain continues running

Fast user switching:
├── Multiple gui/* namespaces exist simultaneously
├── Only active user's services receive GUI events
└── Background users' agents paused (SIGSTOP)
\`\`\`

## launchd vs systemd — Technical Comparison

| Feature | launchd | systemd |
|---------|---------|---------|
| PID 1 | Single process | systemd + 100+ helpers |
| Socket activation | Yes (since 2005) | Yes (since 2010) |
| File watching | WatchPaths, QueueDirectories | .path units |
| Scheduling | StartCalendarInterval | timer units |
| Namespacing | Bootstrap namespaces | cgroups |
| IPC | XPC (Mach messages) | D-Bus |
| Log management | unified logging (ASL) | journald |
| Dependency resolution | Implicit (socket/path triggers) | Explicit (After=, Requires=) |
| User services | LaunchAgents (separate namespace) | systemd --user |
| Security | Sandbox + TCC | cgroups + capabilities |
| Language | C (libxpc) | C (custom) |
| Philosophy | Event-driven, minimal | Feature-complete, all-in-one |

**Critical difference**: launchd uses event-driven on-demand loading. systemd uses dependency-based ordering. launchd services don't "depend" on each other — they react to events (socket, path, time, other service state).`,

  fr: `# launchd — Le processus divin

**launchd n'est pas seulement un système init. C'est PID 1, le gestionnaire de services, l'activateur de sockets, le remplaçant de cron, le remplaçant d'inetd, le gestionnaire de sessions et le coordinateur d'espace de noms bootstrap.** Comprendre launchd en profondeur signifie comprendre comment macOS diffère fondamentalement de Linux.

## Pourquoi launchd existe — Comparaison avec systemd

\`\`\`
Linux (systemd) :
├── systemd (PID 1)
├── systemd-journald (journalisation)
├── systemd-logind (gestion de session)
├── systemd-networkd (réseau)
└── systemd-resolved (DNS)
Plusieurs processus séparés

macOS (launchd) :
└── launchd (PID 1)
    ├── Fait TOUT ce qui précède
    ├── Plus : courtier XPC, gestionnaire d'espace de noms de ports Mach
    └── Processus monolithique unique qui survit aux kernel panics
\`\`\`

**Point critique** : launchd est conçu pour être indestructible. Même si le noyau panique, launchd peut redémarrer l'espace utilisateur sans redémarrage.

## L'espace de noms bootstrap de launchd

C'est la partie la plus incomprise de launchd :

\`\`\`
macOS a TROIS espaces de noms bootstrap :

1. Domaine système (root, toujours actif)
   /System/Library/LaunchDaemons/
   /Library/LaunchDaemons/

2. Domaine utilisateur (par utilisateur, basé sur la session)
   ~/Library/LaunchAgents/
   /Library/LaunchAgents/
   /System/Library/LaunchAgents/

3. Domaine de connexion (session GUI, entre système et utilisateur)
   /Library/LaunchAgents/ (s'exécute avant la connexion utilisateur)

L'isolation de l'espace de noms signifie :
├── Les services système ne peuvent pas voir les services utilisateur
├── Les services utilisateur ne peuvent pas voir les services d'autres utilisateurs
├── Chaque utilisateur a son propre espace de noms isolé
└── Les connexions XPC traversent les limites d'espace de noms via launchd
\`\`\`

\`\`\`bash
# Lister les services dans l'espace de noms bootstrap actuel
launchctl list

# Lister TOUS les services à travers TOUS les domaines
sudo launchctl list | wc -l

# Afficher la configuration du service
launchctl print system/com.apple.syslogd

# Inspecter l'espace de noms bootstrap
launchctl print gui/501
\`\`\`

## LaunchDaemons vs LaunchAgents — La vraie différence

\`\`\`
LaunchDaemons :
├── S'exécutent en tant que root
├── Démarrent au boot (avant toute connexion utilisateur)
├── Pas d'accès GUI
├── Survivent à la déconnexion/connexion
├── Emplacement : /Library/LaunchDaemons/
└── Cas d'usage : Services système, bases de données, serveurs web

LaunchAgents :
├── S'exécutent en tant qu'utilisateur
├── Démarrent à la connexion
├── Ont accès GUI
├── Meurent à la déconnexion
├── Emplacement : ~/Library/LaunchAgents/
└── Cas d'usage : Apps utilisateur, éléments de barre de menu
\`\`\`

## Le format plist — Plongée profonde

Chaque tâche launchd est définie par une liste de propriétés (plist) :

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" 
 "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <!-- Requis : Identifiant unique DNS inversé -->
    <key>Label</key>
    <string>com.example.monservice</string>
    
    <!-- Requis : Quoi exécuter -->
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/monapp</string>
        <string>--config</string>
        <string>/etc/monapp.conf</string>
    </array>
    
    <!-- Quand exécuter -->
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <dict>
        <key>SuccessfulExit</key>
        <false/>
    </dict>
    
    <!-- Activation sur socket -->
    <key>Sockets</key>
    <dict>
        <key>Listener</key>
        <dict>
            <key>SockServiceName</key>
            <string>8080</string>
            <key>SockType</key>
            <string>stream</string>
        </dict>
    </dict>
    
    <!-- Surveillance du système de fichiers -->
    <key>WatchPaths</key>
    <array>
        <string>/etc/monapp.conf</string>
    </array>
    
    <!-- Planification (remplacement de cron) -->
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>2</integer>
        <key>Minute</key>
        <integer>30</integer>
    </dict>
    
    <!-- Environnement -->
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin</string>
    </dict>
    
    <!-- Redirection I/O -->
    <key>StandardOutPath</key>
    <string>/var/log/monapp.log</string>
    <key>StandardErrorPath</key>
    <string>/var/log/monapp.error.log</string>
</dict>
</plist>
\`\`\`

## Activation sur socket — La fonctionnalité phare

launchd peut écouter sur des sockets et démarrer votre service uniquement quand une connexion arrive :

\`\`\`
Sans activation sur socket :
├── Le service tourne 24/7
├── Consomme de la mémoire même inactif
└── Doit implémenter la gestion des connexions

Avec activation sur socket :
├── launchd écoute sur le socket
├── Connexion arrive → launchd lance le service
├── Le service hérite du socket déjà accepté
├── Le service traite la requête, se termine
└── Pas de consommation mémoire quand inactif
\`\`\`

## Services XPC — L'arme secrète de launchd

XPC (Cross-Process Communication) est comment les apps macOS se parlent — et launchd est le courtier :

\`\`\`
IPC traditionnel :
App A                    App B
  │                        │
  └────── socket ──────────┘
Connexion directe, fragile

XPC via launchd :
App A                         App B
  │                             │
  ├──→ launchd ←────────────────┤
  │      ↓                      
  │   Valide                    
  │   Courtier                  
  │   Gère le cycle de vie      
  └──→ Connexion XPC ←──────────┘

Avantages :
├── Séparation de privilèges
├── Lancement à la demande
├── Isolation des crashs
└── Sérialisation intégrée
\`\`\`

## launchctl — L'interface de contrôle

\`\`\`bash
# launchctl moderne (macOS 10.11+)

# Bootstrap (charger) un plist
sudo launchctl bootstrap system /Library/LaunchDaemons/com.example.service.plist

# Bootout (décharger)
sudo launchctl bootout system/com.example.service

# Activer/désactiver
sudo launchctl enable system/com.example.service
sudo launchctl disable system/com.example.service

# Démarrer/arrêter
sudo launchctl kickstart system/com.example.service
sudo launchctl kill SIGTERM system/com.example.service

# Afficher les détails du service
launchctl print system/com.example.service

# Débogage
sudo launchctl debug system/com.example.service --stdout --stderr
\`\`\`

## Créer votre propre LaunchDaemon

\`\`\`bash
# Installer le service
sudo cp org.postgresql.postgres.plist /Library/LaunchDaemons/
sudo chown root:wheel /Library/LaunchDaemons/org.postgresql.postgres.plist
sudo chmod 644 /Library/LaunchDaemons/org.postgresql.postgres.plist

# Le charger
sudo launchctl bootstrap system /Library/LaunchDaemons/org.postgresql.postgres.plist

# Vérifier qu'il tourne
sudo launchctl list | grep postgres

# Décharger
sudo launchctl bootout system/org.postgresql.postgres
\`\`\`

## Déboguer les problèmes launchd

\`\`\`bash
# Le service ne démarre pas

# 1. Vérifier la syntaxe du plist
plutil -lint /Library/LaunchDaemons/com.example.service.plist

# 2. Vérifier les journaux launchd
sudo log show --predicate 'process == "launchd"' --last 1h

# 3. Exécuter le service manuellement
sudo launchctl debug system/com.example.service --stdout --stderr

# 4. Vérifier les permissions
ls -la /Library/LaunchDaemons/com.example.service.plist

# 5. Obtenir l'état du service
sudo launchctl print system/com.example.service
\`\`\``,
};

export const quiz = {
  en: [
    {
      question:
        "What is the fundamental difference between LaunchDaemons and LaunchAgents?",
      options: [
        "Daemons are faster than Agents",
        "Daemons run as root at boot before login, Agents run as user at login with GUI access",
        "Daemons are for servers, Agents are for clients",
        "Daemons use XML, Agents use JSON",
      ],
      correct: 1,
    },
    {
      question: "What is socket activation in launchd?",
      options: [
        "A way to encrypt network connections",
        "launchd listens on a socket and launches the service only when a connection arrives — saving memory",
        "A method to prioritize network traffic",
        "A security feature that validates socket connections",
      ],
      correct: 1,
    },
    {
      question: "What are the three bootstrap namespaces in launchd?",
      options: [
        "User, Admin, and Root",
        "System domain (root services), User domain (per-user services), and Login domain (GUI session)",
        "Local, Network, and Remote",
        "Hardware, Kernel, and Userspace",
      ],
      correct: 1,
    },
    {
      question: "How does XPC differ from traditional IPC?",
      options: [
        "XPC is faster",
        "XPC uses less memory",
        "XPC is brokered by launchd, providing privilege separation, on-demand launching, and crash isolation",
        "XPC only works on Apple Silicon",
      ],
      correct: 2,
    },
    {
      question: "What does the WatchPaths key in a launchd plist do?",
      options: [
        "Monitors CPU usage",
        "Restarts the service when the specified file or directory changes — like inotify on Linux",
        "Logs file access attempts",
        "Backs up files automatically",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Quelle est la différence fondamentale entre LaunchDaemons et LaunchAgents ?",
      options: [
        "Les Daemons sont plus rapides que les Agents",
        "Les Daemons s'exécutent en tant que root au boot avant la connexion, les Agents s'exécutent en tant qu'utilisateur à la connexion avec accès GUI",
        "Les Daemons sont pour les serveurs, les Agents pour les clients",
        "Les Daemons utilisent XML, les Agents utilisent JSON",
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce que l'activation sur socket dans launchd ?",
      options: [
        "Une façon de chiffrer les connexions réseau",
        "launchd écoute sur un socket et lance le service seulement quand une connexion arrive — économisant la mémoire",
        "Une méthode pour prioriser le trafic réseau",
        "Une fonctionnalité de sécurité qui valide les connexions socket",
      ],
      correct: 1,
    },
    {
      question: "Quels sont les trois espaces de noms bootstrap dans launchd ?",
      options: [
        "Utilisateur, Admin et Root",
        "Domaine système (services root), domaine utilisateur (services par utilisateur) et domaine connexion (session GUI)",
        "Local, Réseau et Distant",
        "Matériel, Noyau et Espace utilisateur",
      ],
      correct: 1,
    },
    {
      question: "En quoi XPC diffère-t-il de l'IPC traditionnel ?",
      options: [
        "XPC est plus rapide",
        "XPC utilise moins de mémoire",
        "XPC est courtisé par launchd, fournissant séparation de privilèges, lancement à la demande et isolation des crashs",
        "XPC fonctionne uniquement sur Apple Silicon",
      ],
      correct: 2,
    },
    {
      question: "Que fait la clé WatchPaths dans un plist launchd ?",
      options: [
        "Surveille l'utilisation du CPU",
        "Redémarre le service quand le fichier ou répertoire spécifié change — comme inotify sur Linux",
        "Journalise les tentatives d'accès aux fichiers",
        "Sauvegarde automatiquement les fichiers",
      ],
      correct: 1,
    },
  ],
};
