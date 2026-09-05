"use client";

import React, { useState } from 'react';
import { Header } from './Header';
import { ConverterTab } from './ConverterTab';
import { HistoryTab } from './HistoryTab';
import { SettingsTab } from './SettingsTab';
import { AboutTab } from './AboutTab';
import { useHistory } from '@/hooks/useHistory';
import { usePlayer } from '@/hooks/usePlayer';
import { Headphones, Gauge, Shield, Video, Play, Pause, SkipBack, SkipForward, Code, Briefcase, MessageCircle } from 'lucide-react';

export function MainApp() {
  const [activeTab, setActiveTab] = useState<'converter' | 'history' | 'settings' | 'about'>('converter');
  const historyManager = useHistory();
  const playerManager = usePlayer(historyManager.history);

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '0:00';
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col min-h-screen relative pb-24">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        historyCount={historyManager.history.length} 
      />
      
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-16 flex flex-col">
        {/* Keep tabs mounted using CSS display so state is not lost */}
        <div style={{ display: activeTab === 'converter' ? 'block' : 'none' }}>
          <ConverterTab historyManager={historyManager} />
        </div>
        
        <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
          <HistoryTab historyManager={historyManager} playerManager={playerManager} />
        </div>
        
        <div style={{ display: activeTab === 'settings' ? 'block' : 'none' }}>
          <SettingsTab />
        </div>

        <div style={{ display: activeTab === 'about' ? 'block' : 'none' }}>
          <AboutTab />
        </div>
        
        {/* Value Propositions Section */}
        {activeTab === 'converter' && (
          <section className="mt-20 pt-10 border-t border-white/[0.06] animate-in fade-in duration-700">
            <div className="text-center max-w-md mx-auto mb-8">
              <h3 className="text-lg font-bold text-white">Por que escolher o ConvertTube?</h3>
              <p className="text-xs text-neutral-400 mt-1">Desenvolvido com tecnologia de processamento rápido para audiófilos e criadores.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-surface-card/60 backdrop-blur-sm p-5 rounded-xl border border-surface-border hover:border-surface-borderHover transition-all">
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 text-brand-500 flex items-center justify-center mb-3.5 border border-brand-500/20">
                  <Headphones className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1.5">Qualidade Máxima de Áudio</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Áudios masterizados com taxa de 320 kbps e amostragem em 48 kHz sem compressão secundária.
                </p>
              </div>
              
              <div className="bg-surface-card/60 backdrop-blur-sm p-5 rounded-xl border border-surface-border hover:border-surface-borderHover transition-all">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3.5 border border-amber-500/20">
                  <Gauge className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1.5">Conversão Instantânea</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Basta clicar em converter e aproveitar, usamos tecnologia ultra rápida em segundo plano.
                </p>
              </div>
              
              <div className="bg-surface-card/60 backdrop-blur-sm p-5 rounded-xl border border-surface-border hover:border-surface-borderHover transition-all">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3.5 border border-emerald-500/20">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-white mb-1.5">Privacidade Garantida</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Seu histórico fica apenas na sua máquina. Não rastreamos ou armazenamos seus arquivos baixados.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Main Footer */}
      <footer className="border-t border-white/[0.06] bg-[#070709] py-8 text-neutral-500 text-xs mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-brand-600 flex items-center justify-center text-white">
              <Video className="w-3 h-3" />
            </div>
            <span className="text-neutral-300 font-semibold">ConvertTube</span>
            <span className="text-neutral-600">© 2026 • Desenvolvido por Lázaro Bonfim.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/Drlazinho" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Code className="w-3.5 h-3.5" /> GitHub
            </a>
            <a href="https://linkedin.com/in/lazarobonfim" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <Briefcase className="w-3.5 h-3.5" /> LinkedIn
            </a>
            <a href="https://wa.me/5571992938275" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </a>
          </div>
        </div>
      </footer>

      {/* Global Audio Player Setup */}
      {playerManager.currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 h-24 bg-[#0a0a0d] border-t border-white/[0.08] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-50 flex items-center px-6 animate-in slide-in-from-bottom-full duration-300">
          
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/[0.05] group cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = clickX / rect.width;
            playerManager.handleSeek(percentage * playerManager.duration);
          }}>
            <div 
              className="h-full bg-brand-500 relative" 
              style={{ width: `${(playerManager.currentTime / (playerManager.duration || 1)) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-4 w-1/3 min-w-0">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-black flex-shrink-0 shadow-lg border border-white/[0.1]">
                <img src={playerManager.currentTrack.thumbnail} alt="Capa" className="w-full h-full object-cover opacity-90" />
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <h4 className="text-sm font-bold text-white truncate group-hover:text-brand-400 cursor-pointer" onClick={() => setActiveTab('history')}>
                  {playerManager.currentTrack.title}
                </h4>
                <p className="text-xs text-neutral-400 mt-0.5 font-mono">{formatTime(playerManager.currentTime)} / {formatTime(playerManager.duration)}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-6 w-1/3">
              <button onClick={() => playerManager.playPrev(playerManager.currentTrack!.id)} className="text-neutral-400 hover:text-white transition-colors" title="Anterior">
                <SkipBack className="w-5 h-5 fill-current" />
              </button>
              
              <button 
                onClick={playerManager.toggleCurrentPlayPause} 
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 transition-transform shadow-xl"
              >
                {playerManager.isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
              </button>
              
              <button onClick={() => playerManager.playNext(playerManager.currentTrack!.id)} className="text-neutral-400 hover:text-white transition-colors" title="Próxima">
                <SkipForward className="w-5 h-5 fill-current" />
              </button>
            </div>

            <div className="w-1/3 flex items-center justify-end">
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest bg-brand-500/10 px-2 py-1 rounded-md border border-brand-500/20">ConvertTube Player</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
