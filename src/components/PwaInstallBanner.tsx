/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share } from 'lucide-react';
import { Language } from '../utils/translations';

interface PwaInstallBannerProps {
  lang: Language;
}

export default function PwaInstallBanner({ lang }: PwaInstallBannerProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isIos, setIsIos] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check if already dismissed in this browser
    const isDismissed = localStorage.getItem('pwa_prompt_dismissed') === 'true';
    if (isDismissed) return;

    // 2. Check if already running in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (navigator as any).standalone === true;
    if (isStandalone) return;

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const detectIos = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(detectIos);

    // If iOS and not standalone, we show the custom Apple guide banner
    if (detectIos) {
      // Small delay for clean entrance
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }

    // 4. Listen for native Android/Chrome install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Listen for appinstalled event to auto-dismiss
    const handleAppInstalled = () => {
      setShowBanner(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show native prompt
    deferredPrompt.prompt();
    
    // Wait for outcome
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      localStorage.setItem('pwa_prompt_dismissed', 'true');
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa_prompt_dismissed', 'true');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div id="pwa-install-banner" className="fixed top-4 inset-x-4 md:max-w-md md:mx-auto z-50 bg-slate-950/90 border border-cyan-500/30 backdrop-blur-md rounded-2xl p-4 shadow-2xl shadow-black animate-slideDown">
      <div className="flex gap-3 relative">
        {/* Dismiss Button */}
        <button 
          id="pwa-dismiss-btn"
          onClick={handleDismiss}
          className="absolute -top-1 -right-1 p-1 rounded-lg text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X size={14} />
        </button>

        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 h-fit self-center">
          <Smartphone size={20} className="animate-pulse" />
        </div>

        <div className="flex-1 space-y-1.5 pr-4">
          <h4 className="text-xs font-black text-slate-200 uppercase tracking-widest">
            {lang === 'fa' ? 'افزودن به صفحه اصلی' : 'Add Refuel Tracker to Home Screen'}
          </h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {isIos ? (
              lang === 'fa' ? (
                <span>
                  برای نصب در آیفون، روی دکمه <Share size={12} className="inline mx-0.5 text-cyan-400" /> اشتراک کلیک کرده و سپس گزینه <strong>Add to Home Screen</strong> را انتخاب کنید.
                </span>
              ) : (
                <span>
                  On iPhone, tap <Share size={12} className="inline mx-0.5 text-cyan-400" /> then <strong>Add to Home Screen</strong> to install the app.
                </span>
              )
            ) : (
              lang === 'fa' ? 'نصب برنامه برای دسترسی آفلاین سریع و پایش لحظه‌ای تله‌متری خودرو.' : 'Install our utility for immediate offline access, telemetry sync, and home metrics.'
            )}
          </p>

          {!isIos && (
            <button
              id="pwa-native-install-btn"
              onClick={handleInstallClick}
              className="mt-1 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black px-4 py-1.5 rounded-xl text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Download size={11} />
              <span>{lang === 'fa' ? 'نصب برنامه' : 'Install App'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
