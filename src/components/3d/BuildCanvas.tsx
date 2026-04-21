"use client";

import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Text, Line, Billboard } from "@react-three/drei";
import * as THREE from "three";

// ─── Types ────────────────────────────────────────────────────────────────────
type StepKey =
  | "cpu"
  | "cooler"
  | "ram"
  | "nvme"
  | "gpu"
  | "drives"
  | "cables"
  | "psu";

interface Step {
  key: StepKey;
  name: string;
  model: string;
  desc: string;
  tip: string;
  specs: [string, string][];
}

const STEPS: Step[] = [
  {
    key: "cpu",
    name: "Install CPU",
    model: "AMD Ryzen 9 7950X",
    desc: "Align the triangle marker on the CPU corner with the triangle on the AM5 socket. Lower the CPU gently — zero insertion force. Lock the retention lever.",
    tip: "Never touch the gold contact pads. Hold the CPU by its edges only.",
    specs: [
      ["Cores", "16C / 32T"],
      ["Boost", "5.7 GHz"],
      ["Socket", "AM5"],
      ["TDP", "170W"],
    ],
  },
  {
    key: "cooler",
    name: "Install CPU Cooler",
    model: "Noctua NH-D15",
    desc: "Apply a pea-sized dot of thermal paste to the CPU center. Mount the backplate, attach the cooler bracket, then tighten screws in a diagonal X pattern — never fully tighten one side at a time.",
    tip: "Tighten screws in X pattern to distribute pressure evenly across the IHS.",
    specs: [
      ["Type", "Dual-tower air"],
      ["TDP rating", "250W"],
      ["Fans", "2× 140mm PWM"],
      ["Noise", "~24 dB(A)"],
    ],
  },
  {
    key: "ram",
    name: "Install RAM",
    model: "G.Skill Trident Z5 DDR5 32GB",
    desc: "Install in slots A2 and B2 (second and fourth slots) for dual-channel mode. Press firmly until both retention clips snap shut on both ends simultaneously.",
    tip: "A2 + B2 slots give you dual-channel — twice the memory bandwidth for free.",
    specs: [
      ["Speed", "DDR5-6000"],
      ["Capacity", "32 GB (2×16)"],
      ["Bandwidth", "96 GB/s"],
      ["Voltage", "1.1V"],
    ],
  },
  {
    key: "nvme",
    name: "Install NVMe SSD",
    model: "WD Black SN850X 2TB",
    desc: "Insert the M.2 drive at 30° into the primary M.2 slot (CPU-direct). Press the far end flat and secure with the retention screw or clip. No power cable needed.",
    tip: "The primary M.2 slot connects directly to the CPU — much faster than PCH-attached slots.",
    specs: [
      ["Interface", "PCIe 4.0 x4"],
      ["Read", "7,300 MB/s"],
      ["Write", "6,600 MB/s"],
      ["Form", "M.2 2280"],
    ],
  },
  {
    key: "gpu",
    name: "Install GPU",
    model: "NVIDIA RTX 4090",
    desc: "Lower the GPU into the PCIe x16 slot — listen for the retention clip to click. Connect the 16-pin 12VHPWR power cable from the PSU. Remove the I/O bracket covers from the case.",
    tip: "The PCIe retention clip is under the GPU end — push it to release when removing.",
    specs: [
      ["VRAM", "24 GB GDDR6X"],
      ["Bandwidth", "1,008 GB/s"],
      ["TDP", "450W"],
      ["Slot", "PCIe 5.0 x16"],
    ],
  },
  {
    key: "drives",
    name: "Install Drives",
    model: "HDD + SATA SSD",
    desc: 'Screw the 3.5" HDD into the drive bay with 4 screws. Screw the 2.5" SSD into its bay. Connect SATA data cables from each drive to the motherboard SATA ports. Connect SATA power from PSU.',
    tip: "SATA data cable goes to the board. SATA power comes from the PSU. Two separate cables per drive.",
    specs: [
      ["HDD", "Seagate 8TB SATA III"],
      ["SSD", "Samsung 870 EVO 1TB"],
      ["HDD speed", "~200 MB/s"],
      ["SSD speed", "~550 MB/s"],
    ],
  },
  {
    key: "cables",
    name: "Connect Power Cables",
    model: "Cable Management",
    desc: "Connect the 24-pin ATX main power to the board. Connect the 8-pin EPS CPU power to the top of the board. Connect 3× PCIe power to the GPU. Connect SATA power to each drive.",
    tip: "Route cables behind the motherboard tray before plugging in — much easier than after.",
    specs: [
      ["24-pin ATX", "Main board power"],
      ["8-pin EPS", "CPU & VRM power"],
      ["16-pin HVPWR", "GPU 450W"],
      ["SATA power", "Drives"],
    ],
  },
  {
    key: "psu",
    name: "Install PSU",
    model: "Corsair RM750x 750W Gold",
    desc: "Slide the PSU into the bottom PSU bay with the fan facing down (toward a vent). Secure with 4 screws from the back of the case. Connect the modular cables you need.",
    tip: "Fan down = draws cool air from outside the case. Fan up = recirculates hot case air.",
    specs: [
      ["Output", "750W"],
      ["Efficiency", "Gold (87-90%)"],
      ["Fan", "135mm hydraulic"],
      ["Modular", "Fully modular"],
    ],
  },
];

