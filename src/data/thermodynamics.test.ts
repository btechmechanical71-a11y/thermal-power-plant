/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePlantThermodynamics,
  getRankineCycleStatePoints,
  validateEngineeringLayout,
} from './thermodynamics';
import { PLANT_COMPONENTS } from './plantComponents';

test('engineering validation: all 50 components exist and are connected correctly', () => {
  const result = validateEngineeringLayout();
  assert.equal(result.isValid, true, `Validation errors: ${result.errors.join('; ')}`);
  assert.equal(result.totalComponents, 50);
});

test('component IDs are strictly contiguous from 1 to 50', () => {
  assert.equal(PLANT_COMPONENTS.length, 50);
  for (let i = 0; i < 50; i++) {
    assert.equal(PLANT_COMPONENTS[i].id, i + 1);
  }
});

test('thermodynamics: rated 500 MW calculates correct steam flow, heat rate and efficiency', () => {
  const state = calculatePlantThermodynamics(500);
  assert.equal(state.electricalOutputMW, 500);
  assert.equal(state.mainSteamTempC, 540);
  assert.equal(state.reheatSteamTempC, 540);
  assert.ok(state.steamFlowTpH >= 1400 && state.steamFlowTpH <= 1650);
  assert.ok(state.thermalEfficiencyPercent >= 38 && state.thermalEfficiencyPercent <= 43);
  assert.ok(state.coalFeedRateTpH > 150 && state.coalFeedRateTpH < 250);
  assert.ok(state.heatRateKcalPerKWh >= 2000 && state.heatRateKcalPerKWh <= 2300);
});

test('rankine cycle state points: valid enthalpy expansion and temperature progression', () => {
  const points = getRankineCycleStatePoints(1.0);
  assert.equal(points.length, 10);
  
  // Superheater enthalpy must be higher than HP exhaust
  const h_superheat = points[0].enthalpyKJPerKg;
  const h_cold_reheat = points[1].enthalpyKJPerKg;
  assert.ok(h_superheat > h_cold_reheat, 'Main steam enthalpy should drop across HP turbine');

  // Hot reheat enthalpy must be higher than cold reheat
  const h_hot_reheat = points[2].enthalpyKJPerKg;
  assert.ok(h_hot_reheat > h_cold_reheat, 'Reheater should add enthalpy to steam');

  // LP exhaust enthalpy must drop significantly
  const h_lp_exhaust = points[4].enthalpyKJPerKg;
  assert.ok(h_hot_reheat > h_lp_exhaust, 'Steam should expand to low enthalpy in LP turbine');

  // Condensate liquid enthalpy should be lowest
  const h_condensate = points[5].enthalpyKJPerKg;
  assert.ok(h_lp_exhaust > h_condensate, 'Condenser rejects latent heat');
});

test('safety: river water intake is never connected directly to boiler water walls or drum', () => {
  const riverComp = PLANT_COMPONENTS.find((c) => c.id === 45)!;
  assert.ok(riverComp, 'River intake must exist');
  assert.ok(!riverComp.downstreamIds.includes(9), 'River water must not bypass treatment to furnace');
  assert.ok(!riverComp.downstreamIds.includes(10), 'River water must not bypass treatment to water-walls');
  assert.ok(!riverComp.downstreamIds.includes(11), 'River water must not bypass treatment to steam drum');
});
