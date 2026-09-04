import { NextRequest, NextResponse } from 'next/server';
import { jobs } from '@/lib/jobStore';
import { createReadStream, promises as fsPromises, existsSync } from 'fs';
import { PassThrough } from 'stream';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
  }

  const job = jobs.get(jobId);

  if (!job || job.status !== 'done' || !job.filePath) {
    return NextResponse.json({ error: 'Arquivo não encontrado ou não finalizado.' }, { status: 404 });
  }

  if (!existsSync(job.filePath)) {
     return NextResponse.json({ error: 'O arquivo expirou ou já foi baixado.' }, { status: 410 });
  }

  const fileStream = createReadStream(job.filePath);
  const passThrough = new PassThrough();
  fileStream.pipe(passThrough);

  // Auto-clean up after the stream ends or is aborted
  const cleanup = () => {
    fsPromises.unlink(job.filePath!).catch(() => {});
    jobs.delete(jobId);
  };

  passThrough.on('end', cleanup);
  passThrough.on('error', cleanup);

  const readableStream = new ReadableStream({
    start(controller) {
      passThrough.on('data', (chunk) => controller.enqueue(chunk));
      passThrough.on('end', () => controller.close());
      passThrough.on('error', (err) => controller.error(err));
    },
    cancel() {
      fileStream.destroy();
      cleanup();
    }
  });

  const encodedTitle = encodeURIComponent(job.filename || 'audio.mp3');

  return new NextResponse(readableStream as any, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': `attachment; filename="${encodedTitle}"`,
    },
  });
}
