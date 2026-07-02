export const content = {
  en: `# Package Management

Package managers are one of Linux's greatest strengths. They handle installing, updating, and removing software — including all dependencies — automatically.

## What is a Package?

A **package** is a compressed archive containing:
- The software binaries
- Configuration files
- Documentation
- Metadata (name, version, dependencies)
- Pre/post install scripts

## Package Managers by Distro

| Distro | Package Manager | Package Format | Command |
|---|---|---|---|
| Ubuntu/Debian | APT | .deb | apt |
| Fedora/RHEL | DNF | .rpm | dnf |
| Arch Linux | Pacman | .pkg.tar | pacman |
| Alpine | APK | .apk | apk |
| openSUSE | Zypper | .rpm | zypper |

## APT — Debian/Ubuntu

\`\`\`bash
# Update package list (always run before installing)
sudo apt update

# Upgrade all packages
sudo apt upgrade
sudo apt full-upgrade       # Also removes obsolete packages

# Install packages
sudo apt install nginx
sudo apt install nginx postgresql nodejs
sudo apt install -y nginx   # Auto-confirm

# Remove packages
sudo apt remove nginx       # Remove but keep config files
sudo apt purge nginx        # Remove including config files
sudo apt autoremove         # Remove unused dependencies

# Search packages
apt search nginx
apt show nginx              # Package details

# List packages
apt list --installed        # All installed packages
apt list --upgradable       # Packages with updates available

# Fix broken packages
sudo apt --fix-broken install
\`\`\`

## DNF — Fedora/RHEL

\`\`\`bash
sudo dnf update             # Update all
sudo dnf install nginx      # Install
sudo dnf remove nginx       # Remove
sudo dnf search nginx       # Search
sudo dnf info nginx         # Package info
sudo dnf list installed     # List installed
\`\`\`

## Pacman — Arch Linux

\`\`\`bash
sudo pacman -Syu            # Update system
sudo pacman -S nginx        # Install
sudo pacman -R nginx        # Remove
sudo pacman -Rs nginx       # Remove with dependencies
sudo pacman -Ss nginx       # Search
sudo pacman -Q              # List installed
sudo pacman -Qi nginx       # Package info
\`\`\`

## Repositories

Packages come from **repositories** — servers hosting packages.

\`\`\`bash
# Ubuntu repositories
cat /etc/apt/sources.list
ls /etc/apt/sources.list.d/

# Add a PPA (Personal Package Archive)
sudo add-apt-repository ppa:user/repo
sudo apt update
sudo apt install package

# Add a repository manually
echo "deb https://packages.example.com/apt stable main" | \\
  sudo tee /etc/apt/sources.list.d/example.list
sudo apt-key add key.gpg
sudo apt update
\`\`\`

## dpkg — Low Level Package Tool

\`\`\`bash
# Install a .deb file directly
sudo dpkg -i package.deb

# List installed packages
dpkg -l
dpkg -l | grep nginx

# Remove package
sudo dpkg -r nginx

# Show package files
dpkg -L nginx

# Find which package owns a file
dpkg -S /usr/bin/nginx
\`\`\`

## Snap and Flatpak

Modern universal package formats that work across distros:

\`\`\`bash
# Snap (Ubuntu default)
snap install code            # Install VS Code
snap list                    # List installed snaps
snap refresh                 # Update all snaps
snap remove code             # Remove

# Flatpak
flatpak install flathub org.gimp.GIMP
flatpak list
flatpak update
flatpak uninstall org.gimp.GIMP
\`\`\`

## Building from Source

When no package is available:

\`\`\`bash
# Typical build process
wget https://example.com/software-1.0.tar.gz
tar -xzf software-1.0.tar.gz
cd software-1.0/

./configure                 # Check dependencies, create Makefile
make                        # Compile
sudo make install           # Install to /usr/local/

# Install build tools
sudo apt install build-essential   # gcc, make, etc.
\`\`\`

## Package Cache

\`\`\`bash
# Clean package cache
sudo apt clean              # Remove all cached packages
sudo apt autoclean          # Remove outdated cached packages
sudo du -sh /var/cache/apt  # See cache size
\`\`\``,

  fr: `# Gestion des paquets

Les gestionnaires de paquets sont l'un des plus grands atouts de Linux. Ils gèrent l'installation, la mise à jour et la suppression des logiciels — y compris toutes les dépendances — automatiquement.

## Qu'est-ce qu'un paquet ?

Un **paquet** est une archive compressée contenant :
- Les binaires du logiciel
- Les fichiers de configuration
- La documentation
- Les métadonnées (nom, version, dépendances)
- Les scripts pre/post installation

## Gestionnaires de paquets par distro

| Distro | Gestionnaire | Format | Commande |
|---|---|---|---|
| Ubuntu/Debian | APT | .deb | apt |
| Fedora/RHEL | DNF | .rpm | dnf |
| Arch Linux | Pacman | .pkg.tar | pacman |
| Alpine | APK | .apk | apk |
| openSUSE | Zypper | .rpm | zypper |

## APT — Debian/Ubuntu

\`\`\`bash
# Mettre à jour la liste des paquets (toujours avant d'installer)
sudo apt update

# Mettre à jour tous les paquets
sudo apt upgrade
sudo apt full-upgrade       # Supprime aussi les paquets obsolètes

# Installer des paquets
sudo apt install nginx
sudo apt install nginx postgresql nodejs
sudo apt install -y nginx   # Confirmer automatiquement

# Supprimer des paquets
sudo apt remove nginx       # Supprimer mais garder les configs
sudo apt purge nginx        # Supprimer y compris les configs
sudo apt autoremove         # Supprimer les dépendances inutilisées

# Rechercher des paquets
apt search nginx
apt show nginx              # Détails du paquet

# Lister les paquets
apt list --installed        # Tous les paquets installés
apt list --upgradable       # Paquets avec mises à jour disponibles

# Corriger les paquets cassés
sudo apt --fix-broken install
\`\`\`

## DNF — Fedora/RHEL

\`\`\`bash
sudo dnf update             # Tout mettre à jour
sudo dnf install nginx      # Installer
sudo dnf remove nginx       # Supprimer
sudo dnf search nginx       # Rechercher
sudo dnf info nginx         # Infos paquet
sudo dnf list installed     # Lister les installés
\`\`\`

## Pacman — Arch Linux

\`\`\`bash
sudo pacman -Syu            # Mettre à jour le système
sudo pacman -S nginx        # Installer
sudo pacman -R nginx        # Supprimer
sudo pacman -Rs nginx       # Supprimer avec dépendances
sudo pacman -Ss nginx       # Rechercher
sudo pacman -Q              # Lister les installés
sudo pacman -Qi nginx       # Infos paquet
\`\`\`

## Dépôts

Les paquets viennent de **dépôts** — des serveurs hébergeant des paquets.

\`\`\`bash
# Dépôts Ubuntu
cat /etc/apt/sources.list
ls /etc/apt/sources.list.d/

# Ajouter un PPA
sudo add-apt-repository ppa:utilisateur/depot
sudo apt update
sudo apt install paquet

# Ajouter un dépôt manuellement
echo "deb https://paquets.exemple.com/apt stable main" | \\
  sudo tee /etc/apt/sources.list.d/exemple.list
sudo apt-key add cle.gpg
sudo apt update
\`\`\`

## dpkg — Outil de bas niveau

\`\`\`bash
# Installer un fichier .deb directement
sudo dpkg -i paquet.deb

# Lister les paquets installés
dpkg -l
dpkg -l | grep nginx

# Supprimer un paquet
sudo dpkg -r nginx

# Afficher les fichiers d'un paquet
dpkg -L nginx

# Trouver quel paquet possède un fichier
dpkg -S /usr/bin/nginx
\`\`\`

## Snap et Flatpak

Formats de paquets universels modernes qui fonctionnent sur toutes les distros :

\`\`\`bash
# Snap (Ubuntu par défaut)
snap install code            # Installer VS Code
snap list                    # Lister les snaps installés
snap refresh                 # Mettre à jour tous les snaps
snap remove code             # Supprimer

# Flatpak
flatpak install flathub org.gimp.GIMP
flatpak list
flatpak update
flatpak uninstall org.gimp.GIMP
\`\`\`

## Compilation depuis les sources

Quand aucun paquet n'est disponible :

\`\`\`bash
# Processus de compilation typique
wget https://exemple.com/logiciel-1.0.tar.gz
tar -xzf logiciel-1.0.tar.gz
cd logiciel-1.0/

./configure                 # Vérifier les dépendances, créer le Makefile
make                        # Compiler
sudo make install           # Installer dans /usr/local/

# Installer les outils de compilation
sudo apt install build-essential   # gcc, make, etc.
\`\`\`

## Cache des paquets

\`\`\`bash
# Nettoyer le cache
sudo apt clean              # Supprimer tous les paquets en cache
sudo apt autoclean          # Supprimer les paquets obsolètes en cache
sudo du -sh /var/cache/apt  # Voir la taille du cache
\`\`\``,
};