// ─── Power rails data ─────────────────────────────────────────────────────────
interface PowerRail {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
  voltage: string;
  watts: string;
}

const POWER_RAILS: PowerRail[] = [
  {
    from: new THREE.Vector3(-4.5, 0.7, 2.8),
    to: new THREE.Vector3(4.25, 0.5, -0.6),
    color: "#ffdd00",
    voltage: "12V+5V+3.3V",
    watts: "80W",
  },
  {
    from: new THREE.Vector3(-4.5, 0.7, 2.8),
    to: new THREE.Vector3(-3.5, 0.5, -3.3),
    color: "#ff8800",
    voltage: "12V",
    watts: "300W",
  },
  {
    from: new THREE.Vector3(-3.5, 0.5, -1.1),
    to: new THREE.Vector3(-1.7, 0.5, -1),
    color: "#ff3300",
    voltage: "1.1V",
    watts: "170W",
  },
  {
    from: new THREE.Vector3(-4.5, 0.7, 2.8),
    to: new THREE.Vector3(0.9, 0.5, 1.0),
    color: "#cc00ff",
    voltage: "12V",
    watts: "450W",
  },
  {
    from: new THREE.Vector3(4.25, 0.5, -0.6),
    to: new THREE.Vector3(2.1, 0.5, -0.7),
    color: "#00eedd",
    voltage: "1.1V",
    watts: "12W",
  },
  {
    from: new THREE.Vector3(4.25, 0.5, -0.6),
    to: new THREE.Vector3(0.1, 0.5, 0.2),
    color: "#4499ff",
    voltage: "3.3V",
    watts: "8W",
  },
  {
    from: new THREE.Vector3(-4.5, 0.7, 2.8),
    to: new THREE.Vector3(6.8, 0.5, 2.5),
    color: "#ff8800",
    voltage: "12V+5V",
    watts: "10W",
  },
  {
    from: new THREE.Vector3(-4.5, 0.7, 2.8),
    to: new THREE.Vector3(6.8, 0.5, 0.0),
    color: "#aacc00",
    voltage: "5V+3.3V",
    watts: "5W",
  },
];

