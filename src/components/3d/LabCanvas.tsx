"use client";

import { useState, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import * as THREE from "three";
import { COMPONENT_INFO } from "@/lib/labData";

type ComponentKey = keyof typeof COMPONENT_INFO;
type Mode = "explore" | "data" | "power";

function SceneBackground() {
  const { scene, gl } = useThree();
  scene.background = new THREE.Color("#0d1810");
  gl.setClearColor(new THREE.Color("#0d1810"), 1);
  return null;
}

function Motherboard() {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[9.5, 0.12, 7.6]} />
        <meshPhongMaterial color="#1a6020" shininess={16} />
      </mesh>
      <lineSegments position={[0, 0.07, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(9.5, 0.12, 7.6)]} />
        <lineBasicMaterial color="#22aa44" transparent opacity={0.3} />
      </lineSegments>
      {[
        [[-1.7, 0.07, -1], [1.55, 0.07, -1]],
        [[-1.7, 0.07, -1], [-1.7, 0.07, 1.25]],
        [[0.8, 0.07, 0.7], [4.32, 0.07, 1]],
        [[4.25, 0.07, -0.6], [-1.7, 0.07, -0.6]],
        [[0.1, 0.07, 0.2], [0.8, 0.07, 0.7]],
      ].map((pts, i) => (
        <Line key={i} points={pts as [number, number, number][]} color="#33aa33" lineWidth={1} transparent opacity={0.4} />
      ))}
      {[[-4, -3.4], [4, -3.4], [-4, 3.4], [4, 3.4], [0, -3.4], [0, 3.4]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.07, z]}>
          <cylinderGeometry args={[0.19, 0.19, 0.13, 14]} />
          <meshPhongMaterial color="#060e08" />
        </mesh>
      ))}
    </group>
  );
}

function CPUSocket({ onClick, selected }: any) {
  return (
    <group position={[-1.7, 0.06, -1]}>
      <mesh onClick={onClick}>
        <boxGeometry args={[2.15, 0.06, 2.15]} />
        <meshPhongMaterial color="#2a2010" />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1.78, 0.07, 1.78]} />
        <meshPhongMaterial color={selected ? "#e8a030" : "#9a7040"} emissive={selected ? "#442200" : "#000000"} shininess={20} />
      </mesh>
      {Array.from({ length: 5 }).map((_, i) =>
        Array.from({ length: 5 }).map((_, j) => (
          <mesh key={`${i}-${j}`} position={[-0.6 + i * 0.3, 0.09, -0.6 + j * 0.3]}>
            <cylinderGeometry args={[0.02, 0.02, 0.06, 6]} />
            <meshPhongMaterial color="#888866" />
          </mesh>
        ))
      )}
    </group>
  );
}

function CPU({ onClick, selected }: any) {
  return (
    <group position={[-1.7, 0.14, -1]}>
      <mesh onClick={onClick}>
        <boxGeometry args={[1.42, 0.1, 1.42]} />
        <meshPhongMaterial color={selected ? "#f0c060" : "#c8a040"} shininess={60} />
      </mesh>
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[1.38, 0.04, 1.38]} />
        <meshPhongMaterial color="#222210" />
      </mesh>
    </group>
  );
}

function CPUCooler({ onClick, selected }: any) {
  const fanRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (fanRef.current) fanRef.current.rotation.y += delta * 8;
  });
  return (
    <group position={[-1.7, 0.2, -0.7]} onClick={onClick}>
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
          <meshPhongMaterial color={selected ? "#dddddd" : "#cccccc"} shininess={30} />
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

function VRM({ onClick, selected }: any) {
  return (
    <group onClick={onClick}>
      {[[-3.1, -0.85], [-3.5, -0.85], [-3.9, -0.85], [-3.1, -1.38], [-3.5, -1.38], [-3.9, -1.38]].map(([x, z], i) => (
        <group key={i} position={[x, 0.24, z]}>
          <mesh>
            <boxGeometry args={[0.34, 0.28, 0.34]} />
            <meshPhongMaterial color={selected ? "#d0d0b0" : "#b0b090"} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[0.3, 0.08, 0.3]} />
            <meshPhongMaterial color="#888880" shininess={40} />
          </mesh>
        </group>
      ))}
      {[[-1.2, -1.95], [-1.6, -1.95]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.24, z]}>
          <cylinderGeometry args={[0.11, 0.11, 0.3, 12]} />
          <meshPhongMaterial color="#6688bb" />
        </mesh>
      ))}
    </group>
  );
}

function RAM({ onClick, selected }: any) {
  return (
    <group>
      {[[1.55, "#181830"], [1.85, "#181830"], [2.2, "#282840"], [2.5, "#282840"]].map(([x, col], i) => (
        <group key={i} position={[x as number, 0, -0.7]}>
          <mesh>
            <boxGeometry args={[0.13, 0.26, 2.5]} />
            <meshPhongMaterial color={col as string} />
          </mesh>
          {i < 2 && (
            <group position={[0, 0.55, 0]} onClick={onClick}>
              <mesh>
                <boxGeometry args={[0.11, 0.84, 2.5]} />
                <meshPhongMaterial color={selected ? "#3344dd" : "#181830"} emissive={selected ? "#001133" : "#000000"} />
              </mesh>
              <mesh position={[0, 0.44, 0]}>
                <boxGeometry args={[0.12, 0.06, 2.5]} />
                <meshPhongMaterial color={selected ? "#4466ff" : "#2244bb"} emissive={selected ? "#112266" : "#001133"} />
              </mesh>
              {Array.from({ length: 8 }).map((_, j) => (
                <mesh key={j} position={[0.07, 0, -1.0 + j * 0.28]}>
                  <boxGeometry args={[0.02, 0.18, 0.22]} />
                  <meshPhongMaterial color="#111111" />
                </mesh>
              ))}
            </group>
          )}
        </group>
      ))}
    </group>
  );
}

function GPU({ onClick, selected }: any) {
  const fanRef1 = useRef<THREE.Group>(null);
  const fanRef2 = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (fanRef1.current) fanRef1.current.rotation.z += delta * 5;
    if (fanRef2.current) fanRef2.current.rotation.z -= delta * 5;
  });
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0.1, 0.1, 1.9]}>
        <boxGeometry args={[7.5, 0.08, 1.4]} />
        <meshPhongMaterial color="#0a1a0a" />
      </mesh>
      <mesh position={[0.4, 0.17, 1.9]} onClick={onClick}>
        <boxGeometry args={[5.8, 0.11, 1.4]} />
        <meshPhongMaterial color={selected ? "#1a0a3a" : "#0a0a1a"} />
      </mesh>
      <mesh position={[0.4, 0.85, 1.9]} onClick={onClick}>
        <boxGeometry args={[5.8, 1.4, 2.1]} />
        <meshPhongMaterial color={selected ? "#222244" : "#161616"} emissive={selected ? "#050520" : "#000000"} />
      </mesh>
      <mesh position={[3.35, 0.85, 1.9]}>
        <boxGeometry args={[0.13, 1.4, 2.1]} />
        <meshPhongMaterial color="#909090" shininess={60} />
      </mesh>
      {[[-0.8, fanRef1], [1.4, fanRef2]].map(([xOff, ref], fi) => (
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
          <mesh position={[xOff as number, 1.7, 1.9]}>
            <cylinderGeometry args={[0.12, 0.12, 0.25, 12]} />
            <meshPhongMaterial color="#333333" />
          </mesh>
        </group>
      ))}
      <mesh position={[0.9, 0.28, 1.0]}>
        <boxGeometry args={[0.55, 0.22, 0.22]} />
        <meshPhongMaterial color="#444444" />
      </mesh>
      <mesh position={[3.35, 0.82, 1.9]}>
        <boxGeometry args={[0.15, 1.35, 1.95]} />
        <meshPhongMaterial color="#777777" />
      </mesh>
      {[[2.9, 0.95], [2.7, 0.95], [2.5, 0.95]].map(([z, y], i) => (
        <mesh key={i} position={[3.44, y, z]}>
          <boxGeometry args={[0.06, 0.22, 0.28]} />
          <meshPhongMaterial color="#111111" />
        </mesh>
      ))}
    </group>
  );
}

function NVMe({ onClick, selected }: any) {
  return (
    <group position={[0.1, 0.14, 0.2]} onClick={onClick}>
      <mesh>
        <boxGeometry args={[2.0, 0.1, 0.23]} />
        <meshPhongMaterial color={selected ? "#0a2a0a" : "#0a1a0a"} emissive={selected ? "#002200" : "#000000"} />
      </mesh>
      {[[-0.38, 0], [0.42, 0]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.08, z]}>
          <boxGeometry args={[0.62, 0.07, 0.19]} />
          <meshPhongMaterial color="#151515" />
        </mesh>
      ))}
      <mesh position={[-0.62, 0.08, 0]}>
        <boxGeometry args={[0.36, 0.07, 0.21]} />
        <meshPhongMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[1.05, 0.1, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.12, 12]} />
        <meshPhongMaterial color="#a0a080" />
      </mesh>
    </group>
  );
}

