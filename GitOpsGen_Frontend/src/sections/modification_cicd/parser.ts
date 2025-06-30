import { StageEntry } from './types';

export function parseStages(yaml: string): StageEntry[] {
  const lines = yaml.split('\n');
  let inStages = false;
  let indentBase = 0;
  const stages: StageEntry[] = [];

  for (const line of lines) {
    const mStart = line.match(/^(\s*)stages\s*:/);
    if (mStart) {
      inStages = true;
      indentBase = mStart[1].length;
      continue;
    }

    if (!inStages) continue;

    const indent = line.search(/\S|$/);
    if (indent <= indentBase && !/^\s*[#-]/.test(line)) break;

    const mItem = line.match(/^[ \t]*(#)?[ \t]*-[ \t]*(.+?)\s*$/);
    if (mItem) stages.push({ name: mItem[2], enabled: !mItem[1] });
  }

  return stages;
}

export function updateYamlWithStagesAndJobs(
  yaml: string,
  stages: StageEntry[]
): string {
  const lines = yaml.split('\n');
  const outLines: string[] = [];

  // 1. Mettre à jour les stages
  const startIdx = lines.findIndex(l => /^(\s*)#?\s*stages\s*:/.test(l));
  if (startIdx !== -1) {
    outLines.push(...lines.slice(0, startIdx));
    outLines.push('stages:');
    stages.forEach(s => {
      outLines.push(`  ${s.enabled ? '- ' : '# - '}${s.name}`);
    });
    let endIdx = startIdx + 1;
    while (endIdx < lines.length && /^\s*#?\s*-\s*/.test(lines[endIdx])) {
      endIdx++;
    }
    outLines.push(...lines.slice(endIdx));
  } else {
    outLines.push('stages:');
    stages.forEach(s => {
      outLines.push(`  ${s.enabled ? '- ' : '# - '}${s.name}`);
    });
    outLines.push(...lines);
  }

  // 2. Gérer les jobs selon les stages activés/désactivés
  const finalLines: string[] = [];
  const headerRegex = /^(\s*)(#\s*)?([A-Za-z0-9_-]+)\s*:\s*$/;
  let i = 0;

  while (i < outLines.length) {
    const ln = outLines[i];
    const mh = ln.match(headerRegex);

    if (mh) {
      const indent = mh[1];
      const isCommented = !!mh[2];
      const jobName = mh[3];
      const block: string[] = [];
      let jobStage: string | null = null;
      let j = i;

      while (j < outLines.length) {
        const raw = outLines[j].replace(/^(\s*)#\s?/, '$1');
        const indentLevel = raw.search(/\S|$/);
        if (j > i && indentLevel <= indent.length && raw.trim()) break;
        block.push(outLines[j]);

        const ms = raw.match(/^\s*stage\s*:\s*['"]?([^'"\s]+)/);
        if (ms) jobStage = ms[1];
        j++;
      }

      const shouldComment = jobStage !== null &&
        stages.some(s => s.name === jobStage && !s.enabled);

      if (isCommented && !shouldComment) {
        block.forEach(line => finalLines.push(line.replace(/^(\s*)#\s?/, '$1')));
      } else if (shouldComment && !isCommented) {
        block.forEach(line => {
          if (line.trim()) {
            const match = /^(\s*)(.*)$/.exec(line);
            if (match) finalLines.push(match[1] + '# ' + match[2]);
            else finalLines.push('# ' + line);
          } else {
            finalLines.push(line);
          }
        });
      } else {
        finalLines.push(...block);
      }

      i = j;
    } else {
      finalLines.push(ln);
      i++;
    }
  }

  return finalLines.join('\n');
}
