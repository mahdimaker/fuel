/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Gauge, SlidersHorizontal, Sun, Wind, Box } from 'lucide-react';
import { FuelEntry } from '../types';
import { Language } from '../utils/translations';

interface SpeedSimulatorCardProps {
  logs: FuelEntry[];
  fuelEfficiency: number; // L/100km
  unitSystem: 'metric' | 'us' | 'uk';
  lang?: Language;
}

export default function SpeedSimulatorCard({ logs, fuelEfficiency, unitSystem, lang }: SpeedSimulatorCardProps) {
  const isMetric = unitSystem === 'metric';
  const isUs = unitSystem === 'us';
  const isUk = unitSystem === 'uk';

  // Constants
  const KM_TO_MILES = 0.621371;
  const TOMAN_TO_USD = 1 / 60000;

  // Use a fallback fuelEfficiency if there's none
  const eff = fuelEfficiency > 0 ? fuelEfficiency : 8.0;

  // Environmental Variables States
  const [acOn, setAcOn] = useState<boolean>(false);
  const [windowsOpen, setWindowsOpen] = useState<boolean>(false);
  const [roofRackLoaded, setRoofRackLoaded] = useState<boolean>(false);

  // Get average fuel price from logs, fallback if none
  const getAveragePrice = () => {
    if (!logs || logs.length === 0) return 1.25; // default gas price
    const totalCost = logs.reduce((sum, l) => sum + l.cost, 0);
    const totalLiters = logs.reduce((sum, l) => sum + l.liters, 0);
    return totalLiters > 0 ? totalCost / totalLiters : 1.25;
  };

  const avgPricePerLiter = getAveragePrice();

  // Speed slider values range
  // Metric: 90 to 140 km/h (default: 100)
  // US: 55 to 85 mph (default: 65)
  const minSpeed = isMetric ? 90 : 55;
  const maxSpeed = isMetric ? 140 : 85;
  const [speed, setSpeed] = useState<number>(isMetric ? 100 : 65);

  // Convert current speed to MPH for unified calculations
  const speedMph = isMetric ? speed * KM_TO_MILES : speed;

  // Environmental Drag Penalties
  const acPenaltyPct = acOn ? 8 : 0;
  // Windows drag increases with speed
  const windowsPenaltyPct = windowsOpen ? Math.round(5 + (speedMph > 50 ? (speedMph - 50) * 0.15 : 0)) : 0;
  const roofRackPenaltyPct = roofRackLoaded ? 12 : 0;
  const totalEnvPenaltyPct = acPenaltyPct + windowsPenaltyPct + roofRackPenaltyPct;

  // Efficiency Penalty Model:
  // Base optimal speed is 55 mph (90 km/h).
  // Aerodynamic drag increases quadratically above 55 mph.
  const mphDiff = Math.max(0, speedMph - 55);
  const speedPenaltyPct = mphDiff * 1.2 + Math.pow(mphDiff, 1.6) * 0.15; // e.g. at 75mph: (20 * 1.2) + (20^1.6 * 0.15) = 24 + 18 = 42% increase! Extremely realistic.
  
  const penaltyPct = speedPenaltyPct + totalEnvPenaltyPct;

  // Calculate extra fuel and money burned over 100 miles/km driven
  const baseLitersPer100km = eff;
  const currentLitersPer100km = baseLitersPer100km * (1 + penaltyPct / 100);

  // Extra cost per 100 km or 100 miles driven
  let extraCost = 0;
  let unitLabel = '';
  let currencyLabel = isMetric ? '€' : isUs ? '$' : '£';

  if (isMetric) {
    const extraLitersPer100km = currentLitersPer100km - baseLitersPer100km;
    extraCost = extraLitersPer100km * avgPricePerLiter;
    unitLabel = lang === 'fa' ? '۱۰۰ کیلومتر رانندگی' : '100 km driving';
  } else {
    // 100 miles driven (US or UK)
    const distanceKm = 100 / KM_TO_MILES; // miles to km
    const baseLiters = (baseLitersPer100km / 100) * distanceKm;
    const extraLiters = baseLiters * (penaltyPct / 100);
    extraCost = extraLiters * avgPricePerLiter;
    unitLabel = lang === 'fa' ? '۱۰۰ مایل رانندگی' : '100 miles driving';
  }

  // Fraction across slider range
  const fraction = Math.min(1, Math.max(0, (speed - minSpeed) / (maxSpeed - minSpeed)));

  // Speed Severity Levels:
  // Safe Speed: <= 95 km/h (or <= 60 mph)
  // Moderate Speed: 96-115 km/h (or 61-72 mph)
  // High Drag / Waste Speed: > 115 km/h (or > 72 mph)
  const normSpeed = isMetric ? speed : speed * (90 / 55);

  let speedSeverity = {
    textColor: 'text-emerald-400',
    glowShadow: 'drop-shadow-[0_0_14px_rgba(16,185,129,0.85)]',
    accentHex: '#10b981',
    trackGlow: '0 0 16px rgba(16,185,129,0.6)',
    badgeText: lang === 'fa' ? 'سرعت ایمن و بهینه' : 'Safe Speed',
    badgeStyle: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
  };

  if (normSpeed > 115) {
    speedSeverity = {
      textColor: 'text-rose-400',
      glowShadow: 'drop-shadow-[0_0_14px_rgba(244,63,94,0.85)]',
      accentHex: '#f43f5e',
      trackGlow: '0 0 16px rgba(244,63,94,0.6)',
      badgeText: lang === 'fa' ? 'افت شدید راندمان (High Drag)' : 'High Drag / Waste',
      badgeStyle: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
    };
  } else if (normSpeed > 95) {
    speedSeverity = {
      textColor: 'text-amber-400',
      glowShadow: 'drop-shadow-[0_0_14px_rgba(245,158,11,0.85)]',
      accentHex: '#f59e0b',
      trackGlow: '0 0 16px rgba(245,158,11,0.6)',
      badgeText: lang === 'fa' ? 'سرعت متعادل' : 'Moderate Speed',
      badgeStyle: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    };
  }

  return (
    <div id="speed-simulator-card" className="cyber-card p-6 md:p-8 rounded-2xl border border-cyan-500/15 bg-slate-900/40 relative overflow-hidden transition-all duration-300 hover:border-cyan-500/30">
      {/* Visual neon light overlay */}
      <div className="absolute -right-20 -bottom-20 w-44 h-44 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Gauge size={22} className="animate-spin-slow" />
        </div>
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-widest text-white">
            {lang === 'fa' ? 'شبیه‌ساز سرعت و راندمان سوخت' : 'Speed vs. Efficiency Simulator'}
          </h2>
          <p className="text-[11px] text-slate-500">
            {lang === 'fa' ? 'تأثیر مقاومت هوا بر مصرف سوخت در سرعت‌های مختلف' : 'Visualize how speed alters wind resistance and fuel economy'}
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-300 leading-relaxed mb-6">
        {lang === 'fa' 
          ? 'بیشتر خودروها تا سرعت ۹۰ کیلومتر بر ساعت (۵۵ مایل) در بهترین وضعیت آیرودینامیک قرار دارند. افزایش سرعت بیش از این حد، مقاومت هوا را به صورت درجه دوم افزایش می‌دهد.'
          : 'Most vehicles are aerodynamically optimized up to 55 mph (90 km/h). Increasing velocity past this threshold compounds drag quadratically.'}
      </p>

      {/* Interactive Simulation Dashboard Grid */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-slate-950/60 border border-slate-900/60 p-4 rounded-xl text-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
            {lang === 'fa' ? 'افزایش مصرف سوخت' : 'Fuel Burn Increase'}
          </span>
          <span className="text-2xl font-black font-mono text-rose-400 block tracking-tight">
            +{penaltyPct.toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block font-semibold">
            {lang === 'fa' ? 'سوخت اضافه سوخته‌شده' : 'Extra gasoline burnt'}
          </span>
        </div>

        <div className="bg-slate-950/60 border border-slate-900/60 p-4 rounded-xl text-center">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">
            {lang === 'fa' ? 'هزینه اتلاف شده' : 'Wasted Cost Leak'}
          </span>
          <span className="text-2xl font-black font-mono text-amber-400 block tracking-tight">
            {currencyLabel === '$' ? `$${extraCost.toFixed(2)}` : currencyLabel === '£' ? `£${extraCost.toFixed(2)}` : `${extraCost.toFixed(2)} ${currencyLabel}`}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block font-semibold">
            {lang === 'fa' ? `به ازای ${unitLabel}` : `Per ${unitLabel}`}
          </span>
        </div>
      </div>

      {/* ENVIRONMENTAL VARIABLES SECTION */}
      <div className="bg-slate-950/70 border border-slate-900/80 p-4 rounded-2xl space-y-3 mb-6 shadow-sm">
        <div className="flex items-center gap-2 text-amber-400/90 font-extrabold text-xs uppercase tracking-widest">
          <SlidersHorizontal size={14} className="text-amber-400" />
          <span>{lang === 'fa' ? 'متغیرهای محیطی (ENVIRONMENTAL VARIABLES)' : 'ENVIRONMENTAL VARIABLES'}</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
          {/* A/C Toggle */}
          <button
            type="button"
            id="toggle-ac-environmental-variable"
            onClick={() => setAcOn(!acOn)}
            className={`p-2 sm:p-3 rounded-xl border text-[10px] sm:text-xs font-bold flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer active:scale-95 text-center leading-tight ${
              acOn
                ? 'bg-blue-600 border-blue-400 !text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400'
                : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Sun size={16} className={acOn ? '!text-white animate-spin-slow shrink-0' : 'text-slate-400 shrink-0'} />
            <span className={acOn ? 'tracking-wide !text-white' : 'tracking-wide'}>
              {acOn 
                ? (lang === 'fa' ? `کولر روشن (+${acPenaltyPct}٪)` : `A/C ON (+${acPenaltyPct}%)`)
                : (lang === 'fa' ? 'کولر خاموش' : 'A/C OFF')}
            </span>
          </button>

          {/* Windows Toggle */}
          <button
            type="button"
            id="toggle-windows-environmental-variable"
            onClick={() => setWindowsOpen(!windowsOpen)}
            className={`p-2 sm:p-3 rounded-xl border text-[10px] sm:text-xs font-bold flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer active:scale-95 text-center leading-tight ${
              windowsOpen
                ? 'bg-amber-600 border-amber-400 !text-white shadow-lg shadow-amber-500/25 ring-1 ring-amber-400'
                : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Wind size={16} className={windowsOpen ? '!text-white shrink-0' : 'text-slate-400 shrink-0'} />
            <span className={windowsOpen ? 'tracking-wide !text-white' : 'tracking-wide'}>
              {windowsOpen 
                ? (lang === 'fa' ? `پنجره باز (+${windowsPenaltyPct}٪)` : `Windows Open (+${windowsPenaltyPct}%)`)
                : (lang === 'fa' ? 'پنجره‌ها بسته' : 'Windows Closed')}
            </span>
          </button>

          {/* Roof Rack Toggle */}
          <button
            type="button"
            id="toggle-roofrack-environmental-variable"
            onClick={() => setRoofRackLoaded(!roofRackLoaded)}
            className={`p-2 sm:p-3 rounded-xl border text-[10px] sm:text-xs font-bold flex flex-col items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer active:scale-95 text-center leading-tight ${
              roofRackLoaded
                ? 'bg-purple-600 border-purple-400 !text-white shadow-lg shadow-purple-500/25 ring-1 ring-purple-400'
                : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800/80 text-slate-300 hover:text-white'
            }`}
          >
            <Box size={16} className={roofRackLoaded ? '!text-white shrink-0' : 'text-slate-400 shrink-0'} />
            <span className={roofRackLoaded ? 'tracking-wide !text-white' : 'tracking-wide'}>
              {roofRackLoaded 
                ? (lang === 'fa' ? `باربند سقف (+${roofRackPenaltyPct}٪)` : `Roof Rack (+${roofRackPenaltyPct}%)`)
                : (lang === 'fa' ? 'بدون باربند' : 'Roof Rack None')}
            </span>
          </button>
        </div>
      </div>

      {/* Speed Slider Control */}
      <div className="space-y-5 bg-slate-950/60 p-5 sm:p-6 rounded-2xl border border-slate-900/80 backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              {lang === 'fa' ? 'تنظیم سرعت پیمایش:' : 'Set Your Cruising Speed:'}
            </span>
            <span className={`inline-block text-[10px] font-extrabold px-3 py-0.5 rounded-full border tracking-wide uppercase ${speedSeverity.badgeStyle}`}>
              {speedSeverity.badgeText}
            </span>
          </div>

          <div className="flex items-baseline">
            <span className={`text-4xl sm:text-5xl font-mono font-black tracking-tight transition-all duration-300 ${speedSeverity.textColor} ${speedSeverity.glowShadow}`}>
              {speed}
            </span>
            <span className="text-sm sm:text-base font-mono font-bold text-slate-400 ml-2">
              {isMetric ? 'km/h' : 'mph'}
            </span>
          </div>
        </div>

        {/* High-Tech Glowing Range Slider */}
        <div className="relative py-2 flex items-center">
          {/* Subtle glowing track blur underneath */}
          <div 
            className="absolute inset-x-0 h-3 rounded-full blur-sm opacity-70 transition-all duration-200 pointer-events-none"
            style={{
              background: `linear-gradient(to right, #10b981 0%, ${speedSeverity.accentHex} ${fraction * 100}%, #0f172a ${fraction * 100}%, #0f172a 100%)`,
              boxShadow: speedSeverity.trackGlow
            }}
          ></div>

          <input
            id="speed-simulator-slider"
            type="range"
            min={minSpeed}
            max={maxSpeed}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="cyber-slider w-full h-3 rounded-full appearance-none cursor-pointer outline-none relative z-10"
            style={{
              '--slider-glow': speedSeverity.accentHex,
              background: `linear-gradient(to right, #10b981 0%, ${speedSeverity.accentHex} ${fraction * 100}%, #0f172a ${fraction * 100}%, #0f172a 100%)`
            } as React.CSSProperties}
          />
        </div>

        {/* Clean Monospace Ticks */}
        <div className="flex justify-between items-center text-xs font-mono font-bold text-slate-400 px-1">
          <div className="flex flex-col items-start">
            <span className="text-slate-300 font-mono tracking-tight">{minSpeed} {isMetric ? 'km/h' : 'mph'}</span>
            <span className="text-[10px] text-slate-500 font-sans font-normal">{lang === 'fa' ? 'حداقل' : 'Min'}</span>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-cyan-400 font-mono font-black flex items-center gap-1.5 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block"></span>
              {isMetric ? '90 km/h' : '55 mph'}
            </span>
            <span className="text-[10px] text-cyan-400/90 font-bold uppercase tracking-wider font-mono">{lang === 'fa' ? 'محدوده بهینه (Sweet Spot)' : 'Sweet Spot'}</span>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-slate-300 font-mono tracking-tight">{maxSpeed} {isMetric ? 'km/h' : 'mph'}</span>
            <span className="text-[10px] text-slate-500 font-sans font-normal">{lang === 'fa' ? 'حداکثر' : 'Max'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

