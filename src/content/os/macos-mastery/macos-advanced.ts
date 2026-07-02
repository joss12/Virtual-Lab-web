export const content = {
  en: `# macOS Advanced — The Engineering Deep End

This lesson covers the tools and techniques that separate macOS users from macOS engineers. These are the debugging and profiling workflows used at Apple to build macOS itself.

## Instruments — The Profiler That Sees Everything

Instruments is not a profiler. It's a **time-traveling debugger** that records everything your app does, then lets you analyze it non-linearly. Understanding Instruments means understanding how macOS kernel tracing works.

### Instruments Architecture

\`\`\`
How Instruments works:

Application runs
    ↓
Kernel records events via kdebug
    ├── System calls
    ├── VM operations  
    ├── Scheduler events
    ├── I/O operations
    ├── Network packets
    └── Custom signposts (os_signpost)
    ↓
Events written to kernel trace buffer (circular, ~50MB)
    ↓
Instruments daemon (instruments_helper) reads buffer
    ↓
Events written to .trace file
    ↓
Instruments.app analyzes .trace file
    ├── Time Profiler (CPU sampling)
    ├── Allocations (memory tracking)
    ├── Leaks (leak detection)
    ├── System Trace (kernel events)
    └── Custom instruments
\`\`\`

**Critical insight**: Instruments records EVERYTHING, then you choose what to analyze. The trace file contains the complete timeline — CPU, memory, I/O, network, all simultaneously.

### kdebug — The Kernel Tracing System

\`\`\`c
// Kernel debug buffer (ring buffer in kernel memory)
// Every event is a kdebug_trace structure:

struct kdebug_trace {
    uint32_t debugid;        // Event ID (encodes: class, subclass, code)
    uint64_t timestamp;      // Mach absolute time (nanosecond precision)
    uintptr_t arg1;          // Event-specific argument 1
    uintptr_t arg2;          // Event-specific argument 2
    uintptr_t arg3;          // Event-specific argument 3
    uintptr_t arg4;          // Event-specific argument 4
    uintptr_t arg5;          // Event-specific argument 5 (added in later versions)
    uint32_t  cpuid;         // CPU core that generated event
    uint32_t  threadid;      // Thread that generated event
};

// debugid format:
// [31:24] = Class (DBG_MACH, DBG_NETWORK, DBG_FSYSTEM, DBG_BSD, etc.)
// [23:16] = Subclass
// [15:2]  = Code (specific event)
// [1:0]   = Flags (FUNC_START, FUNC_END, etc.)

Example debugid values:
DBG_MACH_SCHED (0x01): Mach scheduler events
  0x01400000 = Context switch
  0x01400004 = Thread block
  0x01400008 = Thread unblock

DBG_FSYSTEM (0x03): File system events
  0x03010000 = open() start
  0x03010004 = open() end
  0x03020000 = read() start
  0x03020004 = read() end
\`\`\`

\`\`\`bash
# Enable kernel tracing (requires root)
sudo ktrace trace -t n -o trace.ktrace sleep 5
# Records all kernel events for 5 seconds

# View raw trace
sudo ktrace dump trace.ktrace | head -20
# Shows: timestamp, thread, debugid, event name, arguments

# Trace specific events only
sudo ktrace trace -f network -o network.ktrace
# -f options: network, fs, bsd, mach, vm, disk, thread

# Live tracing
sudo ktrace artrace -p <PID>
# Shows live kernel events for process
\`\`\`

### os_signpost — Custom Trace Points

The most powerful Instruments feature: custom trace points with zero overhead when not profiling.

\`\`\`swift
import os.signpost

// Create log handle (subsystem + category)
let log = OSLog(subsystem: "com.example.myapp", category: "networking")

// Signpost interval (measures duration)
let signpostID = OSSignpostID(log: log)
os_signpost(.begin, log: log, name: "Download", signpostID: signpostID,
            "URL: %{public}s", url.absoluteString)

// ... do work ...

os_signpost(.end, log: log, name: "Download", signpostID: signpostID,
            "Bytes: %lld", bytesDownloaded)

// Point of Interest (instant event, no duration)
os_signpost(.event, log: log, name: "Cache Hit", "Key: %{public}s", key)
\`\`\`

\`\`\`objc
// Objective-C equivalent
#import <os/signpost.h>

os_log_t log = os_log_create("com.example.myapp", "networking");
os_signpost_id_t spid = os_signpost_id_generate(log);

os_signpost_interval_begin(log, spid, "Download", "URL: %{public}s", url);
// ... work ...
os_signpost_interval_end(log, spid, "Download", "Bytes: %lld", bytes);
\`\`\`

**Why signposts are magic**:
- When Instruments isn't running: compiled to a few instructions, negligible overhead (~10ns)
- When Instruments IS running: full trace data with arguments
- Nested signposts show call hierarchy
- Signposts are color-coded in Instruments timeline
- Can filter/search by signpost name

### Time Profiler — How CPU Sampling Works

\`\`\`
Time Profiler samples the call stack 1000 times per second (1ms interval):

For each sample:
1. Interrupt the CPU (via timer interrupt)
2. Walk the stack (frame pointers or unwind info)
3. Record instruction addresses
4. Map addresses to symbols (function names)
5. Aggregate samples into call tree

Result: Statistical profile of where CPU time is spent
- 1000 samples in function Foo = ~1000ms in Foo
- Not exact, but statistically accurate with large sample counts

Call tree weight calculation:
Self time: Samples where this function is at top of stack
Total time: Samples where this function appears anywhere in stack
\`\`\`

\`\`\`bash
# Command-line time profiling (no GUI)
sudo sample <process-name> 10 -file profile.txt
# Samples process for 10 seconds, outputs call tree

# Profile by PID
sudo sample <PID> 10

# Output format shows:
# Call path         Self ms    Total ms
# main                 100       5000
#   processData        200       4800
#     parseJSON       2000       4600
#       malloc        1500       2600
\`\`\`

### Allocations — Memory Tracking Magic

\`\`\`
Allocations instrument intercepts malloc/free:

malloc_zone_t *zone = malloc_default_zone();
// Instruments replaces zone functions:
zone->malloc = instrumented_malloc;
zone->free = instrumented_free;

instrumented_malloc(size_t size) {
    void *ptr = real_malloc(size);
    record_allocation(ptr, size, backtrace());
    return ptr;
}

instrumented_free(void *ptr) {
    record_deallocation(ptr);
    real_free(ptr);
}

Result: Complete allocation history
- Every allocation tracked with size + backtrace
- Every deallocation tracked
- Live vs freed memory
- Allocation pattern detection (zombies, abandoned memory)
\`\`\`

**Generations**: The killer feature

\`\`\`
Mark Generation in Instruments → snapshot of live allocations
Do something (load image, process data, etc.)
Mark Generation again → diff shows new allocations

Use case: Find memory leaks
1. Mark generation (baseline)
2. Perform action
3. Undo action (close window, clear cache)
4. Mark generation
5. Diff shows: allocations that should have been freed but weren't
→ That's your leak
\`\`\`

### Leaks — Heap Graph Analysis

\`\`\`
Leaks instrument builds a reachability graph:

1. Scan all memory (stack, registers, globals)
2. Find all pointers to heap allocations
3. Build directed graph: allocation → allocation
4. Find allocations with no incoming edges
→ Unreachable = leaked

Leak types:
├── Leaked: Definitely unreachable
├── Abandoned: No references from app code, but might be in system caches
└── Cached: In cache but not "leaked" (e.g., NSImage cache)

Why leaks are hard to find manually:
- Retain cycles (A→B→A)
- Weak references not breaking cycles
- Blocks capturing self
- Closures capturing context
\`\`\`

### Memory Graph Debugger — Visual Heap Analysis

\`\`\`bash
# Capture memory graph (in Xcode or standalone)
leaks --outputGraph=/tmp/memgraph.memgraph <PID>

# Open in Instruments
open /tmp/memgraph.memgraph

# Or analyze programmatically
heap <PID> -sortBySize
# Shows all allocations sorted by size

vmmap <PID> | grep -i stack
# Shows memory regions (stack, heap, dylib, etc.)

# Find specific allocation
malloc_history <PID> <address>
# Shows allocation backtrace for specific address
\`\`\`

## DTrace — The Kernel Probe System

DTrace is macOS's most powerful debugging tool. It lets you dynamically instrument the entire system — kernel and userspace — with **zero overhead when not tracing**.

### DTrace Architecture

\`\`\`
DTrace components:

1. Providers (kernel modules that expose probe points)
   ├── syscall: System call entry/exit
   ├── fbt: Function Boundary Tracing (every kernel function)
   ├── pid: User process tracing
   ├── profile: Timer-based sampling
   ├── io: Disk I/O tracing
   └── sdt: Statically Defined Tracing (custom probe points)

2. Probes (specific instrumentation points)
   Format: provider:module:function:name
   Example: syscall::open:entry
            pid$target:libsystem_c:printf:entry

3. D Language (probe → action scripting)
   C-like syntax for filtering and aggregating data

4. Consumers (dtrace command, Instruments)
\`\`\`

### The D Language — Crash Course

\`\`\`d
/* DTrace script syntax */

provider:module:function:name
/predicate/  /* Optional filter */
{
    action;
}

/* Example: Trace all open() calls */
syscall::open:entry
{
    printf("Process %s opening: %s\\n", execname, copyinstr(arg0));
}

/* arg0-arg9 = function arguments (architecture-specific) */
/* execname = process name */
/* pid = process ID */
/* tid = thread ID */
/* timestamp = nanoseconds since boot */
/* vtimestamp = nanoseconds CPU time for this thread */

/* Predicates (filters) */
syscall::open:entry
/execname == "Safari"/  /* Only Safari */
{
    printf("%s\\n", copyinstr(arg0));
}

/* Aggregations (statistics) */
syscall::open:entry
{
    @opens[execname] = count();  /* Count opens per process */
}

/* Print aggregation at end */
dtrace:::END
{
    printa(@opens);
}

/* Built-in aggregating functions */
@stat = count();      /* Count events */
@stat = sum(arg0);    /* Sum values */
@stat = avg(arg0);    /* Average */
@stat = min(arg0);    /* Minimum */
@stat = max(arg0);    /* Maximum */
@stat = quantize(arg0); /* Power-of-2 histogram */
@stat = lquantize(arg0, 0, 1000, 100); /* Linear histogram */
\`\`\`

### DTrace One-Liners That Will Save Your Life

\`\`\`bash
# What files is this process opening?
sudo dtrace -n 'syscall::open:entry /execname == "Safari"/ { printf("%s", copyinstr(arg0)); }'

# Which processes are using the most CPU?
sudo dtrace -n 'profile-997 { @cpu[execname] = count(); } END { printa(@cpu); }'

# Trace all function calls in a process
sudo dtrace -n 'pid$target:::entry { printf("%s", probefunc); }' -p <PID>

# What's causing disk I/O?
sudo dtrace -n 'io:::start { printf("%s %s %d bytes", execname, args[2]->fi_pathname, args[0]->b_bcount); }'

# System call latency distribution
sudo dtrace -n 'syscall:::entry { self->ts = timestamp; } syscall:::return /self->ts/ { @latency[probefunc] = quantize(timestamp - self->ts); self->ts = 0; }'

# Who's allocating memory?
sudo dtrace -n 'pid$target::malloc:entry { @allocs[ustack()] = sum(arg0); }' -p <PID>

# Network connections by process
sudo dtrace -n 'syscall::connect:entry { printf("%s connecting to %s", execname, copyinstr(arg1)); }'

# File read/write by filename
sudo dtrace -n 'syscall::read:entry,syscall::write:entry { @io[fds[arg0].fi_pathname] = count(); } END { printa(@io); }'

# Process launch tracking
sudo dtrace -n 'proc:::exec-success { printf("%s launched %s", execname, curpsinfo->pr_psargs); }'

# Page faults (memory pressure indicator)
sudo dtrace -n 'vminfo:::pgfault { @faults[execname] = count(); } END { printa(@faults); }'
\`\`\`

### Real-World DTrace: Mystery Bug Solving

**Scenario: App randomly freezing for 2-5 seconds**

\`\`\`bash
# Step 1: Is it waiting on I/O?
sudo dtrace -n '
syscall:::entry /execname == "MyApp"/ { self->ts = timestamp; }
syscall:::return /self->ts && (timestamp - self->ts) > 100000000/ {
    printf("%s took %d ms\\n", probefunc, (timestamp - self->ts) / 1000000);
    self->ts = 0;
}
' &

# Run app, trigger freeze
# Output: "stat64 took 2340 ms"
# → Waiting on filesystem

# Step 2: What file is slow?
sudo dtrace -n '
syscall::stat*:entry /execname == "MyApp"/ {
    self->path = copyinstr(arg0);
    self->ts = timestamp;
}
syscall::stat*:return /self->ts && (timestamp - self->ts) > 100000000/ {
    printf("%s took %d ms\\n", self->path, (timestamp - self->ts) / 1000000);
}
' &

# Output: "/Volumes/NetworkDrive/.DS_Store took 2400 ms"
# → Network drive timeout on .DS_Store access
# → Fix: Disable .DS_Store on network volumes
\`\`\`

## fs_usage — File System Activity Monitor

\`\`\`bash
# fs_usage is a DTrace wrapper for filesystem activity

# Watch all filesystem activity
sudo fs_usage

# Filter by process
sudo fs_usage -f filesys Safari

# Filter by operation type
sudo fs_usage -f network      # Network only
sudo fs_usage -f pathname     # File access only
sudo fs_usage -f exec         # Program execution

# Watch specific process by PID
sudo fs_usage -f filesys -p <PID>

# Common patterns:

# What's writing to disk?
sudo fs_usage -f filesys | grep -i write

# What's causing high I/O?
sudo fs_usage -f diskio

# Network activity
sudo fs_usage -f network | grep -v "127.0.0.1"

# Find process hammering a file
sudo fs_usage | grep "myfile.txt"
\`\`\`

**Reading fs_usage output**:

\`\`\`
HH:MM:SS.MICROSEC  CALL         FILE/ARGS              ELAPSED  PROCESS
14:32:05.023456    open         /Users/alice/file.txt  0.000234 Safari
14:32:05.023890    read         F=5  B=0x4000           0.000123 Safari
14:32:05.024123    close        F=5                    0.000089 Safari

CALL: System call or kernel function
F=5: File descriptor 5
B=0x4000: 16KB (bytes)
ELAPSED: Time in seconds
\`\`\`

## Activity Monitor — Beyond What You See

### The Columns Nobody Understands

\`\`\`
CPU Tab:
├── % CPU: CPU usage (100% = 1 core, 800% = 8 cores maxed)
├── CPU Time: Total CPU seconds consumed (not wall-clock time)
├── Threads: Number of threads (high threads = potential contention)
├── Idle Wake Ups/sec: How often process wakes from sleep
│   High value = battery drain (should be <10 for background apps)
└── Preventing Sleep: Process has power assertion

Memory Tab:
├── Memory: Current physical RAM usage
├── Compressed Mem: Memory compressed to save RAM
│   macOS compresses inactive memory instead of swapping
│   Compressed at ~3:1 ratio, transparent to apps
├── Private Memory: Memory not shared with other processes
│   THIS is the real memory footprint
├── Shared Memory: dylibs, frameworks, shared caches
└── Real Memory = Private + (Shared / number of sharing processes)

Disk Tab:
├── Bytes Read/Written: Cumulative since process start
├── Reads/Writes per sec: Current I/O rate
└── High I/O = check fs_usage to find culprit files

Network Tab:
├── Sent/Received: Cumulative network traffic
└── Packets In/Out: Packet count (high packets with low bytes = many small requests)

Energy Tab (laptops only):
├── Energy Impact: Composite score (CPU + GPU + network + disk)
│   0-20: Low impact
│   20-40: Moderate
│   40+: High (battery drainer)
├── 12hr Power: Average power consumption over 12 hours
└── Preventing Sleep: Power assertions (caffeinate, active downloads)
\`\`\`

### Energy Impact Calculation (Reverse Engineered)

\`\`\`
Energy Impact score approximation:

energy_impact = (
    cpu_usage * CPU_WEIGHT +
    gpu_usage * GPU_WEIGHT +
    network_bytes * NETWORK_WEIGHT +
    disk_io_bytes * DISK_WEIGHT +
    display_on * DISPLAY_WEIGHT
) / TIME_WINDOW

Weights (approximate):
CPU_WEIGHT = 100
GPU_WEIGHT = 150
NETWORK_WEIGHT = 0.1
DISK_WEIGHT = 0.05
DISPLAY_WEIGHT = 50

Example: Safari playing 1080p video
├── CPU: 30% → 30
├── GPU: 20% → 30
├── Network: 5 MB/s → 0.5
├── Disk: 0 → 0
├── Display: On → 50
└── Total: ~110 energy impact (high)
\`\`\`

## Memory Pressure System — How macOS Manages RAM

\`\`\`
macOS memory states:

1. Green (Low Pressure)
   ├── Plenty of free pages available
   ├── No compression needed
   └── Apps can allocate freely

2. Yellow (Medium Pressure)
   ├── Free pages running low
   ├── Memory compression active
   ├── Kernel sends "memory pressure" notifications
   └── Apps should free caches

3. Red (High Pressure)
   ├── Very low free pages
   ├── Heavy compression
   ├── Swap file in use
   ├── Kernel may terminate background processes
   └── App launches may fail

Memory pressure calculation:
pressure = f(
    free_pages,
    purgeable_pages,
    compression_ratio,
    swap_usage,
    page_fault_rate
)

Priority for reclamation:
1. File cache (can be re-read from disk)
2. Purgeable memory (NSPurgeableData, etc.)
3. Compressed memory (uncompress when accessed)
4. Inactive pages (swap to disk)
5. Terminate low-priority processes
\`\`\`

\`\`\`bash
# Check memory pressure
memory_pressure
# System-wide memory pressure: Normal/Warning/Critical

# Detailed VM stats
vm_stat 1
# Shows: free pages, active, inactive, wired, compressed

# Interpret vm_stat output:
# Pages free: Available memory
# Pages active: Recently used, likely to be used again
# Pages inactive: Not recently used, can be reclaimed
# Pages wired: Cannot be paged out (kernel, drivers)
# Pages compressed: Compressed in-memory
# Compressions: Number of compression operations
# Decompressions: Number of decompress operations
# Swapins/Swapouts: Pages moved to/from swap file

# Memory pressure notifications (for apps)
# Apps can register for NSProcessInfoPowerStateDidChangeNotification
# Or implement applicationDidReceiveMemoryWarning (iOS paradigm)
\`\`\`

### Compressed Memory — The Secret Sauce

\`\`\`
Compressed Memory Flow:

App allocates 1GB, uses 500MB actively
    ↓
macOS identifies 500MB as inactive
    ↓
Compress 500MB → ~150MB (3:1 ratio typical)
    ↓
Free 350MB for other uses
    ↓
App touches compressed page
    ↓
Page fault → decompress page
    ↓
Transparently available (app unaware)

Compression algorithm: LZ4 (very fast)
├── Compression: ~400 MB/s per core
├── Decompression: ~2 GB/s per core
└── Faster than SSD I/O (avoids swap)

Why it's brilliant:
├── Reclaims memory without swap I/O
├── Lower latency than swap (decompress < disk read)
├── Battery friendly (no disk spin-up)
└── Invisible to applications

# View compression stats
vm_stat | grep compress
# Pages compressed, compressions, decompressions
\`\`\`

## Unified Logging — os_log Deep Dive

\`\`\`swift
import os.log

// Create log object (subsystem + category)
let log = OSLog(subsystem: "com.example.myapp", category: "networking")

// Log levels (increasing severity)
os_log(.debug, log: log, "Detailed debug info")     // Debug builds only
os_log(.info, log: log, "Informational message")    // Collected, not shown by default
os_log(.default, log: log, "Normal log message")    // Default level
os_log(.error, log: log, "Error occurred")          // Errors
os_log(.fault, log: log, "Critical fault")          // System faults

// Privacy: arguments are PRIVATE by default
os_log(.info, log: log, "User %@ logged in", username)  // username redacted in logs
os_log(.info, log: log, "User %{public}@ logged in", username)  // NOT redacted

// Format specifiers
os_log(.info, log: log, "Value: %d", 42)              // Integer
os_log(.info, log: log, "Value: %{public}s", "text")  // String
os_log(.info, log: log, "Value: %f", 3.14)            // Float
\`\`\`

\`\`\`bash
# Stream live logs (like tail -f)
log stream

# Filter by subsystem
log stream --predicate 'subsystem == "com.example.myapp"'

# Filter by process
log stream --process Safari

# Filter by level
log stream --level debug

# Show logs from last hour
log show --last 1h

# Combine filters
log show --predicate 'subsystem == "com.example.myapp" AND eventMessage CONTAINS "error"' --last 30m

# Export logs
log collect --output myapp.logarchive
# Creates .logarchive file (can open in Console.app)

# Search across all logs
log show --predicate 'eventMessage CONTAINS "crash"' --info --debug

# Signpost filtering (from Instruments)
log show --predicate 'subsystem == "com.example.myapp" AND category == "performance"'
\`\`\`

### Log Format — .tracev3 Binary Format

\`\`\`
Logs stored in: /var/db/diagnostics/
Format: Custom binary format (.tracev3)

Why binary?
├── 10x smaller than text
├── Structured data (not just strings)
├── Fast indexing (SQLite-like)
└── Supports streaming without file writes

Log lifecycle:
1. os_log() called → formatted in-process
2. Message sent to logd daemon (via Mach IPC)
3. logd writes to memory buffer
4. Buffer persisted to .tracev3 files
5. Old logs rotated out (typically 7 days)

Privacy implementation:
├── Private strings hashed at log time
├── Hash stored, original discarded
├── Console.app shows "<private>" for redacted
└── No way to recover private data after logging
\`\`\`

## Performance Tuning — sysctl Knobs

\`\`\`bash
# View all tunable parameters
sysctl -a

# Network tuning
sysctl net.inet.tcp.win_scale_factor    # TCP window scaling
sysctl net.inet.tcp.sendspace            # TCP send buffer
sysctl net.inet.tcp.recvspace            # TCP receive buffer

# Increase TCP buffers for high-bandwidth connections
sudo sysctl -w net.inet.tcp.sendspace=131072
sudo sysctl -w net.inet.tcp.recvspace=131072

# VM tuning (CAREFUL — can break system)
sysctl vm.swapusage                      # Swap usage
sysctl vm.loadavg                        # Load average
sysctl vm.page_free_target               # Free page target

# File system
sysctl vfs.generic.nfs.client.mount_count  # NFS mounts
sysctl kern.maxfiles                        # Max open files
sysctl kern.maxfilesperproc                 # Max files per process

# Increase file descriptor limit
sudo sysctl -w kern.maxfiles=65536
sudo sysctl -w kern.maxfilesperproc=32768

# Kernel
sysctl kern.version                      # Kernel version string
sysctl kern.osversion                    # Build version
sysctl kern.hostname                     # Hostname

# Hardware
sysctl hw.physmem                        # Physical RAM (bytes)
sysctl hw.memsize                        # User-accessible RAM
sysctl hw.ncpu                           # Number of CPUs
sysctl hw.cpufrequency                   # CPU frequency
sysctl hw.l1icachesize                   # L1 instruction cache
sysctl hw.l1dcachesize                   # L1 data cache
sysctl hw.l2cachesize                    # L2 cache
sysctl hw.l3cachesize                    # L3 cache (if present)

# Make changes persistent
sudo vi /etc/sysctl.conf
# Add: net.inet.tcp.sendspace=131072
\`\`\`

This is just scratching the surface. Real performance tuning requires profiling (Instruments), identifying bottlenecks, then targeted optimization. The tools are here — now you know how to wield them.`,

  fr: `# macOS Avancé — Le grand bain de l'ingénierie

Cette leçon couvre les outils et techniques qui séparent les utilisateurs macOS des ingénieurs macOS. Ce sont les workflows de débogage et de profilage utilisés chez Apple pour construire macOS lui-même.

## Instruments — Le profileur qui voit tout

Instruments n'est pas un profileur. C'est un **débogueur de voyage dans le temps** qui enregistre tout ce que fait votre app, puis vous laisse l'analyser de manière non linéaire. Comprendre Instruments signifie comprendre comment fonctionne le traçage du noyau macOS.

### Architecture d'Instruments

\`\`\`
Comment fonctionne Instruments :

L'application s'exécute
    ↓
Le noyau enregistre les événements via kdebug
    ├── Appels système
    ├── Opérations VM
    ├── Événements de l'ordonnanceur
    ├── Opérations I/O
    └── Signposts personnalisés (os_signpost)
    ↓
Événements écrits dans le buffer de trace du noyau
    ↓
Le daemon Instruments lit le buffer
    ↓
Événements écrits dans le fichier .trace
    ↓
Instruments.app analyse le fichier .trace
\`\`\`

**Point critique** : Instruments enregistre TOUT, puis vous choisissez quoi analyser. Le fichier trace contient la timeline complète — CPU, mémoire, I/O, réseau, tout simultanément.

### os_signpost — Points de trace personnalisés

\`\`\`swift
import os.signpost

let log = OSLog(subsystem: "com.example.monapp", category: "networking")

// Intervalle de signpost (mesure la durée)
let signpostID = OSSignpostID(log: log)
os_signpost(.begin, log: log, name: "Download", signpostID: signpostID,
            "URL: %{public}s", url.absoluteString)

// ... faire le travail ...

os_signpost(.end, log: log, name: "Download", signpostID: signpostID,
            "Bytes: %lld", bytesDownloaded)
\`\`\`

**Pourquoi les signposts sont magiques** :
- Quand Instruments ne tourne pas : compilé en quelques instructions, surcoût négligeable (~10ns)
- Quand Instruments TOURNE : données de trace complètes avec arguments
- Les signposts imbriqués montrent la hiérarchie d'appels

### Time Profiler — Comment fonctionne l'échantillonnage CPU

\`\`\`
Time Profiler échantillonne la pile d'appels 1000 fois par seconde :

Pour chaque échantillon :
1. Interrompre le CPU
2. Parcourir la pile
3. Enregistrer les adresses d'instruction
4. Mapper les adresses aux symboles
5. Agréger les échantillons dans un arbre d'appels

Résultat : Profil statistique du temps CPU dépensé
\`\`\`

## DTrace — Le système de sondes du noyau

DTrace est l'outil de débogage le plus puissant de macOS. Il vous permet d'instrumenter dynamiquement tout le système — noyau et espace utilisateur — avec **zéro surcoût quand on ne trace pas**.

### Le langage D — Cours accéléré

\`\`\`d
/* Syntaxe de script DTrace */

provider:module:function:name
/predicate/
{
    action;
}

/* Exemple : Tracer tous les appels open() */
syscall::open:entry
{
    printf("Processus %s ouvre : %s\\n", execname, copyinstr(arg0));
}
\`\`\`

### One-liners DTrace qui sauveront votre vie

\`\`\`bash
# Quels fichiers ce processus ouvre-t-il ?
sudo dtrace -n 'syscall::open:entry /execname == "Safari"/ { printf("%s", copyinstr(arg0)); }'

# Quels processus utilisent le plus de CPU ?
sudo dtrace -n 'profile-997 { @cpu[execname] = count(); } END { printa(@cpu); }'

# Tracer tous les appels de fonction dans un processus
sudo dtrace -n 'pid$target:::entry { printf("%s", probefunc); }' -p <PID>

# Qu'est-ce qui cause l'I/O disque ?
sudo dtrace -n 'io:::start { printf("%s %s %d octets", execname, args[2]->fi_pathname, args[0]->b_bcount); }'

# Qui alloue de la mémoire ?
sudo dtrace -n 'pid$target::malloc:entry { @allocs[ustack()] = sum(arg0); }' -p <PID>

# Suivi du lancement de processus
sudo dtrace -n 'proc:::exec-success { printf("%s a lancé %s", execname, curpsinfo->pr_psargs); }'
\`\`\`

## fs_usage — Moniteur d'activité du système de fichiers

\`\`\`bash
# Surveiller toute l'activité du système de fichiers
sudo fs_usage

# Filtrer par processus
sudo fs_usage -f filesys Safari

# Filtrer par type d'opération
sudo fs_usage -f network      # Réseau seulement
sudo fs_usage -f pathname     # Accès fichiers seulement

# Qu'est-ce qui écrit sur le disque ?
sudo fs_usage -f filesys | grep -i write

# Activité réseau
sudo fs_usage -f network | grep -v "127.0.0.1"
\`\`\`

## Activity Monitor — Au-delà de ce que vous voyez

### Les colonnes que personne ne comprend

\`\`\`
Onglet CPU :
├── % CPU : Utilisation CPU (100% = 1 cœur, 800% = 8 cœurs au max)
├── Temps CPU : Secondes CPU totales consommées
├── Threads : Nombre de threads
└── Réveils inactifs/s : Combien de fois le processus se réveille
    Valeur élevée = drain batterie

Onglet Mémoire :
├── Mémoire : Utilisation RAM physique actuelle
├── Mém. compressée : Mémoire compressée pour économiser la RAM
├── Mémoire privée : Mémoire non partagée avec autres processus
│   C'EST l'empreinte mémoire réelle
└── Mémoire partagée : dylibs, frameworks, caches partagés

Onglet Énergie :
├── Impact énergétique : Score composite (CPU + GPU + réseau + disque)
│   0-20 : Faible impact
│   20-40 : Modéré
│   40+ : Élevé (drain batterie)
└── Empêche la veille : Assertions d'alimentation
\`\`\`

## Système de pression mémoire — Comment macOS gère la RAM

\`\`\`
États de mémoire macOS :

1. Vert (Pression faible)
   ├── Beaucoup de pages libres disponibles
   ├── Pas de compression nécessaire
   └── Les apps peuvent allouer librement

2. Jaune (Pression moyenne)
   ├── Pages libres en baisse
   ├── Compression mémoire active
   └── Les apps devraient libérer les caches

3. Rouge (Pression élevée)
   ├── Très peu de pages libres
   ├── Compression intensive
   ├── Fichier swap en utilisation
   └── Le noyau peut terminer des processus en arrière-plan
\`\`\`

\`\`\`bash
# Vérifier la pression mémoire
memory_pressure

# Stats VM détaillées
vm_stat 1

# Interpréter la sortie vm_stat :
# Pages free : Mémoire disponible
# Pages active : Récemment utilisées
# Pages inactive : Pas récemment utilisées
# Pages wired : Ne peuvent pas être paginées
# Pages compressed : Compressées en mémoire
\`\`\`

### Mémoire compressée — La sauce secrète

\`\`\`
Flux de mémoire compressée :

L'app alloue 1 Go, utilise 500 Mo activement
    ↓
macOS identifie 500 Mo comme inactifs
    ↓
Compresse 500 Mo → ~150 Mo (ratio 3:1 typique)
    ↓
Libère 350 Mo pour d'autres usages
    ↓
L'app touche une page compressée
    ↓
Page fault → décompresse la page
    ↓
Disponible de manière transparente

Algorithme de compression : LZ4 (très rapide)
├── Compression : ~400 Mo/s par cœur
├── Décompression : ~2 Go/s par cœur
└── Plus rapide que l'I/O SSD

Pourquoi c'est brillant :
├── Récupère de la mémoire sans I/O swap
├── Latence plus faible que swap
├── Économe en batterie
└── Invisible aux applications
\`\`\`

## Journalisation unifiée — Plongée os_log

\`\`\`swift
import os.log

let log = OSLog(subsystem: "com.example.monapp", category: "networking")

// Niveaux de log
os_log(.debug, log: log, "Info de débogage détaillée")
os_log(.info, log: log, "Message informatif")
os_log(.default, log: log, "Message de log normal")
os_log(.error, log: log, "Erreur survenue")
os_log(.fault, log: log, "Faute critique")

// Confidentialité : arguments PRIVÉS par défaut
os_log(.info, log: log, "Utilisateur %@ connecté", username)  // caviardé
os_log(.info, log: log, "Utilisateur %{public}@ connecté", username)  // PAS caviardé
\`\`\`

\`\`\`bash
# Streamer les logs en direct
log stream

# Filtrer par sous-système
log stream --predicate 'subsystem == "com.example.monapp"'

# Afficher les logs de la dernière heure
log show --last 1h

# Exporter les logs
log collect --output monapp.logarchive
\`\`\`

## Réglage des performances — Paramètres sysctl

\`\`\`bash
# Voir tous les paramètres ajustables
sysctl -a

# Réglage réseau
sysctl net.inet.tcp.sendspace            # Buffer d'envoi TCP
sysctl net.inet.tcp.recvspace            # Buffer de réception TCP

# Augmenter les buffers TCP
sudo sysctl -w net.inet.tcp.sendspace=131072
sudo sysctl -w net.inet.tcp.recvspace=131072

# VM
sysctl vm.swapusage                      # Utilisation swap
sysctl vm.loadavg                        # Charge moyenne

# Système de fichiers
sysctl kern.maxfiles                     # Fichiers max ouverts
sysctl kern.maxfilesperproc             # Fichiers max par processus

# Matériel
sysctl hw.physmem                        # RAM physique
sysctl hw.ncpu                           # Nombre de CPUs
sysctl hw.cpufrequency                   # Fréquence CPU
\`\`\``,
};

