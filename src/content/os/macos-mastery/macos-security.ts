export const content = {
  en: `# macOS Security — Deep Internals

macOS security is a layered defense system that starts at the silicon level and extends through the kernel, system services, and application runtime. Understanding these internals reveals why macOS security is fundamentally different from other operating systems — and why certain attacks that work elsewhere fail on macOS.

## Code Signing — The Foundation

Every executable on macOS must be signed. This isn't a suggestion — it's enforced by the kernel.

### Code Signature Format

\`\`\`
Mach-O Binary Structure:
┌─────────────────────────────────┐
│  Mach-O Header                  │
├─────────────────────────────────┤
│  Load Commands                  │
│  LC_CODE_SIGNATURE ──────────┐  │
├─────────────────────────────┼──┤
│  __TEXT segment (code)      │  │
├─────────────────────────────┤  │
│  __DATA segment (data)      │  │
├─────────────────────────────┤  │
│  __LINKEDIT segment         │  │
│  ┌──────────────────────────┼──┘
│  │ Code Directory           │
│  │ ├── Version: 0x20400     │
│  │ ├── Flags: runtime, hard │
│  │ ├── Hash type: SHA256    │
│  │ ├── Page size: 4096      │
│  │ ├── Code hashes (per-page)
│  │ │   Hash(page_0)         │
│  │ │   Hash(page_1)         │
│  │ │   ...                  │
│  │ ├── Special hashes:      │
│  │ │   Info.plist hash      │
│  │ │   Resources hash       │
│  │ │   Entitlements hash    │
│  │ └── Scatter (partial sig)│
│  ├── Requirements (CDR)     │
│  │   Designated requirement │
│  │   Library requirement    │
│  ├── Entitlements (plist)   │
│  └── CMS Signature (PKCS#7) │
│      ├── Apple Developer ID │
│      ├── Certificate chain  │
│      └── Signature over all │
└─────────────────────────────┘
\`\`\`

**Why per-page hashing matters**: When the kernel loads a page of code, it verifies the hash BEFORE executing. This means code cannot be modified in memory after signature verification — any modification invalidates the hash.

\`\`\`bash
# Inspect code signature
codesign -dvvv /Applications/Safari.app
# Output includes:
# Executable=/Applications/Safari.app/Contents/MacOS/Safari
# Identifier=com.apple.Safari
# Format=app bundle with Mach-O universal (x86_64 arm64e)
# CodeDirectory v=20400 size=... flags=0x10000(runtime) hashes=...
# Platform identifier=13
# CDHash=abc123...
# Signature size=...
# Authority=Software Signing
# Authority=Apple Code Signing Certification Authority
# Authority=Apple Root CA
# TeamIdentifier=not set (Apple internal)
# Sealed Resources version=2 rules=13 files=...
# Internal requirements count=1 size=...

# Extract entitlements
codesign -d --entitlements :- /Applications/Safari.app
# <?xml version="1.0" encoding="UTF-8"?>
# <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" ...>
# <plist version="1.0">
# <dict>
#   <key>com.apple.security.app-sandbox</key>
#   <true/>
#   <key>com.apple.security.network.client</key>
#   <true/>
# ...

# Verify signature
codesign --verify --verbose=4 /Applications/Safari.app
# /Applications/Safari.app: valid on disk
# /Applications/Safari.app: satisfies its Designated Requirement

# Re-sign an app (requires valid certificate)
codesign -s "Developer ID Application: Your Name" /Applications/MyApp.app
\`\`\`

### Hardened Runtime

Hardened Runtime adds additional restrictions on top of code signing:

\`\`\`
Hardened Runtime enforces:
├── No unsigned code (dlopen, JIT without entitlement)
├── No debugging without entitlement (ptrace forbidden)
├── No library validation bypass
├── No invalid pointer dereferences (pointer authentication codes on arm64e)
├── Heap/stack execution prevention
└── DYLD environment variable restrictions

Enabled by: codesign --options=runtime

Can be relaxed with entitlements (but Apple reviews these):
com.apple.security.cs.allow-jit              # Allow JIT compilation
com.apple.security.cs.allow-unsigned-executable-memory  # Writable+executable pages
com.apple.security.cs.allow-dyld-environment-variables  # DYLD_* vars
com.apple.security.cs.disable-library-validation        # Load any dylib
\`\`\`

### Library Validation

Library Validation ensures that all dylibs loaded come from the same Team ID:

\`\`\`
Without Library Validation:
App (Team ID: ABC123) can load:
└── Any signed dylib from any developer

With Library Validation:
App (Team ID: ABC123) can only load:
├── Dylibs signed by Team ID: ABC123
└── Apple's system libraries

Attack prevented: Code injection via malicious dylib
\`\`\`

\`\`\`bash
# Check if Library Validation is enforced
codesign -dvvv /Applications/MyApp.app 2>&1 | grep "library-validation"
# flags=0x10000(runtime) 0x2000(library-validation)
\`\`\`

## Gatekeeper — The Gatekeeper Trinity

Gatekeeper is actually three systems working together:

\`\`\`
1. Quarantine (quarantined.c — kernel extension)
   Downloads from network → com.apple.quarantine xattr
   ↓
2. Gatekeeper (syspolicyd — daemon)
   First launch → verify signature, check notarization
   ↓
3. XProtect + MRT (XProtect.bundle + MRT.app)
   Signature valid → scan for known malware
\`\`\`

### Quarantine System

\`\`\`bash
# Every file downloaded gets quarantine attribute
# Browsers, Mail, Messages, Safari — all add this

# View quarantine
xattr file.dmg
# com.apple.quarantine

xattr -p com.apple.quarantine file.dmg
# 0083;65a1b2c3;Safari;1A2B3C4D-5E6F-7890-ABCD-EF1234567890

# Format: flags;timestamp;app;UUID
# flags:
#   0002 = quarantined (user must approve)
#   0003 = quarantined (app cannot run at all)
#   0083 = quarantined + downloaded

# Remove quarantine (what "Allow" button does)
xattr -d com.apple.quarantine file.dmg

# Recursively remove quarantine
xattr -dr com.apple.quarantine /Applications/MyApp.app

# System that adds quarantine:
# Kernel extension: /System/Library/Extensions/Quarantine.kext
# On download: browser calls setxattr(path, "com.apple.quarantine", ...)
\`\`\`

### Gatekeeper Assessment

\`\`\`bash
# Gatekeeper assessment (what happens on first launch)
spctl --assess --verbose=4 /Applications/MyApp.app
# /Applications/MyApp.app: accepted
# source=Notarized Developer ID
# origin=Developer ID Application: Company Name (TEAM123)

# Rejection scenarios:
# rejected (the code is valid but does not seem to be an app)
# rejected (no usable signature)
# rejected (notarization required)

# Gatekeeper rules database
# /var/db/SystemPolicy
# SQLite database with allowed/blocked rules

# View Gatekeeper rules
sqlite3 /var/db/SystemPolicy <<< "SELECT * FROM authority;"
# Shows Developer ID certificates that have been allowed

# Disable Gatekeeper (requires SIP disabled — not recommended)
sudo spctl --master-disable

# Check Gatekeeper status
spctl --status
# assessments enabled
\`\`\`

### Notarization

Notarization is Apple's malware scan for apps distributed outside the App Store:

\`\`\`
Notarization Process:
1. Developer uploads app to Apple
   ↓
2. Apple's automated scan:
   ├── Signature valid?
   ├── Hardened Runtime enabled?
   ├── Entitlements reasonable?
   ├── Contains known malware?
   ├── Calls suspicious APIs?
   └── Matches known malware patterns?
   ↓
3. If pass: Apple issues notarization ticket
   Developer staples ticket to app
   ↓
4. User downloads app
   Gatekeeper checks:
   ├── Signature valid
   ├── Notarization ticket present (stapled)
   └── OR query Apple server for ticket (if not stapled)
\`\`\`

\`\`\`bash
# Check notarization
spctl -a -vvv -t install /Applications/MyApp.app
# Notarized status in output

# Or extract ticket directly
stapler validate /Applications/MyApp.app
# Processing: /Applications/MyApp.app
# The validate action worked!

# Notarization ticket is stored as extended attribute:
xattr /Applications/MyApp.app
# com.apple.macl
# com.apple.provenance (notarization ticket)

# Ticket is a signed plist containing:
# - Hash of the app
# - Timestamp of notarization
# - Apple signature

# Staple notarization ticket to app
xcrun stapler staple /Applications/MyApp.app
\`\`\`

## XProtect and MRT

\`\`\`
XProtect.bundle:
├── /System/Library/CoreServices/XProtect.bundle/
├── XProtect.yara    — YARA rules for known malware
└── XProtect.plist   — Plugin blocklist (Flash, Java, etc.)

MRT (Malware Removal Tool):
├── /System/Library/CoreServices/MRT.app
├── Runs daily via launchd
├── Scans for specific malware families
└── Removes if found

Updates:
Both update independently of macOS via:
softwareupdate --list
# XProtect and MRT updates appear separately from OS updates
\`\`\`

\`\`\`bash
# View XProtect version
defaults read /System/Library/CoreServices/XProtect.bundle/Contents/version.plist
# <dict>
#   <key>Version</key>
#   <string>2159</string>
#   <key>BuildVersion</key>
#   <string>1</string>
# </dict>

# XProtect YARA rules
cat /System/Library/CoreServices/XProtect.bundle/Contents/Resources/XProtect.yara
# Contains YARA signatures like:
# rule OSX_Shlayer
# {
#   strings:
#     $a = "FlashPlayer.dmg"
#     $b = "launchctl load"
#   condition:
#     all of them
# }

# Force XProtect update
sudo softwareupdate --install XProtectPlistConfigData
\`\`\`

## TCC — Transparency, Consent, and Control

TCC is the system that prompts "AppName would like to access your Camera/Microphone/Files/Location".

### TCC Database Structure

\`\`\`
TCC databases (SQLite):
/Library/Application Support/com.apple.TCC/TCC.db        (system-wide)
~/Library/Application Support/com.apple.TCC/TCC.db       (per-user)

Schema:
CREATE TABLE access (
    service TEXT NOT NULL,           -- kTCCServiceCamera, kTCCServiceMicrophone, etc.
    client TEXT NOT NULL,            -- Bundle ID: com.apple.Safari
    client_type INTEGER NOT NULL,    -- 0 = bundle ID, 1 = path
    auth_value INTEGER NOT NULL,     -- 0 = denied, 1 = unknown, 2 = allowed, 3 = limited
    auth_reason INTEGER NOT NULL,    -- How permission was granted
    auth_version INTEGER NOT NULL,
    csreq BLOB,                      -- Code signing requirement
    policy_id INTEGER,
    indirect_object_identifier_type INTEGER,
    indirect_object_identifier TEXT,
    indirect_object_code_identity BLOB,
    flags INTEGER,
    last_modified INTEGER NOT NULL,  -- Unix timestamp
    PRIMARY KEY (service, client, client_type, indirect_object_identifier)
);

Protected services:
kTCCServiceCamera              # Camera access
kTCCServiceMicrophone          # Microphone access
kTCCServicePhotos              # Photos library
kTCCServiceContacts            # Contacts
kTCCServiceCalendar            # Calendar
kTCCServiceReminders           # Reminders
kTCCServiceAddressBook         # Address Book
kTCCServiceSystemPolicyAllFiles # Full Disk Access
kTCCServiceAppleEvents         # Automation (control other apps)
kTCCServiceAccessibility       # Accessibility API
kTCCServiceScreenCapture       # Screen recording
kTCCServiceListenEvent         # Input monitoring
kTCCServiceLocation            # Location Services
\`\`\`

\`\`\`bash
# Query TCC database (requires Full Disk Access or SIP disabled)
sudo sqlite3 /Library/Application\ Support/com.apple.TCC/TCC.db \\
  "SELECT service, client, auth_value FROM access WHERE service='kTCCServiceCamera';"
# kTCCServiceCamera|com.zoom.us.ZoomDaemon|2
# kTCCServiceCamera|com.apple.FaceTime|2

# Reset TCC permissions for an app
tccutil reset Camera com.zoom.us.ZoomDaemon
tccutil reset All com.zoom.us.ZoomDaemon  # Reset all permissions

# TCC bypasses (for system apps only):
# Apps in /System/Applications have automatic TCC access
# Apps with specific entitlements can bypass TCC
# com.apple.private.tcc.allow
\`\`\`

### TCC Prompt Architecture

\`\`\`
App requests camera access
    │
    ▼
tccd (TCC daemon) intercepts API call
    │
    ├── Check TCC.db: Does entry exist?
    │   ├── YES → Return cached decision
    │   └── NO  → Continue
    ▼
Display prompt (secure window, can't be automated)
    │
User clicks Allow/Don't Allow
    │
    ▼
tccd writes decision to TCC.db
App receives callback with result
\`\`\`

## App Sandboxing

The App Sandbox is a kernel-level MAC (Mandatory Access Control) system based on FreeBSD's Seatbelt framework.

### Sandbox Profiles

\`\`\`scheme
; Simplified sandbox profile (SBPL — Sandbox Profile Language, a Scheme dialect)
(version 1)
(deny default)  ; Deny everything by default

; Allow reading these directories
(allow file-read*
    (subpath "/System/Library")
    (subpath "/usr/lib")
    (subpath "/private/var/db/timezone"))

; Allow network access
(allow network-outbound)
(allow network-inbound (local ip))

; Allow writing to container
(allow file-write*
    (subpath (param "HOME_DIR")))

; Allow IPC with specific services
(allow mach-lookup
    (global-name "com.apple.lsd.mapdb")
    (global-name "com.apple.windowserver"))

; Deny dangerous operations
(deny process-fork)
(deny process-exec)
(deny system-socket)
\`\`\`

\`\`\`bash
# View app's sandbox profile (macOS generates this from entitlements)
# Actual sandbox profiles are compiled into binary format

# Check if app is sandboxed
codesign -dvvv /Applications/Safari.app 2>&1 | grep -i sandbox
# [Key] com.apple.security.app-sandbox
# [Value]
#   [Bool] true

# Sandbox container location
# ~/Library/Containers/com.apple.Safari/

# List sandboxed apps
ls ~/Library/Containers/
# Each directory is a sandbox container for an app
# Contains: Data/ (the "fake" home directory the app sees)

# Sandbox violations are logged
log show --predicate 'process == "sandboxd"' --last 1h
# Shows apps trying to access resources outside their sandbox
\`\`\`

### Entitlements — Sandbox Permissions

\`\`\`xml
<!-- Entitlements grant specific capabilities within sandbox -->
<key>com.apple.security.app-sandbox</key>
<true/>

<!-- Network access -->
<key>com.apple.security.network.client</key>
<true/>
<key>com.apple.security.network.server</key>
<true/>

<!-- File access beyond container -->
<key>com.apple.security.files.user-selected.read-write</key>
<true/>  <!-- User-chosen files via Open/Save dialog -->

<key>com.apple.security.files.downloads.read-write</key>
<true/>  <!-- ~/Downloads -->

<!-- Hardware access -->
<key>com.apple.security.device.camera</key>
<true/>
<key>com.apple.security.device.microphone</key>
<true/>
<key>com.apple.security.device.usb</key>
<true/>

<!-- Temporary exception (not allowed in App Store) -->
<key>com.apple.security.temporary-exception.files.absolute-path.read-only</key>
<array>
    <string>/private/etc/hosts</string>
</array>
\`\`\`

## Keychain Services Architecture

The Keychain is more sophisticated than most developers realize:

\`\`\`
Keychain Architecture:
┌──────────────────────────────────────────────────┐
│  Application                                     │
│  ↓ SecItemAdd/SecItemCopyMatching               │
├──────────────────────────────────────────────────┤
│  securityd (daemon in user session)             │
│  ├── Access control checks (ACL)                │
│  ├── Encryption/decryption (keys in Secure Enclave)
│  └── Talks to secd                              │
├──────────────────────────────────────────────────┤
│  secd (Security daemon)                          │
│  ├── Manages keychain database                  │
│  └── Talks to Secure Enclave Processor (SEP)    │
├──────────────────────────────────────────────────┤
│  Secure Enclave (SEP)                            │
│  ├── Stores keychain master keys                │
│  ├── Derives per-item encryption keys            │
│  └── Never exports keys — all crypto in SEP     │
└──────────────────────────────────────────────────┘

Keychain files:
~/Library/Keychains/login.keychain-db        (user keychain)
/Library/Keychains/System.keychain           (system keychain)
\`\`\`

### Keychain Item Protection Classes

\`\`\`
Protection classes (kSecAttrAccessible):

kSecAttrAccessibleWhenUnlocked (default)
├── Available when device unlocked
└── Most secure for apps

kSecAttrAccessibleAfterFirstUnlock
├── Available after first unlock since boot
└── Used for items that need background access

kSecAttrAccessibleAlways (deprecated — don't use)
├── Always available
└── Insecure

kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly
├── Requires passcode to be set
├── Never leaves this device (not in iCloud Keychain)
└── Maximum security
\`\`\`

\`\`\`bash
# Access keychain from command line
security find-generic-password -s "MyService"
# keychain: "/Users/alice/Library/Keychains/login.keychain-db"
# class: "genp"
# attributes:
#     "acct"<blob>="myaccount"
#     "svce"<blob>="MyService"
# password: "secret"

# Add item to keychain
security add-generic-password -a "myaccount" -s "MyService" -w "secret"

# Delete keychain item
security delete-generic-password -s "MyService"

# List all keychain items
security dump-keychain ~/Library/Keychains/login.keychain-db

# Keychain ACLs
security show-keychain-acl ~/Library/Keychains/login.keychain-db
\`\`\`

## FileVault and APFS Encryption

\`\`\`
FileVault 2 on APFS:
User password
    │ (PBKDF2 key derivation)
    ▼
Volume Encryption Key (VEK) — stored in Secure Enclave
    │
    ▼
Per-extent encryption keys (APFS native encryption)
    │
    ▼
Actual data on disk (encrypted)

APFS supports per-file keys (multi-key encryption):
├── Each file has unique encryption key
├── File key encrypted by class key
├── Class key encrypted by VEK
└── VEK encrypted by user password + hardware key

Advantages:
├── Instant erase (destroy VEK → all data inaccessible)
├── Per-file key rotation (change user password = only re-encrypt VEK)
└── Protection classes (different unlock requirements per file)
\`\`\`

\`\`\`bash
# FileVault status
fdesetup status
# FileVault is On.

# Enable FileVault
sudo fdesetup enable

# List FileVault users
sudo fdesetup list
# alice,F1234567-89AB-CDEF-0123-456789ABCDEF

# Add user to FileVault
sudo fdesetup add -usertoadd bob

# Recovery key
sudo fdesetup changerecovery -personal
# Enter new recovery key (will be 24 character key)

# Institutional recovery key (for managed Macs)
sudo fdesetup changerecovery -institutional -keychain /path/to/keychain

# Check encryption status
diskutil apfs list
# Look for "Encrypted: Yes" and "FileVault: Yes"

# APFS encryption is authenticated encryption (AES-XTS)
# XTS mode: prevents block reordering attacks
# Each 512-byte sector encrypted with unique tweak
\`\`\`

## System Extensions vs Kernel Extensions

macOS is deprecating kernel extensions (kexts) in favor of System Extensions:

\`\`\`
Kernel Extensions (deprecated):
├── Run in kernel space (ring 0)
├── Kernel panic if they crash
├── Full hardware access
└── /Library/Extensions/, /System/Library/Extensions/

System Extensions (modern):
├── Run in user space (ring 3)
├── Cannot crash kernel
├── Mediated access via DriverKit/NetworkExtension/EndpointSecurity
└── Require user approval + notarization
\`\`\`

\`\`\`bash
# List loaded kernel extensions (legacy)
kextstat
# Index Refs Address            Size       Wired      Name (Version) UUID <Linked Against>
#     1  146 0                  0          0          com.apple.kpi.bsd (22.1.0) ...

# System extension management
systemextensionsctl list
# Shows all installed System Extensions

# System extensions require:
# 1. System Extension entitlement
# 2. Notarization
# 3. User approval (one-time)
# 4. Team ID matching

# Location of system extensions
ls /Library/SystemExtensions/
\`\`\`

## macOS Security in Depth — Attack Surface Analysis

\`\`\`
Attack Surface (from most to least restricted):

1. App Store app (sandboxed)
   ├── Tightest sandbox
   ├── Entitlements reviewed by Apple
   └── Auto-updates from Apple

2. Notarized app (sandboxed)
   ├── Same sandbox as App Store
   ├── Entitlements not reviewed
   └── Developer distributes updates

3. Notarized app (not sandboxed)
   ├── No sandbox restrictions
   ├── But still code-signed + notarized
   └── Can access user files (with TCC prompts)

4. Developer ID signed (no notarization)
   ├── macOS 10.15+ blocks by default
   └── User can override with right-click → Open

5. Ad-hoc signed (unsigned)
   ├── macOS blocks entirely
   └── Requires: xattr -cr app.app + spctl --add --label "Approved" app.app
\`\`\`

The security layers compound — breaking one doesn't break the system.`,

  fr: `# Sécurité macOS — Internals profonds

La sécurité macOS est un système de défense en couches qui commence au niveau du silicium et s'étend à travers le noyau, les services système et le runtime des applications. Comprendre ces internals révèle pourquoi la sécurité macOS est fondamentalement différente des autres systèmes d'exploitation — et pourquoi certaines attaques qui fonctionnent ailleurs échouent sur macOS.

## Signature de code — La fondation

Chaque exécutable sur macOS doit être signé. Ce n'est pas une suggestion — c'est imposé par le noyau.

### Format de signature de code

\`\`\`
Structure binaire Mach-O :
┌─────────────────────────────────┐
│  En-tête Mach-O                 │
├─────────────────────────────────┤
│  Commandes de chargement        │
│  LC_CODE_SIGNATURE ──────────┐  │
├─────────────────────────────┼──┤
│  Segment __TEXT (code)      │  │
├─────────────────────────────┤  │
│  Segment __DATA (données)   │  │
├─────────────────────────────┤  │
│  Segment __LINKEDIT         │  │
│  ┌──────────────────────────┼──┘
│  │ Répertoire de code       │
│  │ ├── Hachages de code (par page)
│  │ │   Hash(page_0)         │
│  │ │   Hash(page_1)         │
│  │ ├── Hachages spéciaux :  │
│  │ │   Hash Info.plist      │
│  │ │   Hash Ressources      │
│  │ │   Hash Entitlements    │
│  ├── Exigences (CDR)        │
│  ├── Entitlements (plist)   │
│  └── Signature CMS (PKCS#7) │
│      ├── Apple Developer ID │
│      ├── Chaîne certificats │
│      └── Signature sur tout │
└─────────────────────────────┘
\`\`\`

**Pourquoi le hachage par page est important** : Quand le noyau charge une page de code, il vérifie le hash AVANT l'exécution. Cela signifie que le code ne peut pas être modifié en mémoire après vérification — toute modification invalide le hash.

\`\`\`bash
# Inspecter la signature de code
codesign -dvvv /Applications/Safari.app

# Vérifier la signature
codesign --verify --verbose=4 /Applications/Safari.app

# Extraire les entitlements
codesign -d --entitlements :- /Applications/Safari.app

# Re-signer une app (nécessite un certificat valide)
codesign -s "Developer ID Application: Votre Nom" /Applications/MonApp.app
\`\`\`

### Hardened Runtime

Le Hardened Runtime ajoute des restrictions supplémentaires au-dessus de la signature de code :

\`\`\`
Hardened Runtime impose :
├── Pas de code non signé (dlopen, JIT sans entitlement)
├── Pas de débogage sans entitlement (ptrace interdit)
├── Pas de contournement de validation de bibliothèque
├── Protection contre les déréférencements de pointeurs invalides
├── Prévention de l'exécution heap/stack
└── Restrictions variables d'environnement DYLD

Activé par : codesign --options=runtime
\`\`\`

### Validation de bibliothèque

La validation de bibliothèque garantit que toutes les dylibs chargées proviennent du même Team ID :

\`\`\`
Sans validation de bibliothèque :
App (Team ID: ABC123) peut charger :
└── N'importe quelle dylib signée de n'importe quel développeur

Avec validation de bibliothèque :
App (Team ID: ABC123) peut seulement charger :
├── Dylibs signées par Team ID: ABC123
└── Bibliothèques système d'Apple

Attaque prévenue : Injection de code via dylib malveillante
\`\`\`

## Gatekeeper — La Trinité Gatekeeper

Gatekeeper est en fait trois systèmes travaillant ensemble :

\`\`\`
1. Quarantaine (quarantined.c — extension noyau)
   Téléchargements depuis le réseau → xattr com.apple.quarantine
   ↓
2. Gatekeeper (syspolicyd — daemon)
   Premier lancement → vérifier signature, vérifier notarisation
   ↓
3. XProtect + MRT (XProtect.bundle + MRT.app)
   Signature valide → scanner pour malware connu
\`\`\`

### Système de quarantaine

\`\`\`bash
# Chaque fichier téléchargé reçoit l'attribut de quarantaine

# Voir la quarantaine
xattr fichier.dmg
# com.apple.quarantine

xattr -p com.apple.quarantine fichier.dmg
# 0083;65a1b2c3;Safari;1A2B3C4D-5E6F-7890-ABCD-EF1234567890

# Supprimer la quarantaine (ce que fait le bouton "Autoriser")
xattr -d com.apple.quarantine fichier.dmg

# Supprimer récursivement la quarantaine
xattr -dr com.apple.quarantine /Applications/MonApp.app
\`\`\`

### Évaluation Gatekeeper

\`\`\`bash
# Évaluation Gatekeeper (ce qui se passe au premier lancement)
spctl --assess --verbose=4 /Applications/MonApp.app

# Désactiver Gatekeeper (nécessite SIP désactivé — non recommandé)
sudo spctl --master-disable

# Vérifier l'état de Gatekeeper
spctl --status
\`\`\`

### Notarisation

La notarisation est le scan de malware d'Apple pour les apps distribuées en dehors de l'App Store :

\`\`\`
Processus de notarisation :
1. Le développeur télécharge l'app vers Apple
2. Scan automatisé d'Apple
3. Si validé : Apple émet un ticket de notarisation
4. L'utilisateur télécharge l'app
   Gatekeeper vérifie :
   ├── Signature valide
   ├── Ticket de notarisation présent
   └── OU interroge le serveur Apple pour le ticket
\`\`\`

\`\`\`bash
# Vérifier la notarisation
spctl -a -vvv -t install /Applications/MonApp.app

# Agrafer le ticket de notarisation à l'app
xcrun stapler staple /Applications/MonApp.app
\`\`\`

## TCC — Transparence, Consentement et Contrôle

TCC est le système qui demande "AppName souhaite accéder à votre Caméra/Microphone/Fichiers/Position".

### Structure de la base de données TCC

\`\`\`
Bases de données TCC (SQLite) :
/Library/Application Support/com.apple.TCC/TCC.db        (système)
~/Library/Application Support/com.apple.TCC/TCC.db       (par utilisateur)

Services protégés :
kTCCServiceCamera              # Accès caméra
kTCCServiceMicrophone          # Accès microphone
kTCCServicePhotos              # Bibliothèque Photos
kTCCServiceContacts            # Contacts
kTCCServiceSystemPolicyAllFiles # Accès disque complet
kTCCServiceScreenCapture       # Enregistrement écran
kTCCServiceLocation            # Services de localisation
\`\`\`

\`\`\`bash
# Interroger la base TCC
sudo sqlite3 /Library/Application\ Support/com.apple.TCC/TCC.db \\
  "SELECT service, client, auth_value FROM access WHERE service='kTCCServiceCamera';"

# Réinitialiser les permissions TCC pour une app
tccutil reset Camera com.zoom.us.ZoomDaemon
tccutil reset All com.zoom.us.ZoomDaemon
\`\`\`

## Sandbox d'application

Le App Sandbox est un système MAC (Mandatory Access Control) au niveau du noyau basé sur le framework Seatbelt de FreeBSD.

\`\`\`bash
# Vérifier si une app est sandboxée
codesign -dvvv /Applications/Safari.app 2>&1 | grep -i sandbox

# Emplacement du conteneur sandbox
# ~/Library/Containers/com.apple.Safari/

# Lister les apps sandboxées
ls ~/Library/Containers/

# Les violations de sandbox sont journalisées
log show --predicate 'process == "sandboxd"' --last 1h
\`\`\`

## Architecture Keychain Services

\`\`\`
Architecture Keychain :
┌──────────────────────────────────────────────────┐
│  Application                                     │
├──────────────────────────────────────────────────┤
│  securityd (daemon dans la session utilisateur) │
│  ├── Vérifications de contrôle d'accès (ACL)    │
│  └── Parle à secd                                │
├──────────────────────────────────────────────────┤
│  secd (Daemon de sécurité)                       │
│  ├── Gère la base de données keychain           │
│  └── Parle au Secure Enclave Processor (SEP)    │
├──────────────────────────────────────────────────┤
│  Secure Enclave (SEP)                            │
│  ├── Stocke les clés maîtres du keychain        │
│  ├── Dérive les clés de chiffrement par élément │
│  └── N'exporte jamais les clés                  │
└──────────────────────────────────────────────────┘
\`\`\`

\`\`\`bash
# Accéder au keychain depuis la ligne de commande
security find-generic-password -s "MonService"

# Ajouter un élément au keychain
security add-generic-password -a "moncompte" -s "MonService" -w "secret"

# Supprimer un élément du keychain
security delete-generic-password -s "MonService"
\`\`\`

## FileVault et chiffrement APFS

\`\`\`
FileVault 2 sur APFS :
Mot de passe utilisateur
    │ (dérivation de clé PBKDF2)
    ▼
Clé de chiffrement de volume (VEK) — stockée dans Secure Enclave
    │
    ▼
Clés de chiffrement par étendue (chiffrement natif APFS)
    │
    ▼
Données réelles sur le disque (chiffrées)

Avantages :
├── Effacement instantané (détruire VEK → toutes les données inaccessibles)
├── Rotation de clé par fichier
└── Classes de protection
\`\`\`

\`\`\`bash
# État FileVault
fdesetup status

# Activer FileVault
sudo fdesetup enable

# Clé de récupération
sudo fdesetup changerecovery -personal
\`\`\``,
};

