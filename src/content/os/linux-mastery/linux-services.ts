export const content = {
  en: `# Processes & Services

Understanding how to manage processes and services is essential for Linux administration. systemd is the modern init system used by most Linux distributions.

## systemd Overview

systemd is PID 1 — the first process started by the kernel. It manages:
- System services (nginx, mysql, ssh)
- System startup and shutdown
- Logging (journald)
- Timers (cron replacement)
- Mount points
- Network configuration

## systemctl — Service Management

\`\`\`bash
# Service control
sudo systemctl start nginx      # Start service
sudo systemctl stop nginx       # Stop service
sudo systemctl restart nginx    # Restart service
sudo systemctl reload nginx     # Reload config without restart
sudo systemctl status nginx     # Check service status

# Enable/disable at boot
sudo systemctl enable nginx     # Start on boot
sudo systemctl disable nginx    # Don't start on boot
sudo systemctl enable --now nginx  # Enable and start immediately

# List services
systemctl list-units --type=service         # Active services
systemctl list-units --type=service --all   # All services
systemctl list-unit-files                   # All unit files

# System state
sudo systemctl poweroff         # Shutdown
sudo systemctl reboot           # Reboot
sudo systemctl suspend          # Suspend
systemctl is-active nginx       # Check if active
systemctl is-enabled nginx      # Check if enabled
\`\`\`

## Service Status

\`\`\`bash
systemctl status nginx

# Output explained:
# ● nginx.service - A high performance web server
#    Loaded: loaded (/lib/systemd/system/nginx.service; enabled)
#    Active: active (running) since Mon 2024-01-01 10:00:00 UTC
#   Process: 1234 ExecStartPre=/usr/sbin/nginx -t
#  Main PID: 1235 (nginx)
#    CGroup: /system.slice/nginx.service
#            ├─1235 nginx: master process
#            └─1236 nginx: worker process
\`\`\`

## journalctl — Log Management

\`\`\`bash
journalctl                          # All logs
journalctl -f                       # Follow logs in real time
journalctl -u nginx                 # Logs for nginx service
journalctl -u nginx -f              # Follow nginx logs
journalctl -u nginx --since today   # Today's nginx logs
journalctl -u nginx -n 100          # Last 100 lines
journalctl --since "2024-01-01"     # Since date
journalctl --since "1 hour ago"     # Since 1 hour ago
journalctl -p err                   # Only errors
journalctl -p err..warning          # Errors and warnings
journalctl -b                       # Current boot only
journalctl -b -1                    # Previous boot
journalctl --disk-usage             # Log disk usage
sudo journalctl --vacuum-size=500M  # Trim logs to 500MB
\`\`\`

## Creating a Service Unit

\`\`\`bash
# Create a service file
sudo nano /etc/systemd/system/myapp.service
\`\`\`

\`\`\`ini
[Unit]
Description=My Application
After=network.target
Requires=postgresql.service

[Service]
Type=simple
User=myapp
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/bin/server
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
\`\`\`

\`\`\`bash
sudo systemctl daemon-reload        # Reload systemd config
sudo systemctl enable --now myapp  # Enable and start
\`\`\`

## Timers (Cron Replacement)

\`\`\`bash
# Create a timer
sudo nano /etc/systemd/system/backup.timer
\`\`\`

\`\`\`ini
[Unit]
Description=Daily backup timer

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
\`\`\`

\`\`\`bash
systemctl list-timers               # List all timers
sudo systemctl enable --now backup.timer
\`\`\`

## Process Management

\`\`\`bash
# View processes
ps aux                              # All processes
ps aux --sort=-%cpu | head          # Top CPU users
ps aux --sort=-%mem | head          # Top memory users
pstree                              # Process tree
top                                 # Interactive viewer
htop                                # Better interactive viewer

# Process signals
kill -l                             # List all signals
kill PID                            # SIGTERM — graceful stop
kill -9 PID                         # SIGKILL — force kill
kill -HUP PID                       # SIGHUP — reload config
kill -STOP PID                      # Pause process
kill -CONT PID                      # Resume process
killall nginx                       # Kill by name
pkill -f "python script.py"        # Kill by pattern

# Priority (nice values: -20 highest to 19 lowest)
nice -n 10 command                  # Start with low priority
renice 10 -p PID                    # Change priority of running process
\`\`\`

## Resource Monitoring

\`\`\`bash
free -h                 # Memory usage
vmstat 1                # System stats every second
iostat 1                # Disk I/O stats
sar -u 1 10             # CPU usage 10 times every second
lsof                    # List open files
lsof -i :80             # What is using port 80
netstat -tulpn          # Open ports and listening services
ss -tulpn               # Modern replacement for netstat
\`\`\``,

  fr: `# Processus et services

Comprendre comment gérer les processus et les services est essentiel pour l'administration Linux. systemd est le système init moderne utilisé par la plupart des distributions Linux.

## Vue d'ensemble de systemd

systemd est PID 1 — le premier processus démarré par le noyau. Il gère :
- Les services système (nginx, mysql, ssh)
- Le démarrage et l'arrêt du système
- Les journaux (journald)
- Les minuteries (remplacement de cron)
- Les points de montage
- La configuration réseau

## systemctl — Gestion des services

\`\`\`bash
# Contrôle des services
sudo systemctl start nginx      # Démarrer le service
sudo systemctl stop nginx       # Arrêter le service
sudo systemctl restart nginx    # Redémarrer le service
sudo systemctl reload nginx     # Recharger la config sans redémarrer
sudo systemctl status nginx     # Vérifier l'état du service

# Activer/désactiver au démarrage
sudo systemctl enable nginx     # Démarrer au boot
sudo systemctl disable nginx    # Ne pas démarrer au boot
sudo systemctl enable --now nginx  # Activer et démarrer immédiatement

# Lister les services
systemctl list-units --type=service         # Services actifs
systemctl list-units --type=service --all   # Tous les services
systemctl list-unit-files                   # Tous les fichiers d'unité

# État du système
sudo systemctl poweroff         # Éteindre
sudo systemctl reboot           # Redémarrer
sudo systemctl suspend          # Suspendre
systemctl is-active nginx       # Vérifier si actif
systemctl is-enabled nginx      # Vérifier si activé
\`\`\`

## État du service

\`\`\`bash
systemctl status nginx

# Sortie expliquée :
# ● nginx.service - A high performance web server
#    Loaded: loaded (/lib/systemd/system/nginx.service; enabled)
#    Active: active (running) since lun. 2024-01-01 10:00:00 UTC
#   Process: 1234 ExecStartPre=/usr/sbin/nginx -t
#  Main PID: 1235 (nginx)
#    CGroup: /system.slice/nginx.service
#            ├─1235 nginx: master process
#            └─1236 nginx: worker process
\`\`\`

## journalctl — Gestion des journaux

\`\`\`bash
journalctl                          # Tous les journaux
journalctl -f                       # Suivre les journaux en temps réel
journalctl -u nginx                 # Journaux du service nginx
journalctl -u nginx -f              # Suivre les journaux nginx
journalctl -u nginx --since today   # Journaux nginx d'aujourd'hui
journalctl -u nginx -n 100          # 100 dernières lignes
journalctl --since "2024-01-01"     # Depuis une date
journalctl --since "1 hour ago"     # Depuis 1 heure
journalctl -p err                   # Erreurs uniquement
journalctl -p err..warning          # Erreurs et avertissements
journalctl -b                       # Démarrage actuel uniquement
journalctl -b -1                    # Démarrage précédent
journalctl --disk-usage             # Utilisation disque des journaux
sudo journalctl --vacuum-size=500M  # Réduire les journaux à 500 Mo
\`\`\`

## Créer une unité de service

\`\`\`bash
# Créer un fichier de service
sudo nano /etc/systemd/system/monapplication.service
\`\`\`

\`\`\`ini
[Unit]
Description=Mon Application
After=network.target
Requires=postgresql.service

[Service]
Type=simple
User=monapplication
WorkingDirectory=/opt/monapplication
ExecStart=/opt/monapplication/bin/serveur
ExecReload=/bin/kill -HUP $MAINPID
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
\`\`\`

\`\`\`bash
sudo systemctl daemon-reload              # Recharger la config systemd
sudo systemctl enable --now monapplication  # Activer et démarrer
\`\`\`

## Minuteries (Remplacement de Cron)

\`\`\`bash
# Créer une minuterie
sudo nano /etc/systemd/system/sauvegarde.timer
\`\`\`

\`\`\`ini
[Unit]
Description=Minuterie de sauvegarde quotidienne

[Timer]
OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target
\`\`\`

\`\`\`bash
systemctl list-timers                        # Lister toutes les minuteries
sudo systemctl enable --now sauvegarde.timer
\`\`\`

## Gestion des processus

\`\`\`bash
# Voir les processus
ps aux                              # Tous les processus
ps aux --sort=-%cpu | head          # Meilleurs utilisateurs CPU
ps aux --sort=-%mem | head          # Meilleurs utilisateurs mémoire
pstree                              # Arbre des processus
top                                 # Visionneur interactif
htop                                # Meilleur visionneur interactif

# Signaux de processus
kill -l                             # Lister tous les signaux
kill PID                            # SIGTERM — arrêt gracieux
kill -9 PID                         # SIGKILL — forcer l'arrêt
kill -HUP PID                       # SIGHUP — recharger la config
kill -STOP PID                      # Mettre en pause le processus
kill -CONT PID                      # Reprendre le processus
killall nginx                       # Tuer par nom
pkill -f "python script.py"        # Tuer par motif

# Priorité (valeurs nice : -20 la plus haute à 19 la plus basse)
nice -n 10 commande                 # Démarrer avec faible priorité
renice 10 -p PID                    # Changer la priorité d'un processus
\`\`\`

## Surveillance des ressources

\`\`\`bash
free -h                 # Utilisation mémoire
vmstat 1                # Stats système chaque seconde
iostat 1                # Stats I/O disque
sar -u 1 10             # Utilisation CPU 10 fois par seconde
lsof                    # Lister les fichiers ouverts
lsof -i :80             # Qui utilise le port 80
netstat -tulpn          # Ports ouverts et services en écoute
ss -tulpn               # Remplacement moderne de netstat
\`\`\``,
};

