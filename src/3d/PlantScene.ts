/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createPlantMaterials, PlantMaterials } from './materials';
import { buildPlantScene, ComponentMeshRegistry, CutawayRegistry } from './proceduralGeometries';
import { buildPipelineNetwork, PipeRoute, updatePipelineFlow } from './pipelines';
import { buildPinMarkers, PinMarker } from './pinMarkers';
import { FlowCircuit } from '../types/plant';
import { PLANT_COMPONENTS } from '../data/plantComponents';

export interface SceneCallbacks {
  onSelectComponent: (id: number | null) => void;
  onHoverComponent?: (id: number | null) => void;
}

export class PlantSceneManager {
  private container: HTMLDivElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;

  private materials!: PlantMaterials;
  private componentMap!: ComponentMeshRegistry;
  private cutawayRegistry!: CutawayRegistry;
  private pipeRoutes!: PipeRoute[];
  private pins!: PinMarker[];
  private pinGroup!: THREE.Group;
  private pipelineGroup!: THREE.Group;

  private isSoftwareGl: boolean = false;
  private frameId: number = 0;
  private clock = new THREE.Clock();
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  // Camera interpolation state: elevated south perspective looking across full plant
  private targetCamPos = new THREE.Vector3(-15, 68, -85);
  private targetLookAt = new THREE.Vector3(2, 16, 5);
  private currentLookAt = new THREE.Vector3(2, 16, 5);
  private isTransitioningCam: boolean = false;

  private callbacks: SceneCallbacks;
  private selectedComponentId: number | null = null;
  private hoveredComponentId: number | null = null;

  // View settings
  private cutawayFactor: number = 0.0; // 0 = fully closed, 1 = exploded cutaway
  private activeCircuit: FlowCircuit = 'all';
  private showPins: boolean = true;

  constructor(container: HTMLDivElement, callbacks: SceneCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.init();
  }

  private init() {
    // 1. Detect Software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize Renderer
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1.0 : Math.min(window.devicePixelRatio, 2.0));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.replaceChildren(this.renderer.domElement);

    // 3. Scene & Horizon Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x090d16);
    this.scene.fog = new THREE.FogExp2(0x090d16, 0.0035);

    // 4. Room Environment
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // 5. Camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 900);
    this.camera.position.copy(this.targetCamPos);

    // 6. OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = !this.isSoftwareGl;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // prevent dipping below ground
    this.controls.minDistance = 8;
    this.controls.maxDistance = 350;
    this.controls.target.copy(this.currentLookAt);

    this.controls.addEventListener('start', () => {
      this.isTransitioningCam = false;
    });

