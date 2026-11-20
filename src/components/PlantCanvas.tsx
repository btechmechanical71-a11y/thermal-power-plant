/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { PlantSceneManager } from '../3d/PlantScene';
import { FlowCircuit } from '../types/plant';

interface PlantCanvasProps {
  onSelectComponent: (id: number | null) => void;
  onHoverComponent?: (id: number | null) => void;
  cutawayValue: number;
  activeCircuit: FlowCircuit;
  showPins: boolean;
  cameraPreset: string;
  selectedComponentId: number | null;
  onManagerReady?: (manager: PlantSceneManager) => void;
}

export const PlantCanvas: React.FC<PlantCanvasProps> = ({
  onSelectComponent,
  onHoverComponent,
  cutawayValue,
  activeCircuit,
  showPins,
  cameraPreset,
  selectedComponentId,
  onManagerReady,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const managerRef = useRef<PlantSceneManager | null>(null);

  // Initialize scene once
  useEffect(() => {
    if (!mountRef.current) return;

    const manager = new PlantSceneManager(mountRef.current, {
      onSelectComponent: (id) => onSelectComponent(id),
      onHoverComponent: (id) => onHoverComponent?.(id),
    });
    managerRef.current = manager;
    onManagerReady?.(manager);

    return () => {
      manager.dispose();
      managerRef.current = null;
    };
  }, []);

  // Update cutaway
  useEffect(() => {
    managerRef.current?.setCutaway(cutawayValue);
  }, [cutawayValue]);

  // Update circuit filter
  useEffect(() => {
    managerRef.current?.setCircuitFilter(activeCircuit);
  }, [activeCircuit]);

  // Update pins visibility
  useEffect(() => {
    managerRef.current?.setShowPins(showPins);
  }, [showPins]);

  // Update camera preset
  useEffect(() => {
    if (cameraPreset) {
      managerRef.current?.setCameraPreset(cameraPreset);
    }
  }, [cameraPreset]);

  // Update selected component
  useEffect(() => {
    if (selectedComponentId !== null) {
      managerRef.current?.selectComponent(selectedComponentId);
    }
  }, [selectedComponentId]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden bg-slate-950"
      style={{ touchAction: 'none' }}
    />
  );
};
