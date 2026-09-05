import React, { useState, useEffect, useRef } from 'react';
import { Download, Loader2, Link as LinkIcon, Sparkles, Music, Play, Search, Clock, ChevronDown, X } from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';

export function ConverterTab({ historyManager }: { historyManager: ReturnType<typeof useHistory> }) {
  const [query, setQuery] = useState('');
  const [quality, setQuality] = useState('mp3-320');
  const [status, setStatus] = useState<{ type: 'idle' | 'starting' | 'downloading' | 'processing' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  const [preview, setPreview] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem('yt-search-history');
    if (savedHistory) {
      try { setSearchHistory(JSON.parse(savedHistory)); } catch (e) {}
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveSearchHistory = (term: string) => {
    if (!term || term.startsWith('http')) return;
    const newHistory = [term, ...searchHistory.filter(t => t !== term)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('yt-search-history', JSON.stringify(newHistory));
  };

  const clearSearchHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory([]);
    localStorage.removeItem('yt-search-history');
    setShowHistory(false);
  };

  const handleSearch = async (searchTerm: string = query) => {
    if (!searchTerm) return;
    setShowHistory(false);
    
    // If it's a URL, fetch metadata directly
    if (searchTerm.includes('youtube.com') || searchTerm.includes('youtu.be')) {
      setLoading(true);
      try {
        const data = await (window as any).electron.getInfo(searchTerm);
        if (data.success) {
          setPreview(data.info);
          setSearchResults([]);
          setStatus({ type: 'idle', message: '' }); 
        } else {
          setPreview(null);
          setStatus({ type: 'error', message: data.error || 'Vídeo não encontrado ou link inválido.' });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    } else {
      // It's a text search
      setLoading(true);
      setPreview(null);
      try {
        const data = await (window as any).electron.searchYoutube(searchTerm);
        if (data.success) {
          setSearchResults(data.results);
          saveSearchHistory(searchTerm);
        } else {
          setStatus({ type: 'error', message: data.error || 'Erro ao buscar.' });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDownload = async (videoInfo: any) => {
    if (!videoInfo || !videoInfo.url) return;
    
    setStatus({ type: 'starting', message: 'Preparando conversão...' });
    setProgress({});
    setPreview(videoInfo); // Set as current preview if converting from search list
    
    try {
      const response = await (window as any).electron.convert({ 
        url: videoInfo.url, 
        title: videoInfo.title,
        quality: quality.includes('320') ? '320' : '192' 
      });

      if (!response.success) {
        throw new Error(response.error || 'Download cancelado ou com erro.');
      }

      const { jobId } = response;
      
      const cleanup = (window as any).electron.onProgress(jobId, (data: any) => {
        if (data.status === 'error') {
          setStatus({ type: 'error', message: data.error || 'Erro durante o processamento' });
          cleanup();
          return;
        }
        
        setProgress(data);

        if (data.status === 'starting') {
           setStatus({ type: 'starting', message: 'Conectando ao YouTube...' });
        } else if (data.status === 'downloading') {
           setStatus({ type: 'downloading', message: `Extraindo áudio de alta fidelidade...` });
        } else if (data.status === 'processing') {
           setStatus({ type: 'processing', message: 'Convertendo para formato final...' });
        } else if (data.status === 'done') {
          setStatus({ type: 'success', message: 'Conversão concluída! Salvo com sucesso.' });
          cleanup();
          
          historyManager.addToHistory({
            id: videoInfo.id,
            title: videoInfo.title,
            thumbnail: videoInfo.thumbnail,
            url: videoInfo.url,
            timestamp: Date.now(),
            format: `MP3 ${quality.includes('320') ? '320' : '192'}kbps`,
            duration: videoInfo.duration,
            filePath: data.filePath // Saving filePath to history!
          });
        }
      });
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'Falha ao iniciar conversão' });
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Input Section */}
      <div className="bg-[#15161C] border border-white/[0.08] rounded-2xl p-6 md:p-8 shadow-2xl relative shadow-brand-500/5">
        <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">Conversor de Alta Fidelidade</h1>
        <p className="text-sm text-neutral-400 mb-8">Cole o link do YouTube ou pesquise pelo nome da música/artista.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 relative">
          <div className="relative flex-grow" ref={searchContainerRef}>
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-500">
              {query.startsWith('http') ? <LinkIcon className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </div>
            <input 
              type="text" 
              placeholder="Ex: https://youtube.com/watch?v=... ou 'Queen Bohemian Rhapsody'" 
              className="w-full bg-[#0b0b0e] border border-white/[0.1] text-white text-sm rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 transition-all shadow-inner"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setShowHistory(true)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            
            {/* Search History Dropdown */}
            {showHistory && searchHistory.length > 0 && !query.startsWith('http') && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#15161C] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border-b border-white/[0.05]">
                  <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Buscas Recentes</span>
                  <button onClick={clearSearchHistory} className="text-xs text-neutral-500 hover:text-rose-400 transition-colors">Limpar</button>
                </div>
                {searchHistory.map((item, idx) => (
                  <button 
                    key={idx}
                    className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/[0.04] transition-colors text-sm text-neutral-300"
                    onClick={() => {
                      setQuery(item);
                      handleSearch(item);
                    }}
                  >
                    <Clock className="w-4 h-4 text-neutral-500" />
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => handleSearch()}
            disabled={!query || loading}
            className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:hover:bg-brand-600 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-brand-500/25 flex-shrink-0 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Buscar
          </button>
        </div>

        {/* Quality Selector */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Qualidade:</span>
          <div className="flex bg-[#0b0b0e] p-1 rounded-lg border border-white/[0.06]">
            <button 
              onClick={() => setQuality('mp3-320')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${quality === 'mp3-320' ? 'bg-brand-500/20 text-brand-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              MP3 320kbps (Alta)
            </button>
            <button 
              onClick={() => setQuality('mp3-192')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${quality === 'mp3-192' ? 'bg-brand-500/20 text-brand-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
            >
              MP3 192kbps (Normal)
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {status.type === 'error' && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
          {status.message}
        </div>
      )}

      {/* Progress View */}
      {(status.type === 'starting' || status.type === 'downloading' || status.type === 'processing') && (
        <div className="bg-[#15161C] border border-brand-500/30 rounded-xl p-6 shadow-xl animate-in fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm">
              <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
              {status.message}
            </h3>
            {progress.percent !== undefined && (
              <span className="text-brand-400 font-mono font-bold text-sm">{progress.percent.toFixed(1)}%</span>
            )}
          </div>
          
          <div className="w-full bg-black/40 rounded-full h-2.5 mb-3 overflow-hidden border border-white/[0.05]">
            <div 
              className="bg-gradient-to-r from-brand-600 to-brand-400 h-2.5 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress.percent || (status.type === 'starting' ? 5 : 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_1s_infinite] -skew-x-12"></div>
            </div>
          </div>
          
          <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
            <span>{progress.totalSize ? `Tamanho: ${progress.totalSize}` : 'Calculando...'}</span>
            <span>{progress.speed ? `Velocidade: ${progress.speed}` : ''}</span>
            <span>{progress.eta ? `Tempo restante: ${progress.eta}` : ''}</span>
          </div>
        </div>
      )}

      {/* Success Message */}
      {status.type === 'success' && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4" />
          {status.message}
        </div>
      )}

      {/* Search Results List */}
      {searchResults.length > 0 && !preview && (
        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
          <h3 className="text-lg font-bold text-white mb-4 px-1">Resultados da Busca</h3>
          {searchResults.map((item, idx) => (
            <div key={idx} className="bg-[#15161C] border border-white/[0.06] hover:border-brand-500/30 p-3 rounded-xl flex items-center gap-4 transition-colors group">
              <div className="relative w-32 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0">
                <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">{item.duration}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate pr-4">{item.title}</h4>
                <p className="text-xs text-neutral-400 mt-1 truncate">{item.channel}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => setPreview(item)}
                  className="bg-white/[0.05] hover:bg-white/[0.1] text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" /> Prévia
                </button>
                <button 
                  onClick={() => handleDownload(item)}
                  className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-brand-500/20 transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Baixar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Single Preview (from URL or Selected from Search) */}
      {preview && (
        <div className="bg-[#15161C] border border-brand-500/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-4">
          <div className="w-full md:w-[40%] bg-black relative aspect-video md:aspect-auto">
            <iframe 
              src={`https://www.youtube.com/embed/${preview.id}?autoplay=0`} 
              className="w-full h-full absolute inset-0" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              title="Prévia do YouTube"
            ></iframe>
          </div>
          
          <div className="p-6 md:p-8 flex-1 flex flex-col justify-center relative">
            {searchResults.length > 0 && (
              <button 
                onClick={() => setPreview(null)}
                className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
                title="Voltar para os resultados"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-brand-500/20 text-brand-400 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-brand-500/20">
                Pronto para Download
              </span>
              <span className="bg-white/[0.08] text-neutral-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                {preview.duration}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2 leading-tight line-clamp-2">
              {preview.title}
            </h3>
            <p className="text-sm text-neutral-400 mb-8">{preview.channel}</p>
            
            <button 
              onClick={() => handleDownload({ ...preview, url: preview.url || `https://youtube.com/watch?v=${preview.id}` })}
              disabled={status.type === 'starting' || status.type === 'downloading' || status.type === 'processing'}
              className="bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 w-full md:w-auto"
            >
              <Download className="w-4 h-4" />
              Iniciar Conversão ({quality.includes('320') ? '320kbps' : '192kbps'})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
