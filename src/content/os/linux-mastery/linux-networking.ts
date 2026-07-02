export const content = {
  en: `# Networking

Networking is one of the most important skills for Linux administration. Whether you are managing servers, troubleshooting connectivity, or securing systems, understanding Linux networking is essential.

## Network Interfaces

\`\`\`bash
# List network interfaces
ip link show
ip addr show
ifconfig                    # Old command (still common)

# Specific interface
ip addr show eth0
ip addr show lo             # Loopback interface

# Output explained:
# 2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP>
#     link/ether 00:11:22:33:44:55 brd ff:ff:ff:ff:ff:ff
#     inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0
\`\`\`

## IP Addresses and Routing

\`\`\`bash
# Show IP addresses
ip addr show
hostname -I                 # Just the IP addresses

# Show routing table
ip route show
route -n                    # Old command

# Add/remove IP address
sudo ip addr add 192.168.1.200/24 dev eth0
sudo ip addr del 192.168.1.200/24 dev eth0

# Add/remove route
sudo ip route add 10.0.0.0/8 via 192.168.1.1
sudo ip route del 10.0.0.0/8

# Default gateway
sudo ip route add default via 192.168.1.1
\`\`\`

## DNS

\`\`\`bash
# DNS configuration
cat /etc/resolv.conf        # DNS servers
cat /etc/hosts              # Local hostname mappings

# DNS lookup
nslookup google.com
dig google.com
dig google.com MX           # Mail records
dig @8.8.8.8 google.com     # Use specific DNS server
host google.com             # Simple lookup

# Test connectivity
ping google.com             # ICMP ping
ping -c 4 google.com        # 4 pings only
traceroute google.com       # Trace network path
tracepath google.com        # Similar to traceroute
mtr google.com              # Combined ping + traceroute
\`\`\`

## Ports and Connections

\`\`\`bash
# Show open ports and connections
ss -tulpn                   # TCP/UDP listening ports
ss -s                       # Summary
netstat -tulpn              # Old command
lsof -i                     # All network connections
lsof -i :80                 # Who is using port 80
lsof -i tcp                 # TCP connections only

# Check if port is open
nc -zv google.com 80        # Test TCP connection
nc -zv google.com 443       # Test HTTPS
curl -v https://google.com  # HTTP request with verbose
\`\`\`

## SSH — Secure Shell

\`\`\`bash
# Connect to remote server
ssh user@192.168.1.100
ssh -p 2222 user@server     # Custom port
ssh -i key.pem user@server  # With private key

# SSH key management
ssh-keygen -t ed25519       # Generate key pair
ssh-keygen -t rsa -b 4096   # RSA key
cat ~/.ssh/id_ed25519.pub   # Your public key

# Copy public key to server
ssh-copy-id user@server
# Or manually:
cat ~/.ssh/id_ed25519.pub | ssh user@server "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# SSH config file
cat ~/.ssh/config
# Host myserver
#     HostName 192.168.1.100
#     User alice
#     Port 2222
#     IdentityFile ~/.ssh/id_ed25519

ssh myserver                # Now connect with alias

# SCP — secure copy
scp file.txt user@server:/path/
scp user@server:/path/file.txt .
scp -r directory/ user@server:/path/

# rsync — better than scp for directories
rsync -avz directory/ user@server:/path/
rsync -avz --delete source/ dest/  # Mirror
\`\`\`

## Firewall — iptables and ufw

\`\`\`bash
# UFW (Uncomplicated Firewall) — Ubuntu default
sudo ufw status             # Check status
sudo ufw enable             # Enable firewall
sudo ufw disable            # Disable firewall

sudo ufw allow 80/tcp       # Allow HTTP
sudo ufw allow 443/tcp      # Allow HTTPS
sudo ufw allow 22/tcp       # Allow SSH
sudo ufw allow 8080         # Allow port 8080
sudo ufw deny 3306          # Block MySQL port
sudo ufw delete allow 80/tcp # Remove rule

sudo ufw allow from 192.168.1.0/24   # Allow subnet
sudo ufw allow from 10.0.0.1 to any port 22  # Allow specific IP to SSH

# iptables (lower level)
sudo iptables -L            # List rules
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT  # Allow HTTP
sudo iptables -A INPUT -j DROP  # Drop all other input
\`\`\`

## Network Configuration Files

\`\`\`bash
# Ubuntu/Debian — Netplan
cat /etc/netplan/00-installer-config.yaml

# Example netplan config:
# network:
#   version: 2
#   ethernets:
#     eth0:
#       dhcp4: true
#   wifis:
#     wlan0:
#       dhcp4: true
#       access-points:
#         "MyWiFi":
#           password: "secret"

sudo netplan apply          # Apply network config

# Check network service
systemctl status NetworkManager
systemctl status systemd-networkd
\`\`\`

## Troubleshooting

\`\`\`bash
# Is the interface up?
ip link show eth0

# Do I have an IP?
ip addr show eth0

# Can I reach the gateway?
ping $(ip route | grep default | awk '{print $3}')

# Can I reach DNS?
ping 8.8.8.8

# Can I resolve names?
nslookup google.com

# Is the service listening?
ss -tulpn | grep :80

# Packet capture
sudo tcpdump -i eth0
sudo tcpdump -i eth0 port 80
sudo tcpdump -i eth0 -w capture.pcap
\`\`\``,

  fr: `# Réseau

Le réseau est l'une des compétences les plus importantes pour l'administration Linux. Que vous gériez des serveurs, déboguiez la connectivité ou sécurisiez des systèmes, comprendre le réseau Linux est essentiel.

## Interfaces réseau

\`\`\`bash
# Lister les interfaces réseau
ip link show
ip addr show
ifconfig                    # Ancienne commande (encore courante)

# Interface spécifique
ip addr show eth0
ip addr show lo             # Interface de bouclage

# Sortie expliquée :
# 2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP>
#     link/ether 00:11:22:33:44:55 brd ff:ff:ff:ff:ff:ff
#     inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0
\`\`\`

## Adresses IP et routage

\`\`\`bash
# Afficher les adresses IP
ip addr show
hostname -I                 # Juste les adresses IP

# Afficher la table de routage
ip route show
route -n                    # Ancienne commande

# Ajouter/supprimer une adresse IP
sudo ip addr add 192.168.1.200/24 dev eth0
sudo ip addr del 192.168.1.200/24 dev eth0

# Ajouter/supprimer une route
sudo ip route add 10.0.0.0/8 via 192.168.1.1
sudo ip route del 10.0.0.0/8

# Passerelle par défaut
sudo ip route add default via 192.168.1.1
\`\`\`

## DNS

\`\`\`bash
# Configuration DNS
cat /etc/resolv.conf        # Serveurs DNS
cat /etc/hosts              # Correspondances locales

# Résolution DNS
nslookup google.com
dig google.com
dig google.com MX           # Enregistrements mail
dig @8.8.8.8 google.com     # Utiliser un DNS spécifique
host google.com             # Résolution simple

# Tester la connectivité
ping google.com             # Ping ICMP
ping -c 4 google.com        # 4 pings seulement
traceroute google.com       # Tracer le chemin réseau
tracepath google.com        # Similaire à traceroute
mtr google.com              # Ping + traceroute combinés
\`\`\`

## Ports et connexions

\`\`\`bash
# Afficher les ports ouverts et connexions
ss -tulpn                   # Ports TCP/UDP en écoute
ss -s                       # Résumé
netstat -tulpn              # Ancienne commande
lsof -i                     # Toutes les connexions réseau
lsof -i :80                 # Qui utilise le port 80
lsof -i tcp                 # Connexions TCP uniquement

# Vérifier si un port est ouvert
nc -zv google.com 80        # Tester connexion TCP
nc -zv google.com 443       # Tester HTTPS
curl -v https://google.com  # Requête HTTP verbose
\`\`\`

## SSH — Shell sécurisé

\`\`\`bash
# Se connecter à un serveur distant
ssh utilisateur@192.168.1.100
ssh -p 2222 utilisateur@serveur    # Port personnalisé
ssh -i cle.pem utilisateur@serveur # Avec clé privée

# Gestion des clés SSH
ssh-keygen -t ed25519       # Générer une paire de clés
ssh-keygen -t rsa -b 4096   # Clé RSA
cat ~/.ssh/id_ed25519.pub   # Votre clé publique

# Copier la clé publique sur le serveur
ssh-copy-id utilisateur@serveur

# Fichier de config SSH
cat ~/.ssh/config
# Host monserveur
#     HostName 192.168.1.100
#     User alice
#     Port 2222
#     IdentityFile ~/.ssh/id_ed25519

ssh monserveur              # Se connecter avec l'alias

# SCP — copie sécurisée
scp fichier.txt utilisateur@serveur:/chemin/
scp utilisateur@serveur:/chemin/fichier.txt .
scp -r repertoire/ utilisateur@serveur:/chemin/

# rsync — meilleur que scp pour les répertoires
rsync -avz repertoire/ utilisateur@serveur:/chemin/
rsync -avz --delete source/ dest/  # Miroir
\`\`\`

## Pare-feu — iptables et ufw

\`\`\`bash
# UFW (Pare-feu simplifié) — défaut Ubuntu
sudo ufw status             # Vérifier l'état
sudo ufw enable             # Activer le pare-feu
sudo ufw disable            # Désactiver le pare-feu

sudo ufw allow 80/tcp       # Autoriser HTTP
sudo ufw allow 443/tcp      # Autoriser HTTPS
sudo ufw allow 22/tcp       # Autoriser SSH
sudo ufw allow 8080         # Autoriser port 8080
sudo ufw deny 3306          # Bloquer MySQL
sudo ufw delete allow 80/tcp # Supprimer la règle

sudo ufw allow from 192.168.1.0/24   # Autoriser sous-réseau
sudo ufw allow from 10.0.0.1 to any port 22  # IP spécifique vers SSH

# iptables (niveau inférieur)
sudo iptables -L            # Lister les règles
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT  # Autoriser HTTP
sudo iptables -A INPUT -j DROP  # Bloquer tout autre trafic entrant
\`\`\`

## Fichiers de configuration réseau

\`\`\`bash
# Ubuntu/Debian — Netplan
cat /etc/netplan/00-installer-config.yaml

# Exemple de config netplan :
# network:
#   version: 2
#   ethernets:
#     eth0:
#       dhcp4: true
#   wifis:
#     wlan0:
#       dhcp4: true
#       access-points:
#         "MonWiFi":
#           password: "secret"

sudo netplan apply          # Appliquer la config réseau

# Vérifier le service réseau
systemctl status NetworkManager
systemctl status systemd-networkd
\`\`\`

## Dépannage

\`\`\`bash
# L'interface est-elle active ?
ip link show eth0

# Ai-je une adresse IP ?
ip addr show eth0

# Puis-je atteindre la passerelle ?
ping $(ip route | grep default | awk '{print $3}')

# Puis-je atteindre le DNS ?
ping 8.8.8.8

# Puis-je résoudre les noms ?
nslookup google.com

# Le service est-il en écoute ?
ss -tulpn | grep :80

# Capture de paquets
sudo tcpdump -i eth0
sudo tcpdump -i eth0 port 80
sudo tcpdump -i eth0 -w capture.pcap
\`\`\``,
};

