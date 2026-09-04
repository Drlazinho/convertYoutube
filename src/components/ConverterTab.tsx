import React, { useState, useEffect, useRef } from 'react';
import { Download, Loader2, Link as LinkIcon, Sparkles, Clipboard, Music, ChevronDown, Zap, ShieldCheck, Sliders } from 'lucide-react';
import { useHistory } from '@/hooks/useHistory';

export function ConverterTab({ historyManager }: { historyManager: ReturnType<typeof useHistory> }) {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState('mp3-320');
  const [status, setStatus] = useState<{ type: 'idle' | 'starting' | 'downloading' | 'processing' | 'success' | 'error', message: string }>({ type: 'idle', message: '' });
  const [preview, setPreview] = useState<any>(null);
  const [progress, setProgress] = useState<any>({});
  const [infoLoading, setInfoLoading] = useState(false);
  
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        setPreview(null);
        setInfoLoading(false);
        return;
      }
      
      setInfoLoading(true);
      try {
        const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (data.success) {
          setPreview(data.info);
          setStatus({ type: 'idle', message: '' }); 
        } else {
          setPreview(null);
          setStatus({ type: 'error', message: 'Vídeo não encontrado ou link inválido.' });
        }
      } catch (e) {
        console.error(e);
        setPreview(null);
      } finally {
        setInfoLoading(false);
      }
    };
    
    const timeoutId = setTimeout(fetchMetadata, 600);
    return () => clearTimeout(timeoutId);
  }, [url]);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const handleDownload = async () => {
    if (!url || !preview) return;
    
    setStatus({ type: 'starting', message: 'Preparando conversão...' });
    setProgress({});
    
    try {
      let videoInfo = preview;
      if (!videoInfo) {
        const infoRes = await fetch(`/api/info?url=${encodeURIComponent(url)}`);
        const infoData = await infoRes.json();
        if (!infoData.success) throw new Error('Não foi possível obter os dados do vídeo.');
        videoInfo = infoData.info;
        setPreview(videoInfo);
      }

      const response = await fetch(`/api/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, quality: quality.includes('320') ? '320' : '192' }) // simplify for backend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro na conversão.');
      }

      const { jobId } = await response.json();
      
      const evtSource = new EventSource(`/api/progress?jobId=${jobId}`);
      eventSourceRef.current = evtSource;

      evtSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.status === 'error') {
          setStatus({ type: 'error', message: data.error || 'Erro durante o processamento' });
          evtSource.close();
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
          setStatus({ type: 'success', message: 'Conversão concluída!' });
          evtSource.close();
          
          window.location.href = `/api/download?jobId=${jobId}`;
          
          historyManager.addToHistory({
            id: videoInfo.id,
            title: videoInfo.title,
            thumbnail: videoInfo.thumbnail,
            url: url,
            timestamp: Date.now(),
            format: `MP3 ${quality.includes('320') ? '320' : '192'}kbps`,
            duration: videoInfo.duration
          });
        }
      };

      evtSource.onerror = (err) => {
        console.error('SSE Error', err);
        setStatus({ type: 'error', message: 'A conexão foi interrompida.' });
        evtSource.close();
      };

    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err.message || 'Ocorreu um erro inesperado.' });
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
      }
    } catch (e) {
      console.error('Failed to read clipboard', e);
    }
  };

  const isWorking = ['starting', 'downloading', 'processing'].includes(status.type);

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      
      {/* Headline & Subtitle */}
      <div className="text-center space-y-3 pt-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500 text-[11px] font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-3.5 h-3.5" /> 100% Gratuito &amp; Ilimitado
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-neutral-100 to-neutral-400">
          YouTube para MP3
        </h1>
        <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto font-normal leading-relaxed">
          Baixe o áudio dos seus vídeos preferidos com a mais alta qualidade possível em segundos.
        </p>
      </div>

      {/* Main Input Panel Card */}
      <div className="relative bg-surface-card/90 backdrop-blur-md rounded-2xl p-3 sm:p-5 border border-surface-border shadow-2xl transition-all hover:border-surface-borderHover">
        <div className="space-y-4">
          
          {/* URL Input Bar */}
          <div className="relative flex items-center bg-[#090a0d] rounded-xl border border-white/[0.09] focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500/50 transition-all p-1.5 shadow-inner">
            <div className="pl-3.5 text-neutral-400">
              <LinkIcon className="w-5 h-5 text-neutral-400" />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isWorking}
              placeholder="Cole o link do YouTube aqui..."
              className="w-full bg-transparent border-0 text-white placeholder-neutral-500 focus:ring-0 text-sm sm:text-base px-3 py-2 font-medium focus:outline-none"
            />
            {/* Quick Action: Paste */}
            <button 
              onClick={handlePaste}
              disabled={isWorking}
              title="Colar da área de transferência"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-neutral-300 hover:text-white transition-all border border-white/[0.05] mr-1 disabled:opacity-50"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Colar</span>
            </button>
          </div>

          {/* Controls Bar: Format Selector + Action Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            {/* Quality Selector */}
            <div className="w-full sm:w-64 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                <Music className="w-4 h-4 text-brand-500" />
              </div>
              <select 
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                disabled={isWorking}
                className="w-full pl-9 pr-8 py-3 bg-[#0A0B0F] border border-white/[0.09] rounded-xl text-xs sm:text-sm font-semibold text-neutral-200 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer appearance-none transition-colors disabled:opacity-50"
              >
                <option value="mp3-320">MP3 320 kbps (Melhor)</option>
                <option value="mp3-256">MP3 256 kbps (Padrão)</option>
                <option value="mp3-128">MP3 128 kbps (Compacto)</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-neutral-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {/* Primary Action Button */}
            <button 
              onClick={handleDownload}
              disabled={isWorking || !url || infoLoading}
              className="w-full sm:flex-1 py-3 px-6 bg-gradient-to-r from-brand-600 via-brand-500 to-rose-600 hover:from-brand-500 hover:to-rose-500 text-white font-bold rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg shadow-brand-500/25 glow-hover active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isWorking || infoLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4 stroke-[2.4]" />
              )}
              <span>{isWorking ? 'Processando...' : infoLoading ? 'Buscando...' : 'Converter Agora'}</span>
            </button>
          </div>

          {/* Feature micro-badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-[11px] text-neutral-400 font-medium">
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Renderização em 2s</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Sem propagandas intrusivas</span>
            <span className="flex items-center gap-1.5"><Sliders className="w-3.5 h-3.5 text-sky-400" /> Tags ID3 automáticas inclusas</span>
          </div>

        </div>

        {/* Dynamic Preview Area */}
        {preview && !infoLoading && (
          <div className="mt-5 pt-4 border-t border-white/[0.08] flex items-center gap-4 animate-in fade-in">
            <div className="relative w-24 h-14 rounded-lg overflow-hidden border border-white/[0.08]">
              <img src={preview.thumbnail} alt="thumb" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate">{preview.title}</p>
              <p className="text-xs text-neutral-400 mt-1">{preview.channel} • {preview.duration}</p>
            </div>
          </div>
        )}

        {/* Progress Simulated Bar */}
        {(isWorking || status.type === 'error' || status.type === 'success') && (
          <div className="mt-5 pt-4 border-t border-white/[0.08] space-y-2 animate-in fade-in">
            <div className="flex justify-between text-xs font-semibold">
              <span className={`${status.type === 'error' ? 'text-rose-500' : status.type === 'success' ? 'text-emerald-500' : 'text-brand-500'} flex items-center gap-2`}>
                {isWorking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {status.message}
              </span>
              {isWorking && <span className="text-neutral-300">{progress.percent || 0}%</span>}
            </div>
            
            {isWorking && (
              <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-white/[0.05]">
                <div 
                  className="h-full bg-gradient-to-r from-brand-600 to-rose-400 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percent || (status.type === 'processing' ? 100 : 0)}%` }}
                ></div>
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
