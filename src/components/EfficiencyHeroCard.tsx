/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Gauge, Zap, TrendingUp, AlertTriangle, Leaf, Flame, Compass } from 'lucide-react';
import { Language } from '../utils/translations';
import { FuelEntry } from '../types';
import { calculateLogEfficiencies } from '../utils/calculator';

interface EfficiencyHeroCardProps {
  fuelEfficiency: number; // L/100km
  unitSystem: 'metric' | 'us' | 'uk';
  lang?: Language;
  logs?: FuelEntry[];
  isEstimated?: boolean;
  fuelCapacity?: number;
}

export default function EfficiencyHeroCard({ fuelEfficiency, unitSystem, logs = [], isEstimated = false, fuelCapacity }: EfficiencyHeroCardProps) {
  const isMetric = unitSystem === 'metric';
  const isUs = unitSystem === 'us';
  const isUk = unitSystem === 'uk';

  // Return calibration standby state if no data
  if (fuelEfficiency <= 0) {
    const isDiagnostic = logs && logs.length >= 2;

    if (isDiagnostic) {
      return (
        <div id="efficiency-hero-diagnostic" className="cyber-card p-6 md:p-8 rounded-2xl border border-rose-500/30 bg-slate-900/40 relative overflow-hidden transition-all duration-300 hover:border-rose-500/50">
          <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-rose-500/10 blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle size={22} className="text-rose-400 animate-pulse" />
              </div>
              <div className="text-left">
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-white">
                  Calculation Issue Detected
                </h2>
                <p className="text-xs md:text-sm text-rose-400 font-bold mt-1">
                  Unable to compute engine efficiency
                </p>
              </div>
            </div>
            <span className="text-[10px] md:text-xs font-black font-mono tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-1 rounded-md uppercase">
              DIAGNOSTIC
            </span>
          </div>

          <div className="space-y-4 my-5 text-left">
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
              You have logged at least 2 entries, but the system cannot calculate your consumption due to:
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/60 flex gap-3 text-left">
                <span className="text-rose-400 font-extrabold text-sm shrink-0">1.</span>
                <div className="flex-1 text-left">
                  <span className="text-sm font-extrabold text-slate-100 block">
                    Odometer didn't increase
                  </span>
                  <span className="text-xs md:text-sm text-slate-300 block mt-1.5 leading-relaxed font-medium">
                    The odometer of your second refueling must be higher than the first. Ensure you entered total odometer readings, not short trip distances.
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/60 flex gap-3 text-left">
                <span className="text-rose-400 font-extrabold text-sm shrink-0">2.</span>
                <div className="flex-1 text-left">
                  <span className="text-sm font-extrabold text-slate-100 block">
                    Partial refuel baseline issue
                  </span>
                  <span className="text-xs md:text-sm text-slate-300 block mt-1.5 leading-relaxed font-medium">
                    If you marked entries as partial refuels, the system must wait until you log a full tank refueling to finalize the consumption calculations.
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl text-center">
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                💡 Tip: Check your Refueling History table below. Review and delete any erroneous odometer entries, then re-add them.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div id="efficiency-hero-empty" className="cyber-card p-6 md:p-8 rounded-2xl border border-cyan-500/15 bg-slate-950/40 relative overflow-hidden transition-all duration-300 hover:border-cyan-500/30">
        <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none animate-pulse"></div>
        
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Gauge size={22} className="animate-pulse" />
            </div>
            <div className="text-left">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-white">
                Fuel Efficiency System
              </h2>
              <p className="text-xs md:text-sm text-slate-300">
                Calibrating & establishing baseline
              </p>
            </div>
          </div>
          <span className="text-[10px] md:text-xs font-black font-mono tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-md uppercase animate-pulse">
            CALIBRATING
          </span>
        </div>

        <div className="space-y-3.5 my-5">
          <div className="text-left">
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2.5">
              Consumption Tracking Roadmap
            </h4>
          </div>

          <div className="space-y-2.5">
            {/* Step 1 */}
            <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-left">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                ✓
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-bold text-slate-100 block">
                  Step 1: Reference point registered
                </span>
                <span className="text-xs md:text-sm text-slate-300 block mt-1 leading-relaxed font-medium">
                  First fill-up logged successfully to serve as our starting reference.
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3 p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 text-left">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center justify-center shrink-0">
                🔄
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-bold text-slate-100 block">
                  Step 2: Drive normally
                </span>
                <span className="text-xs md:text-sm text-slate-300 block mt-1 leading-relaxed font-medium">
                  Use your vehicle normally. The system will track the distance driven.
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-900 bg-slate-950/40 text-left">
              <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                3
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-bold text-slate-300 block">
                  Step 3: Log next fill-up to unlock
                </span>
                <span className="text-xs md:text-sm text-slate-400 block mt-1 leading-relaxed font-medium">
                  Log your next fill-up (preferably full) to compute and display live engine economy.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate MPG (US and UK)
  const mpg = 235.215 / fuelEfficiency;
  const ukMpg = 282.481 / fuelEfficiency;

  // Determine efficiency rating and zones based purely on L/100km (unit system independent)
  let rating: 'optimal' | 'moderate' | 'high' = 'moderate';
  if (fuelEfficiency < 7.0) rating = 'optimal';
  else if (fuelEfficiency > 10.0) rating = 'high';

  // Dynamic details & insight banner theme based on calculated L/100km
  const ratingDetails = {
    optimal: {
      label: 'OPTIMAL EFFICIENCY',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40',
      bannerBg: 'bg-emerald-950/30 border-emerald-500/20',
      icon: <Leaf size={16} className="text-emerald-400" />,
      message: 'Driving smooth like an EV!',
      thumbColor: 'bg-emerald-500',
      thumbGlow: 'none',
    },
    moderate: {
      label: 'OPTIMAL EFFICIENCY',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/40',
      bannerBg: 'bg-cyan-950/30 border-cyan-500/20',
      icon: <Zap size={16} className="text-cyan-400" />,
      message: 'Optimal Combustion Range',
      thumbColor: 'bg-cyan-500',
      thumbGlow: 'none',
    },
    high: {
      label: 'ABOVE AVERAGE',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/40',
      bannerBg: 'bg-amber-950/30 border-amber-500/20',
      icon: <TrendingUp size={16} className="text-amber-400" />,
      message: 'Above Average Consumption',
      thumbColor: 'bg-amber-500',
      thumbGlow: 'none',
    },
  }[rating];

  // Map progress bar percentage (0% to 100%)
  // L/100km: 4.0 (0%) to 14.0 (100%)
  let pct = 50;
  if (isMetric || isUk) {
    pct = Math.min(100, Math.max(0, ((fuelEfficiency - 4) / 10) * 100));
  } else {
    pct = Math.min(100, Math.max(0, ((58 - mpg) / 42) * 100));
  }

  // Next Tank Range calculations based on tank capacity and best vs worst consumption
  const capacity = fuelCapacity && fuelCapacity > 0 ? fuelCapacity : 50;
  const stepEffs = calculateLogEfficiencies(logs);
  let bestEff = fuelEfficiency * 0.85; // Default ~15% better on highway
  let worstEff = fuelEfficiency * 1.18; // Default ~18% worse in city traffic

  if (stepEffs.length >= 1) {
    const validEffs = stepEffs.map(s => s.efficiency).filter(e => e > 0);
    if (validEffs.length > 0) {
      const minHist = Math.min(...validEffs);
      const maxHist = Math.max(...validEffs);
      if (minHist !== maxHist) {
        bestEff = minHist;
        worstEff = maxHist;
      }
    }
  }

  // Range km calculation
  const cityRangeKm = (capacity / worstEff) * 100;
  const hwyRangeKm = (capacity / bestEff) * 100;

  // Formatted range strings depending on unitSystem
  let minDistanceStr = '';
  let maxDistanceStr = '';
  let tankLabel = '';

  if (isMetric) {
    minDistanceStr = `${Math.round(cityRangeKm).toLocaleString()} km`;
    maxDistanceStr = `${Math.round(hwyRangeKm).toLocaleString()} km`;
    tankLabel = `${capacity} L`;
  } else if (isUs) {
    minDistanceStr = `${Math.round(cityRangeKm * 0.621371).toLocaleString()} mi`;
    maxDistanceStr = `${Math.round(hwyRangeKm * 0.621371).toLocaleString()} mi`;
    tankLabel = `${(capacity * 0.264172).toFixed(1)} Gal`;
  } else {
    minDistanceStr = `${Math.round(cityRangeKm * 0.621371).toLocaleString()} mi`;
    maxDistanceStr = `${Math.round(hwyRangeKm * 0.621371).toLocaleString()} mi`;
    tankLabel = `${(capacity * 0.219969).toFixed(1)} UK Gal`;
  }

  return (
    <div id="efficiency-hero-card" className="cyber-card p-5 sm:p-6 md:p-8 rounded-2xl border border-indigo-500/15 bg-slate-900/40 relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30">
      {/* Decorative background glow */}
      <div className={`absolute -right-24 -top-24 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20 animate-pulse ${
        rating === 'optimal' ? 'bg-emerald-500' : rating === 'moderate' ? 'bg-cyan-500' : 'bg-amber-500'
      }`}></div>

      {/* Header Un-crowded & Badge Position (2-Row Layout) */}
      <div className="flex flex-col gap-2 mb-5">
        {/* Row 1: Badge positioned at top right */}
        <div className="flex justify-end">
          <span className={`text-[11px] sm:text-xs font-black px-3 py-1 rounded-full border tracking-wider uppercase transition-all shrink-0 whitespace-nowrap ${ratingDetails.badgeColor}`}>
            {ratingDetails.label}
          </span>
        </div>

        {/* Row 2: Icon, Title & Subtitle with full width */}
        <div className="flex items-center gap-3 w-full">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <Gauge size={22} />
          </div>
          <div className="w-full">
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-white leading-tight">
              Fuel Consumption
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 leading-snug">
              Calculated cumulative consumption
            </p>
          </div>
        </div>
      </div>

      {/* Main Metric Display with Glowing Gradient Effect & Monospace Font */}
      <div className="flex flex-col items-center justify-center my-6 space-y-2">
        <div className="flex items-baseline justify-center gap-2 font-mono">
          {isMetric ? (
            <>
              <span className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                {fuelEfficiency.toFixed(1)}
              </span>
              <span className="text-sm md:text-base font-extrabold text-slate-400 font-sans uppercase tracking-wider whitespace-nowrap">L/100km</span>
            </>
          ) : isUs ? (
            <>
              <span className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                {mpg.toFixed(1)}
              </span>
              <span className="text-sm md:text-base font-extrabold text-slate-400 font-sans uppercase tracking-wider whitespace-nowrap">US MPG</span>
            </>
          ) : (
            <>
              <span className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                {ukMpg.toFixed(1)}
              </span>
              <span className="text-sm md:text-base font-extrabold text-slate-400 font-sans uppercase tracking-wider whitespace-nowrap">UK MPG</span>
            </>
          )}
        </div>
        <p className="text-xs md:text-sm text-slate-400 text-center max-w-md font-medium px-4">
          Average cumulative fuel efficiency of your vehicle
        </p>
      </div>

      {/* Consumption Range Gauge Slider (Thicker Bar) */}
      <div className="space-y-2.5">
        <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1 font-mono">
          <span>{isMetric ? '4.0 L' : isUs ? '58 MPG (Eco)' : '70 MPG (Eco)'}</span>
          <span>{isMetric ? '9.0 L' : isUs ? '26 MPG' : '31 MPG'}</span>
          <span>{isMetric ? '14.0 L' : isUs ? '16 MPG (V8)' : '20 MPG (V8)'}</span>
        </div>
        <div className="h-4 w-full bg-slate-950 rounded-full relative border border-slate-800/90 p-0.5 shadow-inner">
          {/* Colorful gradient gauge bar (Green -> Yellow -> Red) */}
          <div className="h-full w-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 rounded-full"></div>
          
          {/* Position Indicator Thumb with Glowing Outline */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-slate-950 flex items-center justify-center transition-all duration-700"
            style={{ 
              left: `${pct}%`,
              boxShadow: ratingDetails.thumbGlow 
            }}
          >
            <div className={`w-2.5 h-2.5 rounded-full ${ratingDetails.thumbColor}`}></div>
          </div>
        </div>
      </div>

      {/* Next Tank Estimated Range Span Block */}
      <div className="mt-5 p-3.5 sm:p-4 rounded-xl bg-slate-950/70 border border-indigo-500/20 hover:border-indigo-500/40 transition-all space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Compass size={15} />
            </div>
            <span className="font-extrabold text-slate-100 uppercase tracking-wider text-[11px] sm:text-xs">
              Next Tank Estimated Range Span
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] font-mono font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1 rounded-md whitespace-nowrap shrink-0">
            {`Tank: ${tankLabel}`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
          {/* City / Worst Case */}
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-amber-400 font-bold mb-1">
              <span>City / Traffic</span>
              <span className="text-[9px] font-mono uppercase px-1 py-0.2 bg-amber-500/20 rounded text-amber-300">MIN</span>
            </div>
            <span className="text-sm sm:text-base font-black font-mono text-amber-300 tracking-tight">
              ~{minDistanceStr}
            </span>
          </div>

          {/* Highway / Best Case */}
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-emerald-400 font-bold mb-1">
              <span>Highway / Eco</span>
              <span className="text-[9px] font-mono uppercase px-1 py-0.2 bg-emerald-500/20 rounded text-emerald-300">MAX</span>
            </div>
            <span className="text-sm sm:text-base font-black font-mono text-emerald-300 tracking-tight">
              ~{maxDistanceStr}
            </span>
          </div>
        </div>

        <p className="text-[10px] sm:text-[11px] text-slate-400 leading-relaxed font-medium">
          💡 {`Estimated span based on ${tankLabel} capacity across best (${bestEff.toFixed(1)}L) and worst (${worstEff.toFixed(1)}L) recorded efficiency.`}
        </p>
      </div>

      {/* Temporary Estimation Alert */}
      {isEstimated && (
        <div id="temporary-estimation-alert" className="mt-5 p-3.5 border border-cyan-500/20 bg-cyan-950/20 rounded-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-cyan-500"></div>
          <div className="flex gap-3">
            <div className="p-1 rounded bg-cyan-500/10 text-cyan-400 self-start">
              <Zap size={16} className="animate-pulse" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400">
                Analysis Based on Temporary Estimation
              </h4>
              <p className="text-[11px] md:text-xs text-slate-300 mt-1 leading-relaxed font-medium">
                Since you haven't fully filled the tank yet, this analysis is calculated with ~80% accuracy based on an estimated algorithm. To get a definitive and 100% accurate report, fill your tank completely on your next refuel.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sleek Compact Dynamic Insight Banner */}
      <div className={`mt-5 px-3.5 py-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${ratingDetails.bannerBg}`}>
        <div className="shrink-0 p-1.5 rounded-md bg-slate-950/60 border border-white/5">
          {ratingDetails.icon}
        </div>
        <p className="text-xs text-slate-200 font-semibold truncate">
          {ratingDetails.message}
        </p>
      </div>
    </div>
  );
}

