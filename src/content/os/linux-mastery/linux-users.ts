export const content = {
  en: `# Users & Permissions

Linux is a multi-user system. Every file, process, and resource has an owner. Understanding users and permissions is essential for security and system administration.

## User Types

**Root (superuser)**: UID 0. Has unrestricted access to everything. Never use root for daily tasks.

**Regular users**: UID 1000+. Limited access. Your normal account.

**System users**: UID 1-999. Created for services (www-data for nginx, mysql for MySQL). Cannot log in.

\`\`\`bash
whoami              # Current user
id                  # UID, GID and groups
id alice            # Info about user alice
cat /etc/passwd     # All user accounts
cat /etc/shadow     # Encrypted passwords (root only)
cat /etc/group      # All groups
\`\`\`

## /etc/passwd Format

\`\`\`
username:password:UID:GID:comment:home:shell
alice:x:1000:1000:Alice Smith:/home/alice:/bin/bash
\`\`\`
- \`x\` means password is in /etc/shadow
- UID 1000 = first regular user
- Shell = /bin/bash (or /bin/false for system users)

## Managing Users

\`\`\`bash
# Create users
useradd alice                       # Create user
useradd -m -s /bin/bash alice       # With home dir and bash shell
useradd -m -G sudo,docker alice     # Add to groups

# Set password
passwd alice                        # Set alice's password
passwd                              # Change your own password

# Modify users
usermod -aG docker alice            # Add alice to docker group
usermod -s /bin/zsh alice           # Change shell
usermod -l newname alice            # Rename user

# Delete users
userdel alice                       # Delete user
userdel -r alice                    # Delete user and home directory

# Switch users
su alice                            # Switch to alice (need password)
su -                                # Switch to root
sudo command                        # Run command as root
sudo -i                             # Interactive root shell
sudo -u alice command               # Run as alice
\`\`\`

## Groups

Groups allow multiple users to share access to files and resources.

\`\`\`bash
groups                          # Your groups
groups alice                    # Alice's groups
groupadd developers             # Create group
groupdel developers             # Delete group
gpasswd -a alice developers     # Add alice to developers
gpasswd -d alice developers     # Remove alice from developers
\`\`\`

## File Permissions

Every file has three permission sets:
- **Owner** (u): The user who owns the file
- **Group** (g): The group that owns the file
- **Others** (o): Everyone else

Each set has three permissions:
- **r** (read) = 4
- **w** (write) = 2
- **x** (execute) = 1

\`\`\`bash
ls -la
# -rwxr-xr-- 1 alice developers 4096 May 1 script.sh
#  ^^^       = owner permissions (rwx = 7)
#     ^^^    = group permissions (r-x = 5)
#        ^^^ = others permissions (r-- = 4)
\`\`\`

## chmod — Change Permissions

\`\`\`bash
# Numeric mode
chmod 755 script.sh     # rwxr-xr-x — owner full, group/others read+execute
chmod 644 file.txt      # rw-r--r-- — owner read+write, others read only
chmod 600 private.key   # rw------- — owner only
chmod 777 file.txt      # rwxrwxrwx — everyone full (dangerous!)
chmod 000 file.txt      # ---------- — no permissions

# Symbolic mode
chmod u+x script.sh     # Add execute for owner
chmod g-w file.txt      # Remove write for group
chmod o+r file.txt      # Add read for others
chmod a+x script.sh     # Add execute for all
chmod u=rwx,g=rx,o=r file.txt  # Set exact permissions

# Recursive
chmod -R 755 directory/ # Apply to all files in directory
\`\`\`

## chown — Change Ownership

\`\`\`bash
chown alice file.txt            # Change owner to alice
chown alice:developers file.txt # Change owner and group
chown :developers file.txt      # Change group only
chown -R alice:alice directory/ # Recursive
\`\`\`

## Special Permissions

\`\`\`bash
# SUID (Set User ID) — run as file owner
chmod u+s /usr/bin/passwd   # passwd runs as root regardless of who runs it
ls -la /usr/bin/passwd      # Shows -rwsr-xr-x (s = SUID)

# SGID (Set Group ID) — run as file group
chmod g+s directory/        # New files inherit group

# Sticky bit — only owner can delete
chmod +t /tmp               # Only file owner can delete their files
ls -la /tmp                 # Shows drwxrwxrwt (t = sticky)
\`\`\`

## sudo Configuration

\`\`\`bash
visudo                          # Edit /etc/sudoers safely

# Common sudoers entries:
alice ALL=(ALL:ALL) ALL         # Alice can run any command as root
alice ALL=(ALL) NOPASSWD: ALL   # Without password
%developers ALL=(ALL) /bin/apt  # Group can run apt
\`\`\``,

  fr: `# Utilisateurs et permissions

Linux est un système multi-utilisateurs. Chaque fichier, processus et ressource a un propriétaire. Comprendre les utilisateurs et les permissions est essentiel pour la sécurité et l'administration système.

## Types d'utilisateurs

**Root (superutilisateur)** : UID 0. A un accès illimité à tout. N'utilisez jamais root pour les tâches quotidiennes.

**Utilisateurs réguliers** : UID 1000+. Accès limité. Votre compte normal.

**Utilisateurs système** : UID 1-999. Créés pour les services (www-data pour nginx, mysql pour MySQL). Ne peuvent pas se connecter.

\`\`\`bash
whoami              # Utilisateur courant
id                  # UID, GID et groupes
id alice            # Infos sur l'utilisateur alice
cat /etc/passwd     # Tous les comptes utilisateurs
cat /etc/shadow     # Mots de passe chiffrés (root uniquement)
cat /etc/group      # Tous les groupes
\`\`\`

## Format de /etc/passwd

\`\`\`
nom:motdepasse:UID:GID:commentaire:home:shell
alice:x:1000:1000:Alice Smith:/home/alice:/bin/bash
\`\`\`
- \`x\` signifie que le mot de passe est dans /etc/shadow
- UID 1000 = premier utilisateur régulier
- Shell = /bin/bash (ou /bin/false pour les utilisateurs système)

## Gestion des utilisateurs

\`\`\`bash
# Créer des utilisateurs
useradd alice                       # Créer un utilisateur
useradd -m -s /bin/bash alice       # Avec répertoire personnel et bash
useradd -m -G sudo,docker alice     # Ajouter aux groupes

# Définir le mot de passe
passwd alice                        # Définir le mot de passe d'alice
passwd                              # Changer votre propre mot de passe

# Modifier les utilisateurs
usermod -aG docker alice            # Ajouter alice au groupe docker
usermod -s /bin/zsh alice           # Changer le shell
usermod -l nouveaunom alice         # Renommer l'utilisateur

# Supprimer des utilisateurs
userdel alice                       # Supprimer l'utilisateur
userdel -r alice                    # Supprimer l'utilisateur et son répertoire

# Changer d'utilisateur
su alice                            # Passer à alice (mot de passe requis)
su -                                # Passer à root
sudo commande                       # Exécuter une commande en tant que root
sudo -i                             # Shell root interactif
sudo -u alice commande              # Exécuter en tant qu'alice
\`\`\`

## Groupes

Les groupes permettent à plusieurs utilisateurs de partager l'accès aux fichiers et ressources.

\`\`\`bash
groups                          # Vos groupes
groups alice                    # Groupes d'alice
groupadd developpeurs           # Créer un groupe
groupdel developpeurs           # Supprimer un groupe
gpasswd -a alice developpeurs   # Ajouter alice aux développeurs
gpasswd -d alice developpeurs   # Retirer alice des développeurs
\`\`\`

## Permissions des fichiers

Chaque fichier a trois ensembles de permissions :
- **Propriétaire** (u) : L'utilisateur qui possède le fichier
- **Groupe** (g) : Le groupe qui possède le fichier
- **Autres** (o) : Tout le monde

Chaque ensemble a trois permissions :
- **r** (lecture) = 4
- **w** (écriture) = 2
- **x** (exécution) = 1

\`\`\`bash
ls -la
# -rwxr-xr-- 1 alice developpeurs 4096 1 mai script.sh
#  ^^^       = permissions propriétaire (rwx = 7)
#     ^^^    = permissions groupe (r-x = 5)
#        ^^^ = permissions autres (r-- = 4)
\`\`\`

## chmod — Changer les permissions

\`\`\`bash
# Mode numérique
chmod 755 script.sh     # rwxr-xr-x — propriétaire complet, groupe/autres lecture+exécution
chmod 644 fichier.txt   # rw-r--r-- — propriétaire lecture+écriture, autres lecture seule
chmod 600 prive.key     # rw------- — propriétaire uniquement
chmod 777 fichier.txt   # rwxrwxrwx — tout le monde complet (dangereux !)
chmod 000 fichier.txt   # ---------- — aucune permission

# Mode symbolique
chmod u+x script.sh     # Ajouter exécution pour le propriétaire
chmod g-w fichier.txt   # Retirer écriture pour le groupe
chmod o+r fichier.txt   # Ajouter lecture pour les autres
chmod a+x script.sh     # Ajouter exécution pour tous

# Récursif
chmod -R 755 repertoire/ # Appliquer à tous les fichiers
\`\`\`

## chown — Changer le propriétaire

\`\`\`bash
chown alice fichier.txt               # Changer le propriétaire en alice
chown alice:developpeurs fichier.txt  # Changer propriétaire et groupe
chown :developpeurs fichier.txt       # Changer le groupe uniquement
chown -R alice:alice repertoire/      # Récursif
\`\`\`

## Permissions spéciales

\`\`\`bash
# SUID — exécuter en tant que propriétaire du fichier
chmod u+s /usr/bin/passwd   # passwd s'exécute en tant que root
ls -la /usr/bin/passwd      # Affiche -rwsr-xr-x (s = SUID)

# SGID — exécuter en tant que groupe du fichier
chmod g+s repertoire/       # Les nouveaux fichiers héritent du groupe

# Sticky bit — seul le propriétaire peut supprimer
chmod +t /tmp               # Seul le propriétaire peut supprimer ses fichiers
ls -la /tmp                 # Affiche drwxrwxrwt (t = sticky)
\`\`\`

## Configuration sudo

\`\`\`bash
visudo                          # Éditer /etc/sudoers en toute sécurité

# Entrées sudoers courantes :
alice ALL=(ALL:ALL) ALL         # Alice peut exécuter toute commande en root
alice ALL=(ALL) NOPASSWD: ALL   # Sans mot de passe
%developpeurs ALL=(ALL) /bin/apt # Le groupe peut exécuter apt
\`\`\``,
};

