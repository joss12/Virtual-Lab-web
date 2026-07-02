export const content = {
  en: `# Virtual Memory — The Beautiful Lie

Virtual memory is the greatest abstraction in operating systems. Every process believes it has gigabytes of contiguous memory starting at address 0x0. **This is completely false.** Understanding how this illusion is maintained reveals the most elegant engineering in modern computing.

## The Problem Virtual Memory Solves

\`\`\`
Without virtual memory (early computers):

Physical RAM: 4GB
Process A: 0x00000000 - 0x3FFFFFFF (1GB)
Process B: 0x40000000 - 0x7FFFFFFF (1GB)
Process C: 0x80000000 - 0xBFFFFFFF (1GB)

Problems:
├── Fragmentation (gaps between allocations)
├── No memory protection (Process A can write to Process B's memory)
├── Hard to relocate (code compiled for specific addresses)
└── Limited address space (32-bit = 4GB max, including kernel)

With virtual memory:

Every process sees:
0x00000000 - 0xFFFFFFFF (4GB on 32-bit, 256TB on 64-bit)

Benefits:
├── Isolation (each process has own address space)
├── Protection (MMU enforces permissions)
├── Swapping (can use disk as "memory")
├── Sharing (multiple processes can map same physical page)
└── Sparse addressing (only allocate physical pages when needed)
\`\`\`

## Address Translation — The Core Mechanism

\`\`\`
Virtual Address → Physical Address

32-bit example (4KB pages):
Virtual Address: 0x12345678

Split into:
├── Page Directory Index: bits [31:22] = 0x048 (10 bits)
├── Page Table Index:     bits [21:12] = 0x345 (10 bits)
└── Page Offset:          bits [11:0]  = 0x678 (12 bits)

Translation walk (x86 32-bit, 2-level):
1. CR3 register → Page Directory base (physical address)
2. Read Page Directory[0x048] → Page Table base
3. Read Page Table[0x345] → Physical Page Number (PPN)
4. Combine: Physical Address = (PPN << 12) | 0x678

Result: Virtual 0x12345678 → Physical 0xABCDE678
        (assuming PPN = 0xABCDE)

Cost: 2 memory reads for EVERY memory access
Solution: TLB (Translation Lookaside Buffer) caches translations
\`\`\`

### x86-64 Page Tables — 4-Level Hierarchy

\`\`\`
64-bit virtual address (48 bits actually used):

[63:48] = Sign extension (copies bit 47)
[47:39] = PML4 Index (Page Map Level 4) — 9 bits = 512 entries
[38:30] = PDP Index (Page Directory Pointer) — 9 bits = 512 entries
[29:21] = PD Index (Page Directory) — 9 bits = 512 entries
[20:12] = PT Index (Page Table) — 9 bits = 512 entries
[11:0]  = Page Offset — 12 bits = 4096 bytes

Page Table Entry (PTE) format (64 bits):

[63]    = Execute Disable (NX bit)
[62:52] = Available for OS use
[51:12] = Physical Page Number (40 bits = 1TB max physical RAM)
[11:9]  = Available
[8]     = Global page
[7]     = Page size (0=4KB, 1=2MB/1GB)
[6]     = Dirty (written to)
[5]     = Accessed
[4]     = Cache Disable
[3]     = Write-Through
[2]     = User/Supervisor (0=kernel only, 1=user accessible)
[1]     = Read/Write (0=read-only, 1=read-write)
[0]     = Present (1=in RAM, 0=swapped or not allocated)

Translation walk (4 steps):
CR3 → PML4[idx] → PDP[idx] → PD[idx] → PT[idx] → Physical Page

Total: 4 memory reads per translation (without TLB)
\`\`\`

### 5-Level Paging (Intel Ice Lake+, 128 PB address space)

\`\`\`
[63:57] = Sign extension
[56:48] = PML5 Index (512 entries) — NEW LEVEL
[47:39] = PML4 Index
[38:30] = PDP Index
[29:21] = PD Index
[20:12] = PT Index
[11:0]  = Page Offset

Address space: 2^57 = 128 PB (petabytes)
Physical limit: Still 52 bits = 4 PB

Why 5-level?
├── Future-proofing (databases, scientific computing)
├── Larger per-process address space
└── Opt-in (LA57 bit in CR4, requires CPU + OS support)
\`\`\`

## TLB — The Performance Savior

\`\`\`
TLB (Translation Lookaside Buffer):
├── Fully-associative cache of recent translations
├── Checked before page table walk
├── Hit rate typically >95%
└── Miss = page table walk (expensive)

TLB organization (typical modern CPU):

L1 DTLB (Data):
├── 64 entries (4KB pages)
├── 32 entries (2MB pages)
├── Fully associative
└── ~1 cycle latency

L1 ITLB (Instruction):
├── 128 entries (4KB pages)
├── Separate from DTLB
└── ~1 cycle latency

L2 TLB (shared):
├── 1536 entries (4KB pages)
├── 128 entries (2MB/1GB pages)
└── ~7 cycles latency

Page table walk cost:
├── ~200 cycles on L3 hit
├── ~500 cycles on RAM access
└── Can serialize memory access (pipeline stall)

TLB shootdown (multicore nightmare):
Process frees memory → kernel modifies page tables
    ↓
Must invalidate TLB entries on ALL cores
    ↓
IPI (Inter-Processor Interrupt) sent to all CPUs
    ↓
Each CPU flushes TLB entries
    ↓
IPI acknowledgment
    ↓
Process can continue

Cost: 1000s of cycles (avoids stale translations)
\`\`\`

### TLB Miss Analysis

\`\`\`bash
# Linux: Check TLB misses
perf stat -e dTLB-loads,dTLB-load-misses,iTLB-loads,iTLB-load-misses ./myapp
# dTLB-loads:              1,234,567,890
# dTLB-load-misses:           12,345,678  # 1% miss rate
# iTLB-loads:                234,567,890
# iTLB-load-misses:              123,456  # 0.05% miss rate

# macOS: Instruments → System Trace → "VM Faults"
# Shows TLB misses as page faults

# Windows: Performance Monitor → "Memory" → "Page Faults/sec"
\`\`\`

## Page Faults — Not Always Bad

\`\`\`
Page fault types:

1. Minor (soft) page fault:
   ├── Page is in RAM but not in process page table
   ├── Scenario: Copy-on-write, memory-mapped file already cached
   ├── Cost: ~1-2 microseconds (just update page table)
   └── No disk I/O

2. Major (hard) page fault:
   ├── Page not in RAM, must read from disk
   ├── Scenario: Swapped out, first access to mmap'd file
   ├── Cost: ~5-10 milliseconds (disk I/O)
   └── Blocks process until I/O completes

3. Invalid page fault (segfault):
   ├── Access to unmapped address
   ├── Kernel sends SIGSEGV
   └── Process crashes (or handles signal)

Page fault handler flow:

CPU tries to access address 0x12345678
    ↓
TLB miss
    ↓
Page table walk: Present bit = 0
    ↓
CPU raises page fault exception
    ↓
Kernel page fault handler:
    ├── Check if address valid (in VMA - Virtual Memory Area)
    ├── YES: Allocate physical page, update page table, return
    └── NO: SIGSEGV
\`\`\`

\`\`\`bash
# Monitor page faults (Linux)
ps -o min_flt,maj_flt,cmd <PID>
# min_flt = minor faults
# maj_flt = major faults

# Real-time monitoring
watch -n 1 'ps -o min_flt,maj_flt,cmd <PID>'

# System-wide page fault rate
vmstat 1
# si = swap in (KB/s) — major faults from swap
# so = swap out (KB/s)

# Detailed fault analysis
perf record -e page-faults ./myapp
perf report
# Shows which functions caused page faults
\`\`\`

## Demand Paging — Lazy Allocation

\`\`\`
malloc(1GB) on Linux:
    ↓
Kernel does NOT allocate physical memory
    ↓
Kernel only reserves virtual address space
    ↓
Returns pointer immediately
    ↓
First write to any page:
    ↓
Page fault (Present bit = 0)
    ↓
Kernel allocates physical page
    ↓
Zero-fills page (security: can't read previous data)
    ↓
Updates page table
    ↓
Returns to user code
    ↓
Write succeeds

Result: 1GB malloc = 0 bytes physical RAM (until written)

Why this matters:
├── Many programs allocate more than they use
├── Forking (copy-on-write) would be expensive
└── Overcommit allows total allocations > physical RAM
\`\`\`

\`\`\`c
// Test demand paging
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    printf("Before malloc\\n");
    getchar();  // Pause — check memory usage
    
    char *p = malloc(1L << 30);  // 1GB
    printf("After malloc (not written)\\n");
    getchar();  // Still ~0 MB RSS
    
    memset(p, 'A', 1L << 30);    // Write all pages
    printf("After memset\\n");
    getchar();  // Now ~1GB RSS
    
    return 0;
}

// Run: gcc -o demand demand.c && ./demand
// In another terminal: watch -n 0.5 'ps aux | grep demand'
// RSS (Resident Set Size) increases only after memset
\`\`\`

## Copy-on-Write — The Fork Optimization

\`\`\`
fork() without COW (old Unix):

Parent has 1GB of memory
    ↓
fork()
    ↓
Kernel copies all 1GB to new process
    ↓
Cost: 1GB copy = ~100-500ms
    ↓
Child immediately calls exec() → memory wasted

fork() with COW (modern):

Parent has 1GB of memory (10,000 pages)
    ↓
fork()
    ↓
Kernel marks all parent pages read-only
    ↓
Child gets copy of page tables (not pages)
    ↓
Both processes share physical pages
    ↓
Cost: Copy page tables only = ~1ms
    ↓
Either process writes to page:
    ↓
Page fault (write to read-only page)
    ↓
Kernel copies page (4KB)
    ↓
Updates page table (now writable)
    ↓
Only modified pages are copied

Result: fork() is nearly free
\`\`\`

\`\`\`bash
# Observe COW with fork
cat > cow_test.c << 'EOF'
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/wait.h>

int main() {
    char *data = malloc(100 * 1024 * 1024);  // 100MB
    memset(data, 'A', 100 * 1024 * 1024);
    
    printf("Parent RSS before fork: ");
    fflush(stdout);
    system("ps -o rss= -p $PPID");
    
    pid_t pid = fork();
    sleep(1);
    
    if (pid == 0) {
        // Child
        printf("Child RSS after fork (before write): ");
        fflush(stdout);
        system("ps -o rss= -p $$");
        
        memset(data, 'B', 100 * 1024 * 1024);  // Trigger COW
        
        printf("Child RSS after write: ");
        fflush(stdout);
        system("ps -o rss= -p $$");
        exit(0);
    } else {
        wait(NULL);
    }
    return 0;
}
EOF

gcc -o cow_test cow_test.c && ./cow_test
# After fork: Child RSS ≈ 0 MB (shares pages)
# After write: Child RSS ≈ 100 MB (copied pages)
\`\`\`

## Memory-Mapped Files — Zero-Copy I/O

\`\`\`
Traditional file I/O:
fd = open("file.dat", O_RDONLY);
read(fd, buffer, size);
    ↓
Kernel reads file from disk → page cache
    ↓
Kernel copies page cache → user buffer
    ↓
2 copies: disk→cache, cache→user

Memory-mapped I/O:
fd = open("file.dat", O_RDONLY);
ptr = mmap(NULL, size, PROT_READ, MAP_PRIVATE, fd, 0);
    ↓
Kernel maps file directly into process address space
    ↓
Access ptr[1000]:
    ↓
Page fault (file data not in RAM)
    ↓
Kernel reads page from disk → page cache
    ↓
Maps page cache page into process page table
    ↓
NO COPY — process directly accesses page cache
    ↓
1 copy: disk→cache

Performance benefit:
├── No user/kernel buffer copy
├── Shared page cache (multiple processes can map same file)
└── Kernel handles paging transparently
\`\`\`

\`\`\`c
// Memory-mapped file example
#include <sys/mman.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <stdio.h>
#include <unistd.h>

int main() {
    int fd = open("large_file.dat", O_RDONLY);
    struct stat sb;
    fstat(fd, &sb);
    
    // Map entire file into memory
    char *mapped = mmap(NULL, sb.st_size, PROT_READ, MAP_PRIVATE, fd, 0);
    
    // Access like normal array (page faults bring data into RAM)
    for (size_t i = 0; i < sb.st_size; i += 4096) {
        char c = mapped[i];  // Page fault on first access to each 4KB page
    }
    
    munmap(mapped, sb.st_size);
    close(fd);
    return 0;
}
\`\`\`

## Huge Pages — Reducing TLB Pressure

\`\`\`
Standard pages: 4KB
Huge pages: 2MB (Linux), 1GB (x86-64)

Example workload:
├── 10GB working set
├── 4KB pages = 2,621,440 pages
├── TLB entries: 64 (L1) + 1536 (L2) = 1600 total
├── Coverage: 1600 * 4KB = 6.4 MB
├── TLB miss rate: >99% (catastrophic)

With 2MB huge pages:
├── 10GB = 5,120 pages
├── L2 TLB entries: 128 (2MB pages)
├── Coverage: 128 * 2MB = 256 MB
├── TLB miss rate: ~97% (still bad, but better)

With 1GB huge pages:
├── 10GB = 10 pages
├── TLB entries: 16 (1GB pages)
├── Coverage: 16 GB
├── TLB miss rate: ~0% (perfect)

Performance impact: 2-30% improvement for large datasets
\`\`\`

\`\`\`bash
# Linux: Enable transparent huge pages
cat /sys/kernel/mm/transparent_hugepage/enabled
# [always] madvise never

# Force huge pages for specific allocation
madvise(ptr, size, MADV_HUGEPAGE);

# Check huge page usage
grep Huge /proc/meminfo
# HugePages_Total:       0
# HugePages_Free:        0
# Hugepagesize:       2048 kB

# Allocate huge pages (requires root)
echo 100 > /proc/sys/vm/nr_hugepages  # Allocate 100 * 2MB = 200MB

# Application usage
#include <sys/mman.h>
void *ptr = mmap(NULL, 1L << 30, PROT_READ | PROT_WRITE,
                 MAP_PRIVATE | MAP_ANONYMOUS | MAP_HUGETLB, -1, 0);
// MAP_HUGETLB = use huge pages

# macOS: No explicit huge page support (automatic superpage promotion)

# Windows: Large Pages
VirtualAlloc(NULL, size, MEM_RESERVE | MEM_COMMIT | MEM_LARGE_PAGES, PAGE_READWRITE);
// Requires SeLockMemoryPrivilege
\`\`\`

## NUMA — Non-Uniform Memory Access

\`\`\`
Traditional SMP (Symmetric Multiprocessing):
All CPUs → Shared Memory Bus → RAM
Problem: Bus becomes bottleneck with many CPUs

NUMA (modern servers):
Node 0:           Node 1:
CPU 0-7           CPU 8-15
Local RAM 64GB    Local RAM 64GB
    ↓                 ↓
Interconnect (e.g., Intel UPI, AMD Infinity Fabric)

Memory access latency:
├── Local access (CPU 0 → Node 0 RAM): ~100ns
├── Remote access (CPU 0 → Node 1 RAM): ~150-200ns
└── 50-100% slower for remote access

Why NUMA exists:
├── Scales to 100+ cores
├── Each node has dedicated memory bandwidth
└── Most allocations are local (good locality = good performance)
\`\`\`

\`\`\`bash
# Linux: Check NUMA topology
numactl --hardware
# node 0 cpus: 0 1 2 3 4 5 6 7
# node 1 cpus: 8 9 10 11 12 13 14 15
# node distances:
# node   0   1
#   0:  10  21  # 10 = local, 21 = remote (higher = slower)
#   1:  21  10

# Run process on specific NUMA node
numactl --cpunodebind=0 --membind=0 ./myapp
# CPU affinity + memory affinity to node 0

# Check per-node memory usage
numastat
#                           node0           node1
# numa_hit              1234567890       987654321
# numa_miss                  12345          123456  # Remote allocations
# numa_foreign              123456           12345
# interleave_hit             12345           12345
# local_node            1234500000       987600000
# other_node                 67890           54321

# Interleave memory across nodes (for uniform access patterns)
numactl --interleave=all ./myapp

# Per-thread NUMA binding (advanced)
#include <numaif.h>
set_mempolicy(MPOL_BIND, &nodemask, maxnode);
\`\`\`

### NUMA Performance Pitfall

\`\`\`c
// Bad: Memory allocated on node 0, but threads run on node 1
int main() {
    char *data = malloc(10L << 30);  // 10GB allocated on node 0
    memset(data, 0, 10L << 30);
    
    #pragma omp parallel for num_threads(16)  // Threads on all nodes
    for (long i = 0; i < (10L << 30); i++) {
        data[i]++;  // Threads on node 1 access node 0 memory (slow)
    }
}

// Good: First-touch allocation
int main() {
    char *data = malloc(10L << 30);
    
    #pragma omp parallel for num_threads(16)
    for (long i = 0; i < (10L << 30); i++) {
        data[i] = 0;  // Each thread touches its portion
    }
    // Pages allocated on node where thread runs
    
    #pragma omp parallel for num_threads(16)
    for (long i = 0; i < (10L << 30); i++) {
        data[i]++;  // Local access (fast)
    }
}

// Result: 2-3x performance improvement on NUMA systems
\`\`\`

## Memory Barriers and Ordering

\`\`\`
CPU reorders memory operations for performance:

Thread 1:           Thread 2:
x = 1;              while (ready == 0);
ready = 1;          assert(x == 1);  // MAY FAIL

Why? CPU can reorder writes:
ready = 1;          // Executed first (smaller write)
x = 1;              // Executed second

Solution: Memory barrier
Thread 1:
x = 1;
memory_barrier();   // Fence
ready = 1;

Barrier types:
├── Store barrier: All stores before must complete before stores after
├── Load barrier: All loads before must complete before loads after
└── Full barrier: Both load and store

Hardware implementation:
├── x86: Strong memory ordering (few reorderings, implicit barriers)
├── ARM: Weak ordering (aggressive reordering, explicit barriers needed)
└── POWER: Very weak ordering
\`\`\`

\`\`\`c
// C11 atomics with memory ordering
#include <stdatomic.h>

atomic_int ready = 0;
int x;

// Thread 1
x = 1;
atomic_store_explicit(&ready, 1, memory_order_release);
// Ensures x = 1 happens before ready = 1

// Thread 2
while (atomic_load_explicit(&ready, memory_order_acquire) == 0);
// Ensures ready load happens before x read
assert(x == 1);  // GUARANTEED to pass

// Memory ordering strength (weakest to strongest):
memory_order_relaxed   // No ordering guarantees
memory_order_acquire   // Load barrier
memory_order_release   // Store barrier
memory_order_acq_rel   // Both
memory_order_seq_cst   // Sequentially consistent (strongest, slowest)
\`\`\`

This is just the beginning. Virtual memory touches every memory access, every page fault, every TLB miss. Understanding it deeply separates systems programmers from application programmers.`,

  fr: `# Mémoire virtuelle — Le beau mensonge

La mémoire virtuelle est la plus grande abstraction dans les systèmes d'exploitation. Chaque processus croit avoir des gigaoctets de mémoire contiguë commençant à l'adresse 0x0. **C'est complètement faux.** Comprendre comment cette illusion est maintenue révèle l'ingénierie la plus élégante de l'informatique moderne.

## Le problème que résout la mémoire virtuelle

\`\`\`
Sans mémoire virtuelle (ordinateurs anciens) :

RAM physique : 4 Go
Processus A : 0x00000000 - 0x3FFFFFFF (1 Go)
Processus B : 0x40000000 - 0x7FFFFFFF (1 Go)
Processus C : 0x80000000 - 0xBFFFFFFF (1 Go)

Problèmes :
├── Fragmentation (écarts entre allocations)
├── Pas de protection mémoire (A peut écrire dans la mémoire de B)
├── Difficile à relocaliser
└── Espace d'adressage limité

Avec mémoire virtuelle :

Chaque processus voit :
0x00000000 - 0xFFFFFFFF (4 Go en 32-bit, 256 To en 64-bit)

Avantages :
├── Isolation (chaque processus a son propre espace)
├── Protection (MMU impose les permissions)
├── Swap (peut utiliser le disque comme "mémoire")
├── Partage (plusieurs processus peuvent mapper la même page physique)
└── Adressage sparse (alloue les pages physiques seulement si nécessaire)
\`\`\`

## Traduction d'adresse — Le mécanisme central

\`\`\`
Adresse virtuelle → Adresse physique

Exemple 32-bit (pages 4 Ko) :
Adresse virtuelle : 0x12345678

Divisée en :
├── Index répertoire de pages : bits [31:22] = 0x048 (10 bits)
├── Index table de pages :      bits [21:12] = 0x345 (10 bits)
└── Décalage de page :           bits [11:0]  = 0x678 (12 bits)

Parcours de traduction (x86 32-bit, 2 niveaux) :
1. Registre CR3 → Base du répertoire de pages
2. Lire RepertoirePages[0x048] → Base de table de pages
3. Lire TablePages[0x345] → Numéro de page physique (PPN)
4. Combiner : Adresse physique = (PPN << 12) | 0x678

Coût : 2 lectures mémoire pour CHAQUE accès mémoire
Solution : TLB (Translation Lookaside Buffer) met en cache les traductions
\`\`\`

### Tables de pages x86-64 — Hiérarchie à 4 niveaux

\`\`\`
Adresse virtuelle 64-bit (48 bits réellement utilisés) :

[63:48] = Extension de signe
[47:39] = Index PML4
[38:30] = Index PDP
[29:21] = Index PD
[20:12] = Index PT
[11:0]  = Décalage de page

Entrée de table de pages (PTE) format (64 bits) :

[63]    = Execute Disable (bit NX)
[51:12] = Numéro de page physique
[6]     = Dirty (écrit)
[5]     = Accessed (accédé)
[2]     = User/Supervisor
[1]     = Read/Write
[0]     = Present (1=en RAM, 0=swappé)

Parcours de traduction (4 étapes) :
CR3 → PML4[idx] → PDP[idx] → PD[idx] → PT[idx] → Page physique

Total : 4 lectures mémoire par traduction (sans TLB)
\`\`\`

## TLB — Le sauveur de performance

\`\`\`
TLB (Translation Lookaside Buffer) :
├── Cache entièrement associatif des traductions récentes
├── Vérifié avant le parcours de table de pages
├── Taux de hit typiquement >95%
└── Miss = parcours de table de pages (coûteux)

Organisation TLB (CPU moderne typique) :

L1 DTLB (Données) :
├── 64 entrées (pages 4 Ko)
├── 32 entrées (pages 2 Mo)
└── ~1 cycle de latence

L1 ITLB (Instructions) :
├── 128 entrées (pages 4 Ko)
└── ~1 cycle de latence

L2 TLB (partagé) :
├── 1536 entrées (pages 4 Ko)
└── ~7 cycles de latence

Coût du parcours de table de pages :
├── ~200 cycles sur hit L3
├── ~500 cycles sur accès RAM
└── Peut sérialiser l'accès mémoire (blocage pipeline)
\`\`\`

## Défauts de page — Pas toujours mauvais

\`\`\`
Types de défauts de page :

1. Défaut de page mineur (soft) :
   ├── La page est en RAM mais pas dans la table de pages du processus
   ├── Coût : ~1-2 microsecondes
   └── Pas d'I/O disque

2. Défaut de page majeur (hard) :
   ├── Page pas en RAM, doit lire depuis le disque
   ├── Coût : ~5-10 millisecondes (I/O disque)
   └── Bloque le processus jusqu'à fin de l'I/O

3. Défaut de page invalide (segfault) :
   ├── Accès à adresse non mappée
   └── Le processus crash

Flux du gestionnaire de défaut de page :

Le CPU essaie d'accéder à l'adresse 0x12345678
    ↓
TLB miss
    ↓
Parcours table de pages : bit Present = 0
    ↓
Le CPU déclenche une exception de défaut de page
    ↓
Gestionnaire de défaut de page du noyau
\`\`\`

## Pagination à la demande — Allocation paresseuse

\`\`\`
malloc(1 Go) sur Linux :
    ↓
Le noyau n'alloue PAS de mémoire physique
    ↓
Le noyau réserve seulement l'espace d'adressage virtuel
    ↓
Retourne le pointeur immédiatement
    ↓
Première écriture sur une page :
    ↓
Défaut de page
    ↓
Le noyau alloue une page physique
    ↓
Remplit la page de zéros
    ↓
Met à jour la table de pages
    ↓
L'écriture réussit

Résultat : malloc 1 Go = 0 octets de RAM physique (jusqu'à écriture)
\`\`\`

## Copy-on-Write — L'optimisation du fork

\`\`\`
fork() sans COW (ancien Unix) :

Le parent a 1 Go de mémoire
    ↓
fork()
    ↓
Le noyau copie tous les 1 Go vers le nouveau processus
    ↓
Coût : copie 1 Go = ~100-500ms

fork() avec COW (moderne) :

Le parent a 1 Go de mémoire
    ↓
fork()
    ↓
Le noyau marque toutes les pages du parent en lecture seule
    ↓
L'enfant obtient une copie des tables de pages (pas des pages)
    ↓
Les deux processus partagent les pages physiques
    ↓
Coût : Copier seulement les tables de pages = ~1ms
    ↓
Un processus écrit sur une page :
    ↓
Défaut de page (écriture sur page lecture seule)
    ↓
Le noyau copie la page (4 Ko)
    ↓
Seules les pages modifiées sont copiées

Résultat : fork() est presque gratuit
\`\`\`

## Fichiers mappés en mémoire — I/O sans copie

\`\`\`
I/O fichier traditionnel :
read(fd, buffer, size);
    ↓
Le noyau lit le fichier depuis le disque → cache de pages
    ↓
Le noyau copie cache de pages → buffer utilisateur
    ↓
2 copies : disque→cache, cache→utilisateur

I/O mappé en mémoire :
ptr = mmap(NULL, size, PROT_READ, MAP_PRIVATE, fd, 0);
    ↓
Le noyau mappe le fichier directement dans l'espace d'adressage
    ↓
AUCUNE COPIE — le processus accède directement au cache de pages
    ↓
1 copie : disque→cache
\`\`\`

## Huge Pages — Réduire la pression TLB

\`\`\`
Pages standard : 4 Ko
Huge pages : 2 Mo (Linux), 1 Go (x86-64)

Exemple de charge de travail :
├── Working set de 10 Go
├── Pages 4 Ko = 2 621 440 pages
├── Entrées TLB : 1600 total
├── Couverture : 6,4 Mo
├── Taux de miss TLB : >99% (catastrophique)

Avec huge pages 2 Mo :
├── 10 Go = 5 120 pages
├── Couverture : 256 Mo
├── Taux de miss TLB : ~97%

Avec huge pages 1 Go :
├── 10 Go = 10 pages
├── Couverture : 16 Go
├── Taux de miss TLB : ~0% (parfait)

Impact performance : amélioration de 2-30%
\`\`\`

## NUMA — Accès mémoire non uniforme

\`\`\`
NUMA (serveurs modernes) :
Nœud 0 :          Nœud 1 :
CPU 0-7           CPU 8-15
RAM locale 64 Go  RAM locale 64 Go

Latence d'accès mémoire :
├── Accès local (CPU 0 → RAM Nœud 0) : ~100ns
├── Accès distant (CPU 0 → RAM Nœud 1) : ~150-200ns
└── 50-100% plus lent pour accès distant
\`\`\``,
};

