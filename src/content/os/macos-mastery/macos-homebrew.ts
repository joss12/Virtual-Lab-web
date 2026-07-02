export const content = {
  en: `# Homebrew & Package Management

macOS, unlike Linux, does not ship with a native package manager. **Homebrew** fills this gap and has become the de facto standard for installing software on macOS. Understanding Homebrew deeply means understanding how to manage development tools, system utilities, and GUI applications efficiently.

## Why macOS Needs Homebrew

\`\`\`
Linux:
├── apt (Debian/Ubuntu)
├── dnf (Fedora/RHEL)
└── pacman (Arch)
All built into the OS, officially supported

macOS:
├── App Store (GUI apps only, sandboxed, limited)
├── Manual .dmg/.pkg downloads (no dependency management, no updates)
└── Homebrew (community-driven, fills the gap)
\`\`\`

**What Homebrew provides:**
- Dependency resolution (like apt/dnf)
- Centralized updates (\`brew upgrade\`)
- Both CLI tools and GUI apps
- Pre-compiled binaries (bottles) for speed
- Build from source when needed
- Version locking and rollback

## Installing Homebrew

\`\`\`bash
# Official installation (installs to /opt/homebrew on Apple Silicon, /usr/local on Intel)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# What this does:
# 1. Installs Xcode Command Line Tools (if not present)
# 2. Creates /opt/homebrew (Apple Silicon) or /usr/local (Intel)
# 3. Downloads Homebrew itself
# 4. Sets up git repository at /opt/homebrew

# Add Homebrew to PATH (Apple Silicon — add to ~/.zshrc)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc

# Verify installation
brew --version
brew doctor                    # Check for issues
\`\`\`

## Homebrew Architecture

\`\`\`
/opt/homebrew/                 (Apple Silicon)
/usr/local/                    (Intel Mac)
│
├── bin/                       # Symlinks to installed binaries
├── Cellar/                    # Actual installation directory
│   ├── git/2.43.0/           # Versioned installation
│   │   ├── bin/git
│   │   ├── libexec/
│   │   └── share/
│   └── node/21.5.0/
│       ├── bin/node
│       └── lib/
├── Caskroom/                  # GUI applications
│   ├── visual-studio-code/
│   └── docker/
├── etc/                       # Configuration files
├── opt/                       # Symlinks to latest versions
│   ├── git -> ../Cellar/git/2.43.0
│   └── node -> ../Cellar/node/21.5.0
└── var/                       # Variable data (logs, caches)
\`\`\`

**Key insight**: Homebrew uses symlinks heavily. When you run \`git\`, you are using \`/opt/homebrew/bin/git\` which is a symlink to \`/opt/homebrew/Cellar/git/2.43.0/bin/git\`. This allows multiple versions to coexist.

## Formulae vs Casks

\`\`\`
Formulae (brew install):
├── Command-line tools
├── Libraries
├── Servers and daemons
└── Installed to /opt/homebrew/Cellar
Examples: git, node, python, nginx, postgresql

Casks (brew install --cask):
├── GUI applications
├── Fonts
├── macOS preference panes
└── Installed to /Applications or ~/Applications
Examples: visual-studio-code, docker, google-chrome, rectangle
\`\`\`

## Core Homebrew Commands

\`\`\`bash
# Search for packages
brew search git                # Search for formulae/casks
brew search --cask chrome      # Search casks only

# Install packages
brew install git               # Install CLI tool
brew install --cask docker     # Install GUI app
brew install git node python3 # Install multiple at once

# Information
brew info git                  # Package info
brew list                      # All installed packages
brew list git                  # Files installed by git
brew deps git                  # Dependencies of git
brew deps --tree git           # Dependency tree
brew uses --installed openssl  # What packages depend on openssl

# Upgrade
brew update                    # Update Homebrew itself and formulae list
brew outdated                  # List packages with updates available
brew upgrade                   # Upgrade all packages
brew upgrade git               # Upgrade specific package
brew pin git                   # Prevent git from being upgraded
brew unpin git                 # Allow upgrades again

# Uninstall
brew uninstall git             # Remove package
brew uninstall --cask docker   # Remove cask
brew autoremove                # Remove unused dependencies

# Cleanup
brew cleanup                   # Remove old versions
brew cleanup git               # Remove old git versions only
brew cleanup -n                # Dry run — show what would be removed
brew cleanup -s                # Scrub cache (removes downloads too)

# Services (like systemd on Linux)
brew services list             # List all services
brew services start postgresql # Start service
brew services stop postgresql  # Stop service
brew services restart nginx    # Restart service
brew services run postgresql   # Run without starting at boot
\`\`\`

## Taps — Third-Party Repositories

Taps are third-party repositories — like PPAs on Ubuntu:

\`\`\`bash
# List taps
brew tap

# Add a tap
brew tap homebrew/cask-fonts   # Font repository
brew tap hashicorp/tap         # HashiCorp tools

# Install from tap
brew install --cask font-fira-code
brew install hashicorp/tap/terraform

# Remove a tap
brew untap homebrew/cask-fonts

# Common useful taps:
# homebrew/cask-versions  — Beta/alternative versions
# homebrew/cask-fonts     — Fonts
# hashicorp/tap           — Terraform, Vault, Consul
# mongodb/brew            — MongoDB
\`\`\`

## Bottles — Pre-compiled Binaries

\`\`\`
Homebrew prefers "bottles" — pre-compiled binaries:

Installing git:
├── Check if bottle exists for your macOS version + architecture
├── YES → Download binary (.tar.gz), extract to Cellar (fast — seconds)
└── NO  → Build from source (slow — minutes)

# Force building from source
brew install --build-from-source git

# Check if a package has a bottle
brew info git | grep "Poured from bottle"
\`\`\`

## Managing Multiple Versions

\`\`\`bash
# Install specific version
brew install node@18           # Install Node 18 (alongside latest)
brew install python@3.11       # Install Python 3.11

# Link a specific version
brew link node@18              # Make node@18 the active version
brew unlink node@18
brew link node                 # Switch back to latest

# List installed versions
brew list --versions node

# Switch between versions (if multiple installed)
brew switch node 18.0.0

# Check which version is active
which node
node --version
\`\`\`

## Brewfile — Reproducible Environments

A **Brewfile** is like a requirements.txt for Homebrew:

\`\`\`bash
# Generate Brewfile from current installation
brew bundle dump              # Creates Brewfile in current directory
brew bundle dump --force      # Overwrite existing Brewfile

# Example Brewfile:
cat Brewfile
# tap "homebrew/cask-fonts"
# brew "git"
# brew "node"
# brew "python@3.11"
# brew "postgresql@15"
# cask "visual-studio-code"
# cask "docker"
# cask "rectangle"

# Install from Brewfile
brew bundle install           # Install everything in Brewfile
brew bundle check             # Check if everything is installed
brew bundle cleanup           # Uninstall packages not in Brewfile

# Use case: new Mac setup
# 1. On old Mac: brew bundle dump
# 2. Copy Brewfile to new Mac
# 3. On new Mac: brew bundle install
# → Identical setup in minutes
\`\`\`

## Troubleshooting Homebrew

\`\`\`bash
# Doctor — diagnose issues
brew doctor

# Common issues and fixes:

# 1. Outdated Homebrew
brew update

# 2. Broken symlinks
brew link --overwrite git
brew doctor                    # Will suggest fixes

# 3. Permissions issues (Intel Macs)
sudo chown -R $(whoami) /usr/local/*

# 4. Xcode Command Line Tools not found
xcode-select --install

# 5. Package conflicts
brew unlink git
brew link git

# 6. Clear cache
rm -rf $(brew --cache)

# 7. Reinstall package
brew reinstall git

# 8. Check configuration
brew config                    # Show Homebrew configuration
\`\`\`

## Homebrew Internals

\`\`\`bash
# Homebrew is a Git repository
cd /opt/homebrew               # or /usr/local on Intel
git log --oneline -10          # See recent changes
git remote -v                  # Homebrew's GitHub repo

# Formulae are Ruby DSL files
brew cat git                   # Show git formula (Ruby code)
# Example:
# class Git < Formula
#   desc "Distributed revision control system"
#   homepage "https://git-scm.com"
#   url "https://mirrors.edge.kernel.org/pub/software/scm/git/git-2.43.0.tar.xz"
#   sha256 "..."
#
#   depends_on "openssl@3"
#   depends_on "pcre2"
#
#   def install
#     system "./configure", "--prefix=#{prefix}"
#     system "make", "install"
#   end
# end

# Where formulas live
ls /opt/homebrew/Library/Taps/homebrew/homebrew-core/Formula/
\`\`\`

## Alternatives to Homebrew

\`\`\`bash
# MacPorts (older, less popular)
# Ports-based (like FreeBSD ports)
# Installs to /opt/local
# sudo port install git

# Fink (very old, rarely used)
# Debian-based package manager
# apt-get for macOS
# fink install git

# Nix (cross-platform, declarative)
# Functional package manager
# Reproducible builds
# nix-env -i git

# Most macOS developers use Homebrew
# MacPorts is the main alternative for edge cases
\`\`\`

## Security Considerations

\`\`\`bash
# Homebrew runs as your user (not root)
# This is safer than traditional package managers that need sudo

# However, be cautious:
# 1. Only install from trusted taps
# 2. Review formulae before installing
#    brew cat suspicious-package

# 3. Homebrew analytics (opt-out if desired)
brew analytics off
brew analytics

# 4. Check signatures (for casks)
brew info --cask visual-studio-code | grep "Verified"

# 5. Audit installed packages
brew audit --strict git
\`\`\`

## Homebrew Performance Tips

\`\`\`bash
# Speed up Homebrew operations

# 1. Use bottles (pre-compiled binaries) when available
export HOMEBREW_NO_INSTALL_FROM_API=1  # Force bottle usage

# 2. Parallel downloads
export HOMEBREW_MAKE_JOBS=8            # Use 8 cores

# 3. Skip cleanup during install (do it manually later)
export HOMEBREW_NO_INSTALL_CLEANUP=1

# 4. Disable analytics
export HOMEBREW_NO_ANALYTICS=1

# Add to ~/.zshrc:
echo 'export HOMEBREW_NO_ANALYTICS=1' >> ~/.zshrc
echo 'export HOMEBREW_NO_INSTALL_CLEANUP=1' >> ~/.zshrc

# 5. Cleanup only old versions (not all downloads)
brew cleanup --prune=7                 # Keep last 7 days
\`\`\`

## Common Packages Worth Knowing

\`\`\`bash
# Essential development tools
brew install git gh                    # Git + GitHub CLI
brew install node python@3.11          # Languages
brew install postgresql@15 redis       # Databases
brew install nginx                     # Web server

# Productivity tools
brew install --cask visual-studio-code # Editor
brew install --cask docker             # Containers
brew install --cask rectangle          # Window manager
brew install --cask alfred             # Launcher (better Spotlight)

# Command-line utilities
brew install htop                      # Better top
brew install bat                       # Better cat (with syntax highlighting)
brew install exa                       # Better ls
brew install ripgrep                   # Better grep (faster)
brew install fd                        # Better find
brew install tldr                      # Simplified man pages
brew install jq                        # JSON processor
brew install fzf                       # Fuzzy finder

# macOS-specific tools
brew install mas                       # Mac App Store CLI
brew install m-cli                     # Swiss Army Knife for macOS
brew install duti                      # Set default apps for file types
\`\`\``,

  fr: `# Homebrew et gestion des paquets

macOS, contrairement à Linux, n'est pas livré avec un gestionnaire de paquets natif. **Homebrew** comble cette lacune et est devenu le standard de facto pour installer des logiciels sur macOS. Comprendre Homebrew en profondeur signifie comprendre comment gérer efficacement les outils de développement, les utilitaires système et les applications GUI.

## Pourquoi macOS a besoin de Homebrew

\`\`\`
Linux :
├── apt (Debian/Ubuntu)
├── dnf (Fedora/RHEL)
└── pacman (Arch)
Tous intégrés à l'OS, officiellement supportés

macOS :
├── App Store (apps GUI seulement, sandboxées, limitées)
├── Téléchargements manuels .dmg/.pkg (pas de gestion dépendances, pas de mises à jour)
└── Homebrew (communautaire, comble le vide)
\`\`\`

**Ce que Homebrew fournit :**
- Résolution des dépendances (comme apt/dnf)
- Mises à jour centralisées (\`brew upgrade\`)
- Outils CLI et apps GUI
- Binaires pré-compilés (bottles) pour la vitesse
- Compilation depuis les sources si nécessaire
- Verrouillage de version et retour en arrière

## Installer Homebrew

\`\`\`bash
# Installation officielle (installe dans /opt/homebrew sur Apple Silicon, /usr/local sur Intel)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Ce que cela fait :
# 1. Installe Xcode Command Line Tools (si absent)
# 2. Crée /opt/homebrew (Apple Silicon) ou /usr/local (Intel)
# 3. Télécharge Homebrew lui-même
# 4. Configure le dépôt git à /opt/homebrew

# Ajouter Homebrew au PATH (Apple Silicon — ajouter à ~/.zshrc)
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc

# Vérifier l'installation
brew --version
brew doctor                    # Vérifier les problèmes
\`\`\`

## Architecture Homebrew

\`\`\`
/opt/homebrew/                 (Apple Silicon)
/usr/local/                    (Mac Intel)
│
├── bin/                       # Liens symboliques vers les binaires installés
├── Cellar/                    # Répertoire d'installation réel
│   ├── git/2.43.0/           # Installation versionnée
│   │   ├── bin/git
│   │   ├── libexec/
│   │   └── share/
│   └── node/21.5.0/
│       ├── bin/node
│       └── lib/
├── Caskroom/                  # Applications GUI
│   ├── visual-studio-code/
│   └── docker/
├── etc/                       # Fichiers de configuration
├── opt/                       # Liens symboliques vers dernières versions
│   ├── git -> ../Cellar/git/2.43.0
│   └── node -> ../Cellar/node/21.5.0
└── var/                       # Données variables (logs, caches)
\`\`\`

**Point clé** : Homebrew utilise massivement les liens symboliques. Quand vous exécutez \`git\`, vous utilisez \`/opt/homebrew/bin/git\` qui est un lien symbolique vers \`/opt/homebrew/Cellar/git/2.43.0/bin/git\`. Cela permet à plusieurs versions de coexister.

## Formulae vs Casks

\`\`\`
Formulae (brew install) :
├── Outils en ligne de commande
├── Bibliothèques
├── Serveurs et daemons
└── Installés dans /opt/homebrew/Cellar
Exemples : git, node, python, nginx, postgresql

Casks (brew install --cask) :
├── Applications GUI
├── Polices
├── Panneaux de préférences macOS
└── Installés dans /Applications ou ~/Applications
Exemples : visual-studio-code, docker, google-chrome, rectangle
\`\`\`

## Commandes Homebrew essentielles

\`\`\`bash
# Rechercher des paquets
brew search git                # Rechercher des formulae/casks
brew search --cask chrome      # Rechercher des casks seulement

# Installer des paquets
brew install git               # Installer un outil CLI
brew install --cask docker     # Installer une app GUI
brew install git node python3 # Installer plusieurs à la fois

# Informations
brew info git                  # Infos sur le paquet
brew list                      # Tous les paquets installés
brew list git                  # Fichiers installés par git
brew deps git                  # Dépendances de git
brew deps --tree git           # Arbre de dépendances

# Mise à jour
brew update                    # Mettre à jour Homebrew et la liste des formulae
brew outdated                  # Lister les paquets avec mises à jour disponibles
brew upgrade                   # Mettre à jour tous les paquets
brew upgrade git               # Mettre à jour un paquet spécifique

# Désinstaller
brew uninstall git             # Supprimer un paquet
brew uninstall --cask docker   # Supprimer un cask
brew autoremove                # Supprimer les dépendances inutilisées

# Nettoyage
brew cleanup                   # Supprimer les anciennes versions
brew cleanup git               # Supprimer uniquement les anciennes versions de git
brew cleanup -n                # Essai à sec — afficher ce qui serait supprimé

# Services (comme systemd sur Linux)
brew services list             # Lister tous les services
brew services start postgresql # Démarrer un service
brew services stop postgresql  # Arrêter un service
brew services restart nginx    # Redémarrer un service
\`\`\`

## Taps — Dépôts tiers

Les taps sont des dépôts tiers — comme les PPA sur Ubuntu :

\`\`\`bash
# Lister les taps
brew tap

# Ajouter un tap
brew tap homebrew/cask-fonts   # Dépôt de polices
brew tap hashicorp/tap         # Outils HashiCorp

# Installer depuis un tap
brew install --cask font-fira-code
brew install hashicorp/tap/terraform

# Supprimer un tap
brew untap homebrew/cask-fonts

# Taps utiles courants :
# homebrew/cask-versions  — Versions beta/alternatives
# homebrew/cask-fonts     — Polices
# hashicorp/tap           — Terraform, Vault, Consul
# mongodb/brew            — MongoDB
\`\`\`

## Brewfile — Environnements reproductibles

Un **Brewfile** est comme un requirements.txt pour Homebrew :

\`\`\`bash
# Générer un Brewfile depuis l'installation actuelle
brew bundle dump              # Crée un Brewfile dans le répertoire courant
brew bundle dump --force      # Écraser le Brewfile existant

# Exemple de Brewfile :
cat Brewfile
# tap "homebrew/cask-fonts"
# brew "git"
# brew "node"
# brew "python@3.11"
# brew "postgresql@15"
# cask "visual-studio-code"
# cask "docker"
# cask "rectangle"

# Installer depuis un Brewfile
brew bundle install           # Installer tout ce qui est dans le Brewfile
brew bundle check             # Vérifier si tout est installé
brew bundle cleanup           # Désinstaller les paquets pas dans le Brewfile

# Cas d'utilisation : configuration nouveau Mac
# 1. Sur l'ancien Mac : brew bundle dump
# 2. Copier le Brewfile sur le nouveau Mac
# 3. Sur le nouveau Mac : brew bundle install
# → Configuration identique en quelques minutes
\`\`\`

## Dépannage Homebrew

\`\`\`bash
# Doctor — diagnostiquer les problèmes
brew doctor

# Problèmes courants et corrections :

# 1. Homebrew obsolète
brew update

# 2. Liens symboliques cassés
brew link --overwrite git
brew doctor                    # Suggérera des corrections

# 3. Problèmes de permissions (Macs Intel)
sudo chown -R $(whoami) /usr/local/*

# 4. Xcode Command Line Tools introuvables
xcode-select --install

# 5. Conflits de paquets
brew unlink git
brew link git

# 6. Vider le cache
rm -rf $(brew --cache)

# 7. Réinstaller un paquet
brew reinstall git

# 8. Vérifier la configuration
brew config                    # Afficher la configuration Homebrew
\`\`\`

## Paquets courants utiles

\`\`\`bash
# Outils de développement essentiels
brew install git gh                    # Git + GitHub CLI
brew install node python@3.11          # Langages
brew install postgresql@15 redis       # Bases de données
brew install nginx                     # Serveur web

# Outils de productivité
brew install --cask visual-studio-code # Éditeur
brew install --cask docker             # Conteneurs
brew install --cask rectangle          # Gestionnaire de fenêtres
brew install --cask alfred             # Lanceur (meilleur Spotlight)

# Utilitaires en ligne de commande
brew install htop                      # Meilleur top
brew install bat                       # Meilleur cat (avec coloration syntaxique)
brew install exa                       # Meilleur ls
brew install ripgrep                   # Meilleur grep (plus rapide)
brew install fd                        # Meilleur find
brew install tldr                      # Pages man simplifiées
brew install jq                        # Processeur JSON
brew install fzf                       # Chercheur flou

# Outils spécifiques macOS
brew install mas                       # CLI Mac App Store
brew install m-cli                     # Couteau suisse pour macOS
\`\`\``,
};

