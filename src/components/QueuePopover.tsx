import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, X, Download } from 'lucide-react';
import { QueueItem } from '@/hooks/useQueue';

interface QueuePopoverProps {
  queue: QueueItem[];
  isOpen: boolean;
  onClose: () => void;
  onClear: () => void;
}

export function QueuePopover({ queue, isOpen, onClose, onClear }: QueuePopoverProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-6 w-96 max-h-[80vh] bg-[#15161C] border border-white/[0.08] shadow-2xl rounded-2xl overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-4">
      <div className="flex items-center justify-between p-4 border-b border-white/[0.06] bg-black/20">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-brand-500" /> Fila de Downloads ({queue.length})
        </h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={onClear}
            className="text-xs text-neutral-400 hover:text-white transition-colors"
          >
            Limpar
          </button>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-white/10 text-neutral-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1 p-4 flex flex-col gap-3 custom-scrollbar">
        {queue.length === 0 ? (
          <div className="text-center text-neutral-500 py-8 text-sm">
            Nenhum download na fila.
          </div>
        ) : (
          queue.map((q) => (
            <div key={q.id} className="bg-black/30 border border-white/[0.04] p-3 rounded-xl flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold text-white truncate flex-1" title={q.item.title}>
                  {q.item.title}
                </span>
                
                {q.status === 'finished' && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                {q.status === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
                {(q.status === 'downloading' || q.status === 'starting' || q.status === 'processing') && (
                  <Loader2 className="w-4 h-4 text-brand-500 animate-spin flex-shrink-0" />
                )}
              </div>

              <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden border border-white/[0.05]">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
                    q.status === 'finished' ? 'bg-emerald-500' : 
                    q.status === 'error' ? 'bg-rose-500' : 
                    'bg-gradient-to-r from-brand-600 to-brand-400'
                  }`}
                  style={{ width: `${q.percent}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-neutral-400 font-mono">
                {q.status === 'error' ? (
                  <span className="text-rose-400 truncate">{q.error}</span>
                ) : q.status === 'finished' ? (
                  <span className="text-emerald-400">Concluído!</span>
                ) : (
                  <>
                    <span>{q.status === 'processing' ? 'Convertendo...' : (q.percent > 0 ? `${q.percent.toFixed(1)}%` : 'Iniciando...')}</span>
                    {q.speed && <span>{q.speed}</span>}
                    {q.eta && <span>ETA: {q.eta}</span>}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
