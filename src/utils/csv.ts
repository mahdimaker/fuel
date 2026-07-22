/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FuelEntry, FuelType } from '../types';

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
 */
export function exportLogsToCSV(logs: FuelEntry[]) {
  if (!logs || logs.length === 0) return;

  const headers = [
    'id',
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

  const rows = logs.map((log) => [
    escapeCSVField(log.id),
    escapeCSVField(log.date),
    log.odometer,
    log.liters,
    log.cost,
    escapeCSVField(log.fuelType || 'regular'),
    log.fullTank !== false ? 'true' : 'false',
    escapeCSVField(log.stationName || ''),
    log.missedRefuel ? 'true' : 'false',
    escapeCSVField(log.notes || ''),
  ]);

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
  newCount: number;
  duplicateCount: number;
  error?: string;
}

/**
 * Parses raw CSV string and returns validated FuelEntry array
 */
export function importLogsFromCSV(csvText: string, existingLogs: FuelEntry[]): CSVImportResult {
  try {
    // Strip BOM if present
    const cleanText = csvText.replace(/^\uFEFF/, '').trim();
    if (!cleanText) {
      return { success: false, importedLogs: existingLogs, newCount: 0, duplicateCount: 0, error: 'فایل CSV خالی است.' };
    }

    // Split lines cleanly handling \r\n and \n
    const lines = cleanText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) {
      return { success: false, importedLogs: existingLogs, newCount: 0, duplicateCount: 0, error: 'فایل CSV شامل داده‌های کافی نیست.' };
    }

    const rawHeaders = parseCSVLine(lines[0]).map((h) => h.toLowerCase().trim());

    // Map column indices dynamically
    const getIndex = (...keys: string[]) => {
      return rawHeaders.findIndex((h) => keys.some((k) => h === k.toLowerCase() || h.includes(k.toLowerCase())));
    };

    const idIdx = getIndex('id', 'آیدی');
    const dateIdx = getIndex('date', 'تاریخ');
    const odoIdx = getIndex('odometer', 'کیلومتر', 'کارکرد', 'km', 'odo');
    const litersIdx = getIndex('liters', 'لیتر', 'حجم', 'volume', 'lit');
    const costIdx = getIndex('cost', 'مبلغ', 'هزینه', 'قیمت', 'price');
    const fuelTypeIdx = getIndex('fueltype', 'نوع سوخت', 'سوخت', 'fuel');
    const fullTankIdx = getIndex('fulltank', 'باک کامل', 'پر');
    const stationIdx = getIndex('stationname', 'جایگاه', 'پمپ بنزین', 'station');
    const missedIdx = getIndex('missedrefuel', 'جاماندگی');
    const notesIdx = getIndex('notes', 'یادداشت', 'توضیحات', 'note');

    if (dateIdx === -1 || odoIdx === -1 || litersIdx === -1 || costIdx === -1) {
      return {
        success: false,
        importedLogs: existingLogs,
        newCount: 0,
        duplicateCount: 0,
        error: 'ستون‌های اصلی (تاریخ، کیلومتر، لیتر، هزینه) در فایل پیدا نشدند.',
      };
    }

    const existingIds = new Set(existingLogs.map((l) => l.id));
    const existingSignatures = new Set(existingLogs.map((l) => `${l.date}_${l.odometer}`));

    const newLogs: FuelEntry[] = [];
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

      let fuelType: FuelType = 'regular';
      if (fuelTypeIdx !== -1 && row[fuelTypeIdx]) {
        const ft = row[fuelTypeIdx].toLowerCase();
        if (ft.includes('super') || ft.includes('سوپر')) fuelType = 'super';
        else if (ft.includes('diesel') || ft.includes('دیزل')) fuelType = 'diesel';
        else if (ft.includes('hybrid') || ft.includes('هیبرید')) fuelType = 'hybrid';
        else if (ft.includes('gas') || ft.includes('گاز') || ft.includes('cng') || ft.includes('lpg')) fuelType = 'gas';
      }

      const rawFullTank = fullTankIdx !== -1 ? row[fullTankIdx] : 'true';
      const fullTank = rawFullTank.toLowerCase() !== 'false' && rawFullTank !== '0' && rawFullTank.toLowerCase() !== 'no';

      const rawMissed = missedIdx !== -1 ? row[missedIdx] : 'false';
      const missedRefuel = rawMissed.toLowerCase() === 'true' || rawMissed === '1' || rawMissed.toLowerCase() === 'yes' || rawMissed.toLowerCase() === 'بله';

      const entryId = rawId || `imported-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const newEntry: FuelEntry = {
        id: entryId,
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

    if (newLogs.length === 0) {
      return {
        success: true,
        importedLogs: existingLogs,
        newCount: 0,
        duplicateCount,
        error: duplicateCount > 0 ? 'تمام رکوردهای این فایل قبلاً در سیستم وجود داشته‌اند.' : 'هیچ رکورد معتبری در فایل پیدا نشد.',
      };
    }

    const combined = [...existingLogs, ...newLogs].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      success: true,
      importedLogs: combined,
      newCount: newLogs.length,
      duplicateCount,
    };
  } catch (err: any) {
    return {
      success: false,
      importedLogs: existingLogs,
      newCount: 0,
      duplicateCount: 0,
      error: err?.message || 'خطا در خوندن فایل CSV',
    };
  }
}
