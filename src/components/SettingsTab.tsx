import React, { useEffect, useState } from 'react';
import { Settings, Folder, Save, ToggleLeft, ToggleRight } from 'lucide-react';

export function SettingsTab() {
  const [directory, setDirectory] = useState('');
  const [autoSave, setAutoSave] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const config = await (window as any).electron.getSettings();
      setDirectory(config.defaultDirectory || '');
      setAutoSave(config.autoSave || false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChooseDirectory = async () => {
    try {
      const path = await (window as any).electron.chooseDirectory();
      if (path) {
        setDirectory(path);
        setSaved(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    try {
      await (window as any).electron.saveSettings({ defaultDirectory: directory, autoSave });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-neutral-400 text-center py-10">Carregando configurações...</div>;
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto w-full">
      <div className="bg-[#15161C] border border-white/[0.08] rounded-2xl p-6 md:p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Configurações</h2>
            <p className="text-sm text-neutral-400">Personalize o comportamento do ConvertTube.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-neutral-300">Pasta padrão para Downloads</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#0b0b0e] border border-white/[0.08] rounded-xl px-4 py-3 flex items-center text-sm text-neutral-400 overflow-hidden text-ellipsis whitespace-nowrap">
                {directory || 'Nenhuma pasta selecionada (Padrão: Downloads)'}
              </div>
              <button 
                onClick={handleChooseDirectory}
                className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white px-4 rounded-xl flex items-center gap-2 transition-colors text-sm font-medium"
              >
                <Folder className="w-4 h-4" />
                Alterar
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
            <div>
              <h4 className="text-sm font-semibold text-white">Download Automático</h4>
              <p className="text-xs text-neutral-400 mt-1">
                Salvar os arquivos direto na pasta padrão sem abrir a janela de "Salvar Como".
              </p>
            </div>
            <button 
              onClick={() => { setAutoSave(!autoSave); setSaved(false); }}
              className="text-brand-500 hover:text-brand-400 transition-colors"
            >
              {autoSave ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-neutral-500" />}
            </button>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
              onClick={handleSave}
              className="bg-brand-500 hover:bg-brand-400 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center gap-2 text-sm"
            >
              {saved ? 'Salvo!' : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