// ─── Power particle ───────────────────────────────────────────────────────────
function PowerParticle({
  from,
  to,
  color,
  progress,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
  progress: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    const t = (progress + Date.now() * 0.00008) % 1;
    ref.current.position.lerpVectors(from, to, t);
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

// ─── Power flow lines ─────────────────────────────────────────────────────────
function PowerFlowLines() {
  return (
    <group>
      {POWER_RAILS.map((r, i) => (
        <group key={i}>
          <Line
            points={[r.from, r.to]}
            color={r.color}
            lineWidth={6}
            transparent
            opacity={0.12}
          />
          <Line
            points={[r.from, r.to]}
            color={r.color}
            lineWidth={2.5}
            transparent
            opacity={0.85}
          />
          {Array.from({ length: 3 }).map((_, j) => (
            <PowerParticle
              key={j}
              from={r.from}
              to={r.to}
              color={r.color}
              progress={j / 3}
            />
          ))}
          <Billboard
            position={new THREE.Vector3()
              .lerpVectors(r.from, r.to, 0.5)
              .add(new THREE.Vector3(0, 0.5, 0))}
          >
            <Text
              fontSize={0.2}
              color={r.color}
              anchorX="center"
              outlineWidth={0.02}
              outlineColor="#000000"
            >
              {r.voltage} · {r.watts}
            </Text>
          </Billboard>
        </group>
      ))}
    </group>
  );
}

// ─── Scene background ─────────────────────────────────────────────────────────
function SceneBackground() {
  const { scene, gl } = useThree();
  scene.background = new THREE.Color("#0d1810");
  gl.setClearColor(new THREE.Color("#0d1810"), 1);
  return null;
}

// ─── Motherboard ──────────────────────────────────────────────────────────────
function Motherboard() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[9.5, 0.12, 7.6]} />
        <meshPhongMaterial color="#1a6020" shininess={16} />
      </mesh>
      {[
        [
          [-1.7, 0.07, -1],
          [1.55, 0.07, -1],
        ],
        [
          [-1.7, 0.07, -1],
          [-1.7, 0.07, 1.25],
        ],
        [
          [0.8, 0.07, 0.7],
          [4.32, 0.07, 1],
        ],
        [
          [4.25, 0.07, -0.6],
          [-1.7, 0.07, -0.6],
        ],
        [
          [0.1, 0.07, 0.2],
          [0.8, 0.07, 0.7],
        ],
      ].map((pts, i) => (
        <line key={i}>
          <bufferGeometry
            attach="geometry"
            setFromPoints={pts.map(([x, y, z]) => new THREE.Vector3(x, y, z))}
          />
          <lineBasicMaterial color="#33aa33" transparent opacity={0.4} />
        </line>
      ))}
      <mesh position={[-1.7, 0.09, -1]}>
        <boxGeometry args={[1.78, 0.07, 1.78]} />
        <meshPhongMaterial color="#9a7040" />
      </mesh>
      {[1.55, 1.85, 2.2, 2.5].map((x, i) => (
        <mesh key={i} position={[x, 0.13, -0.7]}>
          <boxGeometry args={[0.13, 0.26, 2.5]} />
          <meshPhongMaterial color={i < 2 ? "#3a3860" : "#282840"} />
        </mesh>
      ))}
      <mesh position={[0.1, 0.1, 1.9]}>
        <boxGeometry args={[7.5, 0.08, 0.28]} />
        <meshPhongMaterial color="#444444" />
      </mesh>
      <mesh position={[0.1, 0.08, 0.2]}>
        <boxGeometry args={[2.05, 0.05, 0.26]} />
        <meshPhongMaterial color="#304035" />
      </mesh>
      <mesh position={[0.8, 0.18, 0.7]}>
        <boxGeometry args={[1.0, 0.14, 1.0]} />
        <meshPhongMaterial color="#1e1e1e" />
      </mesh>
      {[1.0, 1.85, 2.7].map((z, i) => (
        <mesh key={i} position={[4.32, 0.24, z]}>
          <boxGeometry args={[0.2, 0.38, 0.74]} />
          <meshPhongMaterial color="#ee8800" />
        </mesh>
      ))}
      <mesh position={[2.6, 0.12, 2.4]}>
        <boxGeometry args={[0.56, 0.07, 0.4]} />
        <meshPhongMaterial color="#111111" />
      </mesh>
      <mesh position={[3.1, 0.15, 2.1]}>
        <cylinderGeometry args={[0.35, 0.35, 0.16, 16]} />
        <meshPhongMaterial color="#d0d0d0" />
      </mesh>
      <mesh position={[4.25, 0.32, -0.6]}>
        <boxGeometry args={[0.56, 0.48, 2.2]} />
        <meshPhongMaterial color="#dddd99" />
      </mesh>
      <mesh position={[-3.5, 0.32, -3.3]}>
        <boxGeometry args={[0.74, 0.38, 0.74]} />
        <meshPhongMaterial color="#eeeecc" />
      </mesh>
      {[
        [-3.1, -0.85],
        [-3.5, -0.85],
        [-3.9, -0.85],
        [-3.1, -1.38],
        [-3.5, -1.38],
        [-3.9, -1.38],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.24, z]}>
          <boxGeometry args={[0.34, 0.28, 0.34]} />
          <meshPhongMaterial color="#b0b090" />
        </mesh>
      ))}
      <mesh position={[-4.5, 0.32, -2.2]}>
        <boxGeometry args={[0.24, 0.65, 1.8]} />
        <meshPhongMaterial color="#4477cc" />
      </mesh>
      {[
        [-4, -3.4],
        [4, -3.4],
        [-4, 3.4],
        [4, 3.4],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.07, z]}>
          <cylinderGeometry args={[0.19, 0.19, 0.13, 14]} />
          <meshPhongMaterial color="#060e08" />
        </mesh>
      ))}
    </group>
  );
}

