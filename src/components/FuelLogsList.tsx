/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Trash2, AlertCircle, Calendar, Fuel, ChevronDown, Check, X, 
  Download, Upload, CheckCircle2, FileSpreadsheet, RotateCcw, 
  Gauge, Droplets, ArrowUpDown, MapPin
} from 'lucide-react';
import { FuelEntry } from '../types';
import { translations, Language } from '../utils/translations';
import { calculateLogEfficiencies } from '../utils/calculator';
import { exportLogsToCSV, importLogsFromCSV } from '../utils/csv';

interface FuelLogsListProps {
  logs: FuelEntry[];
  onDeleteEntry: (id: string) => void;
  onImportLogs?: (newLogs: FuelEntry[]) => void;
  onResetLogs?: () => void;
  lang: Language;
  unitSystem: 'metric' | 'us' | 'uk';
  title?: string;
}

export type SortOrder = 'newest' | 'oldest' | 'cost-high' | 'cost-low';

export default function FuelLogsList({ 
  logs, 
  onDeleteEntry, 
  onImportLogs, 
  onResetLogs,
  lang, 
  unitSystem, 
  title 
}: FuelLogsListProps) {
  const t = translations[lang];
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importNotice, setImportNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMetric = unitSystem === 'metric';
  const isUs = unitSystem === 'us';

  // Conversion Constants
  const KM_TO_MILES = 0.621371;
  const LITERS_TO_GALLONS = 0.264172;
  const TOMAN_TO_USD = 1 / 60000;
  const TOMAN_TO_GBP = 1 / 75000;

  // Handle Export CSV
  const handleExportCSV = () => {
    if (logs.length === 0) return;
    exportLogsToCSV(logs);
  };

  // Trigger File Input Click
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Process Imported CSV File
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const result = importLogsFromCSV(text, logs);
      if (result.success && result.newCount > 0) {
        if (onImportLogs) {
          onImportLogs(result.importedLogs);
        }
        const msg = `Successfully imported ${result.newCount} new record(s).${result.duplicateCount > 0 ? ` (${result.duplicateCount} duplicates skipped)` : ''}`;
        setImportNotice({ type: 'success', message: msg });
      } else if (result.success && result.newCount === 0) {
        setImportNotice({
          type: 'error',
          message: result.error || 'No new records imported.',
        });
      } else {
        setImportNotice({
          type: 'error',
          message: result.error || 'Failed to import CSV file.',
        });
      }
    };
    reader.readAsText(file);
  };

  // Map types to translation values
  const getFuelTypeLabel = (type: string) => {
    if (lang === 'fa') {
      switch (type) {
        case 'regular': return 'بنزین معمولی';
        case 'super': return 'بنزین سوپر';
        case 'diesel': return 'دیزل';
        case 'hybrid': return 'هیبرید';
        case 'gas': return 'گاز CNG/LPG';
        default: return type;
      }
    } else {
      switch (type) {
        case 'regular': return 'Regular Gas';
        case 'super': return 'Premium Fuel';
        case 'diesel': return 'Diesel';
        case 'hybrid': return 'Hybrid';
        case 'gas': return 'LPG/CNG';
        default: return type;
      }
    }
  };

  // Functional Sorting based on sortOrder
  const sortedLogs = [...logs].sort((a, b) => {
    if (sortOrder === 'oldest') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (sortOrder === 'cost-high') {
      return b.cost - a.cost;
    }
    if (sortOrder === 'cost-low') {
      return a.cost - b.cost;
    }
    // Default: 'newest'
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  if (logs.length === 0) {
    return (
      <div id="empty-logs-card" className="bg-slate-800/80 border border-slate-800 p-8 rounded-2xl text-center space-y-4 shadow-sm">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="mx-auto w-12 h-12 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center text-slate-500">
          <AlertCircle size={24} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-300">{t.emptyLogsTitle}</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">{t.emptyLogsSub}</p>
        </div>

        {/* Import CSV Option in Empty State */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={handleImportClick}
            className="px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:text-purple-300 text-xs font-bold flex items-center gap-2 hover:bg-purple-500/20 transition-all cursor-pointer shadow-md active:scale-95"
          >
            <Upload size={15} />
            <span>Import CSV Data</span>
          </button>
        </div>

        {/* Notice Banner */}
        {importNotice && (
          <div className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 max-w-md mx-auto animate-fadeIn ${
            importNotice.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}>
            <span className="flex items-center gap-1.5">
              {importNotice.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span>{importNotice.message}</span>
            </span>
            <button onClick={() => setImportNotice(null)} className="p-1 text-slate-400 hover:text-white">
              <X size={12} />
            </button>
          </div>
        )}
      </div>
    );
  }

  const stepEfficiencies = calculateLogEfficiencies(logs);

  return (
    <div id="logs-list-card" className="space-y-4">
      {/* Hidden File Input for CSV Import */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Header Row with Title and Functional Sort Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>{title || t.recentLogsTitle}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 font-mono">
              {logs.length}
            </span>
          </h2>
        </div>

        {/* Functional Sort Order Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded-lg px-2.5 py-1">
          <ArrowUpDown size={12} className="text-purple-400 shrink-0" />
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            {lang === 'fa' ? 'ترتیب:' : 'Order:'}
          </span>
          <select
            id="logs-sort-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
          >
            <option value="newest" className="bg-slate-900 text-slate-200">
              {lang === 'fa' ? 'جدیدترین' : 'Newest First'}
            </option>
            <option value="oldest" className="bg-slate-900 text-slate-200">
              {lang === 'fa' ? 'قدیمی‌ترین' : 'Oldest First'}
            </option>
            <option value="cost-high" className="bg-slate-900 text-slate-200">
              {lang === 'fa' ? 'بیشترین هزینه' : 'Highest Cost'}
            </option>
            <option value="cost-low" className="bg-slate-900 text-slate-200">
              {lang === 'fa' ? 'کمترین هزینه' : 'Lowest Cost'}
            </option>
          </select>
        </div>
      </div>

      {/* Fuel Logs List (Natural Flow - NO INNER SCROLLBAR) */}
      <div className={`space-y-3 ${lang === 'fa' ? 'text-right' : 'text-left'}`}>
        {sortedLogs.map((log) => {
          const stepEff = stepEfficiencies.find(s => s.id === log.id);
          const efficiency = stepEff ? stepEff.efficiency : null;
          const isEstimated = stepEff?.isEstimated || false;
          
          // Odometer Conversion
          const displayOdo = isMetric ? log.odometer : log.odometer * KM_TO_MILES;
          const odoUnit = isMetric ? (lang === 'fa' ? 'کیلومتر' : 'km') : (lang === 'fa' ? 'مایل' : 'mi');

          // Fuel volume conversion
          const displayVolume = isUs ? log.liters * LITERS_TO_GALLONS : log.liters;
          const volumeUnit = isUs ? (lang === 'fa' ? 'گالن' : 'gal') : (lang === 'fa' ? 'لیتر' : 'L');

          // Cost/Currency conversion
          let displayCostStr = '';
          if (isMetric) {
            displayCostStr = `${Math.round(log.cost).toLocaleString()} ${t.currency}`;
          } else if (isUs) {
            if (lang === 'fa') {
              const costUsd = log.cost * TOMAN_TO_USD;
              displayCostStr = `${costUsd.toFixed(1)} دلار`;
            } else {
              displayCostStr = `$${log.cost.toFixed(2)}`;
            }
          } else {
            if (lang === 'fa') {
              const costGbp = log.cost * TOMAN_TO_GBP;
              displayCostStr = `${costGbp.toFixed(1)} پوند`;
            } else {
              displayCostStr = `£${log.cost.toFixed(2)}`;
            }
          }

          return (
            <div
              key={log.id}
              id={`log-entry-${log.id}`}
              className="group bg-slate-800/80 hover:bg-slate-800/95 border border-slate-700 hover:border-slate-700/80 p-3.5 sm:p-4 rounded-xl relative transition-all duration-200 shadow-sm space-y-3"
            >
              {/* Header Row: Date (Left), Station & Fuel Type Tags (Center), Delete Button (Right) */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                {/* Date Tag */}
                <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-md shrink-0">
                  <Calendar size={12} className="text-indigo-400" />
                  <span>{log.date}</span>
                </div>

                {/* Fuel Type & Status Tags (Center) */}
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <span className="text-[11px] font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Fuel size={11} className="text-cyan-400" />
                    <span>{getFuelTypeLabel(log.fuelType)}</span>
                  </span>
                  {log.fullTank === false && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-md">
                      {lang === 'fa' ? 'سوخت‌گیری جزئی' : 'Partial Tank'}
                    </span>
                  )}
                  {log.missedRefuel && (
                    <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-md">
                      {lang === 'fa' ? 'جاماندگی سوخت‌گیری' : 'Missed Refuel'}
                    </span>
                  )}
                </div>

                {/* Delete Button (Right) */}
                <div className="shrink-0 flex items-center">
                  {deletingId === log.id ? (
                    <div className="flex items-center gap-1 animate-fadeIn text-xs">
                      <button
                        onClick={() => {
                          onDeleteEntry(log.id);
                          setDeletingId(null);
                        }}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all active:scale-95"
                        title="Confirm Delete"
                      >
                        <span>{lang === 'fa' ? 'حذف؟' : 'Delete?'}</span>
                        <Check size={12} className="stroke-[3]" />
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      id={`delete-log-${log.id}`}
                      onClick={() => setDeletingId(log.id)}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 hover:text-red-400 hover:border-red-500/30 transition-all cursor-pointer opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
                      title="Delete record"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Data Row Grid: Odometer, Fuel Volume, Total Cost (Green), Efficiency Badge */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-center">
                {/* Odometer */}
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 flex items-center gap-1">
                    <Gauge size={11} className="text-indigo-400" />
                    <span>{t.odoRegistered || 'Odometer'}</span>
                  </span>
                  <span className="text-base sm:text-lg font-mono font-black text-slate-100">
                    {Math.round(displayOdo).toLocaleString()}{' '}
                    <span className="text-[10px] text-slate-400 font-normal font-sans">{odoUnit}</span>
                  </span>
                </div>

                {/* Fuel Volume */}
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 flex items-center gap-1">
                    <Droplets size={11} className="text-cyan-400" />
                    <span>{lang === 'fa' ? 'حجم سوخت' : 'Fuel Vol.'}</span>
                  </span>
                  <span className="text-base sm:text-lg font-mono font-black text-slate-100">
                    {displayVolume.toFixed(1)}{' '}
                    <span className="text-[10px] text-slate-400 font-normal font-sans">{volumeUnit}</span>
                  </span>
                </div>

                {/* Total Cost in Vibrant Emerald Green */}
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-semibold text-slate-500">
                    {t.costPaid || 'Total Cost'}
                  </span>
                  <span className="text-base sm:text-lg font-mono font-black text-emerald-400 tracking-tight">
                    {displayCostStr}
                  </span>
                </div>

                {/* Efficiency Badge */}
                <div className="flex flex-col justify-center items-start sm:items-end">
                  <span className="text-[10px] uppercase font-semibold text-slate-500 mb-0.5">
                    {t.logEffLabel || 'Efficiency'}
                  </span>
                  {efficiency !== null ? (
                    isMetric ? (
                      <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-950 border ${efficiency < 8.5 ? 'text-emerald-400 border-emerald-500/20' : 'text-amber-400 border-amber-500/20'}`}>
                        {efficiency.toFixed(2)} <span className="text-[10px] font-sans font-normal text-slate-400">L/100km {isEstimated && '(Est.)'}</span>
                      </span>
                    ) : isUs ? (
                      <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-950 border ${235.215 / efficiency > 28 ? 'text-emerald-400 border-emerald-500/20' : 'text-amber-400 border-amber-500/20'}`}>
                        {(235.215 / efficiency).toFixed(1)} <span className="text-[10px] font-sans font-normal text-slate-400">US MPG {isEstimated && '(Est.)'}</span>
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-950 border ${282.481 / efficiency > 33.6 ? 'text-emerald-400 border-emerald-500/20' : 'text-amber-400 border-amber-500/20'}`}>
                        {(282.481 / efficiency).toFixed(1)} <span className="text-[10px] font-sans font-normal text-slate-400">UK MPG {isEstimated && '(Est.)'}</span>
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] text-slate-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg">
                      {log.missedRefuel 
                        ? (lang === 'fa' ? 'شروع مجدد' : 'Baseline Reset')
                        : log.fullTank === false
                        ? (lang === 'fa' ? 'سوخت‌گیری جزئی' : 'Partial Fill')
                        : (lang === 'fa' ? 'نقطه شروع' : 'Starting Baseline')
                      }
                    </span>
                  )}
                </div>
              </div>

              {/* Tech Notes & Station Footer */}
              {(log.notes || log.stationName) && (
                <div className="pt-2 border-t border-slate-800/40 space-y-1.5">
                  {log.notes && (
                    <div className="px-3 py-1.5 rounded-lg bg-purple-950/20 border border-purple-500/10 text-xs text-purple-300/80 flex items-center gap-2">
                      <span className="font-bold text-purple-400 shrink-0 uppercase tracking-wider text-[10px]">
                        {lang === 'fa' ? 'یادداشت فنی:' : 'Tech Notes:'}
                      </span>
                      <span className="italic truncate">{log.notes}</span>
                    </div>
                  )}

                  {log.stationName && (
                    <div className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-center gap-2">
                      <MapPin size={12} className="text-amber-400 shrink-0" />
                      <span className="font-bold text-amber-400 shrink-0 uppercase tracking-wider text-[10px]">
                        STATION:
                      </span>
                      <span className="font-medium text-slate-200 truncate">{log.stationName}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

