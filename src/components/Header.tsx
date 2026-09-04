import React, { useEffect, useState } from 'react';
import { Download, Video, RefreshCw, History, HelpCircle } from 'lucide-react';

interface HeaderProps {
  activeTab: 'converter' | 'history';
  setActiveTab: (tab: 'converter' | 'history') => void;
  historyCount: number;
}

export function Header({ activeTab, setActiveTab, historyCount }: HeaderProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#08080a]/80 border-b border-white/[0.06] transition-all">
      <div className="max-w-6xl mx-auto px-6 h-18 flex flex-col md:flex-row items-center justify-between py-3 gap-4 md:gap-0">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-500 flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
            <Video className="w-5 h-5 text-white stroke-[2.2]" />
          </div>
          <div className="flex items-baseline">
            <span className="text-xl font-extrabold tracking-tight text-white">
              Convert<span className="text-brand-500">Tube</span>
            </span>
          </div>
        </div>

        {/* Navigation Segmented Tabs */}
        <nav className="flex items-center bg-[#15161C] p-1 rounded-full border border-white/[0.08] shadow-inner w-full md:w-auto">
          <button 
            onClick={() => setActiveTab('converter')}
            className={`flex-1 md:flex-none px-6 py-1.5 rounded-full text-xs tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === 'converter' 
                ? 'font-semibold bg-white/[0.12] text-white shadow-sm' 
                : 'font-medium text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${activeTab === 'converter' ? 'text-neutral-300' : ''}`} />
            Converter
          </button>
          
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex-1 md:flex-none px-5 py-1.5 rounded-full text-xs tracking-wide transition-all duration-200 flex items-center justify-center gap-1.5 ${
              activeTab === 'history' 
                ? 'font-semibold bg-white/[0.12] text-white shadow-sm' 
                : 'font-medium text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.04]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Histórico 
            <span className="bg-white/[0.08] px-1.5 py-0.5 rounded-md text-[10px] text-neutral-300 font-bold ml-0.5">
              {historyCount}
            </span>
          </button>
        </nav>

        {/* System Status & Quick Actions */}
        <div className="flex items-center gap-3">
          {isInstallable ? (
            <button
              onClick={handleInstallClick}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 hover:bg-brand-500/20 transition-colors text-xs font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Instalar App</span>
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Ultra Engine v2.4</span>
            </div>
          )}
          
          <button 
            className="w-9 h-9 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] flex items-center justify-center text-neutral-400 hover:text-white transition-colors" 
            title="Ajuda e Suporte"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
        
      </div>
    </header>
  );
}
