/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FlowCircuit, PlantOperatingState } from '../types/plant';
import {
  Camera,
  Layers,
  Activity,
  Sliders,
  ChevronDown,
  ChevronUp,
  MapPin,
  FileText,
  Compass,
} from 'lucide-react';

interface ControlDockProps {
  activeCircuit: FlowCircuit;
  onChangeCircuit: (c: FlowCircuit) => void;
  cutawayValue: number;
  onChangeCutaway: (val: number) => void;
  cameraPreset: string;
  onSelectCameraPreset: (preset: string) => void;
  showPins: boolean;
  onTogglePins: () => void;
  plantState: PlantOperatingState;
  onChangeLoadMW: (load: number) => void;
  onOpenDirectory: () => void;
  onOpenSchematics: () => void;
  onStartTour: () => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  activeCircuit,
  onChangeCircuit,
  cutawayValue,
  onChangeCutaway,
  cameraPreset,
  onSelectCameraPreset,
  showPins,
  onTogglePins,
  plantState,
  onChangeLoadMW,
  onOpenDirectory,
  onOpenSchematics,
  onStartTour,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'circuits' | 'cutaway' | 'load'>('camera');

  const circuits: { id: FlowCircuit; label: string; color: string }[] = [
    { id: 'all', label: 'All Circuits', color: 'bg-slate-700 text-slate-100' },
    { id: 'main_steam_reheat', label: 'Main Steam & Reheat (Red)', color: 'bg-red-950 text-red-200 border-red-700' },
    { id: 'condensate_feedwater', label: 'Feedwater & Condensate (Lt Blue)', color: 'bg-sky-950 text-sky-200 border-sky-600' },
    { id: 'cooling_water', label: 'Cooling Water (Blue)', color: 'bg-blue-950 text-blue-200 border-blue-700' },
    { id: 'flue_gas_air', label: 'Flue Gas & Air (Orange/White)', color: 'bg-orange-950 text-orange-200 border-orange-700' },
    { id: 'fuel_coal', label: 'Coal & Fuel (Yellow)', color: 'bg-yellow-950 text-yellow-200 border-yellow-700' },
    { id: 'electrical', label: 'Electrical Grid (Green)', color: 'bg-emerald-950 text-emerald-200 border-emerald-700' },
    { id: 'water_treatment', label: 'Water Treatment', color: 'bg-cyan-950 text-cyan-200 border-cyan-700' },
  ];

  const cameraPresets = [
    { id: 'overview', label: 'Plant Overview' },
    { id: 'boiler', label: 'Boiler & Furnace' },
    { id: 'turbine', label: 'Turbine Island' },
    { id: 'cooling', label: 'Cooling Tower' },
    { id: 'coal_yard', label: 'Coal Handling' },
    { id: 'switchyard', label: '400kV Switchyard' },
    { id: 'water_treatment', label: 'Water Treatment' },
    { id: 'chimney_esp', label: 'ESP & Chimney' },
  ];

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-30 transition-transform duration-300 w-[95%] max-w-[940px] ${
        isCollapsed ? 'translate-y-[calc(100%-2.25rem)]' : 'translate-y-0'
      }`}
    >
      {/* Drawer Toggle Header */}
      <div className="flex justify-between items-center mb-1 px-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDirectory}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 border border-slate-700/80 rounded-md text-xs font-medium text-slate-200 hover:bg-slate-800 hover:border-cyan-500 transition shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>50 Components Legend</span>
          </button>
          <button
            onClick={onOpenSchematics}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 border border-slate-700/80 rounded-md text-xs font-medium text-slate-200 hover:bg-slate-800 hover:border-cyan-500 transition shadow-sm"
          >
            <Activity className="w-3.5 h-3.5 text-amber-400" />
            <span>Engineering Schematics</span>
          </button>
          <button
            onClick={onStartTour}
            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/90 border border-cyan-600/80 rounded-md text-xs font-semibold text-cyan-200 hover:bg-cyan-900 transition shadow-sm"
          >
            <Compass className="w-3.5 h-3.5 text-cyan-300" />
            <span>B.Tech Project Tour</span>
          </button>
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/90 border border-slate-700 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-sm"
          title={isCollapsed ? 'Show Controls (H)' : 'Hide Controls (H)'}
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>Show Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hide Controls (Zen Mode)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Dock Container */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl p-3 text-slate-200">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('camera')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'camera'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera Views</span>
            </button>
            <button
              onClick={() => setActiveTab('circuits')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'circuits'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Flow Circuits</span>
            </button>
            <button
              onClick={() => setActiveTab('cutaway')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'cutaway'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Cutaway & Internals</span>
            </button>
            <button
              onClick={() => setActiveTab('load')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === 'load'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>MW Load & Heat Rate</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onTogglePins}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition border ${
                showPins
                  ? 'bg-cyan-900/50 text-cyan-300 border-cyan-500'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title="Toggle 3D Component Labels"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>3D Pins: {showPins ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Tab Content Panes */}
        {activeTab === 'camera' && (
          <div className="flex flex-wrap items-center gap-1.5">
            {cameraPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onSelectCameraPreset(preset.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium border transition ${
                  cameraPreset === preset.id
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-semibold shadow-sm'
                    : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'circuits' && (
          <div className="flex flex-wrap items-center gap-1.5">
            {circuits.map((c) => (
              <button
                key={c.id}
                onClick={() => onChangeCircuit(c.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                  activeCircuit === c.id
                    ? `${c.color} border-current ring-1 ring-cyan-400 shadow-sm font-semibold`
                    : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:border-slate-500'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'cutaway' && (
          <div className="flex items-center justify-between gap-6 py-1">
            <div className="flex-1 flex items-center gap-3">
              <span className="text-xs text-slate-400 whitespace-nowrap">Solid Plant Casing</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.02"
                value={cutawayValue}
                onChange={(e) => onChangeCutaway(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-xs text-cyan-400 whitespace-nowrap font-mono">
                {Math.round(cutawayValue * 100)}% Cutaway
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onChangeCutaway(0.0)}
                className="px-2.5 py-1 text-xs bg-slate-800 border border-slate-700 rounded hover:border-slate-500 text-slate-300"
              >
                External View
              </button>
              <button
                onClick={() => onChangeCutaway(0.85)}
                className="px-2.5 py-1 text-xs bg-cyan-950/80 border border-cyan-700 rounded hover:border-cyan-500 text-cyan-200 font-medium"
              >
                Full Internals
              </button>
            </div>
          </div>
        )}

        {activeTab === 'load' && (
          <div className="flex items-center justify-between gap-6 py-1">
            <div className="flex-1 flex items-center gap-3">
              <span className="text-xs text-slate-400 whitespace-nowrap">Min 200 MW</span>
              <input
                type="range"
                min="200"
                max="600"
                step="25"
                value={plantState.electricalOutputMW}
                onChange={(e) => onChangeLoadMW(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <span className="text-xs text-emerald-400 whitespace-nowrap font-mono font-bold">
                {plantState.electricalOutputMW} MW
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
              <div>
                <span className="text-slate-500 mr-1.5">Steam:</span>
                <span className="text-cyan-400 font-semibold">{plantState.steamFlowTpH} t/h</span>
              </div>
              <div>
                <span className="text-slate-500 mr-1.5">Efficiency:</span>
                <span className="text-emerald-400 font-semibold">{plantState.thermalEfficiencyPercent}%</span>
              </div>
              <div>
                <span className="text-slate-500 mr-1.5">Coal Rate:</span>
                <span className="text-amber-400 font-semibold">{plantState.coalFeedRateTpH} t/h</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
