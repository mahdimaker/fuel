/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Car, Fuel, Calendar, Gauge, Save, Edit3, Settings, Grid } from 'lucide-react';
import { VehicleInfo } from '../types';
import { translations, Language } from '../utils/translations';
import { baseVehiclesEn } from '../utils/popularVehicles';

interface VehicleProfileProps {
  vehicle: VehicleInfo;
  onSave: (info: VehicleInfo) => void;
  lang: Language;
  unitSystem: 'metric' | 'us' | 'uk';
}

export default function VehicleProfile({ vehicle, onSave, lang, unitSystem }: VehicleProfileProps) {
  const t = translations[lang];
  const isMetric = unitSystem === 'metric';
  const isUs = unitSystem === 'us';
  const isUk = unitSystem === 'uk';
  const KM_TO_MILES = 0.621371;
  const LITERS_TO_GALLONS = 0.264172;

  const [isEditing, setIsEditing] = useState<boolean>(!vehicle.brand);
  
  const [brand, setBrand] = useState<string>(vehicle.brand || '');
  const [model, setModel] = useState<string>(vehicle.model || '');
  const [year, setYear] = useState<string>(vehicle.year || '');
  
  const [fuelCapacity, setFuelCapacity] = useState<number>(() => {
    if (!vehicle.fuelCapacity) return isUs ? Number((50 * LITERS_TO_GALLONS).toFixed(1)) : 50;
    return isUs ? Number((vehicle.fuelCapacity * LITERS_TO_GALLONS).toFixed(1)) : vehicle.fuelCapacity;
  });
  
  const [currentOdometer, setCurrentOdometer] = useState<number | ''>(() => {
    if (!vehicle.currentOdometer) return '';
    return isMetric ? vehicle.currentOdometer : Math.round(vehicle.currentOdometer * KM_TO_MILES);
  });

  const [selectedBrand, setSelectedBrand] = useState<string>(() => {
    if (vehicle.brand) {
      const match = baseVehiclesEn.find(v => v.brand.toLowerCase() === vehicle.brand.toLowerCase());
      return match ? match.brand : 'custom';
    }
    return '';
  });

  const [selectedModel, setSelectedModel] = useState<string>(() => {
    if (vehicle.model) {
      const match = baseVehiclesEn.find(v => v.brand.toLowerCase() === vehicle.brand?.toLowerCase() && v.model.toLowerCase() === vehicle.model.toLowerCase());
      return match ? match.model : 'custom';
    }
    return '';
  });

  // Extract unique brands alphabetically
  const uniqueBrands = Array.from(new Set(baseVehiclesEn.map(v => v.brand))).sort();

  // Get available models for the selected brand
  const availableModels = selectedBrand && selectedBrand !== 'custom'
    ? baseVehiclesEn.filter(v => v.brand === selectedBrand).map(v => v.model).sort()
    : [];

  // Update localized values if vehicle changes
  useEffect(() => {
    if (vehicle.brand) {
      setBrand(vehicle.brand);
      setModel(vehicle.model);
      setYear(vehicle.year);
      
      const capacityValue = isUs ? Number((vehicle.fuelCapacity * LITERS_TO_GALLONS).toFixed(1)) : vehicle.fuelCapacity;
      setFuelCapacity(capacityValue);
      
      const odoValue = vehicle.currentOdometer 
        ? (isMetric ? vehicle.currentOdometer : Math.round(vehicle.currentOdometer * KM_TO_MILES))
        : '';
      setCurrentOdometer(odoValue);

      const brandMatch = baseVehiclesEn.find(v => v.brand.toLowerCase() === vehicle.brand.toLowerCase());
      setSelectedBrand(brandMatch ? brandMatch.brand : 'custom');

      const modelMatch = baseVehiclesEn.find(v => v.brand.toLowerCase() === vehicle.brand.toLowerCase() && v.model.toLowerCase() === vehicle.model.toLowerCase());
      setSelectedModel(modelMatch ? modelMatch.model : 'custom');
    } else {
      setBrand('');
      setModel('');
      setYear('');
      setFuelCapacity(isUs ? Number((50 * LITERS_TO_GALLONS).toFixed(1)) : 50);
      setCurrentOdometer('');
      setSelectedBrand('');
      setSelectedModel('');
    }
  }, [vehicle, unitSystem, isMetric, isUs, isUk]);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const b = e.target.value;
    setSelectedBrand(b);
    setSelectedModel('');
    if (b && b !== 'custom') {
      setBrand(b);
      setModel('');
    } else {
      setBrand('');
      setModel('');
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = e.target.value;
    setSelectedModel(m);
    if (m && m !== 'custom') {
      setModel(m);
      const match = baseVehiclesEn.find(v => v.brand === selectedBrand && v.model === m);
      if (match) {
        const capacityValue = isUs ? Number((match.fuelCapacity * LITERS_TO_GALLONS).toFixed(1)) : match.fuelCapacity;
        setFuelCapacity(capacityValue);
      }
    } else {
      setModel('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !model) return;

    const capacityInLiters = isUs ? Number(fuelCapacity) / LITERS_TO_GALLONS : Number(fuelCapacity);
    const odoInKm = isMetric ? (Number(currentOdometer) || 0) : (Number(currentOdometer) || 0) / KM_TO_MILES;

    onSave({
      brand,
      model,
      year,
      fuelCapacity: Number(capacityInLiters),
      currentOdometer: Number(odoInKm) || 0,
    });
    setIsEditing(false);
  };

  if (!isEditing && vehicle.brand) {
    return (
      <div id="vehicle-profile-view" className="cyber-card p-6 rounded-2xl relative overflow-hidden transition-all duration-300 hover:border-cyan-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Car size={24} />
            </div>
            <div>
              <h3 className="text-sm text-slate-400 font-medium">{t.profileTitle}</h3>
              <h2 className="text-xl font-bold text-white tracking-wide">{vehicle.brand} {vehicle.model}</h2>
            </div>
          </div>
          <button
            id="edit-profile-btn"
            onClick={() => setIsEditing(true)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 hover:text-purple-400 transition-all text-slate-400 cursor-pointer"
            title={t.editBtn}
          >
            <Edit3 size={18} />
          </button>
        </div>

        <div className="space-y-2 mt-5">
          {/* Row 1: Year */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-900 rounded-xl hover:border-slate-800/80 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400">
                <Calendar size={16} />
              </div>
              <span className="text-xs font-semibold text-slate-400">{t.year}</span>
            </div>
            <span className="text-sm font-bold text-slate-200">{vehicle.year || '---'}</span>
          </div>

          {/* Row 2: Fuel Capacity */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-900 rounded-xl hover:border-slate-800/80 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-purple-400">
                <Fuel size={16} />
              </div>
              <span className="text-xs font-semibold text-slate-400">{t.capacity}</span>
            </div>
            <span className="text-sm font-bold text-slate-200">
              {isUs 
                ? Number((vehicle.fuelCapacity * LITERS_TO_GALLONS).toFixed(1))
                : vehicle.fuelCapacity} <span className="text-xs font-medium text-slate-500">{isUs ? 'Gallons' : 'Liters'}</span>
            </span>
          </div>

          {/* Row 3: Current Odometer */}
          <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-900 rounded-xl hover:border-slate-800/80 transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400">
                <Gauge size={16} />
              </div>
              <span className="text-xs font-semibold text-slate-400">{t.currentOdo}</span>
            </div>
            <span className="text-sm font-extrabold text-slate-200 font-mono">
              {isMetric 
                ? vehicle.currentOdometer.toLocaleString() 
                : Math.round(vehicle.currentOdometer * KM_TO_MILES).toLocaleString()} <span className="text-xs font-medium text-slate-500">{isMetric ? 'km' : 'mi'}</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="vehicle-profile-edit" className="cyber-card p-6 rounded-2xl relative overflow-hidden transition-all duration-300 border-purple-500/30 tech-glow-purple">
      {/* Decorative cyber grid background pattern in top corner */}
      <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none rounded-bl-full"></div>

      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Settings size={22} className="animate-spin-slow" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{t.saveVehicle}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{t.fuelFormSub}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Brand & Model cascading selection */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 mr-1 flex items-center gap-1">
              <Grid size={12} className="text-cyan-400" />
              <span>Select Brand</span>
            </label>
            <select
              id="brand-presets-select"
              value={selectedBrand}
              onChange={handleBrandChange}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none transition-all cursor-pointer"
            >
              <option value="">-- Select Brand --</option>
              {uniqueBrands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
              <option value="custom">-- Custom Brand --</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 mr-1 flex items-center gap-1">
              <Grid size={12} className="text-purple-400" />
              <span>Select Model</span>
            </label>
            <select
              id="model-presets-select"
              value={selectedModel}
              disabled={!selectedBrand || selectedBrand === 'custom'}
              onChange={handleModelChange}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="">-- Select Model --</option>
              {availableModels.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
              <option value="custom">-- Custom Model --</option>
            </select>
          </div>
        </div>

        {(selectedBrand === 'custom' || selectedModel === 'custom') && (
          <p className="text-[10px] text-purple-400 font-semibold">
            Please enter your custom brand and model in the boxes below:
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 mr-1">{t.brand} *</label>
            <input
              id="car-brand-input"
              type="text"
              required
              placeholder="e.g. Toyota, Ford, BMW"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 mr-1">{t.model} *</label>
            <input
              id="car-model-input"
              type="text"
              required
              placeholder="e.g. Camry, Civic"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 mr-1">{t.year}</label>
            <input
              id="car-year-input"
              type="text"
              placeholder="2026"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder:text-slate-600/60 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 mr-1">
              {t.capacity} <span className="text-[10px] text-purple-400 font-normal">({isMetric ? 'L' : 'gal'})</span> *
            </label>
            <input
              id="car-capacity-input"
              type="number"
              required
              min="1"
              max="200"
              step="any"
              value={fuelCapacity}
              onChange={(e) => setFuelCapacity(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 mr-1">
              {t.currentOdo} <span className="text-[10px] text-emerald-400 font-normal">({isMetric ? 'km' : 'mi'})</span> *
            </label>
            <input
              id="car-odometer-input"
              type="number"
              required
              min="0"
              placeholder={isMetric ? "e.g. 45200" : "e.g. 28000"}
              value={currentOdometer}
              onChange={(e) => {
                const val = e.target.value;
                setCurrentOdometer(val === '' ? '' : Number(val));
              }}
              className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-mono outline-none transition-all placeholder:text-slate-600/60"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            id="save-vehicle-btn"
            type="submit"
            className="flex-1 tech-gradient hover:opacity-90 active:scale-95 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-purple-500/20 cursor-pointer transition-all"
          >
            <Save size={18} />
            <span>{t.saveBtn}</span>
          </button>
          {vehicle.brand && (
            <button
              id="cancel-vehicle-edit"
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 py-3 px-4 rounded-xl text-sm font-semibold cursor-pointer transition-all"
            >
              {t.cancelBtn}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