export const quiz = {
  en: [
    {
      question: "Which command updates the package list on Ubuntu?",
      options: [
        "sudo apt upgrade",
        "sudo apt update",
        "sudo apt refresh",
        "sudo apt sync",
      ],
      correct: 1,
    },
    {
      question: "What is the difference between apt remove and apt purge?",
      options: [
        "They are the same",
        "remove keeps config files, purge removes everything",
        "purge keeps config files, remove removes everything",
        "remove is for .deb files, purge is for .rpm",
      ],
      correct: 1,
    },
    {
      question: "Which package manager does Arch Linux use?",
      options: ["apt", "dnf", "pacman", "zypper"],
      correct: 2,
    },
    {
      question: "What does sudo apt autoremove do?",
      options: [
        "Automatically installs updates",
        "Removes packages that were automatically installed and are no longer needed",
        "Removes all installed packages",
        "Removes the apt cache",
      ],
      correct: 1,
    },
    {
      question: "Which command installs a .deb file directly?",
      options: [
        "apt install file.deb",
        "dpkg -i file.deb",
        "rpm -i file.deb",
        "snap install file.deb",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Quelle commande met à jour la liste des paquets sur Ubuntu ?",
      options: [
        "sudo apt upgrade",
        "sudo apt update",
        "sudo apt refresh",
        "sudo apt sync",
      ],
      correct: 1,
    },
    {
      question: "Quelle est la différence entre apt remove et apt purge ?",
      options: [
        "Ils sont identiques",
        "remove garde les fichiers de config, purge supprime tout",
        "purge garde les fichiers de config, remove supprime tout",
        "remove est pour .deb, purge est pour .rpm",
      ],
      correct: 1,
    },
    {
      question: "Quel gestionnaire de paquets Arch Linux utilise-t-il ?",
      options: ["apt", "dnf", "pacman", "zypper"],
      correct: 2,
    },
    {
      question: "Que fait sudo apt autoremove ?",
      options: [
        "Installe automatiquement les mises à jour",
        "Supprime les paquets installés automatiquement et qui ne sont plus nécessaires",
        "Supprime tous les paquets installés",
        "Supprime le cache apt",
      ],
      correct: 1,
    },
    {
      question: "Quelle commande installe un fichier .deb directement ?",
      options: [
        "apt install fichier.deb",
        "dpkg -i fichier.deb",
        "rpm -i fichier.deb",
        "snap install fichier.deb",
      ],
      correct: 1,
    },
  ],
};
