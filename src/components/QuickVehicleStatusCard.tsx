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

  // VHS Level badge color & glowing styles
  const levelBadge = healthMetrics.level === 'excellent'
    ? { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-400', shadow: 'shadow-[0_0_12px_rgba(16,185,129,0.25)]', label: lang === 'fa' ? 'عالی' : 'Excellent' }
    : healthMetrics.level === 'good'
      ? { bg: 'bg-cyan-500/10', border: 'border-cyan-500/40', text: 'text-cyan-400', shadow: 'shadow-[0_0_12px_rgba(6,182,212,0.25)]', label: lang === 'fa' ? 'خوب' : 'Good' }
      : healthMetrics.level === 'fair'
        ? { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-400', shadow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]', label: lang === 'fa' ? 'متوسط' : 'Fair' }
        : { bg: 'bg-rose-500/10', border: 'border-rose-500/40', text: 'text-rose-400', shadow: 'shadow-[0_0_12px_rgba(244,63,94,0.25)]', label: lang === 'fa' ? 'نیاز به تعمیر' : 'Needs Check' };

  return (
    <div className="group relative rounded-2xl bg-slate-950/80 border border-white/10 p-5 sm:p-6 backdrop-blur-xl overflow-hidden transition-all duration-300 shadow-2xl hover:shadow-cyan-500/10 hover:border-cyan-500/30">
      
      {/* 1. IMMERSIVE VISUAL BLUEPRINT BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20 group-hover:opacity-30 transition-opacity duration-500">
        {/* Futuristic Sedan Wireframe Outline SVG */}
        <svg 
          viewBox="0 0 800 300" 
          fill="none" 
          className="absolute right-0 bottom-0 w-full h-full object-cover transform translate-x-12 translate-y-6 scale-110"
        >
          <defs>
            <linearGradient id="blueprintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0.4" />
            </linearGradient>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#06b6d4" strokeWidth="0.5" strokeOpacity="0.1" />
            </pattern>
          </defs>

          {/* Grid Background */}
          <rect width="800" height="300" fill="url(#grid)" />

          {/* Sedan Silhouette / Wireframe */}
          <g stroke="url(#blueprintGrad)" strokeWidth="1.5" strokeDasharray="4 2">
            {/* Roof and pillars */}
            <path d="M 220 180 C 260 110, 360 85, 480 85 C 570 85, 620 120, 680 180 L 740 190 L 750 220 L 150 220 L 170 190 Z" />
            {/* Hood and Trunk */}
            <path d="M 170 190 L 80 200 L 70 220 L 150 220" />
            {/* Front & Rear Wheels Wireframe */}
            <circle cx="210" cy="220" r="32" strokeWidth="2" strokeDasharray="none" />
            <circle cx="210" cy="220" r="18" strokeWidth="1" />
            <circle cx="610" cy="220" r="32" strokeWidth="2" strokeDasharray="none" />
            <circle cx="610" cy="220" r="18" strokeWidth="1" />
            {/* Side window & door lines */}
            <path d="M 320 95 L 480 95 L 530 180 L 290 180 Z" />
            <line x1="420" y1="95" x2="420" y2="220" strokeWidth="1" />
            {/* Tech measurement lines */}
            <line x1="70" y1="240" x2="750" y2="240" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="70" cy="240" r="3" fill="#06b6d4" />
            <circle cx="750" cy="240" r="3" fill="#a855f7" />
          </g>
        </svg>

        {/* Soft Ambient Radial Lights */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Modern Smart Key Icon in Card's Body Background */}
      <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-5 pointer-events-none text-cyan-400 transform -rotate-12 group-hover:scale-110 transition-transform duration-700">
        <KeyRound size={160} strokeWidth={1} />
      </div>

      {/* 2. HEADER REORGANIZATION */}
      <div className="relative z-10 flex items-start justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3.5">
          {/* Car Icon with Neon Glow */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Car size={24} className="drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
          </div>

          <div>
            {/* Larger Model Name */}
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {vehicle.brand ? `${vehicle.brand} ${vehicle.model}` : (lang === 'fa' ? 'خودروی ثبت نشده' : 'BMW 1 Series')}
            </h2>

            {/* Year Badge + Active Telemetry Grouped */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-cyan-400 font-bold tracking-wider">
                {vehicle.year || '2026'}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></span>
                <span className="lowercase text-slate-300 font-mono text-[11px]">
                  {lang === 'fa' ? 'تله‌متری زنده فعال' : 'active telemetry'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Settings Cog Button in Top-Right Corner */}
        <button
          onClick={onNavigateToVehicles}
          className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 text-slate-400 hover:text-cyan-400 transition-all cursor-pointer shrink-0 shadow-sm hover:shadow-cyan-500/10 active:scale-95"
          title={lang === 'fa' ? 'مدیریت مشخصات خودرو' : 'Manage Vehicle Specs'}
        >
          <Settings size={18} />
        </button>
      </div>

      {/* 3. GRID DATA OPTIMIZATION (Layout & Styling) */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        
        {/* KPI 1: Odometer */}
        <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-xl space-y-1.5 transition-all backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium tracking-wide">{lang === 'fa' ? 'کارکرد فعلی' : 'Odometer'}</span>
            <Gauge size={15} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
          </div>
          <p className="text-base sm:text-lg font-mono font-black text-slate-100 tracking-tight">
            {displayOdo.toLocaleString()} <span className="text-xs font-sans font-normal text-slate-400">{odoUnit}</span>
          </p>
        </div>

        {/* KPI 2: Est. Range (Digital Fuel Dashboard Range Look) */}
        <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-xl space-y-1.5 transition-all backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium tracking-wide">{lang === 'fa' ? 'پیمایش باک' : 'Est. Range'}</span>
            <Fuel size={15} className="text-indigo-400 drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-base sm:text-lg font-mono font-black text-slate-100 tracking-tight">
              ~{displayRange.toLocaleString()} <span className="text-xs font-sans font-normal text-slate-400">{odoUnit}</span>
            </p>

            {/* Digital Range Indicator Bar */}
            <div className="flex gap-0.5 items-center bg-slate-950 border border-slate-800 px-1 py-1 rounded">
              <div className="w-1 h-3 bg-cyan-400 rounded-xs shadow-[0_0_4px_#22d3ee]"></div>
              <div className="w-1 h-3 bg-cyan-400 rounded-xs shadow-[0_0_4px_#22d3ee]"></div>
              <div className="w-1 h-3 bg-indigo-400 rounded-xs"></div>
              <div className="w-1 h-3 bg-slate-800 rounded-xs"></div>
            </div>
          </div>
        </div>

        {/* KPI 3: Avg. Consumption (with Trend Indicator) */}
        <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-xl space-y-1.5 transition-all backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium tracking-wide">{lang === 'fa' ? 'میانگین مصرف' : 'Avg. Consumption'}</span>
            <Flame size={15} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
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

        {/* KPI 4: Health Score (Refined /100 and Glowing Badge) */}
        <div className="p-3.5 bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-xl space-y-1.5 transition-all backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-medium tracking-wide">{lang === 'fa' ? 'امتیاز سلامت (VHS)' : 'Health Score'}</span>
            <ShieldCheck size={15} className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
          </div>
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-baseline font-mono">
              <span className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
                {healthMetrics.score}
              </span>
              <span className="text-[10px] text-slate-500 font-semibold ml-0.5">/100</span>
            </div>

            {/* Glowing Refined Level Badge */}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${levelBadge.bg} ${levelBadge.border} ${levelBadge.text} ${levelBadge.shadow}`}>
              {levelBadge.label}
            </span>
          </div>
        </div>

      </div>

      {/* Quick Refuel Callout if no logs exist */}
      {logs.length === 0 && (
        <div className="relative z-10 mt-4 p-3 bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-between gap-3 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Zap size={16} className="text-cyan-400 shrink-0 animate-pulse drop-shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
            <span>
              {lang === 'fa' 
                ? 'برای محاسبه دقیق مصرف سوخت، اولین نوبت سوخت‌گیری خود را ثبت کنید.' 
                : 'Log your first refuel to activate precise consumption tracking.'}
            </span>
          </div>
          <button
            onClick={onNavigateToRefuel}
            className="px-3 py-1.5 rounded-lg tech-gradient text-white text-xs font-bold hover:opacity-90 transition-all shrink-0 cursor-pointer shadow-md active:scale-95"
          >
            {lang === 'fa' ? 'ثبت سوخت‌گیری' : 'Refuel Now'}
          </button>
        </div>
      )}
    </div>
  );
}

