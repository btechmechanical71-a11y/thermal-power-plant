/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DiagramTab, PlantOperatingState } from '../types/plant';
import { getRankineCycleStatePoints } from '../data/thermodynamics';
import { X, Flame, Droplets, Zap, Wind, ExternalLink } from 'lucide-react';

interface SchematicsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  plantState: PlantOperatingState;
  onSelectComponent: (id: number) => void;
}

export const SchematicsOverlay: React.FC<SchematicsOverlayProps> = ({
  isOpen,
  onClose,
  plantState,
  onSelectComponent,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<DiagramTab>('steam_water');
  const statePoints = getRankineCycleStatePoints(plantState.electricalOutputMW / 500);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700">
                TECHNICAL P&ID SCHEMATICS
              </span>
              <h2 className="text-lg font-bold text-white">Power Plant Process Flow Diagrams</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Strict engineering diagrams verified against Rankine reheat-regenerative cycle thermodynamics.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Schematics"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagram Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800 bg-slate-900/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('steam_water')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition ${
              activeTab === 'steam_water'
                ? 'bg-red-950/80 text-red-300 border-red-600 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Flame className="w-4 h-4 text-red-400" />
            <span>1. Simplified Steam-Water Flow Diagram</span>
          </button>

          <button
            onClick={() => setActiveTab('fuel_flue_gas')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition ${
              activeTab === 'fuel_flue_gas'
                ? 'bg-orange-950/80 text-orange-300 border-orange-600 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Wind className="w-4 h-4 text-orange-400" />
            <span>2. Fuel & Flue-Gas Flow Diagram</span>
          </button>

          <button
            onClick={() => setActiveTab('cooling_water')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition ${
              activeTab === 'cooling_water'
                ? 'bg-blue-950/80 text-blue-300 border-blue-600 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Droplets className="w-4 h-4 text-blue-400" />
            <span>3. Cooling-Water Flow Diagram</span>
          </button>

          <button
            onClick={() => setActiveTab('electrical')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition ${
              activeTab === 'electrical'
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600 shadow-sm'
                : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>4. Electrical Generation Flow Diagram</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950/50">
          {activeTab === 'steam_water' && (
            <div className="flex flex-col gap-6">
              {/* Process Description Header */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-red-400">
                    Rankine Reheat-Regenerative Steam & Feedwater Thermodynamic Circuit
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Feedwater is pressurized by BFP (#30), heated in HP Heater (#31) and Economizer (#14), boiled in
                    Water-Walls (#10) and Drum (#11), superheated in Superheater (#12) to 540°C, expanded in HP Turbine
                    (#18), reheated in Reheater (#13) to 540°C, expanded in IP (#19) and LP (#20) Turbines, condensed
                    under vacuum in Condenser (#26), and extracted by CEP (#27) through LP Heater (#28) & Deaerator
                    (#29).
                  </p>
                </div>
                <div className="text-right whitespace-nowrap font-mono text-xs text-slate-300">
                  <div>Main Steam: <span className="text-red-400 font-bold">{plantState.mainSteamTempC}°C / {plantState.mainSteamPressureBar} bar</span></div>
                  <div>Reheat: <span className="text-amber-400 font-bold">{plantState.reheatSteamTempC}°C / {plantState.reheatSteamPressureBar} bar</span></div>
                  <div>Condenser: <span className="text-sky-400 font-bold">{plantState.condenserVacuumKPa} kPa abs</span></div>
                </div>
              </div>

              {/* Interactive SVG Flow Diagram */}
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl overflow-x-auto">
                <svg viewBox="0 0 920 380" className="w-full min-w-[760px] h-auto">
                  <defs>
                    <marker id="arrow-red" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
                    </marker>
                    <marker id="arrow-blue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
                    </marker>
                    <marker id="arrow-orange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#f97316" />
                    </marker>
                  </defs>

                  {/* Flow Lines */}
                  {/* Waterwalls -> Drum */}
                  <line x1="120" y1="210" x2="120" y2="120" stroke="#38bdf8" strokeWidth="4" markerEnd="url(#arrow-blue)" />
                  {/* Drum -> Superheater */}
                  <line x1="150" y1="100" x2="210" y2="100" stroke="#ef4444" strokeWidth="4" markerEnd="url(#arrow-red)" />
                  {/* Superheater -> HP Turbine */}
                  <line x1="290" y1="100" x2="380" y2="100" stroke="#ef4444" strokeWidth="5" markerEnd="url(#arrow-red)" />
                  {/* HP Turbine exhaust -> Reheater */}
                  <path d="M 430 110 L 430 60 L 250 60 L 250 140" fill="none" stroke="#f97316" strokeWidth="4" markerEnd="url(#arrow-orange)" />
                  {/* Reheater -> IP Turbine */}
                  <path d="M 290 150 L 500 150 L 500 115" fill="none" stroke="#ef4444" strokeWidth="4" markerEnd="url(#arrow-red)" />
                  {/* IP Turbine -> LP Turbine */}
                  <line x1="540" y1="100" x2="590" y2="100" stroke="#ef4444" strokeWidth="5" markerEnd="url(#arrow-red)" />
                  {/* LP Turbine -> Condenser */}
                  <line x1="640" y1="120" x2="640" y2="230" stroke="#38bdf8" strokeWidth="6" markerEnd="url(#arrow-blue)" />
                  {/* Condenser -> CEP */}
                  <line x1="640" y1="270" x2="640" y2="310" stroke="#38bdf8" strokeWidth="4" markerEnd="url(#arrow-blue)" />
                  {/* CEP -> LP Heater */}
                  <line x1="615" y1="325" x2="550" y2="325" stroke="#38bdf8" strokeWidth="4" markerEnd="url(#arrow-blue)" />
                  {/* LP Heater -> Deaerator */}
                  <line x1="470" y1="325" x2="410" y2="325" stroke="#38bdf8" strokeWidth="4" markerEnd="url(#arrow-blue)" />
                  {/* Deaerator -> BFP */}
                  <line x1="370" y1="305" x2="370" y2="250" stroke="#38bdf8" strokeWidth="4" markerEnd="url(#arrow-blue)" />
                  {/* BFP -> HP Heater */}
                  <line x1="345" y1="235" x2="290" y2="235" stroke="#38bdf8" strokeWidth="4" markerEnd="url(#arrow-blue)" />
                  {/* HP Heater -> Economizer */}
                  <line x1="210" y1="235" x2="160" y2="235" stroke="#38bdf8" strokeWidth="4" markerEnd="url(#arrow-blue)" />
                  {/* Economizer -> Drum */}
                  <path d="M 80 235 L 50 235 L 50 100 L 90 100" fill="none" stroke="#38bdf8" strokeWidth="4" markerEnd="url(#arrow-blue)" />

                  {/* Extraction Steam lines */}
                  <path d="M 405 120 L 405 220 L 290 220" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M 520 120 L 520 310 L 410 310" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
                  <path d="M 620 120 L 620 310 L 550 310" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />

                  {/* Component Boxes */}
                  {/* #11 Steam Drum */}
                  <g className="cursor-pointer" onClick={() => onSelectComponent(11)}>
                    <rect x="90" y="80" width="60" height="40" rx="20" fill="#d97706" />
                    <text x="120" y="105" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">#11 Drum</text>
                  </g>

                  {/* #10 Water-walls */}
                  <g className="cursor-pointer" onClick={() => onSelectComponent(10)}>
                    <rect x="80" y="210" width="80" height="60" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                    <text x="120" y="235" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">#10 Water-Walls</text>
                    <text x="120" y="255" textAnchor="middle" fill="#94a3b8" fontSize="9">Boiler Furnace</text>
                  </g>

                  {/* #12 Superheater */}
                  <g className="cursor-pointer" onClick={() => onSelectComponent(12)}>
                    <rect x="210" y="80" width="80" height="40" rx="6" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2" />
                    <text x="250" y="105" textAnchor="middle" fill="#fca5a5" fontSize="11" fontWeight="bold">#12 Superheater</text>
                  </g>

                  {/* #13 Reheater */}
                  <g className="cursor-pointer" onClick={() => onSelectComponent(13)}>
                    <rect x="210" y="130" width="80" height="40" rx="6" fill="#7c2d12" stroke="#f97316" strokeWidth="2" />
                    <text x="250" y="155" textAnchor="middle" fill="#fdba74" fontSize="11" fontWeight="bold">#13 Reheater</text>
                  </g>

                  {/* #14 Economizer */}
                  <g className="cursor-pointer" onClick={() => onSelectComponent(14)}>
                    <rect x="80" y="215" width="80" height="40" rx="6" fill="#0c4a6e" stroke="#0284c7" strokeWidth="2" />
                    <text x="120" y="240" textAnchor="middle" fill="#7dd3fc" fontSize="11" fontWeight="bold">#14 Economizer</text>
                  </g>

                  {/* #18 HP Turbine */}
                  <g className="cursor-pointer" onClick={() => onSelectComponent(18)}>
                    <polygon points="380,85 430,95 430,115 380,125" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" />
                    <text x="405" y="110" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">#18 HP</text>
                  </g>

                  {/* #19 IP Turbine */}
                  <g className="cursor-pointer" onClick={() => onSelectComponent(19)}>
                    <polygon points="490,80 540,90 540,120 490,130" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" />
                    <text x="515" y="110" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">#19 IP</text>
                  </g>

                  {/* #20 LP Turbine */}
                  <g className="cursor-pointer" onClick={() => onSelectComponent(20)}>
                    <polygon points="590,75 650,85 650,135 590,145" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="2" />
                    <text x="620" y="115" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">#20 LP</text>
                  </g>

                  {/* #26 Surface Condenser */}
                  <g className="cursor-pointer" onClick={() => onSelectComponent(26)}>
                    <rect x="590" y="230" width="100" height="45" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                    <text x="640" y="250" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">#26 Condenser</text>
                    <text x="640" y="265" textAnchor="middle" fill="#64748b" fontSize="9">Deep Vacuum 0.07 bar</text>
                  </g>

                  {/* #27 CEP */}
                  <g className="cursor-pointer" onClick={() => onSelectComponent(27)}>
                    <circle cx="630" cy="325" r="15" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
                    <text x="630" y="329" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">#27</text>
                  </g>

                  {/* #28 LP Heater */}
                  <g className="cursor-pointer" onClick={() => onSelectComponent(28)}>
                    <rect x="470" y="305" width="80" height="40" rx="6" fill="#0c4a6e" stroke="#38bdf8" strokeWidth="2" />
                    <text x="510" y="330" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontWeight="bold">#28 LP Heater</text>
                  </g>

                  {/* #29 Deaerator */}
                  <g className="cursor-pointer" onClick={() => onSelectComponent(29)}>
                    <rect x="330" y="305" width="80" height="40" rx="10" fill="#0369a1" stroke="#38bdf8" strokeWidth="2" />
                    <text x="370" y="330" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">#29 Deaerator</text>
                  </g>

                  {/* #30 BFP */}
                  <g className="cursor-pointer" onClick={() => onSelectComponent(30)}>
                    <circle cx="360" cy="235" r="16" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                    <text x="360" y="239" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">#30 BFP</text>
                  </g>

                  {/* #31 HP Heater */}
                  <g className="cursor-pointer" onClick={() => onSelectComponent(31)}>
                    <rect x="210" y="215" width="80" height="40" rx="6" fill="#0c4a6e" stroke="#0284c7" strokeWidth="2" />
                    <text x="250" y="240" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontWeight="bold">#31 HP Heater</text>
                  </g>
                </svg>
              </div>

              {/* Live Thermodynamic State Points Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800 font-bold text-xs text-cyan-400">
                  Rankine Cycle State Points (Live 500 MW Unit Heat & Mass Balance)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-800/60 text-slate-400 text-[11px] uppercase tracking-wider font-mono">
                      <tr>
                        <th className="py-2.5 px-3">Point</th>
                        <th className="py-2.5 px-3">Location Description</th>
                        <th className="py-2.5 px-3">Fluid Phase</th>
                        <th className="py-2.5 px-3">Temp (°C)</th>
                        <th className="py-2.5 px-3">Pressure (bar)</th>
                        <th className="py-2.5 px-3">Enthalpy (kJ/kg)</th>
                        <th className="py-2.5 px-3">Entropy (kJ/kg·K)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono text-slate-200">
                      {statePoints.map((pt) => (
                        <tr key={pt.point} className="hover:bg-slate-800/40 transition">
                          <td className="py-2 px-3 font-bold text-cyan-400">#{pt.point}</td>
                          <td className="py-2 px-3 font-sans font-medium text-white">{pt.label}</td>
                          <td className="py-2 px-3 text-slate-400 font-sans">{pt.medium}</td>
                          <td className="py-2 px-3 text-amber-300 font-bold">{pt.tempC} °C</td>
                          <td className="py-2 px-3 text-sky-300">{pt.pressureBar} bar</td>
                          <td className="py-2 px-3">{pt.enthalpyKJPerKg}</td>
                          <td className="py-2 px-3 text-slate-400">{pt.entropyKJPerKgK}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fuel_flue_gas' && (
            <div className="flex flex-col gap-6">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-orange-400">
                  Fuel Preparation, Combustion Air & Flue Gas Air Quality Control Flow
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Raw coal from Coal Yard (#1) is conveyed (#2) to Crusher (#3), stored in Bunkers (#4), metered by Feeders (#5) into Pulverizer Mills (#6), and blown via PF Pipes (#7) to Burners (#8). Combustion air from FD Fan (#16) is preheated in APH (#15) to 290°C. Flue gas from Furnace (#9) passes Economizer (#14) and APH (#15) to ESP (#39) which captures &gt;99.8% fly ash into Hoppers (#40) and Silos (#44), while ID Fan (#17) exhausts clean gas out the 240m Chimney (#41).
                </p>
              </div>

              {/* Fuel & Flue Gas Flow Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fuel Path Card */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span>Fuel Path: Coal Yard to Boiler Fireball</span>
                  </h4>
                  <div className="flex flex-col gap-2 font-mono text-xs">
                    {[
                      { id: 1, name: 'Coal Storage Yard (30-day reserve stockpile)' },
                      { id: 2, name: 'Coal Conveyor Belt (1200 t/h gallery)' },
                      { id: 3, name: 'Coal Crusher (<20 mm ring granulator)' },
                      { id: 4, name: 'Coal Bunker (8-hour concrete silos)' },
                      { id: 5, name: 'Coal Feeder (Gravimetric kg/s closed loop)' },
                      { id: 6, name: 'Pulverizer / Mill (75% < 75µm microfine powder)' },
                      { id: 7, name: 'Pulverized Coal Pipes (Ceramic basalt-lined)' },
                      { id: 8, name: 'Boiler Burners (Tangential low-NOx fireball)' },
                      { id: 9, name: 'Boiler Furnace (1400°C combustion vortex)' },
                    ].map((step, idx) => (
                      <div
                        key={step.id}
                        onClick={() => onSelectComponent(step.id)}
                        className="p-2 rounded bg-slate-950/70 border border-slate-800 hover:border-amber-500 cursor-pointer flex items-center justify-between text-slate-200 hover:text-amber-300 transition"
                      >
                        <span>
                          <strong className="text-amber-400 mr-2">Step {idx + 1}:</strong> #{step.id} {step.name}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flue Gas & Environmental Control Card */}
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col gap-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
                    <span>Flue Gas & Ash Handling Path</span>
                  </h4>
                  <div className="flex flex-col gap-2 font-mono text-xs">
                    {[
                      { id: 9, name: 'Furnace Radiant Zone (Flue gas generation)' },
                      { id: 14, name: 'Economizer (Flue heat recovery to 340°C)' },
                      { id: 15, name: 'Air Preheater (Rotary Ljungström to 135°C)' },
                      { id: 39, name: 'Electrostatic Precipitator (>99.8% Fly Ash Removal)' },
                      { id: 40, name: 'Dust Collection Hoppers (Pyramidal heated hoppers)' },
                      { id: 42, name: 'Fly Ash Handling System (Pneumatic dense phase)' },
                      { id: 44, name: 'Ash Storage Silo (Truck loading to cement plants)' },
                      { id: 17, name: 'Induced Draft (ID) Fan (Balanced draft control)' },
                      { id: 41, name: 'Chimney / Exhaust Stack (240 m atmospheric dispersion)' },
                    ].map((step, idx) => (
                      <div
                        key={step.id}
                        onClick={() => onSelectComponent(step.id)}
                        className="p-2 rounded bg-slate-950/70 border border-slate-800 hover:border-orange-500 cursor-pointer flex items-center justify-between text-slate-200 hover:text-orange-300 transition"
                      >
                        <span>
                          <strong className="text-orange-400 mr-2">Step {idx + 1}:</strong> #{step.id} {step.name}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cooling_water' && (
            <div className="flex flex-col gap-6">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-blue-400">
                  Cooling Water Circulation & Condenser Heat Sink Circuit
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Cold circulating water at 28°C is pumped from the Cooling Water Basin (#34) by Circulating Water Pumps
                  (#35) through the CW Inlet Pipe (#36) into the Surface Condenser (#26) tube bundles. It absorbs latent
                  heat of condensation (~700 MWth) from the exhaust steam, warming by 10°C to 38°C. It discharges through
                  CW Outlet (#37) and Return Pipeline (#38) to the Cooling Tower (#33) spray nozzles, cascading over PVC
                  fill while ambient air draft cools the water back to 28°C.
                </p>
                <div className="mt-3 p-2.5 bg-blue-950/40 border border-blue-700/60 rounded-lg text-xs text-blue-200 font-semibold flex items-center gap-2">
                  <span>CRITICAL ENGINEERING PRINCIPLE:</span>
                  <span className="font-normal">
                    Circulating cooling water inside the condenser tubes NEVER mixes with pure condensate in the shell!
                  </span>
                </div>
              </div>

              {/* Cooling Circuit Step Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                <div
                  onClick={() => onSelectComponent(34)}
                  className="bg-slate-900 border border-slate-800 hover:border-blue-500 p-3.5 rounded-xl cursor-pointer"
                >
                  <div className="text-blue-400 font-bold mb-1">Station 1: CW Basin (#34)</div>
                  <div className="text-slate-300 text-[11px] font-sans">
                    Cold water pool (28°C) collecting cooled droplet rain at tower base.
                  </div>
                </div>

                <div
                  onClick={() => onSelectComponent(35)}
                  className="bg-slate-900 border border-slate-800 hover:border-blue-500 p-3.5 rounded-xl cursor-pointer"
                >
                  <div className="text-blue-400 font-bold mb-1">Station 2: CW Pumps (#35)</div>
                  <div className="text-slate-300 text-[11px] font-sans">
                    Mixed-flow vertical pumps delivering 40,000 m³/h at 3.5 bar discharge.
                  </div>
                </div>

                <div
                  onClick={() => onSelectComponent(26)}
                  className="bg-slate-900 border border-slate-800 hover:border-blue-500 p-3.5 rounded-xl cursor-pointer"
                >
                  <div className="text-blue-400 font-bold mb-1">Station 3: Condenser (#26)</div>
                  <div className="text-slate-300 text-[11px] font-sans">
                    Water flows inside 20,000 titanium tubes absorbing 38°C condensation heat.
                  </div>
                </div>

                <div
                  onClick={() => onSelectComponent(37)}
                  className="bg-slate-900 border border-slate-800 hover:border-blue-500 p-3.5 rounded-xl cursor-pointer"
                >
                  <div className="text-blue-400 font-bold mb-1">Station 4: CW Outlet (#37)</div>
                  <div className="text-slate-300 text-[11px] font-sans">
                    2.4m penstock carrying warmed water (38°C) away from condenser waterbox.
                  </div>
                </div>

                <div
                  onClick={() => onSelectComponent(38)}
                  className="bg-slate-900 border border-slate-800 hover:border-blue-500 p-3.5 rounded-xl cursor-pointer"
                >
                  <div className="text-blue-400 font-bold mb-1">Station 5: Return Main (#38)</div>
                  <div className="text-slate-300 text-[11px] font-sans">
                    Overland pipeline lifting water to central riser culvert of cooling tower.
                  </div>
                </div>

                <div
                  onClick={() => onSelectComponent(33)}
                  className="bg-slate-900 border border-slate-800 hover:border-blue-500 p-3.5 rounded-xl cursor-pointer"
                >
                  <div className="text-blue-400 font-bold mb-1">Station 6: Cooling Tower (#33)</div>
                  <div className="text-slate-300 text-[11px] font-sans">
                    Natural draft hyperboloid tower cools water back to 28°C via evaporation.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'electrical' && (
            <div className="flex flex-col gap-6">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-emerald-400">
                  Shaft Mechanical Power Coupling & High-Voltage Grid Transmission
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  High, intermediate, and low-pressure steam turbines are coupled along a single rigid tandem shaft train
                  (#21) spinning at synchronous speed (3000 RPM for 50 Hz). The 2-pole synchronous Generator (#22) produces
                  22 kV AC power, which is stepped up by the Generator Transformer (#23) to 400 kV transmission level,
                  switched and protected in the Switchyard (#24), and delivered to the national power grid via Transmission
                  Lines (#25).
                </p>
              </div>

              {/* Single Line Electrical Diagram Flow */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-xl flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div
                    onClick={() => onSelectComponent(21)}
                    className="p-4 bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-xl cursor-pointer text-center flex-1 min-w-[140px]"
                  >
                    <div className="text-xs font-mono text-emerald-400 font-bold">#21 Shaft Train</div>
                    <div className="text-sm font-bold text-white mt-1">3000 RPM</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">500 MW Mechanical</div>
                  </div>

                  <div className="text-emerald-500 font-bold text-xl">➔</div>

                  <div
                    onClick={() => onSelectComponent(22)}
                    className="p-4 bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-xl cursor-pointer text-center flex-1 min-w-[140px]"
                  >
                    <div className="text-xs font-mono text-emerald-400 font-bold">#22 Alternator</div>
                    <div className="text-sm font-bold text-white mt-1">22 kV AC</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">588 MVA / 0.85 PF</div>
                  </div>

                  <div className="text-emerald-500 font-bold text-xl">➔</div>

                  <div
                    onClick={() => onSelectComponent(23)}
                    className="p-4 bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-xl cursor-pointer text-center flex-1 min-w-[140px]"
                  >
                    <div className="text-xs font-mono text-emerald-400 font-bold">#23 Transformer</div>
                    <div className="text-sm font-bold text-white mt-1">22 kV / 400 kV</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">OFAF Step-up</div>
                  </div>

                  <div className="text-emerald-500 font-bold text-xl">➔</div>

                  <div
                    onClick={() => onSelectComponent(24)}
                    className="p-4 bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-xl cursor-pointer text-center flex-1 min-w-[140px]"
                  >
                    <div className="text-xs font-mono text-emerald-400 font-bold">#24 Switchyard</div>
                    <div className="text-sm font-bold text-white mt-1">400 kV Substation</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">SF6 Breakers & Busbars</div>
                  </div>

                  <div className="text-emerald-500 font-bold text-xl">➔</div>

                  <div
                    onClick={() => onSelectComponent(25)}
                    className="p-4 bg-slate-950 border border-slate-800 hover:border-emerald-500 rounded-xl cursor-pointer text-center flex-1 min-w-[140px]"
                  >
                    <div className="text-xs font-mono text-emerald-400 font-bold">#25 Grid Lines</div>
                    <div className="text-sm font-bold text-white mt-1">National Grid</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">ACSR Quad-Bundles</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Click any equipment card or symbol to focus the 3D model camera on it</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
          >
            Back to 3D Scene
          </button>
        </div>
      </div>
    </div>
  );
};
