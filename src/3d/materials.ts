/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';

// Procedural CanvasTexture for concrete foundation
export function createConcreteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#4a5568';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle noise and expansion joints
  ctx.fillStyle = '#374151';
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const s = Math.random() * 2 + 1;
    ctx.fillRect(x, y, s, s);
  }

  // Grid expansion joint lines
  ctx.strokeStyle = '#2d3748';
  ctx.lineWidth = 3;
  for (let x = 0; x <= 512; x += 128) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += 128) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Procedural Coal Texture
export function createCoalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#27272a';
  for (let i = 0; i < 1500; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = Math.random() * 4 + 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export interface PlantMaterials {
  // Site & Structure
  ground: THREE.MeshStandardMaterial;
  roads: THREE.MeshStandardMaterial;
  riverWater: THREE.MeshStandardMaterial;
  structuralSteel: THREE.MeshStandardMaterial;
  steelGalvanized: THREE.MeshStandardMaterial;
  handrails: THREE.MeshStandardMaterial;
  concrete: THREE.MeshStandardMaterial;
  concreteSmooth: THREE.MeshStandardMaterial;
  industrialBuilding: THREE.MeshStandardMaterial;
  windows: THREE.MeshPhysicalMaterial;

  // Coal handling
  coal: THREE.MeshStandardMaterial;
  conveyorRubber: THREE.MeshStandardMaterial;
  machineryCastIron: THREE.MeshStandardMaterial;

  // Boiler & Combustion
  furnaceCasing: THREE.MeshStandardMaterial;
  waterWallTubes: THREE.MeshStandardMaterial;
  fireballGlow: THREE.MeshBasicMaterial;
  steamDrum: THREE.MeshStandardMaterial;
  superheaterTubes: THREE.MeshStandardMaterial;
  reheaterTubes: THREE.MeshStandardMaterial;
  economizerTubes: THREE.MeshStandardMaterial;
  airPreheater: THREE.MeshStandardMaterial;
  fans: THREE.MeshStandardMaterial;

  // Turbines & Power
  turbineCasing: THREE.MeshStandardMaterial;
  turbineRotor: THREE.MeshStandardMaterial;
  turbineBlades: THREE.MeshStandardMaterial;
  generatorStator: THREE.MeshStandardMaterial;
  transformerTank: THREE.MeshStandardMaterial;
  transformerRadiator: THREE.MeshStandardMaterial;
  electricalBushings: THREE.MeshStandardMaterial;
  switchyardConductors: THREE.MeshStandardMaterial;
  copperBusbar: THREE.MeshStandardMaterial;

  // Condenser & Feedwater
  condenserShell: THREE.MeshStandardMaterial;
  condenserTubes: THREE.MeshStandardMaterial;
  pumpHousing: THREE.MeshStandardMaterial;
  feedwaterHeaters: THREE.MeshStandardMaterial;
  deaeratorTank: THREE.MeshStandardMaterial;

  // Cooling tower
  coolingTowerConcrete: THREE.MeshStandardMaterial;
  coolingWaterSurface: THREE.MeshStandardMaterial;
  coolingFill: THREE.MeshStandardMaterial;

  // Pollution & Ash
  espCasing: THREE.MeshStandardMaterial;
  espHoppers: THREE.MeshStandardMaterial;
  chimneyConcrete: THREE.MeshStandardMaterial;
  ashPipes: THREE.MeshStandardMaterial;
  ashSilo: THREE.MeshStandardMaterial;

  // Water treatment
  clarifierConcrete: THREE.MeshStandardMaterial;
  filterTanks: THREE.MeshStandardMaterial;
  dmVessels: THREE.MeshStandardMaterial;
  treatedWaterTank: THREE.MeshStandardMaterial;

  // Strict Pipeline Colors according to Section 5:
  // Red: High-temp steam & hot reheat
  pipeSteamHot: THREE.MeshStandardMaterial;
  // Orange: Flue gas ducting
  pipeFlueGas: THREE.MeshStandardMaterial;
  // Yellow: Coal & pulverized fuel
  pipeCoalFuel: THREE.MeshStandardMaterial;
  // Blue: Cooling water
  pipeCoolingWater: THREE.MeshStandardMaterial;
  // Light blue: Condensate & feedwater
  pipeFeedwater: THREE.MeshStandardMaterial;
  // Grey: Ash & exhaust
  pipeAshExhaust: THREE.MeshStandardMaterial;
  // Green: Electrical generation
  pipeElectrical: THREE.MeshStandardMaterial;
  // White/Ivory: Combustion air
  pipeCombustionAir: THREE.MeshStandardMaterial;

  // Selection & Highlight
  highlightMaterial: THREE.MeshStandardMaterial;
  ghostCutawayMaterial: THREE.MeshStandardMaterial;
}

export function createPlantMaterials(): PlantMaterials {
  const concreteTexture = createConcreteTexture();
  const coalTexture = createCoalTexture();

  return {
    // Site & Ground
    ground: new THREE.MeshStandardMaterial({
      color: 0x334155,
      map: concreteTexture,
      roughness: 0.85,
      metalness: 0.1,
    }),
    roads: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      metalness: 0.05,
    }),
    riverWater: new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.15,
      metalness: 0.7,
      transparent: true,
      opacity: 0.88,
    }),
    structuralSteel: new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.45,
      metalness: 0.8,
    }),
    steelGalvanized: new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.35,
      metalness: 0.85,
    }),
    handrails: new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // safety yellow
      roughness: 0.5,
      metalness: 0.3,
    }),
    concrete: new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.85,
      metalness: 0.05,
    }),
    concreteSmooth: new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.65,
      metalness: 0.1,
    }),
    industrialBuilding: new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      metalness: 0.4,
    }),
    windows: new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.7,
      transparent: true,
      opacity: 0.8,
    }),

    // Coal handling
    coal: new THREE.MeshStandardMaterial({
      color: 0x18181b,
      map: coalTexture,
      roughness: 0.95,
      metalness: 0.1,
    }),
    conveyorRubber: new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.9,
      metalness: 0.05,
    }),
    machineryCastIron: new THREE.MeshStandardMaterial({
      color: 0x374151,
      roughness: 0.55,
      metalness: 0.75,
    }),

    // Boiler & Combustion
    furnaceCasing: new THREE.MeshStandardMaterial({
      color: 0x6b7280,
      roughness: 0.5,
      metalness: 0.6,
    }),
    waterWallTubes: new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.3,
      metalness: 0.8,
    }),
    fireballGlow: new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.75,
    }),
    steamDrum: new THREE.MeshStandardMaterial({
      color: 0xd97706, // heavy amber/gold alloy
      roughness: 0.3,
      metalness: 0.85,
    }),
    superheaterTubes: new THREE.MeshStandardMaterial({
      color: 0xef4444, // glowing hot red
      roughness: 0.25,
      metalness: 0.8,
    }),
    reheaterTubes: new THREE.MeshStandardMaterial({
      color: 0xf97316, // orange hot
      roughness: 0.3,
      metalness: 0.8,
    }),
    economizerTubes: new THREE.MeshStandardMaterial({
      color: 0x0284c7, // pressurized feedwater preheat
      roughness: 0.35,
      metalness: 0.75,
    }),
    airPreheater: new THREE.MeshStandardMaterial({
      color: 0x78716c,
      roughness: 0.5,
      metalness: 0.6,
    }),
    fans: new THREE.MeshStandardMaterial({
      color: 0x0284c7, // industrial fan blue
      roughness: 0.45,
      metalness: 0.7,
    }),

    // Turbines & Power
    turbineCasing: new THREE.MeshStandardMaterial({
      color: 0x1e3a8a, // industrial dark royal blue
      roughness: 0.4,
      metalness: 0.7,
    }),
    turbineRotor: new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // bright chrome-alloy steel
      roughness: 0.15,
      metalness: 0.95,
    }),
    turbineBlades: new THREE.MeshStandardMaterial({
      color: 0xcbd5e1, // precision milled titanium/alloy
      roughness: 0.2,
      metalness: 0.9,
    }),
    generatorStator: new THREE.MeshStandardMaterial({
      color: 0x15803d, // industrial generator emerald green
      roughness: 0.35,
      metalness: 0.75,
    }),
    transformerTank: new THREE.MeshStandardMaterial({
      color: 0x166534, // deep electrical green
      roughness: 0.5,
      metalness: 0.6,
    }),
    transformerRadiator: new THREE.MeshStandardMaterial({
      color: 0x14532d,
      roughness: 0.45,
      metalness: 0.7,
    }),
    electricalBushings: new THREE.MeshStandardMaterial({
      color: 0x78350f, // reddish-brown glazed porcelain
      roughness: 0.2,
      metalness: 0.3,
    }),
    switchyardConductors: new THREE.MeshStandardMaterial({
      color: 0x22c55e, // green electrical
      roughness: 0.3,
      metalness: 0.9,
    }),
    copperBusbar: new THREE.MeshStandardMaterial({
      color: 0xb45309,
      roughness: 0.3,
      metalness: 0.9,
    }),

    // Condenser & Feedwater
    condenserShell: new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.4,
      metalness: 0.7,
    }),
    condenserTubes: new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.85,
    }),
    pumpHousing: new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      roughness: 0.4,
      metalness: 0.75,
    }),
    feedwaterHeaters: new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.35,
      metalness: 0.8,
    }),
    deaeratorTank: new THREE.MeshStandardMaterial({
      color: 0x0ea5e9,
      roughness: 0.35,
      metalness: 0.75,
    }),

    // Cooling Tower
    coolingTowerConcrete: new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.75,
      metalness: 0.1,
      side: THREE.DoubleSide,
    }),
    coolingWaterSurface: new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.2,
      metalness: 0.6,
      transparent: true,
      opacity: 0.85,
    }),
    coolingFill: new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      metalness: 0.1,
    }),

    // Pollution & Ash
    espCasing: new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.55,
      metalness: 0.65,
    }),
    espHoppers: new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.6,
      metalness: 0.5,
    }),
    chimneyConcrete: new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.7,
      metalness: 0.1,
    }),
    ashPipes: new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.5,
      metalness: 0.6,
    }),
    ashSilo: new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.65,
      metalness: 0.4,
    }),

    // Water Treatment
    clarifierConcrete: new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.7,
      metalness: 0.15,
    }),
    filterTanks: new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.4,
      metalness: 0.7,
    }),
    dmVessels: new THREE.MeshStandardMaterial({
      color: 0x0369a1,
      roughness: 0.35,
      metalness: 0.8,
    }),
    treatedWaterTank: new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.35,
      metalness: 0.8,
    }),

    // Pipeline Color Standards (Mandatory per Section 5):
    pipeSteamHot: new THREE.MeshStandardMaterial({
      color: 0xef4444, // Red: High-temp steam & hot reheat
      roughness: 0.25,
      metalness: 0.75,
    }),
    pipeFlueGas: new THREE.MeshStandardMaterial({
      color: 0xf97316, // Orange: Hot flue gas
      roughness: 0.4,
      metalness: 0.6,
    }),
    pipeCoalFuel: new THREE.MeshStandardMaterial({
      color: 0xeab308, // Yellow: Coal & pulverized fuel
      roughness: 0.45,
      metalness: 0.55,
    }),
    pipeCoolingWater: new THREE.MeshStandardMaterial({
      color: 0x3b82f6, // Blue: Cooling water
      roughness: 0.3,
      metalness: 0.7,
    }),
    pipeFeedwater: new THREE.MeshStandardMaterial({
      color: 0x38bdf8, // Light blue: Condensate & feedwater
      roughness: 0.3,
      metalness: 0.75,
    }),
    pipeAshExhaust: new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Grey: Ash & exhaust
      roughness: 0.5,
      metalness: 0.5,
    }),
    pipeElectrical: new THREE.MeshStandardMaterial({
      color: 0x22c55e, // Green: Electrical generation
      roughness: 0.35,
      metalness: 0.7,
    }),
    pipeCombustionAir: new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // White: Combustion air
      roughness: 0.45,
      metalness: 0.5,
    }),

    // Selection & Highlight
    highlightMaterial: new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Golden yellow highlight
      emissive: 0xca8a04,
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.6,
    }),
    ghostCutawayMaterial: new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.2,
      roughness: 0.6,
      metalness: 0.2,
      depthWrite: false,
    }),
  };
}
