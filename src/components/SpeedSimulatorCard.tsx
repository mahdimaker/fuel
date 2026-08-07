import React, { useState, useEffect } from 'react';
import { Gauge, SlidersHorizontal, AlertTriangle, Compass, Box, Sun, Wind, Car, X, Check, ChevronRight } from 'lucide-react';
import { FuelEntry, VehicleInfo } from '../types';
import { Language } from '../utils/translations';

interface SpeedSimulatorCardProps {
  logs: FuelEntry[];
  fuelEfficiency: number; // L/100km
  unitSystem: 'metric' | 'us' | 'uk';
  lang?: Language;
  vehicle?: VehicleInfo;
}

type CargoType = 'none' | 'bars' | 'box' | 'bike' | 'bag';
type VehicleType = 'compact' | 'crossover' | 'suv';

interface CargoOption {
  id: CargoType;
  title: string;
  cdAdd: number;
  desc: string;
}

interface VehicleOption {
  id: VehicleType;
  title: string;
  baseCd: number;
  desc: string;
}

export default function SpeedSimulatorCard({ logs, fuelEfficiency, unitSystem, lang, vehicle }: SpeedSimulatorCardProps) {
  const isMetric = unitSystem === 'metric';
  const isUs = unitSystem === 'us';
  const isUk = unitSystem === 'uk';

  // Constants
  const KM_TO_MILES = 0.621371;
  const LITERS_TO_GALLONS = 0.264172;

  // Use a fallback fuelEfficiency if there's none
  const eff = fuelEfficiency > 0 ? fuelEfficiency : 8.0;

  // Environmental Variables States (A/C & Windows)
  const [acOn, setAcOn] = useState<boolean>(false);
  const [windowsOpen, setWindowsOpen] = useState<boolean>(false);

  // Modal State for Cargo / Roof Rack selection
  const [isCargoModalOpen, setIsCargoModalOpen] = useState<boolean>(false);

  // Vehicle Type initial state based on profile if available
  const [vehicleType, setVehicleType] = useState<VehicleType>(() => {
    if (vehicle?.bodyType) return vehicle.bodyType;
    return 'crossover';
  });

  // Sync if vehicle prop changes
  useEffect(() => {
    if (vehicle?.bodyType) {
      setVehicleType(vehicle.bodyType);
    }
  }, [vehicle?.bodyType]);

  // Selected Roof Attachment / Cargo Type
  const [cargoType, setCargoType] = useState<CargoType>('none');

  // Trip Distance State
  // US / UK: 10 to 1500 miles (default: 250 miles)
  // Metric: 15 to 2500 km (default: 400 km)
  const minDistance = isMetric ? 15 : 10;
  const maxDistance = isMetric ? 2500 : 1500;
  const [tripDistance, setTripDistance] = useState<number>(isMetric ? 400 : 250);

  // Cruising Speed State
  // US / UK: 30 to 90 mph (default: 65 mph)
  // Metric: 50 to 140 km/h (default: 100 km/h)
  const minSpeed = isMetric ? 50 : 30;
  const maxSpeed = isMetric ? 140 : 90;
  const [speed, setSpeed] = useState<number>(isMetric ? 100 : 65);

  // Average Fuel Price Calculation
  const getAveragePrice = () => {
    if (!logs || logs.length === 0) {
      return isUs ? 3.55 : isUk ? 1.45 : 1.75; // fallback
    }
    const totalCost = logs.reduce((sum, l) => sum + l.cost, 0);
    const totalLiters = logs.reduce((sum, l) => sum + l.liters, 0);
    if (totalLiters === 0) return isUs ? 3.55 : 1.75;
    
    if (isUs) {
      const totalGallons = totalLiters * LITERS_TO_GALLONS;
      return totalGallons > 0 ? totalCost / totalGallons : 3.55;
    }
    return totalCost / totalLiters;
  };

  const avgGasPrice = getAveragePrice();

  // Cargo Types Configuration
  const cargoOptions: CargoOption[] = [
    {
      id: 'none',
      title: 'Roof Rack: None',
      cdAdd: 0.000,
      desc: 'Clean factory roof without crossbars',
    },
    {
      id: 'bars',
      title: 'Empty Bars',
      cdAdd: 0.045,
      desc: 'Bare crossbars or empty factory roof rails',
    },
    {
      id: 'box',
      title: 'Cargo Roof Box',
      cdAdd: 0.085,
      desc: 'Aerodynamic hard-shell luggage box',
    },
    {
      id: 'bike',
      title: 'Roof Bicycle',
      cdAdd: 0.135,
      desc: 'Upright bicycle mounted on roof rack',
    },
    {
      id: 'bag',
      title: 'Soft Cargo Bag',
      cdAdd: 0.165,
      desc: 'Non-aerodynamic soft luggage bag or kayak',
    },
  ];

  // Vehicle Types Configuration
  const vehicleOptions: VehicleOption[] = [
    {
      id: 'compact',
      title: 'Compact',
      baseCd: 0.28,
      desc: 'Sedan / Hatchback',
    },
    {
      id: 'crossover',
      title: 'Crossover',
      baseCd: 0.33,
      desc: 'Mid-size SUV / Crossover',
    },
    {
      id: 'suv',
      title: 'Full SUV',
      baseCd: 0.38,
      desc: 'Full SUV / Truck / Van',
    },
  ];

  const currentCargo = cargoOptions.find((c) => c.id === cargoType) || cargoOptions[0];
  const currentVehicle = vehicleOptions.find((v) => v.id === vehicleType) || vehicleOptions[1];

  // Speed in MPH for physics calculation
  const speedMph = isMetric ? speed * KM_TO_MILES : speed;

  // Environmental Penalties
  const acPenaltyPct = acOn ? 8 : 0;
  const windowsPenaltyPct = windowsOpen ? Math.round(5 + (speedMph > 50 ? (speedMph - 50) * 0.15 : 0)) : 0;
  const envPenaltyPct = acPenaltyPct + windowsPenaltyPct;

  // Speed Aerodynamic Penalty
  const speedDiffMph = Math.max(0, speedMph - 55);
  const speedDragPct = speedDiffMph * 1.1 + Math.pow(speedDiffMph, 1.55) * 0.14;

  // Cargo Drag Penalty %
  const cargoDragPct = (currentCargo.cdAdd / currentVehicle.baseCd) * 100;

  // Combined Total Penalty %
  const totalPenaltyPct = speedDragPct + cargoDragPct + envPenaltyPct;

  // Calculate Base Consumption vs Actual Consumption for Trip
  const tripDistanceKm = isMetric ? tripDistance : tripDistance / KM_TO_MILES;
  
  // Base fuel needed for trip (Liters)
  const baseLitersNeeded = (eff / 100) * tripDistanceKm;
  
  // Actual fuel needed for trip with extra drag (Liters)
  const actualLitersNeeded = baseLitersNeeded * (1 + totalPenaltyPct / 100);
  
  // Extra Wasted Fuel
  const wastedLiters = actualLitersNeeded - baseLitersNeeded;
  
  // Extra Wasted Fuel in user unit
  const wastedFuelVolume = isUs ? wastedLiters * LITERS_TO_GALLONS : wastedLiters;
  const fuelUnitLabel = isUs ? 'gal' : 'L';

  // Extra Fuel Cost
  const extraCost = isUs 
    ? wastedFuelVolume * avgGasPrice 
    : wastedLiters * avgGasPrice;

  // Currency Symbol
  const currencySymbol = isUs ? '$' : isUk ? '£' : '€';

  // Slider visual indicators
  const speedFraction = Math.min(1, Math.max(0, (speed - minSpeed) / (maxSpeed - minSpeed)));
  const normSpeed = isMetric ? speed : speed * (90 / 55);

  let speedSeverity = {
    textColor: 'text-emerald-400',
    accentHex: '#10b981',
    badgeText: 'Safe Speed',
    badgeStyle: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
  };

  if (normSpeed > 115) {
    speedSeverity = {
      textColor: 'text-rose-400',
      accentHex: '#f43f5e',
      badgeText: 'High Drag / Waste',
      badgeStyle: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
    };
  } else if (normSpeed > 95) {
    speedSeverity = {
      textColor: 'text-amber-400',
      accentHex: '#f59e0b',
      badgeText: 'Moderate Speed',
      badgeStyle: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    };
  }

  return (
    <div id="speed-simulator-card" className="cyber-card p-5 sm:p-7 rounded-2xl border border-cyan-500/20 bg-slate-900/50 relative overflow-hidden transition-all duration-300 hover:border-cyan-500/35 shadow-xl">
      {/* Background glow overlay */}
      <div className="absolute -right-20 -top-20 w-52 h-52 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none"></div>

      {/* Card Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Gauge size={22} className="animate-spin-slow" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-white">
            Speed & Cargo Efficiency Simulator
          </h2>
          <p className="text-xs text-slate-400">
            Real-time aerodynamic drag & extra trip fuel cost analyzer
          </p>
        </div>
      </div>

      {/* TOP COST ALERT BANNER */}
      <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4 shadow-inner relative overflow-hidden">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-500 shrink-0">
            <AlertTriangle size={24} className="animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 block mb-0.5">
              EXTRA FUEL COST
            </span>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl sm:text-3xl font-black font-mono text-rose-500 tracking-tight">
                +{currencySymbol}{extraCost.toFixed(2)}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white shadow-sm shadow-rose-600/30">
                {wastedFuelVolume.toFixed(1)} {fuelUnitLabel} wasted
              </span>
            </div>
          </div>
        </div>

        {/* Total Drag % Badge */}
        <div className="hidden sm:flex flex-col items-end shrink-0">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Fuel Burn Increase</span>
          <span className="text-lg font-black font-mono text-amber-400">+{totalPenaltyPct.toFixed(1)}%</span>
        </div>
      </div>

      {/* CABIN COMFORT & ROOF RACK CONTROL BUTTONS (3 BUTTONS GRID) */}
      <div className="bg-slate-950/70 border border-slate-900 p-4 rounded-2xl space-y-2.5 mb-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
            <SlidersHorizontal size={14} />
            <span>DRAG VARIABLES</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono font-bold">
            +{(envPenaltyPct + cargoDragPct).toFixed(1)}% Drag
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* A/C Toggle */}
          <button
            type="button"
            id="toggle-ac-environmental-variable"
            onClick={() => setAcOn(!acOn)}
            className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              acOn
                ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Sun size={16} className={acOn ? 'animate-spin-slow text-white' : 'text-slate-400'} />
            <span>{acOn ? `A/C ON (+${acPenaltyPct}%)` : 'A/C OFF'}</span>
          </button>

          {/* Windows Toggle */}
          <button
            type="button"
            id="toggle-windows-environmental-variable"
            onClick={() => setWindowsOpen(!windowsOpen)}
            className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              windowsOpen
                ? 'bg-amber-600 border-amber-400 text-white shadow-md shadow-amber-500/25 ring-1 ring-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Wind size={16} className={windowsOpen ? 'text-white' : 'text-slate-400'} />
            <span>{windowsOpen ? `Windows Open (+${windowsPenaltyPct}%)` : 'Windows Closed'}</span>
          </button>

          {/* Roof Rack Modal Trigger Button (Centered alignment like others) */}
          <button
            type="button"
            id="open-cargo-modal-button"
            onClick={() => setIsCargoModalOpen(true)}
            className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
              cargoType !== 'none'
                ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-500/25 ring-1 ring-purple-400'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
            }`}
          >
            <Box size={16} className={cargoType !== 'none' ? 'text-white shrink-0' : 'text-slate-400 shrink-0'} />
            <span className="truncate">
              {cargoType === 'none' ? 'Roof Rack: None' : currentCargo.title}
            </span>
            <ChevronRight size={14} className="shrink-0 text-slate-400 absolute right-3" />
          </button>
        </div>
      </div>

      {/* SLIDERS SECTION */}
      <div className="space-y-6 mb-6 bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-900">
        {/* 1. TRIP DISTANCE SLIDER */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label htmlFor="trip-distance-slider" className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Compass size={15} className="text-amber-400" />
              <span>TRIP DISTANCE</span>
            </label>
            <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-white flex items-center gap-1">
              <span className="text-amber-400 font-extrabold">{tripDistance}</span>
              <span className="text-slate-400 text-[11px]">{isMetric ? 'km' : 'miles'}</span>
            </div>
          </div>

          <input
            id="trip-distance-slider"
            type="range"
            min={minDistance}
            max={maxDistance}
            step={isMetric ? 10 : 5}
            value={tripDistance}
            onChange={(e) => setTripDistance(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
          />

          <div className="flex justify-between items-center text-xs font-mono font-semibold text-slate-400">
            <span>{minDistance} {isMetric ? 'km' : 'mi'}</span>
            <span>{Math.round(maxDistance / 2)} {isMetric ? 'km' : 'mi'}</span>
            <span>{maxDistance.toLocaleString()} {isMetric ? 'km' : 'mi'}</span>
          </div>
        </div>

        {/* 2. CRUISING SPEED SLIDER */}
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label htmlFor="cruising-speed-slider" className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Gauge size={15} className="text-cyan-400" />
              <span>CRUISING SPEED</span>
            </label>

            <div className="flex items-center justify-between sm:justify-end gap-2">
              <span className={`inline-block text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full border tracking-wide uppercase ${speedSeverity.badgeStyle}`}>
                {speedSeverity.badgeText}
              </span>
              <div className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-white flex items-center gap-1 shrink-0">
                <span className={`font-extrabold ${speedSeverity.textColor}`}>{speed}</span>
                <span className="text-slate-400 text-[11px]">{isMetric ? 'km/h' : 'mph'}</span>
              </div>
            </div>
          </div>

          <input
            id="cruising-speed-slider"
            type="range"
            min={minSpeed}
            max={maxSpeed}
            step={1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none transition-all"
            style={{
              accentColor: speedSeverity.accentHex,
              background: `linear-gradient(to right, #10b981 0%, #f59e0b ${Math.min(50, speedFraction * 100)}%, #f43f5e ${speedFraction * 100}%, #1e293b ${speedFraction * 100}%, #1e293b 100%)`,
              boxShadow: `0 0 8px ${speedSeverity.accentHex}30`
            }}
          />

          <div className="flex justify-between items-center text-xs font-mono font-semibold text-slate-400">
            <span>{minSpeed} {isMetric ? 'km/h' : 'mph'}</span>
            <span className="text-cyan-400 font-bold">{isMetric ? '90 km/h (Sweet Spot)' : '55 mph (Sweet Spot)'}</span>
            <span>{maxSpeed} {isMetric ? 'km/h' : 'mph'}</span>
          </div>
        </div>
      </div>



      {/* SLEEK ROOF RACK / CARGO SELECTION MODAL */}
      {isCargoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Box size={20} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Roof Attachment & Cargo</h3>
                  <p className="text-xs text-slate-400">Select aerodynamic roof load to compute drag</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCargoModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cargo Options List */}
            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {cargoOptions.map((opt) => {
                const isSelected = cargoType === opt.id;
                const optionDragPct = (opt.cdAdd / currentVehicle.baseCd) * 100;

                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => {
                      setCargoType(opt.id);
                      setIsCargoModalOpen(false);
                    }}
                    className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-purple-950/60 border-purple-500 text-white ring-1 ring-purple-500/50 shadow-lg shadow-purple-950/40'
                        : 'bg-slate-950/80 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white">{opt.title}</span>
                        {isSelected && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-purple-500 text-white">
                            <Check size={12} /> Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-tight">{opt.desc}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="block text-xs font-mono font-extrabold text-amber-400">
                        {opt.cdAdd > 0 ? `+${optionDragPct.toFixed(1)}%` : '0% Drag'}
                      </span>
                      <span className="block text-[10px] font-mono text-slate-500">
                        +Cd {opt.cdAdd.toFixed(3)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Modal Footer / Close Action */}
            <div className="pt-2 border-t border-slate-800/80 flex justify-end">
              <button
                type="button"
                onClick={() => setIsCargoModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold transition-all cursor-pointer active:scale-95 shadow-md shadow-purple-600/30"
              >
                Apply Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
