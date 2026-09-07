import { useState, useCallback } from 'react';

export interface QueueItem {
  id: string; // The jobId from backend
  item: any; // The original search result item
  status: 'starting' | 'downloading' | 'processing' | 'finished' | 'error';
  percent: number;
  totalSize?: string;
  speed?: string;
  eta?: string;
  error?: string;
}

export function useQueue() {
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const addJob = useCallback((jobId: string, item: any) => {
    setQueue(prev => [
      ...prev,
      { id: jobId, item, status: 'starting', percent: 0 }
    ]);
  }, []);

  const updateJob = useCallback((jobId: string, updates: Partial<QueueItem>) => {
    setQueue(prev => prev.map(q => q.id === jobId ? { ...q, ...updates } : q));
  }, []);

  const clearFinished = useCallback(() => {
    setQueue(prev => prev.filter(q => q.status !== 'finished' && q.status !== 'error'));
  }, []);

  return { queue, addJob, updateJob, clearFinished };
}
