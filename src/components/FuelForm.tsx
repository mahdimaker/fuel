/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlusCircle, Flame, DollarSign, Hash, Info, Zap } from 'lucide-react';
import { FuelEntry, FuelType } from '../types';
import { translations, Language } from '../utils/translations';

interface FuelFormProps {
  currentOdometer: number; // always stored in km
  onAddEntry: (entry: Omit<FuelEntry, 'id'>) => void;
  lang: Language;
  unitSystem: 'metric' | 'us' | 'uk';
  logs: FuelEntry[];
  fuelCapacity?: number;
}

export default function FuelForm({ currentOdometer, onAddEntry, lang, unitSystem, logs, fuelCapacity = 50 }: FuelFormProps) {
  const t = translations[lang];
  const isMetric = unitSystem === 'metric';
  const isUs = unitSystem === 'us';
  const isUk = unitSystem === 'uk';

  // State
  const [odometer, setOdometer] = useState<string>('');
  const [liters, setLiters] = useState<string>('');
  const [cost, setCost] = useState<string>('');
  const [fuelType, setFuelType] = useState<FuelType>('regular');
  const [stationName, setStationName] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [fullTank, setFullTank] = useState<boolean>(true);
  const [missedRefuel, setMissedRefuel] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [wasAutoDetected, setWasAutoDetected] = useState<boolean>(false);

  // Conversion Constants
  const KM_TO_MILES = 0.621371;
  const LITERS_TO_GALLONS = 0.264172;
  const TOMAN_TO_USD = 1 / 60000;
  const TOMAN_TO_GBP = 1 / 75000;

  // Handler for custom liters or odometer change with smart auto-detect
  const runAutoDetect = (litVal: string, odoVal: string) => {
    const numLiters = Number(litVal);
    if (!isNaN(numLiters) && numLiters > 0) {
      // Convert entered volume to Liters for comparison with fuelCapacity (which is in Liters)
      const numInLiters = isUs ? numLiters / LITERS_TO_GALLONS : numLiters;

      // 1. Establish the previous odometer and the entered odometer
      const lastOdoKm = logs.length > 0 ? Math.max(...logs.map(l => l.odometer)) : currentOdometer;
      const enteredOdoNum = Number(odoVal);
      const enteredOdoKm = isNaN(enteredOdoNum) || enteredOdoNum <= 0 
        ? 0 
        : (isMetric ? enteredOdoNum : enteredOdoNum / KM_TO_MILES);
      
      const distanceKm = enteredOdoKm > lastOdoKm ? enteredOdoKm - lastOdoKm : 0;

      // Calculate historical average efficiency in L/100km
      const getAverageEfficiency = (): number => {
        if (logs.length >= 2) {
          const sorted = [...logs].sort((a, b) => a.odometer - b.odometer);
          let totalDist = 0;
          let totalFuel = 0;
          let lastFullOdo: number | null = null;
          let currentPeriodFuel = 0;
          for (const log of sorted) {
            if (log.missedRefuel) {
              lastFullOdo = log.fullTank ? log.odometer : null;
              currentPeriodFuel = log.fullTank ? 0 : log.liters;
              continue;
            }
            if (lastFullOdo === null) {
              if (log.fullTank) {
                lastFullOdo = log.odometer;
                currentPeriodFuel = 0;
              } else {
                currentPeriodFuel += log.liters;
              }
            } else {
              if (log.fullTank) {
                const dist = log.odometer - lastFullOdo;
                if (dist > 0) {
                  totalDist += dist;
                  totalFuel += currentPeriodFuel + log.liters;
                }
                lastFullOdo = log.odometer;
                currentPeriodFuel = 0;
              } else {
                currentPeriodFuel += log.liters;
              }
            }
          }
          if (totalDist > 0 && totalFuel > 0) {
            return (totalFuel / totalDist) * 100;
          }
        }
        return 8.0; // default 8.0 L/100km
      };

      if (distanceKm > 0) {
        const avgEff = getAverageEfficiency();
        const expectedFuelConsumed = (distanceKm * avgEff) / 100;

        // Smart decision with odometer info
        // - Full if: they entered enough fuel to cover expected consumption (within 5 liters margin)
        //            OR if the volume is a huge portion of capacity (>= capacity * 0.70)
        const isFullByExpected = numInLiters >= expectedFuelConsumed - 5;
        const isFullByCapacity = numInLiters >= fuelCapacity - 12 || numInLiters >= fuelCapacity * 0.75;

        if (isFullByExpected || isFullByCapacity) {
          setFullTank(true);
          setWasAutoDetected(true);
        } else {
          // - Partial if: they entered much less than expected consumed AND it's a small portion of capacity
          const isPartialByExpected = numInLiters < expectedFuelConsumed - 5;
          const isPartialByCapacity = numInLiters < fuelCapacity * 0.70;
          if (isPartialByExpected && isPartialByCapacity) {
            setFullTank(false);
            setWasAutoDetected(true);
          } else {
            setWasAutoDetected(false);
          }
        }
      } else {
        // Fallback to capacity-only if odometer is not yet entered or invalid
        // - Full if they filled at least 75% of the tank or capacity - 12 liters
        if (numInLiters >= fuelCapacity - 12 || numInLiters >= fuelCapacity * 0.75) {
          setFullTank(true);
          setWasAutoDetected(true);
        } else if (numInLiters < fuelCapacity * 0.50) {
          // - Partial if they put less than half a tank
          setFullTank(false);
          setWasAutoDetected(true);
        } else {
          setWasAutoDetected(false);
        }
      }
    } else {
      setWasAutoDetected(false);
    }
  };

  // 1. Calculate Average Gas Price from History
  let averagePricePerUnit = 0;
  if (logs.length > 0) {
    if (isMetric) {
      const totalCost = logs.reduce((sum, l) => sum + l.cost, 0);
      const totalVolume = logs.reduce((sum, l) => sum + l.liters, 0);
      averagePricePerUnit = totalVolume > 0 ? totalCost / totalVolume : 0;
    } else if (isUs) {
      // US Units: cost in USD / volume in Gallons
      const totalCostUsd = logs.reduce((sum, l) => sum + (lang === 'fa' ? l.cost * TOMAN_TO_USD : l.cost), 0);
      const totalVolumeGallons = logs.reduce((sum, l) => sum + (l.liters * LITERS_TO_GALLONS), 0);
      averagePricePerUnit = totalVolumeGallons > 0 ? totalCostUsd / totalVolumeGallons : 0;
    } else {
      // UK Units: cost in GBP / volume in Liters (UK buys fuel in Litres)
      const totalCostGbp = logs.reduce((sum, l) => sum + (lang === 'fa' ? l.cost * TOMAN_TO_GBP : l.cost), 0);
      const totalVolumeLiters = logs.reduce((sum, l) => sum + l.liters, 0);
      averagePricePerUnit = totalVolumeLiters > 0 ? totalCostGbp / totalVolumeLiters : 0;
    }
  }

  // 2. Calculate Entered Price per Unit
  const enteredCost = Number(cost);
  const enteredVolume = Number(liters);
  let priceDiffPct = 0;
  let hasPriceDiff = false;

  if (enteredCost > 0 && enteredVolume > 0 && averagePricePerUnit > 0) {
    const currentPricePerUnit = enteredCost / enteredVolume;
    priceDiffPct = ((currentPricePerUnit - averagePricePerUnit) / averagePricePerUnit) * 100;
    hasPriceDiff = Math.abs(priceDiffPct) >= 0.5;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const odoNumEntered = Number(odometer);
    const litNumEntered = Number(liters);
    const costNumEntered = Number(cost);

    if (odoNumEntered <= 0 || litNumEntered <= 0 || costNumEntered <= 0) {
      setError(t.valuesError);
      return;
    }

    // Convert entries to standard Metric for backend/storage consistency
    let odoNum = odoNumEntered;
    let litNum = litNumEntered;
    let costNum = costNumEntered;

    if (isMetric) {
      // Metric is already stored in km and liters, so do nothing
    } else if (isUs) {
      odoNum = odoNumEntered / KM_TO_MILES; // Convert Miles to Km
      litNum = litNumEntered / LITERS_TO_GALLONS; // Convert Gallons to Liters
      if (lang === 'fa') {
        costNum = costNumEntered * 60000; // Convert entered USD to stored Tomans
      }
    } else {
      // UK hybrid: distance in Miles, volume in Liters
      odoNum = odoNumEntered / KM_TO_MILES; // Convert Miles to Km
      litNum = litNumEntered; // Already in Liters!
      if (lang === 'fa') {
        costNum = costNumEntered * 75000; // Convert entered GBP to stored Tomans
      }
    }

    // Validate fuel capacity
    if (fuelCapacity && litNum > fuelCapacity) {
      const displayCapacity = isUs ? fuelCapacity * LITERS_TO_GALLONS : fuelCapacity;
      setError(lang === 'fa'
        ? `مقدار سوخت وارد شده (${litNumEntered.toLocaleString(undefined, {maximumFractionDigits: 2})} ${volumeUnit}) نمی‌تواند بیشتر از ظرفیت باک خودرو (${displayCapacity.toLocaleString(undefined, {maximumFractionDigits: 2})} ${volumeUnit}) باشد.`
        : `Entered fuel volume (${litNumEntered.toLocaleString(undefined, {maximumFractionDigits: 2})} ${volumeUnit}) cannot exceed the vehicle's fuel capacity (${displayCapacity.toLocaleString(undefined, {maximumFractionDigits: 2})} ${volumeUnit}).`
      );
      return;
    }

    // Validate odometer against stored km value
    if (logs.length === 0) {
      if (odoNum < currentOdometer) {
        const odoUnit = isMetric ? (lang === 'fa' ? 'کیلومتر' : 'km') : (lang === 'fa' ? 'مایل' : 'mi');
        const displayCurrentOdo = isMetric ? currentOdometer : currentOdometer * KM_TO_MILES;
        setError(lang === 'fa'
          ? `کارکرد سوخت‌گیری نمی‌تواند کمتر از کارکرد اولیه خودرو (${Math.round(displayCurrentOdo).toLocaleString()} ${odoUnit}) باشد.`
          : `Odometer reading cannot be less than the initial vehicle odometer (${Math.round(displayCurrentOdo).toLocaleString()} ${odoUnit}).`
        );
        return;
      }
    } else {
      if (odoNum <= 0) {
        setError(t.valuesError);
        return;
      }
      const maxOdo = Math.max(...logs.map(l => l.odometer));
      if (odoNum <= maxOdo) {
        const odoUnit = isMetric ? (lang === 'fa' ? 'کیلومتر' : 'km') : (lang === 'fa' ? 'مایل' : 'mi');
        const displayMaxOdo = isMetric ? maxOdo : maxOdo * KM_TO_MILES;
        setError(lang === 'fa'
          ? `کیلومترشمار سوخت‌گیری باید بیشتر از آخرین سوخت‌گیری ثبت‌شده (${Math.round(displayMaxOdo).toLocaleString()} ${odoUnit}) باشد.`
          : `Odometer reading must be greater than the last recorded refueling (${Math.round(displayMaxOdo).toLocaleString()} ${odoUnit}).`
        );
        return;
      }
    }

    onAddEntry({
      date: new Date().toISOString().split('T')[0],
      odometer: odoNum,
      liters: litNum,
      cost: costNum,
      fuelType,
      stationName: stationName.trim() || undefined,
      notes: notes.trim() || undefined,
      fullTank,
      missedRefuel,
    });

    // Reset odometer and inputs to completely empty string for seamless entry
    setOdometer('');
    setLiters('');
    setCost('');
    setStationName('');
    setNotes('');
    setFullTank(true);
    setMissedRefuel(false);
  };

  const fuelTypesList: { value: FuelType; label: string; color: string; activeClass: string }[] = lang === 'fa' ? [
    { value: 'regular', label: 'بنزین معمولی', color: 'from-blue-500 to-indigo-500', activeClass: 'bg-blue-800 border-blue-400 text-white !text-white shadow-md shadow-blue-500/25' },
    { value: 'super', label: 'بنزین سوپر', color: 'from-purple-500 to-pink-500', activeClass: 'bg-purple-600 border-purple-400 text-white !text-white shadow-md shadow-purple-500/25' },
    { value: 'diesel', label: 'دیزل / گازوئیل', color: 'from-amber-600 to-yellow-500', activeClass: 'bg-amber-600 border-amber-400 text-white !text-white shadow-md shadow-amber-500/25' },
    { value: 'hybrid', label: 'هیبرید / برقی', color: 'from-emerald-500 to-teal-400', activeClass: 'bg-emerald-600 border-emerald-400 text-white !text-white shadow-md shadow-emerald-500/25' },
    { value: 'gas', label: 'گاز CNG/LPG', color: 'from-cyan-500 to-blue-400', activeClass: 'bg-cyan-600 border-cyan-400 text-white !text-white shadow-md shadow-cyan-500/25' },
  ] : [
    { value: 'regular', label: 'Regular Gas', color: 'from-blue-500 to-indigo-500', activeClass: 'bg-blue-800 border-blue-400 text-white !text-white shadow-md shadow-blue-500/25' },
    { value: 'super', label: 'Premium Fuel', color: 'from-purple-500 to-pink-500', activeClass: 'bg-purple-600 border-purple-400 text-white !text-white shadow-md shadow-purple-500/25' },
    { value: 'diesel', label: 'Diesel', color: 'from-amber-600 to-yellow-500', activeClass: 'bg-amber-600 border-amber-400 text-white !text-white shadow-md shadow-amber-500/25' },
    { value: 'hybrid', label: 'Hybrid/Electric', color: 'from-emerald-500 to-teal-400', activeClass: 'bg-emerald-600 border-emerald-400 text-white !text-white shadow-md shadow-emerald-500/25' },
    { value: 'gas', label: 'LPG / CNG', color: 'from-cyan-500 to-blue-400', activeClass: 'bg-cyan-600 border-cyan-400 text-white !text-white shadow-md shadow-cyan-500/25' },
  ];

  // Unit overrides
  const lastOdoKm = logs.length > 0 ? Math.max(...logs.map(l => l.odometer)) : currentOdometer;
  const displayPrevOdo = Math.round(isMetric ? lastOdoKm : lastOdoKm * KM_TO_MILES);
  const maxVolCapacity = Math.round(isUs ? fuelCapacity * LITERS_TO_GALLONS : fuelCapacity);

  const odoUnit = isMetric ? (lang === 'fa' ? 'کیلومتر' : 'km') : (lang === 'fa' ? 'مایل' : 'mi');
  const volumeUnit = isUs 
    ? (lang === 'fa' ? 'گالن' : 'Gallons') 
    : (lang === 'fa' ? 'لیتر' : 'Liters');
  const currencyUnit = isMetric 
    ? (lang === 'fa' ? 'تومان' : '€') 
    : isUs 
      ? (lang === 'fa' ? 'دلار' : '$') 
      : (lang === 'fa' ? 'پوند' : '£');

  // Default values initialization
  React.useEffect(() => {
    if (!odometer) {
      setOdometer(displayPrevOdo.toString());
    }
  }, [displayPrevOdo]);

  React.useEffect(() => {
    if (!liters) {
      const defaultVol = Math.round(maxVolCapacity * 0.7);
      setLiters((defaultVol > 0 ? defaultVol : 30).toString());
    }
  }, [maxVolCapacity]);

  React.useEffect(() => {
    if (!cost) {
      const defaultCost = lang === 'fa' ? '150000' : '50';
      setCost(defaultCost);
    }
  }, [lang]);

  return (
    <div id="fuel-form-card" className="cyber-card p-6 rounded-2xl relative overflow-hidden transition-all duration-300 border-indigo-500/20 hover:border-indigo-500/30">
      <div className="absolute -right-20 -bottom-20 w-44 h-44 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <Flame size={22} className="animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{t.fuelFormTitle}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{t.fuelFormSub}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-950/40 border border-red-900/50 text-red-400 text-xs rounded-xl flex items-center gap-2">
          <Info size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Fuel Type Selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2 mr-1">{t.fuelTypeLabel}</label>
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2.5">
            {fuelTypesList.map((item) => (
              <button
                key={item.value}
                type="button"
                id={`fuel-type-${item.value}`}
                onClick={() => setFuelType(item.value)}
                className={`py-2.5 px-2 text-center rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  fuelType === item.value
                    ? item.activeClass
                    : 'bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${fuelType === item.value ? 'bg-white' : `bg-gradient-to-r ${item.color}`}`}></span>
                  <span className={fuelType === item.value ? 'text-white !text-white font-bold' : ''}>{item.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs with Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Odometer Field */}
          <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/80 space-y-3 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Hash size={13} className="text-indigo-400 shrink-0" />
                  <span>{lang === 'fa' ? 'کیلومترشمار' : 'Odometer'}</span>
                </label>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{odoUnit}</span>
              </div>
              <input
                id="input-odometer"
                type="number"
                required
                min="0"
                value={odometer}
                onChange={(e) => {
                  setOdometer(e.target.value);
                  runAutoDetect(liters, e.target.value);
                }}
                className="w-full text-center font-mono font-bold text-base bg-slate-900 border border-slate-700/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-1.5 text-slate-100 outline-none transition-all shadow-inner"
              />
            </div>
            
            <div className="space-y-1 pt-1">
              <input
                type="range"
                min={displayPrevOdo}
                max={Math.max(displayPrevOdo + 2000, (Number(odometer) || displayPrevOdo) + 500)}
                step={10}
                value={Number(odometer) || displayPrevOdo}
                onChange={(e) => {
                  setOdometer(e.target.value);
                  runAutoDetect(liters, e.target.value);
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono font-semibold pt-0.5">
                <span>{Math.round(displayPrevOdo).toLocaleString()}</span>
                <span>+{(Math.max(displayPrevOdo + 2000, (Number(odometer) || displayPrevOdo) + 500) - displayPrevOdo).toLocaleString()}</span>
              </div>
            </div>

            {lastOdoKm > 0 && (
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <span>{lang === 'fa' ? 'آخرین کارکرد:' : 'Previous:'}</span>
                <span className="text-indigo-400 font-bold font-mono">{Math.round(displayPrevOdo).toLocaleString()} {odoUnit}</span>
              </div>
            )}
          </div>

          {/* Volume Field */}
          <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/80 space-y-3 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Flame size={13} className="text-cyan-400 shrink-0" />
                  <span>{lang === 'fa' ? 'مقدار سوخت' : 'Volume'}</span>
                </label>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{volumeUnit}</span>
              </div>
              <input
                id="input-liters"
                type="number"
                step="0.01"
                required
                min="0.01"
                value={liters}
                onChange={(e) => {
                  setLiters(e.target.value);
                  runAutoDetect(e.target.value, odometer);
                }}
                className="w-full text-center font-mono font-bold text-base bg-slate-900 border border-slate-700/80 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-3 py-1.5 text-slate-100 outline-none transition-all shadow-inner"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <input
                type="range"
                min={0.5}
                max={Math.max(10, maxVolCapacity)}
                step={0.1}
                value={Number(liters) || 0.5}
                onChange={(e) => {
                  const val = (Math.round(parseFloat(e.target.value) * 100) / 100).toString();
                  setLiters(val);
                  runAutoDetect(val, odometer);
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono font-semibold pt-0.5">
                <span>0.5</span>
                {/* Fine decimal tune buttons */}
                <div className="flex items-center gap-1 font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      const curr = Math.max(0.01, (Number(liters) || 0) - 0.01);
                      const val = (Math.round(curr * 100) / 100).toFixed(2);
                      setLiters(val);
                      runAutoDetect(val, odometer);
                    }}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
                    title={lang === 'fa' ? 'کاهش ۰.۰۱' : '-0.01'}
                  >
                    -0.01
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const curr = (Number(liters) || 0) + 0.01;
                      const val = (Math.round(curr * 100) / 100).toFixed(2);
                      setLiters(val);
                      runAutoDetect(val, odometer);
                    }}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[10px] font-bold transition-all active:scale-95 cursor-pointer"
                    title={lang === 'fa' ? 'افزایش ۰.۰۱' : '+0.01'}
                  >
                    +0.01
                  </button>
                </div>
                <span>{Math.max(10, maxVolCapacity)} {volumeUnit}</span>
              </div>
            </div>

            {wasAutoDetected ? (
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-cyan-400 font-semibold">
                <span>{fullTank ? (lang === 'fa' ? '✨ باک پر تخمین زده شد' : '✨ Full tank estimated') : (lang === 'fa' ? 'ℹ️ باک نیمه‌پر تخمین زده شد' : 'ℹ️ Partial fill estimated')}</span>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-500 font-semibold text-center">
                <span>{lang === 'fa' ? 'حجم سوخت واردشده' : 'Fuel volume'}</span>
              </div>
            )}
          </div>

          {/* Paid Cost Field */}
          <div className="bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/80 space-y-3 flex flex-col justify-between shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-1">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <DollarSign size={13} className="text-emerald-400 shrink-0" />
                  <span>{lang === 'fa' ? 'مجموع هزینه' : 'Total Cost'}</span>
                </label>
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">{currencyUnit}</span>
              </div>
              <input
                id="input-cost"
                type="number"
                step="0.01"
                required
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full text-center font-mono font-bold text-base bg-slate-900 border border-slate-700/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-3 py-1.5 text-slate-100 outline-none transition-all shadow-inner"
              />
            </div>

            <div className="space-y-1.5 pt-1">
              <input
                type="range"
                min={0}
                max={lang === 'fa' ? 2000000 : 250}
                step={lang === 'fa' ? 1000 : 0.5}
                value={Number(cost) || 0}
                onChange={(e) => {
                  const val = (Math.round(parseFloat(e.target.value) * 100) / 100).toString();
                  setCost(val);
                }}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono font-semibold pt-0.5">
                <span>0</span>
                {/* Fine decimal tune buttons */}
                <div className="flex items-center gap-1 font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      const delta = lang === 'fa' ? 100 : 0.01;
                      const curr = Math.max(0, (Number(cost) || 0) - delta);
                      const val = lang === 'fa' ? Math.round(curr).toString() : (Math.round(curr * 100) / 100).toFixed(2);
                      setCost(val);
                    }}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[10px] font-bold transition-all active:scale-95"
                    title={lang === 'fa' ? 'کاهش دوتایی' : '-0.01'}
                  >
                    {lang === 'fa' ? '-۱۰۰' : '-0.01'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const delta = lang === 'fa' ? 100 : 0.01;
                      const curr = (Number(cost) || 0) + delta;
                      const val = lang === 'fa' ? Math.round(curr).toString() : (Math.round(curr * 100) / 100).toFixed(2);
                      setCost(val);
                    }}
                    className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[10px] font-bold transition-all active:scale-95"
                    title={lang === 'fa' ? 'افزایش دوتایی' : '+0.01'}
                  >
                    {lang === 'fa' ? '+۱۰۰' : '+0.01'}
                  </button>
                </div>
                <span>{(lang === 'fa' ? 2000000 : 250).toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60 min-h-[25px] flex items-center justify-between">
              {hasPriceDiff ? (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 w-full justify-between ${
                  priceDiffPct > 0 
                    ? 'text-rose-400 bg-rose-500/10 border-rose-500/15' 
                    : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15'
                }`}>
                  <Zap size={10} className="shrink-0" />
                  <span>
                    {priceDiffPct > 0 ? (
                      lang === 'fa' ? `${Math.round(priceDiffPct)}٪ بالاتر از میانگین` : `${priceDiffPct.toFixed(1)}% above avg`
                    ) : (
                      lang === 'fa' ? `${Math.round(Math.abs(priceDiffPct))}٪ اقتصادی‌تر از میانگین` : `${Math.abs(priceDiffPct).toFixed(1)}% below avg`
                    )}
                  </span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-500 font-semibold text-center w-full">
                  {lang === 'fa' ? 'هزینه کل سوخت‌گیری' : 'Total refuel cost'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Scenario Toggles: Tank Full & Missed Refuel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Tank Full Toggle */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 shadow-md ${
            fullTank 
              ? 'bg-indigo-950/20 border-indigo-500/30 shadow-[0_4px_20px_rgba(99,102,241,0.08)]' 
              : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60'
          }`}>
            <div className={`space-y-1 flex-1 ${lang === 'fa' ? 'text-right pl-3' : 'text-left pr-3'}`}>
              <label className="text-xs sm:text-sm font-bold text-slate-100 block tracking-wide">
                {lang === 'fa' ? 'آیا باک کاملاً پر شد؟' : 'Did you fill the tank fully?'}
              </label>
              <span className="text-xs text-slate-400 leading-relaxed font-normal block">
                {lang === 'fa'
                  ? 'فعال نگه دارید تا محاسبات مصرف سوخت دقیق انجام شود.'
                  : 'Keep active for accurate fuel economy calculations.'}
              </span>
              {wasAutoDetected && (
                <span className="inline-flex items-center gap-1 text-[10px] text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded-md mt-1 border border-cyan-500/20">
                  {fullTank
                    ? (lang === 'fa' ? 'تخمین خودکار: باک پر' : 'Auto-detected: Full Tank')
                    : (lang === 'fa' ? 'تخمین خودکار: نیمه‌پر' : 'Auto-detected: Partial')
                  }
                </span>
              )}
            </div>
            <button
              type="button"
              id="toggle-tank-full"
              onClick={() => {
                setFullTank(!fullTank);
                setWasAutoDetected(false); // User manually overrode
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-transparent transition-all duration-300 outline-none ${
                fullTank 
                  ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/40 border-indigo-400/20' 
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.3)] transition duration-200 ease-in-out ${
                  fullTank ? (lang === 'fa' ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Missed Refuel Toggle */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 shadow-md ${
            missedRefuel 
              ? 'bg-amber-950/20 border-amber-500/30 shadow-[0_4px_20px_rgba(245,158,11,0.08)]' 
              : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/60'
          }`}>
            <div className={`space-y-1 flex-1 ${lang === 'fa' ? 'text-right pl-3' : 'text-left pr-3'}`}>
              <label className="text-xs sm:text-sm font-bold text-slate-100 block tracking-wide">
                {lang === 'fa' ? 'سوخت‌گیری قبلی ثبت نشده؟' : 'Missed a previous refuel?'}
              </label>
              <span className="text-xs text-slate-400 leading-relaxed font-normal block">
                {lang === 'fa'
                  ? 'اگر سوخت‌گیری‌های قبل را ثبت نکرده‌اید فعال کنید.'
                  : 'Check this if you forgot to log any prior fill-ups.'}
              </span>
            </div>
            <button
              type="button"
              id="toggle-missed-refuel"
              onClick={() => setMissedRefuel(!missedRefuel)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-transparent transition-all duration-300 outline-none ${
                missedRefuel 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-lg shadow-amber-500/40 border-amber-400/20' 
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-[0_2px_5px_rgba(0,0,0,0.3)] transition duration-200 ease-in-out ${
                  missedRefuel ? (lang === 'fa' ? '-translate-x-5' : 'translate-x-5') : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Optional Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 mr-1">{t.stationLabel}</label>
            <input
              id="input-station"
              type="text"
              placeholder={lang === 'fa' ? "مثال: جایگاه ۲۸ آزادی" : "e.g. Shell Station"}
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 mr-1">{t.notesLabel}</label>
            <input
              id="input-notes"
              type="text"
              placeholder={lang === 'fa' ? "مثال: بنزین سوپر زدم، باد چرخ تنظیم شد" : "e.g. Cleared injector, aligned tires"}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
            />
          </div>
        </div>

        <button
          id="btn-submit-refuel"
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm cursor-pointer transition-all active:scale-98 mt-2 shadow-md"
        >
          <PlusCircle size={18} />
          <span>{t.submitRefuel}</span>
        </button>
      </form>
    </div>
  );
}
