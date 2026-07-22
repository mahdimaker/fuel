/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Cpu, Sparkles, AlertCircle, CheckCircle2, Lock, RefreshCw } from 'lucide-react';
import { VehicleInfo, FuelEntry } from '../types';
import { translations, Language } from '../utils/translations';
import { generateLocalReport } from '../utils/localAI';

interface AITechnicianReportProps {
  vehicle: VehicleInfo;
  logs: FuelEntry[];
  lang: Language;
}

export default function AITechnicianReport({ vehicle, logs, lang }: AITechnicianReportProps) {
  const t = translations[lang];

  // State 1: Saved report retrieved from localStorage
  const [report, setReport] = useState<string>(() => {
    return localStorage.getItem('en_saved_ai_report') || '';
  });

  // State 2: Last analyzed log count to keep track of progress towards the 3-refuel milestone
  const [lastAnalyzedLogCount, setLastAnalyzedLogCount] = useState<number>(() => {
    const saved = localStorage.getItem('en_last_analyzed_log_count');
    if (saved !== null) {
      const num = parseInt(saved, 10);
      return isNaN(num) ? 0 : num;
    }
    // If we have a saved report but no log count, assume current logs.length to keep it locked
    const hasReport = localStorage.getItem('en_saved_ai_report');
    if (hasReport) {
      return logs.length;
    }
    return 0;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isUsingLocalFallback, setIsUsingLocalFallback] = useState<boolean>(() => {
    return localStorage.getItem('en_ai_report_fallback') === 'true';
  });

  // Self-heal/robustness effect: If user deletes logs or resets the app,
  // ensure lastAnalyzedLogCount doesn't remain larger than the actual logs length
  useEffect(() => {
    if (logs.length === 0 || !vehicle.brand) {
      setReport('');
      setLastAnalyzedLogCount(0);
      localStorage.removeItem('en_saved_ai_report');
      localStorage.removeItem('en_last_analyzed_log_count');
      localStorage.removeItem('en_ai_report_fallback');
    } else if (logs.length < lastAnalyzedLogCount) {
      setLastAnalyzedLogCount(logs.length);
      localStorage.setItem('en_last_analyzed_log_count', logs.length.toString());
    }
  }, [logs.length, lastAnalyzedLogCount, vehicle.brand]);

  // Calculate progress towards next 3-refuel milestone
  const newLogsCount = Math.max(0, logs.length - lastAnalyzedLogCount);
  const isUnlocked = newLogsCount >= 3;

  const generateReport = async () => {
    if (!vehicle.brand) {
      setError(t.emptyProfileWarning);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Attempt backend query first
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicle,
          logs,
          lang, // pass down language so backend can translate if possible
        }),
      });

      if (!response.ok) {
        throw new Error('Backend not available');
      }

      const data = await response.json();
      if (data.success && data.report) {
        setReport(data.report);
        localStorage.setItem('en_saved_ai_report', data.report);
        localStorage.setItem('en_ai_report_fallback', 'false');
        setIsUsingLocalFallback(false);
        
        // Lock again by updating the counter
        const currentCount = logs.length;
        setLastAnalyzedLogCount(currentCount);
        localStorage.setItem('en_last_analyzed_log_count', currentCount.toString());
      } else {
        // Fallback to local AI generator
        const localRep = generateLocalReport(vehicle, logs, lang);
        setReport(localRep);
        localStorage.setItem('en_saved_ai_report', localRep);
        localStorage.setItem('en_ai_report_fallback', 'true');
        setIsUsingLocalFallback(true);
        
        // Lock again by updating the counter
        const currentCount = logs.length;
        setLastAnalyzedLogCount(currentCount);
        localStorage.setItem('en_last_analyzed_log_count', currentCount.toString());
      }
    } catch (err: any) {
      console.warn('Backend unavailable, falling back to local diagnostic analyzer', err);
      const localRep = generateLocalReport(vehicle, logs, lang);
      setReport(localRep);
      localStorage.setItem('en_saved_ai_report', localRep);
      localStorage.setItem('en_ai_report_fallback', 'true');
      setIsUsingLocalFallback(true);
      
      // Lock again by updating the counter
      const currentCount = logs.length;
      setLastAnalyzedLogCount(currentCount);
      localStorage.setItem('en_last_analyzed_log_count', currentCount.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ai-technician-report-card" className="cyber-card p-6 rounded-2xl relative overflow-hidden transition-all duration-300 border border-purple-500/15 hover:border-purple-500/30">
      {/* Decorative gradient overlay */}
      <div className="absolute -right-24 -top-24 w-48 h-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Cpu size={22} className={loading ? 'animate-spin' : ''} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{t.aiReportTitle}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t.aiReportSub}</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-950/40 border border-red-900/50 text-red-400 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="text-center py-12 bg-slate-950/40 rounded-xl border border-slate-900/60 p-5 flex flex-col items-center justify-center">
          <div className="relative w-14 h-14 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/10"></div>
            <div className="absolute inset-0 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-2 border-cyan-500 border-b-transparent animate-spin-reverse"></div>
          </div>
          <h3 className="text-xs font-bold text-slate-300 animate-pulse">
            {lang === 'fa' ? 'عیب‌یابی هوشمند در حال تحلیل داده‌های خودرو...' : 'AI diagnostics analyzing vehicular logs...'}
          </h3>
          <p className="text-[10px] text-slate-500 mt-1 max-w-[250px] leading-relaxed">
            {lang === 'fa'
              ? 'محاسبه شاخص‌های مصرف سوخت، جرقه شمع‌ها، سنسور اکسیژن و پیش‌بینی چرخه نگهداری پیشرانه...'
              : 'Calculating mileage performance indexes, ignition timings, catalyst temperatures, and maintenance alert cycles.'}
          </p>
        </div>
      )}

      {!loading && (
        <>
          {/* STATE A: NO REPORT SAVED YET */}
          {!report && (
            <>
              {/* Locked view */}
              {!isUnlocked ? (
                <div className="relative rounded-xl overflow-hidden mt-2 border border-slate-900/60 p-5 bg-slate-950/20 min-h-[220px] flex items-center justify-center">
                  {/* Background blurred mockup content */}
                  <div className="absolute inset-0 p-5 space-y-4 filter blur-[3px] select-none pointer-events-none opacity-20">
                    <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                    <div className="h-2 bg-slate-800 rounded w-full"></div>
                    <div className="h-2 bg-slate-800 rounded w-5/6"></div>
                    <div className="h-2 bg-slate-800 rounded w-4/5"></div>
                    <div className="space-y-2 pt-2">
                      <div className="h-3 bg-slate-800 rounded w-1/4"></div>
                      <div className="h-2 bg-slate-800 rounded w-full"></div>
                    </div>
                  </div>

                  {/* Glassmorphism Lock Overlay */}
                  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center">
                    <div className="relative space-y-4 max-w-sm">
                      <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md shadow-purple-500/10">
                        <Lock size={20} className="animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-200">
                          {lang === 'fa' ? 'گزارش عیب‌یابی قفل است' : 'AI Diagnostics Locked'}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-[280px] leading-relaxed mx-auto">
                          {lang === 'fa' 
                            ? 'برای باز کردن قفل اولین گزارش عیب‌یابی عمیق، نیاز به ثبت ۳ سوخت‌گیری جدید است.' 
                            : 'Unlock your next deep AI Diagnostics report after logging 3 new refuels.'}
                        </p>
                      </div>

                      {/* Progress tracking */}
                      <div className="space-y-1.5 max-w-[200px] mx-auto pt-1">
                        <div className="flex justify-between text-[9px] font-bold text-slate-400 font-mono">
                          <span>{lang === 'fa' ? 'پیشرفت سوخت‌گیری' : 'PROGRESS'}</span>
                          <span className="text-purple-400">{newLogsCount}/3</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900/60">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-400 transition-all duration-500"
                            style={{ width: `${Math.min(100, (newLogsCount / 3) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Unlocked & Ready view (No report yet, but ready to analyze) */
                <div className="text-center py-8 bg-slate-950/40 rounded-xl border border-slate-900/60 p-5 mt-2">
                  <div className="p-3 rounded-full bg-purple-500/5 border border-purple-500/10 inline-block text-purple-400 mb-3 animate-bounce">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-200">
                    {lang === 'fa' ? 'آماده آنالیز فنی خودرو' : 'AI Diagnostics Ready'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                    {lang === 'fa' 
                      ? 'داده‌های تله‌متری خودروی شما همگام‌سازی شده است. برای دریافت گزارش تخصصی عیب‌یابی کلیک کنید.'
                      : 'Vehicular data successfully synchronized. Tap below to synthesize fuel logs and mileage through our diagnostic modeling engine.'}
                  </p>

                  <button
                    id="btn-generate-initial-report"
                    onClick={() => generateReport()}
                    className="mt-5 px-6 py-2.5 rounded-xl tech-gradient hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 mx-auto cursor-pointer transition-all active:scale-95 shadow-md shadow-purple-500/20 border border-purple-400/25 animate-pulse"
                  >
                    <Sparkles size={14} />
                    <span>{lang === 'fa' ? 'شروع آنالیز با هوش مصنوعی' : 'Analyze with AI'}</span>
                  </button>
                </div>
              )}
            </>
          )}

          {/* STATE B: PREVIOUSLY GENERATED REPORT EXISTS */}
          {report && (
            <div className="space-y-5">
              {/* Rendered report output */}
              <div className="bg-slate-950/50 p-5 rounded-xl border border-slate-900 leading-relaxed text-sm text-slate-300 max-h-[360px] overflow-y-auto space-y-4">
                {report.split('\n').map((line, index) => {
                  const trimmed = line.trim();
                  if (trimmed.startsWith('###')) {
                    return (
                      <h4 key={index} className="text-xs font-bold text-cyan-400 mt-4 mb-2 uppercase tracking-wide border-l-2 border-cyan-500 pl-2">
                        {trimmed.replace('###', '').trim()}
                      </h4>
                    );
                  }
                  if (trimmed.startsWith('##')) {
                    return (
                      <h3 key={index} className="text-sm font-black text-white flex items-center gap-2 mt-5 mb-2.5 pb-1 border-b border-slate-900">
                        <Sparkles size={14} className="text-purple-400" />
                        <span>{trimmed.replace('##', '').trim()}</span>
                      </h3>
                    );
                  }
                  if (trimmed.startsWith('#')) {
                    return (
                      <h2 key={index} className="text-base font-black text-transparent bg-clip-text tech-gradient-text mt-6 mb-3">
                        {trimmed.replace('#', '').trim()}
                      </h2>
                    );
                  }
                  if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
                    return (
                      <div key={index} className="flex items-start gap-2 my-1 text-xs text-slate-300 ml-2">
                        <span className="text-purple-500 mt-1 shrink-0">•</span>
                        <span>{trimmed.replace(/^[*+-]\s*/, '')}</span>
                      </div>
                    );
                  }
                  if (!trimmed) return <div key={index} className="h-2"></div>;
                  return <p key={index} className="text-xs text-slate-300 text-justify leading-relaxed">{trimmed}</p>;
                })}
              </div>

              {/* Status Note */}
              <div className="p-3 bg-purple-950/25 border border-purple-900/30 rounded-xl flex items-center gap-2 text-[10px] text-purple-400">
                <CheckCircle2 size={12} className="shrink-0" />
                <span>
                  {isUsingLocalFallback 
                    ? (lang === 'fa' ? 'پردازش محلی: این گزارش تله‌متری به دلیل همگام‌سازی سریع کاملاً به صورت آفلاین ایجاد شده است.' : 'Local Processing: This telemetry report was generated client-side for sandbox compatibility.')
                    : t.aiFooterNote
                  }
                </span>
              </div>

              {/* Dynamic Re-locking Action Panel */}
              {!isUnlocked ? (
                /* Next update locked */
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 relative overflow-hidden">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Lock size={15} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">
                        {lang === 'fa' ? 'به‌روزرسانی بعدی قفل است' : 'Next AI Analysis Locked'}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                        {lang === 'fa' 
                          ? '۳ سوخت‌گیری جدید ثبت کنید تا قفل تحلیل عمیق بعدی باز شود.' 
                          : 'Unlock your next deep AI Diagnostics report after logging 3 new refuels.'}
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs font-mono font-black text-purple-400 shrink-0">
                    {lang === 'fa' ? `پیشرفت: ${newLogsCount}/۳` : `Progress: ${newLogsCount}/3`}
                  </div>
                </div>
              ) : (
                /* Next update unlocked and active */
                <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Sparkles size={13} className="animate-pulse" />
                      <span>{lang === 'fa' ? 'به‌روزرسانی آماده است!' : 'Update Ready!'}</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      {lang === 'fa'
                        ? '۳ سوخت‌گیری جدید ثبت شده است. برای به‌روزرسانی گزارش عیب‌یابی کلیک کنید.'
                        : 'At least 3 new refuels recorded. Re-run diagnostics to refresh and update vehicle health insights.'}
                    </p>
                  </div>
                  <button
                    id="btn-re-analyze-report"
                    onClick={() => generateReport()}
                    className="px-4 py-2 rounded-xl tech-gradient hover:opacity-95 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0 border border-purple-400/20"
                  >
                    <RefreshCw size={11} />
                    <span>{lang === 'fa' ? 'به‌روزرسانی گزارش' : 'Update Report'}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
