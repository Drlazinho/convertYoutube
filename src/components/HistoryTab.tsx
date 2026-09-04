import React from 'react';
import { Download, Trash2, Clock, Play, Trash } from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';

export function HistoryTab({ historyManager }: { historyManager: ReturnType<typeof useHistory> }) {
  const { history, isLoaded, removeFromHistory, clearHistory } = historyManager;

  if (!isLoaded) {
    return <div className="p-8 text-center text-neutral-500 animate-pulse text-sm">Carregando histórico...</div>;
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/[0.08] rounded-xl bg-surface-card/30">
        <div className="bg-white/[0.04] p-4 rounded-full mb-4">
          <Clock className="w-8 h-8 text-neutral-600" />
        </div>
        <h3 className="text-lg font-medium mb-1 text-neutral-200">Nenhum histórico</h3>
        <p className="text-neutral-500 text-sm">
          Seus vídeos convertidos aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <section className="space-y-4 animate-in fade-in duration-500" data-purpose="history-downloads-list">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-white tracking-tight">Downloads Recentes</h2>
          <span className="bg-white/[0.07] text-neutral-400 text-xs px-2 py-0.5 rounded-full font-medium">
            {history.length} itens
          </span>
        </div>
        <button 
          onClick={clearHistory}
          className="text-xs font-medium text-neutral-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-rose-500/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Limpar Tudo
        </button>
      </div>

      {/* History Cards */}
      <div className="space-y-3">
        {history.map((item) => (
          <article 
            key={item.timestamp}
            className="group bg-surface-card hover:bg-surface-cardHover rounded-xl p-3 sm:p-3.5 border border-surface-border hover:border-surface-borderHover transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              
              {/* Thumbnail Area */}
              <div className="relative w-28 h-16 sm:w-32 sm:h-18 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-900 border border-white/[0.08] shadow-sm">
                {item.thumbnail ? (
                  <img 
                    src={item.thumbnail} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600 bg-neutral-900">
                    Sem Imagem
                  </div>
                )}
                
                {/* Duration Badge */}
                {item.duration && (
                  <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-neutral-200 text-[10px] font-semibold px-1.5 py-0.5 rounded backdrop-blur-sm">
                    {item.duration}
                  </span>
                )}
              </div>

              {/* Metadata */}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-white tracking-tight truncate pr-2 group-hover:text-brand-400 transition-colors">
                  {item.title}
                </h3>
                
                <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-neutral-400">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-brand-500/15 border border-brand-500/30 text-rose-300 text-[10px] font-bold uppercase tracking-wide">
                    {item.format}
                  </span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-[11px] text-neutral-400">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Toolbar */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-white/[0.05]">
              <button 
                className="w-8 h-8 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white flex items-center justify-center transition-colors text-xs" 
                title="Ouvir Prévia"
              >
                <Play className="w-3.5 h-3.5 ml-0.5" />
              </button>
              
              <a 
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] text-xs font-semibold text-neutral-200 hover:text-white border border-white/[0.08] transition-all"
              >
                <Download className="w-3.5 h-3.5 text-brand-500" />
                <span>Refazer</span>
              </a>
              
              <button 
                onClick={() => removeFromHistory(item.id)}
                className="w-8 h-8 rounded-lg bg-transparent hover:bg-rose-500/15 text-neutral-400 hover:text-rose-400 flex items-center justify-center transition-colors" 
                title="Remover do histórico"
              >
                <Trash className="w-3.5 h-3.5" />
              </button>
            </div>
            
          </article>
        ))}
      </div>
    </section>
  );
}
