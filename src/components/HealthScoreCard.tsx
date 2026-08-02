/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Shield, Sparkles, AlertTriangle, ArrowUpRight, ArrowDownRight, Zap, RefreshCw, Cpu, CheckCircle2, AlertOctagon, Info } from 'lucide-react';
import { HealthMetrics } from '../types';
import { translations, Language } from '../utils/translations';

interface HealthScoreCardProps {
  metrics: HealthMetrics;
  onRecalculate?: () => void;
  lang: Language;
  hideScore?: boolean;
  hideAlerts?: boolean;
}

export default function HealthScoreCard({ metrics, onRecalculate, lang, hideScore = false, hideAlerts = false }: HealthScoreCardProps) {
  const t = translations[lang];

  // Map levels to translation and color styling
  const getLevelInfo = (level: string) => {
    switch (level) {
      case 'excellent':
        return { 
          text: t.levelExcellent, 
          color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30', 
          scoreColor: 'text-emerald-400' 
        };
      case 'good':
        return { 
          text: t.levelGood, 
          color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30', 
          scoreColor: 'text-cyan-400' 
        };
      case 'fair':
        return { 
          text: t.levelFair, 
          color: 'text-amber-400 bg-amber-950/40 border-amber-500/30', 
          scoreColor: 'text-amber-400' 
        };
      case 'poor':
      default:
        return { 
          text: t.levelPoor, 
          color: 'text-rose-400 bg-rose-950/40 border-rose-500/30', 
          scoreColor: 'text-rose-400' 
        };
    }
  };

  const levelInfo = getLevelInfo(metrics.level);

  // Translate warning recommendations or messages
  const getTranslatedMessage = (msg: string) => {
    if (lang === 'en') {
      // Basic dictionary mapping of typical messages from engine to english
      if (msg.includes('نوسان شدید')) return 'Warning: High volatility in consumption efficiency detected.';
      if (msg.includes('فشار کارکرد موتور')) return 'Odometer suggests maintenance cycle is near.';
      if (msg.includes('سوخت باکیفیت')) return 'Switch to premium/super fuel occasionally to clear engine residue.';
      if (msg.includes('راندمان سوخت عالی')) return 'Excellent fuel efficiency. Maintain current driving habits!';
      if (msg.includes('سرویس دوره‌ای')) return 'Spark plugs and throttle body cleaning recommended.';
      return msg;
    }
    return msg;
  };

  // Clean raw message text by stripping leading emojis, bullet points, or raw markers
  const cleanMessageText = (rawMsg: string) => {
    let text = getTranslatedMessage(rawMsg);
    // Remove leading emojis, bullet points, colons, or symbols safely without wiping unicode/Persian text
    text = text.replace(/^[\s•\u2022\u2600-\u27BF\uFE0F:✅🚨⚠️🔧📊🚘⚙️💡•-]+/gu, '').trim();
    return text || getTranslatedMessage(rawMsg);
  };

  // Determine dynamic alert box styling & icon based on message severity/type
  const getAlertStyle = (rawMsg: string) => {
    const msgLower = rawMsg.toLowerCase();

    // Critical / High Severity
    if (
      rawMsg.includes('🚨') ||
      msgLower.includes('critical') ||
      msgLower.includes('sudden increase') ||
      msgLower.includes('افزایش ناگهانی') ||
      msgLower.includes('خطر') ||
      msgLower.includes('ضروری')
    ) {
      return {
        container: 'bg-rose-950/30 border-rose-500/25 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.1)] hover:border-rose-500/40',
        iconBadge: 'bg-rose-500/15 border border-rose-500/30 text-rose-400 p-2 rounded-xl shrink-0 shadow-[0_0_10px_rgba(244,63,94,0.3)]',
        labelBadge: 'text-rose-400 bg-rose-500/10 border border-rose-500/30',
        labelText: lang === 'fa' ? 'هشدار جدی' : 'CRITICAL',
        Icon: AlertOctagon,
      };
    }

    // Positive / Optimal
    if (
      rawMsg.includes('✅') ||
      msgLower.includes('optimal') ||
      msgLower.includes('excellent') ||
      msgLower.includes('بهینه') ||
      msgLower.includes('عالی') ||
      msgLower.includes('بهبود') ||
      msgLower.includes('اقتصادی')
    ) {
      return {
        container: 'bg-emerald-950/30 border-emerald-500/25 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.1)] hover:border-emerald-500/40',
        iconBadge: 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 p-2 rounded-xl shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.3)]',
        labelBadge: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30',
        labelText: lang === 'fa' ? 'وضعیت بهینه' : 'OPTIMAL',
        Icon: CheckCircle2,
      };
    }

    // Warning / Attention
    if (
      rawMsg.includes('⚠️') ||
      rawMsg.includes('🔧') ||
      rawMsg.includes('📊') ||
      msgLower.includes('warning') ||
      msgLower.includes('check') ||
      msgLower.includes('higher than') ||
      msgLower.includes('بالاتر از') ||
      msgLower.includes('نوسان') ||
      msgLower.includes('فشار') ||
      msgLower.includes('سرویس') ||
      msgLower.includes('تخمین')
    ) {
      return {
        container: 'bg-amber-950/30 border-amber-500/25 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.1)] hover:border-amber-500/40',
        iconBadge: 'bg-amber-500/15 border border-amber-500/30 text-amber-400 p-2 rounded-xl shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.3)]',
        labelBadge: 'text-amber-400 bg-amber-500/10 border border-amber-500/30',
        labelText: lang === 'fa' ? 'نیازمند توجه' : 'ATTENTION',
        Icon: AlertTriangle,
      };
    }

    // Default Info / Telemetry
    return {
      container: 'bg-cyan-950/30 border-cyan-500/25 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.1)] hover:border-cyan-500/40',
      iconBadge: 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 p-2 rounded-xl shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.3)]',
      labelBadge: 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30',
      labelText: lang === 'fa' ? 'پایش هوشمند' : 'INFO',
      Icon: Info,
    };
  };

  return (
    <div id="health-score-container" className={hideScore || hideAlerts ? "" : "space-y-6"}>
      {/* VHS Gauge card */}
      {!hideScore && (
        <div className="cyber-card p-5 sm:p-6 md:p-8 rounded-2xl border border-indigo-500/15 bg-slate-900/40 backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-[0.07] pointer-events-none dark:block hidden"></div>
          <div className="absolute -left-20 -top-20 w-44 h-44 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)] shrink-0">
                <Shield size={22} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              </div>
              <div className={lang === 'fa' ? 'text-right' : 'text-left'}>
                <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-white leading-tight">
                  {t.vhsTitle}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                  {t.vhsSub}
                </p>
              </div>
            </div>
            {onRecalculate && (
              <button
                onClick={onRecalculate}
                className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 transition-all cursor-pointer shrink-0"
                title={lang === 'fa' ? 'بروزرسانی داده‌ها' : 'Recalculate data'}
              >
                <RefreshCw size={16} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-5 items-stretch">
            {/* Main big score */}
            <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950/70 border border-slate-800/90 rounded-xl sm:rounded-2xl p-6 sm:p-7 relative backdrop-blur-md shadow-[0_0_25px_rgba(0,0,0,0.4)]">
              <div className="text-5xl sm:text-6xl md:text-7xl font-black font-mono tracking-tight text-white mb-2 flex items-baseline">
                {metrics.isUnrated ? (
                  <span className="text-slate-500 font-bold">---</span>
                ) : (
                  <span className={`${levelInfo.scoreColor} font-black`}>{metrics.score}</span>
                )}
                <span className="text-sm sm:text-base text-slate-400 font-bold mr-1.5 ml-1.5 font-mono opacity-80">/100</span>
              </div>
              {metrics.isUnrated ? (
                <span className="text-[11px] font-bold px-3.5 py-1 rounded-full border text-slate-400 bg-slate-900/80 border-slate-700/50 uppercase tracking-wider shadow-sm">
                  {lang === 'fa' ? 'بدون ارزیابی' : 'Unrated'}
                </span>
              ) : (
                <span className={`text-[11px] font-extrabold px-4 py-1.5 rounded-full border uppercase tracking-wider ${levelInfo.color}`}>
                  {levelInfo.text}
                </span>
              )}
            </div>

            {/* Quick Metrics Grid */}
            <div className="md:col-span-7 grid grid-cols-2 gap-3 sm:gap-4">
              {/* Box 1: Average Consumption */}
              <div className="bg-slate-950/50 backdrop-blur-md p-3.5 sm:p-4 rounded-xl border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between relative overflow-visible pb-5">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">{t.avgEff}</span>
                  <span className="text-base sm:text-lg font-black text-white font-mono tracking-tight block">
                    {metrics.isUnrated ? (
                      <span className="text-slate-500">---</span>
                    ) : (
                      <>
                        {metrics.fuelEfficiency.toFixed(1)} <span className="text-xs font-normal text-slate-400">L/100km</span>
                      </>
                    )}
                  </span>
                </div>
                {/* Floating overhanging badge */}
                <div className={`absolute -bottom-2.5 ${lang === 'fa' ? '-right-2 sm:-right-2.5' : '-left-2 sm:-left-2.5'} z-10`}>
                  {metrics.isUnrated ? (
                    <span className="text-[10px] text-slate-400 font-bold bg-slate-950/90 backdrop-blur-md border border-slate-800 px-2.5 py-0.5 rounded-full shadow-md block whitespace-nowrap">
                      {lang === 'fa' ? 'نیازمند داده سوخت' : 'Pending log'}
                    </span>
                  ) : metrics.fuelEfficiencyChange <= 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-400 bg-slate-950/90 backdrop-blur-md border border-emerald-500/40 px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.3)] whitespace-nowrap">
                      <ArrowDownRight size={12} className="text-emerald-400" />
                      {-metrics.fuelEfficiencyChange.toFixed(1)}% {lang === 'fa' ? 'بهبود' : 'improvement'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-rose-400 bg-slate-950/90 backdrop-blur-md border border-rose-500/40 px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(244,63,94,0.3)] whitespace-nowrap">
                      <ArrowUpRight size={12} className="text-rose-400" />
                      {metrics.fuelEfficiencyChange.toFixed(1)}% {lang === 'fa' ? 'افزایش' : 'increased'}
                    </span>
                  )}
                </div>
              </div>

              {/* Box 2: Est. Fuel Range */}
              <div className="bg-slate-950/50 backdrop-blur-md p-3.5 sm:p-4 rounded-xl border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">{t.estRange}</span>
                  <span className="text-base sm:text-lg font-black text-white font-mono tracking-tight block">
                    {metrics.isUnrated ? (
                      <span className="text-slate-500">---</span>
                    ) : (
                      <>
                        {metrics.estimatedRange.toLocaleString(undefined, { maximumFractionDigits: 1 })} <span className="text-xs font-normal text-slate-400">{t.km}</span>
                      </>
                    )}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-2">
                  {lang === 'fa' ? 'برآورد مسافت باک پر' : 'Est. full tank distance'}
                </span>
              </div>

              {/* Box 3: Monthly CO2 Footprint */}
              <div className="bg-slate-950/50 backdrop-blur-md p-3.5 sm:p-4 rounded-xl border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between relative overflow-visible pb-5">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">{t.co2Metric}</span>
                  <span className="text-base sm:text-lg font-black text-white font-mono tracking-tight block">
                    {metrics.isUnrated ? (
                      <span className="text-slate-500">---</span>
                    ) : (
                      <>
                        {metrics.carbonFootprint.toFixed(0)} <span className="text-xs font-normal text-slate-400">kg</span>
                      </>
                    )}
                  </span>
                </div>
                {/* Floating overhanging badge */}
                <div className={`absolute -bottom-2.5 ${lang === 'fa' ? '-right-2 sm:-right-2.5' : '-left-2 sm:-left-2.5'} z-10`}>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-teal-400 bg-slate-950/90 backdrop-blur-md border border-teal-500/40 px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(20,184,166,0.3)] whitespace-nowrap">
                    <Zap size={10} className="text-teal-400 fill-teal-400/20" />
                    <span>{lang === 'fa' ? 'حامی محیط زیست' : 'Eco-conscious'}</span>
                  </span>
                </div>
              </div>

              {/* Box 4: Efficiency Fluctuation */}
              <div className="bg-slate-950/50 backdrop-blur-md p-3.5 sm:p-4 rounded-xl border border-slate-800/80 hover:border-slate-700/80 transition-all flex flex-col justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1">{t.fluctuation}</span>
                  <span className="text-base sm:text-lg font-black text-white font-mono tracking-tight block">
                    {metrics.isUnrated ? (
                      <span className="text-slate-500">---</span>
                    ) : (
                      <>{(metrics.score > 85 ? 1.2 : 4.8).toFixed(1)}%</>
                    )}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium block mt-2">
                  {lang === 'fa' ? 'انحراف معیار مصرف' : 'Std Dev deviation'}
                </span>
              </div>
            </div>
          </div>

          {/* Four-Factor Health Metric Analysis */}
          <div className="border-t border-slate-900/80 mt-6 pt-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <span>{t.factorAnalysis}</span>
            </h3>

            <div className="space-y-3.5">
              {/* Factor 1: Fuel Efficiency */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300 font-semibold">{t.effFactor}</span>
                  <span className="text-cyan-400 font-bold font-mono">{metrics.isUnrated ? '---' : `${metrics.statusBreakdown.efficiency}%`}</span>
                </div>
                <div className="h-2.5 sm:h-3 w-full bg-slate-900/90 rounded-full border border-slate-800/80 overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(34,211,238,0.5)]" 
                    style={{ width: `${metrics.isUnrated ? 0 : metrics.statusBreakdown.efficiency}%` }}
                  ></div>
                </div>
              </div>

              {/* Factor 2: Wear & Maintenance */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300 font-semibold">{t.maintFactor}</span>
                  <span className="text-purple-400 font-bold font-mono">{metrics.isUnrated ? '---' : `${metrics.statusBreakdown.maintenance}%`}</span>
                </div>
                <div className="h-2.5 sm:h-3 w-full bg-slate-900/90 rounded-full border border-slate-800/80 overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(192,132,252,0.5)]" 
                    style={{ width: `${metrics.isUnrated ? 0 : metrics.statusBreakdown.maintenance}%` }}
                  ></div>
                </div>
              </div>

              {/* Factor 3: Fueling Consistency */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300 font-semibold">{t.habitFactor}</span>
                  <span className="text-emerald-400 font-bold font-mono">{metrics.isUnrated ? '---' : `${metrics.statusBreakdown.drivingHabit}%`}</span>
                </div>
                <div className="h-2.5 sm:h-3 w-full bg-slate-900/90 rounded-full border border-slate-800/80 overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(52,211,153,0.5)]" 
                    style={{ width: `${metrics.isUnrated ? 0 : metrics.statusBreakdown.drivingHabit}%` }}
                  ></div>
                </div>
              </div>

              {/* Factor 4: Fuel Cost Balance */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <span className="text-slate-300 font-semibold">{t.costFactor}</span>
                  <span className="text-amber-400 font-bold font-mono">{metrics.isUnrated ? '---' : `${metrics.statusBreakdown.costScore}%`}</span>
                </div>
                <div className="h-2.5 sm:h-3 w-full bg-slate-900/90 rounded-full border border-slate-800/80 overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]" 
                    style={{ width: `${metrics.isUnrated ? 0 : metrics.statusBreakdown.costScore}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warnings & Diagnosis Alerts */}
      {!hideAlerts && (
        <div id="ai-telemetry-warnings" className="cyber-card p-5 sm:p-6 rounded-2xl border border-indigo-500/15 bg-slate-900/40 backdrop-blur-md relative overflow-hidden transition-all duration-300 hover:border-indigo-500/30">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:20px_20px] opacity-[0.07] pointer-events-none dark:block hidden"></div>
          
          {/* Header with Dynamic AI Icon */}
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.25)] shrink-0">
              <Cpu size={22} className="text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            </div>
            <div className={lang === 'fa' ? 'text-right' : 'text-left'}>
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-white leading-tight">
                {t.warningsTitle}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                {lang === 'fa' ? 'پایش الگوریتمی و هشدارهای تله‌متری سلامت خودرو' : 'Real-time telemetry and algorithmic health diagnostics'}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {metrics.messages.map((rawMsg, index) => {
              const alertStyle = getAlertStyle(rawMsg);
              const cleanedText = cleanMessageText(rawMsg);
              const AlertIcon = alertStyle.Icon;

              return (
                <div 
                  key={index} 
                  className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border transition-all duration-200 ${alertStyle.container}`}
                >
                  <div className={alertStyle.iconBadge}>
                    <AlertIcon size={18} />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${alertStyle.labelBadge}`}>
                        {alertStyle.labelText}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed font-medium whitespace-pre-line">
                      {cleanedText}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
