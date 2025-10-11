'use client';

import { useEffect, useState } from 'react';

type Job = { id: string; kind: string; status: string; createdAt: number; updatedAt: number };

export function JobsPanel() {
  const [jobs, setJobs] = useState<Job[]>([]);
  async function fetchJobs() {
    const res = await fetch('/api/cms/jobs');
    if (!res.ok) return;
    const data = await res.json();
    setJobs(data.jobs || []);
  }
  useEffect(() => {
    fetchJobs();
    const t = setInterval(fetchJobs, 3000);
    return () => clearInterval(t);
  }, []);

  async function runOne() {
    await fetch('/api/cms/runner', { method: 'POST' });
    await fetchJobs();
  }

  return (
    <div className="border rounded p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Jobs</h2>
        <button className="px-3 py-1 border rounded" onClick={runOne}>Run one</button>
      </div>
      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="text-left">
            <th className="py-1">ID</th>
            <th className="py-1">Kind</th>
            <th className="py-1">Status</th>
            <th className="py-1">Created</th>
            <th className="py-1">Updated</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(j => (
            <tr key={j.id} className="border-t">
              <td className="py-1 pr-2">{j.id}</td>
              <td className="py-1 pr-2">{j.kind}</td>
              <td className="py-1 pr-2">{j.status}</td>
              <td className="py-1 pr-2">{new Date(j.createdAt).toLocaleString()}</td>
              <td className="py-1 pr-2">{new Date(j.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


