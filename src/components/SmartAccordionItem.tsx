/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface SmartAccordionItemProps {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  accentColor?: 'cyan' | 'emerald' | 'purple' | 'amber' | 'blue' | 'rose';
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function SmartAccordionItem({
  id,
  title,
  subtitle,
  icon,
  badge,
  accentColor = 'cyan',
  defaultOpen = false,
  children,
}: SmartAccordionItemProps) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  const getAccentStyles = () => {
    switch (accentColor) {
      case 'emerald':
        return {
          border: 'hover:border-emerald-500/50',
          activeBorder: isOpen ? 'border-emerald-500/40 bg-slate-900/90' : 'border-slate-800/90 bg-slate-900/60',
          iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          headerGlow: isOpen ? 'shadow-[0_0_15px_rgba(16,185,129,0.08)]' : '',
          topAccent: 'border-l-4 border-l-emerald-500',
        };
      case 'purple':
        return {
          border: 'hover:border-purple-500/50',
          activeBorder: isOpen ? 'border-purple-500/40 bg-slate-900/90' : 'border-slate-800/90 bg-slate-900/60',
          iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
          headerGlow: isOpen ? 'shadow-[0_0_15px_rgba(168,85,247,0.08)]' : '',
          topAccent: 'border-l-4 border-l-purple-500',
        };
      case 'amber':
        return {
          border: 'hover:border-amber-500/50',
          activeBorder: isOpen ? 'border-amber-500/40 bg-slate-900/90' : 'border-slate-800/90 bg-slate-900/60',
          iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          headerGlow: isOpen ? 'shadow-[0_0_15px_rgba(245,158,11,0.08)]' : '',
          topAccent: 'border-l-4 border-l-amber-500',
        };
      case 'rose':
        return {
          border: 'hover:border-rose-500/50',
          activeBorder: isOpen ? 'border-rose-500/40 bg-slate-900/90' : 'border-slate-800/90 bg-slate-900/60',
          iconBg: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          headerGlow: isOpen ? 'shadow-[0_0_15px_rgba(244,63,94,0.08)]' : '',
          topAccent: 'border-l-4 border-l-rose-500',
        };
      case 'blue':
        return {
          border: 'hover:border-blue-500/50',
          activeBorder: isOpen ? 'border-blue-500/40 bg-slate-900/90' : 'border-slate-800/90 bg-slate-900/60',
          iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          headerGlow: isOpen ? 'shadow-[0_0_15px_rgba(59,130,246,0.08)]' : '',
          topAccent: 'border-l-4 border-l-blue-500',
        };
      case 'cyan':
      default:
        return {
          border: 'hover:border-cyan-500/50',
          activeBorder: isOpen ? 'border-cyan-500/40 bg-slate-900/90' : 'border-slate-800/90 bg-slate-900/60',
          iconBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
          headerGlow: isOpen ? 'shadow-[0_0_15px_rgba(6,182,212,0.08)]' : '',
          topAccent: 'border-l-4 border-l-cyan-500',
        };
    }
  };

  const accent = getAccentStyles();

  return (
    <div
      id={`accordion-item-${id}`}
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${accent.activeBorder} ${accent.border} ${accent.headerGlow} ${accent.topAccent}`}
    >
      {/* Clickable Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 sm:p-3.5 flex items-center justify-between gap-2.5 text-left cursor-pointer transition-colors hover:bg-slate-800/30 focus:outline-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-2 rounded-xl border shrink-0 ${accent.iconBg}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-wide truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] sm:text-xs text-slate-400 truncate mt-0.5 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {badge && <div className="hidden xs:block sm:block">{badge}</div>}
          <div className="p-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white transition-transform">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </button>

      {/* Expandable Body */}
      {isOpen && (
        <div className="p-2 sm:p-3 border-t border-slate-800/80 bg-slate-950/40 animate-fadeIn space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}