export const quiz = {
  en: [
    {
      question:
        "How does Instruments capture application events with minimal overhead?",
      options: [
        "It polls the application every millisecond",
        "Events are recorded by the kernel via kdebug into a ring buffer, then read by Instruments daemon",
        "It injects code into the application",
        "It uses ptrace to intercept system calls",
      ],
      correct: 1,
    },
    {
      question:
        "What is the key advantage of os_signpost over traditional logging?",
      options: [
        "It's faster to write",
        "When Instruments isn't running, signposts compile to ~10ns of overhead — essentially free",
        "It uses less disk space",
        "It's easier to read",
      ],
      correct: 1,
    },
    {
      question: "What does DTrace's 'zero overhead when not tracing' mean?",
      options: [
        "DTrace uses very little CPU",
        "Probe points are NOPs in the code until activated — literally zero instructions executed when disabled",
        "DTrace caches results efficiently",
        "DTrace only runs at night",
      ],
      correct: 1,
    },
    {
      question: "What is compressed memory in macOS?",
      options: [
        "A file on disk that stores compressed data",
        "Inactive memory pages compressed in RAM using LZ4 — faster than swapping to disk",
        "A feature that compresses applications",
        "Encrypted storage",
      ],
      correct: 1,
    },
    {
      question: "What does 'Private Memory' represent in Activity Monitor?",
      options: [
        "Encrypted memory",
        "Memory used by private methods",
        "Memory not shared with other processes — the real memory footprint of an app",
        "Memory that requires authentication to access",
      ],
      correct: 2,
    },
  ],
  fr: [
    {
      question:
        "Comment Instruments capture-t-il les événements d'application avec un surcoût minimal ?",
      options: [
        "Il interroge l'application chaque milliseconde",
        "Les événements sont enregistrés par le noyau via kdebug dans un ring buffer, puis lus par le daemon Instruments",
        "Il injecte du code dans l'application",
        "Il utilise ptrace pour intercepter les appels système",
      ],
      correct: 1,
    },
    {
      question:
        "Quel est l'avantage clé d'os_signpost par rapport à la journalisation traditionnelle ?",
      options: [
        "C'est plus rapide à écrire",
        "Quand Instruments ne tourne pas, les signposts se compilent en ~10ns de surcoût — essentiellement gratuit",
        "Ça utilise moins d'espace disque",
        "C'est plus facile à lire",
      ],
      correct: 1,
    },
    {
      question:
        "Que signifie 'zéro surcoût quand on ne trace pas' pour DTrace ?",
      options: [
        "DTrace utilise très peu de CPU",
        "Les points de sonde sont des NOPs dans le code jusqu'à activation — littéralement zéro instruction exécutée quand désactivé",
        "DTrace met en cache les résultats efficacement",
        "DTrace ne tourne que la nuit",
      ],
      correct: 1,
    },
    {
      question: "Qu'est-ce que la mémoire compressée dans macOS ?",
      options: [
        "Un fichier sur disque qui stocke des données compressées",
        "Pages mémoire inactives compressées en RAM avec LZ4 — plus rapide que swapper sur disque",
        "Une fonctionnalité qui compresse les applications",
        "Stockage chiffré",
      ],
      correct: 1,
    },
    {
      question: "Que représente la 'Mémoire privée' dans Activity Monitor ?",
      options: [
        "Mémoire chiffrée",
        "Mémoire utilisée par les méthodes privées",
        "Mémoire non partagée avec d'autres processus — l'empreinte mémoire réelle d'une app",
        "Mémoire nécessitant une authentification",
      ],
      correct: 2,
    },
  ],
};
