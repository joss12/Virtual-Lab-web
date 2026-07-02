export const content = {
  en: `# Hypervisors — Running Operating Systems Inside Operating Systems

A hypervisor makes the impossible possible: running multiple operating systems simultaneously on a single machine, each believing it owns the hardware. Understanding hypervisors means understanding the deepest layer of virtualization — where hardware, firmware, and software intersect.

## The Virtualization Problem

\`\`\`
The challenge:

Guest OS expects to:
├── Execute privileged instructions (CR3, LGDT, CLI, STI)
├── Have direct hardware access (interrupts, timers, I/O ports)
├── Control physical memory
└── Own all CPU resources

But in reality:
├── Host OS already owns the hardware
├── Multiple guests must share resources
├── Guests must be isolated from each other
└── Privileged instructions would crash the system

Solutions evolved:
1. Software emulation (QEMU) — Slow, ~10-100x overhead
2. Paravirtualization (Xen) — Fast, but requires guest OS modification
3. Hardware virtualization (VT-x/AMD-V) — Fast, no guest modification
\`\`\`

## Hardware Virtualization — Intel VT-x

VT-x adds a new CPU privilege level: **VMX (Virtual Machine Extensions)**

\`\`\`
CPU modes before VT-x:
Ring 0 (kernel)
Ring 1 (unused on modern OSes)
Ring 2 (unused)
Ring 3 (userspace)

CPU modes with VT-x:
VMX root mode (hypervisor)
  ├── Ring 0 — Hypervisor kernel
  └── Ring 3 — Hypervisor userspace
VMX non-root mode (guest)
  ├── Ring 0 — Guest kernel (thinks it's privileged, but isn't)
  └── Ring 3 — Guest userspace

Key insight: Guest kernel runs in Ring 0, but within VMX non-root
             It THINKS it's privileged, but CPU traps to hypervisor
\`\`\`

### VMCS — Virtual Machine Control Structure

The VMCS is the data structure that defines a virtual CPU:

\`\`\`
VMCS (Virtual Machine Control Structure):
Size: 4KB (one page)
Location: Physical memory, pointer in VMCS_LINK

Structure (conceptual):
┌─────────────────────────────────────────────┐
│ Guest State Area                            │
│ ├── RIP, RSP, RFLAGS                        │
│ ├── CR0, CR3, CR4 (guest page tables)       │
│ ├── Segment registers (CS, DS, SS, etc.)    │
│ ├── IDTR, GDTR (interrupt/global descriptor)│
│ └── MSRs (Model-Specific Registers)         │
├─────────────────────────────────────────────┤
│ Host State Area                             │
│ ├── RIP, RSP (where to return on VM-exit)   │
│ ├── CR0, CR3, CR4 (host page tables)        │
│ └── Segment registers                       │
├─────────────────────────────────────────────┤
│ VM-Execution Controls                       │
│ ├── Pin-Based Controls                      │
│ │   └── External interrupt exiting          │
│ ├── Processor-Based Controls                │
│ │   ├── CR3-load exiting (page table switch)│
│ │   ├── MSR bitmap (which MSRs cause exit)  │
│ │   └── I/O bitmap (which ports cause exit) │
│ └── Secondary Controls                      │
│     ├── EPT enable (Extended Page Tables)   │
│     ├── VPID (Virtual Processor ID)         │
│     └── Unrestricted guest                  │
├─────────────────────────────────────────────┤
│ VM-Exit Controls                            │
│ ├── MSR-store/load addresses                │
│ └── Acknowledgement of interrupt on exit    │
├─────────────────────────────────────────────┤
│ VM-Entry Controls                           │
│ ├── MSR-load address                        │
│ └── Event injection (inject interrupt/NMI)  │
├─────────────────────────────────────────────┤
│ VM-Exit Information                         │
│ ├── Exit reason (why did we exit?)          │
│ ├── Exit qualification (details)            │
│ ├── Guest linear address                    │
│ └── Guest physical address                  │
└─────────────────────────────────────────────┘

Each vCPU has its own VMCS
Switching vCPUs = VMPTRLD (load different VMCS pointer)
\`\`\`

### VM-Entry and VM-Exit — The Context Switch

\`\`\`
VM-Entry (hypervisor → guest):
1. Execute VMLAUNCH (first time) or VMRESUME (subsequent)
2. CPU loads guest state from VMCS
   ├── RIP, RSP, RFLAGS
   ├── CR0, CR3, CR4
   ├── Segment registers
   └── MSRs
3. CPU enters VMX non-root mode
4. Guest code executes

VM-Exit (guest → hypervisor):
1. Sensitive operation detected:
   ├── I/O port access (IN/OUT)
   ├── MSR access (RDMSR/WRMSR)
   ├── CR3 write (page table switch)
   ├── HLT instruction
   ├── CPUID instruction
   └── External interrupt (if configured)
2. CPU saves guest state to VMCS
3. CPU loads host state from VMCS
4. CPU enters VMX root mode (hypervisor)
5. Hypervisor exit handler executes
6. Hypervisor emulates operation or passes to hardware
7. VMRESUME back to guest

VM-Exit cost: ~500-1000 cycles (expensive!)
Goal: Minimize exits through paravirtualization and hardware assist
\`\`\`

\`\`\`c
// Simplified KVM vCPU run loop
int kvm_vcpu_run(struct kvm_vcpu *vcpu) {
    while (1) {
        // Prepare VMCS for entry
        vmx_prepare_switch_to_guest(vcpu);
        
        // Enter guest (VMLAUNCH/VMRESUME)
        vmx_vcpu_run(vcpu);  // Assembly that executes VMRESUME
        
        // VM-Exit occurred — we're back in hypervisor
        exit_reason = vmcs_read32(VM_EXIT_REASON);
        
        switch (exit_reason) {
        case EXIT_REASON_IO_INSTRUCTION:
            handle_io(vcpu);  // Emulate I/O port access
            break;
        case EXIT_REASON_MSR_READ:
            handle_rdmsr(vcpu);
            break;
        case EXIT_REASON_EPT_VIOLATION:
            handle_ept_violation(vcpu);  // Page fault in guest
            break;
        case EXIT_REASON_EXTERNAL_INTERRUPT:
            handle_interrupt(vcpu);
            break;
        case EXIT_REASON_HLT:
            return 0;  // Guest halted, exit to userspace
        }
    }
}
\`\`\`

## EPT — Extended Page Tables (Nested Paging)

The most important virtualization optimization:

\`\`\`
Without EPT (shadow page tables):

Guest Virtual → Guest Physical → Host Physical
      ↓                ↓
  Guest PT         Shadow PT (maintained by hypervisor)

Problem: Every guest CR3 write = rebuild shadow page tables
Cost: Thousands of cycles

With EPT:

Guest Virtual → Guest Physical → Host Physical
      ↓                ↓
  Guest PT           EPT

EPT walk (hardware-accelerated):
1. Guest page table walk (GVA → GPA)
2. EPT walk for each guest PT access (GPA → HPA)

Total: 4 * 5 = 20 memory accesses for 4-level guest + 4-level EPT
But: Cached in TLB (combined VPID+PCID)
Result: Near-native performance
\`\`\`

### EPT Page Table Format

\`\`\`
EPT Entry (64 bits):

[63:52] = Ignored
[51:12] = Host physical page number (40 bits)
[11:8]  = Ignored
[7]     = Ignore PAT (Page Attribute Table)
[6]     = Accessed
[5]     = Dirty (if EPT_DIRTY supported)
[4]     = EPT memory type
[3]     = Large page (1GB or 2MB)
[2]     = Write permission
[1]     = Read permission
[0]     = Execute permission

4-level EPT walk (GPA → HPA):
1. EPT PML4 (from EPTP in VMCS)
2. EPT PDPT
3. EPT PD
4. EPT PT
5. Host Physical Address

EPT violation (EPT page fault):
├── Guest accesses unmapped GPA
├── VM-Exit to hypervisor
├── Hypervisor allocates host page
├── Hypervisor updates EPT
└── VMRESUME
\`\`\`

### VPID — Virtual Processor Identifier

\`\`\`
Problem: TLB flushes on every VM-Entry/Exit
Each vCPU has different address space
Without VPID: TLB flushed = performance disaster

With VPID:
Each TLB entry tagged with VPID (16-bit ID)
├── Host (VPID 0)
├── Guest 1 vCPU 0 (VPID 1)
├── Guest 1 vCPU 1 (VPID 2)
├── Guest 2 vCPU 0 (VPID 3)
└── ...

TLB lookup checks: VA + VPID
Result: No TLB flush on VM transitions
        20-40% performance improvement
\`\`\`

## KVM Architecture — Linux as a Hypervisor

\`\`\`
KVM (Kernel-based Virtual Machine):

┌─────────────────────────────────────────────┐
│ QEMU (userspace)                            │
│ ├── Device emulation (disk, network, GPU)   │
│ ├── BIOS/UEFI firmware                      │
│ └── VNC/SPICE display                       │
├─────────────────────────────────────────────┤
│ KVM kernel module (/dev/kvm)                │
│ ├── vCPU scheduling (Linux CFS scheduler)   │
│ ├── Memory management (EPT setup)           │
│ ├── Interrupt handling                      │
│ └── VM-Exit handlers                        │
├─────────────────────────────────────────────┤
│ Linux kernel                                │
│ ├── Process scheduler                       │
│ ├── Memory manager                          │
│ └── Device drivers                          │
├─────────────────────────────────────────────┤
│ Hardware (VT-x/AMD-V)                       │
└─────────────────────────────────────────────┘

Key insight: vCPUs are just Linux threads
             Scheduled by CFS like any other thread
             Memory managed by Linux MM
             Devices emulated by QEMU userspace
\`\`\`

\`\`\`c
// KVM ioctl API (simplified)
int vm_fd = open("/dev/kvm", O_RDWR);
int vmfd = ioctl(vm_fd, KVM_CREATE_VM, 0);

// Allocate guest memory
struct kvm_userspace_memory_region mem = {
    .slot = 0,
    .guest_phys_addr = 0,
    .memory_size = 1L << 30,  // 1GB
    .userspace_addr = (uint64_t)malloc(1L << 30),
};
ioctl(vmfd, KVM_SET_USER_MEMORY_REGION, &mem);

// Create vCPU
int vcpu_fd = ioctl(vmfd, KVM_CREATE_VCPU, 0);

// Setup vCPU state
struct kvm_regs regs;
ioctl(vcpu_fd, KVM_GET_REGS, &regs);
regs.rip = 0x1000;  // Start at 0x1000
regs.rflags = 0x2;
ioctl(vcpu_fd, KVM_SET_REGS, &regs);

// Run vCPU (this thread blocks until VM-Exit)
while (1) {
    ioctl(vcpu_fd, KVM_RUN, 0);
    // Handle VM-Exit
    switch (run->exit_reason) {
    case KVM_EXIT_IO:
        handle_io_port(run->io.port, run->io.direction);
        break;
    case KVM_EXIT_MMIO:
        handle_mmio(run->mmio.phys_addr, run->mmio.data);
        break;
    }
}
\`\`\`

## Hyper-V Enlightenments — Paravirtualization on VT-x

Windows on Hyper-V doesn't just use hardware virtualization — it uses **enlightenments** (hypercalls) to avoid expensive VM-Exits:

\`\`\`
Without enlightenments:
Windows writes CR3 (switch page table)
    ↓
VM-Exit (500 cycles)
    ↓
Hyper-V emulates CR3 write
    ↓
VMRESUME (500 cycles)
Total: ~1000 cycles

With enlightenments:
Windows calls HvSwitchVirtualAddressSpace(new_cr3)
    ↓
VMCALL (hypercall, ~50 cycles)
    ↓
Hyper-V directly updates EPT
    ↓
Return to guest
Total: ~100 cycles

10x faster!
\`\`\`

### Hyper-V Synthetic MSRs

\`\`\`
Enlightened CPUID:
CPUID leaf 0x40000000 = "Microsoft Hv"
    ↓
Guest detects Hyper-V
    ↓
Guest reads synthetic MSRs:
├── HV_X64_MSR_GUEST_OS_ID
├── HV_X64_MSR_HYPERCALL (hypercall page GPA)
├── HV_X64_MSR_VP_INDEX (virtual processor ID)
├── HV_X64_MSR_TIME_REF_COUNT (partition reference time)
└── HV_X64_MSR_REFERENCE_TSC (TSC page for guest)

Hypercall interface:
WRMSR HV_X64_MSR_HYPERCALL, <GPA>
    ↓
Guest writes hypercall page
    ↓
VMCALL with hypercall code in RAX
    ↓
Hyper-V dispatcher handles hypercall

Common hypercalls:
├── HvSwitchVirtualAddressSpace (fast CR3 switch)
├── HvFlushVirtualAddressSpace (TLB shootdown)
├── HvCallSendSyntheticClusterIpi (fast IPI)
└── HvCallPostMessage (inter-partition communication)
\`\`\`

## PCI Passthrough — Direct Hardware Access

\`\`\`
Problem: Device emulation is slow
         Network: ~10 Gbps emulated vs 100 Gbps native
         GPU: Unusable for gaming/ML

Solution: VFIO (Virtual Function I/O)
         Give guest DIRECT access to PCI device
\`\`\`

### IOMMU — The Missing Piece

\`\`\`
Without IOMMU:
Guest device driver programs DMA:
  "Write data to physical address 0x12345000"
    ↓
Device writes to HOST physical 0x12345000
    ↓
Guest corrupts host memory (BAD)

With IOMMU (VT-d on Intel, AMD-Vi on AMD):
Guest device driver programs DMA:
  "Write data to guest physical address 0x12345000"
    ↓
IOMMU translates: GPA 0x12345000 → HPA 0xABCDE000
    ↓
Device writes to HOST physical 0xABCDE000
    ↓
Guest memory updated correctly

IOMMU uses EPT-like page tables for devices
Device writes go through GPA→HPA translation
Isolation: Device can only access guest memory
\`\`\`

### VFIO Setup

\`\`\`bash
# Unbind device from host driver
echo "0000:01:00.0" > /sys/bus/pci/devices/0000:01:00.0/driver/unbind

# Bind to vfio-pci
echo "10de 1b80" > /sys/bus/pci/drivers/vfio-pci/new_id

# QEMU command
qemu-system-x86_64 \\
  -device vfio-pci,host=01:00.0 \\
  ...

# Inside guest:
lspci
# 00:04.0 VGA compatible controller: NVIDIA Corporation GP104 [GeForce GTX 1080]

# Guest driver loads, talks directly to GPU
# DMA goes through IOMMU (transparent to guest)
# Performance: ~95-99% of native
\`\`\`

## SR-IOV — Hardware Virtualization for Devices

\`\`\`
Single Root I/O Virtualization:

Physical Function (PF):
├── Full-featured device (admin/management)
└── Owned by host

Virtual Functions (VF) 1-256:
├── Lightweight device instances
├── Each VF passed to different guest
├── Hardware-enforced isolation
└── Near-native performance

Example: Intel X710 NIC (10/25/40 Gbps)
├── 1 Physical Function (host management)
└── 128 Virtual Functions (one per guest)

Each guest gets its own VF:
├── Independent MAC address
├── Independent VLAN tags
├── Independent packet queues
└── Direct DMA (no hypervisor involvement)

Performance: ~99% of native
Latency: ~1-2 μs (vs ~10-50 μs emulated)
\`\`\`

\`\`\`bash
# Enable SR-IOV
echo 8 > /sys/class/net/eth0/device/sriov_numvfs

# 8 VFs created:
ls /sys/class/net/eth0/device/
# virtfn0 virtfn1 virtfn2 virtfn3 virtfn4 virtfn5 virtfn6 virtfn7

# Assign VF to guest
<interface type='hostdev' managed='yes'>
  <source>
    <address type='pci' domain='0x0000' bus='0x05' slot='0x10' function='0x0'/>
  </source>
</interface>

# Inside guest: Full network interface
ip link show
# eth0: <BROADCAST,MULTICAST,UP> mtu 1500
\`\`\`

## Live Migration — Moving VMs Between Hosts

\`\`\`
Pre-copy migration (most common):

Phase 1: Iterative memory copy
While (guest running):
    Copy dirty pages to destination
    Mark copied pages clean
    If (dirty pages < threshold): goto Phase 2

Phase 2: Stop-and-copy
    Pause guest (downtime begins)
    Copy remaining dirty pages
    Copy vCPU state (registers, VMCS)
    Switch network to destination
    Unpause guest on destination (downtime ends)

Typical downtime: 50-100ms

Optimization 1: Dirty page tracking via EPT
├── Mark all pages read-only in EPT
├── Guest writes → EPT violation → mark dirty
└── Bitmap of dirty pages

Optimization 2: Post-copy
├── Start guest on destination immediately
├── On-demand page fetch (lazy migration)
├── Faster time-to-resume
└── Risk: Network partition = VM stalls
\`\`\`

### RDMA Live Migration

\`\`\`
Traditional migration: TCP/IP (kernel overhead)
RDMA migration: Zero-copy kernel bypass

Source:                    Destination:
Guest memory               Reserved memory
    ↓                          ↑
RDMA NIC ───────────────────→ RDMA NIC
             InfiniBand/RoCE

Transfer rate: 100 Gbps (12.5 GB/s)
64GB VM migration: ~5 seconds
Downtime: <10ms

Key: RDMA bypasses kernel
     DMA directly from guest memory to network
     DMA directly from network to destination memory
\`\`\`

## Memory Ballooning — Overcommit Without OOM

\`\`\`
Problem:
Host has 64GB RAM
4 guests, each configured with 32GB
Total: 128GB (overcommit)

But guests only use 50GB total
48GB is wasted (allocated but idle)

Solution: Memory balloon driver
Guest kernel module that "steals" memory from guest
\`\`\`

### Balloon Protocol

\`\`\`
1. Hypervisor wants to reclaim 1GB from guest
2. Hypervisor inflates balloon (via hypercall)
3. Balloon driver allocates 1GB inside guest
   (from guest's perspective, just another process)
4. Balloon driver tells hypervisor which pages
5. Hypervisor unmaps pages from EPT
6. Host reclaims 1GB physical memory
7. Guest thinks balloon process owns memory
   (guest OOM killer won't touch it)

To return memory:
1. Hypervisor deflates balloon
2. Balloon driver frees pages
3. Hypervisor maps pages back in EPT
4. Guest can use memory again

Guest thinks: "Balloon process released memory"
Reality: Hypervisor gave memory back
\`\`\`

\`\`\`c
// Virtio balloon driver (simplified)
void inflate_balloon(struct virtio_balloon *vb, unsigned int num_pages) {
    for (i = 0; i < num_pages; i++) {
        struct page *page = alloc_page(GFP_KERNEL);
        balloon_page_enqueue(&vb->vb_pages, page);
        
        // Tell hypervisor this page is ballooned
        pfn = page_to_pfn(page);
        virtqueue_add_outbuf(vb->inflate_vq, &pfn, 1);
    }
    virtqueue_kick(vb->inflate_vq);  // Notify hypervisor
}

void deflate_balloon(struct virtio_balloon *vb, unsigned int num_pages) {
    for (i = 0; i < num_pages; i++) {
        struct page *page = balloon_page_dequeue(&vb->vb_pages);
        pfn = page_to_pfn(page);
        
        virtqueue_add_outbuf(vb->deflate_vq, &pfn, 1);
        __free_page(page);
    }
    virtqueue_kick(vb->deflate_vq);
}
\`\`\`

## Performance Analysis

\`\`\`
CPU overhead:
├── Native: 0% (no hypervisor)
├── KVM + VT-x: 2-5% (VM-Exits, EPT walks)
├── Paravirt (Xen): 1-3% (hypercalls, no VM-Exits)
└── Emulation (QEMU): 90-95% (interpret every instruction)

Memory overhead:
├── EPT: 5-10% (20 memory accesses per TLB miss vs 4)
├── Shadow PT: 20-30% (rebuilds on CR3 write)

I/O overhead:
├── Emulated: 50-80% (every I/O = VM-Exit)
├── Virtio: 10-20% (batch + hypercalls)
├── SR-IOV: 1-2% (direct hardware access)
└── VFIO: 1-5% (IOMMU translation)

Network latency:
├── Native: 10 μs
├── Virtio: 20-30 μs
├── SR-IOV: 11-12 μs
└── Emulated: 100-500 μs
\`\`\`

## Type 1 vs Type 2 Hypervisors

\`\`\`
Type 1 (Bare Metal):
Hardware → Hypervisor → VMs
Examples: VMware ESXi, Xen, Hyper-V

Pros:
├── Direct hardware access
├── Lower latency
├── Better isolation
└── Purpose-built for virtualization

Cons:
├── Limited driver support
├── Requires dedicated hardware
└── Complex management

Type 2 (Hosted):
Hardware → OS → Hypervisor → VMs
Examples: VirtualBox, VMware Workstation, QEMU, Parallels

Pros:
├── Uses existing OS drivers
├── Easy to install
└── Desktop-friendly

Cons:
├── Higher overhead
├── Dependent on host OS stability
└── More attack surface

KVM is hybrid:
├── Type 2 technically (runs on Linux)
└── Type 1 performance (uses VT-x directly)
\`\`\`

Hypervisors are the foundation of cloud computing. AWS, Azure, GCP — all built on hypervisors. Understanding them means understanding how the modern internet runs.`,

  fr: `# Hyperviseurs — Exécuter des systèmes d'exploitation dans des systèmes d'exploitation

Un hyperviseur rend l'impossible possible : exécuter plusieurs systèmes d'exploitation simultanément sur une seule machine, chacun croyant posséder le matériel. Comprendre les hyperviseurs signifie comprendre la couche la plus profonde de la virtualisation — où matériel, firmware et logiciel se croisent.

## Le problème de virtualisation

\`\`\`
Le défi :

L'OS invité s'attend à :
├── Exécuter des instructions privilégiées (CR3, LGDT, CLI, STI)
├── Avoir un accès direct au matériel
├── Contrôler la mémoire physique
└── Posséder toutes les ressources CPU

Mais en réalité :
├── L'OS hôte possède déjà le matériel
├── Plusieurs invités doivent partager les ressources
├── Les invités doivent être isolés les uns des autres
└── Les instructions privilégiées feraient crasher le système

Solutions qui ont évolué :
1. Émulation logicielle (QEMU) — Lent, surcoût ~10-100x
2. Paravirtualisation (Xen) — Rapide, mais nécessite modification de l'OS invité
3. Virtualisation matérielle (VT-x/AMD-V) — Rapide, pas de modification invité
\`\`\`

## Virtualisation matérielle — Intel VT-x

VT-x ajoute un nouveau niveau de privilège CPU : **VMX (Virtual Machine Extensions)**

\`\`\`
Modes CPU avant VT-x :
Ring 0 (noyau)
Ring 3 (espace utilisateur)

Modes CPU avec VT-x :
Mode VMX root (hyperviseur)
  ├── Ring 0 — Noyau hyperviseur
  └── Ring 3 — Espace utilisateur hyperviseur
Mode VMX non-root (invité)
  ├── Ring 0 — Noyau invité (pense être privilégié, mais ne l'est pas)
  └── Ring 3 — Espace utilisateur invité

Point clé : Le noyau invité s'exécute en Ring 0, mais dans VMX non-root
\`\`\`

### VMCS — Structure de contrôle de machine virtuelle

\`\`\`
VMCS (Virtual Machine Control Structure) :
Taille : 4 Ko
Emplacement : Mémoire physique

Structure (conceptuelle) :
┌─────────────────────────────────────────────┐
│ Zone d'état invité                          │
│ ├── RIP, RSP, RFLAGS                        │
│ ├── CR0, CR3, CR4                           │
│ └── Registres de segment                    │
├─────────────────────────────────────────────┤
│ Zone d'état hôte                            │
│ ├── RIP, RSP                                │
│ └── CR0, CR3, CR4                           │
├─────────────────────────────────────────────┤
│ Contrôles d'exécution VM                    │
│ └── Sortie EPT, VPID, etc.                  │
└─────────────────────────────────────────────┘
\`\`\`

### VM-Entry et VM-Exit

\`\`\`
VM-Entry (hyperviseur → invité) :
1. Exécuter VMLAUNCH ou VMRESUME
2. Le CPU charge l'état invité depuis VMCS
3. Le CPU entre en mode VMX non-root
4. Le code invité s'exécute

VM-Exit (invité → hyperviseur) :
1. Opération sensible détectée
2. Le CPU sauvegarde l'état invité dans VMCS
3. Le CPU charge l'état hôte depuis VMCS
4. Le CPU entre en mode VMX root
5. Le gestionnaire de sortie de l'hyperviseur s'exécute

Coût VM-Exit : ~500-1000 cycles (coûteux !)
\`\`\`

## EPT — Tables de pages étendues

\`\`\`
Sans EPT (tables de pages shadow) :

Virtuel invité → Physique invité → Physique hôte
                       ↓
                 Shadow PT (maintenue par hyperviseur)

Problème : Chaque écriture CR3 = reconstruction shadow PT

Avec EPT :

Virtuel invité → Physique invité → Physique hôte
                       ↓
                     EPT

Parcours EPT (accéléré matériellement) :
Résultat : Performance quasi-native
\`\`\`

## Architecture KVM

\`\`\`
KVM (Kernel-based Virtual Machine) :

┌─────────────────────────────────────────────┐
│ QEMU (espace utilisateur)                   │
│ ├── Émulation de périphériques              │
│ └── Firmware BIOS/UEFI                      │
├─────────────────────────────────────────────┤
│ Module noyau KVM                            │
│ ├── Ordonnancement vCPU                     │
│ ├── Gestion mémoire (configuration EPT)     │
│ └── Gestionnaires VM-Exit                   │
├─────────────────────────────────────────────┤
│ Noyau Linux                                 │
└─────────────────────────────────────────────┘

Point clé : Les vCPUs sont juste des threads Linux
\`\`\`

## Enlightenments Hyper-V

\`\`\`
Sans enlightenments :
Windows écrit CR3
    ↓
VM-Exit (500 cycles)
    ↓
Total : ~1000 cycles

Avec enlightenments :
Windows appelle HvSwitchVirtualAddressSpace()
    ↓
VMCALL (hypercall, ~50 cycles)
    ↓
Total : ~100 cycles

10x plus rapide !
\`\`\`

## Passthrough PCI — Accès matériel direct

\`\`\`
Problème : L'émulation de périphérique est lente

Solution : VFIO (Virtual Function I/O)
          Donner à l'invité un accès DIRECT au périphérique PCI
\`\`\`

### IOMMU

\`\`\`
Sans IOMMU :
Le pilote invité programme DMA
    ↓
Le périphérique écrit dans la mémoire HÔTE physique
    ↓
L'invité corrompt la mémoire hôte (MAUVAIS)

Avec IOMMU :
L'IOMMU traduit : GPA → HPA
    ↓
Isolation : Le périphérique ne peut accéder qu'à la mémoire invité
\`\`\`

## SR-IOV

\`\`\`
Virtualisation d'E/S racine unique :

Fonction physique (PF) :
└── Possédée par l'hôte

Fonctions virtuelles (VF) 1-256 :
├── Instances de périphérique légères
├── Chaque VF passée à un invité différent
└── Performance quasi-native

Performance : ~99% du natif
Latence : ~1-2 μs
\`\`\`

## Migration en direct

\`\`\`
Migration pré-copie :

Phase 1 : Copie mémoire itérative
Tant que (invité en cours d'exécution) :
    Copier les pages sales vers la destination
    
Phase 2 : Arrêt et copie
    Pause invité (début temps d'arrêt)
    Copier pages sales restantes
    Copier état vCPU
    Dépause invité sur destination (fin temps d'arrêt)

Temps d'arrêt typique : 50-100ms
\`\`\`

## Ballon mémoire

\`\`\`
Problème : Surengagement mémoire

Solution : Pilote ballon mémoire
1. L'hyperviseur veut récupérer 1 Go de l'invité
2. L'hyperviseur gonfle le ballon
3. Le pilote ballon alloue 1 Go dans l'invité
4. L'hyperviseur démape les pages de EPT
5. L'hôte récupère 1 Go de mémoire physique
\`\`\`

## Analyse de performance

\`\`\`
Surcoût CPU :
├── Natif : 0%
├── KVM + VT-x : 2-5%
├── Paravirt : 1-3%
└── Émulation : 90-95%

Surcoût mémoire :
├── EPT : 5-10%
└── Shadow PT : 20-30%

Surcoût I/O :
├── Émulé : 50-80%
├── Virtio : 10-20%
├── SR-IOV : 1-2%
└── VFIO : 1-5%
\`\`\``,
};

