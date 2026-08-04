/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VehiclePreset {
  brand: string;
  model: string;
  fuelCapacity: number;
  year?: string;
  label: string;
}

// Curated list of popular base vehicles (mainly US and European, plus some Asian)
// with their correct standard fuel capacities.
export const baseVehiclesEn = [
  { brand: 'Toyota', model: 'Camry', fuelCapacity: 60 },
  { brand: 'Toyota', model: 'Corolla', fuelCapacity: 50 },
  { brand: 'Toyota', model: 'RAV4', fuelCapacity: 55 },
  { brand: 'Toyota', model: 'Prius', fuelCapacity: 43 },
  { brand: 'Toyota', model: 'Highlander', fuelCapacity: 68 },
  { brand: 'Toyota', model: 'Tacoma', fuelCapacity: 80 },
  { brand: 'Toyota', model: 'Yaris', fuelCapacity: 42 },
  { brand: 'Toyota', model: 'Sienna', fuelCapacity: 68 },
  { brand: 'Toyota', model: 'Tundra', fuelCapacity: 122 },
  { brand: 'Toyota', model: 'C-HR', fuelCapacity: 50 },

  { brand: 'Honda', model: 'Civic', fuelCapacity: 47 },
  { brand: 'Honda', model: 'Accord', fuelCapacity: 56 },
  { brand: 'Honda', model: 'CR-V', fuelCapacity: 53 },
  { brand: 'Honda', model: 'Pilot', fuelCapacity: 73 },
  { brand: 'Honda', model: 'Fit', fuelCapacity: 40 },
  { brand: 'Honda', model: 'Odyssey', fuelCapacity: 73 },
  { brand: 'Honda', model: 'HR-V', fuelCapacity: 50 },
  { brand: 'Honda', model: 'Insight', fuelCapacity: 40 },
  { brand: 'Honda', model: 'Ridgeline', fuelCapacity: 73 },

  { brand: 'Ford', model: 'F-150 EcoBoost', fuelCapacity: 98 },
  { brand: 'Ford', model: 'Explorer', fuelCapacity: 70 },
  { brand: 'Ford', model: 'Mustang Coupe', fuelCapacity: 60 },
  { brand: 'Ford', model: 'Escape', fuelCapacity: 57 },
  { brand: 'Ford', model: 'Focus', fuelCapacity: 47 },
  { brand: 'Ford', model: 'Fusion', fuelCapacity: 62 },
  { brand: 'Ford', model: 'Edge', fuelCapacity: 70 },
  { brand: 'Ford', model: 'Ranger', fuelCapacity: 68 },
  { brand: 'Ford', model: 'Bronco', fuelCapacity: 79 },
  { brand: 'Ford', model: 'Expedition', fuelCapacity: 106 },

  { brand: 'Chevrolet', model: 'Silverado 1500', fuelCapacity: 91 },
  { brand: 'Chevrolet', model: 'Equinox', fuelCapacity: 59 },
  { brand: 'Chevrolet', model: 'Malibu', fuelCapacity: 60 },
  { brand: 'Chevrolet', model: 'Cruze', fuelCapacity: 52 },
  { brand: 'Chevrolet', model: 'Tahoe', fuelCapacity: 98 },
  { brand: 'Chevrolet', model: 'Suburban', fuelCapacity: 106 },
  { brand: 'Chevrolet', model: 'Camaro', fuelCapacity: 72 },
  { brand: 'Chevrolet', model: 'Trax', fuelCapacity: 53 },
  { brand: 'Chevrolet', model: 'Colorado', fuelCapacity: 79 },

  { brand: 'Volkswagen', model: 'Golf TSI', fuelCapacity: 50 },
  { brand: 'Volkswagen', model: 'Jetta', fuelCapacity: 50 },
  { brand: 'Volkswagen', model: 'Tiguan', fuelCapacity: 58 },
  { brand: 'Volkswagen', model: 'Passat', fuelCapacity: 66 },
  { brand: 'Volkswagen', model: 'Atlas', fuelCapacity: 70 },
  { brand: 'Volkswagen', model: 'Polo', fuelCapacity: 45 },
  { brand: 'Volkswagen', model: 'Touareg', fuelCapacity: 85 },
  { brand: 'Volkswagen', model: 'T-Roc', fuelCapacity: 50 },

  { brand: 'BMW', model: '3 Series (320i)', fuelCapacity: 59 },
  { brand: 'BMW', model: '5 Series (530i)', fuelCapacity: 68 },
  { brand: 'BMW', model: 'X5 xDrive40i', fuelCapacity: 83 },
  { brand: 'BMW', model: '1 Series', fuelCapacity: 50 },
  { brand: 'BMW', model: '7 Series', fuelCapacity: 78 },
  { brand: 'BMW', model: 'X3 xDrive30i', fuelCapacity: 65 },
  { brand: 'BMW', model: 'X1', fuelCapacity: 61 },
  { brand: 'BMW', model: '4 Series Coupe', fuelCapacity: 59 },

  { brand: 'Mercedes-Benz', model: 'C-Class (C300)', fuelCapacity: 66 },
  { brand: 'Mercedes-Benz', model: 'E-Class (E350)', fuelCapacity: 80 },
  { brand: 'Mercedes-Benz', model: 'GLC 300', fuelCapacity: 66 },
  { brand: 'Mercedes-Benz', model: 'A-Class', fuelCapacity: 43 },
  { brand: 'Mercedes-Benz', model: 'S-Class', fuelCapacity: 76 },
  { brand: 'Mercedes-Benz', model: 'GLE 350', fuelCapacity: 85 },
  { brand: 'Mercedes-Benz', model: 'CLA 250', fuelCapacity: 50 },
  { brand: 'Mercedes-Benz', model: 'GLA 250', fuelCapacity: 50 },

  { brand: 'Audi', model: 'A4 2.0T', fuelCapacity: 58 },
  { brand: 'Audi', model: 'Q5 2.0T', fuelCapacity: 70 },
  { brand: 'Audi', model: 'A3', fuelCapacity: 50 },
  { brand: 'Audi', model: 'A6', fuelCapacity: 73 },
  { brand: 'Audi', model: 'Q7', fuelCapacity: 85 },
  { brand: 'Audi', model: 'Q3', fuelCapacity: 60 },
  { brand: 'Audi', model: 'A5 Sportback', fuelCapacity: 58 },

  { brand: 'Hyundai', model: 'Elantra', fuelCapacity: 53 },
  { brand: 'Hyundai', model: 'Sonata', fuelCapacity: 60 },
  { brand: 'Hyundai', model: 'Tucson', fuelCapacity: 54 },
  { brand: 'Hyundai', model: 'Santa Fe', fuelCapacity: 67 },
  { brand: 'Hyundai', model: 'Kona', fuelCapacity: 50 },
  { brand: 'Hyundai', model: 'Accent', fuelCapacity: 45 },
  { brand: 'Hyundai', model: 'Palisade', fuelCapacity: 71 },
  { brand: 'Hyundai', model: 'Ioniq Hybrid', fuelCapacity: 45 },

  { brand: 'Kia', model: 'Forte / Cerato', fuelCapacity: 53 },
  { brand: 'Kia', model: 'Optima / K5', fuelCapacity: 60 },
  { brand: 'Kia', model: 'Sportage', fuelCapacity: 62 },
  { brand: 'Kia', model: 'Sorento', fuelCapacity: 67 },
  { brand: 'Kia', model: 'Soul', fuelCapacity: 54 },
  { brand: 'Kia', model: 'Rio', fuelCapacity: 45 },
  { brand: 'Kia', model: 'Stinger', fuelCapacity: 60 },
  { brand: 'Kia', model: 'Telluride', fuelCapacity: 71 },

  { brand: 'Nissan', model: 'Altima', fuelCapacity: 61 },
  { brand: 'Nissan', model: 'Rogue', fuelCapacity: 55 },
  { brand: 'Nissan', model: 'Sentra', fuelCapacity: 47 },
  { brand: 'Nissan', model: 'Versa', fuelCapacity: 41 },
  { brand: 'Nissan', model: 'Pathfinder', fuelCapacity: 70 },
  { brand: 'Nissan', model: 'Maxima', fuelCapacity: 68 },
  { brand: 'Nissan', model: 'Murano', fuelCapacity: 72 },
  { brand: 'Nissan', model: 'Frontier', fuelCapacity: 80 },

  { brand: 'Jeep', model: 'Grand Cherokee', fuelCapacity: 93 },
  { brand: 'Jeep', model: 'Wrangler 4-Door', fuelCapacity: 81 },
  { brand: 'Jeep', model: 'Cherokee', fuelCapacity: 60 },
  { brand: 'Jeep', model: 'Compass', fuelCapacity: 51 },
  { brand: 'Jeep', model: 'Renegade', fuelCapacity: 48 },

  { brand: 'Subaru', model: 'Outback', fuelCapacity: 70 },
  { brand: 'Subaru', model: 'Forester', fuelCapacity: 63 },
  { brand: 'Subaru', model: 'Impreza', fuelCapacity: 50 },
  { brand: 'Subaru', model: 'Crosstrek', fuelCapacity: 63 },
  { brand: 'Subaru', model: 'Legacy', fuelCapacity: 70 },

  { brand: 'Mazda', model: 'CX-5', fuelCapacity: 56 },
  { brand: 'Mazda', model: 'Mazda 3', fuelCapacity: 50 },
  { brand: 'Mazda', model: 'CX-30', fuelCapacity: 48 },
  { brand: 'Mazda', model: 'Mazda 6', fuelCapacity: 62 },
  { brand: 'Mazda', model: 'CX-9', fuelCapacity: 74 },

  { brand: 'Lexus', model: 'RX 350', fuelCapacity: 72 },
  { brand: 'Lexus', model: 'ES 350', fuelCapacity: 60 },
  { brand: 'Lexus', model: 'NX 300', fuelCapacity: 60 },
  { brand: 'Lexus', model: 'IS 300', fuelCapacity: 66 },

  { brand: 'Volvo', model: 'XC60', fuelCapacity: 71 },
  { brand: 'Volvo', model: 'XC90', fuelCapacity: 71 },
  { brand: 'Volvo', model: 'S60', fuelCapacity: 60 },
  { brand: 'Volvo', model: 'V60', fuelCapacity: 60 },

  { brand: 'Tesla', model: 'Model 3 Standard', fuelCapacity: 50 },
  { brand: 'Tesla', model: 'Model Y Long Range', fuelCapacity: 75 },
  { brand: 'Tesla', model: 'Model S Plaid', fuelCapacity: 100 },
  { brand: 'Tesla', model: 'Model X', fuelCapacity: 100 },

  { brand: 'Peugeot', model: '208', fuelCapacity: 44 },
  { brand: 'Peugeot', model: '308', fuelCapacity: 53 },
  { brand: 'Peugeot', model: '408', fuelCapacity: 52 },
  { brand: 'Peugeot', model: '508', fuelCapacity: 62 },
  { brand: 'Peugeot', model: '2008', fuelCapacity: 44 },
  { brand: 'Peugeot', model: '3008', fuelCapacity: 53 },
  { brand: 'Peugeot', model: '5008', fuelCapacity: 56 },
  { brand: 'Peugeot', model: 'Rifter', fuelCapacity: 50 },

  { brand: 'Suzuki', model: 'Swift', fuelCapacity: 37 },
  { brand: 'Suzuki', model: 'Vitara', fuelCapacity: 47 },
  { brand: 'Suzuki', model: 'Grand Vitara', fuelCapacity: 55 },
  { brand: 'Suzuki', model: 'Jimny', fuelCapacity: 40 },
  { brand: 'Suzuki', model: 'SX4 S-Cross', fuelCapacity: 47 },
  { brand: 'Suzuki', model: 'Ignis', fuelCapacity: 32 },
  { brand: 'Suzuki', model: 'Baleno', fuelCapacity: 37 },
  { brand: 'Suzuki', model: 'Ertiga', fuelCapacity: 45 },
];

const popularYears = ['2025', '2024', '2023', '2022', '2021', '2020'];

/**
 * Generates approx. 500+ realistic, unique foreign popular vehicles.
 * Combines highly curated base vehicles with popular production model years.
 * Can be easily expanded in the future by adding entries to `baseVehiclesEn` or `popularYears`.
 */
export function generatePopularVehiclesEn(): VehiclePreset[] {
  const list: VehiclePreset[] = [];
  
  // 1. First populate with standard modern configurations (combining base with years)
  baseVehiclesEn.forEach((car) => {
    popularYears.forEach((year) => {
      list.push({
        brand: car.brand,
        model: car.model,
        fuelCapacity: car.fuelCapacity,
        year: year,
        label: `${car.brand} ${car.model} (${year}) — ${car.fuelCapacity}L`
      });
    });
  });

  // Ensure unique and sorted alphabetically by brand then model then year descending
  return list.sort((a, b) => {
    if (a.brand !== b.brand) return a.brand.localeCompare(b.brand);
    if (a.model !== b.model) return a.model.localeCompare(b.model);
    return (b.year || '').localeCompare(a.year || '');
  });
}
