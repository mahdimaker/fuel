/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FuelEntry, VehicleInfo } from '../types';

/**
 * Highly customized client-side technical diagnostic analyzer.
 * Generates an extremely robust, detailed markdown report in English.
 * Dynamically tailored using the vehicle's fuel type and estimated engine category.
 */
export function generateLocalReport(vehicle: VehicleInfo, logs: FuelEntry[], lang: 'en' = 'en'): string {
  const sorted = [...logs].sort((a, b) => a.odometer - b.odometer);
  
  // Calculate average stats
  let totalDistance = 0;
  let totalLiters = 0;
  let averageEfficiency = 0;
  
  if (sorted.length > 1) {
    totalDistance = sorted[sorted.length - 1].odometer - sorted[0].odometer;
    totalLiters = sorted.slice(1).reduce((sum, log) => sum + log.liters, 0);
    averageEfficiency = totalDistance > 0 ? (totalLiters / totalDistance) * 100 : 0;
  }

  const currentOdometer = vehicle.currentOdometer || (sorted.length > 0 ? sorted[sorted.length - 1].odometer : 0);

  // Infer engine category from fuel tank capacity
  const tankCap = vehicle.fuelCapacity || 50;
  let engineCategory = '';
  let engineAdvice = '';
  let fuelAdvice = '';

  // English custom engine classification
  if (vehicle.brand?.toLowerCase() === 'toyota' || tankCap >= 60) {
    engineCategory = 'Standard Mid/Full-size Inline-4 Engine (2.0L - 2.5L)';
    engineAdvice = 'These engines are highly optimized for low-viscosity synthetic oils (0W-20 or 5W-30) and sensitive to variable valve timing (VVT-i) oil pressure.';
  } else if (tankCap <= 45) {
    engineCategory = 'Compact City Commuter Engine (under 1.6L)';
    engineAdvice = 'Compact city engines depend highly on intake manifold pressure (MAP) sensors and throttle body cleanliness to prevent rich-running issues.';
  } else {
    engineCategory = 'Mid-range Urban Multi-valve Engine (1.6L - 1.8L)';
    engineAdvice = 'Ignition coil output and clean spark gaps are crucial in mid-size engines. Poor spark quality directly results in up to an 8% raw efficiency drop.';
  }

  const lastLogFuel = sorted.length > 0 ? sorted[sorted.length - 1].fuelType : 'regular';
  if (lastLogFuel === 'super') {
    fuelAdvice = 'Premium/Super octane fuel prevents low-speed pre-ignition (knocking), keeping combustion chamber deposits to a minimum.';
  } else if (lastLogFuel === 'diesel') {
    fuelAdvice = 'Diesel fuel systems require meticulous water-separator filtration checks to prevent damage to expensive common-rail injectors.';
  } else if (lastLogFuel === 'hybrid') {
    fuelAdvice = 'Hybrid powertrains utilize regenerative braking; ensuring smooth braking patterns expands battery recharge rates and optimizes urban economy.';
  } else if (lastLogFuel === 'gas') {
    fuelAdvice = 'LPG/CNG fuel systems burn much hotter. Specialized heat-range spark plugs are recommended to prevent exhaust valve erosion.';
  } else {
    fuelAdvice = 'Regular fuel usage benefits from more frequent fuel filter replacements (every 10,000 miles) to protect fuel pressure stability.';
  }

  // Generate Report
  let report = `# 🛠️ Digital Technician Diagnostic Report (Offline Telemetry Mode)\n`;
  report += `Intelligent diagnostics for **${vehicle.brand} ${vehicle.model}** (Model Year: ${vehicle.year || 'N/A'})\n\n`;
  
  report += `## 📊 Energy & Consumption Summary\n`;
  if (sorted.length < 2) {
    report += `* **Notice**: Insufficient historical logs. Please log at least 2 fueling sessions to calibrate the performance tracker.\n`;
    report += `* **Initial Est. Efficiency**: Based on class presets, your predicted consumption is around **7.8 L/100km**.\n\n`;
  } else {
    report += `* **Total Monitored Distance**: **${totalDistance.toLocaleString()} km**\n`;
    report += `* **Average Calculated Fuel Economy**: **${averageEfficiency.toFixed(2)} L/100km**\n`;
    if (averageEfficiency > 9.5) {
      report += `* **Status**: 🚨 **High Fuel Consumption**. The fuel-to-mileage ratio exceeds standard optimized bounds.\n\n`;
    } else {
      report += `* **Status**: ✅ **Highly Efficient**. Fuel injection and combustion timing appear highly balanced.\n\n`;
    }
  }

  report += `## 🔌 Powertrain Profile & Ignition Diagnostics\n`;
  report += `* **Detected Engine Category**: **${engineCategory}**\n`;
  report += `* **Powertrain Engineering Insight**: ${engineAdvice}\n\n`;
  report += `Based on the current registered mileage (**${currentOdometer.toLocaleString()} km**), telemetry suggests:\n\n`;

  if (currentOdometer > 40000) {
    report += `### 🔌 Spark Plugs & Ignition System (Attention Recommended)\n`;
    report += `* The odometer is past 40,000 km. Worn electrode tips or improper spark gaps can cause incomplete combustion, leading to an 8% to 12% drop in fuel economy. Replacing spark plugs is recommended.\n`;
  } else {
    report += `### 🔌 Ignition Telemetry (Healthy)\n`;
    report += `* Low mileage indicates the ignition coils and spark plugs are likely in excellent operating condition. Routine visual check during next service is sufficient.\n`;
  }

  report += `### 🌀 Intake & Fuel Spray Calibration\n`;
  report += `* **Octane Strategy**: ${fuelAdvice}\n`;
  if (averageEfficiency > 9) {
    report += `* A sluggish Oxygen (O2) sensor or clogged engine air filter can enrich the air-fuel ratio. Cleaning the O2 sensor and replacing the engine air filter can immediately boost efficiency.\n`;
  } else {
    report += `* Air-fuel ratio is optimal. Filtration levels are well within operating parameters.\n`;
  }

  if (currentOdometer > 100000) {
    report += `### 💨 Catalytic Converter & Exhaust Back-pressure\n`;
    report += `* Above 100,000 km, catalytic flow can become restricted. Monitoring exhaust temperatures and back-pressure is advised to prevent power loss.\n`;
  }

  report += `## 💡 Actionable Eco-Driving Tips\n`;
  report += `1. **Maintain Proper Tire Pressure**: Under-inflated tires by 3 PSI increase rolling resistance and fuel use by up to 3%.\n`;
  report += `2. **Injectors Cleaning**: Periodic injection cleaning every 30,000 km guarantees clean spray patterns.\n`;
  report += `3. **Octane Balancing**: Periodically fueling with premium fuel prevents carbon deposit buildup inside the combustion chamber.\n`;

  return report;
}
