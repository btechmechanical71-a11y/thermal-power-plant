/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { PlantCanvas } from './components/PlantCanvas';
import { ControlDock } from './components/ControlDock';
import { ComponentInspector } from './components/ComponentInspector';
import { ComponentDirectoryModal } from './components/ComponentDirectoryModal';
import { SchematicsOverlay } from './components/SchematicsOverlay';
import { GuidedTour } from './components/GuidedTour';
import { ComponentExtractionStudio } from './components/ComponentExtractionStudio';
import { FlowCircuit } from './types/plant';
import { PLANT_COMPONENTS } from './data/plantComponents';
import { calculatePlantThermodynamics } from './data/thermodynamics';
import { PlantSceneManager } from './3d/PlantScene';
import {
  Activity,
  Layers,
  FileText,
  RotateCcw,
  Compass,
  CheckCircle,
} from 'lucide-react';

export default function App() {
  // Operating Load State
  const [loadMW, setLoadMW] = useState<number>(500);
  const plantState = useMemo(() => calculatePlantThermodynamics(loadMW), [loadMW]);

  // Scene interactive state
  const [selectedComponentId, setSelectedComponentId] = useState<number | null>(null);
  const [hoveredComponentId, setHoveredComponentId] = useState<number | null>(null);
  const [activeCircuit, setActiveCircuit] = useState<FlowCircuit>('all');
  const [cutawayValue, setCutawayValue] = useState<number>(0.0);
  const [showPins, setShowPins] = useState<boolean>(true);
  const [cameraPreset, setCameraPreset] = useState<string>('overview');

  // Modals & Panels
  const [isDirectoryOpen, setIsDirectoryOpen] = useState<boolean>(false);
  const [isSchematicsOpen, setIsSchematicsOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isExtractionOpen, setIsExtractionOpen] = useState<boolean>(false);

  const [sceneManager, setSceneManager] = useState<PlantSceneManager | null>(null);

  const selectedComponent = useMemo(() => {
    if (selectedComponentId === null) return null;
    return PLANT_COMPONENTS.find((c) => c.id === selectedComponentId) || null;
  }, [selectedComponentId]);

  const hoveredComponent = useMemo(() => {
    if (hoveredComponentId === null) return null;
    return PLANT_COMPONENTS.find((c) => c.id === hoveredComponentId) || null;
  }, [hoveredComponentId]);

  const handleSelectComponent = useCallback((id: number | null) => {
    setSelectedComponentId(id);
    if (id !== null) {
      sceneManager?.selectComponent(id);
    }
  }, [sceneManager]);

  const handleSelectCameraPreset = useCallback((preset: string) => {
    setCameraPreset(preset);
    sceneManager?.setCameraPreset(preset);
  }, [sceneManager]);

  const handleResetCamera = () => {
    handleSelectCameraPreset('overview');
    setSelectedComponentId(null);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D WebGL Canvas Layer */}
      <PlantCanvas
        onSelectComponent={handleSelectComponent}
        onHoverComponent={setHoveredComponentId}
        cutawayValue={cutawayValue}
        activeCircuit={activeCircuit}
        showPins={showPins}
        cameraPreset={cameraPreset}
        selectedComponentId={selectedComponentId}
        onManagerReady={setSceneManager}
      />

      {/* Top Header Bar */}
      <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-slate-100 shadow-md">
        {/* Title and Engineering Spec */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                500 MW UNIT
              </span>
              <h1 className="text-sm font-bold text-white tracking-wide">
                COAL-FIRED STEAM THERMAL POWER PLANT
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/80">
                <CheckCircle className="w-3 h-3" />
                <span>50/50 Components Mapped</span>
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Rankine Reheat-Regenerative Cycle • Subcritical / Supercritical 3D Simulation
            </span>
          </div>
        </div>

        {/* Live Operating Telemetry Badges */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-mono">
          <div className="bg-slate-950/70 border border-slate-800 px-2.5 py-1 rounded-md">
            <span className="text-slate-400 mr-1.5">Load:</span>
            <span className="text-emerald-400 font-bold">{plantState.electricalOutputMW} MW</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 px-2.5 py-1 rounded-md">
            <span className="text-slate-400 mr-1.5">Steam:</span>
            <span className="text-cyan-400 font-bold">{plantState.steamFlowTpH} t/h</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 px-2.5 py-1 rounded-md">
            <span className="text-slate-400 mr-1.5">Efficiency:</span>
            <span className="text-amber-400 font-bold">{plantState.thermalEfficiencyPercent}%</span>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 px-2.5 py-1 rounded-md">
            <span className="text-slate-400 mr-1.5">Vacuum:</span>
            <span className="text-sky-400 font-bold">{plantState.condenserVacuumKPa} kPa</span>
          </div>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTourOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition shadow-sm"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Tour Mode</span>
          </button>

          <button
            onClick={() => setIsDirectoryOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition border border-slate-700"
            title="Component Legend"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">50 Components</span>
          </button>

          <button
            onClick={() => setIsExtractionOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-cyan-950/70 hover:bg-cyan-900 text-cyan-200 rounded-lg text-xs font-semibold transition border border-cyan-700/70"
            title="Export all 50 individual 3D components"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Export 3D Parts</span>
          </button>

          <button
            onClick={() => setIsSchematicsOpen(true)
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition border border-slate-700"
            title="Process Schematics"
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Schematics</span>
          </button>

          <button
            onClick={handleResetCamera}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition border border-slate-700"
            title="Reset Camera View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hover Tooltip in 3D Viewport */}
      {hoveredComponent && !selectedComponent && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-slate-900/90 border border-cyan-500/60 px-3 py-1.5 rounded-lg shadow-lg text-xs text-white font-mono flex items-center gap-2 animate-fade-in">
          <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
            #{hoveredComponent.id}
          </span>
          <span className="font-sans font-semibold">{hoveredComponent.name}</span>
          <span className="text-slate-400 font-normal">({hoveredComponent.operatingTemp.split('/')[0]})</span>
        </div>
      )}

      {/* Component Inspector Side Panel */}
      <ComponentInspector
        component={selectedComponent}
        onClose={() => setSelectedComponentId(null)}
        onSelectComponent={handleSelectComponent}
      />

      {/* Ergonomic Collapsible Bottom Control Dock */}
      <ControlDock
        activeCircuit={activeCircuit}
        onChangeCircuit={setActiveCircuit}
        cutawayValue={cutawayValue}
        onChangeCutaway={setCutawayValue}
        cameraPreset={cameraPreset}
        onSelectCameraPreset={handleSelectCameraPreset}
        showPins={showPins}
        onTogglePins={() => setShowPins(!showPins)}
        plantState={plantState}
        onChangeLoadMW={setLoadMW}
        onOpenDirectory={() => setIsDirectoryOpen(true)}
        onOpenSchematics={() => setIsSchematicsOpen(true)}
        onStartTour={() => setIsTourOpen(true)}
      />

      {/* 50 Components Directory Legend Modal */}
      <ComponentDirectoryModal
        isOpen={isDirectoryOpen}
        onClose={() => setIsDirectoryOpen(false)}
        onSelectComponent={handleSelectComponent}
        selectedId={selectedComponentId}
      />

      {/* Technical Process Schematics Modal */}
      <SchematicsOverlay
        isOpen={isSchematicsOpen}
        onClose={() => setIsSchematicsOpen(false)}
        plantState={plantState}
        onSelectComponent={(id) => {
          setIsSchematicsOpen(false);
          handleSelectComponent(id);
        }}
      />

      <ComponentExtractionStudio isOpen={isExtractionOpen} onClose={() => setIsExtractionOpen(false)} />

      {/* B.Tech Presentation Guided Tour */}
      <GuidedTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onSelectComponent={handleSelectComponent}
        onSelectCameraPreset={handleSelectCameraPreset}
      />
    </div>
  );
}
