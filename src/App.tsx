/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Car, 
  Flame, 
  Gauge, 
  Cpu, 
  TrendingUp, 
  Share2, 
  RotateCcw, 
  Heart, 
  Award,
  Sun,
  Moon,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { FuelEntry, VehicleInfo } from './types';
import { analyzeVehicleHealth } from './utils/calculator';
import QuickVehicleStatusCard from './components/QuickVehicleStatusCard';
import Vehicles from './components/Vehicles';
import FuelForm from './components/FuelForm';
import HealthScoreCard from './components/HealthScoreCard';
import CostAnalysisCharts from './components/CostAnalysisCharts';
import FuelLogsList from './components/FuelLogsList';
import AITechnicianReport from './components/AITechnicianReport';
import EfficiencyHeroCard from './components/EfficiencyHeroCard';
import FinancialImpactCard from './components/FinancialImpactCard';
import SpeedSimulatorCard from './components/SpeedSimulatorCard';
import EfficiencyIssuesCard from './components/EfficiencyIssuesCard';
import SponsoredAdCard from './components/SponsoredAdCard';
import FirstRefuelBaselineCard from './components/FirstRefuelBaselineCard';
import CSVDataManagementCard from './components/CSVDataManagementCard';
import AppIcon from './components/AppIcon';
import BrandLogo from './components/BrandLogo';
import { calculateLogEfficiencies } from './utils/calculator';
import { translations, Language } from './utils/translations';

// Pre-populate with high-quality sample logs for demonstration
const defaultVehicleEn: VehicleInfo = {
  brand: 'Toyota',
  model: 'Camry',
  year: '',
  fuelCapacity: 60,
  currentOdometer: 45200,
};

const defaultLogsEn: FuelEntry[] = [
  {
    id: 'sample-e1',
    date: '2026-06-10',
    odometer: 43800,
    liters: 48.2,
    cost: 54,
    fuelType: 'regular',
    stationName: 'Shell Station #4',
    notes: 'First log, basic highway commute',
  },
  {
    id: 'sample-e2',
    date: '2026-06-22',
    odometer: 44320,
    liters: 46.5,
    cost: 52,
    fuelType: 'regular',
    stationName: 'Chevron Downtown',
  },
  {
    id: 'sample-e3',
    date: '2026-07-05',
    odometer: 44790,
    liters: 49.0,
    cost: 65,
    fuelType: 'super',
    stationName: 'Exxon Fuel Stop',
    notes: 'Premium fuel to test engine response',
  },
  {
    id: 'sample-e4',
    date: '2026-07-14',
    odometer: 45200,
    liters: 44.8,
    cost: 50,
    fuelType: 'regular',
    stationName: 'Shell Station #4',
  }
];

// Detect default unit system on mount if not already saved in localStorage
const detectDefaultUnitSystem = (): 'metric' | 'us' | 'uk' => {
  try {
    // 1. Check navigator locales
    if (typeof navigator !== 'undefined') {
      const locales = navigator.languages || [navigator.language];
      for (const locale of locales) {
        if (locale && locale.includes('-')) {
          const country = locale.split('-')[1].toUpperCase();
          if (country === 'US') return 'us';
          if (country === 'GB' || country === 'UK') return 'uk';
        }
      }
    }

    // 2. Check timezone as a secondary source of country/region hints
    if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        const tzLower = tz.toLowerCase();
        if (tzLower.includes('america/')) {
          // Check common US cities in timezone
          if (
            tzLower.includes('new_york') || 
            tzLower.includes('chicago') || 
            tzLower.includes('los_angeles') || 
            tzLower.includes('denver') || 
            tzLower.includes('phoenix') ||
            tzLower.includes('anchorage') ||
            tzLower.includes('honolulu') ||
            tzLower.includes('detroit') ||
            tzLower.includes('indianapolis')
          ) {
            return 'us';
          }
        }
        if (tzLower.includes('london') || tzLower.includes('belfast')) {
          return 'uk';
        }
      }
    }
  } catch (err) {
    // Safe fallback to global metric
  }
  return 'metric';
};

