/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { Language } from '../utils/translations';

interface SponsoredAdCardProps {
  lang: Language;
}

export default function SponsoredAdCard({ lang }: SponsoredAdCardProps) {
  return (
    <div id="sponsored-ad-card" className="cyber-card p-5 rounded-2xl border border-slate-900 bg-slate-950/20 text-center relative overflow-hidden transition-all duration-300 hover:border-cyan-500/10">
      <div className="absolute right-0 top-0 w-20 h-20 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none"></div>
      
      <div className="flex items-center justify-between text-[10px] text-slate-600 font-extrabold tracking-widest uppercase mb-2">
        <span>{lang === 'fa' ? 'پیشنهاد حامی برنامه‌ریزی سلامت' : 'Sponsored Diagnostics'}</span>
        <span className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-[8px] font-sans">AD</span>
      </div>

      <div className="flex flex-col items-center py-2 space-y-1.5">
        <p className="text-xs font-black text-slate-300">
          {lang === 'fa' 
            ? 'انژکتور شوی و مکمل اکتان تأیید شده شرکت ملی نفت' 
            : 'Premium Fuel Additives & Injector Cleaners'}
        </p>
        <p className="text-[10px] text-slate-500 leading-relaxed max-w-md">
          {lang === 'fa'
            ? 'انژکتورشوی تحت گواهی استاندارد با برطرف کردن جرم‌های دریچه گاز، راندمان تنفسی موتور را تا ۵٪ بازیابی می‌کند.'
            : 'Using certified carbon-cleaning additives removes gum and combustion residues, recovering up to 5% engine output.'}
        </p>
        
        <a 
          href="#refuel"
          onClick={(e) => e.preventDefault()}
          className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 pt-1 cursor-pointer transition-colors"
        >
          <span>{lang === 'fa' ? 'بررسی برترین شوینده‌های انژکتور سال' : 'Browse certified fuel system cleaners'}</span>
          <ArrowUpRight size={10} />
        </a>
      </div>
    </div>
  );
}
