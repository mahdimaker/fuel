/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FuelType = 'regular' | 'super' | 'diesel' | 'hybrid' | 'gas';

export interface FuelEntry {
  id: string;
  vehicleId?: string; // Links fuel entry to a specific vehicle
  date: string; // ISO date string (YYYY-MM-DD)
  odometer: number; // Current odometer reading in km
  liters: number; // Amount of fuel filled in Liters
  cost: number; // Cost paid
  fuelType: FuelType;
  stationName?: string;
  notes?: string;
  fullTank?: boolean;
  missedRefuel?: boolean;
}

export interface VehicleInfo {
  id?: string;
  brand: string;
  model: string;
  year: string;
  fuelCapacity: number; // Liters
  currentOdometer: number; // km
  bodyType?: 'compact' | 'crossover' | 'suv';
}

export interface HealthMetrics {
  score: number;
  level: 'excellent' | 'good' | 'fair' | 'poor';
  fuelEfficiency: number; // L/100km
  fuelEfficiencyChange: number; // percentage change vs previous
  estimatedRange: number; // estimated km left with current tank
  carbonFootprint: number; // estimated CO2 in kg per km or per month
  statusBreakdown: {
    efficiency: number; // 0-100
    maintenance: number; // 0-100
    costScore: number; // 0-100
    drivingHabit: number; // 0-100
  };
  messages: string[];
  isUnrated?: boolean;
  isEstimated?: boolean;
}

export interface AIReportRequest {
  vehicle: VehicleInfo;
  logs: FuelEntry[];
  userQuery?: string;
}

export interface AIReportResponse {
  success: boolean;
  report?: string; // Markdown formatted report in Persian
  error?: string;
}
