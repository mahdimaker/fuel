import React from 'react';

interface AppIconProps {
  size?: number;
  className?: string;
}

export default function AppIcon({ size = 42, className = '' }: AppIconProps) {
  return (
    <div
      className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-md shadow-blue-600/30 overflow-hidden shrink-0 border border-blue-400/30 ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-0.5"
      >
        {/* Gauge Ticks */}
        {/* Red Zone Ticks (Near E) */}
        <line x1="10.5" y1="53.6" x2="19.0" y2="56.7" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
        <line x1="15.2" y1="44.5" x2="22.6" y2="49.5" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />

        {/* White Zone Ticks */}
        <line x1="21.9" y1="36.8" x2="27.9" y2="43.5" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" />
        <line x1="30.3" y1="30.9" x2="34.5" y2="38.9" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" />
        <line x1="39.8" y1="27.2" x2="42.0" y2="36.0" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" />

        {/* Center Top Tick */}
        <line x1="50.0" y1="24.0" x2="50.0" y2="36.0" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />

        <line x1="60.2" y1="27.2" x2="58.0" y2="36.0" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" />
        <line x1="69.7" y1="30.9" x2="65.5" y2="38.9" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" />
        <line x1="78.1" y1="36.8" x2="72.1" y2="43.5" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" />
        <line x1="84.8" y1="44.5" x2="77.4" y2="49.5" stroke="#FFFFFF" strokeWidth="3.2" strokeLinecap="round" />
        <line x1="89.5" y1="53.6" x2="81.0" y2="56.7" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />

        {/* Center Fuel Pump Icon (White) */}
        <g>
          {/* Pump Body */}
          <rect x="45.5" y="35" width="9" height="13" rx="1.5" fill="#FFFFFF" />
          {/* Display Window */}
          <rect x="47" y="37" width="6" height="4" rx="0.8" fill="#1d4ed8" />
          {/* Base Line */}
          <line x1="43.5" y1="48" x2="56.5" y2="48" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          {/* Hose & Nozzle */}
          <path
            d="M 54.5 38 C 59.5 38 59.5 43 57.5 46 C 56.5 47.5 57 50 59 50 C 61 50 61.5 47.5 61.5 44 V 40 L 59 38"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </g>

        {/* Labels E and F */}
        <text
          x="18"
          y="77"
          fill="#FFFFFF"
          fontSize="20"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
          textAnchor="middle"
        >
          E
        </text>
        <text
          x="82"
          y="77"
          fill="#FFFFFF"
          fontSize="20"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
          textAnchor="middle"
        >
          F
        </text>

        {/* Red Needle pointing towards E */}
        <polygon points="48,65 17,54 52,71" fill="#ef4444" />
        <line x1="50" y1="68" x2="17" y2="54" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />

        {/* Center Pivot Ring */}
        <circle cx="50" cy="68" r="6" fill="#FFFFFF" />
        <circle cx="50" cy="68" r="3" fill="#1d4ed8" />
      </svg>
    </div>
  );
}

