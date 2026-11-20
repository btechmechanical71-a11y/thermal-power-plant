/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { ComponentItem } from '../types/plant';

export interface PinMarker {
  id: number;
  sprite: THREE.Sprite;
  leaderLine: THREE.Line;
  group: THREE.Group;
}

/**
 * Creates 2D canvas textures for all 50 numbered pins
 */
function createPinTexture(id: number, code: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Circular technical badge with metallic rim
  ctx.beginPath();
  ctx.arc(64, 64, 56, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#38bdf8'; // industrial cyan border
  ctx.stroke();

  // Number text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 44px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(id.toString(), 64, 54);

  // Short Code text
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 20px monospace';
  ctx.fillText(code, 64, 90);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function buildPinMarkers(components: ComponentItem[]): {
  pinGroup: THREE.Group;
  pins: PinMarker[];
} {
  const pinGroup = new THREE.Group();
  pinGroup.name = 'ComponentPins_50';

  const pins: PinMarker[] = [];

  const lineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.6,
  });

  for (const comp of components) {
    const [x, y, z] = comp.worldPosition;
    const pinSubgroup = new THREE.Group();
    pinSubgroup.userData = { componentId: comp.id };

    // Pin sprite elevated above target component
    const spriteMat = new THREE.SpriteMaterial({
      map: createPinTexture(comp.id, comp.code),
      sizeAttenuation: true,
      depthTest: true,
      transparent: true,
      opacity: 0.95,
    });
    const sprite = new THREE.Sprite(spriteMat);
    const pinElevation = y + 5.5;
    sprite.position.set(x, pinElevation, z);
    sprite.scale.set(3.4, 3.4, 1);
    sprite.userData = { componentId: comp.id };
    pinSubgroup.add(sprite);

    // Leader line connecting pinpoint to actual component position
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x, y, z),
      new THREE.Vector3(x, pinElevation - 1.2, z),
    ]);
    const leaderLine = new THREE.Line(lineGeo, lineMat);
    pinSubgroup.add(leaderLine);

    pinGroup.add(pinSubgroup);
    pins.push({
      id: comp.id,
      sprite,
      leaderLine,
      group: pinSubgroup,
    });
  }

  return { pinGroup, pins };
}