// ─── Installed components ─────────────────────────────────────────────────────
function InstalledCPU({ animY }: { animY: number }) {
  return (
    <group position={[-1.7, animY, -1]}>
      <mesh>
        <boxGeometry args={[1.42, 0.1, 1.42]} />
        <meshPhongMaterial color="#c8a040" shininess={60} />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[1.38, 0.04, 1.38]} />
        <meshPhongMaterial color="#222210" />
      </mesh>
      <Text
        position={[0, 0.08, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.12}
        color="#1a1000"
        anchorX="center"
        anchorY="middle"
      >
        AMD Ryzen 9
      </Text>
    </group>
  );
}

function InstalledCooler({ animY }: { animY: number }) {
  const fanRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (fanRef.current) fanRef.current.rotation.y += delta * 8;
  });
  return (
    <group position={[-1.7, animY + 0.2, -0.7]}>
      <mesh position={[0, -0.05, -0.3]}>
        <boxGeometry args={[1.42, 0.02, 1.42]} />
        <meshPhongMaterial color="#cc7722" />
      </mesh>
      {[-1.3, -1.7, -2.1].map((x, i) => (
        <mesh key={i} position={[x + 1.7, 0.4, -0.3]}>
          <cylinderGeometry args={[0.055, 0.055, 1.0, 12]} />
          <meshPhongMaterial color="#b87333" shininess={40} />
        </mesh>
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, 0.8, -0.3 + (i - 3.5) * 0.16]}>
          <boxGeometry args={[1.28, 1.4, 0.06]} />
          <meshPhongMaterial color="#cccccc" shininess={30} />
        </mesh>
      ))}
      <group ref={fanRef} position={[0, 0.95, 0.35]}>
        {Array.from({ length: 7 }).map((_, i) => (
          <mesh key={i} rotation={[0, (i / 7) * Math.PI * 2, 0]}>
            <boxGeometry args={[0.5, 0.06, 0.12]} />
            <meshPhongMaterial color="#1a1a1a" />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0.95, 0.35]}>
        <cylinderGeometry args={[0.56, 0.56, 0.1, 24]} />
        <meshPhongMaterial color="#111111" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function InstalledRAM({ animY }: { animY: number }) {
  return (
    <group>
      {[1.55, 1.85].map((x, i) => (
        <group key={i} position={[x, animY + 0.55, -0.7]}>
          <mesh>
            <boxGeometry args={[0.11, 0.84, 2.5]} />
            <meshPhongMaterial color="#181830" />
          </mesh>
          <mesh position={[0, 0.44, 0]}>
            <boxGeometry args={[0.12, 0.06, 2.5]} />
            <meshPhongMaterial color="#2244bb" emissive="#001133" />
          </mesh>
          {Array.from({ length: 8 }).map((_, j) => (
            <mesh key={j} position={[0.07, 0, -1.0 + j * 0.28]}>
              <boxGeometry args={[0.02, 0.18, 0.22]} />
              <meshPhongMaterial color="#111111" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function InstalledNVMe({ animY }: { animY: number }) {
  return (
    <group position={[0.1, animY + 0.14, 0.2]}>
      <mesh>
        <boxGeometry args={[2.0, 0.1, 0.23]} />
        <meshPhongMaterial color="#0a1a0a" />
      </mesh>
      {[
        [-0.38, 0],
        [0.42, 0],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.08, z]}>
          <boxGeometry args={[0.62, 0.07, 0.19]} />
          <meshPhongMaterial color="#151515" />
        </mesh>
      ))}
      <Text
        position={[0, 0.12, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.08}
        color="#00aa44"
        anchorX="center"
      >
        WD SN850X 2TB
      </Text>
    </group>
  );
}

function InstalledGPU({ animY }: { animY: number }) {
  const fanRef1 = useRef<THREE.Group>(null);
  const fanRef2 = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (fanRef1.current) fanRef1.current.rotation.z += delta * 5;
    if (fanRef2.current) fanRef2.current.rotation.z -= delta * 5;
  });
  return (
    <group position={[0, animY, 0]}>
      <mesh position={[0.4, 0.17, 1.9]}>
        <boxGeometry args={[5.8, 0.11, 1.4]} />
        <meshPhongMaterial color="#0a0a1a" />
      </mesh>
      <mesh position={[0.4, 0.85, 1.9]}>
        <boxGeometry args={[5.8, 1.4, 2.1]} />
        <meshPhongMaterial color="#161616" />
      </mesh>
      <mesh position={[3.35, 0.85, 1.9]}>
        <boxGeometry args={[0.13, 1.4, 2.1]} />
        <meshPhongMaterial color="#909090" shininess={60} />
      </mesh>
      {[
        [-0.8, fanRef1],
        [1.4, fanRef2],
      ].map(([xOff, ref], fi) => (
        <group key={fi}>
          <mesh position={[xOff as number, 1.7, 1.9]}>
            <cylinderGeometry args={[0.65, 0.65, 0.22, 24]} />
            <meshPhongMaterial color="#111111" transparent opacity={0.85} />
          </mesh>
          <group ref={ref as any} position={[xOff as number, 1.7, 1.9]}>
            {Array.from({ length: 9 }).map((_, i) => (
              <mesh key={i} rotation={[0, 0, (i / 9) * Math.PI * 2]}>
                <boxGeometry args={[0.55, 0.05, 0.14]} />
                <meshPhongMaterial color="#252525" />
              </mesh>
            ))}
          </group>
        </group>
      ))}
      <Text
        position={[0.4, 1.6, 2.97]}
        fontSize={0.14}
        color="#6644ff"
        anchorX="center"
      >
        RTX 4090
      </Text>
    </group>
  );
}

function InstalledDrives({ animY }: { animY: number }) {
  const platRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (platRef.current) platRef.current.rotation.y += delta * 12;
  });
  return (
    <group>
      <group position={[6.8, animY + 0.45, 2.5]}>
        <mesh>
          <boxGeometry args={[3.2, 0.9, 4.6]} />
          <meshPhongMaterial color="#686868" shininess={20} />
        </mesh>
        <mesh ref={platRef} position={[0, 0.48, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 0.06, 32]} />
          <meshPhongMaterial color="#7a7a7a" shininess={80} />
        </mesh>
        <Text
          position={[0, 0.52, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.2}
          color="#aaaaaa"
          anchorX="center"
        >
          8TB
        </Text>
      </group>
      <group position={[6.8, animY + 0.15, 0.0]}>
        <mesh>
          <boxGeometry args={[2.2, 0.32, 3.1]} />
          <meshPhongMaterial color="#333333" />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[2.1, 0.06, 3.0]} />
          <meshPhongMaterial color="#555555" shininess={40} />
        </mesh>
        <Text
          position={[0, 0.22, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.18}
          color="#55aaff"
          anchorX="center"
        >
          Samsung 870 EVO
        </Text>
      </group>
    </group>
  );
}

function InstalledCables({ animY }: { animY: number }) {
  return (
    <group position={[0, animY, 0]}>
      <mesh position={[4.25, 0.55, -0.6]}>
        <boxGeometry args={[0.44, 0.14, 2.2]} />
        <meshPhongMaterial color="#dddd88" />
      </mesh>
      <mesh position={[-3.5, 0.55, -3.3]}>
        <boxGeometry args={[0.6, 0.14, 0.6]} />
        <meshPhongMaterial color="#eeeecc" />
      </mesh>
      <mesh position={[0.9, 0.42, 1.0]}>
        <boxGeometry args={[0.5, 0.14, 0.22]} />
        <meshPhongMaterial color="#dddd88" />
      </mesh>
      <mesh position={[5.8, 0.2, 0.5]}>
        <boxGeometry args={[0.22, 0.25, 0.75]} />
        <meshPhongMaterial color="#999977" />
      </mesh>
    </group>
  );
}

function InstalledPSU({ animY }: { animY: number }) {
  return (
    <group position={[-4.5, animY + 0.7, 2.8]}>
      <mesh>
        <boxGeometry args={[3.2, 1.4, 5.0]} />
        <meshPhongMaterial color="#222222" shininess={10} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.08, 24]} />
        <meshPhongMaterial color="#111111" transparent opacity={0.85} />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh
          key={i}
          position={[0, 0.72, 0]}
          rotation={[0, (i / 7) * Math.PI * 2, 0]}
        >
          <boxGeometry args={[0.5, 0.06, 0.1]} />
          <meshPhongMaterial color="#1a1a1a" />
        </mesh>
      ))}
      <Text
        position={[0, 0, 2.52]}
        fontSize={0.18}
        color="#4488ff"
        anchorX="center"
      >
        750W Gold
      </Text>
    </group>
  );
}

