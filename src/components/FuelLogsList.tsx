/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import { 
  Trash2, AlertCircle, Calendar, Fuel, ChevronDown, Check, X, 
  Download, Upload, CheckCircle2, FileSpreadsheet, RotateCcw, 
  Gauge, Droplets, ArrowUpDown, MapPin, Search, Filter, TrendingUp, 
  Coins, Sparkles, SlidersHorizontal, Layers, BarChart3, Tag
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

export type SortOrder = 'newest' | 'oldest' | 'cost-high' | 'cost-low' | 'eff-best' | 'eff-worst';
export type FuelTypeFilter = 'all' | 'regular' | 'super' | 'diesel' | 'hybrid' | 'gas';
export type FillStatusFilter = 'all' | 'full' | 'partial' | 'missed';
export type DateRangeFilter = 'all' | '30days' | '90days' | 'year';

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
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [fuelTypeFilter, setFuelTypeFilter] = useState<FuelTypeFilter>('all');
  const [fillStatusFilter, setFillStatusFilter] = useState<FillStatusFilter>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRangeFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

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
    switch (type) {
      case 'regular': return 'Regular Gas';
      case 'super': return 'Premium Fuel';
      case 'diesel': return 'Diesel';
      case 'hybrid': return 'Hybrid';
      case 'gas': return 'LPG/CNG';
      default: return type;
    }
  };

  // Pre-calculate Efficiencies & Delta Odometer for all logs
  const stepEfficiencies = useMemo(() => calculateLogEfficiencies(logs), [logs]);

  // Compute overall statistical metrics
  const stats = useMemo(() => {
    if (logs.length === 0) {
      return {
        totalLogs: 0,
        totalLiters: 0,
        totalCost: 0,
        avgPricePerUnit: 0,
        totalDistance: 0,
        bestEff: null as number | null,
        worstEff: null as number | null,
        avgEff: null as number | null,
      };
    }

    const totalLiters = logs.reduce((sum, log) => sum + log.liters, 0);
    const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
    const avgPricePerUnit = totalLiters > 0 ? totalCost / totalLiters : 0;

    const odometers = logs.map(l => l.odometer);
    const minOdo = Math.min(...odometers);
    const maxOdo = Math.max(...odometers);
    const totalDistance = logs.length > 1 ? maxOdo - minOdo : 0;

    const validEffs = stepEfficiencies
      .map(s => s.efficiency)
      .filter((eff): eff is number => eff !== null && !isNaN(eff));

    const bestEff = validEffs.length > 0 ? Math.min(...validEffs) : null;
    const worstEff = validEffs.length > 0 ? Math.max(...validEffs) : null;
    const avgEff = validEffs.length > 0 ? validEffs.reduce((a, b) => a + b, 0) / validEffs.length : null;

    return {
      totalLogs: logs.length,
      totalLiters,
      totalCost,
      avgPricePerUnit,
      totalDistance,
      bestEff,
      worstEff,
      avgEff,
    };
  }, [logs, stepEfficiencies]);

  // Filter logs according to user inputs
  const filteredLogs = useMemo(() => {
    const now = new Date();

    return logs.filter(log => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const stationMatch = log.stationName ? log.stationName.toLowerCase().includes(q) : false;
        const notesMatch = log.notes ? log.notes.toLowerCase().includes(q) : false;
        const dateMatch = log.date.includes(q);
        const fuelTypeMatch = getFuelTypeLabel(log.fuelType).toLowerCase().includes(q);
        if (!stationMatch && !notesMatch && !dateMatch && !fuelTypeMatch) return false;
      }

      // 2. Fuel Type Filter
      if (fuelTypeFilter !== 'all' && log.fuelType !== fuelTypeFilter) {
        return false;
      }

      // 3. Fill Status Filter
      if (fillStatusFilter === 'full' && log.fullTank === false) return false;
      if (fillStatusFilter === 'partial' && log.fullTank !== false) return false;
      if (fillStatusFilter === 'missed' && !log.missedRefuel) return false;

      // 4. Date Range Filter
      if (dateRangeFilter !== 'all') {
        const logDate = new Date(log.date);
        const diffTime = Math.abs(now.getTime() - logDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dateRangeFilter === '30days' && diffDays > 30) return false;
        if (dateRangeFilter === '90days' && diffDays > 90) return false;
        if (dateRangeFilter === 'year' && diffDays > 365) return false;
      }

      return true;
    });
  }, [logs, searchQuery, fuelTypeFilter, fillStatusFilter, dateRangeFilter, lang]);

  // Functional Sorting based on sortOrder
  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => {
      if (sortOrder === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortOrder === 'cost-high') {
        return b.cost - a.cost;
      }
      if (sortOrder === 'cost-low') {
        return a.cost - b.cost;
      }
      if (sortOrder === 'eff-best') {
        const effA = stepEfficiencies.find(s => s.id === a.id)?.efficiency ?? 999;
        const effB = stepEfficiencies.find(s => s.id === b.id)?.efficiency ?? 999;
        return effA - effB;
      }
      if (sortOrder === 'eff-worst') {
        const effA = stepEfficiencies.find(s => s.id === a.id)?.efficiency ?? -1;
        const effB = stepEfficiencies.find(s => s.id === b.id)?.efficiency ?? -1;
        return effB - effA;
      }
      // Default: 'newest'
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [filteredLogs, sortOrder, stepEfficiencies]);

  const hasActiveFilters = searchQuery !== '' || fuelTypeFilter !== 'all' || fillStatusFilter !== 'all' || dateRangeFilter !== 'all';

  const resetAllFilters = () => {
    setSearchQuery('');
    setFuelTypeFilter('all');
    setFillStatusFilter('all');
    setDateRangeFilter('all');
  };

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

  // Unit Strings
  const displayTotalVolume = isUs ? stats.totalLiters * LITERS_TO_GALLONS : stats.totalLiters;
  const volumeUnit = isUs ? 'gal' : 'L';
  
  const displayTotalDistance = isMetric ? stats.totalDistance : stats.totalDistance * KM_TO_MILES;
  const distUnit = isMetric ? 'km' : 'mi';

  let totalCostFormatted = '';
  let unitPriceFormatted = '';
  if (isMetric) {
    totalCostFormatted = `€${Math.round(stats.totalCost).toLocaleString()}`;
    unitPriceFormatted = `€${stats.avgPricePerUnit < 10 ? stats.avgPricePerUnit.toFixed(2) : Math.round(stats.avgPricePerUnit).toLocaleString()}/${volumeUnit}`;
  } else if (isUs) {
    totalCostFormatted = `$${stats.totalCost.toFixed(2)}`;
    unitPriceFormatted = `$${(stats.avgPricePerUnit / LITERS_TO_GALLONS).toFixed(2)}/gal`;
  } else {
    totalCostFormatted = `£${stats.totalCost.toFixed(2)}`;
    unitPriceFormatted = `£${stats.avgPricePerUnit.toFixed(2)}/L`;
  }

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

      {/* 📊 HISTORY STATISTICAL SUMMARY HEADER GRID */}
      <div className="cyber-card p-4 sm:p-5 rounded-2xl border border-indigo-500/20 bg-slate-900/60 backdrop-blur-md relative overflow-hidden space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <BarChart3 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Historical Fuel Analytics</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800/80 text-indigo-300 font-mono font-bold">
                  {stats.totalLogs} entries
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Overview of expenditure, fuel consumed, and overall tracked mileage
              </p>
            </div>
          </div>
        </div>

        {/* 4-Card Statistical Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Total Expenditure */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center justify-between">
              <span>Total Spend</span>
              <Coins size={13} className="text-emerald-400" />
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-emerald-400 tracking-tight">
              {totalCostFormatted}
            </span>
            <span className="text-[10px] text-slate-500">
              Avg price: {unitPriceFormatted}
            </span>
          </div>

          {/* Card 2: Total Volume Filled */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center justify-between">
              <span>Total Fuel Volume</span>
              <Droplets size={13} className="text-cyan-400" />
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-slate-100">
              {displayTotalVolume.toFixed(1)} <span className="text-xs font-sans text-slate-400 font-normal">{volumeUnit}</span>
            </span>
            <span className="text-[10px] text-slate-500">
              Across {stats.totalLogs} fill-ups
            </span>
          </div>

          {/* Card 3: Total Tracked Distance */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center justify-between">
              <span>Tracked Distance</span>
              <Gauge size={13} className="text-indigo-400" />
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-indigo-300">
              {Math.round(displayTotalDistance).toLocaleString()} <span className="text-xs font-sans text-slate-400 font-normal">{distUnit}</span>
            </span>
            <span className="text-[10px] text-slate-500">
              Span between first & last log
            </span>
          </div>

          {/* Card 4: Best Efficiency */}
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 flex items-center justify-between">
              <span>Best Efficiency</span>
              <Sparkles size={13} className="text-amber-400" />
            </span>
            <span className="text-base sm:text-lg font-mono font-black text-amber-300">
              {stats.bestEff !== null ? (
                isMetric ? `${stats.bestEff.toFixed(2)} L/100km` : isUs ? `${(235.215 / stats.bestEff).toFixed(1)} MPG` : `${(282.481 / stats.bestEff).toFixed(1)} MPG`
              ) : (
                <span className="text-xs text-slate-500 font-normal">Need 2 logs</span>
              )}
            </span>
            <span className="text-[10px] text-slate-500">
              {stats.avgEff !== null ? (
                `Overall avg: ${isMetric ? stats.avgEff.toFixed(1) : (235.215 / stats.avgEff).toFixed(1)}`
              ) : (
                'Add more records'
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 🔍 SEARCH AND FILTERS BAR */}
      <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Search Box Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search station, date, or notes..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pr-9 pl-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              hasActiveFilters 
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' 
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <SlidersHorizontal size={13} className="text-purple-400" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
            )}
          </button>

          {/* Functional Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 shrink-0">
            <ArrowUpDown size={12} className="text-indigo-400 shrink-0" />
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              Order:
            </span>
            <select
              id="logs-sort-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-slate-900 text-slate-200">
                Newest First
              </option>
              <option value="oldest" className="bg-slate-900 text-slate-200">
                Oldest First
              </option>
              <option value="cost-high" className="bg-slate-900 text-slate-200">
                Highest Cost
              </option>
              <option value="cost-low" className="bg-slate-900 text-slate-200">
                Lowest Cost
              </option>
              <option value="eff-best" className="bg-slate-900 text-slate-200">
                Best Fuel Efficiency
              </option>
              <option value="eff-worst" className="bg-slate-900 text-slate-200">
                Worst Fuel Efficiency
              </option>
            </select>
          </div>
        </div>

        {/* Collapsible Filter Controls */}
        {showFilters && (
          <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn">
            {/* Filter 1: Fuel Type */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                <Fuel size={11} className="text-cyan-400" />
                <span>Fuel Type</span>
              </label>
              <select
                value={fuelTypeFilter}
                onChange={(e) => setFuelTypeFilter(e.target.value as FuelTypeFilter)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Fuel Types</option>
                <option value="regular" className="bg-slate-900">{getFuelTypeLabel('regular')}</option>
                <option value="super" className="bg-slate-900">{getFuelTypeLabel('super')}</option>
                <option value="diesel" className="bg-slate-900">{getFuelTypeLabel('diesel')}</option>
                <option value="hybrid" className="bg-slate-900">{getFuelTypeLabel('hybrid')}</option>
                <option value="gas" className="bg-slate-900">{getFuelTypeLabel('gas')}</option>
              </select>
            </div>

            {/* Filter 2: Fill Status */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                <Layers size={11} className="text-amber-400" />
                <span>Tank Fill Status</span>
              </label>
              <select
                value={fillStatusFilter}
                onChange={(e) => setFillStatusFilter(e.target.value as FillStatusFilter)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Statuses</option>
                <option value="full" className="bg-slate-900">Full Tank Only</option>
                <option value="partial" className="bg-slate-900">Partial Tank Only</option>
                <option value="missed" className="bg-slate-900">Missed Refuels</option>
              </select>
            </div>

            {/* Filter 3: Date Range */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                <Calendar size={11} className="text-indigo-400" />
                <span>Time Range</span>
              </label>
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value as DateRangeFilter)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Time</option>
                <option value="30days" className="bg-slate-900">Last 30 Days</option>
                <option value="90days" className="bg-slate-900">Last 90 Days</option>
                <option value="year" className="bg-slate-900">Past Year</option>
              </select>
            </div>
          </div>
        )}

        {/* Filter Summary & Active Filter Clear Button */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/40">
          <div className="flex items-center gap-2">
            <span>
              Showing {sortedLogs.length} of {logs.length} entries
            </span>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
            >
              <X size={12} />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Fuel Logs List (Natural Flow - NO INNER SCROLLBAR) */}
      <div className="space-y-3 text-left">
        {sortedLogs.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
            <Filter size={24} className="mx-auto text-slate-500" />
            <p className="text-xs font-semibold text-slate-300">
              No entries found matching current filters.
            </p>
            <button
              onClick={resetAllFilters}
              className="px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold cursor-pointer hover:bg-indigo-500/20"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          sortedLogs.map((log) => {
            const stepEff = stepEfficiencies.find(s => s.id === log.id);
            const efficiency = stepEff ? stepEff.efficiency : null;
            const isEstimated = stepEff?.isEstimated || false;
            
            // Odometer Conversion
            const displayOdo = isMetric ? log.odometer : log.odometer * KM_TO_MILES;
            const odoUnit = isMetric ? 'km' : 'mi';

            // Fuel volume conversion
            const displayVolume = isUs ? log.liters * LITERS_TO_GALLONS : log.liters;
            const volumeUnitStr = isUs ? 'gal' : 'L';

            // Unit Price Calculation (cost / volume)
            const unitPrice = log.liters > 0 ? log.cost / log.liters : 0;
            let displayUnitPriceStr = '';
            if (isMetric) {
              displayUnitPriceStr = `€${unitPrice < 10 ? unitPrice.toFixed(2) : Math.round(unitPrice).toLocaleString()}/L`;
            } else if (isUs) {
              displayUnitPriceStr = `$${(unitPrice / LITERS_TO_GALLONS).toFixed(2)}/gal`;
            } else {
              displayUnitPriceStr = `£${unitPrice.toFixed(2)}/L`;
            }

            // Cost/Currency conversion
            let displayCostStr = '';
            if (isMetric) {
              displayCostStr = `€${log.cost < 1000 ? log.cost.toFixed(2) : Math.round(log.cost).toLocaleString()}`;
            } else if (isUs) {
              displayCostStr = `$${log.cost.toFixed(2)}`;
            } else {
              displayCostStr = `£${log.cost.toFixed(2)}`;
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
                        Partial Tank
                      </span>
                    )}
                    {log.missedRefuel && (
                      <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded-md">
                        Missed Refuel
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
                          <span>Delete?</span>
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

                {/* Data Row Grid: Odometer, Fuel Volume, Total Cost, Efficiency Badge */}
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

                  {/* Fuel Volume & Unit Price */}
                  <div className="flex flex-col justify-center">
                    <span className="text-[10px] uppercase font-semibold text-slate-500 flex items-center gap-1">
                      <Droplets size={11} className="text-cyan-400" />
                      <span>Volume & Unit Price</span>
                    </span>
                    <span className="text-base sm:text-lg font-mono font-black text-slate-100">
                      {displayVolume.toFixed(1)}{' '}
                      <span className="text-[10px] text-slate-400 font-normal font-sans">{volumeUnitStr}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {displayUnitPriceStr}
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
                          ? 'Baseline Reset'
                          : log.fullTank === false
                          ? 'Partial Fill'
                          : 'Starting Baseline'
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
                          Tech Notes:
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
          })
        )}
      </div>
    </div>
  );
}


