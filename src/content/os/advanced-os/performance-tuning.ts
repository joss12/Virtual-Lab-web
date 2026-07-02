export const content = {
  en: `# Performance Tuning — Making Systems Scream

Performance tuning is detective work. The system is slow, but where? CPU? Memory? Disk? Network? Understanding performance deeply means understanding how to measure, analyze, and optimize at every layer of the stack.

## The Performance Analysis Methodology

\`\`\`
Step 1: Define the problem
├── Latency? (request takes 5s instead of 100ms)
├── Throughput? (1000 req/s instead of 10000 req/s)
├── Resource utilization? (CPU at 100%, app slow)
└── Tail latency? (p99 = 10s, p50 = 100ms)

Step 2: Measure (don't guess!)
├── System-wide metrics (vmstat, iostat, sar)
├── Process-level metrics (top, pidstat)
├── Application metrics (logs, APM)
└── Hardware counters (perf, PMCs)

Step 3: Profile
├── CPU profiling (perf record, flamegraph)
├── Memory profiling (valgrind, heaptrack)
├── I/O profiling (iotop, blktrace)
└── Network profiling (tcpdump, ss)

Step 4: Hypothesize bottleneck
├── CPU-bound? (100% CPU, low I/O)
├── I/O-bound? (Low CPU, high I/O wait)
├── Memory-bound? (High page faults, swap)
└── Lock contention? (threads blocked)

Step 5: Optimize targeted area
Step 6: Measure again (did it improve?)
Step 7: Repeat

NEVER optimize without measuring first!
\`\`\`

## perf — The Linux Profiler

perf is the most powerful performance tool on Linux. It uses hardware performance counters and kernel tracepoints.

### CPU Profiling with perf

\`\`\`bash
# Record CPU profile (samples call stack 99 times/sec)
perf record -F 99 -g -- ./myapp
# -F 99: Sample at 99 Hz (avoids lockstep with scheduler)
# -g: Record call graphs (stack traces)

# View report
perf report
# Shows:
# 45.00%  myapp  myapp      [.] compute_expensive
# 30.00%  myapp  libc.so    [.] memcpy
# 15.00%  myapp  myapp      [.] parse_data
# 10.00%  myapp  [kernel]   [k] page_fault

# Interactive TUI (press 'a' to annotate)
# Shows assembly with % time per instruction

# Record all CPUs
perf record -F 99 -a -g sleep 10
# -a: All CPUs (system-wide)

# Record specific PID
perf record -F 99 -g -p 12345 sleep 10

# View perf.data statistics
perf report --stdio
# Or generate flamegraph (see below)
\`\`\`

### perf stat — Hardware Counters

\`\`\`bash
# Basic stats
perf stat ./myapp
# Performance counter stats:
#     1234.567890      task-clock (msec)         #    0.999 CPUs utilized
#              12      context-switches          #    0.010 K/sec
#               2      cpu-migrations            #    0.002 K/sec
#             456      page-faults               #    0.369 K/sec
#   4,567,890,123      cycles                    #    3.700 GHz
#   2,345,678,901      instructions              #    0.51  insn per cycle
#     456,789,012      branches                  #  370.000 M/sec
#       1,234,567      branch-misses             #    0.27% of all branches

# Key metrics:
# IPC (instructions per cycle): 0.51 (low = CPU stalls)
# Branch misses: 0.27% (good, <5% is normal)
# Context switches: 12 (low = good)

# Detailed counters
perf stat -e cycles,instructions,cache-references,cache-misses,branches,branch-misses ./myapp

# L1/L2/L3 cache misses
perf stat -e L1-dcache-load-misses,L1-icache-load-misses,LLC-load-misses ./myapp

# Memory bandwidth
perf stat -e cpu/event=0x2e,umask=0x41/,cpu/event=0x2e,umask=0x42/ ./myapp
# Intel-specific: measure memory reads/writes

# TLB misses
perf stat -e dTLB-load-misses,iTLB-load-misses ./myapp
\`\`\`

### perf Annotation — Per-Instruction Profiling

\`\`\`bash
# Record with symbols
perf record -F 999 -g ./myapp

# Annotate hottest function
perf annotate --stdio compute_expensive
# Output:
#  Percent |  Source code & Disassembly
# ---------+----------------------------------
#   45.23% |  mov    0x10(%rax),%rbx        # Hot instruction
#    2.34% |  add    %rbx,%rcx
#    1.23% |  cmp    $0x0,%rbx
#    0.56% |  je     0x1234
#   40.12% |  call   expensive_function     # Another hotspot

# Interactive annotation (perf report, then press 'a')
# Shows source code with % time per line

# Why 45% on 'mov'?
# Possible causes:
# 1. Cache miss (loading from RAM, not L1/L2/L3)
# 2. TLB miss (page table walk)
# 3. Memory dependency stall
# → Need deeper investigation with perf mem
\`\`\`

### perf mem — Memory Access Profiling

\`\`\`bash
# Record memory accesses
perf mem record ./myapp
# Uses PEBS (Precise Event-Based Sampling) on Intel
# Records exact instruction causing cache miss

# Report memory access patterns
perf mem report
# Shows:
# 50.00%  myapp  [.] compute  L1 hit
# 30.00%  myapp  [.] compute  L2 hit
# 15.00%  myapp  [.] compute  L3 hit
#  5.00%  myapp  [.] compute  RAM (L3 miss)

# Memory latency per access
perf mem report --sort=mem,snoop
# Shows NUMA remote vs local access latency
\`\`\`

## Flamegraphs — Visualizing Performance

\`\`\`bash
# Install flamegraph tools
git clone https://github.com/brendangregg/FlameGraph
cd FlameGraph

# Generate flamegraph from perf data
perf record -F 99 -a -g -- sleep 30
perf script | ./stackcollapse-perf.pl | ./flamegraph.pl > flamegraph.svg

# Open in browser
firefox flamegraph.svg

# Reading flamegraphs:
# X-axis: Alphabetical order (NOT time!)
# Y-axis: Stack depth (call hierarchy)
# Width: % of samples (CPU time)
# Color: Random (or custom)

# Wide box at top = hotspot (optimize this!)
# Tall stack = deep call chain
# Flat graph = tight loop

# Off-CPU flamegraph (blocked time)
git clone https://github.com/brendangregg/FlameGraph
./flamegraph.pl --title="Off-CPU Time" --countname=us < off-cpu.folded > off-cpu.svg

# Differential flamegraphs (compare before/after)
./difffolded.pl before.folded after.folded | ./flamegraph.pl > diff.svg
# Red = worse, Blue = better
\`\`\`

## eBPF — Programmable Kernel Tracing

eBPF is the modern way to trace Linux systems. It's a VM in the kernel that runs user-defined programs safely.

### eBPF Architecture

\`\`\`
User space:
├── Write eBPF program (C-like syntax)
├── Compile to eBPF bytecode (clang -target bpf)
├── Load into kernel (bpf() syscall)
└── Attach to hook point (kprobe, tracepoint, etc.)

Kernel space:
├── eBPF verifier checks program safety
│   ├── No infinite loops (all loops must be bounded)
│   ├── No kernel memory corruption
│   ├── Limited stack (512 bytes)
│   └── Terminates in <4096 instructions
├── JIT compile to native code (x86/ARM/...)
├── Program runs at hook point (e.g., every syscall)
└── Data sent to user via maps or perf events

eBPF maps (shared memory between kernel and user):
├── Hash maps
├── Arrays
├── Per-CPU arrays (lockless)
├── Ring buffers (for events)
└── Stack traces
\`\`\`

### BCC — eBPF Toolkit

\`\`\`python
# BCC: eBPF compiler collection (Python frontend)
from bcc import BPF

# eBPF program (runs in kernel)
prog = """
#include <uapi/linux/ptrace.h>

// Map: syscall_name -> count
BPF_HASH(counts, u64, u64);

// Hook: execve syscall entry
int syscall__execve(struct pt_regs *ctx) {
    u64 key = 0;
    u64 *val, zero = 0;
    
    val = counts.lookup_or_init(&key, &zero);
    (*val)++;
    
    return 0;
}
"""

# Compile and load
b = BPF(text=prog)
b.attach_kprobe(event="sys_execve", fn_name="syscall__execve")

# Read map periodically
import time
while True:
    time.sleep(1)
    counts = b["counts"]
    for k, v in counts.items():
        print(f"execve called {v.value} times")
\`\`\`

### bpftrace — eBPF One-Liners

\`\`\`bash
# bpftrace: awk-like language for eBPF

# Count syscalls by name
bpftrace -e 'tracepoint:syscalls:sys_enter_* { @[probe] = count(); }'

# Trace file opens
bpftrace -e 'tracepoint:syscalls:sys_enter_openat { printf("%s opened %s\\n", comm, str(args->filename)); }'

# Trace TCP connects
bpftrace -e 'kprobe:tcp_connect { printf("%s connecting\\n", comm); }'

# Profile kernel stack
bpftrace -e 'profile:hz:99 { @[kstack] = count(); }'

# Measure syscall latency
bpftrace -e 'tracepoint:syscalls:sys_enter_read { @start[tid] = nsecs; } 
             tracepoint:syscalls:sys_exit_read /@start[tid]/ { 
                 @latency_us = hist((nsecs - @start[tid]) / 1000);
                 delete(@start[tid]);
             }'

# Output:
# @latency_us:
# [1, 2)      12 |@@@@                                              |
# [2, 4)      45 |@@@@@@@@@@@@@@@@@                                 |
# [4, 8)     123 |@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@ |
# [8, 16)     67 |@@@@@@@@@@@@@@@@@@@@@@                            |
# Histogram shows read() latency distribution

# TCP retransmit tracking
bpftrace -e 'kprobe:tcp_retransmit_skb { @retransmits[comm] = count(); }'

# Page fault types
bpftrace -e 'software:page-fault:1 { @faults[comm] = count(); }'

# Block I/O latency per device
bpftrace -e 'tracepoint:block:block_rq_complete { 
    @io_latency[args->dev] = hist(args->nr_sector); 
}'
\`\`\`

### Real eBPF Program — Tracing malloc()

\`\`\`c
// malloc_trace.c - Trace all malloc() calls
#include <uapi/linux/ptrace.h>

BPF_HASH(sizes, u64, u64);  // pid -> total allocated
BPF_PERF_OUTPUT(events);     // Send events to userspace

struct malloc_event {
    u32 pid;
    u64 size;
    u64 address;
    char comm[16];
};

// Hook: malloc entry (libc)
int malloc_enter(struct pt_regs *ctx) {
    u64 size = PT_REGS_PARM1(ctx);  // First argument
    struct malloc_event event = {};
    
    event.pid = bpf_get_current_pid_tgid() >> 32;
    event.size = size;
    bpf_get_current_comm(&event.comm, sizeof(event.comm));
    
    events.perf_submit(ctx, &event, sizeof(event));
    
    // Update total allocation
    u64 *total = sizes.lookup(&event.pid);
    if (total) {
        *total += size;
    } else {
        sizes.update(&event.pid, &size);
    }
    
    return 0;
}

// Hook: malloc return
int malloc_return(struct pt_regs *ctx) {
    u64 addr = PT_REGS_RC(ctx);  // Return value
    // ... (store addr for matching with free())
    return 0;
}
\`\`\`

\`\`\`python
# Load and attach
from bcc import BPF

b = BPF(src_file="malloc_trace.c")
b.attach_uprobe(name="c", sym="malloc", fn_name="malloc_enter")
b.attach_uretprobe(name="c", sym="malloc", fn_name="malloc_return")

# Print events
def print_event(cpu, data, size):
    event = b["events"].event(data)
    print(f"{event.comm.decode()} allocated {event.size} bytes")

b["events"].open_perf_buffer(print_event)
while True:
    b.perf_buffer_poll()
\`\`\`

## CPU Performance Analysis

### Identifying CPU Bottlenecks

\`\`\`bash
# System-wide CPU usage
mpstat 1
# CPU    %usr   %nice    %sys %iowait    %irq   %soft  %steal  %guest  %gsidle   %idle
# all   45.67    0.00   12.34    5.67    0.12    1.23    0.00    0.00     0.00   34.97

# Interpretation:
# %usr: User code (45%) — app is CPU-bound
# %sys: Kernel code (12%) — lots of syscalls
# %iowait: Waiting for I/O (5%) — some I/O blocking
# %idle: Idle (35%) — CPU not fully utilized

# Per-CPU stats
mpstat -P ALL 1
# Shows CPU 0, CPU 1, ... individually
# Unbalanced: One CPU at 100%, others idle = single-threaded bottleneck

# CPU frequency (turbo boost)
cat /proc/cpuinfo | grep MHz
# cpu MHz : 4800.000  (turbo active)
# cpu MHz : 2400.000  (base frequency, throttled)

# Check thermal throttling
dmesg | grep -i thermal
# CPU0: Package temperature above threshold
# → Overheating, reducing performance

# Context switches
vmstat 1
# r  b   swpd   free   ... cs
# 2  0      0  16384   ... 12000

# High cs (context switches) = thread contention
# r > CPU count = runqueue saturation
\`\`\`

### Cache Optimization

\`\`\`c
// Bad: Cache-unfriendly (column-major access)
int matrix[1000][1000];
for (int j = 0; j < 1000; j++) {
    for (int i = 0; i < 1000; i++) {
        sum += matrix[i][j];  // Cache miss every access (different cache line)
    }
}

// Good: Cache-friendly (row-major access)
for (int i = 0; i < 1000; i++) {
    for (int j = 0; j < 1000; j++) {
        sum += matrix[i][j];  // Cache hit (sequential access, same cache line)
    }
}

// Measure cache performance:
// perf stat -e cache-references,cache-misses ./bad
// Cache-references: 10,000,000
// Cache-misses:      9,500,000 (95% miss rate - TERRIBLE)

// perf stat -e cache-references,cache-misses ./good
// Cache-references: 10,000,000
// Cache-misses:        100,000 (1% miss rate - EXCELLENT)

// Result: 10-20x speedup from cache optimization alone
\`\`\`

### Branch Prediction Optimization

\`\`\`c
// Bad: Unpredictable branches
int data[1000];  // Random values 0-255
int sum = 0;

for (int i = 0; i < 1000; i++) {
    if (data[i] >= 128) {  // 50% true, 50% false (random)
        sum += data[i];
    }
}

// perf stat: 50% branch-miss rate

// Good: Sort data first (predictable pattern)
std::sort(data, data + 1000);

for (int i = 0; i < 1000; i++) {
    if (data[i] >= 128) {  // First 500: false, Last 500: true
        sum += data[i];
    }
}

// perf stat: 0.2% branch-miss rate
// 5-10x faster even with sort overhead

// Alternative: Branchless
sum += data[i] * (data[i] >= 128);  // Conditional move, no branch
\`\`\`

## Memory Performance Analysis

### Memory Bandwidth Profiling

\`\`\`bash
# Install Intel Memory Latency Checker
./mlc --bandwidth_matrix
# Output shows NUMA memory bandwidth between nodes

# Measure with perf
perf stat -e cpu/event=0xb7,umask=0x1,name=OFF_CORE_RESPONSE_0.ANY_REQUEST.L3_MISS.LOCAL_DRAM/ ./myapp
# Shows local DRAM bandwidth usage

# Measure page faults
perf stat -e page-faults,minor-faults,major-faults ./myapp
# Minor faults: Page in memory but not in page table (fast)
# Major faults: Page on disk, must read (slow)

# Memory allocator profiling
LD_PRELOAD=/usr/lib/x86_64-linux-gnu/libtcmalloc.so HEAPPROFILE=/tmp/heap ./myapp
# TCMalloc heap profiler
# Or use jemalloc, mimalloc with profiling
\`\`\`

### NUMA Optimization

\`\`\`bash
# Check NUMA topology
numactl --hardware
# node 0 cpus: 0 1 2 3
# node 1 cpus: 4 5 6 7
# node distances:
# node   0   1
#   0:  10  21

# Measure NUMA traffic
numastat
#                           node0           node1
# numa_hit              1000000000        500000000
# numa_miss                 100000           50000  # Remote access (slow)
# numa_foreign               50000          100000

# Optimize: Pin process to node
numactl --cpunodebind=0 --membind=0 ./myapp
# Runs on node 0 CPUs, allocates from node 0 memory

# First-touch policy (allocate where accessed)
# Better: Parallel initialization
#pragma omp parallel for
for (int i = 0; i < N; i++) {
    data[i] = 0;  // Each thread initializes its portion
}
// Pages allocated on node where thread runs

# Automatic NUMA balancing (kernel)
cat /proc/sys/kernel/numa_balancing
# 1 = enabled (kernel migrates pages to accessing CPU's node)
\`\`\`

## I/O Performance Analysis

### Block I/O Profiling

\`\`\`bash
# I/O stats per device
iostat -x 1
# Device  r/s  w/s  rkB/s  wkB/s  ... util%
# sda    100   50  10240   5120  ... 85.00

# Interpretation:
# util > 80%: Device saturated
# High await: Slow I/O (queuing or slow device)
# High svctm: Device service time (hardware issue)

# I/O by process
iotop -o
# Shows which processes are doing I/O

# Block layer tracing
blktrace -d /dev/sda -o - | blkparse -i -
# Detailed I/O requests: queue, issue, complete

# I/O scheduler
cat /sys/block/sda/queue/scheduler
# [mq-deadline] none kyber bfq

# SSD: use none or kyber (no reordering needed)
# HDD: use mq-deadline (reorder for sequential access)

# Read-ahead tuning
cat /sys/block/sda/queue/read_ahead_kb
# 128 (default)
# Increase for sequential workloads:
echo 4096 > /sys/block/sda/queue/read_ahead_kb

# I/O latency histogram
bpftrace -e 'tracepoint:block:block_rq_complete {
    @latency_ms = hist((args->sector - args->sector) / 1000);
}'
\`\`\`

### Filesystem Performance

\`\`\`bash
# Filesystem cache stats
cat /proc/meminfo | grep -i cache
# Cached: 8GB  (page cache)
# Buffers: 1GB (block device cache)

# Drop caches (for testing)
echo 3 > /proc/sys/vm/drop_caches
# 1 = page cache
# 2 = dentries/inodes
# 3 = both

# Filesystem I/O patterns
filefrag /path/to/large/file
# /path/to/large/file: 1234 extents found
# Fragmentation: More extents = slower reads

# XFS performance
xfs_io -c "stat" /mnt/xfs/file
# Shows block allocation, holes

# Ext4 performance
dumpe2fs /dev/sda1 | grep -i inode
# Free inodes, reserved blocks
\`\`\`

## Network Performance Analysis

### Network Profiling

\`\`\`bash
# Network interface stats
sar -n DEV 1
# IFACE   rxpck/s   txpck/s  rxkB/s   txkB/s
# eth0      10000      5000   12800     6400

# Dropped packets (buffer overflow)
netstat -i
# RX-DRP: Receive drops (increase buffer)
# TX-DRP: Transmit drops

# TCP retransmissions
netstat -s | grep -i retrans
# 12345 segments retransmitted
# High retransmits = packet loss or congestion

# Socket buffer sizes
sysctl net.core.rmem_max
sysctl net.core.wmem_max
# Increase for high-bandwidth:
sysctl -w net.core.rmem_max=134217728
sysctl -w net.core.wmem_max=134217728

# TCP tuning
sysctl net.ipv4.tcp_congestion_control
# cubic (default), bbr (better for lossy networks)

sysctl -w net.ipv4.tcp_congestion_control=bbr

# Connection tracking
conntrack -L -o extended
# Shows all tracked connections (NAT, firewall)

# Network latency
ss -tin
# Shows TCP info including RTT

# Measure with bpftrace
bpftrace -e 'kprobe:tcp_rcv_established { @rtt[comm] = hist(args->sk->srtt_us >> 3); }'
\`\`\`

### Network Stack Bypass

\`\`\`
Kernel bypass techniques:

DPDK (Data Plane Development Kit):
├── Poll-mode drivers (no interrupts)
├── Direct NIC access (bypass kernel)
├── Result: 10-100x lower latency
└── Used in: Routers, firewalls, low-latency trading

XDP (eXpress Data Path):
├── eBPF programs run in NIC driver
├── Drop/modify packets before sk_buff allocation
├── Result: 10x faster than iptables
└── Used in: DDoS mitigation, load balancing

io_uring (async I/O):
├── Kernel 5.1+
├── Shared ring buffers (no syscall per I/O)
├── Result: 2-3x faster than epoll
└── Used in: High-performance servers
\`\`\`

## Real-World Optimization Case Study

### Problem: Web Server Slow Under Load

\`\`\`bash
# Symptom: 500ms p99 latency, should be <100ms

# Step 1: System-wide view
vmstat 1
# r: 16 (runqueue, 8 CPUs → saturated)
# si/so: 0 (no swapping)
# us: 60%, sy: 30%, id: 10%

# High sys% → kernel overhead
# Hypothesis: Syscall storm

# Step 2: Profile syscalls
perf record -e syscalls:sys_enter_* -a -g sleep 10
perf report
# 80% in read() and write()

# Step 3: Trace with strace
strace -c -p $(pidof webserver)
# % time     seconds  usecs/call  calls    errors syscall
# 45.67    12.34567          10  1234567         read
# 34.56     9.87654           8  1234567         write

# 2.5M syscalls in 10s = 250K/sec
# Each syscall ~1-2μs overhead
# Total overhead: 250ms/sec (25% CPU wasted)

# Root cause: No buffering, reading/writing 1 byte at a time

# Step 4: Fix (use buffered I/O)
# Before: read(fd, buf, 1) in loop
# After: read(fd, buf, 4096) bulk read

# Step 5: Measure again
perf stat ./webserver_fixed
# Syscalls reduced from 250K/s to 50/s
# Latency p99: 50ms (10x improvement)

# Step 6: Further optimization with io_uring
# Async I/O, no syscall per operation
# Latency p99: 20ms (another 2.5x improvement)
\`\`\`

## Profiling Tools Cheat Sheet

\`\`\`bash
# CPU profiling
perf record -F 99 -a -g sleep 30        # Sample all CPUs
perf report                             # View report

# Memory profiling
valgrind --tool=massif ./myapp          # Heap profiling
ms_print massif.out.12345               # Visualize

# I/O profiling
iotop -o                                # I/O by process
blktrace -d /dev/sda -o trace           # Block layer trace

# Network profiling
tcpdump -i eth0 -w capture.pcap         # Packet capture
ss -tin                                 # TCP stats

# System-wide
sar -A 1                                # All stats every 1s
dstat -ta --top-cpu --top-mem           # Combined view

# eBPF tracing
bpftrace -e 'kprobe:* { @[probe] = count(); }'  # Count all kprobes
\`\`\`

Performance tuning never ends. There's always another bottleneck, always another optimization. But with these tools, you can find and fix them.`,

  fr: `# Optimisation des performances — Faire crier les systèmes

L'optimisation des performances est un travail de détective. Le système est lent, mais où ? CPU ? Mémoire ? Disque ? Réseau ? Comprendre les performances en profondeur signifie comprendre comment mesurer, analyser et optimiser à chaque couche de la pile.

## La méthodologie d'analyse des performances

\`\`\`
Étape 1 : Définir le problème
├── Latence ? (requête prend 5s au lieu de 100ms)
├── Débit ? (1000 req/s au lieu de 10000 req/s)
├── Utilisation des ressources ? (CPU à 100%)
└── Latence de queue ? (p99 = 10s, p50 = 100ms)

Étape 2 : Mesurer (ne devinez pas !)
├── Métriques système (vmstat, iostat, sar)
├── Métriques processus (top, pidstat)
└── Compteurs matériels (perf, PMCs)

Étape 3 : Profiler
├── Profilage CPU (perf record, flamegraph)
├── Profilage mémoire (valgrind, heaptrack)
└── Profilage I/O (iotop, blktrace)

Étape 4 : Hypothèse sur le goulot
├── Limité CPU ?
├── Limité I/O ?
├── Limité mémoire ?
└── Contention de verrous ?

Étape 5 : Optimiser la zone ciblée
Étape 6 : Mesurer à nouveau
Étape 7 : Répéter

NE JAMAIS optimiser sans mesurer d'abord !
\`\`\`

## perf — Le profileur Linux

\`\`\`bash
# Enregistrer profil CPU
perf record -F 99 -g -- ./monapp
# -F 99 : Échantillonner à 99 Hz
# -g : Enregistrer les graphes d'appels

# Voir le rapport
perf report

# Enregistrer tous les CPUs
perf record -F 99 -a -g sleep 10

# Stats de base
perf stat ./monapp
\`\`\`

## Flamegraphs — Visualiser les performances

\`\`\`bash
# Générer flamegraph
perf record -F 99 -a -g -- sleep 30
perf script | ./stackcollapse-perf.pl | ./flamegraph.pl > flamegraph.svg

# Lire les flamegraphs :
# Axe X : Ordre alphabétique
# Axe Y : Profondeur de pile
# Largeur : % d'échantillons
\`\`\`

## eBPF — Traçage noyau programmable

\`\`\`bash
# bpftrace : one-liners

# Compter les syscalls
bpftrace -e 'tracepoint:syscalls:sys_enter_* { @[probe] = count(); }'

# Tracer les ouvertures de fichiers
bpftrace -e 'tracepoint:syscalls:sys_enter_openat { printf("%s\\n", str(args->filename)); }'

# Mesurer latence syscall
bpftrace -e 'tracepoint:syscalls:sys_enter_read { @start[tid] = nsecs; } 
             tracepoint:syscalls:sys_exit_read { @latency = hist(nsecs - @start[tid]); }'
\`\`\`

## Analyse performance CPU

\`\`\`bash
# Utilisation CPU système
mpstat 1

# Stats par CPU
mpstat -P ALL 1

# Changements de contexte
vmstat 1
\`\`\`

## Analyse performance mémoire

\`\`\`bash
# Défauts de page
perf stat -e page-faults ./monapp

# Topologie NUMA
numactl --hardware

# Stats NUMA
numastat
\`\`\`

## Analyse performance I/O

\`\`\`bash
# Stats I/O par périphérique
iostat -x 1

# I/O par processus
iotop -o

# Traçage couche bloc
blktrace -d /dev/sda -o - | blkparse -i -
\`\`\`

## Analyse performance réseau

\`\`\`bash
# Stats interface réseau
sar -n DEV 1

# Retransmissions TCP
netstat -s | grep -i retrans

# Tailles de buffer socket
sysctl net.core.rmem_max
sysctl net.core.wmem_max
\`\`\``,
};

