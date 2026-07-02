export const content = {
  en: `# Terminal & zsh Mastery

macOS ships with **zsh** (Z Shell) as the default shell since macOS Catalina (2019), replacing bash. zsh is a superset of bash with powerful features that make daily terminal work significantly faster.

## zsh Configuration (~/.zshrc)

\`\`\`zsh
# ~/.zshrc — loaded for every interactive shell

HISTSIZE=50000
SAVEHIST=50000
HISTFILE=~/.zsh_history

setopt SHARE_HISTORY
setopt HIST_IGNORE_DUPS
setopt HIST_IGNORE_SPACE
setopt EXTENDED_HISTORY

autoload -Uz compinit && compinit

alias ls='ls -G'
alias ll='ls -la'

mkcd() {
  mkdir -p "$1" && cd "$1"
}
\`\`\`

## Oh My Zsh

\`\`\`bash
# Install Oh My Zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

plugins=(
  git
  macos
  docker
  kubectl
  zsh-autosuggestions
  zsh-syntax-highlighting
)
\`\`\`

\`\`\`bash
# Install zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-autosuggestions \\
  \${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

# Install zsh-syntax-highlighting
git clone https://github.com/zsh-users/zsh-syntax-highlighting \\
  \${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
\`\`\`

## macOS Terminal Commands

\`\`\`bash
open .
open file.pdf
open https://google.com

cat file.txt | pbcopy
pbpaste

say "Build complete"

caffeinate
caffeinate -t 3600

mdfind "report.pdf"
\`\`\`

## System Commands

\`\`\`bash
sw_vers
system_profiler SPHardwareDataType
sysctl hw.model
sysctl hw.memsize

top -l 1 -o cpu
ps aux
lsof -i :8080
\`\`\`

## zsh Advanced Features

\`\`\`zsh
setopt EXTENDED_GLOB

ls **/*.ts
ls **/*.{js,ts}
rm **/.DS_Store

ls *(.)
ls *(/)
ls *(x)
\`\`\`

## zsh Functions

\`\`\`zsh
appversion() {
    local app=$1
    defaults read "/Applications/\${app}.app/Contents/Info" CFBundleShortVersionString
}

serve() {
    local port=\${1:-8000}
    python3 -m http.server $port
}

killport() {
    lsof -ti :$1 | xargs kill -9
}
\`\`\`

## defaults Command

\`\`\`bash
defaults read com.apple.finder AppleShowAllFiles

defaults write com.apple.finder AppleShowAllFiles -bool true

defaults delete com.apple.dock autohide-delay

killall Finder
killall Dock
\`\`\`

## SSH on macOS

\`\`\`bash
sudo systemsetup -setremotelogin on

cat > ~/.ssh/config << 'EOF'
Host myserver
    HostName 192.168.1.100
    User alice
    Port 22
    IdentityFile ~/.ssh/id_ed25519
EOF

ssh-add --apple-use-keychain ~/.ssh/id_ed25519
\`\`\`
`,

  fr: `# Maîtrise du Terminal et zsh

macOS utilise **zsh** comme shell par défaut depuis Catalina.

## Configuration zsh

\`\`\`zsh
HISTSIZE=50000
SAVEHIST=50000
HISTFILE=~/.zsh_history

setopt SHARE_HISTORY
setopt HIST_IGNORE_DUPS

alias ls='ls -G'
alias ll='ls -la'
\`\`\`

## Oh My Zsh

\`\`\`bash
plugins=(
  git
  macos
  docker
)
\`\`\`

\`\`\`bash
git clone https://github.com/zsh-users/zsh-autosuggestions \\
  \${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
\`\`\`

## Commandes macOS

\`\`\`bash
open .
pbcopy
pbpaste
say "Bonjour"
caffeinate
\`\`\`

## SSH

\`\`\`bash
sudo systemsetup -setremotelogin on
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
\`\`\`
`,
};

export const quiz = {
  en: [
    {
      question:
        "What shell replaced bash as the default on macOS Catalina and later?",
      options: ["fish", "dash", "zsh", "ksh"],
      correct: 2,
    },
    {
      question: "What does pbcopy do?",
      options: [
        "Copies files",
        "Pastes clipboard",
        "Copies stdin to clipboard",
        "Creates backups",
      ],
      correct: 2,
    },
    {
      question: "What does caffeinate do?",
      options: ["Speeds CPU", "Prevents sleep", "Manages RAM", "Controls fans"],
      correct: 1,
    },
  ],

  fr: [
    {
      question:
        "Quel shell a remplacé bash comme shell par défaut sur macOS Catalina ?",
      options: ["fish", "dash", "zsh", "ksh"],
      correct: 2,
    },
    {
      question: "Que fait pbcopy ?",
      options: [
        "Copie des fichiers",
        "Colle le presse-papiers",
        "Copie stdin vers le presse-papiers",
        "Crée des sauvegardes",
      ],
      correct: 2,
    },
    {
      question: "Que fait caffeinate ?",
      options: [
        "Accélère le CPU",
        "Empêche la veille",
        "Gère la RAM",
        "Contrôle les ventilateurs",
      ],
      correct: 1,
    },
  ],
};