    // 7. Lighting Rig (Warm Key + Cool Fill + Rim)
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.4);
    keyLight.position.set(60, 110, 80);
    keyLight.castShadow = !this.isSoftwareGl;
    if (!this.isSoftwareGl) {
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      keyLight.shadow.camera.near = 10;
      keyLight.shadow.camera.far = 300;
      const d = 95;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x1e293b, 1.2);
    this.scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.9);
    rimLight.position.set(-80, 50, -70);
    this.scene.add(rimLight);

    // 8. Build Geometry & Materials
    this.materials = createPlantMaterials();
    const { rootGroup, componentMap, cutawayRegistry } = buildPlantScene(this.materials);
    this.scene.add(rootGroup);
    this.componentMap = componentMap;
    this.cutawayRegistry = cutawayRegistry;

    // 9. Build Pipeline Network
    const { pipelineGroup, routes } = buildPipelineNetwork(this.materials);
    this.scene.add(pipelineGroup);
    this.pipeRoutes = routes;
    this.pipelineGroup = pipelineGroup;

    // 10. Build 3D Pins
    const { pinGroup, pins } = buildPinMarkers(PLANT_COMPONENTS);
    this.scene.add(pinGroup);
    this.pinGroup = pinGroup;
    this.pins = pins;

    // 11. Event Listeners
    window.addEventListener('resize', this.onResize);
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown);
    this.renderer.domElement.addEventListener('pointermove', this.onPointerMove);

    // 12. Start Loop
    this.startLoop();
  }

  private startLoop() {
    const afterDraw = (cb: () => void) => {
      const gl = this.renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          this.frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          this.frameId = window.setTimeout(cb, 60);
        }
      };
      this.frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      const delta = this.clock.getDelta();

      // Camera smooth damping transition
      if (this.isTransitioningCam) {
        this.camera.position.lerp(this.targetCamPos, 0.08);
        this.currentLookAt.lerp(this.targetLookAt, 0.08);
        this.controls.target.copy(this.currentLookAt);

        if (
          this.camera.position.distanceTo(this.targetCamPos) < 0.2 &&
          this.currentLookAt.distanceTo(this.targetLookAt) < 0.2
        ) {
          this.isTransitioningCam = false;
        }
      }

      this.controls.update();

      // Update flow particle animation
      updatePipelineFlow(this.pipeRoutes, delta);

      // Render
      this.renderer.render(this.scene, this.camera);

      if (this.isSoftwareGl) {
        afterDraw(tick);
      } else {
        this.frameId = requestAnimationFrame(tick);
      }
    };

    tick();
  }

  private onResize = () => {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private onPointerDown = (event: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // 1. Check Pins first
    if (this.showPins) {
      const pinSprites = this.pins.map((p) => p.sprite);
      const pinHits = this.raycaster.intersectObjects(pinSprites, false);
      if (pinHits.length > 0) {
        const id = pinHits[0].object.userData.componentId;
        this.selectComponent(id);
        return;
      }
    }

    // 2. Check 3D meshes
    const allGroups = Object.values(this.componentMap);
    const hits = this.raycaster.intersectObjects(allGroups, true);

    if (hits.length > 0) {
      let targetObj: THREE.Object3D | null = hits[0].object;
      while (targetObj && targetObj !== this.scene) {
        if (targetObj.userData && typeof targetObj.userData.componentId === 'number') {
          this.selectComponent(targetObj.userData.componentId);
          return;
        }
        targetObj = targetObj.parent;
      }
    }
  };

  private onPointerMove = (event: MouseEvent) => {
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    let hoveredId: number | null = null;
    if (this.showPins) {
      const pinSprites = this.pins.map((p) => p.sprite);
      const pinHits = this.raycaster.intersectObjects(pinSprites, false);
      if (pinHits.length > 0) {
        hoveredId = pinHits[0].object.userData.componentId;
      }
    }

    if (!hoveredId) {
      const allGroups = Object.values(this.componentMap);
      const hits = this.raycaster.intersectObjects(allGroups, true);
      if (hits.length > 0) {
        let cur: THREE.Object3D | null = hits[0].object;
        while (cur && cur !== this.scene) {
          if (cur.userData && typeof cur.userData.componentId === 'number') {
            hoveredId = cur.userData.componentId;
            break;
          }
          cur = cur.parent;
        }
      }
    }

    if (this.hoveredComponentId !== hoveredId) {
      this.hoveredComponentId = hoveredId;
      this.renderer.domElement.style.cursor = hoveredId ? 'pointer' : 'default';
      this.callbacks.onHoverComponent?.(hoveredId);
    }
  };

  /**
   * Selects a component and animates camera toward it
   */
  public selectComponent(id: number | null) {
    this.selectedComponentId = id;
    this.callbacks.onSelectComponent(id);

    if (id !== null) {
      const comp = PLANT_COMPONENTS.find((c) => c.id === id);
      if (comp) {
        this.flyTo(comp.cameraPosition, comp.worldPosition);
      }
    }
  }

  /**
   * Smoothly interpolates camera to new position and lookAt target
   */
  public flyTo(camPos: [number, number, number], targetPos: [number, number, number]) {
    this.targetCamPos.set(...camPos);
    this.targetLookAt.set(...targetPos);
    this.isTransitioningCam = true;
  }

  /**
   * Sets Cutaway level (0.0 = solid casings, 1.0 = ghost casing showing all internals)
   */
  public setCutaway(factor: number) {
    this.cutawayFactor = Math.max(0, Math.min(1, factor));

    for (const casing of this.cutawayRegistry.casingMeshes) {
      if (Array.isArray(casing.material)) {
        for (const mat of casing.material) {
          mat.transparent = this.cutawayFactor > 0.05;
          mat.opacity = 1.0 - this.cutawayFactor * 0.75;
          mat.depthWrite = this.cutawayFactor < 0.5;
        }
      } else {
        casing.material.transparent = this.cutawayFactor > 0.05;
        casing.material.opacity = 1.0 - this.cutawayFactor * 0.75;
        casing.material.depthWrite = this.cutawayFactor < 0.5;
      }
    }
  }

  /**
   * Filters visible flow circuits
   */
  public setCircuitFilter(circuit: FlowCircuit) {
    this.activeCircuit = circuit;

    // Filter pipeline routes
    for (const route of this.pipeRoutes) {
      const isVisible = circuit === 'all' || route.circuit === circuit;
      route.mesh.visible = isVisible;
      route.particles.visible = isVisible;
    }

    // Filter 3D component pin markers
    for (const pin of this.pins) {
      const comp = PLANT_COMPONENTS.find((c) => c.id === pin.id);
      if (comp) {
        const isCompVisible = circuit === 'all' || comp.circuit === circuit;
        pin.group.visible = this.showPins && isCompVisible;
      }
    }
  }

  /**
   * Toggles visibility of 3D pin badges
   */
  public setShowPins(visible: boolean) {
    this.showPins = visible;
    this.pinGroup.visible = visible;
  }

  /**
   * Sets preset camera views
   */
  public setCameraPreset(preset: string) {
    switch (preset) {
      case 'overview':
        this.flyTo([-15, 68, -85], [2, 16, 5]);
        break;
      case 'boiler':
        this.flyTo([-38, 45, 38], [-14, 28, 10]);
        break;
      case 'turbine':
        this.flyTo([-2, 22, 6], [0, 11, -22]);
        break;
      case 'cooling':
        this.flyTo([22, 45, 80], [40, 20, 42]);
        break;
      case 'coal_yard':
        this.flyTo([-120, 35, 75], [-75, 10, 35]);
        break;
      case 'switchyard':
        this.flyTo([35, 25, -2], [50, 12, -22]);
        break;
      case 'water_treatment':
        this.flyTo([-75, 25, -25], [-40, 6, -45]);
        break;
      case 'chimney_esp':
        this.flyTo([25, 45, 45], [40, 25, 10]);
        break;
    }
  }

  public dispose() {
    cancelAnimationFrame(this.frameId);
    clearTimeout(this.frameId);

    window.removeEventListener('resize', this.onResize);
    if (this.renderer) {
      this.renderer.domElement.removeEventListener('pointerdown', this.onPointerDown);
      this.renderer.domElement.removeEventListener('pointermove', this.onPointerMove);
      this.renderer.dispose();
    }
    this.scene.clear();
  }
}
