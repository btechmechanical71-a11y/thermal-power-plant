/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PlantSubsystem =
  | 'coal_handling'
  | 'boiler_combustion'
  | 'turbine_generator'
  | 'condensate_feedwater'
  | 'cooling_water'
  | 'flue_gas_ash'
  | 'water_treatment';

export type FlowCircuit =
  | 'all'
  | 'fuel_coal'
  | 'main_steam_reheat'
  | 'condensate_feedwater'
  | 'cooling_water'
  | 'flue_gas_air'
  | 'ash_handling'
  | 'electrical'
  | 'water_treatment';

export interface ComponentItem {
  id: number;
  name: string;
  category: PlantSubsystem;
  circuit: FlowCircuit;
  code: string; // e.g., 'CH-01', 'BL-09', etc.
  shortDescription: string;
  engineeringDetails: string;
  operatingTemp: string;
  operatingPressure: string;
  flowMedium: string;
  designMaterial: string;
  keySafetyNotes: string;
  upstreamIds: number[];
  downstreamIds: number[];
  worldPosition: [number, number, number]; // [x, y, z] target in 3D scene
  cameraPosition: [number, number, number]; // [x, y, z] ideal camera vantage
  cutawayPart?: boolean; // whether it reveals internals during cutaway mode
}

export type ViewMode = 'full_plant' | 'cutaway_internals' | 'schematic_diagrams' | 'flow_tracer';

export type DiagramTab = 'steam_water' | 'fuel_flue_gas' | 'cooling_water' | 'electrical';

export interface PlantOperatingState {
  electricalOutputMW: number;
  steamFlowTpH: number;
  mainSteamTempC: number;
  mainSteamPressureBar: number;
  reheatSteamTempC: number;
  reheatSteamPressureBar: number;
  condenserVacuumKPa: number;
  coolingWaterTempInC: number;
  coolingWaterTempOutC: number;
  boilerEfficiencyPercent: number;
  thermalEfficiencyPercent: number;
  coalFeedRateTpH: number;
  heatRateKcalPerKWh: number;
}
