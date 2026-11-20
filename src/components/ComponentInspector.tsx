/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ComponentItem } from '../types/plant';
import { PLANT_COMPONENTS } from '../data/plantComponents';
import {
  X,
  Thermometer,
  Gauge,
  Droplet,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Crosshair,
  Layers,
} from 'lucide-react';

interface ComponentInspectorProps {
  component: ComponentItem | null;
  onClose: () => void;
  onSelectComponent: (id: number) => void;
}

export const ComponentInspector: React.FC<ComponentInspectorProps> = ({
  component,
  onClose,
  onSelectComponent,
}) => {
  if (!component) return null;

  const upstreamComps = component.upstreamIds
    .map((id) => PLANT_COMPONENTS.find((c) => c.id === id))
    .filter(Boolean) as ComponentItem[];

  const downstreamComps = component.downstreamIds
    .map((id) => PLANT_COMPONENTS.find((c) => c.id === id))
    .filter(Boolean) as ComponentItem[];

  const getSubsystemLabel = (cat: string) => {
    switch (cat) {
      case 'coal_handling':
        return 'Coal Handling System';
      case 'boiler_combustion':
        return 'Boiler & Steam Generation';
      case 'turbine_generator':
        return 'Turbine & Electrical Power Block';
      case 'condensate_feedwater':
        return 'Condensate & Feedwater Cycle';
      case 'cooling_water':
        return 'Cooling Water Circuit';
      case 'flue_gas_ash':
        return 'Flue Gas & Ash Handling';
      case 'water_treatment':
        return 'Water Treatment Plant';
      default:
        return 'Plant System';
    }
  };

  return (
    <div className="fixed top-18 right-4 z-40 w-96 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8.5rem)] overflow-y-auto bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl p-4 text-slate-100 flex flex-col gap-3.5 backdrop-blur-none">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
              #{component.id} • {component.code}
            </span>
            <span className="text-xs text-slate-400 font-medium">{getSubsystemLabel(component.category)}</span>
          </div>
          <h2 className="text-base font-bold text-white leading-tight">{component.name}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Short Summary */}
      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
        {component.shortDescription}
      </p>

      {/* Operating Parameters Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 text-amber-400 mb-1">
            <Thermometer className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Operating Temp</span>
          </div>
          <div className="font-mono text-slate-100 font-medium text-[11.5px]">{component.operatingTemp}</div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5">
          <div className="flex items-center gap-1.5 text-cyan-400 mb-1">
            <Gauge className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Operating Pressure</span>
          </div>
          <div className="font-mono text-slate-100 font-medium text-[11.5px]">{component.operatingPressure}</div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5 col-span-2">
          <div className="flex items-center gap-1.5 text-sky-400 mb-1">
            <Droplet className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400">Process Fluid Medium</span>
          </div>
          <div className="font-mono text-slate-200 text-xs">{component.flowMedium}</div>
        </div>
      </div>

      {/* Engineering Design Details */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3 text-xs flex flex-col gap-1.5">
        <span className="font-semibold text-[11px] uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5" />
          <span>Mechanical & Thermal Design</span>
        </span>
        <p className="text-slate-300 leading-relaxed text-[11.5px]">{component.engineeringDetails}</p>
        <div className="mt-1 pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400">
          <strong className="text-slate-300">Material Specification:</strong> {component.designMaterial}
        </div>
      </div>

      {/* Safety & Interlocks */}
      <div className="bg-amber-950/30 border border-amber-800/50 rounded-lg p-2.5 text-xs">
        <div className="flex items-center gap-1.5 text-amber-400 mb-1 font-semibold text-[11px] uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Protection & Safety Interlocks</span>
        </div>
        <p className="text-amber-200/90 text-[11px] leading-relaxed">{component.keySafetyNotes}</p>
      </div>

      {/* Flow Circuit Connections (Interactive Upstream / Downstream Links) */}
      <div className="border-t border-slate-800 pt-2 flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Flow Network Routing</span>

        {/* Upstream */}
        {upstreamComps.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <ArrowLeft className="w-3 h-3 text-slate-400" />
              <span>Receives From:</span>
            </span>
            <div className="flex flex-wrap gap-1">
              {upstreamComps.map((up) => (
                <button
                  key={up.id}
                  onClick={() => onSelectComponent(up.id)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-600 text-[11px] text-slate-200 hover:text-cyan-200 transition font-mono"
                >
                  #{up.id} {up.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Downstream */}
        {downstreamComps.length > 0 && (
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <ArrowRight className="w-3 h-3 text-cyan-400" />
              <span>Discharges / Delivers To:</span>
            </span>
            <div className="flex flex-wrap gap-1">
              {downstreamComps.map((down) => (
                <button
                  key={down.id}
                  onClick={() => onSelectComponent(down.id)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-600 text-[11px] text-slate-200 hover:text-cyan-200 transition font-mono"
                >
                  #{down.id} {down.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action: Focus In 3D */}
      <button
        onClick={() => onSelectComponent(component.id)}
        className="w-full mt-1 flex items-center justify-center gap-2 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-lg text-xs transition shadow-md"
      >
        <Crosshair className="w-4 h-4" />
        <span>Focus Camera on #{component.id}</span>
      </button>
    </div>
  );
};
