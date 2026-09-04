import { useState, useEffect } from 'react';
import { HistoryItem } from '@/types';

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('yt-mp3-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const addToHistory = (item: HistoryItem) => {
    setHistory((prev) => {
      const filtered = prev.filter((i) => i.id !== item.id);
      const updated = [item, ...filtered];
      localStorage.setItem('yt-mp3-history', JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromHistory = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((i) => i.id !== id);
      localStorage.setItem('yt-mp3-history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('yt-mp3-history');
  };

  return { history, isLoaded, addToHistory, removeFromHistory, clearHistory };
}