// ─── Drop animation hook ──────────────────────────────────────────────────────
function useDropAnim(trigger: boolean, targetY = 0) {
  const [y, setY] = useState(8);
  const yRef = useRef(8);
  const doneRef = useRef(false);

  useEffect(() => {
    if (trigger && !doneRef.current) {
      yRef.current = 8;
      setY(8);
      doneRef.current = false;
    }
  }, [trigger]);

  useFrame((_, delta) => {
    if (!trigger || doneRef.current) return;
    const diff = targetY - yRef.current;
    if (Math.abs(diff) < 0.01) {
      yRef.current = targetY;
      doneRef.current = true;
      setY(targetY);
      return;
    }
    yRef.current += diff * Math.min(1, delta * 7);
    setY(yRef.current);
  });

  return y;
}

// ─── Animated component ───────────────────────────────────────────────────────
function AnimatedComponent({
  stepKey,
  installed,
}: {
  stepKey: StepKey;
  installed: boolean;
}) {
  const y = useDropAnim(installed, 0);
  if (!installed && y >= 7.9) return null;
  switch (stepKey) {
    case "cpu":
      return <InstalledCPU animY={y + 0.14} />;
    case "cooler":
      return <InstalledCooler animY={y} />;
    case "ram":
      return <InstalledRAM animY={y} />;
    case "nvme":
      return <InstalledNVMe animY={y} />;
    case "gpu":
      return <InstalledGPU animY={y} />;
    case "drives":
      return <InstalledDrives animY={y} />;
    case "cables":
      return <InstalledCables animY={y} />;
    case "psu":
      return <InstalledPSU animY={y} />;
    default:
      return null;
  }
}

