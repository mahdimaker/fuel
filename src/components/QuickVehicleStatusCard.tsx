/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Car, Gauge, Fuel, Flame, ShieldCheck, Zap, Settings, 
  TrendingDown, KeyRound, Radio
} from 'lucide-react';
import { VehicleInfo, HealthMetrics, FuelEntry } from '../types';
import { Language } from '../utils/translations';

interface QuickVehicleStatusCardProps {
  vehicle: VehicleInfo;
  healthMetrics: HealthMetrics;
  logs: FuelEntry[];
  unitSystem: 'metric' | 'us' | 'uk';
  lang: Language;
  onNavigateToVehicles: () => void;
  onNavigateToRefuel: () => void;
}

export default function QuickVehicleStatusCard({
  vehicle,
  healthMetrics,
  logs,
  unitSystem,
  lang,
  onNavigateToVehicles,
  onNavigateToRefuel,
}: QuickVehicleStatusCardProps) {
  const isMetric = unitSystem === 'metric';
  const isUs = unitSystem === 'us';
  const isUk = unitSystem === 'uk';
  const KM_TO_MILES = 0.621371;

  // Conversion helpers
  const displayOdo = isMetric 
    ? (vehicle.currentOdometer || 0)
    : Math.round((vehicle.currentOdometer || 0) * KM_TO_MILES);
  const odoUnit = isMetric ? (lang === 'fa' ? 'کیلومتر' : 'km') : (lang === 'fa' ? 'مایل' : 'mi');

  // Efficiency formatting
  let effValue = '---';
  let effUnit = '';
  if (healthMetrics.fuelEfficiency > 0) {
    if (isMetric) {
      effValue = healthMetrics.fuelEfficiency.toFixed(1);
      effUnit = 'L/100km';
    } else if (isUs) {
      effValue = (235.215 / healthMetrics.fuelEfficiency).toFixed(1);
      effUnit = 'US MPG';
    } else {
      effValue = (282.481 / healthMetrics.fuelEfficiency).toFixed(1);
      effUnit = 'UK MPG';
    }
  }

  // Range formatting
  const displayRange = isMetric 
    ? Math.round(healthMetrics.estimatedRange || 0)
    : Math.round((healthMetrics.estimatedRange || 0) * KM_TO_MILES);

  // VHS Level badge color & styles (flat, no glowing shadow)
  const levelBadge = healthMetrics.level === 'excellent'
    ? { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-400', label: lang === 'fa' ? 'عالی' : 'Excellent' }
    : healthMetrics.level === 'good'
      ? { bg: 'bg-cyan-500/10', border: 'border-cyan-500/40', text: 'text-cyan-400', label: lang === 'fa' ? 'خوب' : 'Good' }
      : healthMetrics.level === 'fair'
        ? { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-400', label: lang === 'fa' ? 'متوسط' : 'Fair' }
        : { bg: 'bg-rose-500/10', border: 'border-rose-500/40', text: 'text-rose-400', label: lang === 'fa' ? 'نیاز به تعمیر' : 'Needs Check' };

  return (
    <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 overflow-hidden">
      
      {/* HEADER */}
      <div className="relative z-10 flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          {/* Car Icon */}
          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0 text-cyan-400">
            <Car size={24} />
          </div>

          <div>
            {/* Model Name */}
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {vehicle.brand ? `${vehicle.brand} ${vehicle.model}` : (lang === 'fa' ? 'خودروی ثبت نشده' : 'BMW 1 Series')}
            </h2>

            {/* Year Badge + Active Telemetry */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-400 font-bold tracking-wider">
                {vehicle.year || '2026'}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="lowercase text-slate-300 font-mono text-[11px]">
                  {lang === 'fa' ? 'تله‌متری زنده فعال' : 'active telemetry'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Cog Button */}
        <button
          onClick={onNavigateToVehicles}
          className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-all cursor-pointer shrink-0"
          title={lang === 'fa' ? 'مدیریت مشخصات خودرو' : 'Manage Vehicle Specs'}
        >
          <Settings size={18} />
        </button>
      </div>

      {/* GRID DATA */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        
        {/* KPI 1: Odometer */}
        <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium tracking-wide">{lang === 'fa' ? 'کارکرد فعلی' : 'Odometer'}</span>
            <Gauge size={15} className="text-cyan-400" />
          </div>
          <p className="text-base sm:text-lg font-mono font-black text-slate-100 tracking-tight">
            {displayOdo.toLocaleString()} <span className="text-xs font-sans font-normal text-slate-400">{odoUnit}</span>
          </p>
        </div>

        {/* KPI 2: Est. Range */}
        <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium tracking-wide">{lang === 'fa' ? 'پیمایش باک' : 'Est. Range'}</span>
            <Fuel size={15} className="text-indigo-400" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-base sm:text-lg font-mono font-black text-slate-100 tracking-tight">
              ~{displayRange.toLocaleString()} <span className="text-xs font-sans font-normal text-slate-400">{odoUnit}</span>
            </p>

            {/* Digital Range Indicator Bar */}
            <div className="flex gap-0.5 items-center bg-slate-950/60 px-1 py-1 rounded">
              <div className="w-1 h-3 bg-cyan-400 rounded-xs"></div>
              <div className="w-1 h-3 bg-cyan-400 rounded-xs"></div>
              <div className="w-1 h-3 bg-indigo-400 rounded-xs"></div>
              <div className="w-1 h-3 bg-slate-800 rounded-xs"></div>
            </div>
          </div>
        </div>

        {/* KPI 3: Avg. Consumption */}
        <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium tracking-wide">{lang === 'fa' ? 'میانگین مصرف' : 'Avg. Consumption'}</span>
            <Flame size={15} className="text-cyan-400" />
          </div>
          <div className="flex items-center justify-between gap-1">
            <p className="text-sm sm:text-base font-mono font-black text-slate-100 tracking-tight whitespace-nowrap flex items-baseline gap-1">
              <span>{effValue}</span>
              {effUnit && (
                <span className="text-xs font-sans font-normal text-slate-400 whitespace-nowrap">{effUnit}</span>
              )}
            </p>
            {/* Consumption Trend Arrow */}
            <span className="shrink-0 flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md" title="Optimal consumption rate">
              <TrendingDown size={12} className="stroke-[2.5]" />
            </span>
          </div>
        </div>

        {/* KPI 4: Health Score */}
        <div className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium tracking-wide">{lang === 'fa' ? 'امتیاز سلامت (VHS)' : 'Health Score'}</span>
            <ShieldCheck size={15} className="text-purple-400" />
          </div>
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-baseline font-mono">
              <span className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
                {healthMetrics.score}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold ml-0.5">/100</span>
            </div>

            {/* Flat Level Badge */}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${levelBadge.bg} ${levelBadge.border} ${levelBadge.text}`}>
              {levelBadge.label}
            </span>
          </div>
        </div>

      </div>

      {/* Quick Refuel Callout if no logs exist */}
      {logs.length === 0 && (
        <div className="relative z-10 mt-4 p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Zap size={16} className="text-cyan-400 shrink-0" />
            <span>
              {lang === 'fa' 
                ? 'برای محاسبه دقیق مصرف سوخت، اولین نوبت سوخت‌گیری خود را ثبت کنید.' 
                : 'Log your first refuel to activate precise consumption tracking.'}
            </span>
          </div>
          <button
            onClick={onNavigateToRefuel}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-all shrink-0 cursor-pointer"
          >
            {lang === 'fa' ? 'ثبت سوخت‌گیری' : 'Refuel Now'}
          </button>
        </div>
      )}
    </div>
  );
}

