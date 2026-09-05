import { NextRequest, NextResponse } from 'next/server';
import youtubedl from 'youtube-dl-exec';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
    return NextResponse.json({ success: false, error: 'URL inválida' }, { status: 400 });
  }

  try {
    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noWarnings: true,
      callHome: false,
      noCheckCertificates: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
      noPlaylist: true,
      extractorArgs: 'youtube:player_client=android,web',
    }) as any;

    // Convert seconds to MM:SS format for duration
    const seconds = info.duration;
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    let duration = `${m}:${s}`;
    if (seconds >= 3600) {
      const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
      const mm = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
      duration = `${h}:${mm}:${s}`;
    }

    return NextResponse.json({
      success: true,
      info: {
        id: info.id,
        title: info.title,
        channel: info.uploader,
        thumbnail: info.thumbnail,
        duration,
      }
    });
  } catch (error: any) {
    console.error('Error fetching info:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
