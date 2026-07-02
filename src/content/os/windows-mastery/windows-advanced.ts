export const content = {
  en: `# Advanced Windows

This lesson goes where most Windows documentation stops. We cover the internals that senior engineers need to understand — memory internals, the driver model, COM architecture, debugging, and performance analysis at the OS level.

## Windows Memory Architecture Deep Dive

### Virtual Address Space Layout

On 64-bit Windows, each process gets a 128TB virtual address space:

\`\`\`
64-bit Process Virtual Address Space (128TB user + 128TB kernel)

User Mode (0x0000000000000000 to 0x00007FFFFFFFFFFF):
┌──────────────────────────────────────────┐ 0x00007FFFFFFFFFFF
│  Stack (grows downward)                  │
│  ↓                                       │
├──────────────────────────────────────────┤
│  Memory Mapped Files (DLLs, shared mem)  │
├──────────────────────────────────────────┤
│  Heap (grows upward)                     │
│  ↑                                       │
├──────────────────────────────────────────┤
│  Code (.text section)                    │
│  Data (.data, .bss sections)             │
└──────────────────────────────────────────┘ 0x0000000000000000

Kernel Mode (0xFFFF800000000000 to 0xFFFFFFFFFFFFFFFF):
┌──────────────────────────────────────────┐ 0xFFFFFFFFFFFFFFFF
│  HAL and Kernel Code                     │
├──────────────────────────────────────────┤
│  Kernel Stacks (one per thread)          │
├──────────────────────────────────────────┤
│  Paged Pool (kernel allocations)         │
├──────────────────────────────────────────┤
│  NonPaged Pool (must stay in RAM)        │
├──────────────────────────────────────────┤
│  System PTEs (page table entries)        │
└──────────────────────────────────────────┘ 0xFFFF800000000000
\`\`\`

### Pool Memory — The Kernel Heap

The kernel allocates memory from two pools:

**Paged Pool**: Can be paged to disk. Used for kernel objects that don't need to be in RAM constantly.
\`\`\`
Default: ~384GB on 64-bit Windows
Used for: File objects, registry objects, most kernel allocations
\`\`\`

**NonPaged Pool**: Always in physical RAM. Used for objects that interrupt handlers might access.
\`\`\`
Default: ~75% of RAM
Used for: Interrupt objects, DPC routines, network buffers
\`\`\`

\`\`\`powershell
# View pool usage
# Use Windows Performance Monitor or:
[System.Diagnostics.Process]::GetCurrentProcess() | Select-Object *

# Better: use RAMMap from Sysinternals to see detailed memory breakdown

# Pool tags — every kernel allocation has a 4-byte tag
# Use poolmon.exe (Windows Driver Kit) or Sysinternals to view
# Tag 'Proc' = process objects
# Tag 'File' = file objects
# Tag 'MmSt' = memory manager section objects
\`\`\`

### Working Sets and Page Faults

Every process has a **working set** — the set of pages currently in physical RAM:

\`\`\`
Hard page fault: Page not in RAM → load from pagefile/file (slow, ~milliseconds)
Soft page fault: Page in RAM but not mapped → remap (fast, ~microseconds)
Working set trim: OS removes pages from working set when RAM is low
\`\`\`

\`\`\`powershell
# Process memory details
Get-Process | Select-Object Name, 
    @{N='WorkingSet(MB)';E={[math]::Round($_.WorkingSet/1MB,2)}},
    @{N='VirtualMem(MB)';E={[math]::Round($_.VirtualMemorySize/1MB,2)}},
    @{N='PagedMem(MB)';E={[math]::Round($_.PagedMemorySize/1MB,2)}},
    @{N='NonPagedMem(KB)';E={[math]::Round($_.NonpagedSystemMemorySize/1KB,2)}} |
    Sort-Object 'WorkingSet(MB)' -Descending |
    Select-Object -First 10

# System memory counters
$os = Get-CimInstance Win32_OperatingSystem
[PSCustomObject]@{
    TotalRAM_GB    = [math]::Round($os.TotalVisibleMemorySize/1MB, 2)
    FreeRAM_GB     = [math]::Round($os.FreePhysicalMemory/1MB, 2)
    TotalPagefile  = [math]::Round($os.TotalVirtualMemorySize/1MB, 2)
    FreePagefile   = [math]::Round($os.FreeVirtualMemory/1MB, 2)
    UsedPercent    = [math]::Round((($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / $os.TotalVisibleMemorySize) * 100, 1)
}
\`\`\`

## Windows Driver Model (WDM/KMDF/UMDF)

### The Driver Stack

Every device in Windows is managed by a stack of drivers:

\`\`\`
Application
    │ IRP (I/O Request Packet)
    ▼
I/O Manager
    │
    ▼
┌─────────────────────────────────┐
│  Filter Driver (optional)       │  ← Anti-virus, encryption filters
├─────────────────────────────────┤
│  Function Driver                │  ← Main device driver (e.g., disk.sys)
├─────────────────────────────────┤
│  Filter Driver (optional)       │  ← Lower-level filters
├─────────────────────────────────┤
│  Bus Driver                     │  ← PCI, USB, ACPI bus drivers
└─────────────────────────────────┘
    │
    ▼
Hardware
\`\`\`

### IRP Flow

An IRP (I/O Request Packet) flows DOWN the stack:
1. I/O Manager creates IRP
2. Each driver in the stack processes it (or passes it down)
3. Bottom driver completes the IRP
4. Completion flows UP the stack
5. I/O Manager returns result to application

This is why a buggy filter driver (like a bad anti-virus) can crash the entire system — it's in the kernel driver stack.

### Driver Types

\`\`\`
WDM (Windows Driver Model)     — Legacy, complex, low-level
KMDF (Kernel-Mode Driver Framework) — Modern, safer, recommended for kernel drivers
UMDF (User-Mode Driver Framework)   — Runs in user mode, crashes don't BSOD
\`\`\`

\`\`\`powershell
# List all drivers
Get-WindowsDriver -Online | Select-Object Driver, Version, ProviderName

# Drivers loaded in kernel
driverquery /v
driverquery /fo csv | ConvertFrom-Csv | Sort-Object 'Start Mode'

# Check driver signature (unsigned drivers can be dangerous)
Get-AuthenticodeSignature C:\\Windows\\System32\\drivers\\*.sys |
    Where-Object { $_.Status -ne "Valid" }

# Driver verifier — stress test drivers (use in VM only!)
verifier /standard /all
\`\`\`

## COM — Component Object Model

COM is one of Windows' most important and least understood technologies. It is the foundation of:
- OLE (Object Linking and Embedding — documents containing objects)
- ActiveX (browser plugins)
- COM+ / DCOM (distributed COM)
- Windows Runtime (WinRT — underlying UWP)
- Many Windows APIs

### COM Architecture

\`\`\`
Client calls CoCreateInstance({CLSID}, ..., {IID}, &pInterface)
    │
    ▼
COM runtime looks up CLSID in registry:
HKCR\\CLSID\\{6BFD9030-2E3C-11D0-...}\\InprocServer32 = "mylib.dll"
    │
    ▼
COM loads mylib.dll and calls DllGetClassObject()
    │
    ▼
Class factory creates the object
    │
    ▼
QueryInterface({IID}) returns requested interface pointer
    │
    ▼
Client uses the interface (calls methods through vtable)
    │
    ▼
Client calls Release() → reference count drops to 0 → object destroyed
\`\`\`

### COM Interfaces and vtables

\`\`\`cpp
// Every COM interface inherits from IUnknown
interface IUnknown {
    HRESULT QueryInterface(REFIID riid, void** ppv);  // Get another interface
    ULONG   AddRef();                                   // Increment ref count
    ULONG   Release();                                  // Decrement ref count
};

// COM calls through a vtable — table of function pointers
// This is how Windows implements polymorphism without C++
Object in memory:
┌─────────────────┐
│ vtable pointer  │──→ ┌──────────────────┐
└─────────────────┘    │ QueryInterface() │
│    data...      │    │ AddRef()         │
└─────────────────┘    │ Release()        │
                       │ method1()        │
                       │ method2()        │
                       └──────────────────┘
\`\`\`

\`\`\`powershell
# List COM objects registered on your system
Get-ChildItem "HKCR:\\CLSID" | Select-Object -First 20

# OLEView.exe (Windows SDK) — browse COM objects
# Process Monitor — see COM object creation in real time
\`\`\`

## Windows Internals Debugging

### WinDbg — The Professional Debugger

WinDbg is the tool that kernel engineers use. It can debug:
- Live processes
- Kernel itself (kernel debugging)
- Memory dumps (crash analysis)

\`\`\`
# Analyze a crash dump
windbg -z C:\\Windows\\MINIDUMP\\Mini010124-01.dmp

# Key WinDbg commands:
!analyze -v          # Automatic crash analysis
lm                   # List loaded modules
!process 0 0         # List all processes
!thread              # Current thread info
kb                   # Stack backtrace
!pool address        # Pool allocation info
dt nt!_EPROCESS      # Display EPROCESS structure
!drvobj driver 3     # Driver object info
\`\`\`

### Reading a BSOD (Blue Screen of Death)

\`\`\`
SYSTEM_SERVICE_EXCEPTION (3b)
    │
    └── Stop code: The type of fault
         Common stop codes:
         IRQL_NOT_LESS_OR_EQUAL  — driver accessed invalid memory
         PAGE_FAULT_IN_NONPAGED_AREA — page fault in kernel
         SYSTEM_SERVICE_EXCEPTION — exception in syscall
         KERNEL_SECURITY_CHECK_FAILURE — kernel corruption detected
         DRIVER_IRQL_NOT_LESS_OR_EQUAL — driver used wrong IRQL

# Configure dump settings
# Control Panel → System → Advanced → Startup and Recovery
# Types:
# Small memory dump (256KB) — minimal info, call stack
# Kernel memory dump — kernel + driver memory
# Complete memory dump — full RAM (can be 32GB+)
# Automatic memory dump — recommended

# Force a BSOD (for testing dump configuration)
# NotMyFault from Sysinternals
\`\`\`

\`\`\`powershell
# Analyze recent crash dumps
$dumps = Get-ChildItem C:\\Windows\\Minidump -Filter "*.dmp" -ErrorAction SilentlyContinue
$dumps | Sort-Object LastWriteTime -Descending | Select-Object -First 5

# Check if system has crashed recently
Get-EventLog -LogName System -EntryType Error -Source "BugCheck" -Newest 10
\`\`\`

## Windows Performance Analysis

### ETW — Event Tracing for Windows

ETW is the most powerful performance analysis system in any OS. It provides:
- Nanosecond-precision timestamps
- Zero overhead when not tracing
- CPU sampling, disk I/O, network, memory, everything

\`\`\`powershell
# Windows Performance Recorder (GUI)
# wpr.exe (command line)
wpr -start GeneralProfile -filemode
# ... reproduce your performance issue ...
wpr -stop C:\\trace.etl

# Analyze with Windows Performance Analyzer (wpa.exe)
wpa C:\\trace.etl
\`\`\`

### Process Monitor (Sysinternals)

Process Monitor shows EVERY system call in real time:
- File system operations
- Registry operations
- Network operations
- Process/thread activity

\`\`\`
Filters that senior engineers use:
├── Process Name = "myapp.exe"  → Isolate one process
├── Result = "ACCESS DENIED"   → Find permission problems
├── Path = "HKLM\\SOFTWARE\\"  → Registry access by key
├── Operation = "WriteFile"     → Files being written
└── Result = "NAME NOT FOUND"  → Missing files (common bug cause)
\`\`\`

### Performance Counters

\`\`\`powershell
# CPU performance
Get-Counter "\\Processor(_Total)\\% Processor Time" -SampleInterval 1 -MaxSamples 10

# Memory performance
Get-Counter @(
    "\\Memory\\Available MBytes",
    "\\Memory\\Page Faults/sec",
    "\\Memory\\Pages Input/sec",
    "\\Paging File(_Total)\\% Usage"
) -SampleInterval 1 -MaxSamples 5

# Disk performance
Get-Counter @(
    "\\PhysicalDisk(_Total)\\% Disk Time",
    "\\PhysicalDisk(_Total)\\Avg. Disk Queue Length",
    "\\PhysicalDisk(_Total)\\Disk Reads/sec",
    "\\PhysicalDisk(_Total)\\Disk Writes/sec"
) -SampleInterval 1 -MaxSamples 5

# Network performance
Get-Counter "\\Network Interface(*)\\Bytes Total/sec" -SampleInterval 1 -MaxSamples 5

# Create performance log
$counters = @(
    "\\Processor(_Total)\\% Processor Time",
    "\\Memory\\Available MBytes",
    "\\PhysicalDisk(_Total)\\% Disk Time"
)
Get-Counter $counters -SampleInterval 5 -MaxSamples 12 |
    Export-Counter -Path C:\\perf-log.csv -Format CSV
\`\`\`

## NTFS Internals

NTFS is more sophisticated than most administrators realize:

### Master File Table (MFT)

\`\`\`
Every file and directory in NTFS has an MFT entry (1KB each):

MFT Entry:
├── $STANDARD_INFORMATION — timestamps, file attributes, owner
├── $FILE_NAME — filename, parent directory reference
├── $DATA — actual file content
│   ├── Resident (< ~700 bytes) — stored directly in MFT entry
│   └── Non-resident — stored in extents on disk
├── $INDEX_ROOT — directory index (for directories)
└── $SECURITY_DESCRIPTOR — ACL

Special MFT files:
$MFT           — The MFT itself
$MFTMirr       — First 4 MFT records backup
$LogFile       — NTFS transaction log
$Volume        — Volume name and version
$AttrDef       — Attribute type definitions
$Bitmap        — Free/used cluster map
$Boot          — Boot sector
$BadClus       — Bad clusters
$Secure        — Security descriptors
$UpCase        — Unicode uppercase table
\`\`\`

### NTFS Features Engineers Should Know

\`\`\`powershell
# Alternate Data Streams — hidden data attached to files
# Zone.Identifier is added by Windows when downloading files
Get-Item C:\\Downloads\\file.exe -Stream *
Get-Content C:\\Downloads\\file.exe -Stream Zone.Identifier
# Mark of the Web — source URL stored here

# Remove Zone.Identifier (unblock file)
Unblock-File C:\\Downloads\\file.exe
# Or: Right-click → Properties → Unblock

# NTFS Transactions (TxF — Transactional NTFS)
# Deprecated but still supported — allows file operations to be atomic

# Volume Shadow Copies
Get-WmiObject Win32_ShadowCopy | Select-Object *
# vssadmin list shadows

# Symbolic links and junctions
New-Item -ItemType SymbolicLink -Path C:\\link -Target C:\\target
New-Item -ItemType Junction -Path C:\\junction -Target C:\\target
# Difference: symlinks can cross volumes, junctions cannot
# NTFS reparse points implement both

# Sparse files — files with "holes" (zeros not stored on disk)
fsutil sparse queryFlag C:\\largefile.bin
\`\`\`

## Windows Subsystem for Linux (WSL) Internals

Understanding WSL shows how modern Windows is architected:

### WSL2 Architecture

\`\`\`
Windows Host
├── Hyper-V Hypervisor (Type 1, runs under Windows too)
│   └── Utility VM (lightweight Linux VM)
│       ├── Linux Kernel (Microsoft-maintained fork)
│       ├── Linux init (systemd in WSL2)
│       └── Your Linux processes
│
├── Windows Filesystem (C:\\ etc.)
│   └── Accessible in Linux as /mnt/c/
│
└── Linux Filesystem (ext4 image)
    └── Accessible in Windows as \\\\wsl$\\Ubuntu\\
\`\`\`

\`\`\`powershell
# WSL management
wsl --list --verbose                    # List installed distros
wsl --set-default Ubuntu               # Set default distro
wsl --set-version Ubuntu 2             # Convert to WSL2
wsl --shutdown                         # Stop all WSL instances
wsl --import Ubuntu C:\\WSL\\Ubuntu ubuntu.tar  # Import backup
wsl --export Ubuntu C:\\backup\\ubuntu.tar      # Export backup

# Run Linux command from PowerShell
wsl ls -la /etc
wsl -d Ubuntu -u root -- apt update

# WSL2 configuration (~/.wslconfig)
[wsl2]
memory=4GB
processors=2
swap=2GB
localhostForwarding=true
\`\`\`

## Sysinternals — The Professional Toolkit

Every Windows engineer needs these tools:

\`\`\`
Process Explorer    — Better Task Manager. Shows parent/child, DLLs, handles
Process Monitor     — Real-time system call monitor (file, registry, network, process)
Autoruns           — Everything that auto-starts (way more than msconfig)
ProcDump           — Capture process dumps for crash analysis
DebugView          — View OutputDebugString output from any process
TCPView            — Real-time network connection monitor
Handle             — Find which process has a file locked
Strings            — Extract text strings from binaries
Sigcheck           — Verify file signatures and check VirusTotal
VMMap              — Detailed process virtual memory map
RAMMap             — System-wide physical memory analysis
Disk2vhd          — Convert physical disk to VHD
\`\`\`

\`\`\`powershell
# Download Sysinternals Suite
Invoke-WebRequest -Uri "https://download.sysinternals.com/files/SysinternalsSuite.zip" \`
    -OutFile C:\\tools\\sysinternals.zip
Expand-Archive C:\\tools\\sysinternals.zip C:\\tools\\sysinternals

# Run from command line (no install needed)
C:\\tools\\sysinternals\\procexp.exe    # Process Explorer
C:\\tools\\sysinternals\\procmon.exe    # Process Monitor
C:\\tools\\sysinternals\\autoruns.exe   # Autoruns

# Or use Windows Package Manager
winget install Sysinternals.ProcessExplorer
winget install Sysinternals.ProcessMonitor
winget install Sysinternals.Autoruns
\`\`\`

## Windows Internals: What Senior Engineers Know

### Handle Table

Every process has a **handle table** — a mapping of handle values to kernel objects:

\`\`\`
Handle 0x4  → File Object (C:\\Windows\\System32\\ntdll.dll)
Handle 0x8  → Process Object (PID 1234)
Handle 0xC  → Event Object (unnamed)
Handle 0x10 → Registry Key (HKCU\\SOFTWARE\\MyApp)
\`\`\`

\`\`\`powershell
# Find handles using Sysinternals Handle
handle.exe -p notepad.exe
handle.exe C:\\locked-file.txt  # Find who has a file locked
\`\`\`

### IRQL — Interrupt Request Level

One of the most important kernel concepts:

\`\`\`
IRQL 31 (HIGH)    — Machine check, power failure
IRQL 2  (DISPATCH) — DPC (Deferred Procedure Call), thread scheduling
             ↑ At DISPATCH_LEVEL, thread cannot be preempted
             ↑ Cannot access paged memory (would cause BSOD)
             ↑ Cannot call any blocking functions
IRQL 1  (APC)     — Async Procedure Call
IRQL 0  (PASSIVE) — Normal thread execution

Rule: Higher IRQL can interrupt lower IRQL
Rule: At DISPATCH_LEVEL+, cannot touch paged memory
Violation → IRQL_NOT_LESS_OR_EQUAL BSOD
\`\`\`

### Deferred Procedure Calls (DPCs)

\`\`\`
Interrupt fires (keyboard press)
    │
    ▼
ISR (Interrupt Service Routine) — runs at high IRQL
    │ Must be very short — schedules a DPC
    ▼
DPC (Deferred Procedure Call) — runs at DISPATCH_LEVEL
    │ Does the real work — processes the keypress
    ▼
Back to normal thread execution
\`\`\`

Too many DPCs = system stuttering. Analyze with:
\`\`\`powershell
# Record DPC activity
xperf -on PROC_THREAD+LOADER+DPC -f kernel.etl
# Analyze in WPA — DPC/ISR view
\`\`\``,

  fr: `# Windows Avancé

Cette leçon va là où la plupart de la documentation Windows s'arrête. Nous couvrons les internals dont les ingénieurs seniors ont besoin — internals mémoire, le modèle de pilotes, l'architecture COM, le débogage et l'analyse des performances au niveau OS.

## Architecture mémoire Windows en profondeur

### Disposition de l'espace d'adressage virtuel

Sur Windows 64 bits, chaque processus obtient un espace d'adressage virtuel de 128 To :

\`\`\`
Espace d'adressage virtuel 64 bits (128 To utilisateur + 128 To noyau)

Mode utilisateur (0x0000000000000000 à 0x00007FFFFFFFFFFF) :
┌──────────────────────────────────────────┐ 0x00007FFFFFFFFFFF
│  Pile (croît vers le bas)                │
│  ↓                                       │
├──────────────────────────────────────────┤
│  Fichiers mappés en mémoire (DLL, mém partagée)│
├──────────────────────────────────────────┤
│  Tas (croît vers le haut)                │
│  ↑                                       │
├──────────────────────────────────────────┤
│  Code (section .text)                    │
│  Données (sections .data, .bss)          │
└──────────────────────────────────────────┘ 0x0000000000000000

Mode noyau (0xFFFF800000000000 à 0xFFFFFFFFFFFFFFFF) :
┌──────────────────────────────────────────┐ 0xFFFFFFFFFFFFFFFF
│  Code HAL et Noyau                       │
├──────────────────────────────────────────┤
│  Piles noyau (une par thread)            │
├──────────────────────────────────────────┤
│  Pool paginé (allocations noyau)         │
├──────────────────────────────────────────┤
│  Pool non paginé (doit rester en RAM)    │
├──────────────────────────────────────────┤
│  PTE système (entrées de table de pages) │
└──────────────────────────────────────────┘ 0xFFFF800000000000
\`\`\`

### Mémoire de pool — Le tas du noyau

Le noyau alloue de la mémoire depuis deux pools :

**Pool paginé** : Peut être paginé sur le disque. Utilisé pour les objets noyau qui n'ont pas besoin d'être constamment en RAM.
\`\`\`
Défaut : ~384 Go sur Windows 64 bits
Utilisé pour : Objets fichier, objets registre, la plupart des allocations noyau
\`\`\`

**Pool non paginé** : Toujours en RAM physique. Utilisé pour les objets auxquels les gestionnaires d'interruptions peuvent accéder.
\`\`\`
Défaut : ~75% de la RAM
Utilisé pour : Objets d'interruption, routines DPC, tampons réseau
\`\`\`

\`\`\`powershell
# Voir l'utilisation du pool
Get-Process | Select-Object Name,
    @{N='EnsembleTravail(Mo)';E={[math]::Round($_.WorkingSet/1MB,2)}},
    @{N='MémVirtuelle(Mo)';E={[math]::Round($_.VirtualMemorySize/1MB,2)}},
    @{N='MémPaginée(Mo)';E={[math]::Round($_.PagedMemorySize/1MB,2)}} |
    Sort-Object 'EnsembleTravail(Mo)' -Descending |
    Select-Object -First 10

# Informations mémoire système
$os = Get-CimInstance Win32_OperatingSystem
[PSCustomObject]@{
    RAMTotal_Go    = [math]::Round($os.TotalVisibleMemorySize/1MB, 2)
    RAMLibre_Go    = [math]::Round($os.FreePhysicalMemory/1MB, 2)
    FichierPage    = [math]::Round($os.TotalVirtualMemorySize/1MB, 2)
    UsagePct       = [math]::Round((($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / $os.TotalVisibleMemorySize) * 100, 1)
}
\`\`\`

## Modèle de pilotes Windows (WDM/KMDF/UMDF)

### La pile de pilotes

Chaque périphérique dans Windows est géré par une pile de pilotes :

\`\`\`
Application
    │ IRP (Paquet de requête d'E/S)
    ▼
Gestionnaire d'E/S
    │
    ▼
┌─────────────────────────────────┐
│  Pilote de filtre (optionnel)   │  ← Antivirus, filtres de chiffrement
├─────────────────────────────────┤
│  Pilote de fonction             │  ← Pilote de périphérique principal
├─────────────────────────────────┤
│  Pilote de filtre (optionnel)   │  ← Filtres de bas niveau
├─────────────────────────────────┤
│  Pilote de bus                  │  ← Pilotes de bus PCI, USB, ACPI
└─────────────────────────────────┘
    │
    ▼
Matériel
\`\`\`

### Flux IRP

Un IRP (Paquet de requête d'E/S) descend la pile :
1. Le gestionnaire d'E/S crée l'IRP
2. Chaque pilote dans la pile le traite (ou le passe)
3. Le pilote du bas complète l'IRP
4. La complétion remonte la pile
5. Le gestionnaire d'E/S retourne le résultat à l'application

C'est pourquoi un pilote de filtre bogué (comme un mauvais antivirus) peut planter tout le système — il est dans la pile de pilotes noyau.

\`\`\`powershell
# Lister tous les pilotes
driverquery /v
driverquery /fo csv | ConvertFrom-Csv | Sort-Object 'Start Mode'

# Vérifier la signature des pilotes
Get-AuthenticodeSignature C:\\Windows\\System32\\drivers\\*.sys |
    Where-Object { $_.Status -ne "Valid" }
\`\`\`

## COM — Modèle d'objet composant

COM est l'une des technologies Windows les plus importantes et les moins comprises. C'est le fondement de :
- OLE (Object Linking and Embedding)
- ActiveX (plugins navigateur)
- COM+ / DCOM (COM distribué)
- Windows Runtime (WinRT — base UWP)
- De nombreuses API Windows

### Architecture COM

\`\`\`
Le client appelle CoCreateInstance({CLSID}, ..., {IID}, &pInterface)
    │
    ▼
L'exécution COM recherche le CLSID dans le registre :
HKCR\\CLSID\\{6BFD9030-2E3C-11D0-...}\\InprocServer32 = "malib.dll"
    │
    ▼
COM charge malib.dll et appelle DllGetClassObject()
    │
    ▼
La fabrique de classe crée l'objet
    │
    ▼
QueryInterface({IID}) retourne le pointeur d'interface demandé
    │
    ▼
Le client utilise l'interface (appelle des méthodes via vtable)
    │
    ▼
Le client appelle Release() → compteur de références tombe à 0 → objet détruit
\`\`\`

### Interfaces COM et vtables

\`\`\`cpp
// Chaque interface COM hérite de IUnknown
interface IUnknown {
    HRESULT QueryInterface(REFIID riid, void** ppv);  // Obtenir une autre interface
    ULONG   AddRef();                                   // Incrémenter le compteur
    ULONG   Release();                                  // Décrémenter le compteur
};

// COM appelle via une vtable — table de pointeurs de fonctions
Objet en mémoire :
┌─────────────────┐
│ pointeur vtable │──→ ┌──────────────────┐
└─────────────────┘    │ QueryInterface() │
│    données...   │    │ AddRef()         │
└─────────────────┘    │ Release()        │
                       │ méthode1()       │
                       │ méthode2()       │
                       └──────────────────┘
\`\`\`

## Débogage des internals Windows

### WinDbg — Le débogueur professionnel

WinDbg est l'outil que les ingénieurs noyau utilisent. Il peut déboguer :
- Processus en direct
- Le noyau lui-même (débogage noyau)
- Les dumps mémoire (analyse de crash)

\`\`\`
# Analyser un dump de crash
windbg -z C:\\Windows\\MINIDUMP\\Mini010124-01.dmp

# Commandes WinDbg clés :
!analyze -v          # Analyse automatique du crash
lm                   # Lister les modules chargés
!process 0 0         # Lister tous les processus
!thread              # Infos thread courant
kb                   # Trace de pile
!pool adresse        # Infos allocation pool
dt nt!_EPROCESS      # Afficher la structure EPROCESS
\`\`\`

### Lire un BSOD (Écran bleu de la mort)

\`\`\`
SYSTEM_SERVICE_EXCEPTION (3b)
    │
    └── Code d'arrêt : Le type de défaut
         Codes d'arrêt courants :
         IRQL_NOT_LESS_OR_EQUAL  — le pilote a accédé à une mémoire invalide
         PAGE_FAULT_IN_NONPAGED_AREA — défaut de page dans le noyau
         SYSTEM_SERVICE_EXCEPTION — exception dans un syscall
         KERNEL_SECURITY_CHECK_FAILURE — corruption noyau détectée
         DRIVER_IRQL_NOT_LESS_OR_EQUAL — le pilote a utilisé le mauvais IRQL

# Configurer les paramètres de dump
# Panneau de configuration → Système → Avancé → Démarrage et récupération
# Types de dump :
# Petit dump mémoire (256 Ko) — info minimale, pile d'appels
# Dump mémoire noyau — mémoire noyau + pilote
# Dump mémoire complet — RAM complète
# Dump mémoire automatique — recommandé
\`\`\`

## Analyse des performances Windows

### ETW — Suivi d'événements pour Windows

ETW est le système d'analyse des performances le plus puissant de tout OS :

\`\`\`powershell
# Windows Performance Recorder
wpr -start GeneralProfile -filemode
# ... reproduire le problème de performances ...
wpr -stop C:\\trace.etl

# Analyser avec Windows Performance Analyzer
wpa C:\\trace.etl
\`\`\`

### Compteurs de performances

\`\`\`powershell
# Performance CPU
Get-Counter "\\Processor(_Total)\\% Processor Time" -SampleInterval 1 -MaxSamples 10

# Performance mémoire
Get-Counter @(
    "\\Memory\\Available MBytes",
    "\\Memory\\Page Faults/sec",
    "\\Memory\\Pages Input/sec",
    "\\Paging File(_Total)\\% Usage"
) -SampleInterval 1 -MaxSamples 5

# Performance disque
Get-Counter @(
    "\\PhysicalDisk(_Total)\\% Disk Time",
    "\\PhysicalDisk(_Total)\\Avg. Disk Queue Length",
    "\\PhysicalDisk(_Total)\\Disk Reads/sec",
    "\\PhysicalDisk(_Total)\\Disk Writes/sec"
) -SampleInterval 1 -MaxSamples 5

# Créer un journal de performances
$compteurs = @(
    "\\Processor(_Total)\\% Processor Time",
    "\\Memory\\Available MBytes",
    "\\PhysicalDisk(_Total)\\% Disk Time"
)
Get-Counter $compteurs -SampleInterval 5 -MaxSamples 12 |
    Export-Counter -Path C:\\perf-log.csv -Format CSV
\`\`\`

## Internals NTFS

### Table de fichiers maître (MFT)

\`\`\`
Chaque fichier et répertoire dans NTFS a une entrée MFT (1 Ko chacune) :

Entrée MFT :
├── $STANDARD_INFORMATION — horodatages, attributs fichier, propriétaire
├── $FILE_NAME — nom de fichier, référence répertoire parent
├── $DATA — contenu réel du fichier
│   ├── Résident (< ~700 octets) — stocké directement dans l'entrée MFT
│   └── Non-résident — stocké dans des étendues sur le disque
├── $INDEX_ROOT — index de répertoire (pour les répertoires)
└── $SECURITY_DESCRIPTOR — ACL

Fichiers MFT spéciaux :
$MFT           — La MFT elle-même
$MFTMirr       — Sauvegarde des 4 premiers enregistrements MFT
$LogFile       — Journal des transactions NTFS
$Volume        — Nom et version du volume
$Bitmap        — Carte des clusters libres/utilisés
$Boot          — Secteur de démarrage
$BadClus       — Clusters défectueux
$Secure        — Descripteurs de sécurité
\`\`\`

\`\`\`powershell
# Flux de données alternatifs — données cachées attachées aux fichiers
# Zone.Identifier est ajouté par Windows lors du téléchargement
Get-Item C:\\Téléchargements\\fichier.exe -Stream *
Get-Content C:\\Téléchargements\\fichier.exe -Stream Zone.Identifier

# Supprimer Zone.Identifier (débloquer le fichier)
Unblock-File C:\\Téléchargements\\fichier.exe

# Liens symboliques et jonctions
New-Item -ItemType SymbolicLink -Path C:\\lien -Target C:\\cible
New-Item -ItemType Junction -Path C:\\jonction -Target C:\\cible
# Différence : les liens symboliques peuvent traverser les volumes, pas les jonctions
\`\`\`

## Sysinternals — La boîte à outils professionnelle

Chaque ingénieur Windows a besoin de ces outils :

\`\`\`
Process Explorer    — Meilleur Gestionnaire des tâches. Affiche parent/enfant, DLL, handles
Process Monitor     — Moniteur d'appels système en temps réel (fichier, registre, réseau, processus)
Autoruns           — Tout ce qui démarre automatiquement
ProcDump           — Capturer les dumps de processus pour l'analyse de crash
TCPView            — Moniteur de connexions réseau en temps réel
Handle             — Trouver quel processus a verrouillé un fichier
Strings            — Extraire les chaînes de texte des binaires
Sigcheck           — Vérifier les signatures de fichiers et consulter VirusTotal
VMMap              — Carte détaillée de la mémoire virtuelle du processus
RAMMap             — Analyse de la mémoire physique à l'échelle du système
\`\`\`

\`\`\`powershell
# Installer via winget
winget install Sysinternals.ProcessExplorer
winget install Sysinternals.ProcessMonitor
winget install Sysinternals.Autoruns
\`\`\`

## IRQL — Niveau de requête d'interruption

L'un des concepts noyau les plus importants :

\`\`\`
IRQL 31 (HIGH)    — Vérification machine, panne de courant
IRQL 2  (DISPATCH) — DPC, ordonnancement de threads
             ↑ À DISPATCH_LEVEL, le thread ne peut pas être préempté
             ↑ Ne peut pas accéder à la mémoire paginée (provoquerait un BSOD)
             ↑ Ne peut pas appeler des fonctions bloquantes
IRQL 1  (APC)     — Appel de procédure asynchrone
IRQL 0  (PASSIVE) — Exécution normale de thread

Règle : Un IRQL plus élevé peut interrompre un IRQL plus faible
Règle : À DISPATCH_LEVEL+, ne peut pas toucher la mémoire paginée
Violation → BSOD IRQL_NOT_LESS_OR_EQUAL
\`\`\`

### Appels de procédure différés (DPC)

\`\`\`
Interruption se déclenche (appui touche clavier)
    │
    ▼
ISR (Routine de service d'interruption) — s'exécute à IRQL élevé
    │ Doit être très courte — planifie un DPC
    ▼
DPC (Appel de procédure différé) — s'exécute à DISPATCH_LEVEL
    │ Fait le vrai travail — traite l'appui de touche
    ▼
Retour à l'exécution normale du thread
\`\`\`

Trop de DPC = bégaiement du système. Analyser avec :
\`\`\`powershell
# Enregistrer l'activité DPC
xperf -on PROC_THREAD+LOADER+DPC -f kernel.etl
# Analyser dans WPA — vue DPC/ISR
\`\`\``,
};