function HDD({ onClick, selected }: any) {
  const platRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (platRef.current) platRef.current.rotation.y += delta * 12;
  });
  return (
    <group position={[6.8, 0.45, 2.5]} onClick={onClick}>
      <mesh>
        <boxGeometry args={[3.2, 0.9, 4.6]} />
        <meshPhongMaterial color={selected ? "#444444" : "#686868"} emissive={selected ? "#111111" : "#000000"} shininess={20} />
      </mesh>
      <mesh ref={platRef} position={[0, 0.48, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.06, 32]} />
        <meshPhongMaterial color="#7a7a7a" shininess={80} />
      </mesh>
      <mesh position={[0, 0.48, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.1, 12]} />
        <meshPhongMaterial color="#333333" />
      </mesh>
      <mesh position={[-1.4, 0, 2.35]}>
        <boxGeometry args={[0.22, 0.5, 0.18]} />
        <meshPhongMaterial color="#999977" />
      </mesh>
    </group>
  );
}

function SATASSD({ onClick, selected }: any) {
  return (
    <group position={[6.8, 0.15, 0.0]} onClick={onClick}>
      <mesh>
        <boxGeometry args={[2.2, 0.32, 3.1]} />
        <meshPhongMaterial color={selected ? "#444444" : "#333333"} emissive={selected ? "#111111" : "#000000"} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[2.1, 0.06, 3.0]} />
        <meshPhongMaterial color="#555555" shininess={40} />
      </mesh>
      <mesh position={[-0.9, 0, 0]}>
        <boxGeometry args={[0.3, 0.22, 0.55]} />
        <meshPhongMaterial color="#999977" />
      </mesh>
    </group>
  );
}

function PSU({ onClick, selected }: any) {
  return (
    <group position={[-4.5, 0.7, 2.8]} onClick={onClick}>
      <mesh>
        <boxGeometry args={[3.2, 1.4, 5.0]} />
        <meshPhongMaterial color={selected ? "#333333" : "#222222"} shininess={10} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.08, 24]} />
        <meshPhongMaterial color="#111111" transparent opacity={0.85} />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[0, 0.72, 0]} rotation={[0, (i / 7) * Math.PI * 2, 0]}>
          <boxGeometry args={[0.5, 0.06, 0.1]} />
          <meshPhongMaterial color="#1a1a1a" />
        </mesh>
      ))}
      <mesh position={[1.65, -0.1, -0.5]}>
        <boxGeometry args={[0.12, 0.6, 0.35]} />
        <meshPhongMaterial color="#ffdd88" />
      </mesh>
      <mesh position={[1.65, -0.1, 0.2]}>
        <boxGeometry args={[0.12, 0.6, 0.35]} />
        <meshPhongMaterial color="#cccccc" />
      </mesh>
    </group>
  );
}

function RearIO({ onClick, selected }: any) {
  return (
    <group position={[-4.5, 0.32, -2.2]} onClick={onClick}>
      <mesh>
        <boxGeometry args={[0.24, 0.65, 1.8]} />
        <meshPhongMaterial color={selected ? "#5588dd" : "#4477cc"} />
      </mesh>
      {[[-0.5, 0], [0, 0], [0.5, 0]].map(([z, y], i) => (
        <mesh key={i} position={[-0.13, y as number, z as number]}>
          <boxGeometry args={[0.08, 0.22, 0.28]} />
          <meshPhongMaterial color="#111133" />
        </mesh>
      ))}
      <mesh position={[-0.13, 0, -0.75]}>
        <boxGeometry args={[0.06, 0.14, 0.22]} />
        <meshPhongMaterial color="#111122" />
      </mesh>
      <mesh position={[-0.13, 0, 0.75]}>
        <boxGeometry args={[0.06, 0.2, 0.3]} />
        <meshPhongMaterial color="#111111" />
      </mesh>
      <mesh position={[-0.13, -0.15, -0.25]}>
        <boxGeometry args={[0.08, 0.28, 0.38]} />
        <meshPhongMaterial color="#334422" />
      </mesh>
      {[0.25, 0.45].map((z, i) => (
        <mesh key={i} position={[-0.14, -0.15, -z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.1, 12]} />
          <meshPhongMaterial color={i === 0 ? "#22aa22" : "#ff4444"} />
        </mesh>
      ))}
    </group>
  );
}

function PowerCables() {
  return (
    <group>
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

function PCH({ onClick, selected }: any) {
  return (
    <group position={[0.8, 0.18, 0.7]} onClick={onClick}>
      <mesh>
        <boxGeometry args={[1.0, 0.14, 1.0]} />
        <meshPhongMaterial color={selected ? "#333366" : "#1e1e1e"} emissive={selected ? "#001133" : "#000000"} />
      </mesh>
    </group>
  );
}

function BoardComponents() {
  return (
    <group>
      <mesh position={[4.25, 0.32, -0.6]}>
        <boxGeometry args={[0.56, 0.48, 2.2]} />
        <meshPhongMaterial color="#dddd99" />
      </mesh>
      <mesh position={[-3.5, 0.32, -3.3]}>
        <boxGeometry args={[0.74, 0.38, 0.74]} />
        <meshPhongMaterial color="#eeeecc" />
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
        <meshPhongMaterial color="#d0d0d0" shininess={40} />
      </mesh>
      <mesh position={[0.1, 0.08, 0.2]}>
        <boxGeometry args={[2.05, 0.05, 0.26]} />
        <meshPhongMaterial color="#304035" />
      </mesh>
      <mesh position={[-2.8, 0.12, 3.1]}>
        <boxGeometry args={[0.68, 0.08, 0.68]} />
        <meshPhongMaterial color="#111111" />
      </mesh>
      {[[-2.2, 3.3], [-2.6, 3.3]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.24, z]}>
          <cylinderGeometry args={[0.13, 0.13, 0.32, 12]} />
          <meshPhongMaterial color="#4466cc" />
        </mesh>
      ))}
      {[[-0.4, -2.6], [0.4, -2.6], [3.6, -2.0]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.18, z]}>
          <boxGeometry args={[0.3, 0.27, 0.26]} />
          <meshPhongMaterial color="#f0f0e8" />
        </mesh>
      ))}
      <mesh position={[-0.1, 0.24, 3.56]}>
        <boxGeometry args={[0.74, 0.38, 0.3]} />
        <meshPhongMaterial color="#1155cc" />
      </mesh>
    </group>
  );
}

function Monitor({ onClick, selected }: any) {
  return (
    <group position={[-2.0, 0, -6.5]} onClick={onClick}>
      <mesh position={[0, 2.8, 0]}>
        <boxGeometry args={[4.5, 2.8, 0.12]} />
        <meshPhongMaterial color={selected ? "#222222" : "#111111"} />
      </mesh>
      <mesh position={[0, 2.8, 0.07]}>
        <boxGeometry args={[4.2, 2.5, 0.02]} />
        <meshPhongMaterial color="#0a1a2a" emissive="#001833" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[0.2, 1.0, 0.2]} />
        <meshPhongMaterial color="#333333" />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[2.0, 0.1, 1.0]} />
        <meshPhongMaterial color="#333333" />
      </mesh>
      <mesh position={[0.8, 1.8, -0.07]}>
        <boxGeometry args={[0.22, 0.14, 0.06]} />
        <meshPhongMaterial color="#111111" />
      </mesh>
      <mesh position={[0.4, 1.8, -0.07]}>
        <boxGeometry args={[0.2, 0.12, 0.06]} />
        <meshPhongMaterial color="#111111" />
      </mesh>
      <mesh position={[1.8, 1.6, 0.07]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#00ff44" />
      </mesh>
    </group>
  );
}

interface Connection {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
  speed: number;
  label: string;
  bandwidth: string;
}

interface PowerRail {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
  voltage: string;
  watts: string;
}

