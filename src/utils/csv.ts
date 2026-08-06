/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FuelEntry, FuelType, VehicleInfo } from '../types';

/**
 * Escapes a field for CSV format
 */
function escapeCSVField(field: any): string {
  if (field === null || field === undefined) return '""';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports logs array as a UTF-8 CSV file with BOM for Excel compatibility
 * Now includes vehicle metadata (brand, model, year, capacity) for full data preservation.
 */
export function exportLogsToCSV(logs: FuelEntry[], vehicles: VehicleInfo[] = []) {
  if (!logs || logs.length === 0) return;

  const headers = [
    'id',
    'vehicleId',
    'vehicleBrand',
    'vehicleModel',
    'vehicleYear',
    'fuelCapacity',
    'date',
    'odometer',
    'liters',
    'cost',
    'fuelType',
    'fullTank',
    'stationName',
    'missedRefuel',
    'notes',
  ];

  const rows = logs.map((log) => {
    const v = vehicles.find((veh) => veh.id === log.vehicleId) || vehicles[0];
    return [
      escapeCSVField(log.id),
      escapeCSVField(log.vehicleId || v?.id || 'veh-1'),
      escapeCSVField(v?.brand || ''),
      escapeCSVField(v?.model || ''),
      escapeCSVField(v?.year || '2026'),
      v?.fuelCapacity || 50,
      escapeCSVField(log.date),
      log.odometer,
      log.liters,
      log.cost,
      escapeCSVField(log.fuelType || 'regular'),
      log.fullTank !== false ? 'true' : 'false',
      escapeCSVField(log.stationName || ''),
      log.missedRefuel ? 'true' : 'false',
      escapeCSVField(log.notes || ''),
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  // Add UTF-8 BOM (\uFEFF) to ensure Persian text is properly rendered in Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const dateStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `fuel_logs_backup_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses a single CSV line accounting for quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export interface CSVImportResult {
  success: boolean;
  importedLogs: FuelEntry[];
  importedVehicles: VehicleInfo[];
  newCount: number;
  duplicateCount: number;
  error?: string;
}

/**
 * Parses raw CSV or JSON string and returns validated FuelEntry array and reconstructed VehicleInfo array
 */
export function importLogsFromCSV(
  csvText: string,
  existingLogs: FuelEntry[],
  existingVehicles: VehicleInfo[] = []
): CSVImportResult {
  try {
    // Strip BOM if present
    const cleanText = csvText.replace(/^\uFEFF/, '').trim();
    if (!cleanText) {
      return { success: false, importedLogs: existingLogs, importedVehicles: [], newCount: 0, duplicateCount: 0, error: 'File is empty.' };
    }

    // Try JSON format first if text starts with '{' or '['
    if (cleanText.startsWith('{') || cleanText.startsWith('[')) {
      try {
        const json = JSON.parse(cleanText);
        let rawLogs: any[] = [];
        let rawVehicles: VehicleInfo[] = [];

        if (Array.isArray(json)) {
          rawLogs = json;
        } else if (json && typeof json === 'object') {
          if (Array.isArray(json.logs)) rawLogs = json.logs;
          if (Array.isArray(json.vehicles)) rawVehicles = json.vehicles;
        }

        if (rawLogs.length > 0) {
          const existingIds = new Set(existingLogs.map((l) => l.id));
          const existingSigs = new Set(existingLogs.map((l) => `${l.date}_${l.odometer}`));
          const newLogs: FuelEntry[] = [];
          let duplicates = 0;

          for (const l of rawLogs) {
            if (!l.date || !l.odometer || !l.liters || !l.cost) continue;
            const sig = `${l.date}_${l.odometer}`;
            if (existingIds.has(l.id) || existingSigs.has(sig)) {
              duplicates++;
              continue;
            }
            newLogs.push(l as FuelEntry);
            existingIds.add(l.id);
            existingSigs.add(sig);
          }

          const combined = [...existingLogs, ...newLogs].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          return {
            success: true,
            importedLogs: combined,
            importedVehicles: rawVehicles,
            newCount: newLogs.length,
            duplicateCount: duplicates,
          };
        }
      } catch (jsonErr) {
        // Fall back to CSV parsing if JSON parse failed
      }
    }

    // Split lines cleanly handling \r\n and \n
    const lines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return { success: false, importedLogs: existingLogs, importedVehicles: [], newCount: 0, duplicateCount: 0, error: 'CSV file does not contain enough data.' };
    }

    const rawHeaders = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());

    // Map column indices dynamically
    const getIndex = (...keys: string[]) => {
      return rawHeaders.findIndex((h) => keys.some((k) => h === k.toLowerCase() || h.includes(k.toLowerCase())));
    };

    const idIdx = getIndex('id');
    const dateIdx = getIndex('date');
    const odoIdx = getIndex('odometer', 'km', 'odo');
    const litersIdx = getIndex('liters', 'volume', 'lit');
    const costIdx = getIndex('cost', 'price');
    const fuelTypeIdx = getIndex('fueltype', 'fuel');
    const fullTankIdx = getIndex('fulltank', 'full');
    const stationIdx = getIndex('stationname', 'station');
    const missedIdx = getIndex('missedrefuel');
    const notesIdx = getIndex('notes', 'note');

    // Vehicle specific columns
    const vehIdIdx = getIndex('vehicleid');
    const vehBrandIdx = getIndex('vehiclebrand', 'brand', 'carbrand', 'make');
    const vehModelIdx = getIndex('vehiclemodel', 'model', 'carmodel');
    const vehYearIdx = getIndex('vehicleyear', 'year');
    const vehCapIdx = getIndex('fuelcapacity', 'capacity', 'tank');
    const comboVehIdx = getIndex('vehicle', 'car', 'auto');

    if (dateIdx === -1 || odoIdx === -1 || litersIdx === -1 || costIdx === -1) {
      return {
        success: false,
        importedLogs: existingLogs,
        importedVehicles: [],
        newCount: 0,
        duplicateCount: 0,
        error: 'Required columns (Date, Odometer, Liters, Cost) were not found in CSV.',
      };
    }

    const existingIds = new Set(existingLogs.map((l) => l.id));
    const existingSignatures = new Set(existingLogs.map((l) => `${l.date}_${l.odometer}`));

    const newLogs: FuelEntry[] = [];
    const importedVehiclesMap = new Map<string, VehicleInfo>();
    let duplicateCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      if (row.length === 0 || row.every((c) => c === '')) continue;

      const rawDate = row[dateIdx] || '';
      const rawOdo = parseFloat(row[odoIdx] || '0');
      const rawLiters = parseFloat(row[litersIdx] || '0');
      const rawCost = parseFloat(row[costIdx] || '0');

      if (!rawDate || isNaN(rawOdo) || isNaN(rawLiters) || isNaN(rawCost) || rawOdo <= 0) {
        continue; // skip invalid row
      }

      // Check signature duplicate (date + odometer) or ID duplicate
      const signature = `${rawDate}_${rawOdo}`;
      const rawId = idIdx !== -1 && row[idIdx] ? row[idIdx] : null;

      if ((rawId && existingIds.has(rawId)) || existingSignatures.has(signature)) {
        duplicateCount++;
        continue;
      }

      // Handle Vehicle parsing per row
      let rowVehId = vehIdIdx !== -1 ? row[vehIdIdx] : null;
      let rowBrand = vehBrandIdx !== -1 ? row[vehBrandIdx] : '';
      let rowModel = vehModelIdx !== -1 ? row[vehModelIdx] : '';
      let rowYear = vehYearIdx !== -1 ? row[vehYearIdx] : '';
      let rowCap = vehCapIdx !== -1 ? parseFloat(row[vehCapIdx] || '50') : 50;

      if (!rowBrand && comboVehIdx !== -1 && row[comboVehIdx]) {
        const parts = row[comboVehIdx].trim().split(/\s+/);
        rowBrand = parts[0] || 'Imported Vehicle';
        rowModel = parts.slice(1).join(' ');
      }

      let assignedVehicleId = rowVehId;

      if (rowBrand || rowModel || rowVehId) {
        const vehKey = rowVehId || `${rowBrand.toLowerCase().trim()}_${rowModel.toLowerCase().trim()}`;
        
        // Check if existing vehicles matches this
        const existingVehMatch = existingVehicles.find(
          (v) => (rowVehId && v.id === rowVehId) || 
                 (rowBrand && v.brand.toLowerCase().trim() === rowBrand.toLowerCase().trim() &&
                  (!rowModel || v.model.toLowerCase().trim() === rowModel.toLowerCase().trim()))
        );

        if (existingVehMatch) {
          assignedVehicleId = existingVehMatch.id!;
        } else {
          let vehObj = importedVehiclesMap.get(vehKey);
          if (!vehObj) {
            vehObj = {
              id: rowVehId || `veh-imported-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              brand: rowBrand || 'Imported Vehicle',
              model: rowModel || '',
              year: rowYear || '2026',
              fuelCapacity: !isNaN(rowCap) && rowCap > 0 ? rowCap : 50,
              currentOdometer: rawOdo,
            };
            importedVehiclesMap.set(vehKey, vehObj);
          } else {
            if (rawOdo > vehObj.currentOdometer) {
              vehObj.currentOdometer = rawOdo;
            }
          }
          assignedVehicleId = vehObj.id!;
        }
      } else {
        // No vehicle specified in row - fallback to first existing vehicle or create a default imported vehicle
        const validExistingVeh = existingVehicles.find((v) => v.brand && v.brand.trim() !== '');
        if (validExistingVeh) {
          assignedVehicleId = validExistingVeh.id!;
        } else {
          const defaultKey = 'default_imported_veh';
          let defaultVeh = importedVehiclesMap.get(defaultKey);
          if (!defaultVeh) {
            defaultVeh = {
              id: `veh-imported-${Date.now()}`,
              brand: 'Imported Vehicle',
              model: 'Main',
              year: '2026',
              fuelCapacity: 50,
              currentOdometer: rawOdo,
            };
            importedVehiclesMap.set(defaultKey, defaultVeh);
          } else {
            if (rawOdo > defaultVeh.currentOdometer) {
              defaultVeh.currentOdometer = rawOdo;
            }
          }
          assignedVehicleId = defaultVeh.id!;
        }
      }

      let fuelType: FuelType = 'regular';
      if (fuelTypeIdx !== -1 && row[fuelTypeIdx]) {
        const ft = row[fuelTypeIdx].toLowerCase();
        if (ft.includes('super') || ft.includes('premium')) fuelType = 'super';
        else if (ft.includes('diesel')) fuelType = 'diesel';
        else if (ft.includes('hybrid')) fuelType = 'hybrid';
        else if (ft.includes('gas') || ft.includes('cng') || ft.includes('lpg')) fuelType = 'gas';
      }

      const rawFullTank = fullTankIdx !== -1 ? row[fullTankIdx] : 'true';
      const fullTank = rawFullTank.toLowerCase() !== 'false' && rawFullTank !== '0' && rawFullTank.toLowerCase() !== 'no';

      const rawMissed = missedIdx !== -1 ? row[missedIdx] : 'false';
      const missedRefuel = rawMissed.toLowerCase() === 'true' || rawMissed === '1' || rawMissed.toLowerCase() === 'yes';

      const entryId = rawId || `imported-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const newEntry: FuelEntry = {
        id: entryId,
        vehicleId: assignedVehicleId,
        date: rawDate,
        odometer: rawOdo,
        liters: rawLiters,
        cost: rawCost,
        fuelType,
        fullTank,
        stationName: stationIdx !== -1 ? row[stationIdx] || undefined : undefined,
        missedRefuel,
        notes: notesIdx !== -1 ? row[notesIdx] || undefined : undefined,
      };

      newLogs.push(newEntry);
      existingIds.add(newEntry.id);
      existingSignatures.add(signature);
    }

    const importedVehicles = Array.from(importedVehiclesMap.values());

    if (newLogs.length === 0) {
      return {
        success: true,
        importedLogs: existingLogs,
        importedVehicles,
        newCount: 0,
        duplicateCount,
        error: duplicateCount > 0 ? 'All records in this file already exist in the system.' : 'No valid records found in the CSV file.',
      };
    }

    const combined = [...existingLogs, ...newLogs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      success: true,
      importedLogs: combined,
      importedVehicles,
      newCount: newLogs.length,
      duplicateCount,
    };
  } catch (err: any) {
    return {
      success: false,
      importedLogs: existingLogs,
      importedVehicles: [],
      newCount: 0,
      duplicateCount: 0,
      error: err?.message || 'Error reading CSV file',
    };
  }
}

