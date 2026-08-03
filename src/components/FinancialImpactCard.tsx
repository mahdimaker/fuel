/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  DollarSign, TrendingUp, Coffee, Tv, ShieldAlert, CheckCircle2, Coins, Calendar,
  Fuel, PiggyBank, Sparkles, Navigation, Calculator
} from 'lucide-react';
import { FuelEntry, VehicleInfo } from '../types';
import { Language } from '../utils/translations';

interface FinancialImpactCardProps {
  logs: FuelEntry[];
  fuelEfficiency: number; // L/100km
  unitSystem: 'metric' | 'us' | 'uk';
  lang?: Language;
  vehicle?: VehicleInfo;
}

export default function FinancialImpactCard({ logs, fuelEfficiency, unitSystem, lang = 'en', vehicle }: FinancialImpactCardProps) {
  const isMetric = unitSystem === 'metric';
  const isUs = unitSystem === 'us';
  const isUk = unitSystem === 'uk';

  // Interactive trip distance estimator state
  const [customTripDist, setCustomTripDist] = useState<number>(50);

  if (logs.length < 2 || fuelEfficiency <= 0) {
    const isDiagnostic = logs.length >= 2;
    if (isDiagnostic) {
      return (
        <div id="financial-impact-diagnostic" className="cyber-card p-5 sm:p-6 md:p-8 rounded-2xl border border-rose-500/30 bg-slate-900/80 relative overflow-hidden transition-all duration-300 hover:border-rose-500/50">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-[0.07] pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 shrink-0">
              <ShieldAlert size={22} className="text-rose-400 animate-pulse" />
            </div>
            <div className="text-left">
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-white leading-tight">
                FINANCIAL IMPACT
              </h2>
              <p className="text-xs text-rose-400 font-bold mt-0.5">
                Standby - pending valid consumption calibration
              </p>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-900/60 pt-4 text-left">
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
              Because engine fuel efficiency could not be computed (due to identical/decreasing odometer entries or partial refuel flags), the financial analyzer is in standby.
            </p>
            
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-900 font-medium">
              💡 <span className="font-semibold text-slate-200">Guide:</span>{' '}
              To unlock financial leak analytics, please verify odometer entries under Refueling History. Odometer values must strictly increase chronologically.
            </p>
          </div>
        </div>
      );
    }

    const firstLog = logs.length > 0 ? logs[0] : null;
    const odoUnit = isMetric ? 'km' : 'mi';
    const volUnit = isUs ? 'gal' : 'L';
    
    const displayOdo = firstLog ? (isMetric ? firstLog.odometer : firstLog.odometer * 0.621371) : 0;
    const displayVol = firstLog ? (isUs ? firstLog.liters * 0.264172 : firstLog.liters) : 0;

    return (
      <div id="financial-impact-empty" className="cyber-card p-5 sm:p-6 md:p-8 rounded-2xl border border-indigo-500/15 bg-slate-950/40 backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-[0.07] pointer-events-none"></div>
        <div className="absolute -left-20 -top-20 w-44 h-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)] shrink-0">
            <DollarSign size={22} className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          </div>
          <div className="text-left">
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-white leading-tight">
              FINANCIAL IMPACT
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 leading-snug">
              Calculating financial efficiency and deviations
            </p>
          </div>
        </div>

        {firstLog ? (
          <div className="bg-slate-950/60 border border-slate-900 p-3.5 rounded-xl space-y-3 mb-4 text-left">
            <span className="text-xs text-slate-300 font-bold uppercase tracking-wider block">
              Baseline Tank Reference Details
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-2.5 bg-slate-900/40 border border-slate-900 rounded-lg text-center">
                <span className="text-[10px] md:text-xs text-slate-400 font-bold block mb-1">
                  Odometer
                </span>
                <span className="text-xs md:text-sm font-black font-mono text-cyan-400">
                  {Math.round(displayOdo).toLocaleString()} <span className="text-[9px] font-sans text-slate-500">{odoUnit}</span>
                </span>
              </div>
              <div className="p-2.5 bg-slate-900/40 border border-slate-900 rounded-lg text-center">
                <span className="text-[10px] md:text-xs text-slate-400 font-bold block mb-1">
                  Fuel Volume
                </span>
                <span className="text-xs md:text-sm font-black font-mono text-indigo-400">
                  {displayVol.toFixed(1)} <span className="text-[9px] font-sans text-slate-500">{volUnit}</span>
                </span>
              </div>
              <div className="p-2.5 bg-slate-900/40 border border-slate-900 rounded-lg text-center">
                <span className="text-[10px] md:text-xs text-slate-400 font-bold block mb-1">
                  Cost Paid
                </span>
                <span className="text-xs md:text-sm font-black font-mono text-emerald-400">
                  {firstLog.cost.toLocaleString()} <span className="text-[9px] font-sans text-slate-500">{isUk ? '£' : '$'}</span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-3xl font-black text-slate-600 font-mono">---</div>
            <p className="text-xs text-slate-400 mt-2">
              No refueling entries registered.
            </p>
          </div>
        )}

        <div className="space-y-3 border-t border-slate-900/60 pt-4 text-left">
          <h4 className="text-xs font-black text-white uppercase tracking-widest block">
            Financial Saving Potential (Preview)
          </h4>
          
          <div className="grid grid-cols-2 gap-3 opacity-65">
            <div className="p-3 bg-slate-950/30 border border-dashed border-slate-800 rounded-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/5 text-amber-500/40 border border-amber-500/10">
                <Coffee size={16} />
              </div>
              <div>
                <span className="text-[10px] md:text-xs text-slate-400 font-bold block uppercase">Premium Coffee</span>
                <span className="text-sm font-extrabold font-mono text-slate-500 block">-- Cups</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/30 border border-dashed border-slate-800 rounded-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/5 text-purple-500/40 border border-purple-500/10">
                <Tv size={16} />
              </div>
              <div>
                <span className="text-[10px] md:text-xs text-slate-400 font-bold block uppercase">Monthly Sub</span>
                <span className="text-sm font-extrabold font-mono text-slate-500 block">-- Months</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-900 font-medium">
            💡 <span className="font-semibold text-slate-200">System Insight:</span>{' '}
            As soon as you log your second full-tank refueling, actual fuel cost per mile/km and cash leak rates will unlock.
          </p>
        </div>
      </div>
    );
  }

  // Conversion rates
  const KM_TO_MILES = 0.621371;

  // Chronologically sorted logs
  const sorted = [...logs].sort((a, b) => a.odometer - b.odometer);
  const totalDistance = sorted[sorted.length - 1].odometer - sorted[0].odometer; // in km
  const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
  const totalLiters = logs.reduce((sum, log) => sum + log.liters, 0);

  // Compute Cost per Distance Unit
  let costPerDistanceUnit = 0;
  let costUnitLabel = '';
  
  if (isMetric) {
    costPerDistanceUnit = totalDistance > 0 ? totalCost / totalDistance : 0;
    costUnitLabel = '€ / km';
  } else if (isUs) {
    const distanceMiles = totalDistance * KM_TO_MILES;
    costPerDistanceUnit = distanceMiles > 0 ? totalCost / distanceMiles : 0;
    costUnitLabel = '$ / mi';
  } else {
    const distanceMiles = totalDistance * KM_TO_MILES;
    costPerDistanceUnit = distanceMiles > 0 ? totalCost / distanceMiles : 0;
    costUnitLabel = '£ / mi';
  }

  // Calculate Wasted Money against 7.5 L/100km baseline
  const baselineConsumption = 7.5;
  let wastedCost = 0;
  let wastedLiters = 0;

  if (fuelEfficiency > baselineConsumption) {
    const extraLitersPer100km = fuelEfficiency - baselineConsumption;
    wastedLiters = extraLitersPer100km * (totalDistance / 100);
    const avgPricePerLiter = totalLiters > 0 ? totalCost / totalLiters : 0;
    wastedCost = wastedLiters * avgPricePerLiter;
  }

  // Equivalent calculations
  const coffeeCost = isUk ? 4.0 : 5.0;
  const subscriptionCost = isUk ? 12.0 : 15.0;
  const coffeeCount = Math.max(0, Math.floor(wastedCost / coffeeCost));
  const subCount = Math.max(0, Math.floor(wastedCost / subscriptionCost));

  // Currency symbols & Baseline text
  const currencySymbol = isMetric ? '€' : isUk ? '£' : '$';
  let baselineText = '';

  if (isMetric) {
    if (fuelEfficiency <= 7.5) {
      baselineText = `Below 7.5 L/100km baseline limit`;
    } else {
      baselineText = `+€${wastedCost.toFixed(2)} above limit`;
    }
  } else if (isUs) {
    const mpgEfficiency = fuelEfficiency > 0 ? 235.215 / fuelEfficiency : 0;
    if (mpgEfficiency >= 31.4) {
      baselineText = `Below 31.4 MPG baseline limit`;
    } else {
      baselineText = `+$${wastedCost.toFixed(2)} above limit`;
    }
  } else {
    const ukMpgEfficiency = fuelEfficiency > 0 ? 282.481 / fuelEfficiency : 0;
    if (ukMpgEfficiency >= 37.66) {
      baselineText = `Below 37.7 UK MPG baseline limit`;
    } else {
      baselineText = `+£${wastedCost.toFixed(2)} above limit`;
    }
  }

  const costDisplayVal = `${currencySymbol}${costPerDistanceUnit.toFixed(3)}`;
  const costPer100Val = `${currencySymbol}${(costPerDistanceUnit * 100).toFixed(2)}`;

  const wastedCostDisplayVal = wastedCost <= 0 
    ? 'No Waste Detected' 
    : `${currencySymbol}${wastedCost.toFixed(2)} Wasted`;

  const moneyWastedLabel = 'HIDDEN FUEL WASTE COST';
  const costPerDistanceLabel = isMetric ? 'COST PER 1 KM DRIVEN' : 'COST PER 1 MILE DRIVEN';
  const distUnitName = isMetric ? 'km' : 'mi';

  // Daily & Monthly fuel expenditure projection
  let avgDailyDistanceKm = 0;
  if (sorted.length >= 2 && totalDistance > 0) {
    const firstDate = new Date(sorted[0].date).getTime();
    const lastDate = new Date(sorted[sorted.length - 1].date).getTime();
    const daysDiff = Math.max(1, Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
    avgDailyDistanceKm = totalDistance / daysDiff;
  }
  if (avgDailyDistanceKm <= 0) {
    avgDailyDistanceKm = 30;
  }

  const costPerKm = totalDistance > 0 ? totalCost / totalDistance : 0;
  const dailyEstCost = avgDailyDistanceKm * costPerKm;
  const monthlyEstCost = dailyEstCost * 30.4; // Avg days per month
  const annualEstCost = monthlyEstCost * 12; // 365 days

  // 10% Eco-Driving Savings
  const annualSavings10Pct = annualEstCost * 0.10;
  const monthlySavings10Pct = monthlyEstCost * 0.10;

  let dailyEstCostStr = '';
  let monthlyEstCostStr = '';
  let annualEstCostStr = '';
  let annualSavings10Str = '';
  let dailyDistStr = '';

  const currSym = currencySymbol;

  if (isMetric) {
    dailyEstCostStr = `${currSym}${dailyEstCost < 10 ? dailyEstCost.toFixed(2) : Math.round(dailyEstCost).toLocaleString()}`;
    monthlyEstCostStr = `${currSym}${monthlyEstCost < 10 ? monthlyEstCost.toFixed(2) : Math.round(monthlyEstCost).toLocaleString()}`;
    annualEstCostStr = `${currSym}${Math.round(annualEstCost).toLocaleString()}`;
    annualSavings10Str = `${currSym}${Math.round(annualSavings10Pct).toLocaleString()}`;
    dailyDistStr = `${Math.round(avgDailyDistanceKm)} km/day`;
  } else if (isUs) {
    dailyEstCostStr = `$${dailyEstCost < 10 ? dailyEstCost.toFixed(2) : Math.round(dailyEstCost).toLocaleString()}`;
    monthlyEstCostStr = `$${monthlyEstCost < 10 ? monthlyEstCost.toFixed(2) : Math.round(monthlyEstCost).toLocaleString()}`;
    annualEstCostStr = `$${Math.round(annualEstCost).toLocaleString()}`;
    annualSavings10Str = `$${Math.round(annualSavings10Pct).toLocaleString()}`;
    dailyDistStr = `${Math.round(avgDailyDistanceKm * KM_TO_MILES)} mi/day`;
  } else {
    dailyEstCostStr = `£${dailyEstCost < 10 ? dailyEstCost.toFixed(2) : Math.round(dailyEstCost).toLocaleString()}`;
    monthlyEstCostStr = `£${monthlyEstCost < 10 ? monthlyEstCost.toFixed(2) : Math.round(monthlyEstCost).toLocaleString()}`;
    annualEstCostStr = `£${Math.round(annualEstCost).toLocaleString()}`;
    annualSavings10Str = `£${Math.round(annualSavings10Pct).toLocaleString()}`;
    dailyDistStr = `${Math.round(avgDailyDistanceKm * KM_TO_MILES)} mi/day`;
  }

  // Full Tank Financial & Range Calculations
  const tankCapacity = vehicle?.fuelCapacity || 50; // Liters
  const avgPricePerLiter = totalLiters > 0 ? totalCost / totalLiters : 1.55;
  const fullTankCost = tankCapacity * avgPricePerLiter;
  const fullTankRangeKm = fuelEfficiency > 0 ? (tankCapacity / fuelEfficiency) * 100 : 0;
  const fullTankRangeDisplay = isMetric ? Math.round(fullTankRangeKm) : Math.round(fullTankRangeKm * KM_TO_MILES);

  let fullTankCostStr = '';
  if (isMetric) {
    fullTankCostStr = `€${fullTankCost < 100 ? fullTankCost.toFixed(2) : Math.round(fullTankCost).toLocaleString()}`;
  } else if (isUs) {
    const costInUs = (tankCapacity * 0.264172) * (totalCost / (totalLiters * 0.264172 || 1));
    fullTankCostStr = `$${costInUs < 100 ? costInUs.toFixed(2) : Math.round(costInUs).toLocaleString()}`;
  } else {
    fullTankCostStr = `£${fullTankCost < 100 ? fullTankCost.toFixed(2) : Math.round(fullTankCost).toLocaleString()}`;
  }

  let avgFuelUnitPriceStr = '';
  if (isUs) {
    const totalGal = totalLiters * 0.264172;
    const avgPricePerGal = totalGal > 0 ? totalCost / totalGal : 3.85;
    avgFuelUnitPriceStr = `$${avgPricePerGal.toFixed(2)} / gal`;
  } else if (isUk) {
    avgFuelUnitPriceStr = `£${avgPricePerLiter.toFixed(2)} / L`;
  } else {
    avgFuelUnitPriceStr = `€${avgPricePerLiter.toFixed(2)} / L`;
  }

  // Interactive Trip Cost Calculation
  const estimatedTripCost = customTripDist * costPerDistanceUnit;
  const estimatedTripCostStr = `${currSym}${estimatedTripCost < 10 ? estimatedTripCost.toFixed(2) : estimatedTripCost.toFixed(1)}`;

  return (
    <div id="financial-impact-card" className="cyber-card p-5 sm:p-6 md:p-8 rounded-2xl border border-indigo-500/15 bg-slate-950/80 relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30 text-left">
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-[0.07] pointer-events-none"></div>

      {/* Header & Status Badge */}
      <div className="mb-5">
        <div className="flex justify-end mb-2">
          <span className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-black px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
            wastedCost <= 0
              ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
              : wastedCost > 15
              ? 'text-rose-400 border-rose-500/30 bg-rose-950/20 shadow-[0_0_10px_rgba(244,63,94,0.15)]'
              : 'text-amber-400 border-amber-500/30 bg-amber-950/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
          }`}>
            {wastedCost <= 0 ? (
              <CheckCircle2 size={11} />
            ) : (
              <ShieldAlert size={11} />
            )}
            <span>
              {wastedCost <= 0
                ? 'Optimal - No Leak'
                : wastedCost > 15
                ? 'Critical Cost Leak'
                : 'Moderate Leak'
              }
            </span>
          </span>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)] shrink-0 mt-0.5">
            <DollarSign size={22} className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-white leading-tight">
              FINANCIAL IMPACT & ANALYTICS
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 leading-snug">
              Cost per distance, projections, full-tank value & eco-savings
            </p>
          </div>
        </div>
      </div>

      {/* Row 1: Unified Metric Blocks (Side-by-Side) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
        {/* Left Block: Cost Per Distance Unit (Option 1 Metric) */}
        <div className="bg-slate-950/60 backdrop-blur-md border border-slate-800/80 hover:border-slate-700 p-4 rounded-xl flex items-center justify-between transition-all">
          <div>
            <span className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
              {costPerDistanceLabel}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                {costDisplayVal}
              </span>
              <span className="text-xs text-slate-400 font-bold font-mono tracking-wider">/ {distUnitName}</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 font-semibold block mt-1">
              {costPer100Val} per 100 {distUnitName}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-[0_0_10px_rgba(20,184,166,0.25)] shrink-0">
            <Coins size={20} className="text-teal-400 drop-shadow-[0_0_6px_rgba(20,184,166,0.6)]" />
          </div>
        </div>

        {/* Right Block: Estimated Money Wasted */}
        <div className={`p-4 rounded-xl backdrop-blur-md border flex items-center justify-between transition-all ${
          wastedCost <= 0
            ? 'bg-emerald-950/20 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
            : wastedCost > 15
            ? 'bg-rose-950/20 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
            : 'bg-amber-950/20 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
        }`}>
          <div>
            <span className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
              {moneyWastedLabel}
            </span>
            <span className={`text-base sm:text-xl font-black font-mono tracking-tight block ${
              wastedCost <= 0
                ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]'
                : wastedCost > 15
                ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                : 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
            }`}>
              {wastedCostDisplayVal}
            </span>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
              {baselineText}
            </span>
          </div>

          <div className={`p-2.5 rounded-xl border shrink-0 ${
            wastedCost <= 0
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
              : wastedCost > 15
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
          }`}>
            {wastedCost <= 0 ? (
              <CheckCircle2 size={20} className="text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
            ) : (
              <TrendingUp size={20} className={wastedCost > 15 ? 'text-rose-400' : 'text-amber-400'} />
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Full Tank Value & Range (OPTION 3) */}
      <div className="my-4 p-4 rounded-xl bg-slate-950/70 border border-indigo-500/20 hover:border-indigo-500/40 transition-all space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Fuel size={15} />
            </div>
            <span className="font-extrabold text-slate-100 uppercase tracking-wider text-[11px] sm:text-xs">
              Full Tank Financial & Range Value
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-mono font-bold text-indigo-300 bg-indigo-950/40 border border-indigo-500/30 px-2 py-0.5 rounded-md">
            {tankCapacity}L Capacity
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
          {/* Tank Cost */}
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold block mb-1">Cost to Fill Tank</span>
            <span className="text-base sm:text-lg font-black font-mono text-indigo-300 tracking-tight">
              ~{fullTankCostStr}
            </span>
          </div>

          {/* Full Tank Distance Range */}
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <span className="text-[10px] text-slate-400 font-bold block mb-1">Full Tank Distance</span>
            <span className="text-base sm:text-lg font-black font-mono text-cyan-300 tracking-tight">
              ~{fullTankRangeDisplay} <span className="text-xs font-sans text-slate-400">{distUnitName}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Daily, Monthly, Annual Projections + 10% Eco-Savings (OPTION 2) */}
      <div className="my-4 p-4 rounded-xl bg-slate-950/70 border border-teal-500/20 hover:border-teal-500/40 transition-all space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Calendar size={15} />
            </div>
            <span className="font-extrabold text-slate-100 uppercase tracking-wider text-[11px] sm:text-xs">
              Projected Ongoing Fuel Expenses
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-mono font-bold text-teal-400 bg-teal-950/40 border border-teal-500/30 px-2 py-0.5 rounded-md">
            {dailyDistStr}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 pt-0.5">
          {/* Daily */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between items-center text-center gap-1.5">
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-teal-500/20 border border-teal-500/30 rounded-md text-teal-300 font-bold whitespace-nowrap">24H</span>
            <span className="text-base sm:text-lg font-black font-mono text-teal-300 tracking-tight">
              ~{dailyEstCostStr}
            </span>
          </div>

          {/* Monthly */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between items-center text-center gap-1.5">
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded-md text-indigo-300 font-bold whitespace-nowrap">30 DAYS</span>
            <span className="text-base sm:text-lg font-black font-mono text-indigo-300 tracking-tight">
              ~{monthlyEstCostStr}
            </span>
          </div>

          {/* Annual */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between items-center text-center gap-1.5">
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 rounded-md text-purple-300 font-bold whitespace-nowrap">1 YEAR</span>
            <span className="text-base sm:text-lg font-black font-mono text-purple-300 tracking-tight">
              ~{annualEstCostStr}
            </span>
          </div>
        </div>

        {/* 10% Eco-Driving Savings Banner */}
        <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between gap-2 border-b border-emerald-500/20 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                <PiggyBank size={15} />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-emerald-300/90 uppercase tracking-wide">
                10% Eco-Driving Savings Potential
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase hidden sm:inline">Save Up To</span>
              <span className="text-sm sm:text-base font-black font-mono text-emerald-400 bg-emerald-950/90 border border-emerald-500/50 px-2.5 py-1 rounded-lg shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                ~{annualSavings10Str}<span className="text-xs font-sans font-semibold text-slate-400">/yr</span>
              </span>
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-medium">
            Save money effortlessly by avoiding aggressive acceleration & maintaining optimal tire pressure.
          </p>
        </div>
      </div>

      {/* Row 4: Trip Cost Estimator (OPTION 1 INTERACTIVE FEATURE) */}
      <div className="my-4 p-4 rounded-xl bg-slate-950/70 border border-cyan-500/20 hover:border-cyan-500/40 transition-all space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Calculator size={15} />
            </div>
            <span className="font-extrabold text-slate-100 uppercase tracking-wider text-[11px] sm:text-xs">
              Trip Cost Estimator
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded-md">
            Interactive
          </span>
        </div>

        {/* Quick Distance Presets */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Presets:</span>
          {[20, 50, 150, 300, 500].map((dist) => (
            <button
              key={dist}
              onClick={() => setCustomTripDist(dist)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all shrink-0 cursor-pointer ${
                customTripDist === dist
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-900 border border-slate-800 text-slate-300 hover:border-cyan-500/40'
              }`}
            >
              {dist} {distUnitName}
            </button>
          ))}
        </div>

        {/* Distance Slider & Custom Calculation Output */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          <div className="sm:col-span-2 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold">
              <span>Select Distance:</span>
              <span className="font-mono text-cyan-400">{customTripDist} {distUnitName}</span>
            </div>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={customTripDist}
              onChange={(e) => setCustomTripDist(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-center sm:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Estimated Trip Cost</span>
            <span className="text-lg sm:text-xl font-black font-mono text-cyan-300">
              {estimatedTripCostStr}
            </span>
          </div>
        </div>
      </div>

      {/* Visual alternative purchasing opportunities (Coffee & Subscriptions) */}
      {wastedCost > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-900">
          <h4 className="text-xs font-extrabold text-white uppercase tracking-widest block">
            Alternative Purchasing Opportunities Lost
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all duration-300 ${
              coffeeCount > 0 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' 
                : 'bg-slate-950/30 border-slate-900/40 text-slate-600'
            }`}>
              <div className={`p-2 rounded-lg ${coffeeCount > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-900 text-slate-700'}`}>
                <Coffee size={16} />
              </div>
              <div>
                <span className="text-[10px] md:text-xs text-slate-400 font-bold block uppercase">Premium Coffee</span>
                <span className="text-sm sm:text-base font-extrabold font-mono tracking-tight block">
                  {coffeeCount > 0 ? `+${coffeeCount}` : '0'} Cups
                </span>
              </div>
            </div>

            <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all duration-300 ${
              subCount > 0 
                ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' 
                : 'bg-slate-950/30 border-slate-900/40 text-slate-600'
            }`}>
              <div className={`p-2 rounded-lg ${subCount > 0 ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-900 text-slate-700'}`}>
                <Tv size={16} />
              </div>
              <div>
                <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase block">Monthly Subscription</span>
                <span className="text-sm sm:text-base font-extrabold font-mono tracking-tight block">
                  {subCount > 0 ? `+${subCount}` : '0'} Months
                </span>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-900 font-medium">
            💡 Eco-Finance Action: By tuning your engine and keeping tires correctly inflated, you can plug this cash leak and save on future commutes.
          </p>
        </div>
      )}
    </div>
  );
}