export const quiz = {
  en: [
    {
      question: "Why does macOS use per-page code signing hashes?",
      options: [
        "To save disk space",
        "The kernel verifies each page's hash before execution — preventing in-memory code modification",
        "To speed up app launches",
        "To reduce signature file size",
      ],
      correct: 1,
    },
    {
      question: "What are the three systems that make up Gatekeeper?",
      options: [
        "FileVault, TCC, and Sandbox",
        "Quarantine system, syspolicyd (Gatekeeper daemon), and XProtect/MRT",
        "Code signing, notarization, and sandboxing",
        "Secure Enclave, TCC, and Keychain",
      ],
      correct: 1,
    },
    {
      question:
        "What does the com.apple.quarantine extended attribute indicate?",
      options: [
        "The file is encrypted",
        "The file is damaged",
        "The file was downloaded from the internet and requires Gatekeeper verification on first launch",
        "The file is sandboxed",
      ],
      correct: 2,
    },
    {
      question: "Where are the master keys for Keychain items actually stored?",
      options: [
        "In ~/Library/Keychains/login.keychain-db as encrypted data",
        "In the user's password hash",
        "In the Secure Enclave Processor (SEP) — they never leave the SEP",
        "In iCloud",
      ],
      correct: 2,
    },
    {
      question:
        "What is the key advantage of System Extensions over Kernel Extensions?",
      options: [
        "System Extensions are faster",
        "System Extensions run in user space and cannot kernel panic if they crash",
        "System Extensions have more hardware access",
        "System Extensions don't require code signing",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Pourquoi macOS utilise-t-il des hachages de signature de code par page ?",
      options: [
        "Pour économiser l'espace disque",
        "Le noyau vérifie le hash de chaque page avant exécution — empêchant la modification du code en mémoire",
        "Pour accélérer le lancement des apps",
        "Pour réduire la taille du fichier de signature",
      ],
      correct: 1,
    },
    {
      question: "Quels sont les trois systèmes qui composent Gatekeeper ?",
      options: [
        "FileVault, TCC et Sandbox",
        "Système de quarantaine, syspolicyd (daemon Gatekeeper) et XProtect/MRT",
        "Signature de code, notarisation et sandboxing",
        "Secure Enclave, TCC et Keychain",
      ],
      correct: 1,
    },
    {
      question: "Qu'indique l'attribut étendu com.apple.quarantine ?",
      options: [
        "Le fichier est chiffré",
        "Le fichier est endommagé",
        "Le fichier a été téléchargé depuis internet et nécessite une vérification Gatekeeper au premier lancement",
        "Le fichier est sandboxé",
      ],
      correct: 2,
    },
    {
      question:
        "Où sont réellement stockées les clés maîtres pour les éléments Keychain ?",
      options: [
        "Dans ~/Library/Keychains/login.keychain-db comme données chiffrées",
        "Dans le hash du mot de passe utilisateur",
        "Dans le Secure Enclave Processor (SEP) — elles ne quittent jamais le SEP",
        "Dans iCloud",
      ],
      correct: 2,
    },
    {
      question:
        "Quel est l'avantage clé des System Extensions par rapport aux Kernel Extensions ?",
      options: [
        "Les System Extensions sont plus rapides",
        "Les System Extensions s'exécutent en espace utilisateur et ne peuvent pas provoquer de kernel panic",
        "Les System Extensions ont plus d'accès matériel",
        "Les System Extensions ne nécessitent pas de signature de code",
      ],
      correct: 1,
    },
  ],
};
