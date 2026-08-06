/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { FuelEntry, VehicleInfo } from '../types';
import { Language } from '../utils/translations';
import { exportLogsToCSV, importLogsFromCSV } from '../utils/csv';

interface CSVDataManagementCardProps {
  logs: FuelEntry[];
  vehicles?: VehicleInfo[];
  onImportLogs?: (newLogs: FuelEntry[], newVehicles?: VehicleInfo[]) => void;
  lang?: Language;
}

export default function CSVDataManagementCard({
  logs,
  vehicles = [],
  onImportLogs,
}: CSVDataManagementCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importNotice, setImportNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    exportLogsToCSV(logs, vehicles);
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const result = importLogsFromCSV(text, logs, vehicles);
      if (result.success && (result.newCount > 0 || (result.importedVehicles && result.importedVehicles.length > 0))) {
        if (onImportLogs) {
          onImportLogs(result.importedLogs, result.importedVehicles);
        }
        const vehNames = result.importedVehicles && result.importedVehicles.length > 0
          ? result.importedVehicles.map(v => `${v.brand} ${v.model}`.trim()).filter(Boolean).join(', ')
          : '';
        const vehMsg = vehNames ? ` & Restored vehicle(s): ${vehNames}` : '';
        const msg = `Successfully imported ${result.newCount} record(s)${vehMsg}.${result.duplicateCount > 0 ? ` (${result.duplicateCount} duplicates skipped)` : ''}`;
        setImportNotice({ type: 'success', message: msg });
      } else if (result.success && result.newCount === 0) {
        setImportNotice({
          type: 'error',
          message: result.error || 'No new records imported.',
        });
      } else {
        setImportNotice({
          type: 'error',
          message: result.error || 'Failed to import backup file.',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="csv-data-management-card" className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
      {/* Hidden File Input supporting CSV and JSON */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv,.json"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <FileSpreadsheet size={18} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-200">
              Data Backup & Import
            </h3>
            <p className="text-[11px] text-slate-400">
              Export logs & vehicle profiles to CSV/JSON or import backup data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 ${
              logs.length > 0
                ? 'bg-slate-950 hover:bg-slate-800 border border-cyan-500/30 text-cyan-400 hover:text-cyan-300'
                : 'bg-slate-950/40 border border-slate-900 text-slate-600 cursor-not-allowed'
            }`}
            title="Download CSV Backup (includes vehicles)"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleImportClick}
            className="px-3.5 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            title="Import CSV or JSON Backup File"
          >
            <Upload size={14} />
            <span>Import Data</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {importNotice && (
        <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 animate-fadeIn ${
          importNotice.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
        }`}>
          <span className="flex items-center gap-1.5">
            {importNotice.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            <span>{importNotice.message}</span>
          </span>
          <button onClick={() => setImportNotice(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

