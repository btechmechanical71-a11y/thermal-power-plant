/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { PlantMaterials } from './materials';
import { FlowCircuit } from '../types/plant';

export interface PipeRoute {
  id: string;
  circuit: FlowCircuit;
  curve: THREE.CatmullRomCurve3;
  mesh: THREE.Mesh;
  particles: THREE.Points;
  particleOffsets: Float32Array;
  speed: number;
}

export function buildPipelineNetwork(materials: PlantMaterials): {
  pipelineGroup: THREE.Group;
  routes: PipeRoute[];
} {
  const group = new THREE.Group();
  group.name = 'PipelineNetwork';

  const routes: PipeRoute[] = [];

  // Helper to create a pipeline with animated flow particles
  function addRoute(
    id: string,
    circuit: FlowCircuit,
    points: [number, number, number][],
    radius: number,
    material: THREE.MeshStandardMaterial,
    particleColor: number,
    speed: number = 0.5
  ) {
    const vectors = points.map((p) => new THREE.Vector3(...p));
    const curve = new THREE.CatmullRomCurve3(vectors);
    const tubeGeo = new THREE.TubeGeometry(curve, 32, radius, 8, false);
    const mesh = new THREE.Mesh(tubeGeo, material);
    group.add(mesh);

    // Particle flow system along curve
    const particleCount = 28;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleOffsets = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const u = i / particleCount;
      particleOffsets[i] = u;
      const pt = curve.getPointAt(u);
      positions[i * 3] = pt.x;
      positions[i * 3 + 1] = pt.y;
      positions[i * 3 + 2] = pt.z;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: particleColor,
      size: radius * 3.2,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    routes.push({
      id,
      circuit,
      curve,
      mesh,
      particles,
      particleOffsets,
      speed,
    });
  }

  // 1. MAIN STEAM (RED): Superheater -> HP Turbine (540°C, 170 bar)
  addRoute(
    'main_steam',
    'main_steam_reheat',
    [
      [-14, 42, 10],
      [-14, 42, 0],
      [-16, 24, -10],
      [-16, 15, -20],
      [-16, 14, -22],
    ],
    0.55,
    materials.pipeSteamHot,
    0xff4444,
    0.8
  );

  // 2. COLD REHEAT (ORANGE/RED): HP Turbine Exhaust -> Boiler Reheater
  addRoute(
    'cold_reheat',
    'main_steam_reheat',
    [
      [-14, 13, -22],
      [-12, 18, -14],
      [-10, 26, 0],
      [-10, 36, 10],
    ],
    0.6,
    materials.pipeSteamHot,
    0xff7733,
    0.7
  );

  // 3. HOT REHEAT (RED): Boiler Reheater -> IP Turbine (540°C, 40 bar)
  addRoute(
    'hot_reheat',
    'main_steam_reheat',
    [
      [-8, 38, 10],
      [-8, 30, 0],
      [-8, 20, -12],
      [-8, 15, -20],
      [-8, 14, -22],
    ],
    0.65,
    materials.pipeSteamHot,
    0xff2222,
    0.85
  );

  // 4. CROSSOVER STEAM: IP Turbine -> LP Turbine
  addRoute(
    'ip_lp_crossover',
    'main_steam_reheat',
    [
      [-5, 14, -22],
      [-3, 16, -22],
      [-1, 14, -22],
    ],
    0.7,
    materials.pipeSteamHot,
    0xff6644,
    0.7
  );

  // 5. HP EXTRACTION STEAM: HP Turbine -> HP Feedwater Heater
  addRoute(
    'hp_extraction',
    'condensate_feedwater',
    [
      [-16, 11, -21],
      [-15, 10, -14],
      [-14, 10, -6],
    ],
    0.35,
    materials.pipeSteamHot,
    0xff8866,
    0.6
  );

  // 6. IP EXTRACTION STEAM: IP Turbine -> Deaerator
  addRoute(
    'ip_extraction',
    'condensate_feedwater',
    [
      [-8, 11, -21],
      [-11, 16, -18],
      [-14, 25, -14],
    ],
    0.4,
    materials.pipeSteamHot,
    0xffaa88,
    0.65
  );

  // 7. LP EXTRACTION STEAM: LP Turbine -> LP Feedwater Heater
  addRoute(
    'lp_extraction',
    'condensate_feedwater',
    [
      [2, 11, -20],
      [0, 8, -17],
      [-2, 5, -14],
    ],
    0.45,
    materials.pipeSteamHot,
    0xffccaa,
    0.55
  );

  // 8. CONDENSATE (LIGHT BLUE): Condenser Hotwell -> CEP -> LP Heater
  addRoute(
    'condensate_to_lp',
    'condensate_feedwater',
    [
      [2, 0.5, -22],
      [4, 0.5, -18],
      [5, 1, -16],
      [2, 2.5, -15],
      [-2, 3.5, -14],
    ],
    0.35,
    materials.pipeFeedwater,
    0x38bdf8,
    0.6
  );

  // 9. CONDENSATE (LIGHT BLUE): LP Heater -> Deaerator
  addRoute(
    'lp_to_deaerator',
    'condensate_feedwater',
    [
      [-2, 4.5, -14],
      [-6, 12, -14],
      [-12, 18, -14],
      [-14, 22, -14],
    ],
    0.4,
    materials.pipeFeedwater,
    0x38bdf8,
    0.65
  );

  // 10. DEAERATOR DOWNCOMER: Deaerator -> Boiler Feed Pump
  addRoute(
    'deaerator_to_bfp',
    'condensate_feedwater',
    [
      [-14, 20, -14],
      [-14, 10, -14],
      [-14, 3, -14],
    ],
    0.5,
    materials.pipeFeedwater,
    0x0284c7,
    0.7
  );

  // 11. HIGH-PRESSURE FEEDWATER: BFP -> HP Feedwater Heater -> Economizer
  addRoute(
    'bfp_to_economizer',
    'condensate_feedwater',
    [
      [-14, 2.5, -14],
      [-14, 5, -10],
      [-14, 8, -6],
      [-12, 14, -2],
      [-8, 22, 6],
      [-6, 30, 10],
    ],
    0.48,
    materials.pipeFeedwater,
    0x0284c7,
    0.8
  );

  // 12. ECONOMIZER TO DRUM: Economizer -> Steam Drum
  addRoute(
    'economizer_to_drum',
    'condensate_feedwater',
    [
      [-6, 33, 10],
      [-10, 38, 10],
      [-14, 44, 10],
    ],
    0.5,
    materials.pipeFeedwater,
    0x38bdf8,
    0.75
  );

  // 13. COOLING WATER SUPPLY (BLUE): Cooling Tower Basin -> CWP -> Condenser
  addRoute(
    'cw_supply',
    'cooling_water',
    [
      [42, 1, 42],
      [34, 1.5, 40],
      [28, 2, 38],
      [18, 1.5, 20],
      [10, 1.5, 0],
      [7.5, 2, -18],
      [7.5, 2, -22],
    ],
    0.8,
    materials.pipeCoolingWater,
    0x2563eb,
    0.9
  );

  // 14. COOLING WATER RETURN (BLUE): Condenser -> Return Header -> Cooling Tower Riser
  addRoute(
    'cw_return',
    'cooling_water',
    [
      [-3.5, 2, -22],
      [-3.5, 2, -18],
      [2, 2.5, -8],
      [14, 3, 8],
      [24, 4, 24],
      [36, 5, 36],
      [42, 6, 45],
    ],
    0.8,
    materials.pipeCoolingWater,
    0x3b82f6,
    0.9
  );

  // 15. COMBUSTION AIR (WHITE): FD Fan -> Air Preheater -> Burners
  addRoute(
    'combustion_air',
    'flue_gas_air',
    [
      [2, 5, 22],
      [2, 12, 18],
      [2, 18, 12],
      [0, 20, 10],
      [-8, 18, 10],
      [-16, 16, 10],
    ],
    0.75,
    materials.pipeCombustionAir,
    0xffffff,
    0.65
  );

  // 16. FLUE GAS (ORANGE): Boiler Furnace -> Economizer -> APH -> ESP -> ID Fan -> Chimney
  addRoute(
    'flue_gas_path',
    'flue_gas_air',
    [
      [-14, 38, 10],
      [-6, 32, 10],
      [0, 22, 10],
      [10, 18, 10],
      [16, 15, 10],
      [22, 14, 10],
      [30, 10, 10],
      [36, 6, 10],
      [44, 10, 10],
      [52, 25, 10],
      [52, 80, 10],
    ],
    0.95,
    materials.pipeFlueGas,
    0xf97316,
    0.7
  );

  // 17. MAKEUP WATER: DM Tank -> Deaerator & Condenser
  addRoute(
    'makeup_water_circuit',
    'water_treatment',
    [
      [-8, 6, -45],
      [-8, 6, -35],
      [-10, 12, -24],
      [-14, 22, -14],
    ],
    0.3,
    materials.pipeFeedwater,
    0x00f0ff,
    0.5
  );

  return { pipelineGroup: group, routes };
}

/**
 * Updates animated flow particles each animation frame
 */
export function updatePipelineFlow(routes: PipeRoute[], delta: number) {
  for (const route of routes) {
    const geo = route.particles.geometry as THREE.BufferGeometry;
    const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
    const count = route.particleOffsets.length;

    for (let i = 0; i < count; i++) {
      route.particleOffsets[i] = (route.particleOffsets[i] + delta * 0.12 * route.speed) % 1.0;
      const pt = route.curve.getPointAt(route.particleOffsets[i]);
      posAttr.setXYZ(i, pt.x, pt.y, pt.z);
    }
    posAttr.needsUpdate = true;
  }
}
