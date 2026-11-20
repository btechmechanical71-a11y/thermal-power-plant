/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Exports the exact registered component groups used by the plant scene.
 * Geometry is cloned from the source scene; no replacement primitives or
 * simplified meshes are generated during export.
 */
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import JSZip from 'jszip';
import { buildPlantScene } from './proceduralGeometries';
import { createPlantMaterials } from './materials';
import { PLANT_COMPONENTS } from '../data/plantComponents';
import { ComponentItem } from '../types/plant';

let sourceComponents: Record<number, THREE.Group> | null = null;

function getSourceComponents() {
  if (!sourceComponents) {
    const { rootGroup, componentMap } = buildPlantScene(createPlantMaterials());
    rootGroup.updateMatrixWorld(true);
    sourceComponents = componentMap;
  }
  return sourceComponents;
}

function safeFileName(value: string) {
  return value.normalize('NFKD').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Clone the original group, bake its plant-world transform, then center it at origin. */
function createCenteredClone(id: number) {
  const source = getSourceComponents()[id];
  if (!source) throw new Error(`3D geometry for component ${id} was not registered.`);

  source.updateWorldMatrix(true, true);
  const clone = source.clone(true);
  // Clear the cloned root's local transform before baking the source world matrix;
  // otherwise its original local position/rotation/scale would be applied twice.
  clone.position.set(0, 0, 0);
  clone.quaternion.identity();
  clone.scale.set(1, 1, 1);
  clone.updateMatrix();
  clone.applyMatrix4(source.matrixWorld);
  clone.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(clone);
  if (bounds.isEmpty()) throw new Error(`Component ${id} contains no exportable geometry.`);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  clone.position.sub(center);
  clone.updateMatrixWorld(true);
  return { clone, center, size };
}

async function makeGlb(group: THREE.Group): Promise<ArrayBuffer> {
  const exporter = new GLTFExporter();
  return await exporter.parseAsync(group, {
    binary: true,
    onlyVisible: true,
    trs: false,
  }) as ArrayBuffer;
}

function makeStl(group: THREE.Group): string {
  const exporter = new STLExporter();
  return exporter.parse(group, { binary: false });
}

export interface ExportedComponentFiles {
  item: ComponentItem;
  baseName: string;
  glb: ArrayBuffer;
  stl: string;
  center: [number, number, number];
  size: [number, number, number];
}

export async function exportComponentFiles(item: ComponentItem): Promise<ExportedComponentFiles> {
  const { clone, center, size } = createCenteredClone(item.id);
  try {
    const [glb, stl] = await Promise.all([makeGlb(clone), Promise.resolve(makeStl(clone))]);
    return {
      item,
      baseName: `${String(item.id).padStart(2, '0')}_${item.code}_${safeFileName(item.name)}`,
      glb,
      stl,
      center: center.toArray(),
      size: size.toArray(),
    };
  } finally {
    clone.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (mesh.isMesh) {
        // Shared source materials/geometries are intentionally retained.
      }
    });
  }
}

function addBlob(zip: JSZip, path: string, data: ArrayBuffer | string) {
  zip.file(path, data);
}

export async function downloadComponentFile(item: ComponentItem, format: 'glb' | 'stl') {
  const files = await exportComponentFiles(item);
  const blob = format === 'glb'
    ? new Blob([files.glb], { type: 'model/gltf-binary' })
    : new Blob([files.stl], { type: 'model/stl' });
  triggerDownload(blob, `${files.baseName}.${format}`);
}

export async function downloadAllComponentsZip(onProgress?: (done: number, total: number) => void) {
  const zip = new JSZip();
  const manifest: Array<Record<string, unknown>> = [];
  const total = PLANT_COMPONENTS.length;

  for (let index = 0; index < total; index += 1) {
    const item = PLANT_COMPONENTS[index];
    const files = await exportComponentFiles(item);
    addBlob(zip, `GLB/${files.baseName}.glb`, files.glb);
    addBlob(zip, `STL/${files.baseName}.stl`, files.stl);
    manifest.push({
      id: item.id,
      code: item.code,
      name: item.name,
      category: item.category,
      sourceWorldPosition: item.worldPosition,
      sourceBoundsCenter: files.center,
      dimensionsInSceneUnits: files.size,
      exportedAtOrigin: true,
      formats: ['GLB', 'STL'],
    });
    onProgress?.(index + 1, total);
  }

  zip.file('manifest.json', JSON.stringify({
    title: 'Coal-Fired Steam Thermal Power Plant - 50 Component Export',
    geometrySource: 'Original registered Three.js component groups',
    geometryModified: false,
    coordinateNote: 'Each component is centered at the origin for easier inspection. Dimensions use the source scene units; no physical scale conversion is applied.',
    componentCount: total,
    components: manifest,
  }, null, 2));

  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  triggerDownload(blob, 'thermal-power-plant-50-components-GLB-STL.zip');
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
