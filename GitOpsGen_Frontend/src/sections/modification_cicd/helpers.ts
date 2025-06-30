import { StageEntry ,GitlabGroup  } from './types';

export function toggleStage(
  stages: StageEntry[],
  stageName: string
): StageEntry[] {
  return stages.map(s =>
    s.name === stageName ? { ...s, enabled: !s.enabled } : s
  );
}
// helpers/parseAllowedParents.ts
export function parseAllowedParents(rawProjets: string): string[] {
  try {
    if (rawProjets.startsWith('{') && rawProjets.endsWith('}')) {
      const inner = rawProjets.slice(1, -1);
      return inner
        .split(',')
        .map((s: string) => s.trim().replace(/^"|"$/g, '').toLowerCase());
    } else if (rawProjets) {
      return [rawProjets.toLowerCase()];
    }
  } catch {
    return [];
  }
  return [];
}




export function filterGroups(groups: GitlabGroup[], allowedParents: string[]): GitlabGroup[] {
  if (allowedParents.length === 0) return groups;
  return groups.filter((g) => {
    const parent = g.full_name.split('/')[0].trim().toLowerCase();
    return allowedParents.includes(parent);
  });
}