export default function App() {
  // State 1: Language (Hardcoded English only)
  const [lang, setLang] = useState<Language>('en');

  const t = translations[lang];

  // State 2: Unit System (Default detected dynamically on first load, or retrieved from localStorage)
  const [unitSystem, setUnitSystem] = useState<'metric' | 'us' | 'uk'>(() => {
    const saved = localStorage.getItem('en_unit_system');
    if (saved === 'metric' || saved === 'us' || saved === 'uk') {
      return saved;
    }
    return detectDefaultUnitSystem();
  });

  // State 3: Dark/Light Theme
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('en_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  // State 4: Multi-Vehicle Garage List
  const [vehicles, setVehicles] = useState<VehicleInfo[]>(() => {
    const saved = localStorage.getItem('en_vehicles');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    const legacySaved = localStorage.getItem('en_vehicle');
    if (legacySaved) {
      try {
        const parsed = JSON.parse(legacySaved);
        if (parsed && typeof parsed === 'object' && parsed.brand && parsed.brand.trim() !== '') {
          return [{ id: 'veh-1', ...parsed }];
        }
      } catch (e) {}
    }
    return [];
  });

  // Active Vehicle ID
  const [activeVehicleId, setActiveVehicleId] = useState<string>(() => {
    const savedId = localStorage.getItem('en_active_vehicle_id');
    if (savedId) return savedId;
    return vehicles[0]?.id || 'veh-1';
  });

  // Active Vehicle Object derived from state
  const vehicle = vehicles.find(v => v.id === activeVehicleId) || vehicles[0] || {
    id: 'veh-1',
    brand: '',
    model: '',
    year: '2026',
    fuelCapacity: 50,
    currentOdometer: 0
  };

  // State 5: Fuel Entry Logs (Global logs array across all vehicles)
  const [logs, setLogs] = useState<FuelEntry[]>(() => {
    const saved = localStorage.getItem('en_logs');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Derived Active Logs (Filter logs belonging to the active vehicle; legacy untagged logs assigned to default vehicle)
  const activeLogs = useMemo(() => {
    const defaultId = vehicles[0]?.id || 'veh-1';
    return logs.filter(log => {
      if (log.vehicleId) {
        return log.vehicleId === vehicle.id;
      }
      return vehicle.id === defaultId;
    });
  }, [logs, vehicle.id, vehicles]);

  // State 6: Selected Navigation Tab (Defaults to 'vehicles' on first open without data, 'dashboard' if logs exist, or 'refuel' if vehicles exist but no logs)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'vehicles' | 'refuel' | 'history' | 'ai'>(() => {
    const savedVehicles = localStorage.getItem('en_vehicles') || localStorage.getItem('en_vehicle');
    const savedLogs = localStorage.getItem('en_logs');

    if (savedLogs) {
      try {
        const parsed = JSON.parse(savedLogs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return 'dashboard';
        }
      } catch (e) {
        // ignore
      }
    }

    if (savedVehicles) {
      try {
        const parsed = JSON.parse(savedVehicles);
        if (Array.isArray(parsed) ? parsed.length > 0 : Boolean(parsed)) {
          return 'refuel';
        }
      } catch (e) {
        // ignore
      }
    }

    // First time opening app without data -> directly to vehicle definition
    return 'vehicles';
  });

  const [showShareNotification, setShowShareNotification] = useState<boolean>(false);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);

  // Automatically switch tab when no vehicles exist or when adding logs
  useEffect(() => {
    if (vehicles.length === 0) {
      setActiveTab('vehicles');
    } else if (activeLogs.length > 0 && activeTab === 'refuel') {
      setActiveTab('dashboard');
    }
  }, [vehicles.length, activeLogs.length]);

  // Scroll to top on tab changes to fix mobile scroll persistence bug
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [activeTab]);

  // Sync theme to localStorage
  useEffect(() => {
    localStorage.setItem('en_theme', theme);
  }, [theme]);

  // Sync lang to localStorage & update HTML root attributes
  useEffect(() => {
    localStorage.setItem('en_lang', 'en');
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  }, []);

  // Sync unitSystem to localStorage
  useEffect(() => {
    localStorage.setItem('en_unit_system', unitSystem);
  }, [unitSystem]);

  // Sync vehicles & activeVehicleId to localStorage
  useEffect(() => {
    localStorage.setItem('en_vehicles', JSON.stringify(vehicles));
    localStorage.setItem('en_active_vehicle_id', activeVehicleId);
    if (vehicle) {
      localStorage.setItem('en_vehicle', JSON.stringify(vehicle));
    }
  }, [vehicles, activeVehicleId, vehicle]);

  // Sync logs to localStorage & automatically calibrate odometer for active vehicle
  useEffect(() => {
    localStorage.setItem('en_logs', JSON.stringify(logs));
    if (activeLogs.length > 0) {
      const sorted = [...activeLogs].sort((a, b) => b.odometer - a.odometer);
      const maxOdo = sorted[0].odometer;
      if (maxOdo > vehicle.currentOdometer) {
        setVehicles(prev => prev.map(v => v.id === vehicle.id ? { ...v, currentOdometer: maxOdo } : v));
      }
    }
  }, [logs, activeLogs, vehicle.id, vehicle.currentOdometer]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleSelectVehicle = (id: string) => {
    setActiveVehicleId(id);
  };

  const handleAddVehicle = (info: Omit<VehicleInfo, 'id'>) => {
    const newVeh: VehicleInfo = {
      ...info,
      id: `veh-${Date.now()}`
    };
    const wasEmpty = vehicles.length === 0;
    setVehicles(prev => {
      if (prev.length === 1) {
        const first = prev[0];
        if (!first.brand || first.brand.trim() === '' || (logs.length === 0 && first.id === 'veh-1')) {
          return [newVeh];
        }
      }
      return [...prev, newVeh];
    });
    setActiveVehicleId(newVeh.id!);
    if (wasEmpty) {
      setActiveTab('refuel');
    }
  };

  const handleUpdateVehicle = (info: VehicleInfo) => {
    setVehicles(prev => prev.map(v => (v.id === vehicle.id || (v.brand === vehicle.brand && v.model === vehicle.model)) ? { ...v, ...info, id: v.id || vehicle.id } : v));
  };

  const handleDeleteVehicle = (id: string) => {
    if (vehicles.length <= 1) return;
    setVehicles(prev => {
      const filtered = prev.filter(v => v.id !== id);
      if (activeVehicleId === id) {
        setActiveVehicleId(filtered[0]?.id || '');
      }
      return filtered;
    });
  };

  const handleAddFuelEntry = (newEntry: Omit<FuelEntry, 'id'>) => {
    const entry: FuelEntry = {
      ...newEntry,
      id: `fuel-${Date.now()}`,
      vehicleId: vehicle.id || vehicles[0]?.id || 'veh-1'
    };
    setLogs(prev => [entry, ...prev]);
    setActiveTab('history'); // Redirect to history tab after addition
  };

  const handleDeleteLog = (id: string) => {
    setLogs(prev => prev.filter(log => log.id !== id));
  };

  const handleResetData = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    setVehicles([]);
    setActiveVehicleId('');
    setLogs([]);
    localStorage.removeItem('en_vehicles');
    localStorage.removeItem('en_vehicle');
    localStorage.removeItem('en_logs');
    localStorage.removeItem('en_active_vehicle_id');
    localStorage.removeItem('en_saved_ai_report');
    localStorage.removeItem('en_last_analyzed_log_count');
    localStorage.removeItem('en_ai_report_fallback');
    setActiveTab('vehicles');
    setShowResetConfirm(false);
  };

  const handleShareReport = async () => {
    const metrics = analyzeVehicleHealth(vehicle, activeLogs);
    const vhsLevel = metrics.level === 'excellent' ? t.levelExcellent : metrics.level === 'good' ? t.levelGood : metrics.level === 'fair' ? t.levelFair : t.levelPoor;
    
    // Convert shared output based on selected units
    const isMetric = unitSystem === 'metric';
    const isUs = unitSystem === 'us';
    const displayOdo = isMetric ? vehicle.currentOdometer : vehicle.currentOdometer * 0.621371;
    const odoUnit = isMetric ? 'km' : 'mi';
    
    let displayEff = 'N/A';
    if (metrics.fuelEfficiency > 0) {
      displayEff = isMetric 
        ? `${metrics.fuelEfficiency.toFixed(2)} L/100km`
        : isUs 
          ? `${(235.215 / metrics.fuelEfficiency).toFixed(1)} US MPG`
          : `${(282.481 / metrics.fuelEfficiency).toFixed(1)} UK MPG`;
    }

    const vehicleTitle = `${vehicle.brand || ''} ${vehicle.model || ''}`.trim() || 'Vehicle';

    const summaryText = `🚗 Vehicle Fuel & Health Report for ${vehicleTitle}
📊 Vehicle Health Score (VHS): ${metrics.score}/100 (${vhsLevel})
📈 Average Fuel Efficiency: ${displayEff}
⛽️ Fuel Logs count: ${activeLogs.length} logs
⚙️ Current Mileage: ${Math.round(displayOdo).toLocaleString()} ${odoUnit}
📱 Generated dynamically via Fuel Analyzer Intelligent Telemetry`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Vehicle Fuel Report - ${vehicleTitle}`,
          text: summaryText,
        });
        return;
      } catch (err) {
        // User canceled or share failed, fallback to clipboard
      }
    }

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(summaryText);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = summaryText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }

    setShowShareNotification(true);
    setTimeout(() => {
      setShowShareNotification(false);
    }, 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Pre-calculate vehicle metrics
  const healthMetrics = analyzeVehicleHealth(vehicle, activeLogs);

  // Calculate average and last log efficiency
  const averageEfficiency = healthMetrics.fuelEfficiency; // L/100km
  
  const stepEfficiencies = calculateLogEfficiencies(activeLogs);
  const lastLogEfficiency = stepEfficiencies.length > 0 ? stepEfficiencies[stepEfficiencies.length - 1].efficiency : 0;

  return (
    <div 
      className={`min-h-screen flex flex-col relative pb-24 font-sans select-none transition-colors duration-300 ${
        theme === 'dark' 
          ? 'dark bg-gradient-to-b from-[#0b0f19] to-[#05070c] text-slate-100' 
          : 'light bg-slate-50 text-slate-800'
      }`} 
      dir="ltr"
    >
      {/* Header */}
      <header className="border-b border-slate-900/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AppIcon size={38} />
            <div>
              <h1 className="text-sm font-extrabold text-white tracking-wider">
                Fuel Analyzer
              </h1>
              {vehicle.brand && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-cyan-400 font-bold tracking-tight">
                    {vehicle.brand} {vehicle.model}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme Toggler */}
            <button
              id="theme-toggler-btn"
              onClick={handleToggleTheme}
              className="px-2 sm:px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-900 text-slate-300 hover:text-white hover:border-purple-500/30 text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Toggle theme (Light / Dark)"
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={12} className="text-yellow-400 shrink-0" />
                  <span className="hidden xs:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon size={12} className="text-purple-400 shrink-0" />
                  <span className="hidden xs:inline">Dark</span>
                </>
              )}
            </button>

            <button
              id="share-btn"
              onClick={handleShareReport}
              className="p-1.5 rounded-xl bg-slate-950 border border-slate-900 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/20 transition-all cursor-pointer"
              title="Share Report"
              aria-label="Share Report"
            >
              <Share2 size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Print View Only Area */}
      <div className="hidden print:block p-8 space-y-6 text-black" dir="ltr">
        <div className="border-b pb-4 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t.printableTitle}</h1>
            <p className="text-sm text-gray-500 mt-1">{t.printableSub}</p>
          </div>
          <div className="text-left">
            <span className="text-xs text-gray-500 block">{t.printableDate}: {new Date().toLocaleDateString()}</span>
            <span className="text-xs text-gray-500 block">
              {t.currentOdo}: {Math.round(unitSystem === 'metric' ? vehicle.currentOdometer : vehicle.currentOdometer * 0.621371).toLocaleString()}{' '}
              {unitSystem === 'metric' ? 'km' : 'mi'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border p-4 rounded-xl">
            <h3 className="font-bold text-gray-800 mb-2">🚗 {t.profileTitle}</h3>
            <p className="text-sm">{t.brand} & {t.model}: {vehicle.brand} {vehicle.model}</p>
            <p className="text-sm">{t.year}: {vehicle.year || '2026'}</p>
            <p className="text-sm">
              {t.capacity}: {unitSystem === 'metric' ? vehicle.fuelCapacity : (vehicle.fuelCapacity * 0.264172).toFixed(1)}{' '}
              {unitSystem === 'metric' ? 'Liters' : 'Gallons'}
            </p>
          </div>
          <div className="border p-4 rounded-xl text-center flex flex-col justify-center">
            <span className="text-xs text-gray-500 block">{t.vhsTitle}</span>
            <span className="text-4xl font-extrabold text-cyan-600 my-1">{healthMetrics.score} / 100</span>
            <span className="text-xs font-bold uppercase">
              {t.vhsSub}: {healthMetrics.level === 'excellent' ? t.levelExcellent : healthMetrics.level === 'good' ? t.levelGood : healthMetrics.level === 'fair' ? t.levelFair : t.levelPoor}
            </span>
          </div>
        </div>

        <div className="border p-4 rounded-xl">
          <h3 className="font-bold text-gray-800 mb-2">📊 {t.factorAnalysis}</h3>
          <p className="text-sm">
            {t.avgEff}:{' '}
            {healthMetrics.fuelEfficiency > 0 
              ? (unitSystem === 'metric' 
                  ? `${healthMetrics.fuelEfficiency.toFixed(2)} L/100km` 
                  : unitSystem === 'us'
                    ? `${(235.215 / healthMetrics.fuelEfficiency).toFixed(1)} US MPG`
                    : `${(282.481 / healthMetrics.fuelEfficiency).toFixed(1)} UK MPG`)
              : '---'}
          </p>
          <p className="text-sm">{t.fluctuation}: {healthMetrics.fuelEfficiencyChange.toFixed(1)}%</p>
          <p className="text-sm">Total Fueling Events: {logs.length}</p>
        </div>

        <div className="border p-4 rounded-xl">
          <h3 className="font-bold text-gray-800 mb-2">📋 {t.warningsTitle}</h3>
          <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
            {healthMetrics.messages.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      </div>

      {/* Desktop Navigation Tabs Bar (Visible on md+) */}
      <div className="hidden md:block max-w-7xl w-full mx-auto px-4 pt-4 no-print">
        <div className="flex items-center justify-between bg-slate-950/95 border border-slate-900 rounded-2xl p-2">
          <div className="flex items-center gap-1.5">
            {/* Dashboard Tab */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-base font-bold flex items-center gap-2 transition-colors duration-150 cursor-pointer outline-none focus:outline-none focus:ring-0 select-none border ${
                activeTab === 'dashboard'
                  ? 'nav-tab-active bg-slate-900 border-cyan-500/40 text-white shadow-md'
                  : 'nav-tab-inactive border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Gauge size={16} />
              <span className="text-base font-bold">{t.tabDashboard}</span>
            </button>

            {/* Vehicles Tab */}
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`px-4 py-2 rounded-xl text-base font-bold flex items-center gap-2 transition-colors duration-150 cursor-pointer outline-none focus:outline-none focus:ring-0 select-none border ${
                activeTab === 'vehicles'
                  ? 'nav-tab-active bg-slate-900 border-purple-500/40 text-white shadow-md'
                  : 'nav-tab-inactive border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Car size={16} />
              <span className="text-base font-bold">{t.tabVehicles}</span>
            </button>

            {/* History Tab */}
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-base font-bold flex items-center gap-2 transition-colors duration-150 cursor-pointer outline-none focus:outline-none focus:ring-0 select-none border ${
                activeTab === 'history'
                  ? 'nav-tab-active bg-slate-900 border-indigo-500/40 text-white shadow-md'
                  : 'nav-tab-inactive border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <TrendingUp size={16} />
              <span className="text-base font-bold">{t.tabHistory}</span>
            </button>

            {/* AI Technician Tab */}
            <button
              onClick={() => setActiveTab('ai')}
              className={`px-4 py-2 rounded-xl text-base font-bold flex items-center gap-2 transition-colors duration-150 cursor-pointer outline-none focus:outline-none focus:ring-0 select-none border ${
                activeTab === 'ai'
                  ? 'nav-tab-active bg-slate-900 border-pink-500/40 text-white shadow-md'
                  : 'nav-tab-inactive border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Cpu size={16} />
              <span className="text-base font-bold">{t.tabAi}</span>
            </button>
          </div>

          {/* Refuel Primary Hero FAB / CTA Button on Desktop */}
          <button
            onClick={() => setActiveTab('refuel')}
            className={`btn-refuel-cta px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-sm font-extrabold flex items-center gap-1.5 transition-colors duration-150 cursor-pointer shadow-md active:scale-95 outline-none focus:outline-none focus:ring-0 select-none border ${
              activeTab === 'refuel'
                ? 'tech-gradient text-white shadow-cyan-500/30 border-cyan-400/80'
                : 'bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 text-cyan-300 border-cyan-500/30'
            }`}
          >
            <Flame size={15} className="animate-pulse" />
            <span>{t.tabRefuel}</span>
          </button>
        </div>
      </div>

      {/* Main Responsive Layout Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6 no-print">
        
        {/* DESKTOP CONTENT VIEW */}
        <div className="hidden md:block">
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-12 gap-6 items-start">
              {/* Left Column (md:col-span-6) */}
              <div className="md:col-span-6 space-y-6">
                {/* 1. Quick Vehicle Status Summary Card / Profile */}
                <QuickVehicleStatusCard 
                  vehicle={vehicle} 
                  healthMetrics={healthMetrics} 
                  logs={logs} 
                  unitSystem={unitSystem} 
                  lang={lang} 
                  onNavigateToVehicles={() => setActiveTab('vehicles')}
                  onNavigateToRefuel={() => setActiveTab('refuel')}
                />

                {vehicle.brand && (
                  <>
                    {/* 2. Fuel Consumption */}
                    <div>
                      <EfficiencyHeroCard fuelEfficiency={averageEfficiency} lang={lang} unitSystem={unitSystem} logs={activeLogs} isEstimated={healthMetrics.isEstimated} fuelCapacity={vehicle.fuelCapacity} />
                    </div>

                    {/* 3. Vehicle Health Score (VHS) */}
                    <div>
                      <HealthScoreCard metrics={healthMetrics} lang={lang} hideAlerts={true} />
                    </div>

                    {/* 4. Efficiency Health Checklist */}
                    <div>
                      <EfficiencyIssuesCard 
                        lastLogEfficiency={lastLogEfficiency} 
                        averageEfficiency={averageEfficiency} 
                        lang={lang} 
                        currentOdometer={vehicle.currentOdometer}
                        unitSystem={unitSystem}
                      />
                    </div>
                  </>
                )}

              </div>

              {/* Right Column (md:col-span-6) */}
              <div className="md:col-span-6 space-y-6">
                {/* 1. Log New Refueling Quick Access */}
                {vehicle.brand ? (
                  <FuelForm currentOdometer={vehicle.currentOdometer} onAddEntry={handleAddFuelEntry} lang={lang} unitSystem={unitSystem} logs={logs} fuelCapacity={vehicle.fuelCapacity} />
                ) : (
                  <div className="text-center py-10 bg-slate-950/40 border border-slate-900 rounded-2xl p-6">
                    <Car className="mx-auto text-slate-600 mb-2" size={32} />
                    <p className="text-xs text-slate-400">Save vehicle profile first in Vehicles tab to unlock refuel logging.</p>
                  </div>
                )}

                {vehicle.brand ? (
                  <>
                    {/* 2. Financial Impact */}
                    <div>
                      <FinancialImpactCard logs={activeLogs} fuelEfficiency={averageEfficiency} lang={lang} unitSystem={unitSystem} vehicle={vehicle} />
                    </div>

                    {/* 3. Speed vs. Efficiency Simulator */}
                    <div>
                      <SpeedSimulatorCard logs={activeLogs} fuelEfficiency={averageEfficiency} lang={lang} unitSystem={unitSystem} />
                    </div>

                    {/* Sponsored Ads Slot */}
                    <div>
                      <SponsoredAdCard lang={lang} />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 bg-slate-950/20 border border-slate-900 rounded-2xl p-10 flex flex-col items-center justify-center h-[400px]">
                    <Car className="text-slate-700 mb-4 animate-pulse" size={48} />
                    <h3 className="text-base font-bold text-slate-300">Awaiting Vehicle Information</h3>
                    <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
                      Complete and save your car details in the Vehicles tab to calibrate diagnostic sensors.
                    </p>
                    <button
                      onClick={() => setActiveTab('vehicles')}
                      className="mt-4 px-4 py-2 rounded-xl tech-gradient text-white text-xs font-bold hover:opacity-90 cursor-pointer"
                    >
                      Go to Vehicles
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'vehicles' && (
            <Vehicles 
              vehicles={vehicles}
              activeVehicleId={activeVehicleId}
              onSelectVehicle={handleSelectVehicle}
              onAddVehicle={handleAddVehicle}
              onUpdateVehicle={handleUpdateVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              healthMetrics={healthMetrics} 
              logs={logs} 
              lang={lang} 
              unitSystem={unitSystem} 
              onUnitSystemChange={setUnitSystem}
            />
          )}

          {activeTab === 'refuel' && (
            <div className="max-w-2xl mx-auto space-y-6">
              {vehicle.brand ? (
                <FuelForm currentOdometer={vehicle.currentOdometer} onAddEntry={handleAddFuelEntry} lang={lang} unitSystem={unitSystem} logs={activeLogs} fuelCapacity={vehicle.fuelCapacity} />
              ) : (
                <div className="text-center py-16 bg-slate-950/40 border border-slate-900 rounded-2xl p-8 flex flex-col items-center justify-center">
                  <Car className="mx-auto text-slate-600 mb-3 animate-pulse" size={40} />
                  <p className="text-sm font-semibold text-slate-300">
                    Please complete and save your vehicle profile in the Vehicles tab first.
                  </p>
                  <button
                    onClick={() => setActiveTab('vehicles')}
                    className="mt-4 px-4 py-2 rounded-xl tech-gradient text-white text-xs font-bold cursor-pointer"
                  >
                    Go to Vehicles
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <FuelLogsList 
                logs={activeLogs} 
                onDeleteEntry={handleDeleteLog} 
                onImportLogs={setLogs}
                lang={lang} 
                unitSystem={unitSystem} 
              />
              {activeLogs.length === 1 ? (
                <FirstRefuelBaselineCard 
                  odometer={activeLogs[activeLogs.length - 1].odometer} 
                  unitSystem={unitSystem} 
                  lang={lang} 
                />
              ) : (
                <CostAnalysisCharts logs={activeLogs} lang={lang} unitSystem={unitSystem} />
              )}
              <CSVDataManagementCard logs={activeLogs} onImportLogs={setLogs} lang={lang} />
              <div className="pt-2 text-center">
                <button
                  id="reset-all-data-history-desktop"
                  onClick={handleResetData}
                  className="text-sm font-bold text-red-500 hover:text-red-400 bg-red-950/20 hover:bg-red-950/40 px-4 py-2 border border-red-900/40 hover:border-red-900/60 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
                >
                  <RotateCcw size={14} />
                  <span className="text-sm font-bold">{t.resetAll}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {vehicle.brand ? (
                <>
                  <HealthScoreCard metrics={healthMetrics} lang={lang} hideScore={true} />
                  <AITechnicianReport vehicle={vehicle} logs={activeLogs} lang={lang} />
                </>
              ) : (
                <div className="text-center py-16 bg-slate-950/40 border border-slate-900 rounded-2xl p-8 flex flex-col items-center justify-center">
                  <Car className="mx-auto text-slate-600 mb-3 animate-pulse" size={40} />
                  <p className="text-sm font-semibold text-slate-300">
                    Please complete and save your vehicle profile in the Vehicles tab first.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MOBILE ONLY LAYOUT (hidden on desktop, visible on mobile) */}
        <div className="block md:hidden space-y-6">
          {/* Mobile View Router */}
          <div className="space-y-6">
            {activeTab === 'dashboard' && (
              <>
                {/* Quick Vehicle Operational Status Summary Card at top of Mobile Dashboard */}
                <QuickVehicleStatusCard 
                  vehicle={vehicle} 
                  healthMetrics={healthMetrics} 
                  logs={activeLogs} 
                  unitSystem={unitSystem} 
                  lang={lang} 
                  onNavigateToVehicles={() => setActiveTab('vehicles')}
                  onNavigateToRefuel={() => setActiveTab('refuel')}
                />

                {vehicle.brand ? (
                  activeLogs.length === 0 ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl">
                        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">
                          Log Your First Refuel
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          To activate diagnostic charts and calibrate your health index, please log your first fuel entry below.
                        </p>
                      </div>
                      <FuelForm currentOdometer={vehicle.currentOdometer} onAddEntry={handleAddFuelEntry} lang={lang} unitSystem={unitSystem} logs={activeLogs} fuelCapacity={vehicle.fuelCapacity} />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* 1. Fuel Consumption */}
                      <EfficiencyHeroCard fuelEfficiency={averageEfficiency} lang={lang} unitSystem={unitSystem} logs={activeLogs} isEstimated={healthMetrics.isEstimated} fuelCapacity={vehicle.fuelCapacity} />
                      
                      {/* 2. Financial Impact */}
                      <FinancialImpactCard logs={activeLogs} fuelEfficiency={averageEfficiency} lang={lang} unitSystem={unitSystem} vehicle={vehicle} />
                      
                      {/* 3. Speed vs. Efficiency Simulator */}
                      <SpeedSimulatorCard logs={activeLogs} fuelEfficiency={averageEfficiency} lang={lang} unitSystem={unitSystem} />
                      
                      {/* 4. Vehicle Health Score (VHS) */}
                      <HealthScoreCard metrics={healthMetrics} lang={lang} hideAlerts={true} />
                      
                      {/* 5. Efficiency Health Checklist */}
                      <EfficiencyIssuesCard 
                        lastLogEfficiency={lastLogEfficiency} 
                        averageEfficiency={averageEfficiency} 
                        lang={lang} 
                        currentOdometer={vehicle.currentOdometer}
                        unitSystem={unitSystem}
                      />
                      
                      {/* Google Ads Placement Slot */}
                      <SponsoredAdCard lang={lang} />
                    </div>
                  )
                ) : (
                  <div className="text-center py-10 bg-slate-950/40 border border-slate-900 rounded-2xl p-6">
                    <Car className="mx-auto text-slate-600 mb-2" size={32} />
                    <p className="text-xs text-slate-400">
                      Please complete and save your vehicle profile in the Vehicles tab first to enable logs tracking.
                    </p>
                    <button
                      onClick={() => setActiveTab('vehicles')}
                      className="mt-3 px-4 py-2 rounded-xl tech-gradient text-white text-xs font-bold cursor-pointer"
                    >
                      Go to Vehicles
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === 'vehicles' && (
              <Vehicles 
                vehicles={vehicles}
                activeVehicleId={activeVehicleId}
                onSelectVehicle={handleSelectVehicle}
                onAddVehicle={handleAddVehicle}
                onUpdateVehicle={handleUpdateVehicle}
                onDeleteVehicle={handleDeleteVehicle}
                healthMetrics={healthMetrics} 
                logs={logs} 
                lang={lang} 
                unitSystem={unitSystem} 
                onUnitSystemChange={setUnitSystem}
              />
            )}

            {activeTab === 'refuel' && (
              vehicle.brand ? (
                <FuelForm currentOdometer={vehicle.currentOdometer} onAddEntry={handleAddFuelEntry} lang={lang} unitSystem={unitSystem} logs={activeLogs} fuelCapacity={vehicle.fuelCapacity} />
              ) : (
                <div className="text-center py-12 bg-slate-950/40 border border-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center">
                  <Car className="mx-auto text-slate-600 mb-3 animate-pulse" size={36} />
                  <p className="text-xs font-semibold text-slate-300">
                    Please complete and save your vehicle profile in the Vehicles tab first.
                  </p>
                  <button
                    onClick={() => setActiveTab('vehicles')}
                    className="mt-3 px-4 py-2 rounded-xl tech-gradient text-white text-xs font-bold cursor-pointer"
                  >
                    Go to Vehicles
                  </button>
                </div>
              )
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <FuelLogsList 
                  logs={activeLogs} 
                  onDeleteEntry={handleDeleteLog} 
                  onImportLogs={setLogs}
                  lang={lang} 
                  unitSystem={unitSystem} 
                  title="Quick refuel overview" 
                />
                {activeLogs.length === 1 ? (
                  <FirstRefuelBaselineCard 
                    odometer={activeLogs[activeLogs.length - 1].odometer} 
                    unitSystem={unitSystem} 
                    lang={lang} 
                  />
                ) : (
                  <CostAnalysisCharts logs={activeLogs} lang={lang} unitSystem={unitSystem} />
                )}
                <CSVDataManagementCard logs={activeLogs} onImportLogs={setLogs} lang={lang} />
                <div className="pt-2 text-center">
                  <button
                    id="reset-all-data-history-mobile"
                    onClick={handleResetData}
                    className="text-sm font-bold text-red-500 hover:text-red-400 bg-red-950/20 hover:bg-red-950/40 px-4 py-2 border border-red-900/40 hover:border-red-900/60 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 active:scale-95"
                  >
                    <RotateCcw size={14} />
                    <span className="text-sm font-bold">{t.resetAll}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              vehicle.brand ? (
                <div className="space-y-6">
                  <HealthScoreCard metrics={healthMetrics} lang={lang} hideScore={true} />
                  <AITechnicianReport vehicle={vehicle} logs={activeLogs} lang={lang} />
                </div>
              ) : (
                <div className="text-center py-12 bg-slate-950/40 border border-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center">
                  <Car className="mx-auto text-slate-600 mb-3 animate-pulse" size={36} />
                  <p className="text-xs font-semibold text-slate-300">
                    Please complete and save your vehicle profile in the Vehicles tab first.
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Technical Footer (Desktop & Mobile) */}
        <div className="pt-8 border-t border-slate-900/80 text-center space-y-2.5 pb-20 md:pb-6">
          <div className="max-w-xl mx-auto px-4 text-xs text-slate-400 leading-relaxed">
            <p>
              Fuel Analyzer is a smart vehicle fuel consumption calculator and mileage log tracker designed to monitor fuel efficiency, calculate expenses, and optimize driving costs.
            </p>
            <p className="pt-1 font-medium">
              <a 
                href="https://cartools.app/tools/fuel-calculator" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4 decoration-cyan-500/40 hover:decoration-cyan-400 transition-all inline-flex items-center gap-1"
              >
                <span>Fuel Calculator Tool Overview</span>
                <span className="text-[10px]">↗</span>
              </a>
            </p>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-600 font-medium">
            <Heart size={10} className="text-red-500/50" />
            <span>{t.offlineNote}</span>
          </div>
        </div>
      </main>

      {/* Bottom Sticky Navigation Rail for mobile (5-Tab Layout with Center Hero/FAB) */}
      <footer className="fixed bottom-0 inset-x-0 bg-slate-950/85 backdrop-blur-md border-t border-slate-900/90 pb-2 pt-1 px-2 z-40 md:hidden no-print">
        <div className="grid grid-cols-5 items-end max-w-md mx-auto relative">
          {/* Tab 1: Dashboard */}
          <button
            onClick={() => setActiveTab('dashboard')}
            aria-label={t.tabDashboard}
            className={`flex flex-col items-center justify-center py-1 cursor-pointer transition-all ${
              activeTab === 'dashboard' ? 'text-cyan-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge size={20} />
            <span className="text-[10px] font-bold mt-1">{t.tabDashboard}</span>
          </button>

          {/* Tab 2: Vehicles */}
          <button
            onClick={() => setActiveTab('vehicles')}
            aria-label={t.tabVehicles}
            className={`flex flex-col items-center justify-center py-1 cursor-pointer transition-all ${
              activeTab === 'vehicles' ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Car size={20} />
            <span className="text-[10px] font-bold mt-1">{t.tabVehicles}</span>
          </button>

          {/* Tab 3: Center Refuel FAB (Hero Button) */}
          <div className="flex flex-col items-center justify-end -mt-4 z-50">
            <button
              onClick={() => setActiveTab('refuel')}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-cyan-500 border-2 border-slate-950 flex items-center justify-center text-slate-950 transition-all cursor-pointer hover:bg-cyan-400 ${
                activeTab === 'refuel' ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-950' : ''
              }`}
              title={t.tabRefuel}
              aria-label={t.tabRefuel}
            >
              <Flame size={20} className="text-slate-950" />
            </button>
            <span className={`text-[10px] font-extrabold mt-0.5 ${activeTab === 'refuel' ? 'text-cyan-400' : 'text-slate-300'}`}>
              {t.tabRefuel}
            </span>
          </div>

          {/* Tab 4: History */}
          <button
            onClick={() => setActiveTab('history')}
            aria-label={t.tabHistory}
            className={`flex flex-col items-center justify-center py-1 cursor-pointer transition-all ${
              activeTab === 'history' ? 'text-indigo-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp size={20} />
            <span className="text-[10px] font-bold mt-1">{t.tabHistory}</span>
          </button>

          {/* Tab 5: AI Technician */}
          <button
            onClick={() => setActiveTab('ai')}
            aria-label={t.tabAi}
            className={`flex flex-col items-center justify-center py-1 cursor-pointer transition-all ${
              activeTab === 'ai' ? 'text-pink-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu size={20} />
            <span className="text-[10px] font-bold mt-1">{t.tabAi}</span>
          </button>
        </div>
      </footer>

      {/* Toast Notification for Share */}
      {showShareNotification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-semibold backdrop-blur-md animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>Report copied to clipboard!</span>
        </div>
      )}

      {/* Custom Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl shadow-black">
            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center">
              <RotateCcw size={24} className="animate-spin-slow" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-100">
                Reset All Local Analytics?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {t.confirmReset}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                id="confirm-reset-btn"
                onClick={handleConfirmReset}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl text-xs cursor-pointer transition-all active:scale-95"
              >
                Yes, reset everything
              </button>
              <button
                id="cancel-reset-btn"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-4 rounded-xl text-xs cursor-pointer transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
