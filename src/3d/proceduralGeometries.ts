/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { PlantMaterials } from './materials';

export interface ComponentMeshRegistry {
  [id: number]: THREE.Group;
}

export interface CutawayRegistry {
  casingMeshes: THREE.Mesh[];
  internalMeshes: THREE.Mesh[];
}

/**
 * Builds the complete 3D procedural plant with all 50 identifiable components,
 * civil structures, foundations, and cutaway objects.
 */
export function buildPlantScene(
  materials: PlantMaterials
): {
  rootGroup: THREE.Group;
  componentMap: ComponentMeshRegistry;
  cutawayRegistry: CutawayRegistry;
} {
  const root = new THREE.Group();
  root.name = 'ThermalPowerPlant_Root';

  const componentMap: ComponentMeshRegistry = {};
  const cutawayRegistry: CutawayRegistry = {
    casingMeshes: [],
    internalMeshes: [],
  };

  // Helper to register a component group with metadata
  function registerComp(id: number, group: THREE.Group): THREE.Group {
    group.userData = { componentId: id };
    componentMap[id] = group;
    root.add(group);
    return group;
  }

  // ==========================================
  // 1. SITE FOUNDATION, ROADS & RIVER
  // ==========================================
  const siteGroup = new THREE.Group();
  siteGroup.name = 'Site_Infrastructure';

  // Main Concrete Foundation Slab
  const groundGeo = new THREE.BoxGeometry(190, 1.2, 130);
  const groundMesh = new THREE.Mesh(groundGeo, materials.ground);
  groundMesh.position.set(-5, -0.6, 0);
  groundMesh.receiveShadow = true;
  siteGroup.add(groundMesh);

  // Industrial Perimeter Roadway
  const roadGeo = new THREE.BoxGeometry(180, 0.05, 8);
  const roadMesh1 = new THREE.Mesh(roadGeo, materials.roads);
  roadMesh1.position.set(-5, 0.03, -33);
  siteGroup.add(roadMesh1);

  const roadMesh2 = new THREE.Mesh(roadGeo, materials.roads);
  roadMesh2.position.set(-5, 0.03, 30);
  siteGroup.add(roadMesh2);

  // River Channel (for Raw Water Intake)
  const riverGeo = new THREE.BoxGeometry(60, 1.8, 30);
  const riverMesh = new THREE.Mesh(riverGeo, materials.riverWater);
  riverMesh.position.set(-75, -0.6, -55);
  siteGroup.add(riverMesh);

  // River Embankment Wall
  const bankGeo = new THREE.BoxGeometry(62, 2.2, 2);
  const bankMesh = new THREE.Mesh(bankGeo, materials.concrete);
  bankMesh.position.set(-75, 0.2, -40);
  siteGroup.add(bankMesh);

  root.add(siteGroup);

  // ==========================================
  // A. COAL HANDLING SYSTEM (Components 1 - 8)
  // ==========================================

  // #1 Coal Storage Yard
  const coalYard = new THREE.Group();
  coalYard.position.set(-90, 0, 45);

  // Yard concrete perimeter apron
  const cyApron = new THREE.Mesh(new THREE.BoxGeometry(32, 0.6, 26), materials.concrete);
  cyApron.position.set(0, 0.3, 0);
  coalYard.add(cyApron);

  // 3 Coal Stockpile Mounds (Faceted conic/ellipsoid mounds)
  const pile1 = new THREE.Mesh(new THREE.ConeGeometry(9, 6.5, 12), materials.coal);
  pile1.position.set(-6, 3.5, -4);
  pile1.rotation.y = 0.4;
  coalYard.add(pile1);

  const pile2 = new THREE.Mesh(new THREE.ConeGeometry(8, 5.5, 10), materials.coal);
  pile2.position.set(6, 3.0, 3);
  coalYard.add(pile2);

  const pile3 = new THREE.Mesh(new THREE.ConeGeometry(7, 4.5, 9), materials.coal);
  pile3.position.set(-5, 2.5, 7);
  coalYard.add(pile3);

  // Stacker/Reclaimer Rail Track & Stacker Tower
  const track = new THREE.Mesh(new THREE.BoxGeometry(26, 0.4, 1.2), materials.steelGalvanized);
  track.position.set(0, 0.8, -10);
  coalYard.add(track);

  const stackerBoom = new THREE.Group();
  stackerBoom.position.set(0, 1, -10);
  const stackerPost = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 6, 8), materials.structuralSteel);
  stackerPost.position.set(0, 3, 0);
  stackerBoom.add(stackerPost);
  const boomArm = new THREE.Mesh(new THREE.BoxGeometry(16, 0.6, 0.8), materials.handrails);
  boomArm.position.set(5, 5.5, 5);
  boomArm.rotation.y = 0.6;
  boomArm.rotation.z = -0.15;
  stackerBoom.add(boomArm);
  coalYard.add(stackerBoom);

  registerComp(1, coalYard);

  // #2 Coal Conveyor Belt
  const conveyor = new THREE.Group();
  conveyor.position.set(-70, 7, 30);

  // Elevated enclosed conveyor gallery truss
  const gallery = new THREE.Mesh(new THREE.BoxGeometry(32, 2.6, 2.4), materials.structuralSteel);
  gallery.rotation.z = -0.25; // inclined toward crusher
  conveyor.add(gallery);

  // Internal rubber belt visible via open truss slots
  const beltStrip = new THREE.Mesh(new THREE.BoxGeometry(32, 0.2, 1.6), materials.conveyorRubber);
  beltStrip.rotation.z = -0.25;
  beltStrip.position.set(0, 0.2, 0);
  conveyor.add(beltStrip);

  // Support Bents / Steel Pylons
  for (let px of [-10, 0, 10]) {
    const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 9, 6), materials.steelGalvanized);
    pylon.position.set(px, -4.5 + px * 0.12, 0);
    conveyor.add(pylon);
  }
  registerComp(2, conveyor);

  // #3 Coal Crusher
  const crusher = new THREE.Group();
  crusher.position.set(-52, 12, 18);

  const crusherBldg = new THREE.Mesh(new THREE.BoxGeometry(10, 14, 10), materials.industrialBuilding);
  crusherBldg.position.set(0, 0, 0);
  crusher.add(crusherBldg);

  // Ring granulator motor & drive drum
  const crusherMotor = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3.5, 12), materials.machineryCastIron);
  crusherMotor.rotation.z = Math.PI / 2;
  crusherMotor.position.set(0, 2, 5.5);
  crusher.add(crusherMotor);

  // Vibration screen discharge hopper
  const crusherHopper = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 1.5, 4, 4), materials.machineryCastIron);
  crusherHopper.position.set(0, -6, 0);
  crusher.add(crusherHopper);
  registerComp(3, crusher);

  // #4 Coal Bunker (4 Conical Silos)
  const bunker = new THREE.Group();
  bunker.position.set(-38, 22, 10);

  for (let i = 0; i < 4; i++) {
    const zOffset = (i - 1.5) * 5.5;
    const siloCyl = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 10, 16), materials.structuralSteel);
    siloCyl.position.set(0, 3, zOffset);
    bunker.add(siloCyl);

    const siloCone = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 0.6, 5, 16), materials.machineryCastIron);
    siloCone.position.set(0, -4.5, zOffset);
    bunker.add(siloCone);

    cutawayRegistry.casingMeshes.push(siloCyl);
  }
  registerComp(4, bunker);

  // #5 Coal Feeder
  const feeder = new THREE.Group();
  feeder.position.set(-38, 11, 10);

  for (let i = 0; i < 4; i++) {
    const zOffset = (i - 1.5) * 5.5;
    const feederBox = new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.8, 2.2), materials.machineryCastIron);
    feederBox.position.set(0, 0, zOffset);
    feeder.add(feederBox);

    const feederMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 8), materials.steelGalvanized);
    feederMotor.position.set(2.0, 0, zOffset);
    feederMotor.rotation.z = Math.PI / 2;
    feeder.add(feederMotor);
  }
  registerComp(5, feeder);

  // #6 Pulverizer / Coal Mill (4 Vertical Roller Bowl Mills)
  const millGroup = new THREE.Group();
  millGroup.position.set(-38, 3, 10);

  for (let i = 0; i < 4; i++) {
    const zOffset = (i - 1.5) * 5.5;
    const singleMill = new THREE.Group();
    singleMill.position.set(0, 0, zOffset);

    // Foundation plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.8, 4.2), materials.concrete);
    plinth.position.set(0, 0.4, 0);
    singleMill.add(plinth);

    // Mill bowl casing
    const millBody = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.0, 4.5, 16), materials.machineryCastIron);
    millBody.position.set(0, 3.0, 0);
    singleMill.add(millBody);

    // Classifier cone on top
    const classifier = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.8, 2.2, 16), materials.machineryCastIron);
    classifier.position.set(0, 5.8, 0);
    singleMill.add(classifier);

    // Mill motor drive gearbox
    const driveMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.2, 12), materials.pumpHousing);
    driveMotor.position.set(-2.8, 1.5, 0);
    singleMill.add(driveMotor);

    // 3 Hydraulic loading cylinder arms on exterior
    for (let a = 0; a < 3; a++) {
      const angle = (a * Math.PI * 2) / 3;
      const hydrArm = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.8, 8), materials.steelGalvanized);
      hydrArm.position.set(Math.cos(angle) * 2.1, 3.0, Math.sin(angle) * 2.1);
      singleMill.add(hydrArm);
    }

    cutawayRegistry.casingMeshes.push(millBody);
    millGroup.add(singleMill);
  }
  registerComp(6, millGroup);

  // #7 Pulverized Coal Transportation Pipes (Yellow Coding)
  const pfPipes = new THREE.Group();
  pfPipes.position.set(-28, 12, 10);

  // 8 angled yellow delivery pipes fanning from mills toward boiler corners
  for (let i = 0; i < 4; i++) {
    const zStart = (i - 1.5) * 5.5;
    for (let c = 0; c < 2; c++) {
      const zEnd = c === 0 ? -6 : 6;
      const pipeCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-10, -5, zStart),
        new THREE.Vector3(-5, 0, zStart * 0.7),
        new THREE.Vector3(2, 4, zEnd),
        new THREE.Vector3(8, 4, zEnd),
      ]);
      const pipeGeo = new THREE.TubeGeometry(pipeCurve, 20, 0.35, 8, false);
      const pipeMesh = new THREE.Mesh(pipeGeo, materials.pipeCoalFuel);
      pfPipes.add(pipeMesh);
    }
  }
  registerComp(7, pfPipes);

  // #8 Boiler Burners
  const burners = new THREE.Group();
  burners.position.set(-20, 16, 10);

  // 4 corner burner windbox columns with tilting nozzles
  const cornerOffsets = [
    [-6, -6],
    [6, -6],
    [-6, 6],
    [6, 6],
  ];

  for (let [cx, cz] of cornerOffsets) {
    const windbox = new THREE.Mesh(new THREE.BoxGeometry(1.6, 12, 1.6), materials.machineryCastIron);
    windbox.position.set(cx, 0, cz);
    burners.add(windbox);

    // 4 burner nozzle tiers per corner pointing tangentially to center vortex
    for (let t = -4; t <= 4; t += 2.5) {
      const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 1.4, 8), materials.steelGalvanized);
      nozzle.position.set(cx * 0.85, t, cz * 0.85);
      nozzle.lookAt(0, t, 0); // focus tangentially inward
      burners.add(nozzle);
    }
  }
  registerComp(8, burners);

  // ==========================================
  // B. BOILER & HEAT RECOVERY (Components 9 - 17)
  // ==========================================

  // Structural Boiler Support Framing
  const boilerFrame = new THREE.Group();
  boilerFrame.position.set(-16, 25, 10);
  const frameCols = [
    [-11, -11],
    [11, -11],
    [-11, 11],
    [11, 11],
  ];
  for (let [fx, fz] of frameCols) {
    const col = new THREE.Mesh(new THREE.BoxGeometry(1.2, 52, 1.2), materials.structuralSteel);
    col.position.set(fx, 0, fz);
    boilerFrame.add(col);
  }
  // Horizontal girders & platforms
  for (let gy of [-16, -6, 4, 14, 24]) {
    const beamX1 = new THREE.Mesh(new THREE.BoxGeometry(23, 0.8, 0.8), materials.structuralSteel);
    beamX1.position.set(0, gy, -11);
    boilerFrame.add(beamX1);
    const beamX2 = new THREE.Mesh(new THREE.BoxGeometry(23, 0.8, 0.8), materials.structuralSteel);
    beamX2.position.set(0, gy, 11);
    boilerFrame.add(beamX2);

    const platform = new THREE.Mesh(new THREE.BoxGeometry(25, 0.2, 25), materials.steelGalvanized);
    platform.position.set(0, gy - 0.4, 0);
    boilerFrame.add(platform);
  }
  root.add(boilerFrame);

  // #9 Boiler Furnace
  const furnace = new THREE.Group();
  furnace.position.set(-16, 26, 10);

  // Outer refractory/buckstay casing (part of cutaway)
  const furnaceOuter = new THREE.Mesh(new THREE.BoxGeometry(18, 38, 18), materials.furnaceCasing);
  furnaceOuter.position.set(0, 0, 0);
  furnace.add(furnaceOuter);
  cutawayRegistry.casingMeshes.push(furnaceOuter);

  // Internal glowing fireball vortex inside furnace
  const fireball = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.0, 16, 16), materials.fireballGlow);
  fireball.position.set(0, -2, 0);
  furnace.add(fireball);
  cutawayRegistry.internalMeshes.push(fireball);

  registerComp(9, furnace);

  // #10 Water-Wall Tubes
  const waterWalls = new THREE.Group();
  waterWalls.position.set(-16, 28, 10);

  // Vertical membrane tube panels lining the 4 interior furnace walls
  for (let side = 0; side < 4; side++) {
    const wallPanel = new THREE.Mesh(new THREE.BoxGeometry(16, 32, 0.3), materials.waterWallTubes);
    if (side === 0) wallPanel.position.set(0, 0, 8.2);
    if (side === 1) wallPanel.position.set(0, 0, -8.2);
    if (side === 2) {
      wallPanel.rotation.y = Math.PI / 2;
      wallPanel.position.set(8.2, 0, 0);
    }
    if (side === 3) {
      wallPanel.rotation.y = Math.PI / 2;
      wallPanel.position.set(-8.2, 0, 0);
    }
    waterWalls.add(wallPanel);
  }
  cutawayRegistry.internalMeshes.push(...waterWalls.children.map((c) => c as THREE.Mesh));
  registerComp(10, waterWalls);

  // #11 Steam Drum
  const steamDrum = new THREE.Group();
  steamDrum.position.set(-16, 46, 10);

  // Main forged pressure drum
  const drumCyl = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 18, 24), materials.steamDrum);
  drumCyl.rotation.z = Math.PI / 2;
  steamDrum.add(drumCyl);

  // Hemispherical dished heads
  const head1 = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), materials.steamDrum);
  head1.position.set(9, 0, 0);
  head1.rotation.z = -Math.PI / 2;
  steamDrum.add(head1);

  const head2 = new THREE.Mesh(new THREE.SphereGeometry(2.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), materials.steamDrum);
  head2.position.set(-9, 0, 0);
  head2.rotation.z = Math.PI / 2;
  steamDrum.add(head2);

  // Safety valves on top
  for (let vx of [-4, 0, 4]) {
    const valve = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 2.2, 8), materials.steelGalvanized);
    valve.position.set(vx, 2.8, 0);
    steamDrum.add(valve);
  }

  // Downcomer pipes dropping down to bottom waterwall headers
  for (let dx of [-6, 6]) {
    const downcomerCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(dx, -2.4, 0),
      new THREE.Vector3(dx * 1.3, -15, dx * 0.8),
      new THREE.Vector3(dx * 1.3, -35, 0),
    ]);
    const dcPipe = new THREE.Mesh(new THREE.TubeGeometry(downcomerCurve, 16, 0.6, 10, false), materials.pipeFeedwater);
    steamDrum.add(dcPipe);
  }
  registerComp(11, steamDrum);

  // #12 Superheater (Pendant tube coils across top gas pass)
  const superheater = new THREE.Group();
  superheater.position.set(-14, 38, 10);

  for (let i = 0; i < 8; i++) {
    const xPos = (i - 3.5) * 1.8;
    const pendantCoil = new THREE.Mesh(new THREE.BoxGeometry(0.2, 8, 12), materials.superheaterTubes);
    pendantCoil.position.set(xPos, 0, 0);
    superheater.add(pendantCoil);
  }
  // Upper inlet/outlet headers
  const shHeader = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 16, 12), materials.superheaterTubes);
  shHeader.rotation.z = Math.PI / 2;
  shHeader.position.set(0, 4.5, 0);
  superheater.add(shHeader);

  cutawayRegistry.internalMeshes.push(...superheater.children.map((c) => c as THREE.Mesh));
  registerComp(12, superheater);

  // #13 Reheater (Convective tube banks downstream of superheater)
  const reheater = new THREE.Group();
  reheater.position.set(-10, 36, 10);

  for (let i = 0; i < 6; i++) {
    const xPos = (i - 2.5) * 1.6;
    const rhCoil = new THREE.Mesh(new THREE.BoxGeometry(0.2, 7, 10), materials.reheaterTubes);
    rhCoil.position.set(xPos, 0, 0);
    reheater.add(rhCoil);
  }
  const rhHeader = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 12, 12), materials.reheaterTubes);
  rhHeader.rotation.z = Math.PI / 2;
  rhHeader.position.set(0, 4.0, 0);
  reheater.add(rhHeader);

  cutawayRegistry.internalMeshes.push(...reheater.children.map((c) => c as THREE.Mesh));
  registerComp(13, reheater);

  // #14 Economizer (Finned tube heat exchanger in rear boiler pass)
  const economizer = new THREE.Group();
  economizer.position.set(-6, 30, 10);

  const econBlock = new THREE.Mesh(new THREE.BoxGeometry(7, 6, 11), materials.economizerTubes);
  economizer.add(econBlock);

  // Inlet and outlet water headers
  const ecInlet = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 10, 12), materials.pipeFeedwater);
  ecInlet.position.set(3.8, -3, 0);
  economizer.add(ecInlet);

  const ecOutlet = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 10, 12), materials.pipeFeedwater);
  ecOutlet.position.set(-3.8, 3, 0);
  economizer.add(ecOutlet);

  cutawayRegistry.internalMeshes.push(econBlock);
  registerComp(14, economizer);

  // #15 Air Preheater (APH) (Ljungström Rotating Regenerative Wheel)
  const aph = new THREE.Group();
  aph.position.set(0, 20, 10);

  // Cylindrical housing
  const aphCasing = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 6.5, 24), materials.airPreheater);
  aph.add(aphCasing);

  // Central drive rotor shaft & motor
  const aphMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 2.5, 12), materials.machineryCastIron);
  aphMotor.position.set(0, 4.5, 0);
  aph.add(aphMotor);

  // Split sector hoods (gas side & air side)
  const hoodGas = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.5, 4), materials.pipeFlueGas);
  hoodGas.position.set(-2, 4.2, 0);
  aph.add(hoodGas);

  const hoodAir = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.5, 4), materials.pipeCombustionAir);
  hoodAir.position.set(2, -4.2, 0);
  aph.add(hoodAir);

  cutawayRegistry.casingMeshes.push(aphCasing);
  registerComp(15, aph);

  // #16 Forced Draft (FD) Fan
  const fdFan = new THREE.Group();
  fdFan.position.set(2, 5, 22);

  // Centrifugal scroll casing
  const fdScroll = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 2.2, 16), materials.fans);
  fdScroll.rotation.z = Math.PI / 2;
  fdFan.add(fdScroll);

  // Inlet air suction bell mouth with protective screen
  const fdBell = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.4, 1.2, 16), materials.steelGalvanized);
  fdBell.position.set(1.6, 0, 0);
  fdBell.rotation.z = Math.PI / 2;
  fdFan.add(fdBell);

  // Electric drive motor
  const fdMotor = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 3.2, 12), materials.machineryCastIron);
  fdMotor.position.set(-2.2, 0, 0);
  fdMotor.rotation.z = Math.PI / 2;
  fdFan.add(fdMotor);

  // Concrete foundation block
  const fdBase = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.2, 4.5), materials.concrete);
  fdBase.position.set(0, -2, 0);
  fdFan.add(fdBase);
  registerComp(16, fdFan);

  // #17 Induced Draft (ID) Fan (Twin Fans between ESP and Chimney)
  const idFan = new THREE.Group();
  idFan.position.set(36, 5, 10);

  for (let k = 0; k < 2; k++) {
    const zPos = (k - 0.5) * 8;
    const singleId = new THREE.Group();
    singleId.position.set(0, 0, zPos);

    const idScroll = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 2.6, 16), materials.fans);
    idScroll.rotation.z = Math.PI / 2;
    singleId.add(idScroll);

    const idMotor = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 3.8, 12), materials.machineryCastIron);
    idMotor.position.set(-2.6, 0, 0);
    idMotor.rotation.z = Math.PI / 2;
    singleId.add(idMotor);

    const idBase = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.2, 5.0), materials.concrete);
    idBase.position.set(0, -2.2, 0);
    singleId.add(idBase);

    idFan.add(singleId);
  }
  registerComp(17, idFan);

  // ==========================================
  // C. TURBINE & ELECTRICAL GENERATION (18 - 25)
  // ==========================================

  // Open Industrial Portal Frame & Crane Runway (no solid opaque roof hiding equipment)
  const turbineHall = new THREE.Group();
  turbineHall.position.set(0, 12, -22);

  // Portal columns and open roof truss rafters
  for (let px of [-26, -13, 0, 13, 26]) {
    const pColF = new THREE.Mesh(new THREE.BoxGeometry(0.8, 18, 0.8), materials.structuralSteel);
    pColF.position.set(px, -2, 11);
    turbineHall.add(pColF);

    const pColB = new THREE.Mesh(new THREE.BoxGeometry(0.8, 18, 0.8), materials.structuralSteel);
    pColB.position.set(px, -2, -11);
    turbineHall.add(pColB);

    // Open roof rafter beam
    const rafter = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 23), materials.structuralSteel);
    rafter.position.set(px, 7, 0);
    turbineHall.add(rafter);
  }
  // Overhead EOT Crane Runway Beams & Crane Trolley
  const craneBeam1 = new THREE.Mesh(new THREE.BoxGeometry(56, 0.8, 0.8), materials.handrails);
  craneBeam1.position.set(0, 5.5, 9.5);
  turbineHall.add(craneBeam1);

  const craneBeam2 = new THREE.Mesh(new THREE.BoxGeometry(56, 0.8, 0.8), materials.handrails);
  craneBeam2.position.set(0, 5.5, -9.5);
  turbineHall.add(craneBeam2);

  const craneTrolley = new THREE.Mesh(new THREE.BoxGeometry(6, 1.2, 19), materials.handrails);
  craneTrolley.position.set(-6, 6.2, 0);
  turbineHall.add(craneTrolley);

  root.add(turbineHall);

  // #18 High-Pressure (HP) Steam Turbine
  const hpTurbine = new THREE.Group();
  hpTurbine.position.set(-16, 12, -22);

  const hpCasing = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 6.2, 16), materials.turbineCasing);
  hpCasing.rotation.z = Math.PI / 2;
  hpTurbine.add(hpCasing);

  // Emergency Stop Valves & Governor Valves on steam chest
  const hpChest = new THREE.Mesh(new THREE.BoxGeometry(2.8, 3.2, 3.8), materials.machineryCastIron);
  hpChest.position.set(0, 2.4, 0);
  hpTurbine.add(hpChest);

  // Internal HP Rotor & Blading
  const hpRotor = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 5.8, 16), materials.turbineRotor);
  hpRotor.rotation.z = Math.PI / 2;
  hpTurbine.add(hpRotor);
  cutawayRegistry.casingMeshes.push(hpCasing);
  cutawayRegistry.internalMeshes.push(hpRotor);

  registerComp(18, hpTurbine);

  // #19 Intermediate-Pressure (IP) Steam Turbine
  const ipTurbine = new THREE.Group();
  ipTurbine.position.set(-8, 12, -22);

  // Symmetrical double-flow casing
  const ipCasing = new THREE.Mesh(new THREE.CylinderGeometry(3.0, 3.0, 7.4, 16), materials.turbineCasing);
  ipCasing.rotation.z = Math.PI / 2;
  ipTurbine.add(ipCasing);

  // Reheat Intercept Valve Bodies
  const ipValve1 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.2, 8), materials.machineryCastIron);
  ipValve1.position.set(0, 2.6, 2.2);
  ipTurbine.add(ipValve1);

  // Internal IP Rotor
  const ipRotor = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 7.0, 16), materials.turbineRotor);
  ipRotor.rotation.z = Math.PI / 2;
  ipTurbine.add(ipRotor);

  cutawayRegistry.casingMeshes.push(ipCasing);
  cutawayRegistry.internalMeshes.push(ipRotor);
  registerComp(19, ipTurbine);

  // #20 Low-Pressure (LP) Steam Turbine
  const lpTurbine = new THREE.Group();
  lpTurbine.position.set(2, 12, -22);

  // Massive outer exhaust hood with dual expansion bells
  const lpCasing = new THREE.Mesh(new THREE.BoxGeometry(10, 6.5, 7.5), materials.turbineCasing);
  lpTurbine.add(lpCasing);

  // Crossover steam pipe entering LP turbine from IP turbine
  const crossover = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 4.2, 12), materials.pipeSteamHot);
  crossover.rotation.z = Math.PI / 2;
  crossover.position.set(-4.5, 3.6, 0);
  lpTurbine.add(crossover);

  // Internal LP Rotor with free-standing long blades
  const lpRotor = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 9.2, 16), materials.turbineRotor);
  lpRotor.rotation.z = Math.PI / 2;
  lpTurbine.add(lpRotor);

  // Last-stage titanium blade disks
  for (let bx of [-3.2, -1.2, 1.2, 3.2]) {
    const bladeDisk = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 0.4, 20), materials.turbineBlades);
    bladeDisk.rotation.z = Math.PI / 2;
    bladeDisk.position.set(bx, 0, 0);
    lpTurbine.add(bladeDisk);
    cutawayRegistry.internalMeshes.push(bladeDisk);
  }

  cutawayRegistry.casingMeshes.push(lpCasing);
  cutawayRegistry.internalMeshes.push(lpRotor);
  registerComp(20, lpTurbine);

  // #21 Turbine Connecting Shafts & Bearings
  const shafts = new THREE.Group();
  shafts.position.set(-7, 10.5, -22);

  // Tandem continuous shaft spanning HP to Generator
  const shaftRod = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 38, 16), materials.turbineRotor);
  shaftRod.rotation.z = Math.PI / 2;
  shaftRod.position.set(7, 1.5, 0);
  shafts.add(shaftRod);

  // Pedestal sleeve bearings between cylinders
  for (let px of [-9, -1, 7, 15]) {
    const bearingPedestal = new THREE.Mesh(new THREE.BoxGeometry(1.6, 3.2, 2.6), materials.machineryCastIron);
    bearingPedestal.position.set(px, 0.5, 0);
    shafts.add(bearingPedestal);
  }

  // Barring / Turning gear motor drive
  const barringMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.8, 8), materials.pumpHousing);
  barringMotor.position.set(11, 2.2, 1.8);
  shafts.add(barringMotor);

  registerComp(21, shafts);

  // #22 Electrical Generator
  const generator = new THREE.Group();
  generator.position.set(16, 11, -22);

  // Cylindrical Stator Casing in emerald green
  const stator = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 10.5, 20), materials.generatorStator);
  stator.rotation.z = Math.PI / 2;
  generator.add(stator);

  // Hydrogen gas cooler dome housings on top
  const h2Cooler = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.8, 4.2), materials.machineryCastIron);
  h2Cooler.position.set(0, 3.2, 0);
  generator.add(h2Cooler);

  // Brushless exciter housing at rear end
  const exciter = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 3.2, 16), materials.machineryCastIron);
  exciter.position.set(6.4, 0, 0);
  exciter.rotation.z = Math.PI / 2;
  generator.add(exciter);

  // Heavy concrete foundation table
  const genPlinth = new THREE.Mesh(new THREE.BoxGeometry(14, 4.0, 7.5), materials.concrete);
  genPlinth.position.set(0, -3.5, 0);
  generator.add(genPlinth);

  cutawayRegistry.casingMeshes.push(stator);
  registerComp(22, generator);

  // #23 Generator Transformer (Step-up from 22 kV to 400 kV)
  const transformer = new THREE.Group();
  transformer.position.set(30, 8, -22);

  // Main oil tank
  const transTank = new THREE.Mesh(new THREE.BoxGeometry(6.5, 7.0, 5.5), materials.transformerTank);
  transformer.add(transTank);

  // External cooling radiator bank panels
  const rad1 = new THREE.Mesh(new THREE.BoxGeometry(6.0, 5.5, 1.2), materials.transformerRadiator);
  rad1.position.set(0, 0, 3.4);
  transformer.add(rad1);

  const rad2 = new THREE.Mesh(new THREE.BoxGeometry(6.0, 5.5, 1.2), materials.transformerRadiator);
  rad2.position.set(0, 0, -3.4);
  transformer.add(rad2);

  // Overhead oil conservator drum
  const conservator = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 4.5, 12), materials.steelGalvanized);
  conservator.rotation.z = Math.PI / 2;
  conservator.position.set(0, 4.8, -1.8);
  transformer.add(conservator);

  // Three 400 kV glazed porcelain high-voltage bushings
  for (let bx of [-1.8, 0, 1.8]) {
    const bushing = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 3.4, 8), materials.electricalBushings);
    bushing.position.set(bx, 4.8, 1.0);
    bushing.rotation.x = 0.2;
    transformer.add(bushing);
  }

  // Fire blast barrier wall
  const blastWall = new THREE.Mesh(new THREE.BoxGeometry(0.8, 12, 10), materials.concrete);
  blastWall.position.set(-4.5, 2, 0);
  transformer.add(blastWall);

  registerComp(23, transformer);

  // #24 Switchyard (Outdoor 400 kV Substation)
  const switchyard = new THREE.Group();
  switchyard.position.set(48, 9, -22);

  // Substation gravel/concrete pad
  const subPad = new THREE.Mesh(new THREE.BoxGeometry(24, 0.4, 20), materials.concreteSmooth);
  subPad.position.set(0, -8.8, 0);
  switchyard.add(subPad);

  // 3 SF6 Circuit Breaker columns
  for (let i = 0; i < 3; i++) {
    const xPos = (i - 1) * 6;
    const sf6Pole = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 6, 8), materials.electricalBushings);
    sf6Pole.position.set(xPos, -4, 2);
    switchyard.add(sf6Pole);

    // Pantograph disconnector
    const disconn = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 2), materials.steelGalvanized);
    disconn.position.set(xPos, -0.5, -2);
    switchyard.add(disconn);
  }

  // Gantry structural lattice frame
  const gantryBar = new THREE.Mesh(new THREE.BoxGeometry(20, 0.8, 0.8), materials.steelGalvanized);
  gantryBar.position.set(0, 3, 0);
  switchyard.add(gantryBar);

  const gantryP1 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 14, 0.8), materials.steelGalvanized);
  gantryP1.position.set(-10, -3.5, 0);
  switchyard.add(gantryP1);

  const gantryP2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 14, 0.8), materials.steelGalvanized);
  gantryP2.position.set(10, -3.5, 0);
  switchyard.add(gantryP2);

  // Overhead high-voltage aluminum busbars (Green coded)
  for (let b = 0; b < 3; b++) {
    const busbar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 22, 8), materials.pipeElectrical);
    busbar.rotation.z = Math.PI / 2;
    busbar.position.set(0, 2.5, (b - 1) * 3);
    switchyard.add(busbar);
  }
  registerComp(24, switchyard);

  // #25 Electricity Transmission Lines & Pylons
  const transmission = new THREE.Group();
  transmission.position.set(65, 18, -22);

  // 400 kV Galvanized Steel Lattice Transmission Tower
  const pylonHeight = 32;
  const towerBase = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 3.2, pylonHeight, 4), materials.steelGalvanized);
  towerBase.position.set(0, -2, 0);
  towerBase.rotation.y = Math.PI / 4;
  transmission.add(towerBase);

  // Crossarms carrying conductor bundle strings
  for (let arm of [4, 9, 13]) {
    const crossarm = new THREE.Mesh(new THREE.BoxGeometry(10, 0.6, 0.8), materials.steelGalvanized);
    crossarm.position.set(0, arm, 0);
    transmission.add(crossarm);

    // Suspension insulator strings hanging down
    for (let end of [-4.5, 4.5]) {
      const insulator = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 2.2, 8), materials.electricalBushings);
      insulator.position.set(end, arm - 1.2, 0);
      transmission.add(insulator);
    }
  }

  // Outgoing Quad-Bundle ACSR Conductor Cables (Green coded)
  for (let c = 0; c < 3; c++) {
    const cableCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-14, 4 + c * 4, (c - 1) * 4),
      new THREE.Vector3(0, 3.5 + c * 4, (c - 1) * 4),
      new THREE.Vector3(25, 2.0 + c * 4, (c - 1) * 4),
    ]);
    const cableMesh = new THREE.Mesh(new THREE.TubeGeometry(cableCurve, 16, 0.12, 6, false), materials.pipeElectrical);
    transmission.add(cableMesh);
  }
  registerComp(25, transmission);

  // ==========================================
  // D. CONDENSATE & FEEDWATER SYSTEM (26 - 32)
  // ==========================================

  // #26 Surface Condenser
  const condenser = new THREE.Group();
  condenser.position.set(2, 3, -22);

  // Rectangular outer shell under LP turbine
  const condShell = new THREE.Mesh(new THREE.BoxGeometry(11, 5.5, 7.8), materials.condenserShell);
  condShell.position.set(0, 0, 0);
  condenser.add(condShell);

  // Dual Divided Waterboxes at ends
  const wb1 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.5, 7.2), materials.pipeCoolingWater);
  wb1.position.set(5.8, 0, 0);
  condenser.add(wb1);

  const wb2 = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.5, 7.2), materials.pipeCoolingWater);
  wb2.position.set(-5.8, 0, 0);
  condenser.add(wb2);

  // Hotwell sump at bottom collecting pure condensate
  const hotwell = new THREE.Mesh(new THREE.BoxGeometry(7.0, 1.6, 4.5), materials.pipeFeedwater);
  hotwell.position.set(0, -3.2, 0);
  condenser.add(hotwell);

  // Internal Cooling Tube Bundle (visible in cutaway)
  const tubeBundle = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.4, 9.8, 16), materials.condenserTubes);
  tubeBundle.rotation.z = Math.PI / 2;
  tubeBundle.position.set(0, 0.2, 0);
  condenser.add(tubeBundle);

  cutawayRegistry.casingMeshes.push(condShell);
  cutawayRegistry.internalMeshes.push(tubeBundle);
  registerComp(26, condenser);

  // #27 Condensate Extraction Pump (CEP)
  const cep = new THREE.Group();
  cep.position.set(5, 1, -16);

  for (let k = 0; k < 2; k++) {
    const xPos = (k - 0.5) * 3;
    const can = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.5, 12), materials.pumpHousing);
    can.position.set(xPos, 0, 0);
    cep.add(can);

    const cepMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.4, 12), materials.steelGalvanized);
    cepMotor.position.set(xPos, 1.8, 0);
    cep.add(cepMotor);
  }
  registerComp(27, cep);

  // #28 LP Feedwater Heater
  const lpHtr = new THREE.Group();
  lpHtr.position.set(-2, 4, -14);

  const lpHtrShell = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 6.5, 16), materials.feedwaterHeaters);
  lpHtrShell.rotation.z = Math.PI / 2;
  lpHtr.add(lpHtrShell);

  // Steam extraction bleed nozzle
  const lpNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.2, 8), materials.pipeSteamHot);
  lpNozzle.position.set(0, 1.5, 0);
  lpHtr.add(lpNozzle);

  cutawayRegistry.casingMeshes.push(lpHtrShell);
  registerComp(28, lpHtr);

  // #29 Deaerator (Horizontal storage tank + vertical scrubbing dome)
  const deaerator = new THREE.Group();
  deaerator.position.set(-14, 22, -14);

  // Horizontal storage vessel
  const daTank = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 12, 16), materials.deaeratorTank);
  daTank.rotation.z = Math.PI / 2;
  deaerator.add(daTank);

  // Hemispherical ends
  const daEnd1 = new THREE.Mesh(new THREE.SphereGeometry(2.0, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), materials.deaeratorTank);
  daEnd1.position.set(6, 0, 0);
  daEnd1.rotation.z = -Math.PI / 2;
  deaerator.add(daEnd1);

  const daEnd2 = new THREE.Mesh(new THREE.SphereGeometry(2.0, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), materials.deaeratorTank);
  daEnd2.position.set(-6, 0, 0);
  daEnd2.rotation.z = Math.PI / 2;
  deaerator.add(daEnd2);

  // Vertical scrubbing dome column
  const daDome = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 4.2, 16), materials.deaeratorTank);
  daDome.position.set(0, 3.5, 0);
  deaerator.add(daDome);

  // Extraction steam inlet on top of dome
  const daSteamIn = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.5, 8), materials.pipeSteamHot);
  daSteamIn.position.set(0, 6.0, 0);
  deaerator.add(daSteamIn);

  cutawayRegistry.casingMeshes.push(daTank, daDome);
  registerComp(29, deaerator);

  // #30 Boiler Feed Pump (BFP)
  const bfp = new THREE.Group();
  bfp.position.set(-14, 2, -14);

  for (let k = 0; k < 2; k++) {
    const xPos = (k - 0.5) * 4;
    const bfpGroup = new THREE.Group();
    bfpGroup.position.set(xPos, 0, 0);

    // Multistage barrel pump body
    const pumpBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 3.2, 12), materials.machineryCastIron);
    pumpBarrel.rotation.z = Math.PI / 2;
    pumpBarrel.position.set(-1.8, 1.0, 0);
    bfpGroup.add(pumpBarrel);

    // Heavy electric drive motor (12 MW)
    const bfpMotor = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 4.0, 16), materials.pumpHousing);
    bfpMotor.rotation.z = Math.PI / 2;
    bfpMotor.position.set(2.2, 1.2, 0);
    bfpGroup.add(bfpMotor);

    // Foundation inertia base
    const bfpBase = new THREE.Mesh(new THREE.BoxGeometry(8.5, 1.0, 3.2), materials.concrete);
    bfpBase.position.set(0, 0, 0);
    bfpGroup.add(bfpBase);

    bfp.add(bfpGroup);
  }
  registerComp(30, bfp);

  // #31 HP Feedwater Heater
  const hpHtr = new THREE.Group();
  hpHtr.position.set(-14, 8, -6);

  const hpHtrShell = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 6.2, 16), materials.feedwaterHeaters);
  hpHtr.add(hpHtrShell);

  const hpCap = new THREE.Mesh(new THREE.SphereGeometry(1.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), materials.feedwaterHeaters);
  hpCap.position.set(0, 3.1, 0);
  hpHtr.add(hpCap);

  cutawayRegistry.casingMeshes.push(hpHtrShell);
  registerComp(31, hpHtr);

  // #32 Feedwater Piping
  const fwPiping = new THREE.Group();
  fwPiping.position.set(-10, 18, 2);

  const fwCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-4, -8, -8),
    new THREE.Vector3(-4, 0, -4),
    new THREE.Vector3(0, 6, 0),
    new THREE.Vector3(4, 12, 8),
  ]);
  const fwPipeMesh = new THREE.Mesh(new THREE.TubeGeometry(fwCurve, 24, 0.45, 10, false), materials.pipeFeedwater);
  fwPiping.add(fwPipeMesh);

  // Valve handwheels and insulation collars
  for (let vy of [-4, 4]) {
    const valveRing = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.08, 8, 16), materials.handrails);
    valveRing.position.set(-2, vy, -2);
    valveRing.rotation.x = Math.PI / 2;
    fwPiping.add(valveRing);
  }
  registerComp(32, fwPiping);

  // ==========================================
  // E. COOLING WATER SYSTEM (33 - 38)
  // ==========================================

  // #33 Cooling Tower (Hyperbolic Concrete Tower)
  const coolingTower = new THREE.Group();
  coolingTower.position.set(42, 0, 45);

  // Hyperbolic shell generated via LatheGeometry
  const towerHeight = 58;
  const points: THREE.Vector2[] = [];
  for (let i = 0; i <= 30; i++) {
    const y = (i / 30) * towerHeight;
    // Hyperbola profile: wider at base, narrowing at throat (y ~ 42), flare at rim
    const r = 18 - 8 * Math.sin((y / towerHeight) * 2.2) + Math.pow(y / towerHeight, 3) * 4;
    points.push(new THREE.Vector2(Math.max(8, r), y));
  }
  const towerGeo = new THREE.LatheGeometry(points, 32);
  const towerMesh = new THREE.Mesh(towerGeo, materials.coolingTowerConcrete);
  coolingTower.add(towerMesh);

  // Diagonal support columns around perimeter air inlet opening
  for (let c = 0; c < 24; c++) {
    const angle = (c * Math.PI * 2) / 24;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 4.5, 8), materials.concrete);
    leg.position.set(Math.cos(angle) * 17.5, 2.2, Math.sin(angle) * 17.5);
    leg.rotation.z = Math.cos(angle) * 0.2;
    leg.rotation.x = Math.sin(angle) * 0.2;
    coolingTower.add(leg);
  }

  // Internal distribution flume & PVC fill matrix
  const fillMatrix = new THREE.Mesh(new THREE.CylinderGeometry(15, 15, 3.5, 24), materials.coolingFill);
  fillMatrix.position.set(0, 5.0, 0);
  coolingTower.add(fillMatrix);

  // Evaporative vapor plume billowing from top rim
  const vaporPlume = new THREE.Mesh(
    new THREE.CylinderGeometry(12, 9, 14, 16, 1, true),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  vaporPlume.position.set(0, towerHeight + 6, 0);
  coolingTower.add(vaporPlume);

  cutawayRegistry.casingMeshes.push(towerMesh);
  cutawayRegistry.internalMeshes.push(fillMatrix);
  registerComp(33, coolingTower);

  // #34 Cooling Water Basin
  const cwBasin = new THREE.Group();
  cwBasin.position.set(42, 1, 45);

  const basinFloor = new THREE.Mesh(new THREE.CylinderGeometry(19, 19, 1.2, 32), materials.concrete);
  basinFloor.position.set(0, -0.6, 0);
  cwBasin.add(basinFloor);

  const basinWater = new THREE.Mesh(new THREE.CylinderGeometry(18.4, 18.4, 0.6, 32), materials.coolingWaterSurface);
  basinWater.position.set(0, 0.2, 0);
  cwBasin.add(basinWater);
  registerComp(34, cwBasin);

  // #35 Circulating Water Pump (CWP) House & Vertical Pumps
  const cwp = new THREE.Group();
  cwp.position.set(28, 2, 38);

  const cwpHouse = new THREE.Mesh(new THREE.BoxGeometry(10, 4, 7), materials.industrialBuilding);
  cwpHouse.position.set(0, 1.5, 0);
  cwp.add(cwpHouse);

  for (let k = 0; k < 2; k++) {
    const zPos = (k - 0.5) * 3.5;
    const cwpMotor = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 3.2, 12), materials.pumpHousing);
    cwpMotor.position.set(2, 3.8, zPos);
    cwp.add(cwpMotor);
  }
  registerComp(35, cwp);

  // #36 Condenser Cooling-Water Inlet Pipe (Blue Coded)
  const cwInlet = new THREE.Group();
  cwInlet.position.set(14, 1.5, 8);

  const inCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(12, 0, 26),
    new THREE.Vector3(6, 0, 12),
    new THREE.Vector3(-6, 0, -10),
    new THREE.Vector3(-7.5, 0.5, -26),
  ]);
  const inPipe = new THREE.Mesh(new THREE.TubeGeometry(inCurve, 24, 0.75, 12, false), materials.pipeCoolingWater);
  cwInlet.add(inPipe);
  registerComp(36, cwInlet);

  // #37 Condenser Cooling-Water Outlet Pipe (Blue Coded)
  const cwOutlet = new THREE.Group();
  cwOutlet.position.set(12, 2.5, -4);

  const outCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-5, -0.5, -16),
    new THREE.Vector3(0, 0, -10),
    new THREE.Vector3(8, 0, 2),
    new THREE.Vector3(12, 1, 14),
  ]);
  const outPipe = new THREE.Mesh(new THREE.TubeGeometry(outCurve, 20, 0.75, 12, false), materials.pipeCoolingWater);
  cwOutlet.add(outPipe);
  registerComp(37, cwOutlet);

  // #38 Cooling-Water Return Pipeline
  const cwReturn = new THREE.Group();
  cwReturn.position.set(28, 6, 20);

  const retCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-4, -2.5, -2),
    new THREE.Vector3(4, 0, 8),
    new THREE.Vector3(10, 2, 18),
    new THREE.Vector3(14, 3, 24),
  ]);
  const retPipe = new THREE.Mesh(new THREE.TubeGeometry(retCurve, 20, 0.75, 12, false), materials.pipeCoolingWater);
  cwReturn.add(retPipe);

  // Pylon supports along return line
  for (let s of [-2, 6]) {
    const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 5, 6), materials.steelGalvanized);
    pylon.position.set(s, -2.5, s * 1.5 + 4);
    cwReturn.add(pylon);
  }
  registerComp(38, cwReturn);

  // ==========================================
  // F. FLUE GAS & POLLUTION CONTROL (39 - 44)
  // ==========================================

  // #39 Electrostatic Precipitator (ESP)
  const esp = new THREE.Group();
  esp.position.set(22, 14, 10);

  // Twin large casing chambers
  const espChamber = new THREE.Mesh(new THREE.BoxGeometry(16, 12, 15), materials.espCasing);
  esp.add(espChamber);

  // High-Voltage Transformer-Rectifier (TR) Sets on roof
  for (let r = 0; r < 4; r++) {
    const rx = (r % 2 - 0.5) * 8;
    const rz = (Math.floor(r / 2) - 0.5) * 8;
    const trSet = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.0, 2.4), materials.machineryCastIron);
    trSet.position.set(rx, 7, rz);
    esp.add(trSet);
  }

  // Internal collecting plate curtains & emitting discharge wires
  for (let p = -5; p <= 5; p += 2.2) {
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.1, 9.5, 13), materials.steelGalvanized);
    plate.position.set(p, -0.5, 0);
    esp.add(plate);
    cutawayRegistry.internalMeshes.push(plate);
  }

  cutawayRegistry.casingMeshes.push(espChamber);
  registerComp(39, esp);

  // #40 Dust Collection Equipment (Hoppers under ESP)
  const dustEquip = new THREE.Group();
  dustEquip.position.set(22, 5, 10);

  // 8 Pyramidal hoppers under ESP
  for (let hx of [-5, 0, 5]) {
    for (let hz of [-4, 4]) {
      const hopper = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 0.4, 4.5, 4), materials.espHoppers);
      hopper.position.set(hx, 0, hz);
      hopper.rotation.y = Math.PI / 4;
      dustEquip.add(hopper);

      // Rotary airlock valve
      const airlock = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.8, 8), materials.machineryCastIron);
      airlock.position.set(hx, -2.6, hz);
      dustEquip.add(airlock);
    }
  }
  registerComp(40, dustEquip);

  // #41 Chimney / Exhaust Stack
  const chimney = new THREE.Group();
  chimney.position.set(52, 45, 10);

  // Tapered tall aerodynamic reinforced concrete stack (240 m scale ~85 units)
  const stackHeight = 85;
  const stack = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 6.2, stackHeight, 32, 1, true), materials.chimneyConcrete);
  chimney.add(stack);

  // Red and white aviation warning rings at top
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(2.65, 0.15, 8, 32), materials.superheaterTubes);
  ring1.rotation.x = Math.PI / 2;
  ring1.position.set(0, stackHeight / 2 - 2, 0);
  chimney.add(ring1);

  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.15, 8, 32), materials.pipeCombustionAir);
  ring2.rotation.x = Math.PI / 2;
  ring2.position.set(0, stackHeight / 2 - 8, 0);
  chimney.add(ring2);

  // Chimney concrete foundation ring
  const chimBase = new THREE.Mesh(new THREE.CylinderGeometry(8.5, 9.5, 4.0, 32), materials.concrete);
  chimBase.position.set(0, -stackHeight / 2 + 2, 0);
  chimney.add(chimBase);
  registerComp(41, chimney);

  // #42 Fly Ash Handling System
  const flyAsh = new THREE.Group();
  flyAsh.position.set(34, 4, 18);

  // Pneumatic pressure transmitter tanks
  for (let k = 0; k < 2; k++) {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 2.5, 12), materials.machineryCastIron);
    pot.position.set((k - 0.5) * 3, 0, 0);
    flyAsh.add(pot);
  }
  // Conveying pipe running to ash silo (Grey coded)
  const ashPipeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(6, 4, 4),
    new THREE.Vector3(14, 8, 8),
  ]);
  const ashPipeMesh = new THREE.Mesh(new THREE.TubeGeometry(ashPipeCurve, 16, 0.25, 8, false), materials.pipeAshExhaust);
  flyAsh.add(ashPipeMesh);
  registerComp(42, flyAsh);

  // #43 Bottom Ash Handling System
  const bottomAsh = new THREE.Group();
  bottomAsh.position.set(-16, 2, 10);

  // Submerged Scraper Conveyor (SSC) water-filled trough under furnace
  const sscTrough = new THREE.Mesh(new THREE.BoxGeometry(14, 1.8, 6.0), materials.machineryCastIron);
  sscTrough.position.set(0, 0, 0);
  bottomAsh.add(sscTrough);

  // Inclined dewatering ramp
  const dewaterRamp = new THREE.Mesh(new THREE.BoxGeometry(8, 1.2, 3.2), materials.machineryCastIron);
  dewaterRamp.position.set(9.5, 2.2, 0);
  dewaterRamp.rotation.z = 0.45;
  bottomAsh.add(dewaterRamp);

  // Clinker grinder / roll crusher
  const clinkerCrusher = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.0, 2.5), materials.structuralSteel);
  clinkerCrusher.position.set(13.5, 4.2, 0);
  bottomAsh.add(clinkerCrusher);
  registerComp(43, bottomAsh);

  // #44 Ash Storage Silo
  const ashSilo = new THREE.Group();
  ashSilo.position.set(52, 14, 28);

  for (let s = 0; s < 2; s++) {
    const xPos = (s - 0.5) * 9;
    const siloCyl = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 16, 20), materials.ashSilo);
    siloCyl.position.set(xPos, 0, 0);
    ashSilo.add(siloCyl);

    const siloRoof = new THREE.Mesh(new THREE.ConeGeometry(3.8, 2.2, 20), materials.structuralSteel);
    siloRoof.position.set(xPos, 9, 0);
    ashSilo.add(siloRoof);

    // Telescopic truck loading chute underneath
    const chute = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 3.2, 12), materials.steelGalvanized);
    chute.position.set(xPos, -9.5, 0);
    ashSilo.add(chute);

    // Support legs elevating silo for truck drive-through
    for (let leg = 0; leg < 4; leg++) {
      const angle = (leg * Math.PI) / 2 + Math.PI / 4;
      const legMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 6.5, 8), materials.concrete);
      legMesh.position.set(xPos + Math.cos(angle) * 3.2, -10.5, Math.sin(angle) * 3.2);
      ashSilo.add(legMesh);
    }
  }
  registerComp(44, ashSilo);

  // ==========================================
  // G. WATER TREATMENT SYSTEM (45 - 50)
  // ==========================================

  // #45 Raw Water Intake from River
  const intake = new THREE.Group();
  intake.position.set(-65, 0, -45);

  // Pump house structure on riverbank
  const intakeHouse = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 8), materials.concrete);
  intakeHouse.position.set(0, 2.5, 0);
  intake.add(intakeHouse);

  // Trash rack bars in water
  const trashRack = new THREE.Mesh(new THREE.BoxGeometry(7, 3.5, 0.4), materials.steelGalvanized);
  trashRack.position.set(0, 0.5, -4.2);
  intake.add(trashRack);

  // Raw water pump motor heads on deck
  for (let k = 0; k < 2; k++) {
    const rwPump = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.8, 12), materials.pumpHousing);
    rwPump.position.set((k - 0.5) * 3, 5.5, 0);
    intake.add(rwPump);
  }
  registerComp(45, intake);

  // #46 Water Treatment Plant (Clariflocculator)
  const wtp = new THREE.Group();
  wtp.position.set(-50, 2, -45);

  // Circular concrete clarifier basin
  const clarifierBasin = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 7.5, 2.8, 32), materials.clarifierConcrete);
  wtp.add(clarifierBasin);

  // Water inside basin
  const clarWater = new THREE.Mesh(new THREE.CylinderGeometry(7.2, 7.2, 1.0, 32), materials.coolingWaterSurface);
  clarWater.position.set(0, 0.5, 0);
  wtp.add(clarWater);

  // Central flocculation well
  const flocWell = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 3.2, 16), materials.machineryCastIron);
  flocWell.position.set(0, 0.8, 0);
  wtp.add(flocWell);

  // Rotating bridge & scraper truss
  const scraperBridge = new THREE.Mesh(new THREE.BoxGeometry(15, 0.6, 1.0), materials.handrails);
  scraperBridge.position.set(0, 2.0, 0);
  wtp.add(scraperBridge);

  cutawayRegistry.casingMeshes.push(clarifierBasin);
  registerComp(46, wtp);

  // #47 Filtration Unit (Dual Media Pressure Filters)
  const filterUnit = new THREE.Group();
  filterUnit.position.set(-36, 3, -45);

  for (let f = 0; f < 3; f++) {
    const fz = (f - 1) * 3.8;
    const filterVessel = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 4.0, 16), materials.filterTanks);
    filterVessel.position.set(0, 0, fz);
    filterUnit.add(filterVessel);

    const fCap = new THREE.Mesh(new THREE.SphereGeometry(1.3, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), materials.filterTanks);
    fCap.position.set(0, 2.0, fz);
    filterUnit.add(fCap);

    // Front valve manifold
    const vPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3.6, 8), materials.steelGalvanized);
    vPipe.position.set(1.6, 0, fz);
    filterUnit.add(vPipe);
  }
  registerComp(47, filterUnit);

  // #48 Demineralization Plant (DM Plant / Cation-Anion-Mixed Bed)
  const dmPlant = new THREE.Group();
  dmPlant.position.set(-22, 4, -45);

  // DM Plant building housing ion-exchange trains
  const dmBuilding = new THREE.Mesh(new THREE.BoxGeometry(10, 7, 12), materials.industrialBuilding);
  dmBuilding.position.set(0, 0, 0);
  dmPlant.add(dmBuilding);

  // External regeneration acid/alkali bulk storage tanks
  const acidTank = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 4.5, 16), materials.dmVessels);
  acidTank.position.set(6.5, 0, -3);
  dmPlant.add(acidTank);

  const alkaliTank = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 4.5, 16), materials.dmVessels);
  alkaliTank.position.set(6.5, 0, 3);
  dmPlant.add(alkaliTank);

  cutawayRegistry.casingMeshes.push(dmBuilding);
  registerComp(48, dmPlant);

  // #49 Treated-Water Storage Tank
  const treatedTank = new THREE.Group();
  treatedTank.position.set(-8, 6, -45);

  const dmStorage = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 9.5, 24), materials.treatedWaterTank);
  treatedTank.add(dmStorage);

  const dmDome = new THREE.Mesh(new THREE.SphereGeometry(4.55, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), materials.treatedWaterTank);
  dmDome.position.set(0, 4.75, 0);
  treatedTank.add(dmDome);
  registerComp(49, treatedTank);

  // #50 Makeup-Water Pipeline (Stainless steel pipeline to cycle)
  const makeupPipe = new THREE.Group();
  makeupPipe.position.set(-8, 8, -28);

  const muCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -2, -14),
    new THREE.Vector3(0, 0, -6),
    new THREE.Vector3(-4, 4, 4),
    new THREE.Vector3(-6, 12, 12),
  ]);
  const muMesh = new THREE.Mesh(new THREE.TubeGeometry(muCurve, 20, 0.28, 8, false), materials.steelGalvanized);
  makeupPipe.add(muMesh);
  registerComp(50, makeupPipe);

  return { rootGroup: root, componentMap, cutawayRegistry };
}