export const quiz = {
  en: [
    {
      question:
        "What is the difference between Paged Pool and NonPaged Pool in the Windows kernel?",
      options: [
        "Paged Pool is faster, NonPaged Pool is slower",
        "Paged Pool can be swapped to disk, NonPaged Pool must always remain in physical RAM",
        "Paged Pool is for user mode, NonPaged Pool is for kernel mode",
        "They are the same thing with different names",
      ],
      correct: 1,
    },
    {
      question: "What happens when a driver violates IRQL rules?",
      options: [
        "The driver is automatically unloaded",
        "The system shows a warning message",
        "A BSOD with IRQL_NOT_LESS_OR_EQUAL or similar stop code",
        "The process using the driver crashes",
      ],
      correct: 2,
    },
    {
      question: "What is the role of a vtable in COM?",
      options: [
        "It stores COM object data",
        "It is a table of function pointers that enables polymorphism and interface calls",
        "It maps COM objects to registry GUIDs",
        "It manages COM object reference counting",
      ],
      correct: 1,
    },
    {
      question:
        "What does ETW (Event Tracing for Windows) provide that other profilers do not?",
      options: [
        "CPU usage statistics",
        "Network monitoring",
        "Nanosecond-precision timestamps with near-zero overhead — covering the entire OS",
        "Memory leak detection",
      ],
      correct: 2,
    },
    {
      question: "What is the NTFS Master File Table (MFT)?",
      options: [
        "A list of mounted volumes",
        "A database where every file and directory has a 1KB entry containing metadata",
        "The boot sector of the NTFS volume",
        "A table of file permissions",
      ],
      correct: 1,
    },
  ],
  fr: [
    {
      question:
        "Quelle est la différence entre le Pool paginé et le Pool non paginé dans le noyau Windows ?",
      options: [
        "Le Pool paginé est plus rapide, le Pool non paginé est plus lent",
        "Le Pool paginé peut être échangé sur le disque, le Pool non paginé doit toujours rester en RAM physique",
        "Le Pool paginé est pour le mode utilisateur, le Pool non paginé pour le mode noyau",
        "Ce sont la même chose avec des noms différents",
      ],
      correct: 1,
    },
    {
      question: "Que se passe-t-il quand un pilote viole les règles IRQL ?",
      options: [
        "Le pilote est automatiquement déchargé",
        "Le système affiche un message d'avertissement",
        "Un BSOD avec le code IRQL_NOT_LESS_OR_EQUAL ou similaire",
        "Le processus utilisant le pilote plante",
      ],
      correct: 2,
    },
    {
      question: "Quel est le rôle d'une vtable dans COM ?",
      options: [
        "Elle stocke les données d'objets COM",
        "C'est une table de pointeurs de fonctions qui permet le polymorphisme et les appels d'interface",
        "Elle mappe les objets COM aux GUID du registre",
        "Elle gère le comptage de références des objets COM",
      ],
      correct: 1,
    },
    {
      question:
        "Qu'est-ce qu'ETW (Suivi d'événements pour Windows) fournit que les autres profileurs ne fournissent pas ?",
      options: [
        "Des statistiques d'utilisation CPU",
        "La surveillance réseau",
        "Des horodatages en précision nanoseconde avec un overhead quasi nul — couvrant tout l'OS",
        "La détection de fuites mémoire",
      ],
      correct: 2,
    },
    {
      question: "Qu'est-ce que la Table de fichiers maître NTFS (MFT) ?",
      options: [
        "Une liste des volumes montés",
        "Une base de données où chaque fichier et répertoire a une entrée de 1 Ko contenant les métadonnées",
        "Le secteur de démarrage du volume NTFS",
        "Une table des permissions des fichiers",
      ],
      correct: 1,
    },
  ],
};
