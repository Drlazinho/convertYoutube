export type JobStatus = 'starting' | 'downloading' | 'processing' | 'done' | 'error';

export interface JobProgress {
  status: JobStatus;
  percent?: number;
  totalSize?: string;
  speed?: string;
  eta?: string;
  filePath?: string;
  filename?: string;
  error?: string;
  videoInfo?: any;
}

// In Next.js dev mode, global variables are preserved across HMR
const globalForJobs = globalThis as unknown as {
  jobs: Map<string, JobProgress>;
};

export const jobs = globalForJobs.jobs || new Map<string, JobProgress>();

if (process.env.NODE_ENV !== 'production') {
  globalForJobs.jobs = jobs;
}
