/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Car, DollarSign, Gauge, ShieldCheck, AlertTriangle, 
  PlusCircle, Sparkles, Layers, Fuel, TrendingUp,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { FuelEntry, VehicleInfo, HealthMetrics } from '../types';
import { Language } from '../utils/translations';
import QuickVehicleStatusCard from './QuickVehicleStatusCard';
import EfficiencyHeroCard from './EfficiencyHeroCard';
import FinancialImpactCard from './FinancialImpactCard';
import SpeedSimulatorCard from './SpeedSimulatorCard';
import HealthScoreCard from './HealthScoreCard';
import EfficiencyIssuesCard from './EfficiencyIssuesCard';
import SponsoredAdCard from './SponsoredAdCard';
import FuelForm from './FuelForm';
import SmartAccordionItem from './SmartAccordionItem';

interface DashboardViewProps {
  vehicle: VehicleInfo;
  activeLogs: FuelEntry[];
  logs: FuelEntry[];
  healthMetrics: HealthMetrics;
  averageEfficiency: number;
  lastLogEfficiency: number;
  unitSystem: 'metric' | 'us' | 'uk';
  lang: Language;
  onNavigateToVehicles: () => void;
  onNavigateToRefuel: () => void;
  onAddFuelEntry: (entry: Omit<FuelEntry, 'id'>) => void;
}