function DataParticle({ from, to, color, speed, progress }: { from: THREE.Vector3; to: THREE.Vector3; color: string; speed: number; progress: number; }) {
  const ref = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ref.current) return;
    const t = (progress + Date.now() * speed * 0.0001) % 1;
    ref.current.position.lerpVectors(from, to, t);
    if (trailRef.current) {
      const t2 = (progress + Date.now() * speed * 0.0001 - 0.05) % 1;
      trailRef.current.position.lerpVectors(from, to, Math.max(0, t2));
    }
  });
  return (
    <group>
      <mesh ref={ref}>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={trailRef}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function DataFlowLines({ connections }: { connections: Connection[] }) {
  return (
    <group>
      {connections.map((c, i) => (
        <group key={i}>
          <Line points={[c.from, c.to]} color={c.color} lineWidth={5} transparent opacity={0.12} />
          <Line points={[c.from, c.to]} color={c.color} lineWidth={2} transparent opacity={0.8} />
          {Array.from({ length: 4 }).map((_, j) => (
            <DataParticle key={j} from={c.from} to={c.to} color={c.color} speed={c.speed} progress={j / 4} />
          ))}
        </group>
      ))}
    </group>
  );
}

function PowerFlowLines({ rails }: { rails: PowerRail[] }) {
  return (
    <group>
      {rails.map((r, i) => (
        <group key={i}>
          <Line points={[r.from, r.to]} color={r.color} lineWidth={6} transparent opacity={0.12} />
          <Line points={[r.from, r.to]} color={r.color} lineWidth={2.5} transparent opacity={0.85} />
          {Array.from({ length: 3 }).map((_, j) => (
            <DataParticle key={j} from={r.from} to={r.to} color={r.color} speed={0.8} progress={j / 3} />
          ))}
        </group>
      ))}
    </group>
  );
}

export default function LabCanvas() {
  const [selected, setSelected] = useState<ComponentKey | null>(null);
  const [mode, setMode] = useState<Mode>("explore");
  const info = selected ? COMPONENT_INFO[selected] : null;

  const DATA_CONNECTIONS: Connection[] = useMemo(() => [
    { from: new THREE.Vector3(-1.7, 0.5, -1), to: new THREE.Vector3(2.1, 0.5, -0.7), color: "#22ccaa", speed: 1.8, label: "CPU↔RAM", bandwidth: "96 GB/s" },
    { from: new THREE.Vector3(-1.7, 0.5, -1), to: new THREE.Vector3(0.4, 0.5, 1.9), color: "#aa44ff", speed: 2.5, label: "CPU↔GPU", bandwidth: "128 GB/s" },
    { from: new THREE.Vector3(-1.7, 0.5, -1), to: new THREE.Vector3(0.1, 0.5, 0.2), color: "#2288ff", speed: 2.0, label: "CPU↔NVMe", bandwidth: "7 GB/s" },
    { from: new THREE.Vector3(-1.7, 0.5, -1), to: new THREE.Vector3(0.8, 0.5, 0.7), color: "#22ccaa", speed: 1.2, label: "CPU↔PCH", bandwidth: "16 GB/s" },
    { from: new THREE.Vector3(0.8, 0.5, 0.7), to: new THREE.Vector3(6.8, 0.5, 2.5), color: "#ff8822", speed: 0.8, label: "PCH↔HDD", bandwidth: "200 MB/s" },
    { from: new THREE.Vector3(0.8, 0.5, 0.7), to: new THREE.Vector3(6.8, 0.5, 0.0), color: "#ffaa22", speed: 1.0, label: "PCH↔SSD", bandwidth: "550 MB/s" },
    { from: new THREE.Vector3(0.4, 1.5, 1.9), to: new THREE.Vector3(-2.0, 2.8, -6.5), color: "#ff44aa", speed: 2.2, label: "GPU→Monitor", bandwidth: "48 Gbps" },
  ], []);

  const POWER_RAILS: PowerRail[] = useMemo(() => [
    { from: new THREE.Vector3(-4.5, 0.7, 2.8), to: new THREE.Vector3(4.25, 0.5, -0.6), color: "#ffdd00", voltage: "12V+5V+3.3V", watts: "80W" },
    { from: new THREE.Vector3(-4.5, 0.7, 2.8), to: new THREE.Vector3(-3.5, 0.5, -3.3), color: "#ff8800", voltage: "12V", watts: "300W" },
    { from: new THREE.Vector3(-3.5, 0.5, -1.1), to: new THREE.Vector3(-1.7, 0.5, -1), color: "#ff3300", voltage: "1.1V", watts: "170W" },
    { from: new THREE.Vector3(-4.5, 0.7, 2.8), to: new THREE.Vector3(0.9, 0.5, 1.0), color: "#cc00ff", voltage: "12V", watts: "450W" },
    { from: new THREE.Vector3(4.25, 0.5, -0.6), to: new THREE.Vector3(2.1, 0.5, -0.7), color: "#00eedd", voltage: "1.1V", watts: "12W" },
    { from: new THREE.Vector3(4.25, 0.5, -0.6), to: new THREE.Vector3(0.1, 0.5, 0.2), color: "#4499ff", voltage: "3.3V", watts: "8W" },
    { from: new THREE.Vector3(-4.5, 0.7, 2.8), to: new THREE.Vector3(6.8, 0.5, 2.5), color: "#ff8800", voltage: "12V+5V", watts: "10W" },
    { from: new THREE.Vector3(-4.5, 0.7, 2.8), to: new THREE.Vector3(6.8, 0.5, 0.0), color: "#aacc00", voltage: "5V+3.3V", watts: "5W" },
  ], []);

  const ALL_COMPONENTS: ComponentKey[] = ["cpu", "cooler", "gpu", "nvme", "hdd", "satassd", "psu", "socket", "vrm", "dimm", "pcie16", "pch", "atx24", "sata", "bios", "cmos", "m2", "rearIO", "monitor"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        {(["explore", "data", "power"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: "6px 16px", fontFamily: "monospace", fontSize: "11px",
              borderRadius: "6px", cursor: "pointer",
              border: mode === m ? "1px solid #5b9bd5" : "1px solid rgba(255,255,255,0.15)",
              background: mode === m ? "rgba(91,155,213,0.15)" : "none",
              color: mode === m ? "#5b9bd5" : "rgba(180,210,240,0.5)",
            }}
          >
            {m === "explore" ? "Explore" : m === "data" ? "Data Flow" : "Power"}
          </button>
        ))}
        <span style={{ fontFamily: "monospace", fontSize: "10px", color: "rgba(255,255,255,0.2)", marginLeft: "8px", alignSelf: "center" }}>
          Drag to rotate · Scroll to zoom · Click to inspect
        </span>
      </div>

      <div style={{ display: "flex", gap: "16px", width: "100%" }}>
        <div style={{ height: "620px", flex: 1, minWidth: 0, overflow: "hidden", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "#0d1810" }}>
          <Canvas frameloop="always" camera={{ position: [0, 12, 14], fov: 42 }} style={{ width: "100%", height: "100%" }}>
            <SceneBackground />
            <ambientLight intensity={2.2} />
            <directionalLight position={[6, 14, 8]} intensity={2.5} />
            <directionalLight position={[-8, 6, -5]} intensity={1.0} color="#ddeeff" />
            <directionalLight position={[0, -5, 4]} intensity={0.7} />
            <OrbitControls enablePan={true} minDistance={4} maxDistance={30} />
            <Motherboard />
            <CPUSocket onClick={() => setSelected("socket")} selected={selected === "socket"} />
            <CPU onClick={() => setSelected("cpu")} selected={selected === "cpu"} />
            <CPUCooler onClick={() => setSelected("cooler")} selected={selected === "cooler"} />
            <VRM onClick={() => setSelected("vrm")} selected={selected === "vrm"} />
            <RAM onClick={() => setSelected("dimm")} selected={selected === "dimm"} />
            <GPU onClick={() => setSelected("gpu")} selected={selected === "gpu"} />
            <NVMe onClick={() => setSelected("nvme")} selected={selected === "nvme"} />
            <HDD onClick={() => setSelected("hdd")} selected={selected === "hdd"} />
            <SATASSD onClick={() => setSelected("satassd")} selected={selected === "satassd"} />
            <PSU onClick={() => setSelected("psu")} selected={selected === "psu"} />
            <RearIO onClick={() => setSelected("rearIO")} selected={selected === "rearIO"} />
            <PowerCables />
            <PCH onClick={() => setSelected("pch")} selected={selected === "pch"} />
            <BoardComponents />
            <Monitor onClick={() => setSelected("monitor")} selected={selected === "monitor"} />
            {mode === "data" && <DataFlowLines connections={DATA_CONNECTIONS} />}
            {mode === "power" && <PowerFlowLines rails={POWER_RAILS} />}
          </Canvas>
        </div>

        <div style={{ width: "260px", flexShrink: 0 }}>
          {info ? (
            <div style={{ borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", padding: "16px" }}>
              <div style={{ marginBottom: "4px", display: "inline-block", borderRadius: "4px", padding: "2px 8px", fontFamily: "monospace", fontSize: "11px", background: info.col + "22", color: info.col }}>
                {info.cat}
              </div>
              <h2 style={{ marginBottom: "8px", fontFamily: "monospace", fontSize: "14px", fontWeight: 700, color: "white" }}>{info.name}</h2>
              <p style={{ marginBottom: "16px", fontFamily: "monospace", fontSize: "11px", lineHeight: 1.7, color: "rgba(255,255,255,0.6)" }}>{info.desc}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                {info.specs.map(([k, v]) => (
                  <div key={k} style={{ display: "flex", gap: "8px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                    <span style={{ width: "80px", flexShrink: 0, fontFamily: "monospace", fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>{k}</span>
                    <span style={{ fontFamily: "monospace", fontSize: "11px", color: "white" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderRadius: "6px", background: "rgba(234,179,8,0.1)", padding: "12px" }}>
                <div style={{ marginBottom: "4px", fontFamily: "monospace", fontSize: "11px", color: "#facc15" }}>fun fact</div>
                <div style={{ fontFamily: "monospace", fontSize: "11px", color: "rgba(253,224,71,0.8)" }}>{info.fact}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ marginTop: "12px", width: "100%", padding: "6px", fontFamily: "monospace", fontSize: "11px", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.1)", background: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                Deselect
              </button>
            </div>
          ) : (
            <div style={{ borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", padding: "16px" }}>
              <p style={{ fontFamily: "monospace", fontSize: "11px", color: "rgba(255,255,255,0.3)", marginBottom: "12px" }}>
                {mode === "explore" ? "Click any component to inspect it." : mode === "data" ? "Data flow between components — bandwidth shown on each path." : "Power distribution — voltage and wattage per component."}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {ALL_COMPONENTS.map((id) => (
                  <button key={id} onClick={() => setSelected(id)} style={{ width: "100%", borderRadius: "4px", border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.05)", padding: "6px 12px", textAlign: "left", fontFamily: "monospace", fontSize: "11px", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                    {COMPONENT_INFO[id].name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}










// "use client";
//
// import { useState, useRef, useMemo } from "react";
// import { Canvas, useFrame, useThree } from "@react-three/fiber";
// import { OrbitControls, Text, Line, Billboard } from "@react-three/drei";
// import * as THREE from "three";
// import { COMPONENT_INFO } from "@/lib/labData";
//
// type ComponentKey = keyof typeof COMPONENT_INFO;
// type Mode = "explore" | "data" | "power";
//
// function SceneBackground() {
//   const { scene, gl } = useThree();
//   scene.background = new THREE.Color("#0d1810");
//   gl.setClearColor(new THREE.Color("#0d1810"), 1);
//   return null;
// }
//
// function Motherboard() {
//   return (
//     <group>
//       <mesh position={[0, 0, 0]}>
//         <boxGeometry args={[9.5, 0.12, 7.6]} />
//         <meshPhongMaterial color="#1a6020" shininess={16} />
//       </mesh>
//       <lineSegments position={[0, 0.07, 0]}>
//         <edgesGeometry args={[new THREE.BoxGeometry(9.5, 0.12, 7.6)]} />
//         <lineBasicMaterial color="#22aa44" transparent opacity={0.3} />
//       </lineSegments>
//       {[
//         [
//           [-1.7, 0.07, -1],
//           [1.55, 0.07, -1],
//         ],
//         [
//           [-1.7, 0.07, -1],
//           [-1.7, 0.07, 1.25],
//         ],
//         [
//           [0.8, 0.07, 0.7],
//           [4.32, 0.07, 1],
//         ],
//         [
//           [4.25, 0.07, -0.6],
//           [-1.7, 0.07, -0.6],
//         ],
//         [
//           [0.1, 0.07, 0.2],
//           [0.8, 0.07, 0.7],
//         ],
//       ].map((pts, i) => (
//         <Line
//           key={i}
//           points={pts as [number, number, number][]}
//           color="#33aa33"
//           lineWidth={1}
//           transparent
//           opacity={0.4}
//         />
//       ))}
//       {[
//         [-4, -3.4],
//         [4, -3.4],
//         [-4, 3.4],
//         [4, 3.4],
//         [0, -3.4],
//         [0, 3.4],
//       ].map(([x, z], i) => (
//         <mesh key={i} position={[x, 0.07, z]}>
//           <cylinderGeometry args={[0.19, 0.19, 0.13, 14]} />
//           <meshPhongMaterial color="#060e08" />
//         </mesh>
//       ))}
//     </group>
//   );
// }
//
// function CPUSocket({ onClick, selected }: any) {
//   return (
//     <group position={[-1.7, 0.06, -1]}>
//       <mesh onClick={onClick}>
//         <boxGeometry args={[2.15, 0.06, 2.15]} />
//         <meshPhongMaterial color="#2a2010" />
//       </mesh>
//       <mesh position={[0, 0.05, 0]}>
//         <boxGeometry args={[1.78, 0.07, 1.78]} />
//         <meshPhongMaterial
//           color={selected ? "#e8a030" : "#9a7040"}
//           emissive={selected ? "#442200" : "#000000"}
//           shininess={20}
//         />
//       </mesh>
//       {Array.from({ length: 5 }).map((_, i) =>
//         Array.from({ length: 5 }).map((_, j) => (
//           <mesh
//             key={`${i}-${j}`}
//             position={[-0.6 + i * 0.3, 0.09, -0.6 + j * 0.3]}
//           >
//             <cylinderGeometry args={[0.02, 0.02, 0.06, 6]} />
//             <meshPhongMaterial color="#888866" />
//           </mesh>
//         )),
//       )}
//     </group>
//   );
// }
//
// function CPU({ onClick, selected }: any) {
//   return (
//     <group position={[-1.7, 0.14, -1]}>
//       <mesh onClick={onClick}>
//         <boxGeometry args={[1.42, 0.1, 1.42]} />
//         <meshPhongMaterial
//           color={selected ? "#f0c060" : "#c8a040"}
//           shininess={60}
//         />
//       </mesh>
//       <mesh position={[0, -0.04, 0]}>
//         <boxGeometry args={[1.38, 0.04, 1.38]} />
//         <meshPhongMaterial color="#222210" />
//       </mesh>
//       <Text
//         position={[0, 0.08, 0]}
//         rotation={[-Math.PI / 2, 0, 0]}
//         fontSize={0.12}
//         color="#1a1000"
//         anchorX="center"
//         anchorY="middle"
//       >
//         AMD Ryzen 9
//       </Text>
//     </group>
//   );
// }
//
// function CPUCooler({ onClick, selected }: any) {
//   const fanRef = useRef<THREE.Group>(null);
//   useFrame((_, delta) => {
//     if (fanRef.current) fanRef.current.rotation.y += delta * 8;
//   });
//   return (
//     <group position={[-1.7, 0.2, -0.7]} onClick={onClick}>
//       <mesh position={[0, -0.05, -0.3]}>
//         <boxGeometry args={[1.42, 0.02, 1.42]} />
//         <meshPhongMaterial color="#cc7722" />
//       </mesh>
//       {[-1.3, -1.7, -2.1].map((x, i) => (
//         <mesh key={i} position={[x + 1.7, 0.4, -0.3]}>
//           <cylinderGeometry args={[0.055, 0.055, 1.0, 12]} />
//           <meshPhongMaterial color="#b87333" shininess={40} />
//         </mesh>
//       ))}
//       {Array.from({ length: 8 }).map((_, i) => (
//         <mesh key={i} position={[0, 0.8, -0.3 + (i - 3.5) * 0.16]}>
//           <boxGeometry args={[1.28, 1.4, 0.06]} />
//           <meshPhongMaterial
//             color={selected ? "#dddddd" : "#cccccc"}
//             shininess={30}
//           />
//         </mesh>
//       ))}
//       <group ref={fanRef} position={[0, 0.95, 0.35]}>
//         {Array.from({ length: 7 }).map((_, i) => (
//           <mesh key={i} rotation={[0, (i / 7) * Math.PI * 2, 0]}>
//             <boxGeometry args={[0.5, 0.06, 0.12]} />
//             <meshPhongMaterial color="#1a1a1a" />
//           </mesh>
//         ))}
//       </group>
//       <mesh position={[0, 0.95, 0.35]}>
//         <cylinderGeometry args={[0.56, 0.56, 0.1, 24]} />
//         <meshPhongMaterial color="#111111" transparent opacity={0.7} />
//       </mesh>
//     </group>
//   );
// }
//
// function VRM({ onClick, selected }: any) {
//   return (
//     <group onClick={onClick}>
//       {[
//         [-3.1, -0.85],
//         [-3.5, -0.85],
//         [-3.9, -0.85],
//         [-3.1, -1.38],
//         [-3.5, -1.38],
//         [-3.9, -1.38],
//       ].map(([x, z], i) => (
//         <group key={i} position={[x, 0.24, z]}>
//           <mesh>
//             <boxGeometry args={[0.34, 0.28, 0.34]} />
//             <meshPhongMaterial color={selected ? "#d0d0b0" : "#b0b090"} />
//           </mesh>
//           <mesh position={[0, 0.18, 0]}>
//             <boxGeometry args={[0.3, 0.08, 0.3]} />
//             <meshPhongMaterial color="#888880" shininess={40} />
//           </mesh>
//         </group>
//       ))}
//       {[
//         [-1.2, -1.95],
//         [-1.6, -1.95],
//       ].map(([x, z], i) => (
//         <mesh key={i} position={[x, 0.24, z]}>
//           <cylinderGeometry args={[0.11, 0.11, 0.3, 12]} />
//           <meshPhongMaterial color="#6688bb" />
//         </mesh>
//       ))}
//     </group>
//   );
// }
//
// function RAM({ onClick, selected }: any) {
//   return (
//     <group>
//       {[
//         [1.55, "#181830", "DDR5-6000"],
//         [1.85, "#181830", "DDR5-6000"],
//         [2.2, "#282840", ""],
//         [2.5, "#282840", ""],
//       ].map(([x, col, lbl], i) => (
//         <group key={i} position={[x as number, 0, -0.7]}>
//           <mesh>
//             <boxGeometry args={[0.13, 0.26, 2.5]} />
//             <meshPhongMaterial color={col as string} />
//           </mesh>
//           {i < 2 && (
//             <group position={[0, 0.55, 0]} onClick={onClick}>
//               <mesh>
//                 <boxGeometry args={[0.11, 0.84, 2.5]} />
//                 <meshPhongMaterial
//                   color={selected ? "#3344dd" : "#181830"}
//                   emissive={selected ? "#001133" : "#000000"}
//                 />
//               </mesh>
//               <mesh position={[0, 0.44, 0]}>
//                 <boxGeometry args={[0.12, 0.06, 2.5]} />
//                 <meshPhongMaterial
//                   color={selected ? "#4466ff" : "#2244bb"}
//                   emissive={selected ? "#112266" : "#001133"}
//                 />
//               </mesh>
//               {Array.from({ length: 8 }).map((_, j) => (
//                 <mesh key={j} position={[0.07, 0, -1.0 + j * 0.28]}>
//                   <boxGeometry args={[0.02, 0.18, 0.22]} />
//                   <meshPhongMaterial color="#111111" />
//                 </mesh>
//               ))}
//               {lbl && (
//                 <Text
//                   position={[0, 0, 0]}
//                   rotation={[0, Math.PI / 2, 0]}
//                   fontSize={0.1}
//                   color="#4466cc"
//                   anchorX="center"
//                 >
//                   {lbl as string}
//                 </Text>
//               )}
//             </group>
//           )}
//         </group>
//       ))}
//     </group>
//   );
// }
//
// function GPU({ onClick, selected }: any) {
//   const fanRef1 = useRef<THREE.Group>(null);
//   const fanRef2 = useRef<THREE.Group>(null);
//   useFrame((_, delta) => {
//     if (fanRef1.current) fanRef1.current.rotation.z += delta * 5;
//     if (fanRef2.current) fanRef2.current.rotation.z -= delta * 5;
//   });
//   return (
//     <group position={[0, 0, 0]}>
//       <mesh position={[0.1, 0.1, 1.9]}>
//         <boxGeometry args={[7.5, 0.08, 1.4]} />
//         <meshPhongMaterial color="#0a1a0a" />
//       </mesh>
//       <mesh position={[0.4, 0.17, 1.9]} onClick={onClick}>
//         <boxGeometry args={[5.8, 0.11, 1.4]} />
//         <meshPhongMaterial color={selected ? "#1a0a3a" : "#0a0a1a"} />
//       </mesh>
//       <mesh position={[0.4, 0.85, 1.9]} onClick={onClick}>
//         <boxGeometry args={[5.8, 1.4, 2.1]} />
//         <meshPhongMaterial
//           color={selected ? "#222244" : "#161616"}
//           emissive={selected ? "#050520" : "#000000"}
//         />
//       </mesh>
//       <mesh position={[3.35, 0.85, 1.9]}>
//         <boxGeometry args={[0.13, 1.4, 2.1]} />
//         <meshPhongMaterial color="#909090" shininess={60} />
//       </mesh>
//       {[
//         [-0.8, fanRef1],
//         [1.4, fanRef2],
//       ].map(([xOff, ref], fi) => (
//         <group key={fi}>
//           <mesh position={[xOff as number, 1.7, 1.9]}>
//             <cylinderGeometry args={[0.65, 0.65, 0.22, 24]} />
//             <meshPhongMaterial color="#111111" transparent opacity={0.85} />
//           </mesh>
//           <group ref={ref as any} position={[xOff as number, 1.7, 1.9]}>
//             {Array.from({ length: 9 }).map((_, i) => (
//               <mesh key={i} rotation={[0, 0, (i / 9) * Math.PI * 2]}>
//                 <boxGeometry args={[0.55, 0.05, 0.14]} />
//                 <meshPhongMaterial color="#252525" />
//               </mesh>
//             ))}
//           </group>
//           <mesh position={[xOff as number, 1.7, 1.9]}>
//             <cylinderGeometry args={[0.12, 0.12, 0.25, 12]} />
//             <meshPhongMaterial color="#333333" />
//           </mesh>
//         </group>
//       ))}
//       <mesh position={[0.9, 0.28, 1.0]}>
//         <boxGeometry args={[0.55, 0.22, 0.22]} />
//         <meshPhongMaterial color="#444444" />
//       </mesh>
//       <mesh position={[3.35, 0.82, 1.9]}>
//         <boxGeometry args={[0.15, 1.35, 1.95]} />
//         <meshPhongMaterial color="#777777" />
//       </mesh>
//       {[
//         [2.9, 0.95],
//         [2.7, 0.95],
//         [2.5, 0.95],
//       ].map(([z, y], i) => (
//         <mesh key={i} position={[3.44, y, z]}>
//           <boxGeometry args={[0.06, 0.22, 0.28]} />
//           <meshPhongMaterial color="#111111" />
//         </mesh>
//       ))}
//       <Text
//         position={[0.4, 1.6, 2.97]}
//         fontSize={0.14}
//         color="#6644ff"
//         anchorX="center"
//       >
//         RTX 4090
//       </Text>
//     </group>
//   );
// }
//
// function NVMe({ onClick, selected }: any) {
//   return (
//     <group position={[0.1, 0.14, 0.2]} onClick={onClick}>
//       <mesh>
//         <boxGeometry args={[2.0, 0.1, 0.23]} />
//         <meshPhongMaterial
//           color={selected ? "#0a2a0a" : "#0a1a0a"}
//           emissive={selected ? "#002200" : "#000000"}
//         />
//       </mesh>
//       {[
//         [-0.38, 0],
//         [0.42, 0],
//       ].map(([x, z], i) => (
//         <mesh key={i} position={[x, 0.08, z]}>
//           <boxGeometry args={[0.62, 0.07, 0.19]} />
//           <meshPhongMaterial color="#151515" />
//         </mesh>
//       ))}
//       <mesh position={[-0.62, 0.08, 0]}>
//         <boxGeometry args={[0.36, 0.07, 0.21]} />
//         <meshPhongMaterial color="#1a1a1a" />
//       </mesh>
//       <mesh position={[1.05, 0.1, 0]}>
//         <cylinderGeometry args={[0.06, 0.06, 0.12, 12]} />
//         <meshPhongMaterial color="#a0a080" />
//       </mesh>
//       <Text
//         position={[0, 0.12, 0]}
//         rotation={[-Math.PI / 2, 0, 0]}
//         fontSize={0.08}
//         color="#00aa44"
//         anchorX="center"
//       >
//         WD BLACK SN850X 2TB
//       </Text>
//     </group>
//   );
// }
//
// function HDD({ onClick, selected }: any) {
//   const platRef = useRef<THREE.Mesh>(null);
//   useFrame((_, delta) => {
//     if (platRef.current) platRef.current.rotation.y += delta * 12;
//   });
//   return (
//     <group position={[6.8, 0.45, 2.5]} onClick={onClick}>
//       <mesh>
//         <boxGeometry args={[3.2, 0.9, 4.6]} />
//         <meshPhongMaterial
//           color={selected ? "#444444" : "#686868"}
//           emissive={selected ? "#111111" : "#000000"}
//           shininess={20}
//         />
//       </mesh>
//       <mesh ref={platRef} position={[0, 0.48, 0]}>
//         <cylinderGeometry args={[1.2, 1.2, 0.06, 32]} />
//         <meshPhongMaterial color="#7a7a7a" shininess={80} />
//       </mesh>
//       <mesh position={[0, 0.48, 0]}>
//         <cylinderGeometry args={[0.14, 0.14, 0.1, 12]} />
//         <meshPhongMaterial color="#333333" />
//       </mesh>
//       <mesh position={[-1.4, 0, 2.35]}>
//         <boxGeometry args={[0.22, 0.5, 0.18]} />
//         <meshPhongMaterial color="#999977" />
//       </mesh>
//       <Text
//         position={[0, 0.52, 0]}
//         rotation={[-Math.PI / 2, 0, 0]}
//         fontSize={0.2}
//         color="#aaaaaa"
//         anchorX="center"
//       >
//         8TB
//       </Text>
//     </group>
//   );
// }
//
// function SATASSD({ onClick, selected }: any) {
//   return (
//     <group position={[6.8, 0.15, 0.0]} onClick={onClick}>
//       <mesh>
//         <boxGeometry args={[2.2, 0.32, 3.1]} />
//         <meshPhongMaterial
//           color={selected ? "#444444" : "#333333"}
//           emissive={selected ? "#111111" : "#000000"}
//         />
//       </mesh>
//       <mesh position={[0, 0.18, 0]}>
//         <boxGeometry args={[2.1, 0.06, 3.0]} />
//         <meshPhongMaterial color="#555555" shininess={40} />
//       </mesh>
//       <mesh position={[-0.9, 0, 0]}>
//         <boxGeometry args={[0.3, 0.22, 0.55]} />
//         <meshPhongMaterial color="#999977" />
//       </mesh>
//       <Text
//         position={[0, 0.22, 0]}
//         rotation={[-Math.PI / 2, 0, 0]}
//         fontSize={0.18}
//         color="#55aaff"
//         anchorX="center"
//       >
//         Samsung 870 EVO
//       </Text>
//     </group>
//   );
// }
//
// function PSU({ onClick, selected }: any) {
//   return (
//     <group position={[-4.5, 0.7, 2.8]} onClick={onClick}>
//       <mesh>
//         <boxGeometry args={[3.2, 1.4, 5.0]} />
//         <meshPhongMaterial
//           color={selected ? "#333333" : "#222222"}
//           shininess={10}
//         />
//       </mesh>
//       <mesh position={[0, 0.72, 0]}>
//         <cylinderGeometry args={[0.55, 0.55, 0.08, 24]} />
//         <meshPhongMaterial color="#111111" transparent opacity={0.85} />
//       </mesh>
//       {Array.from({ length: 7 }).map((_, i) => (
//         <mesh
//           key={i}
//           position={[0, 0.72, 0]}
//           rotation={[0, (i / 7) * Math.PI * 2, 0]}
//         >
//           <boxGeometry args={[0.5, 0.06, 0.1]} />
//           <meshPhongMaterial color="#1a1a1a" />
//         </mesh>
//       ))}
//       <mesh position={[1.65, -0.1, -0.5]}>
//         <boxGeometry args={[0.12, 0.6, 0.35]} />
//         <meshPhongMaterial color="#ffdd88" />
//       </mesh>
//       <mesh position={[1.65, -0.1, 0.2]}>
//         <boxGeometry args={[0.12, 0.6, 0.35]} />
//         <meshPhongMaterial color="#cccccc" />
//       </mesh>
//       <Text
//         position={[0, 0, 2.52]}
//         fontSize={0.18}
//         color="#4488ff"
//         anchorX="center"
//       >
//         750W Gold
//       </Text>
//     </group>
//   );
// }
//
// function RearIO({ onClick, selected }: any) {
//   return (
//     <group position={[-4.5, 0.32, -2.2]} onClick={onClick}>
//       <mesh>
//         <boxGeometry args={[0.24, 0.65, 1.8]} />
//         <meshPhongMaterial color={selected ? "#5588dd" : "#4477cc"} />
//       </mesh>
//       {[
//         [-0.5, 0],
//         [0, 0],
//         [0.5, 0],
//       ].map(([z, y], i) => (
//         <mesh key={i} position={[-0.13, y as number, z as number]}>
//           <boxGeometry args={[0.08, 0.22, 0.28]} />
//           <meshPhongMaterial color="#111133" />
//         </mesh>
//       ))}
//       <mesh position={[-0.13, 0, -0.75]}>
//         <boxGeometry args={[0.06, 0.14, 0.22]} />
//         <meshPhongMaterial color="#111122" />
//       </mesh>
//       <mesh position={[-0.13, 0, 0.75]}>
//         <boxGeometry args={[0.06, 0.2, 0.3]} />
//         <meshPhongMaterial color="#111111" />
//       </mesh>
//       <mesh position={[-0.13, -0.15, -0.25]}>
//         <boxGeometry args={[0.08, 0.28, 0.38]} />
//         <meshPhongMaterial color="#334422" />
//       </mesh>
//       {[0.25, 0.45].map((z, i) => (
//         <mesh
//           key={i}
//           position={[-0.14, -0.15, -z]}
//           rotation={[0, 0, Math.PI / 2]}
//         >
//           <cylinderGeometry args={[0.08, 0.08, 0.1, 12]} />
//           <meshPhongMaterial color={i === 0 ? "#22aa22" : "#ff4444"} />
//         </mesh>
//       ))}
//     </group>
//   );
// }
//
// function PowerCables() {
//   return (
//     <group>
//       <mesh position={[4.25, 0.55, -0.6]}>
//         <boxGeometry args={[0.44, 0.14, 2.2]} />
//         <meshPhongMaterial color="#dddd88" />
//       </mesh>
//       <mesh position={[-3.5, 0.55, -3.3]}>
//         <boxGeometry args={[0.6, 0.14, 0.6]} />
//         <meshPhongMaterial color="#eeeecc" />
//       </mesh>
//       <mesh position={[0.9, 0.42, 1.0]}>
//         <boxGeometry args={[0.5, 0.14, 0.22]} />
//         <meshPhongMaterial color="#dddd88" />
//       </mesh>
//       <mesh position={[5.8, 0.2, 0.5]}>
//         <boxGeometry args={[0.22, 0.25, 0.75]} />
//         <meshPhongMaterial color="#999977" />
//       </mesh>
//     </group>
//   );
// }
//
// function PCH({ onClick, selected }: any) {
//   return (
//     <group position={[0.8, 0.18, 0.7]} onClick={onClick}>
//       <mesh>
//         <boxGeometry args={[1.0, 0.14, 1.0]} />
//         <meshPhongMaterial
//           color={selected ? "#333366" : "#1e1e1e"}
//           emissive={selected ? "#001133" : "#000000"}
//         />
//       </mesh>
//       <Text
//         position={[0, 0.1, 0]}
//         rotation={[-Math.PI / 2, 0, 0]}
//         fontSize={0.1}
//         color="#4466aa"
//         anchorX="center"
//       >
//         PCH
//       </Text>
//     </group>
//   );
// }
//
// function BoardComponents() {
//   return (
//     <group>
//       <mesh position={[4.25, 0.32, -0.6]}>
//         <boxGeometry args={[0.56, 0.48, 2.2]} />
//         <meshPhongMaterial color="#dddd99" />
//       </mesh>
//       <mesh position={[-3.5, 0.32, -3.3]}>
//         <boxGeometry args={[0.74, 0.38, 0.74]} />
//         <meshPhongMaterial color="#eeeecc" />
//       </mesh>
//       {[1.0, 1.85, 2.7].map((z, i) => (
//         <mesh key={i} position={[4.32, 0.24, z]}>
//           <boxGeometry args={[0.2, 0.38, 0.74]} />
//           <meshPhongMaterial color="#ee8800" />
//         </mesh>
//       ))}
//       <mesh position={[2.6, 0.12, 2.4]}>
//         <boxGeometry args={[0.56, 0.07, 0.4]} />
//         <meshPhongMaterial color="#111111" />
//       </mesh>
//       <mesh position={[3.1, 0.15, 2.1]}>
//         <cylinderGeometry args={[0.35, 0.35, 0.16, 16]} />
//         <meshPhongMaterial color="#d0d0d0" shininess={40} />
//       </mesh>
//       <mesh position={[0.1, 0.08, 0.2]}>
//         <boxGeometry args={[2.05, 0.05, 0.26]} />
//         <meshPhongMaterial color="#304035" />
//       </mesh>
//       <mesh position={[-2.8, 0.12, 3.1]}>
//         <boxGeometry args={[0.68, 0.08, 0.68]} />
//         <meshPhongMaterial color="#111111" />
//       </mesh>
//       {[
//         [-2.2, 3.3],
//         [-2.6, 3.3],
//       ].map(([x, z], i) => (
//         <mesh key={i} position={[x, 0.24, z]}>
//           <cylinderGeometry args={[0.13, 0.13, 0.32, 12]} />
//           <meshPhongMaterial color="#4466cc" />
//         </mesh>
//       ))}
//       {[
//         [-0.4, -2.6],
//         [0.4, -2.6],
//         [3.6, -2.0],
//       ].map(([x, z], i) => (
//         <mesh key={i} position={[x, 0.18, z]}>
//           <boxGeometry args={[0.3, 0.27, 0.26]} />
//           <meshPhongMaterial color="#f0f0e8" />
//         </mesh>
//       ))}
//       <mesh position={[-0.1, 0.24, 3.56]}>
//         <boxGeometry args={[0.74, 0.38, 0.3]} />
//         <meshPhongMaterial color="#1155cc" />
//       </mesh>
//     </group>
//   );
// }
//
// function Monitor({ onClick, selected }: any) {
//   return (
//     <group position={[-2.0, 0, -6.5]} onClick={onClick}>
//       <mesh position={[0, 2.8, 0]}>
//         <boxGeometry args={[4.5, 2.8, 0.12]} />
//         <meshPhongMaterial color={selected ? "#222222" : "#111111"} />
//       </mesh>
//       <mesh position={[0, 2.8, 0.07]}>
//         <boxGeometry args={[4.2, 2.5, 0.02]} />
//         <meshPhongMaterial
//           color="#0a1a2a"
//           emissive="#001833"
//           emissiveIntensity={1.5}
//         />
//       </mesh>
//       <Text
//         position={[0, 2.8, 0.09]}
//         fontSize={0.28}
//         color="#1a6aaa"
//         anchorX="center"
//         anchorY="middle"
//       >
//         4K 144Hz OLED
//       </Text>
//       <mesh position={[0, 1.1, 0]}>
//         <boxGeometry args={[0.2, 1.0, 0.2]} />
//         <meshPhongMaterial color="#333333" />
//       </mesh>
//       <mesh position={[0, 0.05, 0]}>
//         <boxGeometry args={[2.0, 0.1, 1.0]} />
//         <meshPhongMaterial color="#333333" />
//       </mesh>
//       <mesh position={[0.8, 1.8, -0.07]}>
//         <boxGeometry args={[0.22, 0.14, 0.06]} />
//         <meshPhongMaterial color="#111111" />
//       </mesh>
//       <mesh position={[0.4, 1.8, -0.07]}>
//         <boxGeometry args={[0.2, 0.12, 0.06]} />
//         <meshPhongMaterial color="#111111" />
//       </mesh>
//       <mesh position={[1.8, 1.6, 0.07]}>
//         <sphereGeometry args={[0.05, 8, 8]} />
//         <meshBasicMaterial color="#00ff44" />
//       </mesh>
//     </group>
//   );
// }
//
// interface Connection {
//   from: THREE.Vector3;
//   to: THREE.Vector3;
//   color: string;
//   speed: number;
//   label: string;
//   bandwidth: string;
// }
//
// interface PowerRail {
//   from: THREE.Vector3;
//   to: THREE.Vector3;
//   color: string;
//   voltage: string;
//   watts: string;
// }
//
// function DataParticle({
//   from,
//   to,
//   color,
//   speed,
//   progress,
// }: {
//   from: THREE.Vector3;
//   to: THREE.Vector3;
//   color: string;
//   speed: number;
//   progress: number;
// }) {
//   const ref = useRef<THREE.Mesh>(null);
//   const trailRef = useRef<THREE.Mesh>(null);
//   useFrame(() => {
//     if (!ref.current) return;
//     const t = (progress + Date.now() * speed * 0.0001) % 1;
//     ref.current.position.lerpVectors(from, to, t);
//     if (trailRef.current) {
//       const t2 = (progress + Date.now() * speed * 0.0001 - 0.05) % 1;
//       trailRef.current.position.lerpVectors(from, to, Math.max(0, t2));
//     }
//   });
//   return (
//     <group>
//       <mesh ref={ref}>
//         <sphereGeometry args={[0.1, 10, 10]} />
//         <meshBasicMaterial color={color} />
//       </mesh>
//       <mesh ref={trailRef}>
//         <sphereGeometry args={[0.06, 8, 8]} />
//         <meshBasicMaterial color={color} transparent opacity={0.4} />
//       </mesh>
//     </group>
//   );
// }
//
// function DataFlowLines({ connections }: { connections: Connection[] }) {
//   return (
//     <group>
//       {connections.map((c, i) => (
//         <group key={i}>
//           <Line
//             points={[c.from, c.to]}
//             color={c.color}
//             lineWidth={5}
//             transparent
//             opacity={0.12}
//           />
//           <Line
//             points={[c.from, c.to]}
//             color={c.color}
//             lineWidth={2}
//             transparent
//             opacity={0.8}
//           />
//           {Array.from({ length: 4 }).map((_, j) => (
//             <DataParticle
//               key={j}
//               from={c.from}
//               to={c.to}
//               color={c.color}
//               speed={c.speed}
//               progress={j / 4}
//             />
//           ))}
//           <Billboard
//             position={new THREE.Vector3()
//               .lerpVectors(c.from, c.to, 0.5)
//               .add(new THREE.Vector3(0, 0.5, 0))}
//           >
//             <Text
//               fontSize={0.19}
//               color={c.color}
//               anchorX="center"
//               anchorY="middle"
//               outlineWidth={0.03}
//               outlineColor="#000000"
//             >
//               {c.label} · {c.bandwidth}
//             </Text>
//           </Billboard>
//         </group>
//       ))}
//     </group>
//   );
// }
//
// function PowerFlowLines({ rails }: { rails: PowerRail[] }) {
//   return (
//     <group>
//       {rails.map((r, i) => (
//         <group key={i}>
//           <Line
//             points={[r.from, r.to]}
//             color={r.color}
//             lineWidth={6}
//             transparent
//             opacity={0.12}
//           />
//           <Line
//             points={[r.from, r.to]}
//             color={r.color}
//             lineWidth={2.5}
//             transparent
//             opacity={0.85}
//           />
//           {Array.from({ length: 3 }).map((_, j) => (
//             <DataParticle
//               key={j}
//               from={r.from}
//               to={r.to}
//               color={r.color}
//               speed={0.8}
//               progress={j / 3}
//             />
//           ))}
//           <Billboard
//             position={new THREE.Vector3()
//               .lerpVectors(r.from, r.to, 0.5)
//               .add(new THREE.Vector3(0, 0.5, 0))}
//           >
//             <Text
//               fontSize={0.2}
//               color={r.color}
//               anchorX="center"
//               outlineWidth={0.02}
//               outlineColor="#000000"
//             >
//               {r.voltage} · {r.watts}
//             </Text>
//           </Billboard>
//         </group>
//       ))}
//     </group>
//   );
// }
//
// export default function LabCanvas() {
//   const [selected, setSelected] = useState<ComponentKey | null>(null);
//   const [mode, setMode] = useState<Mode>("explore");
//   const info = selected ? COMPONENT_INFO[selected] : null;
//
//   const DATA_CONNECTIONS: Connection[] = useMemo(
//     () => [
//       {
//         from: new THREE.Vector3(-1.7, 0.5, -1),
//         to: new THREE.Vector3(2.1, 0.5, -0.7),
//         color: "#22ccaa",
//         speed: 1.8,
//         label: "CPU↔RAM",
//         bandwidth: "96 GB/s",
//       },
//       {
//         from: new THREE.Vector3(-1.7, 0.5, -1),
//         to: new THREE.Vector3(0.4, 0.5, 1.9),
//         color: "#aa44ff",
//         speed: 2.5,
//         label: "CPU↔GPU",
//         bandwidth: "128 GB/s",
//       },
//       {
//         from: new THREE.Vector3(-1.7, 0.5, -1),
//         to: new THREE.Vector3(0.1, 0.5, 0.2),
//         color: "#2288ff",
//         speed: 2.0,
//         label: "CPU↔NVMe",
//         bandwidth: "7 GB/s",
//       },
//       {
//         from: new THREE.Vector3(-1.7, 0.5, -1),
//         to: new THREE.Vector3(0.8, 0.5, 0.7),
//         color: "#22ccaa",
//         speed: 1.2,
//         label: "CPU↔PCH",
//         bandwidth: "16 GB/s",
//       },
//       {
//         from: new THREE.Vector3(0.8, 0.5, 0.7),
//         to: new THREE.Vector3(6.8, 0.5, 2.5),
//         color: "#ff8822",
//         speed: 0.8,
//         label: "PCH↔HDD",
//         bandwidth: "200 MB/s",
//       },
//       {
//         from: new THREE.Vector3(0.8, 0.5, 0.7),
//         to: new THREE.Vector3(6.8, 0.5, 0.0),
//         color: "#ffaa22",
//         speed: 1.0,
//         label: "PCH↔SSD",
//         bandwidth: "550 MB/s",
//       },
//       {
//         from: new THREE.Vector3(0.4, 1.5, 1.9),
//         to: new THREE.Vector3(-2.0, 2.8, -6.5),
//         color: "#ff44aa",
//         speed: 2.2,
//         label: "GPU→Monitor",
//         bandwidth: "48 Gbps",
//       },
//     ],
//     [],
//   );
//
//   const POWER_RAILS: PowerRail[] = useMemo(
//     () => [
//       {
//         from: new THREE.Vector3(-4.5, 0.7, 2.8),
//         to: new THREE.Vector3(4.25, 0.5, -0.6),
//         color: "#ffdd00",
//         voltage: "12V+5V+3.3V",
//         watts: "80W",
//       },
//       {
//         from: new THREE.Vector3(-4.5, 0.7, 2.8),
//         to: new THREE.Vector3(-3.5, 0.5, -3.3),
//         color: "#ff8800",
//         voltage: "12V",
//         watts: "300W",
//       },
//       {
//         from: new THREE.Vector3(-3.5, 0.5, -1.1),
//         to: new THREE.Vector3(-1.7, 0.5, -1),
//         color: "#ff3300",
//         voltage: "1.1V",
//         watts: "170W",
//       },
//       {
//         from: new THREE.Vector3(-4.5, 0.7, 2.8),
//         to: new THREE.Vector3(0.9, 0.5, 1.0),
//         color: "#cc00ff",
//         voltage: "12V",
//         watts: "450W",
//       },
//       {
//         from: new THREE.Vector3(4.25, 0.5, -0.6),
//         to: new THREE.Vector3(2.1, 0.5, -0.7),
//         color: "#00eedd",
//         voltage: "1.1V",
//         watts: "12W",
//       },
//       {
//         from: new THREE.Vector3(4.25, 0.5, -0.6),
//         to: new THREE.Vector3(0.1, 0.5, 0.2),
//         color: "#4499ff",
//         voltage: "3.3V",
//         watts: "8W",
//       },
//       {
//         from: new THREE.Vector3(-4.5, 0.7, 2.8),
//         to: new THREE.Vector3(6.8, 0.5, 2.5),
//         color: "#ff8800",
//         voltage: "12V+5V",
//         watts: "10W",
//       },
//       {
//         from: new THREE.Vector3(-4.5, 0.7, 2.8),
//         to: new THREE.Vector3(6.8, 0.5, 0.0),
//         color: "#aacc00",
//         voltage: "5V+3.3V",
//         watts: "5W",
//       },
//     ],
//     [],
//   );
//
//   const ALL_COMPONENTS: ComponentKey[] = [
//     "cpu",
//     "cooler",
//     "gpu",
//     "nvme",
//     "hdd",
//     "satassd",
//     "psu",
//     "socket",
//     "vrm",
//     "dimm",
//     "pcie16",
//     "pch",
//     "atx24",
//     "sata",
//     "bios",
//     "cmos",
//     "m2",
//     "rearIO",
//     "monitor",
//   ];
//
//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "column",
//         gap: "12px",
//         width: "100%",
//       }}
//     >
//       <div style={{ display: "flex", gap: "8px" }}>
//         {(["explore", "data", "power"] as Mode[]).map((m) => (
//           <button
//             key={m}
//             onClick={() => setMode(m)}
//             style={{
//               padding: "6px 16px",
//               fontFamily: "monospace",
//               fontSize: "11px",
//               borderRadius: "6px",
//               cursor: "pointer",
//               border:
//                 mode === m
//                   ? "1px solid #5b9bd5"
//                   : "1px solid rgba(255,255,255,0.15)",
//               background: mode === m ? "rgba(91,155,213,0.15)" : "none",
//               color: mode === m ? "#5b9bd5" : "rgba(180,210,240,0.5)",
//             }}
//           >
//             {m === "explore" ? "Explore" : m === "data" ? "Data Flow" : "Power"}
//           </button>
//         ))}
//         <span
//           style={{
//             fontFamily: "monospace",
//             fontSize: "10px",
//             color: "rgba(255,255,255,0.2)",
//             marginLeft: "8px",
//             alignSelf: "center",
//           }}
//         >
//           Drag to rotate · Scroll to zoom · Click to inspect
//         </span>
//       </div>
//
//       <div style={{ display: "flex", gap: "16px", width: "100%" }}>
//         <div
//           style={{
//             height: "620px",
//             flex: 1,
//             minWidth: 0,
//             overflow: "hidden",
//             borderRadius: "8px",
//             border: "1px solid rgba(255,255,255,0.1)",
//             background: "#0d1810",
//           }}
//         >
//           <Canvas
//             frameloop="always"
//             camera={{ position: [0, 12, 14], fov: 42 }}
//             style={{ width: "100%", height: "100%" }}
//           >
//             <SceneBackground />
//             <ambientLight intensity={2.2} />
//             <directionalLight position={[6, 14, 8]} intensity={2.5} />
//             <directionalLight
//               position={[-8, 6, -5]}
//               intensity={1.0}
//               color="#ddeeff"
//             />
//             <directionalLight position={[0, -5, 4]} intensity={0.7} />
//             <OrbitControls enablePan={true} minDistance={4} maxDistance={30} />
//             <Motherboard />
//             <CPUSocket
//               onClick={() => setSelected("socket")}
//               selected={selected === "socket"}
//             />
//             <CPU
//               onClick={() => setSelected("cpu")}
//               selected={selected === "cpu"}
//             />
//             <CPUCooler
//               onClick={() => setSelected("cooler")}
//               selected={selected === "cooler"}
//             />
//             <VRM
//               onClick={() => setSelected("vrm")}
//               selected={selected === "vrm"}
//             />
//             <RAM
//               onClick={() => setSelected("dimm")}
//               selected={selected === "dimm"}
//             />
//             <GPU
//               onClick={() => setSelected("gpu")}
//               selected={selected === "gpu"}
//             />
//             <NVMe
//               onClick={() => setSelected("nvme")}
//               selected={selected === "nvme"}
//             />
//             <HDD
//               onClick={() => setSelected("hdd")}
//               selected={selected === "hdd"}
//             />
//             <SATASSD
//               onClick={() => setSelected("satassd")}
//               selected={selected === "satassd"}
//             />
//             <PSU
//               onClick={() => setSelected("psu")}
//               selected={selected === "psu"}
//             />
//             <RearIO
//               onClick={() => setSelected("rearIO")}
//               selected={selected === "rearIO"}
//             />
//             <PowerCables />
//             <PCH
//               onClick={() => setSelected("pch")}
//               selected={selected === "pch"}
//             />
//             <BoardComponents />
//             <Monitor
//               onClick={() => setSelected("monitor")}
//               selected={selected === "monitor"}
//             />
//             {mode === "data" && (
//               <DataFlowLines connections={DATA_CONNECTIONS} />
//             )}
//             {mode === "power" && <PowerFlowLines rails={POWER_RAILS} />}
//           </Canvas>
//         </div>
//
//         <div style={{ width: "260px", flexShrink: 0 }}>
//           {info ? (
//             <div
//               style={{
//                 borderRadius: "8px",
//                 border: "1px solid rgba(255,255,255,0.1)",
//                 background: "rgba(255,255,255,0.05)",
//                 padding: "16px",
//               }}
//             >
//               <div
//                 style={{
//                   marginBottom: "4px",
//                   display: "inline-block",
//                   borderRadius: "4px",
//                   padding: "2px 8px",
//                   fontFamily: "monospace",
//                   fontSize: "11px",
//                   background: info.col + "22",
//                   color: info.col,
//                 }}
//               >
//                 {info.cat}
//               </div>
//               <h2
//                 style={{
//                   marginBottom: "8px",
//                   fontFamily: "monospace",
//                   fontSize: "14px",
//                   fontWeight: 700,
//                   color: "white",
//                 }}
//               >
//                 {info.name}
//               </h2>
//               <p
//                 style={{
//                   marginBottom: "16px",
//                   fontFamily: "monospace",
//                   fontSize: "11px",
//                   lineHeight: 1.7,
//                   color: "rgba(255,255,255,0.6)",
//                 }}
//               >
//                 {info.desc}
//               </p>
//               <div
//                 style={{
//                   display: "flex",
//                   flexDirection: "column",
//                   gap: "8px",
//                   marginBottom: "12px",
//                 }}
//               >
//                 {info.specs.map(([k, v]) => (
//                   <div
//                     key={k}
//                     style={{
//                       display: "flex",
//                       gap: "8px",
//                       borderBottom: "1px solid rgba(255,255,255,0.05)",
//                       paddingBottom: "8px",
//                     }}
//                   >
//                     <span
//                       style={{
//                         width: "80px",
//                         flexShrink: 0,
//                         fontFamily: "monospace",
//                         fontSize: "11px",
//                         color: "rgba(255,255,255,0.3)",
//                       }}
//                     >
//                       {k}
//                     </span>
//                     <span
//                       style={{
//                         fontFamily: "monospace",
//                         fontSize: "11px",
//                         color: "white",
//                       }}
//                     >
//                       {v}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//               <div
//                 style={{
//                   borderRadius: "6px",
//                   background: "rgba(234,179,8,0.1)",
//                   padding: "12px",
//                 }}
//               >
//                 <div
//                   style={{
//                     marginBottom: "4px",
//                     fontFamily: "monospace",
//                     fontSize: "11px",
//                     color: "#facc15",
//                   }}
//                 >
//                   fun fact
//                 </div>
//                 <div
//                   style={{
//                     fontFamily: "monospace",
//                     fontSize: "11px",
//                     color: "rgba(253,224,71,0.8)",
//                   }}
//                 >
//                   {info.fact}
//                 </div>
//               </div>
//               <button
//                 onClick={() => setSelected(null)}
//                 style={{
//                   marginTop: "12px",
//                   width: "100%",
//                   padding: "6px",
//                   fontFamily: "monospace",
//                   fontSize: "11px",
//                   borderRadius: "4px",
//                   border: "1px solid rgba(255,255,255,0.1)",
//                   background: "none",
//                   color: "rgba(255,255,255,0.4)",
//                   cursor: "pointer",
//                 }}
//               >
//                 Deselect
//               </button>
//             </div>
//           ) : (
//             <div
//               style={{
//                 borderRadius: "8px",
//                 border: "1px solid rgba(255,255,255,0.1)",
//                 background: "rgba(255,255,255,0.05)",
//                 padding: "16px",
//               }}
//             >
//               <p
//                 style={{
//                   fontFamily: "monospace",
//                   fontSize: "11px",
//                   color: "rgba(255,255,255,0.3)",
//                   marginBottom: "12px",
//                 }}
//               >
//                 {mode === "explore"
//                   ? "Click any component to inspect it."
//                   : mode === "data"
//                     ? "Data flow between components — bandwidth shown on each path."
//                     : "Power distribution — voltage and wattage per component."}
//               </p>
//               <div
//                 style={{ display: "flex", flexDirection: "column", gap: "6px" }}
//               >
//                 {ALL_COMPONENTS.map((id) => (
//                   <button
//                     key={id}
//                     onClick={() => setSelected(id)}
//                     style={{
//                       width: "100%",
//                       borderRadius: "4px",
//                       border: "1px solid rgba(255,255,255,0.05)",
//                       background: "rgba(255,255,255,0.05)",
//                       padding: "6px 12px",
//                       textAlign: "left",
//                       fontFamily: "monospace",
//                       fontSize: "11px",
//                       color: "rgba(255,255,255,0.5)",
//                       cursor: "pointer",
//                     }}
//                   >
//                     {COMPONENT_INFO[id].name}
//                   </button>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
