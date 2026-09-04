import { NextRequest, NextResponse } from 'next/server';
import { jobs } from '@/lib/jobStore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      const sendEvent = (data: any) => {
        if (!isClosed) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        }
      };

      const closeStream = () => {
        if (!isClosed) {
          isClosed = true;
          controller.close();
        }
      };

      // Poll interval
      const interval = setInterval(() => {
        const job = jobs.get(jobId);
        
        if (!job) {
          sendEvent({ status: 'error', error: 'Job not found' });
          clearInterval(interval);
          closeStream();
          return;
        }

        sendEvent(job);

        if (job.status === 'done' || job.status === 'error') {
          clearInterval(interval);
          setTimeout(() => closeStream(), 500);
        }
      }, 500);

      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        closeStream();
      });
    }
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
