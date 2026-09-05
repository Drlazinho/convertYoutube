import React, { useState } from 'react';
import { Download, Trash2, Clock, Play, Pause, Trash, Loader2, FolderSearch, Film, Music } from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';
import { usePlayer } from '@/hooks/usePlayer';
import { HistoryItem } from '@/types';

export function HistoryTab({ historyManager, playerManager }: { historyManager: ReturnType<typeof useHistory>, playerManager: ReturnType<typeof usePlayer> }) {
  const { history, isLoaded, removeFromHistory, clearHistory } = historyManager;
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<'audio' | 'video'>('audio');

  const filteredHistory = history.filter(item => (item.mediaType || 'audio') === activeFilter);

  const handleRedownload = async (item: HistoryItem) => {
    if (!item.url && !item.id) return;
    
    setDownloadingId(item.id);
    setDownloadProgress(0);
    
    try {
      const response = await (window as any).electron.convert({ 
        url: item.url || `https://youtube.com/watch?v=${item.id}`, 
        title: item.title,
        quality: item.mediaType === 'video' ? (item.format.includes('1080') ? '1080' : item.format.includes('720') ? '720' : item.format.includes('480') ? '480' : '360') : (item.format.includes('320') ? '320' : '192'),
        type: item.mediaType || 'audio'
      });

      if (!response.success) {
        throw new Error(response.error || 'Download cancelado ou com erro.');
      }

      const cleanup = (window as any).electron.onProgress(response.jobId, (data: any) => {
        if (data.status === 'error') {
          setDownloadingId(null);
          cleanup();
          alert(`Erro durante o download: ${data.error}`);
          return;
        }
        
        if (data.percent !== undefined) {
          setDownloadProgress(data.percent);
        }

        if (data.status === 'done') {
          setDownloadingId(null);
          cleanup();
          
          const updatedItem = {
            ...item,
            timestamp: Date.now(),
            filePath: data.filePath
          };
          
          historyManager.addToHistory(updatedItem);
          
          if (item.mediaType !== 'video') {
            const wantPlay = window.confirm(`Download concluído! Deseja escutar agora?`);
            if (wantPlay) {
              playerManager.playItem(updatedItem);
            }
          } else {
            alert('Vídeo baixado com sucesso!');
          }
        }
      });
    } catch (err: any) {
      console.error(err);
      setDownloadingId(null);
      alert(err.message || 'Falha ao iniciar conversão');
    }
  };

  const handleShowInFolder = async (item: HistoryItem) => {
    if (!item.filePath) return;
    const res = await (window as any).electron.showInFolder(item.filePath);
    if (!res.success) {
      const wantRedownload = window.confirm('O arquivo de vídeo não foi encontrado (pode ter sido apagado ou movido).\nDeseja baixar novamente?');
      if (wantRedownload) {
        handleRedownload(item);
      }
    }
  };

  if (!isLoaded) {
    return <div className="p-8 text-center text-neutral-500 animate-pulse text-sm">Carregando histórico...</div>;
  }

  return (
    <section className="space-y-6 animate-in fade-in duration-500" data-purpose="history-downloads-list">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold text-white tracking-tight">Downloads Recentes</h2>
          <span className="bg-white/[0.07] text-neutral-400 text-xs px-2 py-0.5 rounded-full font-medium">
            {filteredHistory.length} itens
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-[#0b0b0e] p-1 rounded-lg border border-white/[0.06]">
            <button 
              onClick={() => setActiveFilter('audio')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${activeFilter === 'audio' ? 'bg-brand-500/20 text-brand-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              <Music className="w-3.5 h-3.5" /> Músicas
            </button>
            <button 
              onClick={() => setActiveFilter('video')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${activeFilter === 'video' ? 'bg-brand-500/20 text-brand-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              <Film className="w-3.5 h-3.5" /> Vídeos
            </button>
          </div>

          <button 
            onClick={() => clearHistory()}
            className="text-xs font-medium text-neutral-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-rose-500/10"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpar Tudo
          </button>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/[0.08] rounded-xl bg-surface-card/30">
          <div className="bg-white/[0.04] p-4 rounded-full mb-4">
            <Clock className="w-8 h-8 text-neutral-600" />
          </div>
          <h3 className="text-lg font-medium mb-1 text-neutral-200">Nenhum histórico de {activeFilter === 'audio' ? 'áudio' : 'vídeo'}</h3>
          <p className="text-neutral-500 text-sm">
            Seus downloads aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => (
            <article 
              key={item.id + item.timestamp}
              className={`group bg-surface-card hover:bg-surface-cardHover rounded-xl p-3 sm:p-3.5 border transition-all duration-200 flex flex-col shadow-sm ${playerManager.playingId === item.id ? 'border-brand-500/40 bg-white/[0.03]' : 'border-surface-border hover:border-surface-borderHover'}`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                <div className="flex items-center gap-3.5 w-full sm:w-auto flex-1">
                  <div 
                    className={`relative w-28 h-16 sm:w-32 sm:h-18 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-900 border border-white/[0.08] shadow-sm ${item.mediaType === 'video' ? '' : 'cursor-pointer'}`}
                    onClick={() => {
                      if (item.mediaType !== 'video') {
                        playerManager.togglePlayPause(item);
                      }
                    }}
                  >
                    {item.thumbnail ? (
                      <img 
                        src={item.thumbnail} 
                        alt={item.title} 
                        className={`w-full h-full object-cover transition-transform duration-300 ${playerManager.playingId === item.id && playerManager.isPlaying ? 'scale-110 opacity-60' : 'group-hover:scale-105'}`} 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600 bg-neutral-900">
                        Sem Imagem
                      </div>
                    )}
                    
                    {item.mediaType !== 'video' && (
                      <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${playerManager.playingId === item.id ? 'opacity-100 bg-black/30' : 'opacity-0 group-hover:opacity-100 bg-black/30'}`}>
                        {playerManager.playingId === item.id && playerManager.isPlaying ? (
                          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center shadow-lg"><Pause className="w-4 h-4 text-white" /></div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg"><Play className="w-4 h-4 text-white ml-0.5" /></div>
                        )}
                      </div>
                    )}

                    {item.mediaType === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                        <Film className="w-6 h-6 text-white/80" />
                      </div>
                    )}

                    {item.duration && (
                      <span className="absolute bottom-1.5 right-1.5 bg-black/85 text-neutral-200 text-[10px] font-semibold px-1.5 py-0.5 rounded backdrop-blur-sm pointer-events-none">
                        {item.duration}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className={`text-sm font-semibold tracking-tight truncate pr-2 transition-colors ${playerManager.playingId === item.id ? 'text-brand-400' : 'text-white group-hover:text-brand-400'}`}>
                      {item.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-neutral-400">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-brand-500/15 border border-brand-500/30 text-brand-300 text-[10px] font-bold uppercase tracking-wide">
                        {item.format}
                      </span>
                      <span className="text-neutral-500">•</span>
                      <span className="text-[11px] text-neutral-400">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-white/[0.05]">
                  {downloadingId === item.id ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-xs font-semibold text-brand-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{downloadProgress.toFixed(0)}%</span>
                    </div>
                  ) : (
                    <>
                      {item.mediaType === 'video' && (
                        <button 
                          onClick={() => handleShowInFolder(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] text-xs font-semibold text-neutral-200 hover:text-white border border-white/[0.08] transition-all"
                          title="Abrir pasta do arquivo"
                        >
                          <FolderSearch className="w-3.5 h-3.5 text-brand-500" />
                          <span>Abrir Pasta</span>
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleRedownload(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.07] hover:bg-white/[0.12] text-xs font-semibold text-neutral-200 hover:text-white border border-white/[0.08] transition-all"
                        title="Baixar de novo"
                      >
                        <Download className="w-3.5 h-3.5 text-neutral-400 group-hover:text-brand-500" />
                        <span className="hidden sm:inline">Refazer</span>
                      </button>
                    </>
                  )}
                  
                  <button 
                    onClick={() => removeFromHistory(item.id)}
                    className="w-8 h-8 rounded-lg bg-transparent hover:bg-rose-500/15 text-neutral-400 hover:text-rose-400 flex items-center justify-center transition-colors ml-1" 
                    title="Remover do histórico"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
