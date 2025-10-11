type JobKind = 'translate' | 'improve' | 'compliance' | 'uniqueness';

export type Job = {
  id: string;
  kind: JobKind;
  payload: Record<string, unknown>;
  status: 'queued' | 'running' | 'done' | 'failed';
  createdAt: number;
  updatedAt: number;
};

// Simple in-memory queue (replace with DB-backed if needed)
const queue: Job[] = [];

export function enqueue(kind: JobKind, payload: Record<string, unknown>): Job {
  const job: Job = {
    id: Math.random().toString(36).slice(2),
    kind,
    payload,
    status: 'queued',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  queue.push(job);
  return job;
}

export function nextJob(): Job | undefined {
  return queue.find(j => j.status === 'queued');
}

export function updateJob(id: string, patch: Partial<Job>): void {
  const idx = queue.findIndex(j => j.id === id);
  if (idx >= 0) {
    queue[idx] = { ...queue[idx], ...patch, updatedAt: Date.now() };
  }
}

export function listJobs(limit = 50): Job[] {
  return queue.slice(0, limit);
}


