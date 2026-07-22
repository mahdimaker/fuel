/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DollarSign, TrendingUp, TrendingDown, Coffee, Tv, ShieldAlert, CheckCircle2, Coins } from 'lucide-react';
import { FuelEntry } from '../types';
import { Language } from '../utils/translations';

interface FinancialImpactCardProps {
  logs: FuelEntry[];
  fuelEfficiency: number; // L/100km
  unitSystem: 'metric' | 'us' | 'uk';
  lang?: Language;
}

export default function FinancialImpactCard({ logs, fuelEfficiency, unitSystem, lang = 'en' }: FinancialImpactCardProps) {
  const isMetric = unitSystem === 'metric';
  const isUs = unitSystem === 'us';
  const isUk = unitSystem === 'uk';

  if (logs.length < 2 || fuelEfficiency <= 0) {
    const isDiagnostic = logs.length >= 2;
    if (isDiagnostic) {
      return (
        <div id="financial-impact-diagnostic" className="cyber-card p-5 sm:p-6 md:p-8 rounded-2xl border border-rose-500/30 bg-slate-950/40 backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:border-rose-500/50">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-[0.07] pointer-events-none"></div>
          <div className="absolute -left-20 -top-20 w-44 h-44 rounded-full bg-rose-500/10 blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.25)] shrink-0">
              <ShieldAlert size={22} className="text-rose-400 animate-pulse drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            </div>
            <div className={lang === 'fa' ? 'text-right' : 'text-left'}>
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-white leading-tight">
                {lang === 'fa' ? 'تاثیر مخارج مالی' : 'FINANCIAL IMPACT'}
              </h2>
              <p className="text-xs text-rose-400 font-bold mt-0.5">
                {lang === 'fa' ? 'عدم امکان محاسبه هدررفت مالی' : 'Standby - pending valid consumption calibration'}
              </p>
            </div>
          </div>

          <div className={`space-y-4 border-t border-slate-900/60 pt-4 ${lang === 'fa' ? 'text-right' : 'text-left'}`}>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-medium">
              {lang === 'fa'
                ? 'به دلیل عدم محاسبه راندمان مصرف سوخت (به علت تداخل در کارکردهای ثبت‌شده یا باک نیمه‌پر)، تحلیلگر مخارج مالی در حالت آماده‌باش (استندبای) قرار دارد.'
                : 'Because engine fuel efficiency could not be computed (due to identical/decreasing odometer entries or partial refuel flags), the financial analyzer is in standby.'}
            </p>
            
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-900 font-medium">
              💡 <span className="font-semibold text-slate-200">{lang === 'fa' ? 'راهنما:' : 'Guide:'}</span>{' '}
              {lang === 'fa'
                ? 'برای باز شدن این بخش، لطفاً کیلومترهای ثبت شده در بخش «تاریخچه سوخت‌گیری‌ها» را بررسی کنید. سوخت‌گیری دوم حتماً باید کارکرد بالاتری نسبت به سوخت‌گیری اول داشته باشد تا مسافت رانندگی معتبر شود.'
                : 'To unlock financial leak analytics, please verify odometer entries under Refueling History. Odometer values must strictly increase chronologically.'}
            </p>
          </div>
        </div>
      );
    }

    const firstLog = logs.length > 0 ? logs[0] : null;
    const odoUnit = isMetric ? (lang === 'fa' ? 'کیلومتر' : 'km') : (lang === 'fa' ? 'مایل' : 'mi');
    const volUnit = isUs ? (lang === 'fa' ? 'گالن' : 'gal') : (lang === 'fa' ? 'لیتر' : 'L');
    
    // Convert odometer and volume if US
    const displayOdo = firstLog ? (isMetric ? firstLog.odometer : firstLog.odometer * 0.621371) : 0;
    const displayVol = firstLog ? (isUs ? firstLog.liters * 0.264172 : firstLog.liters) : 0;

    return (
      <div id="financial-impact-empty" className="cyber-card p-5 sm:p-6 md:p-8 rounded-2xl border border-indigo-500/15 bg-slate-950/40 backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-[0.07] pointer-events-none"></div>
        <div className="absolute -left-20 -top-20 w-44 h-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)] shrink-0">
            <DollarSign size={22} className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          </div>
          <div className={lang === 'fa' ? 'text-right' : 'text-left'}>
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-white leading-tight">
              {lang === 'fa' ? 'تاثیر مخارج مالی' : 'FINANCIAL IMPACT'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 leading-snug">
              {lang === 'fa' ? 'محاسبه راندمان مالی و انحراف هزینه‌ها' : 'Calculating financial efficiency and deviations'}
            </p>
          </div>
        </div>

        {firstLog ? (
          <div className={`bg-slate-950/60 border border-slate-900 p-3.5 rounded-xl space-y-3 mb-4 ${lang === 'fa' ? 'text-right' : 'text-left'}`}>
            <span className="text-xs text-slate-300 font-bold uppercase tracking-wider block">
              {lang === 'fa' ? 'مشخصات باک پایه (ثبت شده)' : 'Baseline Tank Reference Details'}
            </span>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-2.5 bg-slate-900/40 border border-slate-900 rounded-lg text-center">
                <span className="text-[10px] md:text-xs text-slate-400 font-bold block mb-1">
                  {lang === 'fa' ? 'کارکرد اولیه' : 'Odometer'}
                </span>
                <span className="text-xs md:text-sm font-black font-mono text-cyan-400">
                  {Math.round(displayOdo).toLocaleString()} <span className="text-[9px] font-sans text-slate-500">{odoUnit}</span>
                </span>
              </div>
              <div className="p-2.5 bg-slate-900/40 border border-slate-900 rounded-lg text-center">
                <span className="text-[10px] md:text-xs text-slate-400 font-bold block mb-1">
                  {lang === 'fa' ? 'حجم بنزین' : 'Fuel Volume'}
                </span>
                <span className="text-xs md:text-sm font-black font-mono text-indigo-400">
                  {displayVol.toFixed(1)} <span className="text-[9px] font-sans text-slate-500">{volUnit}</span>
                </span>
              </div>
              <div className="p-2.5 bg-slate-900/40 border border-slate-900 rounded-lg text-center">
                <span className="text-[10px] md:text-xs text-slate-400 font-bold block mb-1">
                  {lang === 'fa' ? 'هزینه پرداخت شده' : 'Cost Paid'}
                </span>
                <span className="text-xs md:text-sm font-black font-mono text-emerald-400">
                  {firstLog.cost.toLocaleString()} <span className="text-[9px] font-sans text-slate-500">{isMetric ? (lang === 'fa' ? 'تومان' : '€') : isUs ? (lang === 'fa' ? 'دلار' : '$') : (lang === 'fa' ? 'پوند' : '£')}</span>
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-3xl font-black text-slate-600 font-mono">---</div>
            <p className="text-xs text-slate-400 mt-2">
              {lang === 'fa' ? 'سوخت‌گیری ثبت نشده است.' : 'No refueling entries registered.'}
            </p>
          </div>
        )}

        <div className={`space-y-3 border-t border-slate-900/60 pt-4 ${lang === 'fa' ? 'text-right' : 'text-left'}`}>
          <h4 className="text-xs font-black text-white uppercase tracking-widest block">
            {lang === 'fa' ? 'پتانسیل مالی بهینه‌سازی رانندگی' : 'Financial Saving Potential (Preview)'}
          </h4>
          
          <div className="grid grid-cols-2 gap-3 opacity-65">
            <div className="p-3 bg-slate-950/30 border border-dashed border-slate-800 rounded-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/5 text-amber-500/40 border border-amber-500/10">
                <Coffee size={16} />
              </div>
              <div>
                <span className="text-[10px] md:text-xs text-slate-400 font-bold block uppercase">{lang === 'fa' ? 'قهوه باکیفیت' : 'Premium Coffee'}</span>
                <span className="text-sm font-extrabold font-mono text-slate-500 block">-- Cups</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950/30 border border-dashed border-slate-800 rounded-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/5 text-purple-500/40 border border-purple-500/10">
                <Tv size={16} />
              </div>
              <div>
                <span className="text-[10px] md:text-xs text-slate-400 font-bold block uppercase">{lang === 'fa' ? 'اشتراک ماهانه' : 'Monthly Sub'}</span>
                <span className="text-sm font-extrabold font-mono text-slate-500 block">-- Months</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-900 font-medium">
            💡 <span className="font-semibold text-slate-200">{lang === 'fa' ? 'توضیح سیستم:' : 'System Insight:'}</span>{' '}
            {lang === 'fa'
              ? 'با ثبت دومین سوخت‌گیری کامل، میزان هدررفت مالی شما بر اساس راندمان واقعی خودرو محاسبه می‌شود.'
              : 'As soon as you log your second full-tank refueling, actual fuel cost per mile/km and cash leak rates will unlock.'}
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
    costUnitLabel = lang === 'fa' ? 'تومان / کیلومتر' : '€ / km';
  } else if (isUs) {
    const distanceMiles = totalDistance * KM_TO_MILES;
    costPerDistanceUnit = distanceMiles > 0 ? totalCost / distanceMiles : 0;
    costUnitLabel = lang === 'fa' ? 'دلار / مایل' : '$ / mi';
  } else {
    const distanceMiles = totalDistance * KM_TO_MILES;
    costPerDistanceUnit = distanceMiles > 0 ? totalCost / distanceMiles : 0;
    costUnitLabel = lang === 'fa' ? 'پوند / مایل' : '£ / mi';
  }

  // Calculate Wasted Money
  // Baseline is 7.5 L/100km
  const baselineConsumption = 7.5;
  let wastedCost = 0;
  let wastedLiters = 0;

  if (fuelEfficiency > baselineConsumption) {
    const extraLitersPer100km = fuelEfficiency - baselineConsumption;
    wastedLiters = extraLitersPer100km * (totalDistance / 100);
    const avgPricePerLiter = totalCost / totalLiters;
    wastedCost = wastedLiters * avgPricePerLiter;
  }

  // Equivalent calculations
  const coffeeCost = isUk ? 4.0 : 5.0;
  const subscriptionCost = isUk ? 12.0 : 15.0;
  const coffeeCount = Math.max(0, Math.floor(wastedCost / coffeeCost));
  const subCount = Math.max(0, Math.floor(wastedCost / subscriptionCost));

  // Define dynamic bilingual baseline limit text
  const isOptimal = fuelEfficiency <= 7.5;
  const currencySymbol = isUs ? '$' : isUk ? '£' : '€';
  let baselineText = '';

  if (isMetric) {
    if (isOptimal) {
      baselineText = lang === 'fa' 
        ? `کمتر از حد پایه (۷.۵ لیتر/۱۰۰ کیلومتر)` 
        : `Below 7.5 L/100km baseline limit`;
    } else {
      baselineText = lang === 'fa' 
        ? `+${Math.round(wastedCost).toLocaleString()} تومان بالاتر از حد پایه` 
        : `+${currencySymbol}${wastedCost.toFixed(2)} above limit`;
    }
  } else if (isUs) {
    const mpgEfficiency = fuelEfficiency > 0 ? 235.215 / fuelEfficiency : 0;
    const isMpgOptimal = mpgEfficiency >= 31.4;
    if (isMpgOptimal) {
      baselineText = lang === 'fa' 
        ? `بالاتر از حد پایه (۳۱.۴ MPG)` 
        : `Below 31.4 MPG baseline limit`;
    } else {
      baselineText = lang === 'fa' 
        ? `+$${Math.round(wastedCost).toLocaleString()} بالاتر از حد پایه` 
        : `+$${wastedCost.toFixed(2)} above limit`;
    }
  } else {
    const ukMpgEfficiency = fuelEfficiency > 0 ? 282.481 / fuelEfficiency : 0;
    const isUkMpgOptimal = ukMpgEfficiency >= 37.66;
    if (isUkMpgOptimal) {
      baselineText = lang === 'fa' 
        ? `بالاتر از حد پایه (۳۷.۷ UK MPG)` 
        : `Below 37.7 UK MPG baseline limit`;
    } else {
      baselineText = lang === 'fa' 
        ? `+£${Math.round(wastedCost).toLocaleString()} بالاتر از حد پایه` 
        : `+£${wastedCost.toFixed(2)} above limit`;
    }
  }

  const costDisplayVal = lang === 'fa'
    ? `${Math.round(costPerDistanceUnit).toLocaleString()} ${isMetric ? 'تومان' : isUs ? 'دلار' : 'پوند'}`
    : `${currencySymbol}${costPerDistanceUnit.toFixed(3)}`;

  const wastedCostDisplayVal = lang === 'fa'
    ? (wastedCost <= 0 
        ? 'بدون هدررفت شناسایی شده' 
        : `${Math.round(wastedCost).toLocaleString()} تومان هدررفت`)
    : (wastedCost <= 0 
        ? 'No Waste Detected' 
        : `${currencySymbol}${wastedCost.toFixed(2)} Wasted`);

  const moneyWastedLabel = lang === 'fa' ? 'هزینه هدررفته تخمینی' : 'ESTIMATED MONEY WASTED';
  const costPerDistanceLabel = lang === 'fa' ? 'هزینه به ازای واحد مسافت' : 'COST PER DISTANCE UNIT';
  const distanceUnitSuffix = lang === 'fa' ? (isMetric ? '/ کیلومتر' : '/ مایل') : costUnitLabel.replace(/^[€$£]\s*\/\s*/, '');

  const opportunitiesTitle = lang === 'fa' ? 'فرصت‌های خرید جایگزین از دست رفته' : 'Alternative Purchasing Opportunities Lost';
  const premiumCoffeeLabel = lang === 'fa' ? 'قهوه باکیفیت' : 'Premium Coffee';
  const coffeeCountLabel = lang === 'fa' ? `${coffeeCount > 0 ? `+${coffeeCount}` : '۰'} فنجان` : `${coffeeCount > 0 ? `+${coffeeCount}` : '0'} Cups`;
  const netflixMonthLabel = lang === 'fa' ? 'ماه اشتراک دیجیتال' : 'Monthly Subscription';
  const subCountLabel = lang === 'fa' ? `${subCount > 0 ? `+${subCount}` : '۰'} ماه` : `${subCount > 0 ? `+${subCount}` : '0'} Months`;

  const recommendationText = lang === 'fa'
    ? `اقدام مالی-محیط‌زیستی: با تنظیم موتور خودرو و تنظیم فشار باد تایرها، می‌توانید این هدررفت نقدی را برطرف کرده و پس‌انداز ایجاد کنید.`
    : `Eco-Finance Action: By tuning your engine and keeping tires correctly inflated, you can plug this cash leak and save on future commutes.`;

  return (
    <div id="financial-impact-card" className="cyber-card p-5 sm:p-6 md:p-8 rounded-2xl border border-indigo-500/15 bg-slate-950/40 backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30">
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-[0.07] pointer-events-none"></div>
      
      {/* Decorative pulse background glow */}
      <div className="absolute -left-20 -bottom-20 w-44 h-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

      {/* Row 1: Status Badge aligned to corner */}
      <div className={`flex mb-2 sm:mb-3 ${lang === 'fa' ? 'justify-start' : 'justify-end'}`}>
        <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider flex items-center gap-1 shrink-0 whitespace-nowrap ${
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
              ? (lang === 'fa' ? 'بهینه - بدون هدررفت' : 'Optimal - No Leak')
              : wastedCost > 15
              ? (lang === 'fa' ? 'بحران هدررفت هزینه' : 'Critical Cost Leak')
              : (lang === 'fa' ? 'هدررفت متوسط' : 'Moderate Leak')
            }
          </span>
        </span>
      </div>

      {/* Row 2: Dollar Icon, Title & Subtitle */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.25)] shrink-0">
          <DollarSign size={22} className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
        </div>
        <div className={lang === 'fa' ? 'text-right' : 'text-left'}>
          <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-white leading-tight">
            {lang === 'fa' ? 'تاثیر مخارج مالی' : 'FINANCIAL IMPACT'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5 leading-snug">
            {lang === 'fa' ? 'محاسبه راندمان مالی و انحراف هزینه‌ها' : 'Calculating financial efficiency and deviations'}
          </p>
        </div>
      </div>

      {/* Unified Metric Blocks (Side-by-Side Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-4">
        {/* Left Block: Cost Per Distance Unit */}
        <div className="bg-slate-950/50 backdrop-blur-md border border-slate-800/80 hover:border-slate-700/80 p-4 rounded-xl flex items-center justify-between transition-all">
          <div className={lang === 'fa' ? 'text-right' : 'text-left'}>
            <span className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider block mb-1">
              {costPerDistanceLabel}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                {costDisplayVal}
              </span>
              {distanceUnitSuffix && (
                <span className="text-xs text-slate-400 font-bold font-mono tracking-wider">/ {distanceUnitSuffix}</span>
              )}
            </div>
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
          <div className={lang === 'fa' ? 'text-right' : 'text-left'}>
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
            ) : wastedCost > 15 ? (
              <TrendingUp size={20} className="text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
            ) : (
              <TrendingUp size={20} className="text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
            )}
          </div>
        </div>
      </div>

      {/* Visual alternatives cards */}
      {wastedCost > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className={`text-xs font-extrabold text-white uppercase tracking-widest block ${lang === 'fa' ? 'text-right' : 'text-left'}`}>
            {opportunitiesTitle}
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Coffee card alternative */}
            <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all duration-300 ${
              coffeeCount > 0 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' 
                : 'bg-slate-950/30 border-slate-900/40 text-slate-600'
            }`}>
              <div className={`p-2 rounded-lg ${coffeeCount > 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-900 text-slate-700'}`}>
                <Coffee size={16} />
              </div>
              <div className={lang === 'fa' ? 'text-right' : 'text-left'}>
                <span className="text-[10px] md:text-xs text-slate-400 font-bold block uppercase">{premiumCoffeeLabel}</span>
                <span className="text-sm sm:text-base font-extrabold font-mono tracking-tight block">
                  {coffeeCountLabel}
                </span>
              </div>
            </div>

            {/* Streaming card alternative */}
            <div className={`p-3 rounded-xl border flex items-center gap-3 transition-all duration-300 ${
              subCount > 0 
                ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' 
                : 'bg-slate-950/30 border-slate-900/40 text-slate-600'
            }`}>
              <div className={`p-2 rounded-lg ${subCount > 0 ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-900 text-slate-700'}`}>
                <Tv size={16} />
              </div>
              <div className={lang === 'fa' ? 'text-right' : 'text-left'}>
                <span className="text-[10px] md:text-xs text-slate-400 font-bold uppercase block">{netflixMonthLabel}</span>
                <span className="text-sm sm:text-base font-extrabold font-mono tracking-tight block">
                  {subCountLabel}
                </span>
              </div>
            </div>
          </div>
          
          <p className={`text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3.5 rounded-xl border border-slate-900 font-medium ${lang === 'fa' ? 'text-right' : 'text-left'}`}>
            💡 {recommendationText}
          </p>
        </div>
      )}
    </div>
  );
}