export const quiz = {
  en: [
    {
      question: "What is the difference between Homebrew formulae and casks?",
      options: [
        "Formulae are for Intel Macs, casks are for Apple Silicon",
        "Formulae are command-line tools and libraries, casks are GUI applications",
        "Formulae are free, casks are paid",
        "Formulae are from Apple, casks are third-party",
      ],
      correct: 1,
    },
    {
      question: "Where does Homebrew install packages on Apple Silicon Macs?",
      options: [
        "/usr/local",
        "/Applications",
        "/opt/homebrew",
        "/System/Library",
      ],
      correct: 2,
    },
    {
      question: "What is a Homebrew 'bottle'?",
      options: [
        "A container for dependencies",
        "A pre-compiled binary package for faster installation",
        "A backup of installed packages",
        "A virtual environment for packages",
      ],
      correct: 1,
    },
    {
      question: "What is a Brewfile used for?",
      options: [
        "Configuring Homebrew settings",
        "A reproducible list of packages to install — like requirements.txt",
        "Storing Homebrew logs",
        "Caching downloaded packages",
      ],
      correct: 1,
    },
    {
      question: "What does 'brew doctor' do?",
      options: [
        "Updates all packages",
        "Diagnoses and suggests fixes for Homebrew issues",
        "Removes unused packages",
        "Backs up installed packages",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Quelle est la différence entre les formulae et les casks Homebrew ?",
      options: [
        "Les formulae sont pour les Macs Intel, les casks pour Apple Silicon",
        "Les formulae sont des outils en ligne de commande et bibliothèques, les casks sont des applications GUI",
        "Les formulae sont gratuits, les casks sont payants",
        "Les formulae viennent d'Apple, les casks sont tiers",
      ],
      correct: 1,
    },
    {
      question:
        "Où Homebrew installe-t-il les paquets sur les Macs Apple Silicon ?",
      options: [
        "/usr/local",
        "/Applications",
        "/opt/homebrew",
        "/System/Library",
      ],
      correct: 2,
    },
    {
      question: "Qu'est-ce qu'une 'bottle' Homebrew ?",
      options: [
        "Un conteneur pour les dépendances",
        "Un paquet binaire pré-compilé pour une installation plus rapide",
        "Une sauvegarde des paquets installés",
        "Un environnement virtuel pour les paquets",
      ],
      correct: 1,
    },
    {
      question: "À quoi sert un Brewfile ?",
      options: [
        "Configurer les paramètres Homebrew",
        "Une liste reproductible de paquets à installer — comme requirements.txt",
        "Stocker les journaux Homebrew",
        "Mettre en cache les paquets téléchargés",
      ],
      correct: 1,
    },
    {
      question: "Que fait 'brew doctor' ?",
      options: [
        "Met à jour tous les paquets",
        "Diagnostique et suggère des corrections pour les problèmes Homebrew",
        "Supprime les paquets inutilisés",
        "Sauvegarde les paquets installés",
      ],
      correct: 1,
    },
  ],
};
