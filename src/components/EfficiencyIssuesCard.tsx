/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle, Zap, Droplet } from 'lucide-react';
import { Language } from '../utils/translations';

interface EfficiencyIssuesCardProps {
  lastLogEfficiency: number;
  averageEfficiency: number;
  lang?: Language;
  currentOdometer: number;
  unitSystem: 'metric' | 'us' | 'uk';
}

export default function EfficiencyIssuesCard({ 
  lastLogEfficiency, 
  averageEfficiency, 
  lang = 'en',
  currentOdometer,
  unitSystem
}: EfficiencyIssuesCardProps) {
  const isMetric = unitSystem === 'metric';
  
  // Calculate display odometer in current unit system
  const odo = isMetric ? currentOdometer : currentOdometer * 0.621371;
  const odoUnit = isMetric ? (lang === 'fa' ? 'کیلومتر' : 'km') : (lang === 'fa' ? 'مایل' : 'mi');

  // Intervals in display units (km or mi)
  const tireInterval = isMetric ? 1000 : 600;
  const sparkInterval = isMetric ? 40000 : 25000;
  const oilInterval = isMetric ? 10000 : 6000;

  // Calculation of remaining/target mileage
  const tireRemaining = Math.max(1, tireInterval - (Math.floor(odo) % tireInterval));
  const sparkNext = (Math.floor(odo / sparkInterval) + 1) * sparkInterval;
  const oilNext = (Math.floor(odo / oilInterval) + 1) * oilInterval;

  // Translation Dictionaries
  const titleText = lang === 'fa' ? 'چک‌لیست سلامت و راندمان' : 'Efficiency Health Checklist';
  const subtitleText = lang === 'fa'
    ? 'اقدامات کاربردی متصل به کارکرد خودروی شما برای بیشترین صرفه‌جویی در سوخت.'
    : "Actionable tasks connected to your vehicle's odometer to maximize fuel savings.";

  const tasks = {
    tires: {
      title: lang === 'fa' ? 'بررسی و تنظیم باد لاستیک‌ها' : 'Check Tire Pressure',
      desc: lang === 'fa' ? 'تا ۳٪ صرفه‌جویی در سوخت (کاهش اصطکاک و هدررفت انرژی)' : 'Saves up to 3% fuel (reduces friction)',
      due: lang === 'fa' 
        ? `بررسی بعدی پس از: ${Math.round(tireRemaining).toLocaleString()} ${odoUnit}` 
        : `Next due in ${Math.round(tireRemaining).toLocaleString()} ${odoUnit}`,
    },
    plugs: {
      title: lang === 'fa' ? 'بررسی و تعویض شمع‌ها' : 'Inspect Spark Plugs',
      desc: lang === 'fa' ? 'بهبود اتمیزه شدن سوخت و راندمان احتراق موتور' : 'Improves fuel atomization',
      due: lang === 'fa'
        ? `تعویض بعدی در کارکرد: ${Math.round(sparkNext).toLocaleString()} ${odoUnit}`
        : `Next change: ${Math.round(sparkNext).toLocaleString()} ${odoUnit}`,
    },
    oil: {
      title: lang === 'fa' ? 'تعویض روغن موتور' : 'Low-Viscosity Engine Oil',
      desc: lang === 'fa' ? 'تا ۲٪ بهبود راندمان با استفاده از روغن باکیفیت و مناسب' : 'Up to 2% efficiency improvement',
      due: lang === 'fa'
        ? `تعویض بعدی در کارکرد: ${Math.round(oilNext).toLocaleString()} ${odoUnit}`
        : `Next change: ${Math.round(oilNext).toLocaleString()} ${odoUnit}`,
    },
  };

  return (
    <div id="efficiency-issues-card" className="cyber-card p-4 sm:p-5 rounded-2xl border border-purple-500/15 bg-slate-950/40 relative overflow-hidden transition-all duration-300 hover:border-purple-500/30">
      {/* Decorative background glow to match standard cards */}
      <div className="absolute -right-20 -bottom-20 w-44 h-44 rounded-full bg-purple-500/5 blur-3xl pointer-events-none"></div>

      {/* Header section with dynamic translation */}
      <div className="flex items-center gap-2.5 mb-3.5 px-0.5">
        <div className="p-2 rounded-xl bg-slate-900 text-emerald-400 border border-slate-800 shrink-0">
          <CheckCircle size={20} />
        </div>
        <div className={lang === 'fa' ? 'text-right' : 'text-left'}>
          <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-white leading-tight">
            {titleText}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 font-medium leading-snug">
            {subtitleText}
          </p>
        </div>
      </div>

      {/* Action Rows */}
      <div className="space-y-2 w-full">
        {/* Row 1: Tires */}
        <div className="w-full flex items-center justify-between gap-3 p-3 bg-slate-950/60 border border-slate-900 rounded-xl hover:border-slate-800/80 transition-all duration-300">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 shrink-0">
              <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="11" r="8" />
                <path d="M12 19v3" />
                <path d="M9 22h6" />
                <path d="M12 11l4-4" />
                <circle cx="12" cy="11" r="1.5" fill="currentColor" />
                <path d="M8 7l1 1" />
                <path d="M16 7l-1 1" />
              </svg>
            </div>
            <div className={`min-w-0 flex-1 ${lang === 'fa' ? 'text-right' : 'text-left'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
                <span className="text-xs sm:text-sm font-bold text-slate-100">
                  {tasks.tires.title}
                </span>
                <span className="text-[11px] sm:text-xs font-mono font-extrabold text-cyan-400 shrink-0">
                  {tasks.tires.due}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block leading-tight font-medium">
                {tasks.tires.desc}
              </span>
            </div>
          </div>
        </div>

        {/* Row 2: Spark Plugs */}
        <div className="w-full flex items-center justify-between gap-3 p-3 bg-slate-950/60 border border-slate-900 rounded-xl hover:border-slate-800/80 transition-all duration-300">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 shrink-0">
              <Zap size={16} className="text-amber-400" />
            </div>
            <div className={`min-w-0 flex-1 ${lang === 'fa' ? 'text-right' : 'text-left'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
                <span className="text-xs sm:text-sm font-bold text-slate-100">
                  {tasks.plugs.title}
                </span>
                <span className="text-[11px] sm:text-xs font-mono font-extrabold text-amber-400 shrink-0">
                  {tasks.plugs.due}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block leading-tight font-medium">
                {tasks.plugs.desc}
              </span>
            </div>
          </div>
        </div>

        {/* Row 3: Engine Oil */}
        <div className="w-full flex items-center justify-between gap-3 p-3 bg-slate-950/60 border border-slate-900 rounded-xl hover:border-slate-800/80 transition-all duration-300">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 shrink-0">
              <Droplet size={16} className="text-emerald-400" />
            </div>
            <div className={`min-w-0 flex-1 ${lang === 'fa' ? 'text-right' : 'text-left'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-0.5">
                <span className="text-xs sm:text-sm font-bold text-slate-100">
                  {tasks.oil.title}
                </span>
                <span className="text-[11px] sm:text-xs font-mono font-extrabold text-emerald-400 shrink-0">
                  {tasks.oil.due}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block leading-tight font-medium">
                {tasks.oil.desc}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


