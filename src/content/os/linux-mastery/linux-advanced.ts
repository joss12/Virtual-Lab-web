export const content = {
  en: `# Advanced Linux

This lesson covers advanced Linux topics that separate power users from administrators — kernel modules, performance tuning, security hardening, and system internals.

## Kernel Modules

The Linux kernel can be extended at runtime using **loadable kernel modules (LKMs)** without rebooting.

\`\`\`bash
# List loaded modules
lsmod

# Get module info
modinfo nvidia
modinfo ext4

# Load a module
sudo modprobe nvidia
sudo modprobe usb_storage

# Load with parameters
sudo modprobe mac80211 ieee80211_regdom=US

# Unload a module
sudo modprobe -r nvidia
sudo rmmod nvidia

# Automatically load at boot
echo "nvidia" | sudo tee /etc/modules-load.d/nvidia.conf

# Module parameters at boot
echo "options nvidia NVreg_EnablePCIeGen3=1" | \\
  sudo tee /etc/modprobe.d/nvidia.conf

# Blacklist a module (prevent loading)
echo "blacklist nouveau" | \\
  sudo tee /etc/modprobe.d/blacklist-nouveau.conf
\`\`\`

## Kernel Parameters (sysctl)

\`\`\`bash
# View all kernel parameters
sysctl -a

# View specific parameter
sysctl net.ipv4.ip_forward
sysctl vm.swappiness

# Set parameter temporarily
sudo sysctl -w net.ipv4.ip_forward=1
sudo sysctl -w vm.swappiness=10

# Set permanently
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p          # Apply changes

# Important parameters
vm.swappiness=10        # Prefer RAM over swap (default 60)
net.ipv4.ip_forward=1  # Enable IP forwarding (needed for routing)
fs.file-max=100000      # Max open files system-wide
net.core.somaxconn=1024 # Max socket connections
\`\`\`

## Performance Tuning

\`\`\`bash
# CPU frequency scaling
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
echo "performance" | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Available governors:
# performance  — always max frequency
# powersave    — always min frequency
# ondemand     — scale based on load
# schedutil    — kernel scheduler based

# I/O Scheduler
cat /sys/block/sda/queue/scheduler
echo "none" | sudo tee /sys/block/sda/queue/scheduler    # Best for NVMe SSD
echo "mq-deadline" | sudo tee /sys/block/sda/queue/scheduler  # Best for HDD

# Transparent Huge Pages
cat /sys/kernel/mm/transparent_hugepage/enabled
echo "madvise" | sudo tee /sys/kernel/mm/transparent_hugepage/enabled

# NUMA (Non-Uniform Memory Access)
numactl --hardware         # Show NUMA topology
numactl --membind=0 --cpunodebind=0 command  # Bind process to NUMA node
\`\`\`

## System Profiling

\`\`\`bash
# CPU profiling
perf stat command           # CPU counters for a command
perf top                    # Live CPU profiler
perf record -g command      # Record with call graph
perf report                 # Analyze recording

# strace — system call tracer
strace ls                   # Trace system calls of ls
strace -p PID               # Trace running process
strace -e openat ls         # Trace only openat calls
strace -c ls                # Summary of system calls

# ltrace — library call tracer
ltrace ls                   # Trace library calls

# Memory profiling
valgrind --leak-check=full ./program  # Memory leak detection

# Disk I/O profiling
iotop                       # I/O usage by process
iostat -xz 1                # Extended I/O stats

# Network profiling
iftop                       # Network bandwidth by connection
nethogs                     # Network bandwidth by process
\`\`\`

## Security Hardening

\`\`\`bash
# Check for SUID binaries (potential security risk)
find / -perm -4000 -type f 2>/dev/null

# Check for world-writable files
find / -perm -0002 -type f 2>/dev/null

# Check listening services
ss -tulpn

# Disable unused services
sudo systemctl disable bluetooth
sudo systemctl disable avahi-daemon

# SSH hardening
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no
# MaxAuthTries 3
# AllowUsers alice bob
sudo systemctl restart sshd

# Fail2ban — automatic IP banning
sudo apt install fail2ban
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd

# AppArmor — mandatory access control
sudo aa-status              # Check AppArmor status
sudo aa-enforce /etc/apparmor.d/usr.bin.nginx  # Enforce profile
\`\`\`

## Compiling the Kernel

\`\`\`bash
# Install build dependencies
sudo apt install build-essential libncurses-dev bison flex \\
  libssl-dev libelf-dev

# Download kernel source
wget https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.7.tar.xz
tar -xf linux-6.7.tar.xz
cd linux-6.7/

# Configure kernel
make menuconfig             # Interactive menu
make localmodconfig         # Use current kernel's modules as base
cp /boot/config-$(uname -r) .config  # Copy current config

# Compile
make -j$(nproc)             # Use all CPU cores
make modules -j$(nproc)

# Install
sudo make modules_install
sudo make install

# Update bootloader
sudo update-grub
\`\`\`

## Advanced File Operations

\`\`\`bash
# dd — disk imaging
sudo dd if=/dev/sda of=/backup/disk.img bs=4M status=progress
sudo dd if=ubuntu.iso of=/dev/sdb bs=4M status=progress

# LVM — Logical Volume Manager
sudo pvcreate /dev/sdb      # Create physical volume
sudo vgcreate myvg /dev/sdb # Create volume group
sudo lvcreate -L 50G -n mylv myvg  # Create logical volume
sudo mkfs.ext4 /dev/myvg/mylv      # Format

# RAID with mdadm
sudo mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb /dev/sdc
cat /proc/mdstat             # RAID status

# inotify — watch filesystem events
inotifywait -m /path/to/watch    # Watch for changes
inotifywait -m -e modify,create,delete /path/
\`\`\``,

  fr: `# Linux Avancé

Cette leçon couvre les sujets Linux avancés qui séparent les utilisateurs expérimentés des administrateurs — modules noyau, optimisation des performances, durcissement de la sécurité et internals système.

## Modules noyau

Le noyau Linux peut être étendu à l'exécution en utilisant des **modules noyau chargeable (LKM)** sans redémarrage.

\`\`\`bash
# Lister les modules chargés
lsmod

# Obtenir des infos sur un module
modinfo nvidia
modinfo ext4

# Charger un module
sudo modprobe nvidia
sudo modprobe usb_storage

# Charger avec des paramètres
sudo modprobe mac80211 ieee80211_regdom=FR

# Décharger un module
sudo modprobe -r nvidia
sudo rmmod nvidia

# Chargement automatique au démarrage
echo "nvidia" | sudo tee /etc/modules-load.d/nvidia.conf

# Paramètres du module au démarrage
echo "options nvidia NVreg_EnablePCIeGen3=1" | \\
  sudo tee /etc/modprobe.d/nvidia.conf

# Blacklister un module (empêcher le chargement)
echo "blacklist nouveau" | \\
  sudo tee /etc/modprobe.d/blacklist-nouveau.conf
\`\`\`

## Paramètres noyau (sysctl)

\`\`\`bash
# Voir tous les paramètres noyau
sysctl -a

# Voir un paramètre spécifique
sysctl net.ipv4.ip_forward
sysctl vm.swappiness

# Définir temporairement
sudo sysctl -w net.ipv4.ip_forward=1
sudo sysctl -w vm.swappiness=10

# Définir de façon permanente
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p          # Appliquer les changements

# Paramètres importants
vm.swappiness=10        # Préférer la RAM au swap (défaut 60)
net.ipv4.ip_forward=1  # Activer le transfert IP (routage)
fs.file-max=100000      # Max fichiers ouverts système
net.core.somaxconn=1024 # Max connexions socket
\`\`\`

## Optimisation des performances

\`\`\`bash
# Mise à l'échelle de la fréquence CPU
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
echo "performance" | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Gouverneurs disponibles :
# performance  — toujours fréquence maximale
# powersave    — toujours fréquence minimale
# ondemand     — échelle selon la charge
# schedutil    — basé sur l'ordonnanceur noyau

# Ordonnanceur I/O
cat /sys/block/sda/queue/scheduler
echo "none" | sudo tee /sys/block/sda/queue/scheduler    # Meilleur pour SSD NVMe
echo "mq-deadline" | sudo tee /sys/block/sda/queue/scheduler  # Meilleur pour HDD

# Pages hugues transparentes
cat /sys/kernel/mm/transparent_hugepage/enabled
echo "madvise" | sudo tee /sys/kernel/mm/transparent_hugepage/enabled

# NUMA (Accès mémoire non uniforme)
numactl --hardware         # Afficher la topologie NUMA
numactl --membind=0 --cpunodebind=0 commande  # Lier le processus au nœud NUMA
\`\`\`

## Profilage système

\`\`\`bash
# Profilage CPU
perf stat commande          # Compteurs CPU pour une commande
perf top                    # Profileur CPU en direct
perf record -g commande     # Enregistrer avec graphe d'appels
perf report                 # Analyser l'enregistrement

# strace — traceur d'appels système
strace ls                   # Tracer les appels système de ls
strace -p PID               # Tracer un processus en cours
strace -e openat ls         # Tracer uniquement les appels openat
strace -c ls                # Résumé des appels système

# ltrace — traceur d'appels bibliothèque
ltrace ls                   # Tracer les appels bibliothèque

# Profilage mémoire
valgrind --leak-check=full ./programme  # Détection de fuites mémoire

# Profilage I/O disque
iotop                       # Utilisation I/O par processus
iostat -xz 1                # Stats I/O étendues

# Profilage réseau
iftop                       # Bande passante réseau par connexion
nethogs                     # Bande passante réseau par processus
\`\`\`

## Durcissement de la sécurité

\`\`\`bash
# Vérifier les binaires SUID (risque de sécurité potentiel)
find / -perm -4000 -type f 2>/dev/null

# Vérifier les fichiers accessibles en écriture par tous
find / -perm -0002 -type f 2>/dev/null

# Vérifier les services en écoute
ss -tulpn

# Désactiver les services inutilisés
sudo systemctl disable bluetooth
sudo systemctl disable avahi-daemon

# Durcissement SSH
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no
# MaxAuthTries 3
# AllowUsers alice bob
sudo systemctl restart sshd

# Fail2ban — bannissement automatique d'IP
sudo apt install fail2ban
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd

# AppArmor — contrôle d'accès obligatoire
sudo aa-status              # Vérifier l'état d'AppArmor
sudo aa-enforce /etc/apparmor.d/usr.bin.nginx  # Appliquer le profil
\`\`\`

## Compilation du noyau

\`\`\`bash
# Installer les dépendances de compilation
sudo apt install build-essential libncurses-dev bison flex \\
  libssl-dev libelf-dev

# Télécharger les sources du noyau
wget https://cdn.kernel.org/pub/linux/kernel/v6.x/linux-6.7.tar.xz
tar -xf linux-6.7.tar.xz
cd linux-6.7/

# Configurer le noyau
make menuconfig             # Menu interactif
make localmodconfig         # Utiliser les modules du noyau actuel
cp /boot/config-$(uname -r) .config  # Copier la config actuelle

# Compiler
make -j$(nproc)             # Utiliser tous les cœurs CPU
make modules -j$(nproc)

# Installer
sudo make modules_install
sudo make install

# Mettre à jour le bootloader
sudo update-grub
\`\`\`

## Opérations avancées sur les fichiers

\`\`\`bash
# dd — image disque
sudo dd if=/dev/sda of=/sauvegarde/disque.img bs=4M status=progress
sudo dd if=ubuntu.iso of=/dev/sdb bs=4M status=progress

# LVM — Gestionnaire de volumes logiques
sudo pvcreate /dev/sdb      # Créer un volume physique
sudo vgcreate monvg /dev/sdb # Créer un groupe de volumes
sudo lvcreate -L 50G -n monlv monvg  # Créer un volume logique
sudo mkfs.ext4 /dev/monvg/monlv      # Formater

# RAID avec mdadm
sudo mdadm --create /dev/md0 --level=1 --raid-devices=2 /dev/sdb /dev/sdc
cat /proc/mdstat             # État du RAID

# inotify — surveiller les événements du système de fichiers
inotifywait -m /chemin/a/surveiller    # Surveiller les changements
inotifywait -m -e modify,create,delete /chemin/
\`\`\``,
};

