export const content = {
  en: `# Shell & Terminal Mastery

The shell is your most powerful tool on Linux. Mastering it means mastering Linux. The default shell on most Linux systems is **bash** (Bourne Again Shell).

## What is a Shell?

A shell is a command interpreter — it reads your commands, interprets them, and executes them. It sits between you and the kernel.

\`\`\`
You → Shell (bash) → Kernel → Hardware
\`\`\`

## Basic Commands

\`\`\`bash
# Navigation
pwd                     # Where am I?
ls -la                  # List all files with details
cd /path/to/dir         # Change directory
cd ..                   # Go up one level
cd ~                    # Go home

# Files
cat file.txt            # Print file
echo "hello" > file.txt # Write to file (overwrite)
echo "hello" >> file.txt # Append to file
cp source dest          # Copy
mv source dest          # Move/rename
rm -rf dir/             # Delete directory

# System info
whoami                  # Current user
hostname                # Machine name
uptime                  # How long running
date                    # Current date/time
uname -a                # Kernel info
\`\`\`

## Pipes and Redirection

Pipes are one of the most powerful features of the shell — they connect commands together.

\`\`\`bash
# Pipe output of one command to another
ls -la | grep ".txt"        # List only .txt files
ps aux | grep nginx          # Find nginx process
cat /var/log/syslog | tail -100 | grep error

# Redirection
command > file.txt           # Write stdout to file
command >> file.txt          # Append stdout to file
command 2> error.txt         # Write stderr to file
command > file.txt 2>&1      # Write both stdout and stderr
command < input.txt          # Read stdin from file

# /dev/null
command > /dev/null 2>&1     # Discard all output
\`\`\`

## Text Processing

\`\`\`bash
# grep — search text
grep "error" /var/log/syslog          # Find lines with "error"
grep -i "error" file.txt              # Case insensitive
grep -r "TODO" /home/alice/           # Recursive search
grep -n "error" file.txt              # Show line numbers
grep -v "debug" file.txt              # Exclude lines with "debug"

# sed — stream editor
sed 's/old/new/g' file.txt            # Replace all occurrences
sed -i 's/old/new/g' file.txt         # Replace in file directly
sed '/pattern/d' file.txt             # Delete lines matching pattern
sed -n '10,20p' file.txt              # Print lines 10-20

# awk — text processing
awk '{print $1}' file.txt             # Print first column
awk -F: '{print $1}' /etc/passwd      # Print usernames
awk '{sum += $1} END {print sum}'     # Sum first column

# sort and uniq
sort file.txt                         # Sort alphabetically
sort -n file.txt                      # Sort numerically
sort -r file.txt                      # Reverse sort
sort file.txt | uniq                  # Remove duplicates
sort file.txt | uniq -c               # Count duplicates

# wc — word count
wc -l file.txt                        # Count lines
wc -w file.txt                        # Count words
wc -c file.txt                        # Count bytes
\`\`\`

## Variables and Scripts

\`\`\`bash
# Variables
NAME="Alice"
echo $NAME
echo "Hello, $NAME!"

# Environment variables
export PATH=$PATH:/new/bin/path
echo $HOME
echo $USER
echo $PATH

# Command substitution
DATE=$(date)
FILES=$(ls | wc -l)
echo "Today is $DATE, there are $FILES files"

# Simple script
#!/bin/bash
echo "Starting backup..."
tar -czf /backup/home-$(date +%Y%m%d).tar.gz /home/
echo "Backup complete!"
\`\`\`

## Process Management

\`\`\`bash
ps aux                  # List all processes
ps aux | grep nginx     # Find specific process
top                     # Interactive process viewer
htop                    # Better interactive viewer
kill PID                # Send SIGTERM (graceful stop)
kill -9 PID             # Send SIGKILL (force kill)
killall nginx           # Kill all nginx processes

# Background jobs
command &               # Run in background
jobs                    # List background jobs
fg %1                   # Bring job 1 to foreground
bg %1                   # Send job 1 to background
nohup command &         # Run immune to hangup
\`\`\`

## Useful Shortcuts

\`\`\`bash
Ctrl+C      # Kill current command
Ctrl+Z      # Suspend current command
Ctrl+D      # Exit shell / EOF
Ctrl+L      # Clear screen (same as clear)
Ctrl+R      # Search command history
!!          # Repeat last command
!nginx      # Repeat last command starting with nginx
Tab         # Autocomplete
Tab Tab     # Show all completions
\`\`\`

## Shell History

\`\`\`bash
history             # Show command history
history | grep git  # Search history
!500                # Run command 500 from history
\`\`\``,

  fr: `# Maîtrise du Shell et Terminal

Le shell est votre outil le plus puissant sous Linux. Le maîtriser signifie maîtriser Linux. Le shell par défaut sur la plupart des systèmes Linux est **bash** (Bourne Again Shell).

## Qu'est-ce qu'un shell ?

Un shell est un interpréteur de commandes — il lit vos commandes, les interprète et les exécute. Il se situe entre vous et le noyau.

\`\`\`
Vous → Shell (bash) → Noyau → Matériel
\`\`\`

## Commandes de base

\`\`\`bash
# Navigation
pwd                     # Où suis-je ?
ls -la                  # Lister tous les fichiers avec détails
cd /chemin/vers/dir     # Changer de répertoire
cd ..                   # Monter d'un niveau
cd ~                    # Aller au répertoire personnel

# Fichiers
cat fichier.txt         # Afficher le fichier
echo "bonjour" > fichier.txt  # Écrire dans un fichier (écraser)
echo "bonjour" >> fichier.txt # Ajouter au fichier
cp source dest          # Copier
mv source dest          # Déplacer/renommer
rm -rf dir/             # Supprimer un répertoire

# Infos système
whoami                  # Utilisateur courant
hostname                # Nom de la machine
uptime                  # Temps de fonctionnement
date                    # Date/heure courante
uname -a                # Infos noyau
\`\`\`

## Pipes et redirections

Les pipes sont l'une des fonctionnalités les plus puissantes du shell — elles connectent les commandes entre elles.

\`\`\`bash
# Rediriger la sortie d'une commande vers une autre
ls -la | grep ".txt"        # Lister uniquement les fichiers .txt
ps aux | grep nginx          # Trouver le processus nginx
cat /var/log/syslog | tail -100 | grep error

# Redirection
commande > fichier.txt           # Écrire stdout dans un fichier
commande >> fichier.txt          # Ajouter stdout au fichier
commande 2> erreur.txt           # Écrire stderr dans un fichier
commande > fichier.txt 2>&1      # Écrire stdout et stderr
commande < entree.txt            # Lire stdin depuis un fichier

# /dev/null
commande > /dev/null 2>&1        # Jeter toute la sortie
\`\`\`

## Traitement de texte

\`\`\`bash
# grep — rechercher du texte
grep "erreur" /var/log/syslog         # Trouver les lignes avec "erreur"
grep -i "erreur" fichier.txt          # Insensible à la casse
grep -r "TODO" /home/alice/           # Recherche récursive
grep -n "erreur" fichier.txt          # Afficher les numéros de ligne
grep -v "debug" fichier.txt           # Exclure les lignes avec "debug"

# sed — éditeur de flux
sed 's/ancien/nouveau/g' fichier.txt  # Remplacer toutes les occurrences
sed -i 's/ancien/nouveau/g' fichier.txt  # Remplacer dans le fichier
sed '/pattern/d' fichier.txt          # Supprimer les lignes correspondantes
sed -n '10,20p' fichier.txt           # Afficher les lignes 10-20

# awk — traitement de texte
awk '{print $1}' fichier.txt          # Afficher la première colonne
awk -F: '{print $1}' /etc/passwd      # Afficher les noms d'utilisateurs
awk '{sum += $1} END {print sum}'     # Sommer la première colonne

# sort et uniq
sort fichier.txt                      # Trier alphabétiquement
sort -n fichier.txt                   # Trier numériquement
sort -r fichier.txt                   # Tri inverse
sort fichier.txt | uniq               # Supprimer les doublons
sort fichier.txt | uniq -c            # Compter les doublons

# wc — compter les mots
wc -l fichier.txt                     # Compter les lignes
wc -w fichier.txt                     # Compter les mots
wc -c fichier.txt                     # Compter les octets
\`\`\`

## Variables et scripts

\`\`\`bash
# Variables
NOM="Alice"
echo $NOM
echo "Bonjour, $NOM !"

# Variables d'environnement
export PATH=$PATH:/nouveau/bin
echo $HOME
echo $USER
echo $PATH

# Substitution de commande
DATE=$(date)
FICHIERS=$(ls | wc -l)
echo "Aujourd'hui c'est $DATE, il y a $FICHIERS fichiers"

# Script simple
#!/bin/bash
echo "Démarrage de la sauvegarde..."
tar -czf /sauvegarde/home-$(date +%Y%m%d).tar.gz /home/
echo "Sauvegarde terminée !"
\`\`\`

## Gestion des processus

\`\`\`bash
ps aux                  # Lister tous les processus
ps aux | grep nginx     # Trouver un processus spécifique
top                     # Visionneur de processus interactif
htop                    # Meilleur visionneur interactif
kill PID                # Envoyer SIGTERM (arrêt gracieux)
kill -9 PID             # Envoyer SIGKILL (forcer l'arrêt)
killall nginx           # Tuer tous les processus nginx

# Tâches en arrière-plan
commande &              # Exécuter en arrière-plan
jobs                    # Lister les tâches en arrière-plan
fg %1                   # Ramener la tâche 1 au premier plan
bg %1                   # Envoyer la tâche 1 en arrière-plan
nohup commande &        # Exécuter immunisé contre la déconnexion
\`\`\`

## Raccourcis utiles

\`\`\`bash
Ctrl+C      # Tuer la commande courante
Ctrl+Z      # Suspendre la commande courante
Ctrl+D      # Quitter le shell / EOF
Ctrl+L      # Effacer l'écran (même que clear)
Ctrl+R      # Rechercher dans l'historique
!!          # Répéter la dernière commande
!nginx      # Répéter la dernière commande commençant par nginx
Tab         # Autocomplétion
Tab Tab     # Afficher toutes les complétions
\`\`\`

## Historique du shell

\`\`\`bash
history             # Afficher l'historique des commandes
history | grep git  # Rechercher dans l'historique
!500                # Exécuter la commande 500 de l'historique
\`\`\``,
};