export const quiz = {
  en: [
    {
      question: "What does perf record -F 99 do and why 99 Hz specifically?",
      options: [
        "Records at maximum speed",
        "Samples CPU call stacks 99 times per second — 99 Hz avoids lockstep with the scheduler",
        "Records 99 different metrics",
        "Runs for 99 seconds",
      ],
      correct: 1,
    },
    {
      question: "In a flamegraph, what does the width of a box represent?",
      options: [
        "Number of function calls",
        "Memory usage",
        "Percentage of CPU time spent in that function (wider = more time)",
        "Code complexity",
      ],
      correct: 2,
    },
    {
      question: "What does high %iowait in mpstat indicate?",
      options: [
        "CPU is busy computing",
        "CPU is idle waiting for I/O operations to complete — I/O bottleneck",
        "Memory is full",
        "Network is congested",
      ],
      correct: 1,
    },
    {
      question:
        "Why is cache-friendly (row-major) array access 10-20x faster than column-major?",
      options: [
        "The compiler optimizes it better",
        "Sequential access loads entire cache line (64 bytes) — subsequent accesses hit L1 cache",
        "It uses less memory",
        "The CPU predicts it better",
      ],
      correct: 1,
    },
    {
      question:
        "What advantage does eBPF provide over traditional kernel modules?",
      options: [
        "It's faster",
        "It's written in Python",
        "eBPF programs are verified for safety and JIT-compiled — cannot crash kernel",
        "It uses less memory",
      ],
      correct: 2,
    },
  ],
  fr: [
    {
      question: "Que fait perf record -F 99 et pourquoi spécifiquement 99 Hz ?",
      options: [
        "Enregistre à vitesse maximale",
        "Échantillonne les piles d'appels CPU 99 fois par seconde — 99 Hz évite le verrouillage avec l'ordonnanceur",
        "Enregistre 99 métriques différentes",
        "Tourne pendant 99 secondes",
      ],
      correct: 1,
    },
    {
      question: "Dans un flamegraph, que représente la largeur d'une boîte ?",
      options: [
        "Nombre d'appels de fonction",
        "Utilisation mémoire",
        "Pourcentage de temps CPU passé dans cette fonction (plus large = plus de temps)",
        "Complexité du code",
      ],
      correct: 2,
    },
    {
      question: "Qu'indique un %iowait élevé dans mpstat ?",
      options: [
        "Le CPU est occupé à calculer",
        "Le CPU est inactif en attente d'opérations I/O — goulot I/O",
        "La mémoire est pleine",
        "Le réseau est congestionné",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi l'accès tableau cache-friendly (row-major) est-il 10-20x plus rapide que column-major ?",
      options: [
        "Le compilateur l'optimise mieux",
        "L'accès séquentiel charge toute la ligne de cache (64 octets) — accès suivants touchent le cache L1",
        "Ça utilise moins de mémoire",
        "Le CPU le prédit mieux",
      ],
      correct: 1,
    },
    {
      question:
        "Quel avantage eBPF fournit-il par rapport aux modules noyau traditionnels ?",
      options: [
        "C'est plus rapide",
        "C'est écrit en Python",
        "Les programmes eBPF sont vérifiés pour la sécurité et compilés JIT — ne peuvent pas crasher le noyau",
        "Ça utilise moins de mémoire",
      ],
      correct: 2,
    },
  ],
};
