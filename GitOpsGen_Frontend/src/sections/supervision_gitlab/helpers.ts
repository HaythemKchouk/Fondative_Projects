import { Job } from './types';

export function computeStages(list: Job[]) {
  const grouped = list.reduce((acc: Record<string, Job[]>, j) => {
    (acc[j.stage] ||= []).push(j);
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([stage, arr]) => {
      const s = arr.some(j => j.status === 'failed')
        ? 'failed'
        : arr.some(j => j.status === 'running')
        ? 'running'
        : arr.some(j => j.status === 'pending')
        ? 'pending'
        : arr.some(j => j.status === 'canceled')
        ? 'canceled'
        : 'success';
      return { stage, status: s };
    })
    .reverse();
}

export function extractRootGroupFromRepoUrl(url: string): string | null {
  try {
    const m = url.match(/gitlab\.com[/:]([^/]+)/);
    if (m) return m[1];
    const r = url.match(/registry\.gitlab\.com\/([^/]+)/);
    return r ? r[1] : null;
  } catch {
    return null;
  }
}

export function mapHealth(health: string): string {
  switch (health) {
    case 'Healthy': return 'success';
    case 'Progressing': return 'running';
    case 'Degraded': return 'error';
    default: return 'warning';
  }
}

export function mapSync(sync: string): string {
  if (sync === 'Synced') return 'success';
  if (sync.toLowerCase().includes('sync')) return 'running';
  if (sync === 'OutOfSync') return 'error';
  return 'warning';
}