export const quiz = {
  en: [
    {
      question:
        "Why does x86-64 use a 4-level page table hierarchy instead of a single large table?",
      options: [
        "It's faster to search",
        "A single-level table for 48-bit addresses would require 2^36 entries * 8 bytes = 512GB per process",
        "It uses less CPU",
        "It's easier to program",
      ],
      correct: 1,
    },
    {
      question:
        "What is the primary purpose of the TLB (Translation Lookaside Buffer)?",
      options: [
        "Store frequently used data",
        "Cache virtual-to-physical address translations to avoid expensive page table walks",
        "Manage disk I/O",
        "Handle interrupts",
      ],
      correct: 1,
    },
    {
      question:
        "What is copy-on-write (COW) and why is it critical for fork() performance?",
      options: [
        "It copies data faster",
        "Parent and child share pages until write, then copy only the modified page — making fork() nearly free",
        "It prevents memory leaks",
        "It encrypts memory",
      ],
      correct: 1,
    },
    {
      question:
        "What is the key advantage of memory-mapped files over traditional read()?",
      options: [
        "They're easier to use",
        "They use less disk space",
        "They eliminate the copy from kernel page cache to user buffer — zero-copy I/O",
        "They're faster to open",
      ],
      correct: 2,
    },
    {
      question:
        "Why do huge pages (2MB/1GB) improve performance for large datasets?",
      options: [
        "They use less RAM",
        "They reduce TLB misses — a 1GB page can map 1GB with a single TLB entry vs 262,144 entries for 4KB pages",
        "They're faster to allocate",
        "They compress better",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Pourquoi x86-64 utilise-t-il une hiérarchie de tables de pages à 4 niveaux au lieu d'une seule grande table ?",
      options: [
        "C'est plus rapide à rechercher",
        "Une table à un seul niveau pour des adresses 48-bit nécessiterait 2^36 entrées * 8 octets = 512 Go par processus",
        "Ça utilise moins de CPU",
        "C'est plus facile à programmer",
      ],
      correct: 1,
    },
    {
      question:
        "Quel est l'objectif principal du TLB (Translation Lookaside Buffer) ?",
      options: [
        "Stocker les données fréquemment utilisées",
        "Mettre en cache les traductions d'adresses virtuel-vers-physique pour éviter les parcours coûteux de tables de pages",
        "Gérer l'I/O disque",
        "Gérer les interruptions",
      ],
      correct: 1,
    },
    {
      question:
        "Qu'est-ce que le copy-on-write (COW) et pourquoi est-il critique pour les performances de fork() ?",
      options: [
        "Il copie les données plus rapidement",
        "Parent et enfant partagent les pages jusqu'à écriture, puis copient seulement la page modifiée — rendant fork() presque gratuit",
        "Il empêche les fuites mémoire",
        "Il chiffre la mémoire",
      ],
      correct: 1,
    },
    {
      question:
        "Quel est l'avantage clé des fichiers mappés en mémoire par rapport à read() traditionnel ?",
      options: [
        "Ils sont plus faciles à utiliser",
        "Ils utilisent moins d'espace disque",
        "Ils éliminent la copie du cache de pages noyau vers le buffer utilisateur — I/O sans copie",
        "Ils sont plus rapides à ouvrir",
      ],
      correct: 2,
    },
    {
      question:
        "Pourquoi les huge pages (2 Mo/1 Go) améliorent-elles les performances pour les grands ensembles de données ?",
      options: [
        "Elles utilisent moins de RAM",
        "Elles réduisent les TLB miss — une page 1 Go peut mapper 1 Go avec une seule entrée TLB vs 262 144 entrées pour des pages 4 Ko",
        "Elles sont plus rapides à allouer",
        "Elles se compressent mieux",
      ],
      correct: 1,
    },
  ],
};
