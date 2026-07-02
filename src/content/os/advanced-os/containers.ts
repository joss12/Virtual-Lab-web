export const content = {
  en: `# Containers — Lightweight Isolation Without VMs

Containers are not "lightweight VMs". They're a completely different abstraction built on Linux kernel primitives: **namespaces** and **cgroups**. Understanding containers deeply means understanding how the Linux kernel creates isolated execution environments without hypervisors.

## The Container Illusion

\`\`\`
What a container process sees:
├── PID 1 (init process)
├── Own filesystem (appears to be /)
├── Own network stack (IP, routes, interfaces)
├── Own IPC mechanisms
└── Isolated from other containers

Reality:
├── Just a Linux process (visible in host: ps aux)
├── Shares kernel with host
├── Filesystem is mount namespace + overlay
├── Network is network namespace + veth pair
└── Isolated via 7 namespace types

Key difference from VMs:
VM: Full kernel + userspace per guest
Container: Shared kernel, isolated userspace
\`\`\`

## Namespaces — The Isolation Mechanism

Linux has 7 namespace types (as of Linux 5.6+):

\`\`\`
1. PID namespace (CLONE_NEWPID)
   ├── Isolates process IDs
   ├── Container sees own PID 1
   └── Host sees real PID (e.g., 12345)

2. Mount namespace (CLONE_NEWNS)
   ├── Isolates filesystem mount points
   ├── Container has own root (/)
   └── Changes don't affect host

3. Network namespace (CLONE_NEWNET)
   ├── Isolates network stack
   ├── Own interfaces, routes, iptables
   └── Connected to host via veth pairs

4. UTS namespace (CLONE_NEWUTS)
   ├── Isolates hostname and domain name
   └── Container can have own hostname

5. IPC namespace (CLONE_NEWIPC)
   ├── Isolates System V IPC, POSIX message queues
   └── Shared memory segments isolated

6. User namespace (CLONE_NEWUSER)
   ├── Isolates user/group IDs
   ├── Root in container ≠ root on host
   └── Critical for rootless containers

7. Cgroup namespace (CLONE_NEWCGROUP)
   ├── Isolates cgroup view
   └── Container sees own cgroup as root

Time namespace (CLONE_NEWTIME) — Linux 5.6+
   ├── Isolates system clock offsets
   └── Allows container to have different time
\`\`\`

### Creating Namespaces — The clone() System Call

\`\`\`c
// Create process in new namespaces
#define _GNU_SOURCE
#include <sched.h>
#include <stdio.h>
#include <sys/wait.h>
#include <unistd.h>

#define STACK_SIZE (1024 * 1024)
static char child_stack[STACK_SIZE];

int child_fn(void *arg) {
    // Inside new namespaces
    printf("Child PID: %d\\n", getpid());     // Will be 1 inside PID namespace
    printf("Child hostname: ");
    system("hostname");
    
    // Set new hostname (won't affect host)
    sethostname("container", 9);
    printf("New hostname: ");
    system("hostname");
    
    // Execute shell in container
    execl("/bin/bash", "/bin/bash", NULL);
    return 0;
}

int main() {
    printf("Parent PID: %d\\n", getpid());
    
    // Create child in new PID, UTS, and mount namespaces
    pid_t pid = clone(child_fn, child_stack + STACK_SIZE,
                      CLONE_NEWPID | CLONE_NEWUTS | CLONE_NEWNS | SIGCHLD,
                      NULL);
    
    waitpid(pid, NULL, 0);
    return 0;
}

// Compile: gcc -o namespace namespace.c
// Run: sudo ./namespace
// Inside: hostname shows "container", outside unchanged
// Inside: PID 1, outside: shows real PID
\`\`\`

### Namespace Internals — Kernel Structures

\`\`\`c
// Kernel source: include/linux/nsproxy.h
struct nsproxy {
    atomic_t count;
    struct uts_namespace *uts_ns;
    struct ipc_namespace *ipc_ns;
    struct mnt_namespace *mnt_ns;
    struct pid_namespace *pid_ns_for_children;
    struct net           *net_ns;
    struct cgroup_namespace *cgroup_ns;
    struct time_namespace *time_ns;
};

// Each task (process) has a pointer to nsproxy
struct task_struct {
    ...
    struct nsproxy *nsproxy;
    ...
};

// Namespace switching:
// 1. clone() with CLONE_NEW* flags creates new namespace
// 2. setns() attaches to existing namespace
// 3. unshare() moves current process to new namespace
\`\`\`

### PID Namespace — Nested Hierarchy

\`\`\`
PID namespaces are hierarchical:

Host PID namespace (level 0)
  ├── Process 1234 (container runtime)
  │   └── PID namespace (level 1)
  │       ├── Process 1 (container init)
  │       └── Process 2 (container app)
  │           └── PID namespace (level 2)
  │               └── Process 1 (nested container)
  └── Process 5678 (another container)

Process visibility:
├── Level 0 sees ALL processes (real PIDs)
├── Level 1 sees only its children (PIDs start at 1)
└── Level 2 sees only its children (PIDs start at 1)

Parent can see child namespaces
Child CANNOT see parent namespace

Signal behavior:
├── SIGKILL to PID 1 in namespace = kill entire namespace
├── PID 1 in namespace is special (like system init)
└── Orphaned processes re-parented to namespace PID 1
\`\`\`

\`\`\`bash
# View process namespaces
ls -l /proc/$$/ns/
# lrwxrwxrwx 1 user user 0 pid -> pid:[4026531836]
# lrwxrwxrwx 1 user user 0 net -> net:[4026531840]
# Numbers are namespace IDs (inode numbers)

# Enter existing namespace
nsenter --pid=/proc/12345/ns/pid --mount=/proc/12345/ns/mnt /bin/bash
# Now in same namespaces as PID 12345

# Create new namespace for current shell
unshare --pid --fork --mount-proc /bin/bash
# New PID namespace (ps shows only this bash)
\`\`\`

## Cgroups — Resource Limits and Accounting

Cgroups (control groups) limit and account resource usage:

\`\`\`
Cgroup controllers (subsystems):

cpu — CPU time allocation
├── cpu.shares (relative weight, default 1024)
├── cpu.cfs_period_us (CFS period, default 100ms)
└── cpu.cfs_quota_us (CPU time per period)
   Example: quota=50000, period=100000 → 50% of 1 CPU

cpuset — CPU affinity
├── cpuset.cpus (which CPUs can use)
└── cpuset.mems (which NUMA nodes)

memory — Memory limits
├── memory.limit_in_bytes (hard limit)
├── memory.soft_limit_in_bytes (reclaim target)
├── memory.oom_control (OOM killer behavior)
└── memory.stat (usage statistics)

blkio — Block I/O limits
├── blkio.weight (I/O priority, 10-1000)
├── blkio.throttle.read_bps_device (read bytes/sec)
└── blkio.throttle.write_bps_device (write bytes/sec)

net_cls — Network classification
└── Tag packets for tc (traffic control)

pids — Process count limit
└── pids.max (maximum PIDs in cgroup)

devices — Device access control
└── Allow/deny access to devices
\`\`\`

### Cgroups v1 vs v2

\`\`\`
Cgroups v1 (legacy, still widely used):
├── Multiple hierarchies (one per controller)
├── /sys/fs/cgroup/cpu/
├── /sys/fs/cgroup/memory/
└── /sys/fs/cgroup/blkio/

Problem: Controllers are independent
         Can't coordinate (e.g., memory pressure + CPU throttle)

Cgroups v2 (unified hierarchy):
├── Single hierarchy
├── /sys/fs/cgroup/
├── All controllers in one tree
└── Better delegation, thread support

Migration: Most systems run both (hybrid mode)
\`\`\`

### Cgroup Example — Limiting Memory

\`\`\`bash
# Create cgroup (v1)
sudo mkdir /sys/fs/cgroup/memory/mycontainer

# Set memory limit to 512MB
echo 536870912 > /sys/fs/cgroup/memory/mycontainer/memory.limit_in_bytes

# Disable OOM killer (container will hang instead of being killed)
echo 1 > /sys/fs/cgroup/memory/mycontainer/memory.oom_control

# Add process to cgroup
echo $$ > /sys/fs/cgroup/memory/mycontainer/cgroup.procs

# Test: allocate 1GB
python3 -c "s = 'a' * (1024**3)"
# Process will be OOM-killed or hang (depending on oom_control)

# View memory usage
cat /sys/fs/cgroup/memory/mycontainer/memory.usage_in_bytes
cat /sys/fs/cgroup/memory/mycontainer/memory.stat
# Shows: cache, rss, mapped_file, etc.

# Remove from cgroup
echo $$ > /sys/fs/cgroup/memory/cgroup.procs
\`\`\`

### CPU Throttling — CFS Bandwidth Control

\`\`\`
Completely Fair Scheduler (CFS) bandwidth control:

cpu.cfs_period_us = 100000   (100ms period)
cpu.cfs_quota_us  = 50000    (50ms quota)

Result: 50ms CPU time per 100ms period = 50% of 1 CPU

Multi-core:
cpu.cfs_quota_us = 200000    (200ms quota)
Result: 200% = 2 full CPUs

Implementation:
1. Process runs for 50ms
2. CFS throttles process (scheduler marks unrunnable)
3. 50ms later, quota refills
4. Process becomes runnable again

Visible via:
cat /sys/fs/cgroup/cpu/mycontainer/cpu.stat
# nr_periods: 1000
# nr_throttled: 500  (throttled 50% of periods)
# throttled_time: 250000000000  (total ns throttled)
\`\`\`

## Container Runtimes — The Stack

\`\`\`
Full container stack:

┌─────────────────────────────────────────────┐
│ High-level Runtime (Docker, Podman)        │
│ ├── Image management (pull, build, push)    │
│ ├── Network setup (CNI)                     │
│ └── Volume management                       │
├─────────────────────────────────────────────┤
│ Container Runtime (containerd, CRI-O)       │
│ ├── OCI image handling                      │
│ ├── Lifecycle management                    │
│ └── Snapshot management                     │
├─────────────────────────────────────────────┤
│ OCI Runtime (runc, crun, kata)              │
│ ├── Create namespaces                       │
│ ├── Setup cgroups                           │
│ ├── Execute container process               │
│ └── Follows OCI Runtime Spec                │
├─────────────────────────────────────────────┤
│ Linux Kernel                                │
│ ├── Namespaces                              │
│ ├── Cgroups                                 │
│ └── Capabilities, seccomp, AppArmor         │
└─────────────────────────────────────────────┘

Docker is just the top layer!
Actual container creation = runc
\`\`\`

### OCI Runtime Specification

\`\`\`json
// config.json (OCI runtime spec)
{
  "ociVersion": "1.0.0",
  "process": {
    "terminal": true,
    "user": {"uid": 0, "gid": 0},
    "args": ["/bin/bash"],
    "env": [
      "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      "TERM=xterm"
    ],
    "cwd": "/",
    "capabilities": {
      "bounding": ["CAP_CHOWN", "CAP_DAC_OVERRIDE", "CAP_NET_BIND_SERVICE"],
      "effective": ["CAP_CHOWN", "CAP_DAC_OVERRIDE"],
      "inheritable": [],
      "permitted": ["CAP_CHOWN", "CAP_DAC_OVERRIDE"],
      "ambient": []
    },
    "rlimits": [
      {"type": "RLIMIT_NOFILE", "hard": 1024, "soft": 1024}
    ]
  },
  "root": {
    "path": "rootfs",
    "readonly": false
  },
  "hostname": "container",
  "mounts": [
    {
      "destination": "/proc",
      "type": "proc",
      "source": "proc"
    },
    {
      "destination": "/dev",
      "type": "tmpfs",
      "source": "tmpfs",
      "options": ["nosuid", "strictatime", "mode=755"]
    }
  ],
  "linux": {
    "namespaces": [
      {"type": "pid"},
      {"type": "network"},
      {"type": "ipc"},
      {"type": "uts"},
      {"type": "mount"}
    ],
    "resources": {
      "memory": {
        "limit": 536870912
      },
      "cpu": {
        "quota": 50000,
        "period": 100000
      }
    },
    "cgroupsPath": "/mycontainer"
  }
}
\`\`\`

\`\`\`bash
# Create container with runc
mkdir -p mycontainer/rootfs
cd mycontainer

# Extract rootfs (from Docker image or build)
docker export $(docker create alpine) | tar -C rootfs -xvf -

# Generate config.json
runc spec

# Edit config.json (set process.args, resources, etc.)

# Create and start container
runc create mycontainer
runc start mycontainer

# Attach to container
runc exec mycontainer /bin/sh

# List containers
runc list

# Kill container
runc kill mycontainer
runc delete mycontainer
\`\`\`

## Image Layers — Union Filesystems

\`\`\`
Docker image structure:

┌─────────────────────────────────────────────┐
│ Layer 4 (R/W): Container changes           │
│ - /app/data.db (created at runtime)        │
├─────────────────────────────────────────────┤
│ Layer 3 (R/O): Application layer           │
│ - /app/myapp                                │
├─────────────────────────────────────────────┤
│ Layer 2 (R/O): Dependencies                │
│ - /usr/lib/libssl.so                        │
├─────────────────────────────────────────────┤
│ Layer 1 (R/O): Base OS                     │
│ - /bin/bash, /lib/libc.so                  │
└─────────────────────────────────────────────┘

Union mount = all layers appear as single filesystem
Read: Start from top, first match wins
Write: Copy-on-write to top layer
\`\`\`

### OverlayFS — The Modern Storage Driver

\`\`\`
OverlayFS layers:

lowerdir (read-only layers, colon-separated)
├── layer1:/bin/bash
├── layer2:/usr/bin/python3
└── layer3:/app/myapp

upperdir (read-write layer)
└── /app/data.db (created at runtime)

workdir (internal, used for atomic operations)

merged (the union view, mounted at /)
├── /bin/bash (from layer1)
├── /usr/bin/python3 (from layer2)
├── /app/myapp (from layer3)
└── /app/data.db (from upperdir)

File operations:
Read /bin/bash → found in layer1, read directly
Write /app/myapp → copy to upperdir, write there (CoW)
Delete /bin/bash → create whiteout in upperdir
\`\`\`

\`\`\`bash
# Mount overlayfs manually
mkdir -p lower1 lower2 upper work merged

# Create files in lower layers
echo "from lower1" > lower1/file1.txt
echo "from lower2" > lower2/file2.txt

# Mount overlay
mount -t overlay overlay \\
  -o lowerdir=lower2:lower1,upperdir=upper,workdir=work \\
  merged

# View merged filesystem
ls merged/
# file1.txt file2.txt

cat merged/file1.txt
# from lower1

# Modify file (triggers copy-on-write)
echo "modified" > merged/file1.txt

# Original lower1/file1.txt unchanged
cat lower1/file1.txt
# from lower1

# But upper/file1.txt created
cat upper/file1.txt
# modified

# Delete file from lower layer
rm merged/file2.txt

# Whiteout created (character device 0:0)
ls -la upper/
# c--------- 1 root root 0, 0 file2.txt

# Unmount
umount merged
\`\`\`

### Image Manifest — OCI Image Spec

\`\`\`json
// OCI Image manifest.json
{
  "schemaVersion": 2,
  "mediaType": "application/vnd.oci.image.manifest.v1+json",
  "config": {
    "mediaType": "application/vnd.oci.image.config.v1+json",
    "digest": "sha256:abc123...",
    "size": 1234
  },
  "layers": [
    {
      "mediaType": "application/vnd.oci.image.layer.v1.tar+gzip",
      "digest": "sha256:layer1hash...",
      "size": 12345678
    },
    {
      "mediaType": "application/vnd.oci.image.layer.v1.tar+gzip",
      "digest": "sha256:layer2hash...",
      "size": 23456789
    }
  ]
}

// Each layer is content-addressable (SHA256 hash)
// Layers are shared between images
// Example: ubuntu:20.04 and ubuntu:22.04 share base layers
\`\`\`

## Container Networking — veth Pairs and Bridges

\`\`\`
Default Docker networking:

Host network namespace:
├── eth0 (physical interface)
├── docker0 (bridge)
│   ├── veth1234a (host side of veth pair)
│   └── veth5678a (host side of another pair)
└── IP routing, iptables

Container 1 network namespace:
├── lo (loopback)
└── eth0 (container side = veth1234b)
    IP: 172.17.0.2

Container 2 network namespace:
├── lo
└── eth0 (container side = veth5678b)
    IP: 172.17.0.3

Packet flow (Container 1 → Internet):
Container eth0 (172.17.0.2)
    ↓
veth pair
    ↓
docker0 bridge (172.17.0.1)
    ↓
Host IP routing
    ↓
NAT (iptables MASQUERADE)
    ↓
Host eth0 → Internet
\`\`\`

\`\`\`bash
# Create network namespace
ip netns add container1

# Create veth pair
ip link add veth0 type veth peer name veth1

# Move one end to namespace
ip link set veth1 netns container1

# Configure host side (add to bridge)
ip link set veth0 master docker0
ip link set veth0 up

# Configure container side
ip netns exec container1 ip addr add 172.17.0.2/24 dev veth1
ip netns exec container1 ip link set veth1 up
ip netns exec container1 ip link set lo up
ip netns exec container1 ip route add default via 172.17.0.1

# Test connectivity
ip netns exec container1 ping 8.8.8.8

# View container network from inside
ip netns exec container1 ip addr show
# 1: lo: <LOOPBACK,UP,LOWER_UP>
#     inet 127.0.0.1/8
# 2: veth1@if3: <BROADCAST,MULTICAST,UP>
#     inet 172.17.0.2/24
\`\`\`

### CNI — Container Network Interface

\`\`\`json
// CNI configuration
{
  "cniVersion": "0.4.0",
  "name": "mynet",
  "type": "bridge",
  "bridge": "cni0",
  "isGateway": true,
  "ipMasq": true,
  "ipam": {
    "type": "host-local",
    "subnet": "10.244.0.0/16",
    "routes": [
      { "dst": "0.0.0.0/0" }
    ]
  }
}

// CNI plugins (executables):
// /opt/cni/bin/bridge
// /opt/cni/bin/host-local
// /opt/cni/bin/portmap

// Called by runtime:
// ADD: Setup networking
// DEL: Teardown networking
// CHECK: Verify setup
// VERSION: Return version
\`\`\`

## Security — Defense in Depth

### Linux Capabilities

\`\`\`
Capabilities split root privileges:

Instead of: root (all powerful) vs user (powerless)
Capabilities: Fine-grained privileges

Common capabilities:
CAP_CHOWN         — Change file ownership
CAP_DAC_OVERRIDE  — Bypass file permission checks
CAP_KILL          — Kill any process
CAP_NET_BIND_SERVICE — Bind port <1024
CAP_NET_RAW       — Use raw sockets (ping)
CAP_SYS_ADMIN     — Mount, namespace creation
CAP_SYS_CHROOT    — chroot()
CAP_SYS_PTRACE    — ptrace() any process
CAP_SYS_TIME      — Set system clock

Docker default capabilities (reduced set):
CAP_CHOWN
CAP_DAC_OVERRIDE
CAP_FOWNER
CAP_FSETID
CAP_KILL
CAP_NET_BIND_SERVICE
CAP_SETGID
CAP_SETUID
CAP_SYS_CHROOT

Notably MISSING (for security):
CAP_SYS_ADMIN     — Prevents namespace escape
CAP_SYS_MODULE    — Prevents loading kernel modules
CAP_SYS_PTRACE    — Prevents debugging host processes
\`\`\`

\`\`\`bash
# Run container with reduced capabilities
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE nginx

# View process capabilities
getpcaps $$
# Capabilities: = cap_chown,cap_dac_override,...

# Set file capabilities (allow binding port 80 without root)
setcap cap_net_bind_service=+ep /usr/bin/myapp
getcap /usr/bin/myapp
# /usr/bin/myapp = cap_net_bind_service+ep
\`\`\`

### Seccomp — System Call Filtering

\`\`\`
Seccomp (Secure Computing Mode):
Filter which system calls a process can make

Default Docker seccomp profile blocks ~44 syscalls:
├── acct (process accounting)
├── add_key, keyctl (kernel keyring)
├── bpf (eBPF programs)
├── clock_adjtime, clock_settime (set system clock)
├── create_module, delete_module (kernel modules)
├── kexec_load (kernel exec)
├── mount, umount (filesystem operations)
├── ptrace (debugging)
├── reboot
├── swapon, swapoff
└── ... (full list in Docker source)

Result: Even if container is compromised,
        attacker cannot load kernel modules,
        mount filesystems, debug host processes, etc.
\`\`\`

\`\`\`c
// Minimal seccomp filter (block execve)
#include <seccomp.h>

scmp_filter_ctx ctx = seccomp_init(SCMP_ACT_ALLOW);  // Allow by default
seccomp_rule_add(ctx, SCMP_ACT_ERRNO(EPERM), SCMP_SYS(execve), 0);  // Block execve
seccomp_load(ctx);

// Now execve() will fail with EPERM
execl("/bin/sh", "/bin/sh", NULL);  // Returns -1, errno = EPERM
\`\`\`

### AppArmor / SELinux — Mandatory Access Control

\`\`\`
AppArmor profile (Ubuntu default for Docker):

#include <tunables/global>

profile docker-default flags=(attach_disconnected,mediate_deleted) {
  #include <abstractions/base>

  # Deny access to dangerous files
  deny /sys/[^f]** wklx,
  deny /sys/f[^s]** wklx,
  deny /sys/fs/[^c]** wklx,
  deny /proc/sys/** wklx,
  deny /proc/kcore rwklx,
  
  # Allow network
  network,
  
  # Allow most capabilities (Docker reduces these separately)
  capability,
  
  # Allow mounts (but Docker also uses mount namespace)
  mount,
  
  # Allow ptrace within container
  ptrace (read, trace) peer=docker-default,
}

Docker loads this profile for all containers
Even root in container cannot access /proc/kcore
\`\`\`

## Performance Comparison

\`\`\`
Startup time:
├── VM: 20-60 seconds (boot kernel + init)
├── Container: 50-500ms (namespace + cgroup setup)
└── 40-120x faster

Memory overhead:
├── VM: 512MB-2GB minimum (guest kernel + OS)
├── Container: <10MB (just process)
└── 50-200x less

I/O performance:
├── VM: 70-95% of native (hypervisor overhead)
├── Container: 99-100% of native (direct kernel)
└── Near-identical

CPU performance:
├── VM: 95-99% of native (VT-x overhead)
├── Container: 100% of native (same kernel)
└── Identical

Density:
├── Typical server: 10-50 VMs
├── Same server: 100-1000 containers
└── 10-50x higher density

Security isolation:
├── VM: Kernel-level (guest kernel isolated)
├── Container: Namespace-level (shared kernel)
└── VMs stronger isolation
\`\`\`

Containers revolutionized software deployment. Understanding them at this depth means understanding the Linux kernel primitives that power Docker, Kubernetes, and the modern cloud.`,

  fr: `# Conteneurs — Isolation légère sans VMs

Les conteneurs ne sont pas des "VMs légères". C'est une abstraction complètement différente construite sur des primitives du noyau Linux : **namespaces** et **cgroups**. Comprendre les conteneurs en profondeur signifie comprendre comment le noyau Linux crée des environnements d'exécution isolés sans hyperviseurs.

## L'illusion du conteneur

\`\`\`
Ce que voit un processus conteneur :
├── PID 1 (processus init)
├── Son propre système de fichiers (apparaît être /)
├── Sa propre pile réseau
├── Ses propres mécanismes IPC
└── Isolé des autres conteneurs

Réalité :
├── Juste un processus Linux (visible sur l'hôte : ps aux)
├── Partage le noyau avec l'hôte
├── Le système de fichiers est namespace mount + overlay
├── Le réseau est namespace réseau + paire veth
└── Isolé via 7 types de namespaces

Différence clé avec les VMs :
VM : Noyau complet + espace utilisateur par invité
Conteneur : Noyau partagé, espace utilisateur isolé
\`\`\`

## Namespaces — Le mécanisme d'isolation

Linux a 7 types de namespaces :

\`\`\`
1. Namespace PID (CLONE_NEWPID)
   ├── Isole les IDs de processus
   ├── Le conteneur voit son propre PID 1
   └── L'hôte voit le vrai PID

2. Namespace Mount (CLONE_NEWNS)
   ├── Isole les points de montage du système de fichiers
   └── Le conteneur a sa propre racine (/)

3. Namespace Network (CLONE_NEWNET)
   ├── Isole la pile réseau
   └── Propres interfaces, routes, iptables

4. Namespace UTS (CLONE_NEWUTS)
   ├── Isole le nom d'hôte
   └── Le conteneur peut avoir son propre hostname

5. Namespace IPC (CLONE_NEWIPC)
   ├── Isole System V IPC
   └── Segments de mémoire partagée isolés

6. Namespace User (CLONE_NEWUSER)
   ├── Isole les IDs utilisateur/groupe
   └── Root dans conteneur ≠ root sur hôte

7. Namespace Cgroup (CLONE_NEWCGROUP)
   ├── Isole la vue cgroup
   └── Le conteneur voit son propre cgroup comme racine
\`\`\`

### Créer des namespaces

\`\`\`c
// Créer un processus dans de nouveaux namespaces
#define _GNU_SOURCE
#include <sched.h>

int child_fn(void *arg) {
    printf("PID enfant : %d\\n", getpid());  // Sera 1 dans namespace PID
    sethostname("conteneur", 9);
    execl("/bin/bash", "/bin/bash", NULL);
    return 0;
}

int main() {
    clone(child_fn, child_stack + STACK_SIZE,
          CLONE_NEWPID | CLONE_NEWUTS | CLONE_NEWNS | SIGCHLD,
          NULL);
}
\`\`\`

## Cgroups — Limites de ressources

\`\`\`
Contrôleurs cgroup :

cpu — Allocation temps CPU
memory — Limites mémoire
blkio — Limites I/O blocs
pids — Limite nombre de processus
\`\`\`

## Runtimes de conteneurs

\`\`\`
┌─────────────────────────────────────────────┐
│ Runtime de haut niveau (Docker, Podman)    │
├─────────────────────────────────────────────┤
│ Runtime de conteneur (containerd, CRI-O)   │
├─────────────────────────────────────────────┤
│ Runtime OCI (runc, crun)                    │
├─────────────────────────────────────────────┤
│ Noyau Linux                                 │
└─────────────────────────────────────────────┘
\`\`\`

## Couches d'image — Systèmes de fichiers union

\`\`\`
┌─────────────────────────────────────────────┐
│ Couche 4 (R/W) : Changements conteneur     │
├─────────────────────────────────────────────┤
│ Couche 3 (R/O) : Couche application        │
├─────────────────────────────────────────────┤
│ Couche 2 (R/O) : Dépendances               │
├─────────────────────────────────────────────┤
│ Couche 1 (R/O) : OS de base                │
└─────────────────────────────────────────────┘

Union mount = toutes les couches apparaissent comme un seul système
Lecture : Commence du haut, première correspondance gagne
Écriture : Copy-on-write vers la couche supérieure
\`\`\`

## Réseau de conteneurs

\`\`\`
Namespace réseau hôte :
├── eth0 (interface physique)
├── docker0 (bridge)
└── veth1234a (côté hôte de la paire veth)

Namespace réseau conteneur 1 :
├── lo (loopback)
└── eth0 (côté conteneur = veth1234b)
    IP : 172.17.0.2
\`\`\`

## Sécurité

### Capacités Linux

\`\`\`
Les capacités divisent les privilèges root :

CAP_NET_BIND_SERVICE — Lier port <1024
CAP_SYS_ADMIN — Mount, création namespace
CAP_SYS_PTRACE — ptrace() n'importe quel processus
\`\`\`

### Seccomp — Filtrage d'appels système

\`\`\`
Le profil seccomp Docker par défaut bloque ~44 syscalls
Résultat : Même si le conteneur est compromis,
          l'attaquant ne peut pas charger de modules noyau
\`\`\`

## Comparaison de performance

\`\`\`
Temps de démarrage :
├── VM : 20-60 secondes
├── Conteneur : 50-500ms
└── 40-120x plus rapide

Surcoût mémoire :
├── VM : 512 Mo-2 Go minimum
├── Conteneur : <10 Mo
└── 50-200x moins

Performance I/O :
├── VM : 70-95% du natif
├── Conteneur : 99-100% du natif
└── Quasi-identique
\`\`\``,
};