export const quiz = {
  en: [
    {
      question: "What does the pipe operator (|) do?",
      options: [
        "Redirects output to a file",
        "Connects the output of one command to the input of another",
        "Runs commands in parallel",
        "Creates a new process",
      ],
      correct: 1,
    },
    {
      question: "Which command searches for text patterns in files?",
      options: ["sed", "awk", "grep", "find"],
      correct: 2,
    },
    {
      question: "What does Ctrl+C do in the terminal?",
      options: [
        "Copies selected text",
        "Clears the screen",
        "Kills the current running command",
        "Exits the shell",
      ],
      correct: 2,
    },
    {
      question: "What does >> do?",
      options: [
        "Overwrites a file",
        "Appends output to a file",
        "Reads from a file",
        "Redirects stderr",
      ],
      correct: 1,
    },
    {
      question: "Which command replaces text in a file?",
      options: ["grep", "awk", "sed", "tr"],
      correct: 2,
    },
  ],
  fr: [
    {
      question: "Que fait l'opérateur pipe (|) ?",
      options: [
        "Redirige la sortie vers un fichier",
        "Connecte la sortie d'une commande à l'entrée d'une autre",
        "Exécute des commandes en parallèle",
        "Crée un nouveau processus",
      ],
      correct: 1,
    },
    {
      question:
        "Quelle commande recherche des motifs de texte dans les fichiers ?",
      options: ["sed", "awk", "grep", "find"],
      correct: 2,
    },
    {
      question: "Que fait Ctrl+C dans le terminal ?",
      options: [
        "Copie le texte sélectionné",
        "Efface l'écran",
        "Tue la commande en cours d'exécution",
        "Quitte le shell",
      ],
      correct: 2,
    },
    {
      question: "Que fait >> ?",
      options: [
        "Écrase un fichier",
        "Ajoute la sortie à un fichier",
        "Lit depuis un fichier",
        "Redirige stderr",
      ],
      correct: 1,
    },
    {
      question: "Quelle commande remplace du texte dans un fichier ?",
      options: ["grep", "awk", "sed", "tr"],
      correct: 2,
    },
  ],
};
