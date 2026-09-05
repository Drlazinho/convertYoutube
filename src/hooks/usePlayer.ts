import { useState, useRef, useEffect } from 'react';
import { HistoryItem } from '@/types';

export function usePlayer(history: HistoryItem[]) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const historyRef = useRef(history);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const playNext = (currentId: string) => {
    const currentIndex = historyRef.current.findIndex(i => i.id === currentId);
    if (currentIndex !== -1 && currentIndex < historyRef.current.length - 1) {
      playItem(historyRef.current[currentIndex + 1]);
    } else {
      setPlayingId(null);
      setIsPlaying(false);
    }
  };

  const playPrev = (currentId: string) => {
    const currentIndex = historyRef.current.findIndex(i => i.id === currentId);
    if (currentIndex > 0) {
      playItem(historyRef.current[currentIndex - 1]);
    }
  };

  const handlePlayError = (item: HistoryItem) => {
    setPlayingId(null);
    setIsPlaying(false);
    alert(`O arquivo não pôde ser reproduzido.\nPode ter sido apagado ou movido do diretório original.`);
  };

  const playItem = (item: HistoryItem) => {
    if (!item.filePath) {
      handlePlayError(item);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
    }

    const newAudio = new Audio(`local-media://${encodeURIComponent(item.filePath.replace(/\\/g, '/'))}`);
    
    newAudio.ontimeupdate = () => setCurrentTime(newAudio.currentTime);
    newAudio.onloadedmetadata = () => setDuration(newAudio.duration);
    newAudio.onended = () => playNext(item.id);
    newAudio.onerror = () => handlePlayError(item);

    setPlayingId(item.id);
    setCurrentTime(0);
    setDuration(0);

    newAudio.play().then(() => {
      setIsPlaying(true);
    }).catch(err => {
      console.error(err);
      handlePlayError(item);
    });

    audioRef.current = newAudio;
  };

  const togglePlayPause = (item: HistoryItem) => {
    if (playingId === item.id) {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(() => handlePlayError(item));
        }
      }
    } else {
      playItem(item);
    }
  };

  const toggleCurrentPlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
      }
    }
  };

  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return {
    playingId,
    isPlaying,
    currentTime,
    duration,
    playItem,
    togglePlayPause,
    toggleCurrentPlayPause,
    playNext,
    playPrev,
    handleSeek,
    currentTrack: history.find(h => h.id === playingId)
  };
}
