/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

export interface BrandLogoProps {
  brand?: string;
  size?: number;
  className?: string;
  showBadge?: boolean;
}

/**
 * Brand logo path mapping for high quality SVG car logos stored in /public/images/cars/
 */
const BRAND_SVG_MAP: Record<string, string> = {
  toyota: '/images/cars/toyota.svg',
  honda: '/images/cars/honda.svg',
  ford: '/images/cars/ford.svg',
  chevrolet: '/images/cars/chevrolet.svg',
  chevy: '/images/cars/chevrolet.svg',
  volkswagen: '/images/cars/volkswagen.svg',
  vw: '/images/cars/volkswagen.svg',
  bmw: '/images/cars/bmw.svg',
  mercedes: '/images/cars/benz.svg',
  'mercedes-benz': '/images/cars/benz.svg',
  benz: '/images/cars/benz.svg',
  audi: '/images/cars/audi.svg',
  hyundai: '/images/cars/hyundai.svg',
  kia: '/images/cars/kia.svg',
  nissan: '/images/cars/nissan.svg',
  jeep: '/images/cars/Jeep.svg',
  subaru: '/images/cars/subaru.svg',
  mazda: '/images/cars/mazda.svg',
  lexus: '/images/cars/lexus.svg',
  volvo: '/images/cars/volvo.svg',
  tesla: '/images/cars/tesla.svg',
  peugeot: '/images/cars/peugeot.svg',
  suzuki: '/images/cars/suzuki.svg',
};

export default function BrandLogo({
  brand = '',
  size = 24,
  className = '',
  showBadge = false,
}: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);

  const normalized = brand.trim().toLowerCase();

  // Find matching SVG key
  let svgPath: string | null = null;
  for (const [key, path] of Object.entries(BRAND_SVG_MAP)) {
    if (normalized.includes(key)) {
      svgPath = path;
      break;
    }
  }

  const renderContent = () => {
    if (svgPath && !imgError) {
      return (
        <img
          src={svgPath}
          alt={brand || 'Car brand'}
          onError={() => setImgError(true)}
          style={{ width: size, height: size }}
          className={`object-contain transition-transform duration-200 hover:scale-105 ${className}`}
        />
      );
    }

    // Fallback vector icon
    return (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className={className}
        fill="none"
        stroke="currentColor"
      >
        <path
          d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H7c-.7 0-1.3.3-1.8.7C4.3 8.6 3 10 3 10s-2.7.6-4.5 1.1C.7 11.3 0 12.1 0 13v3c0 .6.4 1 1 1h2"
          transform="translate(1, 2)"
          strokeWidth="1.5"
        />
        <circle cx="7" cy="16" r="2" strokeWidth="1.5" />
        <circle cx="17" cy="16" r="2" strokeWidth="1.5" />
      </svg>
    );
  };

  if (showBadge) {
    return (
      <div
        className="rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-center shrink-0 text-cyan-400 shadow-inner overflow-hidden p-1.5"
        style={{ width: size + 16, height: size + 16 }}
      >
        {renderContent()}
      </div>
    );
  }

  return renderContent();
}

export const ALL_BRAND_LOGOS = [
  'Toyota',
  'Honda',
  'Ford',
  'Chevrolet',
  'Volkswagen',
  'BMW',
  'Mercedes-Benz',
  'Audi',
  'Hyundai',
  'Kia',
  'Nissan',
  'Jeep',
  'Subaru',
  'Mazda',
  'Lexus',
  'Volvo',
  'Tesla',
  'Peugeot',
  'Suzuki',
];
