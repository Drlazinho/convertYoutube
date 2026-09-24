import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart3, Users, Download, Video, Music, Loader2 } from 'lucide-react';

interface Metric {
  total_downloads: number;
  total_users: number;
  video_count: number;
  audio_count: number;
}

export function DashboardTab() {
  const [metrics, setMetrics] = useState<Metric | null>(null);
  const [recentDownloads, setRecentDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch total users (unique user_ids from downloads)
        // Since we are doing this client-side without RPC, we'll fetch aggregated stats if possible,
        // or just fetch recent ones. For a real dashboard, we'd use a Supabase Database Function (RPC) 
        // or edge function. For now, we do a basic query.
        
        const { data: downloads, error } = await supabase
          .from('downloads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;

        if (downloads) {
          const uniqueUsers = new Set(downloads.map(d => d.user_id)).size;
          const videos = downloads.filter(d => d.media_type === 'video').length;
          const audios = downloads.filter(d => d.media_type === 'audio').length;

          setMetrics({
            total_downloads: downloads.length, // From last 100
            total_users: uniqueUsers,
            video_count: videos,
            audio_count: audios
          });
          setRecentDownloads(downloads.slice(0, 10));
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="text-brand-500" />
          Painel Administrativo
        </h2>
        <p className="text-neutral-400 mt-1 text-sm">Visão geral do uso da plataforma (Últimos 100 registros)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#15161C] border border-white/[0.08] p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2 text-neutral-400">
            <Download className="w-5 h-5 text-brand-400" />
            <span className="font-semibold text-sm uppercase">Downloads</span>
          </div>
          <div className="text-3xl font-extrabold text-white">{metrics?.total_downloads}</div>
        </div>
        
        <div className="bg-[#15161C] border border-white/[0.08] p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2 text-neutral-400">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="font-semibold text-sm uppercase">Usuários Únicos</span>
          </div>
          <div className="text-3xl font-extrabold text-white">{metrics?.total_users}</div>
        </div>

        <div className="bg-[#15161C] border border-white/[0.08] p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2 text-neutral-400">
            <Video className="w-5 h-5 text-rose-400" />
            <span className="font-semibold text-sm uppercase">Vídeos (MP4)</span>
          </div>
          <div className="text-3xl font-extrabold text-white">{metrics?.video_count}</div>
        </div>

        <div className="bg-[#15161C] border border-white/[0.08] p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2 text-neutral-400">
            <Music className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm uppercase">Áudios (MP3)</span>
          </div>
          <div className="text-3xl font-extrabold text-white">{metrics?.audio_count}</div>
        </div>
      </div>

      <div className="bg-[#15161C] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/[0.06] bg-black/20">
          <h3 className="font-bold text-white text-sm">Downloads Recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/40 text-neutral-400 border-b border-white/[0.06]">
              <tr>
                <th className="px-6 py-3 font-semibold">Mídia</th>
                <th className="px-6 py-3 font-semibold">Tipo</th>
                <th className="px-6 py-3 font-semibold">Qualidade</th>
                <th className="px-6 py-3 font-semibold">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {recentDownloads.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4 text-white font-medium max-w-[300px] truncate" title={log.title}>
                    {log.title}
                  </td>
                  <td className="px-6 py-4 text-neutral-300 capitalize">{log.media_type}</td>
                  <td className="px-6 py-4 text-brand-400 font-mono">{log.quality}</td>
                  <td className="px-6 py-4 text-neutral-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {recentDownloads.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                    Nenhum download registrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