// ─── Power on glow ────────────────────────────────────────────────────────────
function PowerGlow({ on }: { on: boolean }) {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.intensity = on ? 2 + Math.sin(clock.elapsedTime * 3) * 0.5 : 0;
  });
  return (
    <pointLight
      ref={ref}
      position={[0, 3, 0]}
      color="#00ff88"
      intensity={0}
      distance={20}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BuildCanvas() {
  const [currentStep, setCurrentStep] = useState(0);
  const [installed, setInstalled] = useState<Record<StepKey, boolean>>({
    cpu: false,
    cooler: false,
    ram: false,
    nvme: false,
    gpu: false,
    drives: false,
    cables: false,
    psu: false,
  });
  const [poweredOn, setPoweredOn] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const allDone = Object.values(installed).every(Boolean);
  const progress = Object.values(installed).filter(Boolean).length;
  const step = STEPS[currentStep];

  const handleInstall = () => {
    if (installing) return;
    setInstalling(true);
    setTimeout(() => {
      setInstalled((prev) => ({ ...prev, [step.key]: true }));
      setInstalling(false);
      if (currentStep < STEPS.length - 1) setCurrentStep((prev) => prev + 1);
    }, 200);
  };

  const handleReset = () => {
    setInstalled({
      cpu: false,
      cooler: false,
      ram: false,
      nvme: false,
      gpu: false,
      drives: false,
      cables: false,
      psu: false,
    });
    setCurrentStep(0);
    setPoweredOn(false);
    setResetKey((prev) => prev + 1);
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#0d1420",
        fontFamily: "monospace",
        overflow: "hidden",
      }}
    >
      {/* Left sidebar */}
      <div
        style={{
          width: "220px",
          flexShrink: 0,
          background: "#0a1018",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div
            style={{
              fontSize: "9px",
              letterSpacing: ".12em",
              color: "rgba(91,155,213,.6)",
              marginBottom: "8px",
            }}
          >
            PC BUILD GUIDE
          </div>
          <div
            style={{
              height: "3px",
              background: "rgba(255,255,255,.08)",
              borderRadius: "2px",
              overflow: "hidden",
              marginBottom: "6px",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "linear-gradient(90deg,#0066cc,#00aaff)",
                borderRadius: "2px",
                transition: "width .4s",
                width: `${(progress / STEPS.length) * 100}%`,
              }}
            />
          </div>
          <div style={{ fontSize: "9px", color: "rgba(180,210,240,.35)" }}>
            Step {progress} of {STEPS.length}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
          {STEPS.map((s, i) => (
            <div
              key={s.key}
              onClick={() => !installed[s.key] && setCurrentStep(i)}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                padding: "8px 12px",
                cursor: installed[s.key] ? "default" : "pointer",
                borderLeft: `2px solid ${i === currentStep ? "#5b9bd5" : "transparent"}`,
                background: i === currentStep ? "rgba(91,155,213,.1)" : "none",
                opacity: installed[s.key] ? 0.45 : 1,
              }}
            >
              <span
                style={{
                  fontSize: "10px",
                  color: installed[s.key]
                    ? "#20c855"
                    : i === currentStep
                      ? "#5b9bd5"
                      : "rgba(91,155,213,.4)",
                  minWidth: "16px",
                  paddingTop: "1px",
                }}
              >
                {installed[s.key] ? "✓" : i + 1}
              </span>
              <div>
                <div
                  style={{
                    fontSize: "10px",
                    color:
                      i === currentStep ? "#ddeeff" : "rgba(180,210,240,.65)",
                    lineHeight: 1.5,
                  }}
                >
                  {s.name}
                </div>
                <div style={{ fontSize: "9px", color: "rgba(91,155,213,.5)" }}>
                  {s.model.split(" ").slice(0, 2).join(" ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center — 3D canvas */}
      <div style={{ flex: 1, position: "relative" }}>
        <Canvas
          frameloop="always"
          camera={{ position: [0, 10, 14], fov: 42 }}
          style={{ width: "100%", height: "100%" }}
          onCreated={({ gl, scene }) => {
            scene.background = new THREE.Color("#0d1810");
            gl.setClearColor(new THREE.Color("#0d1810"), 1);
          }}
        >
          <SceneBackground />
          <ambientLight intensity={poweredOn ? 3.5 : 2.2} />
          <directionalLight position={[6, 14, 8]} intensity={2.5} />
          <directionalLight
            position={[-8, 6, -5]}
            intensity={1.0}
            color="#ddeeff"
          />
          <directionalLight position={[0, -5, 4]} intensity={0.7} />
          <PowerGlow on={poweredOn} />
          <OrbitControls enablePan={true} minDistance={4} maxDistance={28} />
          <Motherboard />
          {(Object.keys(installed) as StepKey[]).map((key) => (
            <AnimatedComponent
              key={`${resetKey}-${key}`}
              stepKey={key}
              installed={installed[key]}
            />
          ))}
          {poweredOn && <PowerFlowLines />}
        </Canvas>
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "9px",
            color: "rgba(255,255,255,.2)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          Drag to rotate · Scroll to zoom
        </div>
      </div>

      {/* Right panel */}
      <div
        style={{
          width: "280px",
          flexShrink: 0,
          background: "#0a1018",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          padding: "20px 16px",
          overflowY: "auto",
        }}
      >
        {allDone ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              paddingTop: "32px",
            }}
          >
            <div
              style={{
                fontSize: "9px",
                letterSpacing: ".12em",
                color: "#20c855",
                marginBottom: "8px",
              }}
            >
              BUILD COMPLETE ✓
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#ddeeff",
                marginBottom: "8px",
              }}
            >
              Your PC is ready
            </div>
            <p
              style={{
                fontSize: "10px",
                color: "rgba(180,210,240,.5)",
                lineHeight: 1.75,
                marginBottom: "24px",
              }}
            >
              All 8 components installed. CPU, cooler, RAM, NVMe, GPU, drives,
              cables, and PSU are all connected and ready to boot.
            </p>
            {!poweredOn ? (
              <button
                onClick={() => setPoweredOn(true)}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "rgba(20,180,70,.12)",
                  border: "2px solid #20c855",
                  borderRadius: "8px",
                  color: "#20c855",
                  fontSize: "14px",
                  fontFamily: "monospace",
                  cursor: "pointer",
                  marginBottom: "10px",
                  letterSpacing: ".06em",
                }}
              >
                ⚡ POWER ON
              </button>
            ) : (
              <div
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "rgba(20,180,70,.2)",
                  border: "2px solid #20c855",
                  borderRadius: "8px",
                  color: "#20ff80",
                  fontSize: "13px",
                  fontFamily: "monospace",
                  textAlign: "center",
                  marginBottom: "10px",
                }}
              >
                🖥️ PC IS RUNNING
              </div>
            )}
            <button
              onClick={handleReset}
              style={{
                width: "100%",
                padding: "10px",
                background: "none",
                border: "1px solid rgba(255,255,255,.15)",
                borderRadius: "6px",
                color: "rgba(180,210,240,.5)",
                fontSize: "11px",
                fontFamily: "monospace",
                cursor: "pointer",
              }}
            >
              Reset & build again
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                marginBottom: "4px",
                display: "inline-block",
                padding: "2px 8px",
                borderRadius: "3px",
                fontSize: "8px",
                letterSpacing: ".1em",
                background: "rgba(91,155,213,.12)",
                color: "#5b9bd5",
              }}
            >
              STEP {currentStep + 1} OF {STEPS.length}
            </div>
            <h2
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#ddeeff",
                margin: "6px 0 2px",
              }}
            >
              {step.name}
            </h2>
            <div
              style={{
                fontSize: "10px",
                color: "#5b9bd5",
                marginBottom: "12px",
              }}
            >
              {step.model}
            </div>
            <p
              style={{
                fontSize: "11px",
                color: "rgba(180,210,240,.7)",
                lineHeight: 1.8,
                marginBottom: "14px",
              }}
            >
              {step.desc}
            </p>
            <div
              style={{
                background: "rgba(255,204,0,.07)",
                border: "1px solid rgba(255,204,0,.2)",
                borderLeft: "3px solid #ffcc44",
                borderRadius: "0 6px 6px 0",
                padding: "10px 12px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  color: "#ffdd66",
                  marginBottom: "4px",
                  letterSpacing: ".08em",
                }}
              >
                💡 PRO TIP
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "rgba(255,220,120,.8)",
                  lineHeight: 1.7,
                }}
              >
                {step.tip}
              </div>
            </div>
            <div style={{ marginBottom: "20px" }}>
              <div
                style={{
                  fontSize: "9px",
                  letterSpacing: ".1em",
                  color: "rgba(91,155,213,.5)",
                  marginBottom: "8px",
                }}
              >
                SPECIFICATIONS
              </div>
              {step.specs.map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    gap: "8px",
                    borderBottom: "1px solid rgba(255,255,255,.05)",
                    padding: "5px 0",
                  }}
                >
                  <span
                    style={{
                      width: "80px",
                      flexShrink: 0,
                      fontSize: "10px",
                      color: "rgba(180,210,240,.35)",
                    }}
                  >
                    {k}
                  </span>
                  <span style={{ fontSize: "10px", color: "#ddeeff" }}>
                    {v}
                  </span>
                </div>
              ))}
            </div>
            {installed[step.key] ? (
              <div
                style={{
                  padding: "12px",
                  background: "rgba(30,180,60,.1)",
                  border: "1px solid rgba(30,180,60,.3)",
                  borderRadius: "7px",
                  textAlign: "center",
                  fontSize: "12px",
                  color: "#20c855",
                }}
              >
                ✓ Installed — select next step
              </div>
            ) : (
              <button
                onClick={handleInstall}
                disabled={installing}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "rgba(91,155,213,.15)",
                  border: "1.5px solid #5b9bd5",
                  borderRadius: "7px",
                  color: "#5b9bd5",
                  fontSize: "13px",
                  fontFamily: "monospace",
                  cursor: installing ? "not-allowed" : "pointer",
                  letterSpacing: ".04em",
                  opacity: installing ? 0.5 : 1,
                }}
              >
                {installing
                  ? "Installing..."
                  : `▼ Install ${step.name.replace("Install ", "")}`}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
