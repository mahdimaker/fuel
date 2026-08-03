/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FuelEntry } from '../types';
import { TrendingUp, Info, DollarSign, Fuel, CreditCard } from 'lucide-react';
import { calculateLogEfficiencies } from '../utils/calculator';
import { translations, Language } from '../utils/translations';

interface CostAnalysisChartsProps {
  logs: FuelEntry[];
  lang?: Language;
  unitSystem?: 'metric' | 'us' | 'uk';
  hideSummary?: boolean;
  hideEfficiency?: boolean;
  hideCost?: boolean;
}

export default function CostAnalysisCharts({ 
  logs, 
  unitSystem = 'metric',
  hideEfficiency = false,
  hideCost = false
}: CostAnalysisChartsProps) {
  const t = translations['en'];

  if (logs.length < 2) {
    return (
      <div id="charts-empty" className="cyber-card p-6 rounded-2xl border-dashed border-slate-800 text-center flex flex-col items-center justify-center min-h-[260px]">
        <div className="p-4 rounded-full bg-slate-950 border border-slate-900 text-slate-500 mb-3">
          <TrendingUp size={28} />
        </div>
        <h3 className="text-sm font-semibold text-slate-300">Statistical Fuel & Cost Graphs</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-[280px] leading-relaxed">
          To view fuel trends and statistical graphs, you need to log at least 2 refueling events.
        </p>
      </div>
    );
  }

  // Helper to format date strings into "22 Jul" format
  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const clean = dateStr.replace(/\//g, '-');
      const parts = clean.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
          const d = new Date(year, month, day);
          const dayNum = d.getDate();
          const monthShort = d.toLocaleString('en-US', { month: 'short' });
          return `${dayNum} ${monthShort}`;
        }
      }
    } catch (e) {
      // fallback
    }
    return dateStr;
  };

  // Sort logs chronologically
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Create dataset for efficiencies
  const efficiencies = calculateLogEfficiencies(sortedLogs);
  
  const efficiencyData = efficiencies.map((item, index) => {
    const log = sortedLogs.find(l => l.id === item.id);
    const rawDate = log ? log.date : `Set ${index + 1}`;
    return {
      index: index + 1,
      date: rawDate,
      displayDate: formatDateShort(rawDate),
      efficiency: Number(item.efficiency.toFixed(2)),
      distance: item.distance,
      isEstimated: item.isEstimated,
    };
  });

  // Dataset for costs
  const costData = sortedLogs.map((log, index) => {
    return {
      index: index + 1,
      date: log.date,
      displayDate: formatDateShort(log.date),
      cost: log.cost,
      liters: log.liters,
    };
  });

  // Unit conversion helpers
  const isMetric = unitSystem === 'metric';
  const isUs = unitSystem === 'us';

  // Custom tooltips
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const isEst = payload[0].payload.isEstimated;
      return (
        <div className="bg-slate-950/95 border border-purple-500/30 p-3 rounded-xl text-xs font-mono text-slate-200 shadow-xl backdrop-blur-md">
          <p className="text-slate-500 mb-1">Date: {payload[0].payload.date}</p>
          {payload.map((pld: any) => (
            <p key={pld.name} className="font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pld.color }}></span>
              <span>{pld.name}:</span>
              <span className="text-white">{pld.value.toLocaleString()} {pld.unit || ''}</span>
            </p>
          ))}
          {isEst && (
            <p className="text-cyan-400 text-[10px] mt-1.5 border-t border-slate-900 pt-1.5 font-semibold">
              ⚠️ Temporary Estimated Data
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="cost-analysis-charts-view" className="space-y-5">
      {/* Efficiency Chart */}
      {!hideEfficiency && (
        <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">{t.efficiencyChartTitle}</h3>
          </div>
          
          {efficiencyData.length === 0 ? (
            <div className="h-[180px] flex flex-col items-center justify-center text-center text-slate-600 bg-slate-950/20 rounded-xl border border-slate-900 p-4">
              <Info size={18} className="mb-1" />
              <p className="text-xs">Waiting for subsequent fueling calculation...</p>
              <p className="text-[10px] text-slate-700 mt-1">
                Calculations will enable once you enter your next fueling odometer reading.
              </p>
            </div>
          ) : (
            <div className="h-[190px] w-full mt-1 font-mono" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={efficiencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEfficiencyGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="displayDate" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    name="Fuel Consumption" 
                    unit=" L/100km" 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke="#06b6d4" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorEfficiencyGlow)" 
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Refueling Costs Bar Chart */}
      {!hideCost && (
        <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></div>
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">{t.costChartTitle}</h3>
          </div>

          <div className="h-[190px] w-full mt-1 font-mono" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCostBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c084fc" stopOpacity={1} />
                    <stop offset="100%" stopColor="#9333ea" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="displayDate" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  name="Refueling Cost" 
                  unit={` ${isMetric ? '€' : isUs ? '$' : '£'}`} 
                  dataKey="cost" 
                  fill="url(#colorCostBar)" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={36}
                  isAnimationActive={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

