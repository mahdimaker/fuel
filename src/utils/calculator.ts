/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FuelEntry, VehicleInfo, HealthMetrics } from "../types";

/**
 * Calculates fuel consumption between consecutive entries.
 * Sorted chronologically.
 */
export function calculateLogEfficiencies(logs: FuelEntry[]): { id: string; efficiency: number; distance: number; isEstimated?: boolean }[] {
  if (logs.length === 0) return [];

  // Sort logs chronologically: odometer ascending, then date ascending
  const sorted = [...logs].sort((a, b) => {
    if (a.odometer !== b.odometer) return a.odometer - b.odometer;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const results: { id: string; efficiency: number; distance: number; isEstimated?: boolean }[] = [];
  
  let lastFullOdo: number | null = null;
  let accumulatedLitersSinceFull = 0;

  for (let i = 0; i < sorted.length; i++) {
    const curr = sorted[i];
    const isFirstLog = i === 0;
    
    // Determine Scenario A or D (missed refuel) to set as baseline
    const isScenarioD = !!curr.missedRefuel;
    const isBaseline = isFirstLog || isScenarioD;
    const isPartial = curr.fullTank === false;

    if (isBaseline) {
      if (!isPartial) {
        lastFullOdo = curr.odometer;
        accumulatedLitersSinceFull = 0;
      } else {
        lastFullOdo = null;
        accumulatedLitersSinceFull = curr.liters;
      }
    } else {
      if (lastFullOdo === null) {
        if (!isPartial) {
          lastFullOdo = curr.odometer;
          accumulatedLitersSinceFull = 0;
        } else {
          accumulatedLitersSinceFull += curr.liters;
        }
      } else {
        if (isPartial) {
          // Scenario C: Partial Refuel - accumulate fuel in background
          accumulatedLitersSinceFull += curr.liters;
        } else {
          // Full refuel with valid baseline: calculate!
          const distance = curr.odometer - lastFullOdo;
          if (distance > 0) {
            const efficiency = ((accumulatedLitersSinceFull + curr.liters) / distance) * 100;
            results.push({
              id: curr.id,
              efficiency,
              distance,
              isEstimated: false,
            });
          }
          // Reset baseline to current log
          lastFullOdo = curr.odometer;
          accumulatedLitersSinceFull = 0;
        }
      }
    }
  }

  // Fallback to estimated step-by-step if results.length is 0
  if (results.length === 0 && sorted.length >= 2) {
    for (let i = 1; i < sorted.length; i++) {
      const distance = sorted[i].odometer - sorted[i-1].odometer;
      if (distance > 0) {
        const efficiency = (sorted[i].liters / distance) * 100;
        results.push({
          id: sorted[i].id,
          efficiency,
          distance,
          isEstimated: true,
        });
      }
    }
  }

  return results;
}

/**
 * Analyzes the vehicle data and returns structural stats and health scores
 */
export function analyzeVehicleHealth(vehicle: VehicleInfo, logs: FuelEntry[], lang: 'fa' | 'en' = 'en'): HealthMetrics {
  // Defaults
  const defaultMetrics: HealthMetrics = {
    score: 100,
    level: 'excellent',
    fuelEfficiency: 0,
    fuelEfficiencyChange: 0,
    estimatedRange: 0,
    carbonFootprint: 0,
    statusBreakdown: {
      efficiency: 100,
      maintenance: 100,
      costScore: 100,
      drivingHabit: 100,
    },
    messages: [
      "Insufficient data for a detailed assessment. Please log at least 2 fueling entries."
    ],
  };

  if (!logs || logs.length === 0) {
    return {
      score: 0,
      level: 'excellent',
      fuelEfficiency: 0,
      fuelEfficiencyChange: 0,
      estimatedRange: 0,
      carbonFootprint: 0,
      statusBreakdown: {
        efficiency: 0,
        maintenance: 0,
        costScore: 0,
        drivingHabit: 0,
      },
      messages: [
        "Please log your first refueling entry to begin tracking vehicle health diagnostics."
      ],
      isUnrated: true,
    };
  }

  if (logs.length < 2) {
    // Single log
    const lastLog = logs[0];
    const estimatedRange = (vehicle.fuelCapacity || 50) * 12; // generic estimate 12km per liter
    const carbonFootprint = lastLog.liters * 2.31; // 2.31 kg CO2 per liter

    return {
      ...defaultMetrics,
      score: 85,
      level: 'good',
      estimatedRange,
      carbonFootprint,
      messages: [
        "First fueling logged! To calculate consumption efficiency and analyze performance, enter your next refueling at a higher odometer reading."
      ]
    };
  }

  // Calculate sorted logs
  const sortedLogs = [...logs].sort((a, b) => a.odometer - b.odometer);
  const totalDistance = sortedLogs[sortedLogs.length - 1].odometer - sortedLogs[0].odometer;
  
  // Let's calculate efficiencies between steps
  const stepEfficiencies = calculateLogEfficiencies(sortedLogs);

  // Un-skewed dynamic fuel efficiency calculation based on valid periods
  const totalValidDistance = stepEfficiencies.reduce((sum, s) => sum + s.distance, 0);
  const totalValidFuel = stepEfficiencies.reduce((sum, s) => sum + (s.efficiency / 100) * s.distance, 0);
  
  let overallEfficiency = totalValidDistance > 0 ? (totalValidFuel / totalValidDistance) * 100 : 0;
  let isEstimated = false;

  if (totalValidDistance === 0 && totalDistance > 0 && sortedLogs.length >= 2) {
    const totalLitersAddedAfterFirst = sortedLogs.slice(1).reduce((sum, log) => sum + log.liters, 0);
    overallEfficiency = (totalLitersAddedAfterFirst / totalDistance) * 100;
    isEstimated = true;
  }
  
  // Odometer health factor
  let odometerDeduction = 0;
  const currentOdometer = vehicle.currentOdometer || sortedLogs[sortedLogs.length - 1].odometer;
  if (currentOdometer > 250000) odometerDeduction = 25;
  else if (currentOdometer > 150000) odometerDeduction = 15;
  else if (currentOdometer > 80000) odometerDeduction = 8;
  
  // Fuel efficiency health factor
  // Average standard is ~7-9 L/100km. If efficiency is high, deduct
  let efficiencyDeduction = 0;
  if (overallEfficiency > 12) efficiencyDeduction = 20;
  else if (overallEfficiency > 9.5) efficiencyDeduction = 12;
  else if (overallEfficiency > 8.0) efficiencyDeduction = 5;

  // Consistency & fluctuation health factor (Is consumption rising?)
  let stabilityDeduction = 0;
  let fuelEfficiencyChange = 0;
  if (stepEfficiencies.length >= 2) {
    const lastEff = stepEfficiencies[stepEfficiencies.length - 1].efficiency;
    const prevEff = stepEfficiencies[stepEfficiencies.length - 2].efficiency;
    
    if (prevEff > 0) {
      fuelEfficiencyChange = ((lastEff - prevEff) / prevEff) * 100;
    }

    if (fuelEfficiencyChange > 15) {
      stabilityDeduction = 15; // sudden increase in consumption
    } else if (fuelEfficiencyChange > 5) {
      stabilityDeduction = 8; // moderate increase
    }
  }

  // Cost tracking health factor (Deduct if refueling cost is unusually high compared to mileage)
  const totalSpent = logs.reduce((sum, log) => sum + log.cost, 0);
  const costScore = Math.max(40, 100 - Math.min(60, (totalSpent / (totalDistance || 1)) * 10));

  // Calculate scores
  const efficiencyScore = Math.max(30, 100 - efficiencyDeduction);
  const maintenanceScore = Math.max(30, 100 - odometerDeduction);
  const drivingHabitScore = Math.max(40, 100 - stabilityDeduction);

  const finalScore = Math.round((efficiencyScore * 0.4) + (maintenanceScore * 0.3) + (costScore * 0.15) + (drivingHabitScore * 0.15));

  // Determine Level
  let level: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
  if (finalScore < 50) level = 'poor';
  else if (finalScore < 75) level = 'fair';
  else if (finalScore < 90) level = 'good';

  // Construct Custom Messages / Alerts
  const messages: string[] = [];
  
  if (isEstimated) {
    if (lang === 'fa') {
      messages.push(
        "📊 تحلیل بر اساس تخمین موقت:\nاز آنجا که هنوز باک را کاملاً پر نکرده‌اید، این تحلیل با دقت حدود ۸۰٪ و بر اساس الگوریتم تخمینی صادر شده است. برای دریافت گزارش قطعی و ۱۰۰٪ دقیق، در سوخت‌گیری بعدی باک را کامل پر کنید."
      );
    } else {
      messages.push(
        "📊 Analysis based on temporary estimation:\nSince you haven't fully filled the tank yet, this analysis is calculated with ~80% accuracy based on an estimated algorithm. To get a definitive and 100% accurate report, fill your tank completely on your next refuel."
      );
    }
  }

  if (overallEfficiency > 10) {
    messages.push(
      lang === 'fa' 
        ? "⚠️ مصرف سوخت بالاتر از حد استاندارد است. لطفا شمع‌ها، سنسور اکسیژن یا فیلتر سوخت را بررسی کنید."
        : "⚠️ Fuel consumption is higher than standard. Please check spark plugs, oxygen sensor, or fuel filter."
    );
  } else if (overallEfficiency > 0) {
    messages.push(
      lang === 'fa'
        ? "✅ راندمان مصرف سوخت در بازه بهینه و اقتصادی قرار دارد."
        : "✅ Fuel efficiency is in optimal and highly economic parameters."
    );
  }

  if (currentOdometer > 100000 && currentOdometer % 50000 < 5000) {
    messages.push(
      lang === 'fa'
        ? "🔧 کیلومترشمار دوره سرویس دوره‌ای را پیشنهاد می‌دهد (بررسی تسمه تایم و شمع‌ها)."
        : "🔧 Odometer suggests a routine maintenance cycle (timing belt, spark plugs checkup) is recommended."
    );
  }

  if (fuelEfficiencyChange > 10) {
    messages.push(
      lang === 'fa'
        ? "🚨 افزایش ناگهانی در مصرف سوخت در آخرین ثبت مشاهده شد. لطفا باد لاستیک‌ها را بررسی کنید."
        : "🚨 Sudden increase in fuel consumption detected in the last entry. Please check tire pressure."
    );
  }

  if (messages.length === 0 && overallEfficiency > 0) {
    messages.push(
      lang === 'fa'
        ? "🚘 عیب‌یابی تله‌متری عمومی وضعیت عالی را نشان می‌دهد. به ثبت منظم سوخت‌گیری ادامه دهید."
        : "🚘 General telemetry diagnostics indicate excellent status. Keep logging regularly."
    );
  }

  // Calculate estimated range with current tank fuel
  const currentFuelEstimation = vehicle.fuelCapacity * 0.75; // assume average 75% full
  const estimatedRange = overallEfficiency > 0 ? (currentFuelEstimation / overallEfficiency) * 100 : 350;

  // Carbon footprint per month (assuming 1000km drive per month)
  const carbonFootprint = (overallEfficiency / 100) * 1000 * 2.31; 

  return {
    score: finalScore,
    level,
    fuelEfficiency: overallEfficiency,
    fuelEfficiencyChange,
    estimatedRange,
    carbonFootprint,
    statusBreakdown: {
      efficiency: Math.round(efficiencyScore),
      maintenance: Math.round(maintenanceScore),
      costScore: Math.round(costScore),
      drivingHabit: Math.round(drivingHabitScore),
    },
    messages,
    isEstimated,
  };
}
