/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { Language } from '../utils/translations';

interface SponsoredAdCardProps {
  lang?: Language;
}

// Set to true when you want to enable advertisements again
const SHOW_ADS = false;

export default function SponsoredAdCard({ lang }: SponsoredAdCardProps) {
  if (!SHOW_ADS) return null;

  return (
    <div id="sponsored-ad-card" className="cyber-card p-5 rounded-2xl border border-slate-900 bg-slate-950/80 text-center relative overflow-hidden transition-all duration-300 hover:border-cyan-500/10">
      
      <div className="flex items-center justify-between text-[10px] text-slate-400 font-extrabold tracking-widest uppercase mb-2">
        <span>Sponsored Diagnostics</span>
        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[9px] font-sans">AD</span>
      </div>

      <div className="flex flex-col items-center py-2 space-y-1.5">
        <p className="text-xs font-black text-slate-200">
          Premium Fuel Additives & Injector Cleaners
        </p>
        <p className="text-xs text-slate-300 leading-relaxed max-w-md">
          Using certified carbon-cleaning additives removes gum and combustion residues, recovering up to 5% engine output.
        </p>
        
        <a 
          href="#refuel"
          onClick={(e) => e.preventDefault()}
          className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 pt-1 cursor-pointer transition-colors"
        >
          <span>Browse certified fuel system cleaners</span>
          <ArrowUpRight size={10} />
        </a>
      </div>
    </div>
  );
}