export default function DashboardView({
  vehicle,
  activeLogs,
  logs,
  healthMetrics,
  averageEfficiency,
  lastLogEfficiency,
  unitSystem,
  lang,
  onNavigateToVehicles,
  onNavigateToRefuel,
  onAddFuelEntry,
}: DashboardViewProps) {
  const [mobileSubTab, setMobileSubTab] = useState<'fuel' | 'finance' | 'speed' | 'health' | 'checklist'>('fuel');
  const tabsRef = useRef<HTMLDivElement>(null);
  const hasVehicle = Boolean(vehicle && vehicle.brand);
  const totalCost = activeLogs.reduce((acc, l) => acc + l.cost, 0);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = direction === 'left' ? -150 : 150;
      tabsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Financial badge summary
  const getFinancialBadge = () => {
    if (activeLogs.length < 2) {
      return (
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
          Standby
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
        ${totalCost.toLocaleString()} Spent
      </span>
    );
  };

  // Health index badge summary
  const getHealthBadge = () => {
    const isExcellent = healthMetrics.level === 'excellent';
    const isGood = healthMetrics.level === 'good';
    const bgClass = isExcellent 
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
      : isGood 
      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' 
      : 'bg-amber-500/20 text-amber-300 border-amber-500/30';

    return (
      <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${bgClass}`}>
        {healthMetrics.score} / 100 VHI
      </span>
    );
  };

  if (!hasVehicle) {
    return (
      <div id="dashboard-view-empty" className="space-y-6">
        <QuickVehicleStatusCard 
          vehicle={vehicle} 
          healthMetrics={healthMetrics} 
          logs={activeLogs} 
          unitSystem={unitSystem} 
          lang={lang} 
          onNavigateToVehicles={onNavigateToVehicles}
          onNavigateToRefuel={onNavigateToRefuel}
        />
        <div className="text-center py-16 bg-slate-950/40 border border-slate-900 rounded-2xl p-8 flex flex-col items-center justify-center">
          <Car className="mx-auto text-slate-600 mb-3 animate-pulse" size={40} />
          <h3 className="text-sm font-bold text-slate-300">Awaiting Vehicle Information</h3>
          <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
            Please complete and save your car profile in the Vehicles tab first to calibrate diagnostic sensors.
          </p>
          <button
            onClick={onNavigateToVehicles}
            className="mt-4 px-4 py-2 rounded-xl tech-gradient text-white text-xs font-bold cursor-pointer hover:opacity-90"
          >
            Go to Vehicles
          </button>
        </div>
      </div>
    );
  }

  if (activeLogs.length === 0) {
    return (
      <div id="dashboard-view-first-log" className="space-y-6">
        <QuickVehicleStatusCard 
          vehicle={vehicle} 
          healthMetrics={healthMetrics} 
          logs={activeLogs} 
          unitSystem={unitSystem} 
          lang={lang} 
          onNavigateToVehicles={onNavigateToVehicles}
          onNavigateToRefuel={onNavigateToRefuel}
        />
        <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-cyan-500/20 p-5 rounded-2xl">
          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>Log Your First Refuel to Unlock Telemetry</span>
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            To activate consumption trend charts and calibrate your engine health index, please enter your first fuel fill-up below.
          </p>
        </div>
        <FuelForm 
          currentOdometer={vehicle.currentOdometer} 
          onAddEntry={onAddFuelEntry} 
          lang={lang} 
          unitSystem={unitSystem} 
          logs={activeLogs} 
          fuelCapacity={vehicle.fuelCapacity} 
        />
      </div>
    );
  }

  return (
    <div id="dashboard-view-active" className="space-y-6">
      {/* 1. Quick Vehicle Status Summary Header (Full Width for both views) */}
      <QuickVehicleStatusCard 
        vehicle={vehicle} 
        healthMetrics={healthMetrics} 
        logs={activeLogs} 
        unitSystem={unitSystem} 
        lang={lang} 
        onNavigateToVehicles={onNavigateToVehicles}
        onNavigateToRefuel={onNavigateToRefuel}
      />

      {/* ======================================================== */}
      {/* DESKTOP LAYOUT (md:grid) - Fully Expanded Cards Grid     */}
      {/* ======================================================== */}
      <div className="hidden md:grid grid-cols-12 gap-6 items-start">
        {/* Left Column (md:col-span-6) */}
        <div className="md:col-span-6 space-y-6">
          {/* 1. Fuel Consumption Hero */}
          <EfficiencyHeroCard 
            fuelEfficiency={averageEfficiency} 
            lang={lang} 
            unitSystem={unitSystem} 
            logs={activeLogs} 
            isEstimated={healthMetrics.isEstimated} 
            fuelCapacity={vehicle.fuelCapacity} 
          />

          {/* 2. Vehicle Health Score */}
          <HealthScoreCard 
            metrics={healthMetrics} 
            lang={lang} 
            hideAlerts={true} 
          />

          {/* 3. Efficiency Health Checklist */}
          <EfficiencyIssuesCard 
            lastLogEfficiency={lastLogEfficiency} 
            averageEfficiency={averageEfficiency} 
            lang={lang} 
            currentOdometer={vehicle.currentOdometer}
            unitSystem={unitSystem}
          />
        </div>

        {/* Right Column (md:col-span-6) */}
        <div className="md:col-span-6 space-y-6">
          {/* 1. Quick Refuel Entry */}
          <FuelForm 
            currentOdometer={vehicle.currentOdometer} 
            onAddEntry={onAddFuelEntry} 
            lang={lang} 
            unitSystem={unitSystem} 
            logs={activeLogs} 
            fuelCapacity={vehicle.fuelCapacity} 
          />

          {/* 2. Financial Impact */}
          <FinancialImpactCard 
            logs={activeLogs} 
            fuelEfficiency={averageEfficiency} 
            lang={lang} 
            unitSystem={unitSystem} 
            vehicle={vehicle} 
          />

          {/* 3. Speed vs. Efficiency Simulator */}
          <SpeedSimulatorCard 
            logs={activeLogs} 
            fuelEfficiency={averageEfficiency} 
            lang={lang} 
            unitSystem={unitSystem} 
            vehicle={vehicle}
          />

          {/* 4. Sponsored Ad */}
          <SponsoredAdCard lang={lang} />
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE LAYOUT (md:hidden) - Segmented Control / Single Card Views */}
      {/* ======================================================== */}
      <div className="block md:hidden space-y-3">
        {/* Directional Header & Control Bar for Mobile Tabs */}
        <div className="flex items-center justify-between px-0.5 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-300 uppercase tracking-wider">
            <Layers size={14} className="text-cyan-400" />
            <span>Modules</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollTabs('left')}
              className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 active:scale-95 transition-all cursor-pointer"
              aria-label="Scroll tabs left"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => scrollTabs('right')}
              className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 active:scale-95 transition-all cursor-pointer"
              aria-label="Scroll tabs right"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Horizontal Segmented Pills Control with Fade Indicator */}
        <div className="relative">
          <div 
            ref={tabsRef}
            className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent border-b border-slate-800/80 -mx-1 px-1 touch-pan-x scroll-smooth"
          >
            <button
              type="button"
              onClick={() => setMobileSubTab('fuel')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                mobileSubTab === 'fuel'
                  ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Fuel size={13} />
              <span>Fuel & Range</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileSubTab('finance')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                mobileSubTab === 'finance'
                  ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <DollarSign size={13} />
              <span>Financial</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileSubTab('speed')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                mobileSubTab === 'speed'
                  ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Gauge size={13} />
              <span>Speed Sim</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileSubTab('health')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                mobileSubTab === 'health'
                  ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <ShieldCheck size={13} />
              <span>Health Score</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileSubTab('checklist')}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                mobileSubTab === 'checklist'
                  ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <AlertTriangle size={13} />
              <span>Checklist</span>
            </button>
          </div>
        </div>

        {/* Direct Single Card Views */}
        {mobileSubTab === 'fuel' && (
          <div className="animate-fadeIn">
            <EfficiencyHeroCard 
              fuelEfficiency={averageEfficiency} 
              lang={lang} 
              unitSystem={unitSystem} 
              logs={activeLogs} 
              isEstimated={healthMetrics.isEstimated} 
              fuelCapacity={vehicle.fuelCapacity} 
            />
          </div>
        )}

        {mobileSubTab === 'finance' && (
          <div className="animate-fadeIn">
            <FinancialImpactCard 
              logs={activeLogs} 
              fuelEfficiency={averageEfficiency} 
              lang={lang} 
              unitSystem={unitSystem} 
              vehicle={vehicle} 
            />
          </div>
        )}

        {mobileSubTab === 'speed' && (
          <div className="animate-fadeIn">
            <SpeedSimulatorCard 
              logs={activeLogs} 
              fuelEfficiency={averageEfficiency} 
              lang={lang} 
              unitSystem={unitSystem} 
              vehicle={vehicle}
            />
          </div>
        )}

        {mobileSubTab === 'health' && (
          <div className="animate-fadeIn">
            <HealthScoreCard 
              metrics={healthMetrics} 
              lang={lang} 
              hideAlerts={true} 
            />
          </div>
        )}

        {mobileSubTab === 'checklist' && (
          <div className="animate-fadeIn">
            <EfficiencyIssuesCard 
              lastLogEfficiency={lastLogEfficiency} 
              averageEfficiency={averageEfficiency} 
              lang={lang} 
              currentOdometer={vehicle.currentOdometer}
              unitSystem={unitSystem}
            />
          </div>
        )}

        {/* Sponsored Ad on Mobile */}
        <SponsoredAdCard lang={lang} />
      </div>
    </div>
  );
}
