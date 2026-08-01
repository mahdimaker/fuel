/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Car, Fuel, Calendar, Gauge, Plus, CheckCircle2, Trash2, Check, Grid, Layers, Pencil } from 'lucide-react';
import { VehicleInfo, HealthMetrics, FuelEntry } from '../types';
import { Language } from '../utils/translations';
import { baseVehiclesEn } from '../utils/popularVehicles';

interface VehiclesProps {
  vehicles: VehicleInfo[];
  activeVehicleId: string;
  onSelectVehicle: (id: string) => void;
  onAddVehicle: (info: Omit<VehicleInfo, 'id'>) => void;
  onUpdateVehicle: (info: VehicleInfo) => void;
  onDeleteVehicle: (id: string) => void;
  healthMetrics: HealthMetrics;
  logs: FuelEntry[];
  lang: Language;
  unitSystem: 'metric' | 'us' | 'uk';
  onUnitSystemChange?: (sys: 'metric' | 'us' | 'uk') => void;
}

export default function Vehicles({
  vehicles,
  activeVehicleId,
  onSelectVehicle,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  healthMetrics,
  logs,
  lang,
  unitSystem,
  onUnitSystemChange,
}: VehiclesProps) {
  const isMetric = unitSystem === 'metric';
  const isUs = unitSystem === 'us';
  const KM_TO_MILES = 0.621371;
  const LITERS_TO_GALLONS = 0.264172;

  const [showAddForm, setShowAddForm] = useState<boolean>(() => vehicles.length === 0);

  useEffect(() => {
    if (vehicles.length === 0) {
      setShowAddForm(true);
    }
  }, [vehicles.length]);
  const [newBrand, setNewBrand] = useState<string>('');
  const [newModel, setNewModel] = useState<string>('');
  const [newYear, setNewYear] = useState<string>('2026');
  const [newCapacity, setNewCapacity] = useState<number>(50);
  const [newOdometer, setNewOdometer] = useState<number | ''>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');

  // Editing state
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [editBrand, setEditBrand] = useState<string>('');
  const [editModel, setEditModel] = useState<string>('');
  const [editYear, setEditYear] = useState<string>('');
  const [editCapacity, setEditCapacity] = useState<number>(50);
  const [editOdometer, setEditOdometer] = useState<number | ''>('');

  // Extract unique brands for preset dropdown
  const uniqueBrands = Array.from(new Set(baseVehiclesEn.map(v => v.brand))).sort();
  const availableModels = selectedBrand && selectedBrand !== 'custom'
    ? baseVehiclesEn.filter(v => v.brand === selectedBrand).map(v => v.model).sort()
    : [];

  // Automatically update capacity when unit system or selected preset changes
  useEffect(() => {
    if (selectedBrand && selectedModel && selectedModel !== 'custom') {
      const match = baseVehiclesEn.find(v => v.brand === selectedBrand && v.model === selectedModel);
      if (match) {
        setNewCapacity(isUs ? Number((match.fuelCapacity * LITERS_TO_GALLONS).toFixed(1)) : match.fuelCapacity);
      }
    } else {
      setNewCapacity(prev => {
        if (isUs && prev > 35) {
          return Number((prev * LITERS_TO_GALLONS).toFixed(1));
        } else if (!isUs && prev < 35 && prev > 0) {
          return Math.round(prev / LITERS_TO_GALLONS);
        }
        return prev;
      });
    }
  }, [unitSystem, isUs, selectedBrand, selectedModel]);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const b = e.target.value;
    setSelectedBrand(b);
    setSelectedModel('');
    if (b && b !== 'custom') {
      setNewBrand(b);
      setNewModel('');
    } else {
      setNewBrand('');
      setNewModel('');
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const m = e.target.value;
    setSelectedModel(m);
    if (m && m !== 'custom') {
      setNewModel(m);
      const match = baseVehiclesEn.find(v => v.brand === selectedBrand && v.model === m);
      if (match) {
        setNewCapacity(isUs ? Number((match.fuelCapacity * LITERS_TO_GALLONS).toFixed(1)) : match.fuelCapacity);
      }
    } else {
      setNewModel('');
    }
  };

  const handleCreateVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrand || !newModel) return;

    const capacityInLiters = isUs ? Number(newCapacity) / LITERS_TO_GALLONS : Number(newCapacity);
    const odoInKm = isMetric ? (Number(newOdometer) || 0) : (Number(newOdometer) || 0) / KM_TO_MILES;

    onAddVehicle({
      brand: newBrand,
      model: newModel,
      year: newYear || '2026',
      fuelCapacity: Number(capacityInLiters),
      currentOdometer: Number(odoInKm) || 0
    });

    // Reset Form
    setNewBrand('');
    setNewModel('');
    setNewYear('2026');
    setNewCapacity(50);
    setNewOdometer('');
    setSelectedBrand('');
    setSelectedModel('');
    setShowAddForm(false);
  };

  const handleStartEdit = (v: VehicleInfo) => {
    setEditingVehicleId(v.id || null);
    setEditBrand(v.brand);
    setEditModel(v.model);
    setEditYear(v.year || '2026');
    setEditCapacity(isUs ? Number((v.fuelCapacity * LITERS_TO_GALLONS).toFixed(1)) : v.fuelCapacity);
    setEditOdometer(isMetric ? Math.round(v.currentOdometer) : Math.round(v.currentOdometer * KM_TO_MILES));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVehicleId || !editBrand || !editModel) return;

    const capacityInLiters = isUs ? Number(editCapacity) / LITERS_TO_GALLONS : Number(editCapacity);
    const odoInKm = isMetric ? (Number(editOdometer) || 0) : (Number(editOdometer) || 0) / KM_TO_MILES;

    onUpdateVehicle({
      id: editingVehicleId,
      brand: editBrand,
      model: editModel,
      year: editYear || '2026',
      fuelCapacity: Number(capacityInLiters),
      currentOdometer: Number(odoInKm) || 0,
    });

    setEditingVehicleId(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* =========================================================================
          ROW 1: VEHICLE GARAGE HEADER & REGISTRATION FORM
         ========================================================================= */}
      <div className={`cyber-card p-4 sm:p-5 rounded-2xl relative overflow-hidden border border-purple-500/30 tech-glow-purple transition-all ${showAddForm ? 'space-y-4 pb-4 sm:pb-5' : 'pb-3 sm:pb-3.5'}`}>
        {/* Banner Header */}
        <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${showAddForm ? 'border-b border-slate-900 pb-3.5 sm:pb-4' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-purple-500/20 via-indigo-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-400 shadow-lg">
              <Car size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-white">
                  {lang === 'fa' ? 'گاراژ خودرو' : 'Vehicle Garage'}
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                {lang === 'fa' 
                  ? 'مدیریت و ثبت خودروهای شما در گاراژ هوشمند.' 
                  : 'Manage and register your vehicles in the smart garage.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-purple-300 hover:text-white text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <Plus size={16} />
            <span>{showAddForm ? (lang === 'fa' ? 'پنهان‌سازی فرم ثبت' : 'Hide Registration Form') : (lang === 'fa' ? 'افزودن خودرو جدید' : 'Register New Vehicle')}</span>
          </button>
        </div>

        {/* Registration Form */}
        {showAddForm && (
          <form onSubmit={handleCreateVehicle} className="space-y-4 pt-1 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Grid size={14} className="text-cyan-400 shrink-0" />
                  <span>{lang === 'fa' ? 'انتخاب سریع برند (پیش‌فرض)' : 'Quick Select Brand'}</span>
                </label>
                <select
                  value={selectedBrand}
                  onChange={handleBrandChange}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-100 font-semibold outline-none cursor-pointer transition-all"
                >
                  <option value="" className="bg-slate-900 text-slate-200 text-base sm:text-sm">{lang === 'fa' ? '-- انتخاب برند --' : '-- Select Brand --'}</option>
                  {uniqueBrands.map((b) => (
                    <option key={b} value={b} className="bg-slate-900 text-slate-100 text-base sm:text-sm">{b}</option>
                  ))}
                  <option value="custom" className="bg-slate-900 text-slate-200 text-base sm:text-sm">{lang === 'fa' ? '-- برند دلخواه (دستی) --' : '-- Custom Brand --'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Grid size={14} className="text-purple-400 shrink-0" />
                  <span>{lang === 'fa' ? 'انتخاب مدل (پیش‌فرض)' : 'Select Model'}</span>
                </label>
                <select
                  value={selectedModel}
                  disabled={!selectedBrand || selectedBrand === 'custom'}
                  onChange={handleModelChange}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-slate-100 font-semibold outline-none disabled:opacity-40 cursor-pointer transition-all"
                >
                  <option value="" className="bg-slate-900 text-slate-200 text-base sm:text-sm">{lang === 'fa' ? '-- انتخاب مدل --' : '-- Select Model --'}</option>
                  {availableModels.map((m) => (
                    <option key={m} value={m} className="bg-slate-900 text-slate-100 text-base sm:text-sm">{m}</option>
                  ))}
                  <option value="custom" className="bg-slate-900 text-slate-200 text-base sm:text-sm">{lang === 'fa' ? '-- مدل دلخواه (دستی) --' : '-- Custom Model --'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-300 mb-1">{lang === 'fa' ? 'برند *' : 'Brand *'}</label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'fa' ? 'پژو / تویوتا' : 'Toyota'}
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-base sm:text-sm text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-300 mb-1">{lang === 'fa' ? 'مدل *' : 'Model *'}</label>
                <input
                  type="text"
                  required
                  placeholder={lang === 'fa' ? '۲۰۷ / کمری' : 'Camry'}
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-base sm:text-sm text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-300 mb-1">{lang === 'fa' ? 'سال ساخت' : 'Model Year'}</label>
                <input
                  type="text"
                  placeholder="2026"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-base sm:text-sm text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Gauge size={14} className="text-cyan-400 shrink-0" />
                  <span>{lang === 'fa' ? 'سیستم واحد' : 'Unit System'}</span>
                </label>
                <select
                  value={unitSystem}
                  onChange={(e) => onUnitSystemChange?.(e.target.value as 'metric' | 'us' | 'uk')}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-base sm:text-sm font-semibold text-slate-100 outline-none cursor-pointer"
                >
                  <option value="metric" className="bg-slate-900 text-slate-100 text-base sm:text-sm">{lang === 'fa' ? 'متریک (کیلومتر/لیتر)' : 'Metric (km/L)'}</option>
                  <option value="us" className="bg-slate-900 text-slate-100 text-base sm:text-sm">{lang === 'fa' ? 'آمریکایی (مایل/گالن)' : 'US (mi/gal)'}</option>
                  <option value="uk" className="bg-slate-900 text-slate-100 text-base sm:text-sm">{lang === 'fa' ? 'انگلیسی (مایل/گالن)' : 'UK (mi/gal)'}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {lang === 'fa' ? 'ظرفیت باک' : 'Tank Cap'} ({isUs ? 'gal' : 'L'}) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="200"
                  step="any"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  {lang === 'fa' ? 'کیلومتر کارکرد فعلی' : 'Current Odometer'} ({isMetric ? 'km' : 'mi'}) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder={lang === 'fa' ? 'مثال: ۴۵۰۰۰' : 'e.g. 45000'}
                  value={newOdometer}
                  onChange={(e) => setNewOdometer(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto tech-gradient hover:opacity-90 active:scale-95 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-500/20"
              >
                <Plus size={16} />
                <span>{lang === 'fa' ? 'افزودن و فعال‌سازی خودرو در گاراژ' : 'Register & Activate Vehicle'}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* =========================================================================
          ROW 2: YOUR VEHICLES LIST
         ========================================================================= */}
      <div className="cyber-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-900 pb-3">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-purple-400" />
            <h3 className="text-sm font-bold text-white">
              {lang === 'fa' ? 'خودروهای شما' : 'Your Vehicles'}
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
            {vehicles.length} {lang === 'fa' ? 'خودرو' : 'Vehicle(s)'}
          </span>
        </div>

        {vehicles.length === 0 && (
          <div className="p-8 text-center rounded-2xl bg-slate-950/60 border border-dashed border-purple-500/30 space-y-3 my-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto text-purple-400">
              <Car size={24} />
            </div>
            <h4 className="text-base font-bold text-slate-100">
              {lang === 'fa' ? 'هنوز هیچ خودرویی ثبت نشده است' : 'No vehicles registered yet'}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {lang === 'fa' ? 'لطفاً با استفاده از فرم بالا، اولین خودروی خود را تعریف کنید تا امکان سوخت‌گیری و تحلیل فراهم شود.' : 'Please use the registration form above to define your vehicle.'}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {vehicles.map((v) => {
            const isActive = v.id === activeVehicleId;
            const isEditing = editingVehicleId === v.id;
            const vLogsCount = logs.filter(l => l.vehicleId ? l.vehicleId === v.id : (v.id === vehicles[0]?.id || v.id === 'veh-1')).length;

            return (
              <div
                key={v.id || v.brand + v.model}
                className={`px-3 sm:px-4.5 py-4 sm:py-5 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between w-full ${
                  isActive
                    ? 'bg-slate-900/90 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/60 border-slate-900 hover:border-slate-800'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full pointer-events-none"></div>
                )}

                {isEditing ? (
                  /* INLINE EDITING FORM */
                  <form onSubmit={handleSaveEdit} className="space-y-4 p-1 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-1">
                      <span className="text-sm font-bold text-cyan-400 flex items-center gap-1.5">
                        <Pencil size={15} />
                        {lang === 'fa' ? 'ویرایش مشخصات خودرو' : 'Edit Vehicle Details'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingVehicleId(null)}
                        className="text-slate-400 hover:text-white text-sm px-2 py-0.5"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">{lang === 'fa' ? 'برند' : 'Brand'}</label>
                        <input
                          type="text"
                          required
                          value={editBrand}
                          onChange={(e) => setEditBrand(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">{lang === 'fa' ? 'مدل' : 'Model'}</label>
                        <input
                          type="text"
                          required
                          value={editModel}
                          onChange={(e) => setEditModel(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">{lang === 'fa' ? 'سال' : 'Year'}</label>
                        <input
                          type="text"
                          value={editYear}
                          onChange={(e) => setEditYear(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">{lang === 'fa' ? 'ظرفیت باک' : 'Tank Cap'} ({isUs ? 'gal' : 'L'})</label>
                        <input
                          type="number"
                          required
                          step="any"
                          value={editCapacity}
                          onChange={(e) => setEditCapacity(Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">{lang === 'fa' ? 'کارکرد' : 'Odometer'} ({isMetric ? 'km' : 'mi'})</label>
                        <input
                          type="number"
                          required
                          value={editOdometer}
                          onChange={(e) => setEditOdometer(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm hover:bg-cyan-400 flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Check size={16} />
                        <span>{lang === 'fa' ? 'ذخیره تغییرات' : 'Save Changes'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingVehicleId(null)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-700 cursor-pointer"
                      >
                        {lang === 'fa' ? 'انصراف' : 'Cancel'}
                      </button>
                    </div>
                  </form>
                ) : (
                  /* CARD DISPLAY MODE */
                  <div>
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl border ${isActive ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
                            <Car size={22} />
                          </div>
                          <div>
                            <h4 className="text-base sm:text-lg font-extrabold text-white tracking-wide">
                              {v.brand || (lang === 'fa' ? 'بدون نام' : 'Unnamed')} {v.model}
                            </h4>
                            <span className="text-xs sm:text-sm text-slate-400 font-mono font-medium">
                              {lang === 'fa' ? 'مدل:' : 'Year:'} {v.year || '2026'}
                            </span>
                          </div>
                        </div>

                        {isActive ? (
                          <span className="px-3 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                            <CheckCircle2 size={14} />
                            <span>{lang === 'fa' ? 'فعال' : 'Active'}</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => v.id && onSelectVehicle(v.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 hover:text-cyan-300 text-slate-200 text-xs sm:text-sm font-bold cursor-pointer transition-all"
                          >
                            {lang === 'fa' ? 'انتخاب' : 'Select'}
                          </button>
                        )}
                      </div>

                      <div className="w-full grid grid-cols-3 gap-2 sm:gap-3 my-3.5 text-center">
                        <div className="w-full px-2.5 py-3 sm:px-4 sm:py-3.5 rounded-xl bg-slate-950/90 border border-slate-900/90 flex flex-col justify-center items-center shadow-inner min-w-0">
                          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 tracking-wider uppercase whitespace-nowrap mb-1 block">
                            {lang === 'fa' ? 'ظرفیت باک' : 'TANK CAP'}
                          </span>
                          <span className="font-mono font-bold text-base sm:text-lg text-slate-100 whitespace-nowrap flex items-baseline gap-1">
                            <span>{isUs ? (v.fuelCapacity * LITERS_TO_GALLONS).toFixed(1) : v.fuelCapacity}</span>
                            <span className="text-xs font-normal text-slate-400">{isUs ? 'gal' : 'L'}</span>
                          </span>
                        </div>

                        <div className="w-full px-2.5 py-3 sm:px-4 sm:py-3.5 rounded-xl bg-slate-950/90 border border-slate-900/90 flex flex-col justify-center items-center shadow-inner min-w-0">
                          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 tracking-wider uppercase whitespace-nowrap mb-1 block">
                            {lang === 'fa' ? 'کارکرد' : 'ODOMETER'}
                          </span>
                          <span className="font-mono font-bold text-base sm:text-lg text-emerald-400 whitespace-nowrap flex items-baseline gap-1">
                            <span>{Math.round(isMetric ? v.currentOdometer : v.currentOdometer * KM_TO_MILES).toLocaleString()}</span>
                            <span className="text-xs font-normal text-slate-400">{isMetric ? 'km' : 'mi'}</span>
                          </span>
                        </div>

                        <div className="w-full px-2.5 py-3 sm:px-4 sm:py-3.5 rounded-xl bg-slate-950/90 border border-slate-900/90 flex flex-col justify-center items-center shadow-inner min-w-0">
                          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 tracking-wider uppercase whitespace-nowrap mb-1 block">
                            {lang === 'fa' ? 'ثبت سوخت' : 'FUEL LOGS'}
                          </span>
                          <span className="font-mono font-bold text-base sm:text-lg text-cyan-400 whitespace-nowrap flex items-baseline gap-1">
                            <span>{vLogsCount}</span>
                            <span className="text-xs font-normal text-slate-400">{lang === 'fa' ? 'ثبت' : 'logs'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-900/60 mt-3">
                      <span className="text-xs font-medium text-slate-400">
                        {isActive ? (lang === 'fa' ? 'خودروی فعلی برای سوخت‌گیری و تحلیل‌ها' : 'Currently active for fueling & stats') : (lang === 'fa' ? 'جهت سوئیچ کلیک کنید' : 'Click select to set active')}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(v)}
                          className="px-2.5 py-1.5 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all cursor-pointer flex items-center gap-1.5 text-xs sm:text-sm font-semibold"
                          title={lang === 'fa' ? 'ویرایش خودرو' : 'Edit vehicle'}
                        >
                          <Pencil size={15} />
                          <span>{lang === 'fa' ? 'ویرایش' : 'Edit'}</span>
                        </button>

                        {vehicles.length > 1 && (
                          <button
                            onClick={() => {
                              if (confirm(lang === 'fa' ? `آیا از حذف خودروی ${v.brand} ${v.model} اطمینان دارید؟` : `Delete ${v.brand} ${v.model}?`)) {
                                if (v.id) onDeleteVehicle(v.id);
                              }
                            }}
                            className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                            title={lang === 'fa' ? 'حذف خودرو' : 'Delete vehicle'}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
