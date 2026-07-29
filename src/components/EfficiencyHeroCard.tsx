/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Gauge, Zap, TrendingUp, AlertTriangle, Leaf, Flame } from 'lucide-react';
import { Language } from '../utils/translations';
import { FuelEntry } from '../types';

interface EfficiencyHeroCardProps {
  fuelEfficiency: number; // L/100km
  unitSystem: 'metric' | 'us' | 'uk';
  lang: Language;
  logs?: FuelEntry[];
  isEstimated?: boolean;
}

export default function EfficiencyHeroCard({ fuelEfficiency, unitSystem, lang, logs = [], isEstimated = false }: EfficiencyHeroCardProps) {
  const isMetric = unitSystem === 'metric';
  const isUs = unitSystem === 'us';
  const isUk = unitSystem === 'uk';

  // Return calibration standby state if no data
  if (fuelEfficiency <= 0) {
    const isDiagnostic = logs && logs.length >= 2;

    if (isDiagnostic) {
      return (
        <div id="efficiency-hero-diagnostic" className="cyber-card p-6 md:p-8 rounded-2xl border border-rose-500/30 bg-slate-950/40 relative overflow-hidden transition-all duration-300 hover:border-rose-500/50">
          <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-rose-500/10 blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle size={22} className="text-rose-400 animate-pulse" />
              </div>
              <div className={lang === 'fa' ? 'text-right' : 'text-left'}>
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-white">
                  {lang === 'fa' ? 'خطا در محاسبه راندمان سوخت' : 'Calculation Issue Detected'}
                </h2>
                <p className="text-xs md:text-sm text-rose-400 font-bold mt-1">
                  {lang === 'fa' ? 'امکان پردازش مصرف واقعی وجود ندارد' : 'Unable to compute engine efficiency'}
                </p>
              </div>
            </div>
            <span className="text-[10px] md:text-xs font-black font-mono tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-1 rounded-md uppercase">
              {lang === 'fa' ? 'عیب‌یابی' : 'DIAGNOSTIC'}
            </span>
          </div>

          <div className={`space-y-4 my-5 ${lang === 'fa' ? 'text-right' : 'text-left'}`}>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
              {lang === 'fa'
                ? 'شما حداقل ۲ سوخت‌گیری ثبت کرده‌اید، اما سیستم به دلایل زیر قادر به محاسبه راندمان نیست:'
                : 'You have logged at least 2 entries, but the system cannot calculate your consumption due to:'}
            </p>

            <div className="space-y-3">
              <div className={`p-4 rounded-xl border border-slate-900 bg-slate-950/60 flex gap-3 ${lang === 'fa' ? 'text-right' : 'text-left'}`}>
                <span className="text-rose-400 font-extrabold text-sm shrink-0">۱.</span>
                <div className={`flex-1 ${lang === 'fa' ? 'text-right' : 'text-left'}`}>
                  <span className="text-sm font-extrabold text-slate-100 block">
                    {lang === 'fa' ? 'عدم افزایش کیلومترشمار (مسافت صفر یا منفی)' : 'Odometer didn\'t increase'}
                  </span>
                  <span className="text-xs md:text-sm text-slate-300 block mt-1.5 leading-relaxed font-medium">
                    {lang === 'fa'
                      ? 'برای محاسبه مصرف سوخت، کیلومتر سوخت‌گیری دوم باید بیشتر از سوخت‌گیری اول باشد. لطفاً مطمئن شوید کارکرد را درست وارد کرده‌اید و به عنوان کارکرد پیمایش کوتاه (Trip) ثبت نکرده‌اید.'
                      : 'The odometer of your second refueling must be higher than the first. Ensure you entered total odometer readings, not short trip distances.'}
                  </span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border border-slate-900 bg-slate-950/60 flex gap-3 ${lang === 'fa' ? 'text-right' : 'text-left'}`}>
                <span className="text-rose-400 font-extrabold text-sm shrink-0">۲.</span>
                <div className={`flex-1 ${lang === 'fa' ? 'text-right' : 'text-left'}`}>
                  <span className="text-sm font-extrabold text-slate-100 block">
                    {lang === 'fa' ? 'ثبت سوخت‌گیری به صورت باک نیمه‌پر' : 'Partial refuel baseline issue'}
                  </span>
                  <span className="text-xs md:text-sm text-slate-300 block mt-1.5 leading-relaxed font-medium">
                    {lang === 'fa'
                      ? 'اگر یکی از سوخت‌گیری‌ها را به عنوان "باک نیمه‌پر" ثبت کرده باشید، سیستم باید منتظر بماند تا یک باک کامل جدید ثبت کنید تا بتواند مصرف دقیق را استخراج کند.'
                      : 'If you marked entries as partial refuels, the system must wait until you log a full tank refueling to finalize the consumption calculations.'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl text-center">
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                💡 {lang === 'fa' 
                  ? 'پیشنهاد: به جدول «تاریخچه سوخت‌گیری‌ها» در پایین بروید، کیلومترشمارهای ثبت شده را بررسی کنید و رکوردهای اشتباه را حذف و مجدداً ثبت کنید.'
                  : 'Tip: Check your Refueling History table below. Review and delete any erroneous odometer entries, then re-add them.'}
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
            <div className={lang === 'fa' ? 'text-right' : 'text-left'}>
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-white">
                {lang === 'fa' ? 'سیستم پایش راندمان سوخت' : 'Fuel Efficiency System'}
              </h2>
              <p className="text-xs md:text-sm text-slate-300">
                {lang === 'fa' ? 'در حال کالیبراسیون و تعیین نقطه مرجع' : 'Calibrating & establishing baseline'}
              </p>
            </div>
          </div>
          <span className="text-[10px] md:text-xs font-black font-mono tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-1 rounded-md uppercase animate-pulse">
            {lang === 'fa' ? 'در حال کالیبره' : 'CALIBRATING'}
          </span>
        </div>

        <div className="space-y-3.5 my-5">
          <div className={lang === 'fa' ? 'text-right' : 'text-left'}>
            <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2.5">
              {lang === 'fa' ? 'مراحل فعال‌سازی پایش مصرف سوخت' : 'Consumption Tracking Roadmap'}
            </h4>
          </div>

          <div className="space-y-2.5">
            {/* Step 1 */}
            <div className={`flex items-center gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 ${lang === 'fa' ? 'text-right' : 'text-left'}`}>
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                ✓
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-bold text-slate-100 block">
                  {lang === 'fa' ? 'مرحله ۱: ثبت اولین سوخت‌گیری (پایه)' : 'Step 1: Reference point registered'}
                </span>
                <span className="text-xs md:text-sm text-slate-300 block mt-1 leading-relaxed font-medium">
                  {lang === 'fa' 
                    ? 'اولین سوخت‌گیری با موفقیت ثبت شد و مبنای محاسبه قرار گرفت.' 
                    : 'First fill-up logged successfully to serve as our starting reference.'}
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`flex items-center gap-3 p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 ${lang === 'fa' ? 'text-right' : 'text-left'}`}>
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center justify-center shrink-0">
                🔄
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-bold text-slate-100 block">
                  {lang === 'fa' ? 'مرحله ۲: رانندگی تا سوخت‌گیری بعدی' : 'Step 2: Drive normally'}
                </span>
                <span className="text-xs md:text-sm text-slate-300 block mt-1 leading-relaxed font-medium">
                  {lang === 'fa' 
                    ? 'با خودرو رانندگی کنید تا مسافت به موتور افزوده شود.' 
                    : 'Use your vehicle normally. The system will track the distance driven.'}
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`flex items-center gap-3 p-3 rounded-xl border border-slate-900 bg-slate-950/40 ${lang === 'fa' ? 'text-right' : 'text-left'}`}>
              <div className="w-5 h-5 rounded-full bg-slate-900 border border-slate-800 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                3
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-bold text-slate-300 block">
                  {lang === 'fa' ? 'مرحله ۳: سوخت‌گیری دوم و گشودن آمار' : 'Step 3: Log next fill-up to unlock'}
                </span>
                <span className="text-xs md:text-sm text-slate-400 block mt-1 leading-relaxed font-medium">
                  {lang === 'fa' 
                    ? 'با ثبت سوخت‌گیری بعدی (ترجیحاً کامل)، نرخ مصرف واقعی شما باز خواهد شد.' 
                    : 'Log your next fill-up (preferably full) to compute and display live engine economy.'}
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
      label: lang === 'fa' ? 'راندمان بسیار بهینه' : 'OPTIMAL EFFICIENCY',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40',
      bannerBg: 'bg-emerald-950/30 border-emerald-500/20',
      icon: <Leaf size={16} className="text-emerald-400" />,
      message: lang === 'fa' ? 'رانندگی فوق‌العاده بهینه مانند خودروی برقی!' : 'Driving smooth like an EV!',
      thumbColor: 'bg-emerald-500',
      thumbGlow: 'none',
    },
    moderate: {
      label: lang === 'fa' ? 'راندمان سوخت بهینه' : 'OPTIMAL EFFICIENCY',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/40',
      bannerBg: 'bg-cyan-950/30 border-cyan-500/20',
      icon: <Zap size={16} className="text-cyan-400" />,
      message: lang === 'fa' ? 'محدوده مصرف سوخت بهینه و استاندارد' : 'Optimal Combustion Range',
      thumbColor: 'bg-cyan-500',
      thumbGlow: 'none',
    },
    high: {
      label: lang === 'fa' ? 'مصرف بالاتر از حد متوسط' : 'ABOVE AVERAGE',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/40',
      bannerBg: 'bg-amber-950/30 border-amber-500/20',
      icon: <TrendingUp size={16} className="text-amber-400" />,
      message: lang === 'fa' ? 'مصرف بالاتر از حد متوسط' : 'Above Average Consumption',
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

  return (
    <div id="efficiency-hero-card" className="cyber-card p-5 sm:p-6 md:p-8 rounded-2xl border border-indigo-500/15 bg-slate-950/40 relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30">
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
              {lang === 'fa' ? 'راندمان سوخت' : 'Fuel Consumption'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 leading-snug">
              {lang === 'fa' ? 'مصرف تجمعی محاسبه شده' : 'Calculated cumulative consumption'}
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
          {lang === 'fa' ? 'میانگین مصرف تجمعی سوخت خودروی شما' : 'Average cumulative fuel efficiency of your vehicle'}
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

      {/* Temporary Estimation Alert */}
      {isEstimated && (
        <div id="temporary-estimation-alert" className="mt-5 p-3.5 border border-cyan-500/20 bg-cyan-950/20 rounded-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-cyan-500"></div>
          <div className="flex gap-3">
            <div className="p-1 rounded bg-cyan-500/10 text-cyan-400 self-start">
              <Zap size={16} className="animate-pulse" />
            </div>
            <div className={lang === 'fa' ? 'text-right' : 'text-left'}>
              <h4 className="text-xs font-black uppercase tracking-wider text-cyan-400">
                {lang === 'fa' ? 'تحلیل بر اساس تخمین موقت' : 'Analysis Based on Temporary Estimation'}
              </h4>
              <p className="text-[11px] md:text-xs text-slate-300 mt-1 leading-relaxed font-medium">
                {lang === 'fa'
                  ? 'از آنجا که هنوز باک را کاملاً پر نکرده‌اید، این تحلیل با دقت حدود ۸۰٪ و بر اساس الگوریتم تخمینی صادر شده است. برای دریافت گزارش قطعی و ۱۰۰٪ دقیق، در سوخت‌گیری بعدی باک را کامل پر کنید.'
                  : 'Since you haven\'t fully filled the tank yet, this analysis is calculated with ~80% accuracy based on an estimated algorithm. To get a definitive and 100% accurate report, fill your tank completely on your next refuel.'}
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

