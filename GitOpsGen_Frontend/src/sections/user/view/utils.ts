export function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

export function getComparator<Key extends keyof any>(order: 'asc' | 'desc', orderBy: Key) {
  return order === 'desc'
    ? (a: Record<Key, any>, b: Record<Key, any>) => descendingComparator(a as any, b as any, orderBy)
    : (a: Record<Key, any>, b: Record<Key, any>) => -descendingComparator(a as any, b as any, orderBy);
}

export function applyFilter<T>(data: T[], comparator: (a: T, b: T) => number, query: string, field: keyof T) {
  if (!Array.isArray(data)) return [];
  const stabilized = data.map((el, index) => [el, index] as const);
  stabilized.sort((a, b) => {
    const cmp = comparator(a[0], b[0]);
    return cmp !== 0 ? cmp : a[1] - b[1];
  });
  const sorted = stabilized.map(el => el[0]);
  return query
    ? sorted.filter(item => String((item as any)[field]).toLowerCase().includes(query.toLowerCase()))
    : sorted;
}