export const quiz = {
  en: [
    {
      question: "What is PID 1 on a modern Linux system?",
      options: ["The kernel", "systemd", "bash", "init"],
      correct: 1,
    },
    {
      question:
        "Which command enables a service to start at boot AND starts it immediately?",
      options: [
        "systemctl start --enable nginx",
        "systemctl enable nginx && systemctl start nginx",
        "systemctl enable --now nginx",
        "systemctl boot nginx",
      ],
      correct: 2,
    },
    {
      question: "What does kill -9 do?",
      options: [
        "Gracefully stops a process",
        "Reloads a process configuration",
        "Force kills a process immediately",
        "Pauses a process",
      ],
      correct: 2,
    },
    {
      question: "Which command follows service logs in real time?",
      options: [
        "journalctl -u nginx --follow",
        "journalctl -u nginx -f",
        "journalctl -u nginx -r",
        "journalctl -u nginx --live",
      ],
      correct: 1,
    },
    {
      question: "What command shows which process is using port 80?",
      options: [
        "ps aux | grep 80",
        "netstat -p 80",
        "lsof -i :80",
        "port list 80",
      ],
      correct: 2,
    },
  ],
  fr: [
    {
      question: "Qu'est-ce que le PID 1 sur un système Linux moderne ?",
      options: ["Le noyau", "systemd", "bash", "init"],
      correct: 1,
    },
    {
      question:
        "Quelle commande active un service au démarrage ET le démarre immédiatement ?",
      options: [
        "systemctl start --enable nginx",
        "systemctl enable nginx && systemctl start nginx",
        "systemctl enable --now nginx",
        "systemctl boot nginx",
      ],
      correct: 2,
    },
    {
      question: "Que fait kill -9 ?",
      options: [
        "Arrête gracieusement un processus",
        "Recharge la configuration d'un processus",
        "Force l'arrêt immédiat d'un processus",
        "Met en pause un processus",
      ],
      correct: 2,
    },
    {
      question: "Quelle commande suit les journaux du service en temps réel ?",
      options: [
        "journalctl -u nginx --follow",
        "journalctl -u nginx -f",
        "journalctl -u nginx -r",
        "journalctl -u nginx --live",
      ],
      correct: 1,
    },
    {
      question: "Quelle commande montre quel processus utilise le port 80 ?",
      options: [
        "ps aux | grep 80",
        "netstat -p 80",
        "lsof -i :80",
        "port list 80",
      ],
      correct: 2,
    },
  ],
};