export const quiz = {
  en: [
    {
      question: "What is the UID of the root user?",
      options: ["1", "0", "1000", "999"],
      correct: 1,
    },
    {
      question: "What does chmod 755 mean?",
      options: [
        "Owner has read only, others have no access",
        "Everyone has full access",
        "Owner has full access, group and others have read and execute",
        "Owner has read and write, others have read only",
      ],
      correct: 2,
    },
    {
      question: "Which command adds a user to a group?",
      options: [
        "useradd -G group user",
        "usermod -aG group user",
        "groupadd user group",
        "addgroup user group",
      ],
      correct: 1,
    },
    {
      question: "What file contains encrypted passwords?",
      options: ["/etc/passwd", "/etc/group", "/etc/shadow", "/etc/security"],
      correct: 2,
    },
    {
      question: "What does the sticky bit do on a directory?",
      options: [
        "Makes the directory read-only",
        "Only the file owner can delete their files",
        "Makes files executable",
        "Gives root access to all users",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question: "Quel est l'UID de l'utilisateur root ?",
      options: ["1", "0", "1000", "999"],
      correct: 1,
    },
    {
      question: "Que signifie chmod 755 ?",
      options: [
        "Le propriétaire a lecture seule, les autres n'ont pas accès",
        "Tout le monde a un accès complet",
        "Le propriétaire a un accès complet, le groupe et les autres ont lecture et exécution",
        "Le propriétaire a lecture et écriture, les autres ont lecture seule",
      ],
      correct: 2,
    },
    {
      question: "Quelle commande ajoute un utilisateur à un groupe ?",
      options: [
        "useradd -G groupe utilisateur",
        "usermod -aG groupe utilisateur",
        "groupadd utilisateur groupe",
        "addgroup utilisateur groupe",
      ],
      correct: 1,
    },
    {
      question: "Quel fichier contient les mots de passe chiffrés ?",
      options: ["/etc/passwd", "/etc/group", "/etc/shadow", "/etc/security"],
      correct: 2,
    },
    {
      question: "Que fait le sticky bit sur un répertoire ?",
      options: [
        "Rend le répertoire en lecture seule",
        "Seul le propriétaire du fichier peut supprimer ses fichiers",
        "Rend les fichiers exécutables",
        "Donne accès root à tous les utilisateurs",
      ],
      correct: 1,
    },
  ],
};
