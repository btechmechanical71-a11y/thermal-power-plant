/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, X, Play, Pause, Compass } from 'lucide-react';

export interface TourStation {
  step: number;
  title: string;
  subsystem: string;
  componentIds?: number[];
  cameraPreset: string;
  focusId: number;
  description: string;
  engineeringTakeaway: string;
}

export const TOUR_STATIONS: TourStation[] = [
  {
    step: 1,
    title: 'Coal Handling & Pulverization',
    subsystem: 'Section A: Components #1 to #8',
    componentIds: [1, 2, 3, 4, 5, 6, 7, 8],
    cameraPreset: 'coal_yard',
    focusId: 6,
    description:
      'Raw lump coal arrives at the 30-day storage yard, travels along an enclosed conveyor to the crusher house (<20 mm), fills elevated bunkers, and is metered into vertical roller mills where grinding rollers pulverize it into talcum-fine powder (75% passing 200 mesh). Hot primary air dries and transports the fuel dust through rifled pipes to tangential corner burners.',
    engineeringTakeaway:
      'Pulverization increases the specific surface area of coal by over 10,000x, allowing near-instantaneous suspension combustion in the furnace fireball with <1% unburned carbon.',
  },
  {
    step: 2,
    title: 'Boiler Furnace & Water-Wall Tubes',
    subsystem: 'Section B: Components #9, #10',
    cameraPreset: 'boiler',
    focusId: 10,
    description:
      'The towering combustion chamber is lined entirely with membrane-welded water-wall tubes. Tilting burners form a swirling 1400°C fireball vortex in the center. Subcritical boiling occurs inside the tubes, generating a high-velocity two-phase steam-water mixture driven upward by natural thermosiphon buoyancy.',
    engineeringTakeaway:
      'Rifled internal tubing maintains nucleate boiling and prevents Departure from Nucleate Boiling (DNB), protecting steel tube walls against extreme radiant heat flux.',
  },
  {
    step: 3,
    title: 'Steam Drum & Phase Separation',
    subsystem: 'Section B: Component #11',
    cameraPreset: 'boiler',
    focusId: 11,
    description:
      'At the highest elevation sits the 120-ton forged alloy steel steam drum operating at 185 bar. Internal cyclone turbo-separators and chevron mist eliminators strip liquid water droplets from steam, discharging dry saturated steam into the superheaters while unevaporated water recirculates down large external downcomer pipes.',
    engineeringTakeaway:
      'Maintains steam moisture carryover <0.1% and silica <0.02 ppm, completely eliminating scaling deposits on turbine blades.',
  },
  {
    step: 4,
    title: 'Superheating & High-Pressure Expansion',
    subsystem: 'Sections B & C: Components #12, #18',
    cameraPreset: 'turbine',
    focusId: 18,
    description:
      'Saturated steam passes through pendant superheater banks, heating to 540°C at 170 bar. This pristine superheated steam expands across the High-Pressure (HP) turbine cylinder, converting thermal enthalpy into mechanical rotation before exhausting as cold reheat steam.',
    engineeringTakeaway:
      'Superheating dry steam increases the temperature difference of the Rankine cycle, elevating the theoretical Carnot efficiency limit according to the Second Law of Thermodynamics.',
  },
  {
    step: 5,
    title: 'Reheat Cycle & Multi-Cylinder Turbines',
    subsystem: 'Sections B & C: Components #13, #19, #20',
    cameraPreset: 'turbine',
    focusId: 19,
    description:
      'Cold reheat steam (335°C, 42 bar) returns to the boiler reheater, gaining heat back to 540°C. It expands through the double-flow Intermediate-Pressure (IP) turbine and cross-over duct into the Low-Pressure (LP) turbine with massive 40-inch titanium blades.',
    engineeringTakeaway:
      'Reheating improves unit thermal efficiency by 4-5% and keeps exhaust moisture below 10%, preventing severe droplet impingement erosion on last-stage turbine blades.',
  },
  {
    step: 6,
    title: 'Deep Vacuum Surface Condenser',
    subsystem: 'Section D: Components #26, #27',
    cameraPreset: 'turbine',
    focusId: 26,
    description:
      'Exhaust steam rushes into the surface condenser beneath the LP turbine, condensing against 20,000 cold titanium tubes under deep vacuum (0.07 bar abs, 38°C). Condensate extraction pumps (CEP) pump the pure water out of the hotwell.',
    engineeringTakeaway:
      'Operating at deep vacuum maximizes enthalpy drop across turbine blades. STRICT ISOLATION: Cooling water inside tubes never touches pure condensate on the shell side!',
  },
  {
    step: 7,
    title: 'Regenerative Feedwater Circuit & Deaerator',
    subsystem: 'Sections B & D: Components #28 to #32, #14',
    cameraPreset: 'boiler',
    focusId: 29,
    description:
      'Condensate is warmed through LP Heaters, scrubbed of corrosive dissolved O2 in the elevated Deaerator tray column (160°C), boosted to 210 bar by Boiler Feed Pumps (BFP), heated in HP Heaters (250°C), and enters the Economizer (305°C) to preheat before the steam drum.',
    engineeringTakeaway:
      'Regenerative feedwater heating utilizes turbine extraction bleed steam to avoid sending cold water into the boiler, drastically reducing fuel consumption and thermodynamic irreversibility.',
  },
  {
    step: 8,
    title: 'Hyperbolic Cooling Tower Circuit',
    subsystem: 'Section E: Components #33 to #38',
    cameraPreset: 'cooling',
    focusId: 33,
    description:
      'Warmed cooling water (38°C) is pumped to the cooling tower distribution deck, spraying over PVC fill. Ambient air drawn by natural chimney draft cools the water back to 28°C via latent evaporative cooling into the bottom basin, where CWP pumps deliver it back to the condenser.',
    engineeringTakeaway:
      'Natural draft hyperboloid shell design creates buoyant chimney draft with zero fan auxiliary power consumption, dissipating ~700 MWth of waste heat to atmosphere.',
  },
  {
    step: 9,
    title: 'ESP Flue Gas Cleaning & Chimney Dispersion',
    subsystem: 'Section F: Components #39 to #44',
    cameraPreset: 'chimney_esp',
    focusId: 39,
    description:
      'Flue gas preheats incoming air in the APH and enters the Electrostatic Precipitator (ESP), where -70 kV electrodes ionize dust particles. Collecting plates capture >99.8% of fly ash into heated hoppers for pneumatic conveying to cement silos. Induced draft fans push the clean gas out the 240 m chimney.',
    engineeringTakeaway:
      'Ensures particulate stack emissions stay below 30 mg/Nm³, complying with stringent global clean air environmental standards.',
  },
  {
    step: 10,
    title: 'Alternator, Transformer & 400 kV Grid',
    subsystem: 'Section C: Components #21 to #25',
    cameraPreset: 'switchyard',
    focusId: 22,
    description:
      'The tandem turbine shafts drive the hydrogen-cooled synchronous generator at 3000 RPM, producing 22 kV AC power. The Generator Transformer steps voltage up to 400 kV to minimize I²R transmission losses across the switchyard and regional electrical grid.',
    engineeringTakeaway:
      'Synchronous coupling locks generator frequency precisely to 50.0 Hz, maintaining power system stability and delivering 500 MW of continuous baseload energy.',
  },
];

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectComponent: (id: number) => void;
  onSelectCameraPreset: (preset: string) => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({
  isOpen,
  onClose,
  onSelectComponent,
  onSelectCameraPreset,
}) => {
  if (!isOpen) return null;

  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const currentStation = TOUR_STATIONS[currentStepIdx];

  const goToStation = (idx: number) => {
    const targetIdx = Math.max(0, Math.min(TOUR_STATIONS.length - 1, idx));
    setCurrentStepIdx(targetIdx);
    const station = TOUR_STATIONS[targetIdx];
    onSelectCameraPreset(station.cameraPreset);
    onSelectComponent(station.focusId);
  };

  React.useEffect(() => {
    if (isOpen) {
      goToStation(0);
    }
  }, [isOpen]);

  return (
    <div className="fixed top-18 left-4 z-40 w-[420px] max-w-[calc(100vw-2rem)] bg-slate-900/95 border border-cyan-500/60 rounded-2xl shadow-2xl p-4 text-slate-100 flex flex-col gap-3">
      {/* Top Banner */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            B.Tech Academic Project Tour
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close Tour"
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
        <span>Station {currentStepIdx + 1} of {TOUR_STATIONS.length}</span>
        <span className="text-cyan-400 font-semibold">{currentStation.subsystem}</span>
      </div>

      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-cyan-400 h-full transition-all duration-300"
          style={{ width: `${((currentStepIdx + 1) / TOUR_STATIONS.length) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2">
        <h3 className="text-base font-bold text-white">{currentStation.title}</h3>
        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-3 rounded-lg border border-slate-800">
          {currentStation.description}
        </p>

        <div className="p-2.5 bg-cyan-950/40 border border-cyan-700/50 rounded-lg text-xs">
          <span className="font-semibold text-cyan-300 block mb-0.5">Key Mechanical Engineering Principle:</span>
          <span className="text-slate-300 text-[11.5px] leading-relaxed">{currentStation.engineeringTakeaway}</span>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 mt-1">
        <button
          onClick={() => goToStation(currentStepIdx - 1)}
          disabled={currentStepIdx === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 text-xs font-medium rounded-lg transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous Station</span>
        </button>

        <span className="text-xs font-mono text-slate-500">
          {currentStepIdx + 1} / {TOUR_STATIONS.length}
        </span>

        {currentStepIdx < TOUR_STATIONS.length - 1 ? (
          <button
            onClick={() => goToStation(currentStepIdx + 1)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition shadow-md"
          >
            <span>Next Station</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-lg transition shadow-md"
          >
            <span>Finish Tour</span>
          </button>
        )}
      </div>
    </div>
  );
};
