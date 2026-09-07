import React, { useState, useEffect, useRef } from 'react'
import { Download, Loader2, Link as LinkIcon, Sparkles, Music, Play, Search, Clock, ChevronDown, X } from 'lucide-react'
import { useHistory } from '@/hooks/useHistory'

export function ConverterTab({ historyManager, queueManager }: { historyManager: ReturnType<typeof useHistory>, queueManager: any }) {
  const [query, setQuery] = useState('')
  const [mediaType, setMediaType] = useState<'audio' | 'video'>('audio')
  const [quality, setQuality] = useState('mp3-320')
  const [preview, setPreview] = useState<any>(null)
  const [streamUrl, setStreamUrl] = useState<string | null>(null)
  const [streamLoading, setStreamLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [errorStatus, setErrorStatus] = useState<string | null>(null)

  const searchContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedHistory = localStorage.getItem('yt-search-history')
    if (savedHistory) {
      try { setSearchHistory(JSON.parse(savedHistory)) } catch (e) { }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowHistory(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const saveSearchHistory = (term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    const newHistory = [trimmed, ...searchHistory.filter(t => t !== trimmed)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem('yt-search-history', JSON.stringify(newHistory))
  }

  const clearSearchHistory = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSearchHistory([])
    localStorage.removeItem('yt-search-history')
    setShowHistory(false)
  }

  const handleSearch = async (searchTerm: string = query) => {
    if (!searchTerm) return

    setQuery(searchTerm)
    setShowHistory(false)
    setLoading(true)
    setErrorStatus(null)

    if (searchTerm.includes('youtube.com') || searchTerm.includes('youtu.be')) {
      const data = await (window as any).electron.getInfo(searchTerm)
      if (data.success) {
        setPreview(data.info)
        setSearchResults([])
        saveSearchHistory(searchTerm)
      } else {
        setErrorStatus(data.error || 'Erro ao buscar.')
      }
    } else {
      const data = await (window as any).electron.searchYoutube(searchTerm)
      if (data.success) {
        setSearchResults(data.results)
        setCurrentPage(1)
        saveSearchHistory(searchTerm)
      } else {
        setErrorStatus(data.error || 'Erro ao buscar.')
      }
    }
    setLoading(false)
  }

  const handleDownload = async (videoInfo: any) => {
    if (!videoInfo || (!videoInfo.url && !videoInfo.id)) return

    setErrorStatus(null)
    setPreview(videoInfo)

    try {
      const response = await (window as any).electron.convert({
        url: videoInfo.url || `https://youtube.com/watch?v=${videoInfo.id}`,
        title: videoInfo.title,
        quality: mediaType === 'video' ? quality : (quality.includes('320') ? '320' : '192'),
        type: mediaType
      })

      if (!response.success) {
        throw new Error(response.error || 'Download cancelado ou com erro.')
      }

      const { jobId } = response
      queueManager.addJob(jobId, videoInfo)

      const cleanup = (window as any).electron.onProgress(jobId, (data: any) => {
        queueManager.updateJob(jobId, data)

        if (data.status === 'error') {
          cleanup()
          return
        }

        if (data.status === 'done') {
          historyManager.addToHistory({
            id: videoInfo.id,
            title: videoInfo.title,
            thumbnail: videoInfo.thumbnail,
            url: videoInfo.url || `https://youtube.com/watch?v=${videoInfo.id}`,
            timestamp: Date.now(),
            format: mediaType === 'video' ? `${quality}p` : (quality.includes('320') ? '320kbps' : '192kbps'),
            mediaType: mediaType
          })
          queueManager.updateJob(jobId, { status: 'finished', percent: 100 })
          cleanup()
        }
      })
    } catch (err: any) {
      console.error(err)
      if (err.message !== 'Download cancelado pelo usuário.') {
        setErrorStatus(err.message)
      }
    }
  }

  const totalPages = Math.ceil(searchResults.length / ITEMS_PER_PAGE);
  const paginatedResults = searchResults.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
                      setQuery(item)
                      handleSearch(item)
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
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>

        {/* Type & Quality Selector */}
        <div className="mt-6 flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Formato:</span>
            <div className="flex bg-[#0b0b0e] p-1 rounded-lg border border-white/[0.06]">
              <button
                onClick={() => { setMediaType('audio'); setQuality('mp3-320') }}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${mediaType === 'audio' ? 'bg-brand-500/20 text-brand-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                Áudio (MP3)
              </button>
              <button
                onClick={() => { setMediaType('video'); setQuality('1080') }}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${mediaType === 'video' ? 'bg-brand-500/20 text-brand-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                Vídeo (MP4)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Qualidade:</span>
            <div className="flex bg-[#0b0b0e] p-1 rounded-lg border border-white/[0.06]">
              {mediaType === 'audio' ? (
                <>
                  <button
                    onClick={() => setQuality('mp3-320')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${quality === 'mp3-320' ? 'bg-brand-500/20 text-brand-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    320kbps
                  </button>
                  <button
                    onClick={() => setQuality('mp3-192')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${quality === 'mp3-192' ? 'bg-brand-500/20 text-brand-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    192kbps
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setQuality('1080')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${quality === '1080' ? 'bg-brand-500/20 text-brand-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    1080p
                  </button>
                  <button
                    onClick={() => setQuality('720')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${quality === '720' ? 'bg-brand-500/20 text-brand-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    720p
                  </button>
                  <button
                    onClick={() => setQuality('480')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${quality === '480' ? 'bg-brand-500/20 text-brand-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    480p
                  </button>
                  <button
                    onClick={() => setQuality('360')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${quality === '360' ? 'bg-brand-500/20 text-brand-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-300'}`}
                  >
                    360p
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorStatus && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
          {errorStatus}
        </div>
      )}

      {/* Search Results List */}
      {searchResults.length > 0 && !preview && (
        <div className={`space-y-3 animate-in fade-in slide-in-from-bottom-4 transition-all duration-300 relative ${loading ? 'opacity-50 pointer-events-none' : ''}`}>

          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0b0b0e]/50 backdrop-blur-[1px] rounded-xl">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
            </div>
          )}

          <h3 className="text-lg font-bold text-white mb-4 px-1">Resultados da Busca</h3>
          {paginatedResults.map((item, idx) => (
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
                  onClick={() => (window as any).electron.openPreviewWindow(item.url || `https://youtube.com/watch?v=${item.id}`)}
                  className="bg-white/[0.05] hover:bg-white/[0.1] text-white px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Play className="w-3.5 h-3.5" /> Prévia
                </button>
                <button 
                  onClick={() => handleDownload({...item, url: item.url || `https://youtube.com/watch?v=${item.id}`})}
                  className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-brand-500/20 transition-all"
                >
                  <Download className="w-3.5 h-3.5" /> Baixar
                </button>
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-white/[0.06]">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium text-white transition-colors"
              >
                Anterior
              </button>
              <span className="text-xs text-neutral-400 font-medium">
                Página {currentPage} de {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-medium text-white transition-colors"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}

      {/* Single Native Audio Preview (from URL or Selected from Search) */}
      {preview && (
        <div className="bg-[#15161C] border border-brand-500/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in fade-in slide-in-from-bottom-4">
          <div
            onClick={() => (window as any).electron.openPreviewWindow(preview.url || `https://youtube.com/watch?v=${preview.id}`)}
            className="w-full md:w-[40%] bg-black relative flex flex-col items-center justify-center overflow-hidden min-h-[200px] group cursor-pointer"
            title="Abrir no YouTube"
          >
            <img src={preview.thumbnail} alt="Thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
            <div className="relative z-10 w-16 h-16 rounded-full bg-brand-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8 ml-1" />
            </div>
            <span className="relative z-10 mt-3 text-xs font-semibold text-white/90 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm group-hover:bg-brand-500/50 transition-colors">
              Ouvir no YouTube
            </span>
          </div>

          <div className="p-6 md:p-8 flex-1 flex flex-col justify-center relative">
            {(searchResults.length > 0) && (
              <button
                onClick={() => {
                  if (searchResults.length > 0 && !query.startsWith('http')) {
                    setPreview(null)
                  }
                }}
                className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
                title="Voltar"
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
              className="bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 w-full md:w-auto mt-auto"
            >
              <Download className="w-4 h-4" />
              Iniciar Conversão ({mediaType === 'video' ? `${quality}p` : quality.includes('320') ? '320kbps' : '192kbps'})
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
