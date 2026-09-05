"use client";

import React, { useState } from 'react';
import { Header } from './Header';
import { ConverterTab } from './ConverterTab';
import { HistoryTab } from './HistoryTab';
import { SettingsTab } from './SettingsTab';
import { useHistory } from '@/hooks/useHistory';
import { Headphones, Gauge, Shield, Video } from 'lucide-react';

export function MainApp() {
  const [activeTab, setActiveTab] = useState<'converter' | 'history' | 'settings'>('converter');
  const historyManager = useHistory();

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        historyCount={historyManager.history.length} 
      />
      
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-16 flex flex-col">
        {activeTab === 'converter' && <ConverterTab historyManager={historyManager} />}
        {activeTab === 'history' && <HistoryTab historyManager={historyManager} />}
        {activeTab === 'settings' && <SettingsTab />}
        
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
            <span className="text-neutral-600">© 2026 • Todos os direitos reservados.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-neutral-300 transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-neutral-300 transition-colors">Privacidade</a>
            <a href="#" className="hover:text-neutral-300 transition-colors">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