export const quiz = {
  en: [
    {
      question:
        "What is the fundamental difference between containers and VMs?",
      options: [
        "Containers are slower",
        "Containers share the host kernel using namespaces/cgroups for isolation, VMs run separate kernels",
        "Containers use more memory",
        "Containers are more secure",
      ],
      correct: 1,
    },
    {
      question: "What does a PID namespace do?",
      options: [
        "Speeds up process creation",
        "Isolates process IDs — container sees PID 1 while host sees real PID (e.g., 12345)",
        "Encrypts process memory",
        "Manages process priorities",
      ],
      correct: 1,
    },
    {
      question:
        "How does OverlayFS implement copy-on-write for container images?",
      options: [
        "It duplicates all files",
        "Lower layers are read-only; writes go to upper layer — modified files copied on first write",
        "It compresses files",
        "It uses symlinks",
      ],
      correct: 1,
    },
    {
      question: "What is the purpose of Linux capabilities in containers?",
      options: [
        "Increase container performance",
        "Split root privileges into fine-grained permissions — container can bind port 80 without full root",
        "Manage memory allocation",
        "Handle network routing",
      ],
      correct: 1,
    },
    {
      question: "Why are containers 40-120x faster to start than VMs?",
      options: [
        "Containers use faster CPUs",
        "Containers only need namespace/cgroup setup (~50-500ms) vs VM kernel boot (~20-60s)",
        "Containers use less RAM",
        "Containers have better networking",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Quelle est la différence fondamentale entre conteneurs et VMs ?",
      options: [
        "Les conteneurs sont plus lents",
        "Les conteneurs partagent le noyau hôte en utilisant namespaces/cgroups pour l'isolation, les VMs exécutent des noyaux séparés",
        "Les conteneurs utilisent plus de mémoire",
        "Les conteneurs sont plus sécurisés",
      ],
      correct: 1,
    },
    {
      question: "Que fait un namespace PID ?",
      options: [
        "Accélère la création de processus",
        "Isole les IDs de processus — le conteneur voit PID 1 tandis que l'hôte voit le vrai PID",
        "Chiffre la mémoire des processus",
        "Gère les priorités des processus",
      ],
      correct: 1,
    },
    {
      question:
        "Comment OverlayFS implémente-t-il le copy-on-write pour les images conteneur ?",
      options: [
        "Il duplique tous les fichiers",
        "Les couches inférieures sont en lecture seule ; les écritures vont dans la couche supérieure",
        "Il compresse les fichiers",
        "Il utilise des liens symboliques",
      ],
      correct: 1,
    },
    {
      question: "Quel est l'objectif des capacités Linux dans les conteneurs ?",
      options: [
        "Augmenter la performance du conteneur",
        "Diviser les privilèges root en permissions fine-grained — le conteneur peut lier le port 80 sans root complet",
        "Gérer l'allocation mémoire",
        "Gérer le routage réseau",
      ],
      correct: 1,
    },
    {
      question:
        "Pourquoi les conteneurs sont-ils 40-120x plus rapides à démarrer que les VMs ?",
      options: [
        "Les conteneurs utilisent des CPUs plus rapides",
        "Les conteneurs n'ont besoin que de configuration namespace/cgroup (~50-500ms) vs boot noyau VM (~20-60s)",
        "Les conteneurs utilisent moins de RAM",
        "Les conteneurs ont un meilleur réseau",
      ],
      correct: 1,
    },
  ],
};
