export interface HistoryItem {
  id: string;
  title: string;
  thumbnail: string;
  url: string;
  timestamp: number;
  format: string;
  duration?: string;
  filePath?: string;
  mediaType?: 'audio' | 'video';
}