export const quiz = {
  en: [
    {
      question: "Which command shows all open ports and listening services?",
      options: ["ps aux", "ss -tulpn", "lsof -p", "ip addr show"],
      correct: 1,
    },
    {
      question: "What does ssh-copy-id do?",
      options: [
        "Copies files securely",
        "Copies your public SSH key to a remote server",
        "Creates a new SSH key pair",
        "Copies SSH config files",
      ],
      correct: 1,
    },
    {
      question: "Which command traces the network path to a destination?",
      options: ["ping", "nslookup", "traceroute", "netstat"],
      correct: 2,
    },
    {
      question: "What does ufw allow 22/tcp do?",
      options: [
        "Blocks SSH access",
        "Allows SSH connections on port 22",
        "Opens all TCP ports",
        "Enables the firewall",
      ],
      correct: 1,
    },
    {
      question: "Where is DNS server configuration stored on Linux?",
      options: [
        "/etc/hosts",
        "/etc/network",
        "/etc/resolv.conf",
        "/etc/dns.conf",
      ],
      correct: 2,
    },
  ],
  fr: [
    {
      question:
        "Quelle commande affiche tous les ports ouverts et services en écoute ?",
      options: ["ps aux", "ss -tulpn", "lsof -p", "ip addr show"],
      correct: 1,
    },
    {
      question: "Que fait ssh-copy-id ?",
      options: [
        "Copie des fichiers de manière sécurisée",
        "Copie votre clé SSH publique sur un serveur distant",
        "Crée une nouvelle paire de clés SSH",
        "Copie les fichiers de config SSH",
      ],
      correct: 1,
    },
    {
      question: "Quelle commande trace le chemin réseau vers une destination ?",
      options: ["ping", "nslookup", "traceroute", "netstat"],
      correct: 2,
    },
    {
      question: "Que fait ufw allow 22/tcp ?",
      options: [
        "Bloque l'accès SSH",
        "Autorise les connexions SSH sur le port 22",
        "Ouvre tous les ports TCP",
        "Active le pare-feu",
      ],
      correct: 1,
    },
    {
      question: "Où est stockée la configuration du serveur DNS sous Linux ?",
      options: [
        "/etc/hosts",
        "/etc/network",
        "/etc/resolv.conf",
        "/etc/dns.conf",
      ],
      correct: 2,
    },
  ],
};