export const quiz = {
  en: [
    {
      question: "What command lists all loaded kernel modules?",
      options: ["modinfo", "lsmod", "modprobe -l", "insmod"],
      correct: 1,
    },
    {
      question: "What does vm.swappiness=10 mean?",
      options: [
        "Use swap 10 times more than RAM",
        "Prefer RAM over swap — only use swap when RAM is 90% full",
        "Disable swap entirely",
        "Use 10MB of swap",
      ],
      correct: 1,
    },
    {
      question: "Which tool traces system calls made by a program?",
      options: ["ltrace", "perf", "strace", "valgrind"],
      correct: 2,
    },
    {
      question: "What does blacklisting a kernel module do?",
      options: [
        "Unloads the module immediately",
        "Prevents the module from being loaded",
        "Marks the module as unsafe",
        "Removes the module from disk",
      ],
      correct: 1,
    },
    {
      question: "Which CPU governor always runs at maximum frequency?",
      options: ["powersave", "ondemand", "schedutil", "performance"],
      correct: 3,
    },
  ],
  fr: [
    {
      question: "Quelle commande liste tous les modules noyau chargés ?",
      options: ["modinfo", "lsmod", "modprobe -l", "insmod"],
      correct: 1,
    },
    {
      question: "Que signifie vm.swappiness=10 ?",
      options: [
        "Utiliser le swap 10 fois plus que la RAM",
        "Préférer la RAM au swap — n'utiliser le swap que quand la RAM est à 90%",
        "Désactiver entièrement le swap",
        "Utiliser 10 Mo de swap",
      ],
      correct: 1,
    },
    {
      question: "Quel outil trace les appels système d'un programme ?",
      options: ["ltrace", "perf", "strace", "valgrind"],
      correct: 2,
    },
    {
      question: "Que fait le blacklistage d'un module noyau ?",
      options: [
        "Décharge le module immédiatement",
        "Empêche le module d'être chargé",
        "Marque le module comme dangereux",
        "Supprime le module du disque",
      ],
      correct: 1,
    },
    {
      question:
        "Quel gouverneur CPU fonctionne toujours à la fréquence maximale ?",
      options: ["powersave", "ondemand", "schedutil", "performance"],
      correct: 3,
    },
  ],
};
