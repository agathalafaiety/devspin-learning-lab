import type { Category, LearningFilters, LearningItem, Level } from './types';

export const categoryLabels: Record<Category, string> = {
  logic: 'Lógica de Programação',
  python: 'Python',
  'sql-databases': 'SQL e Bancos de Dados',
  oop: 'Orientação a Objetos',
  backend: 'Backend',
  'artificial-intelligence': 'Fundamentos de IA',
  'machine-learning': 'Machine Learning',
  'deep-learning': 'Deep Learning',
  'neural-networks': 'Redes Neurais',
  'generative-ai': 'IA Generativa e LLMs',
  'data-science': 'Ciência de Dados',
  'data-engineering': 'Engenharia de Dados',
};

export const levelLabels: Record<Level, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

export function filterLearningItems<T extends LearningItem>(
  items: readonly T[],
  filters: LearningFilters,
): T[] {
  return items.filter((item) => {
    const categoryMatches =
      filters.categories.length === 0 || filters.categories.includes(item.category);
    const levelMatches = filters.level === null || item.level === filters.level;
    return categoryMatches && levelMatches;
  });
}

export function drawLearningItem<T extends LearningItem>(
  items: readonly T[],
  filters: LearningFilters,
  previousId: string | null,
  random: () => number = Math.random,
): T | null {
  const filtered = filterLearningItems(items, filters);
  const pool = filtered.length > 1 ? filtered.filter((item) => item.id !== previousId) : filtered;

  if (pool.length === 0) return null;
  const index = Math.min(Math.floor(random() * pool.length), pool.length - 1);
  return pool[index] ?? null;
}
