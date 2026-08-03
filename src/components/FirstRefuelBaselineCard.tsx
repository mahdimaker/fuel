/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Fuel, Check, Info } from 'lucide-react';
import { Language } from '../utils/translations';

interface FirstRefuelBaselineCardProps {
  odometer: number; // in km (standard stored unit)
  unitSystem: 'metric' | 'us' | 'uk';
  lang?: Language;
}

export default function FirstRefuelBaselineCard({ odometer, unitSystem }: FirstRefuelBaselineCardProps) {
  const isMetric = unitSystem === 'metric';
  const displayOdo = isMetric ? odometer : odometer * 0.621371;
  const odoUnit = isMetric ? 'km' : 'mi';

  const title = 'First Refuel Tracked!';
  const subtitle = `We've set your starting baseline at ${Math.round(displayOdo).toLocaleString()} ${odoUnit}. No fuel consumption data to show yet.`;

  const barText = '100% Full';
  const barLabel = 'Tank Status';
  const ctaText = 'Your real-time efficiency (L/100km or MPG) will automatically calculate and display here on your next fill-up.';

  return (
    <div 
      id="first-refuel-baseline-card" 
      className="rounded-2xl p-6 md:p-8 border border-slate-800 bg-gradient-to-br from-[#1a1c24] to-[#121318] relative overflow-hidden shadow-2xl transition-all duration-300 hover:border-cyan-500/25"
    >
      <div className="flex flex-col items-center text-center space-y-6">
        {/* Glowing badge */}
        <div className="relative">
          <div className="relative w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
            <Fuel size={28} className="animate-pulse" />
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-full border border-slate-900 flex items-center justify-center text-white">
              <Check size={10} strokeWidth={3} />
            </div>
          </div>
        </div>

        {/* Text Headers */}
        <div className="space-y-2.5 max-w-md">
          <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-wide">
            {title}
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-semibold">
            {subtitle}
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full max-w-sm bg-slate-950/80 border border-slate-900/60 rounded-xl p-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-semibold">{barLabel}</span>
            <span className="text-cyan-400 font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[10px] md:text-xs">
              {barText}
            </span>
          </div>
          <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden p-[1px] border border-slate-950">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>

        {/* CTA Banner info */}
        <div className="w-full max-w-md p-4 bg-slate-950/40 border border-slate-900/50 rounded-xl flex items-start gap-3 text-right">
          <Info size={16} className="text-cyan-400 shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-semibold text-right">
            {ctaText}
          </p>
        </div>
      </div>
    </div>
  );
}
