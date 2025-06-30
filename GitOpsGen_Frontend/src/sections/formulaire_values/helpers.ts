/* eslint-disable perfectionist/sort-imports */

import { Dispatch, SetStateAction, FormEvent } from 'react';
import yaml from 'js-yaml';

import { GITLAB_TOKEN } from './config';
import { GitlabGroup, RepoItem } from './types';

type SetState<T> = Dispatch<SetStateAction<T>>;

export async function fetchList<T>(
  url: string,
  setter: SetState<T[]>,
  errMsg: string,
  reset?: () => void,
  setLoading?: SetState<boolean>,
  setApiError?: SetState<string | null>
) {
  if (setLoading) setLoading(true);
  if (setApiError) setApiError(null);

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${GITLAB_TOKEN}` },
    });

    if (!res.ok) throw new Error();
    const data: T[] = await res.json();
    setter(data);
  } catch {
    if (setApiError) setApiError(errMsg);
    if (reset) reset();
  } finally {
    if (setLoading) setLoading(false);
  }
}

export async function loadTree(
  selectedProjectId: string,
  path: string,
  setRepoItems: SetState<RepoItem[]>,
  setApiError: SetState<string | null>,
  setLoading: SetState<boolean>
) {
  setLoading(true);
  setApiError(null);

  try {
    const res = await fetch(
      `https://gitlab.com/api/v4/projects/${selectedProjectId}/repository/tree?per_page=100&path=${encodeURIComponent(path)}`,
      { headers: { Authorization: `Bearer ${GITLAB_TOKEN}` } }
    );

    if (!res.ok) throw new Error();
    const data: RepoItem[] = await res.json();
    setRepoItems(data);
  } catch {
    setApiError("Impossible de récupérer l'arborescence");
    setRepoItems([]);
  } finally {
    setLoading(false);
  }
}

export async function loadFile(
  selectedProjectId: string,
  path: string,
  setYamlData: SetState<any>,
  setFormValues: SetState<any>,
  setApiError: SetState<string | null>,
  setLoading: SetState<boolean>
) {
  setLoading(true);
  setApiError(null);

  try {
    const res = await fetch(
      `https://gitlab.com/api/v4/projects/${selectedProjectId}/repository/files/${encodeURIComponent(path)}/raw?ref=main`,
      { headers: { Authorization: `Bearer ${GITLAB_TOKEN}` } }
    );

    if (!res.ok) throw new Error();

    const text = await res.text();
    const data = yaml.load(text);

    setYamlData(data);
    setFormValues(JSON.parse(JSON.stringify(data)));
  } catch {
    setApiError("Impossible de charger values.yaml");
    setYamlData(null);
    setFormValues(null);
  } finally {
    setLoading(false);
  }
}

export async function handleSubmit(
  e: FormEvent,
  formValues: any,
  selectedProjectId: string,
  pathSegments: string[],
  setUploading: SetState<boolean>,
  setApiError: SetState<string | null>,
  setSuccess: SetState<string | null>
) {
  e.preventDefault();
  if (!formValues) return;

  setUploading(true);
  setApiError(null);

  try {
    const newYaml = yaml.dump(formValues);
    const payload = {
      branch: 'main',
      commit_message: 'Mise à jour de values.yaml',
      actions: [
        {
          action: 'update',
          file_path: `${pathSegments.join('/')}/values.yaml`,
          content: newYaml,
        },
      ],
    };

    const res = await fetch(
      `https://gitlab.com/api/v4/projects/${selectedProjectId}/repository/commits`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${GITLAB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) throw new Error();
    setSuccess('values.yaml mis à jour ✅');
  } catch {
    setApiError('Échec de la mise à jour');
  } finally {
    setUploading(false);
  }
}

export function handleChange(
  path: string,
  value: any,
  formValues: any,
  setFormValues: SetState<any>
) {
  if (!formValues) return;

  const updated = JSON.parse(JSON.stringify(formValues));
  const keys = path.split('.');
  let cur = updated;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]]) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }

  cur[keys[keys.length - 1]] = value;
  setFormValues(updated);
}

export function getByPath(obj: any, path: string) {
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

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
