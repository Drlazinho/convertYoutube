import { NextRequest, NextResponse } from 'next/server';
import youtubedl from 'youtube-dl-exec';
import { join } from 'path';
import { tmpdir } from 'os';
import { jobs } from '@/lib/jobStore';
import crypto from 'crypto';

const ffmpegPath = require('ffmpeg-static');

export async function POST(request: NextRequest) {
  try {
    const { url, quality } = await request.json();

    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
      return NextResponse.json({ error: 'URL inválida' }, { status: 400 });
    }

    const jobId = crypto.randomUUID();
    
    jobs.set(jobId, { status: 'starting' });

    processJob(jobId, url, quality).catch(err => {
      console.error('Job background error:', err);
      jobs.set(jobId, { status: 'error', error: err.message });
    });

    return NextResponse.json({ success: true, jobId });

  } catch (error: any) {
    console.error('Convert Request Error:', error);
    return NextResponse.json({ error: error.message || 'Erro ao iniciar conversão' }, { status: 500 });
  }
}

async function processJob(jobId: string, url: string, quality: string) {
  let tmpFile = '';
  try {
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      callHome: false,
      noCheckCertificates: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      noPlaylist: true,
      // @ts-ignore: extractorArgs is a valid yt-dlp flag not included in youtube-dl-exec TS definitions
      extractorArgs: 'youtube:player_client=android,web',
    }) as any;

    const title = info.title;
    const bitrate = quality === '192' ? '192' : '320';
    
    const timestamp = Date.now();
    const safeTitle = title.replace(/[^a-zA-Z0-9_ -]/g, '').trim().substring(0, 50);
    tmpFile = join(tmpdir(), `yt_dlp_${timestamp}_${safeTitle}.mp3`);

    jobs.set(jobId, { 
      status: 'downloading',
      percent: 0,
      videoInfo: info
    });

    const subprocess = youtubedl.exec(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      audioQuality: bitrate === '320' ? 0 : 5,
      output: tmpFile,
      ffmpegLocation: ffmpegPath,
      noWarnings: true,
      callHome: false,
      noCheckCertificates: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      noPlaylist: true,
      // @ts-ignore: extractorArgs is a valid yt-dlp flag not included in youtube-dl-exec TS definitions
      extractorArgs: 'youtube:player_client=android,web',
    });

    // Parse progress from stdout
    if (subprocess.stdout) {
      subprocess.stdout.on('data', (data) => {
        const text = data.toString();
        // Ex: [download]  15.3% of  34.50MiB at    1.50MiB/s ETA 00:19
        // Ex: [download]  15.3% of ~34.50MiB at    1.50MiB/s ETA 00:19
        const match = text.match(/\[download\]\s+([\d\.]+)\%\s+of\s+~?([\d\.\w]+)\s+at\s+([\d\.\w\/]+)\s+ETA\s+([\d:]+)/);
        if (match) {
          const [, percent, size, speed, eta] = match;
          jobs.set(jobId, {
            ...jobs.get(jobId)!,
            status: 'downloading',
            percent: parseFloat(percent),
            totalSize: size,
            speed,
            eta
          });
        } else if (text.includes('Extracting audio') || text.includes('Destination:') && text.includes('.mp3')) {
          jobs.set(jobId, {
            ...jobs.get(jobId)!,
            status: 'processing',
            percent: 100
          });
        }
      });
    }

    await subprocess;

    // Completed
    jobs.set(jobId, {
      ...jobs.get(jobId)!,
      status: 'done',
      percent: 100,
      filePath: tmpFile,
      filename: `${title.replace(/[/\\?%*:|"<>]/g, '')}.mp3`
    });

  } catch (error: any) {
    console.error('Process Job Error:', error);
    jobs.set(jobId, { status: 'error', error: error.message || 'Erro na conversão' });
  }
}