export const quiz = {
  en: [
    {
      question:
        "What is the primary purpose of the VMCS (Virtual Machine Control Structure)?",
      options: [
        "Store virtual disk data",
        "Define the state of a virtual CPU including guest/host registers, execution controls, and exit reasons",
        "Manage network connections",
        "Handle interrupts",
      ],
      correct: 1,
    },
    {
      question:
        "What problem does EPT (Extended Page Tables) solve compared to shadow page tables?",
      options: [
        "EPT uses less memory",
        "EPT eliminates expensive shadow page table rebuilds on CR3 writes — hardware walks guest PT + EPT",
        "EPT is easier to program",
        "EPT works on all CPUs",
      ],
      correct: 1,
    },
    {
      question:
        "What is the cost of a VM-Exit and why is minimizing them critical?",
      options: [
        "10 cycles — negligible",
        "~500-1000 cycles — expensive context switch that should be minimized through paravirtualization",
        "~10,000 cycles — very expensive",
        "VM-Exits are free",
      ],
      correct: 1,
    },
    {
      question: "How does SR-IOV achieve near-native I/O performance?",
      options: [
        "It uses faster cables",
        "Hardware creates lightweight Virtual Functions (VFs) that guests access directly via DMA — bypassing hypervisor",
        "It compresses data",
        "It caches more aggressively",
      ],
      correct: 1,
    },
    {
      question: "What is memory ballooning and why is it needed?",
      options: [
        "A compression algorithm",
        "A driver that 'steals' memory from guests by allocating it internally, allowing hypervisor to reclaim overcommitted RAM",
        "A backup mechanism",
        "A security feature",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Quel est l'objectif principal du VMCS (Virtual Machine Control Structure) ?",
      options: [
        "Stocker les données du disque virtuel",
        "Définir l'état d'un CPU virtuel incluant les registres invité/hôte, contrôles d'exécution et raisons de sortie",
        "Gérer les connexions réseau",
        "Gérer les interruptions",
      ],
      correct: 1,
    },
    {
      question:
        "Quel problème EPT (Extended Page Tables) résout-il par rapport aux tables de pages shadow ?",
      options: [
        "EPT utilise moins de mémoire",
        "EPT élimine les reconstructions coûteuses de shadow PT sur écritures CR3 — le matériel parcourt PT invité + EPT",
        "EPT est plus facile à programmer",
        "EPT fonctionne sur tous les CPUs",
      ],
      correct: 1,
    },
    {
      question:
        "Quel est le coût d'un VM-Exit et pourquoi est-il critique de les minimiser ?",
      options: [
        "10 cycles — négligeable",
        "~500-1000 cycles — changement de contexte coûteux qui devrait être minimisé via paravirtualisation",
        "~10 000 cycles — très coûteux",
        "Les VM-Exits sont gratuits",
      ],
      correct: 1,
    },
    {
      question:
        "Comment SR-IOV atteint-il des performances I/O quasi-natives ?",
      options: [
        "Il utilise des câbles plus rapides",
        "Le matériel crée des fonctions virtuelles (VFs) légères que les invités accèdent directement via DMA",
        "Il compresse les données",
        "Il met plus en cache",
      ],
      correct: 1,
    },
    {
      question:
        "Qu'est-ce que le ballon mémoire et pourquoi est-il nécessaire ?",
      options: [
        "Un algorithme de compression",
        "Un pilote qui 'vole' de la mémoire aux invités en l'allouant en interne, permettant à l'hyperviseur de récupérer la RAM surengagée",
        "Un mécanisme de sauvegarde",
        "Une fonctionnalité de sécurité",
      ],
      correct: 1,
    },
  ],
};
