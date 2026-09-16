import type { Category, LearningFilters, LearningItem, Level } from './types';

export const categoryLabels: Record<Category, string> = {
  logic: 'Lógica de Programação',
  'algorithms-data-structures': 'Algoritmos e Estruturas de Dados',
  python: 'Python',
  'software-testing': 'Testes e Qualidade',
  'python-internals-concurrency': 'Internals e Concorrência em Python',
  'sql-databases': 'SQL e Bancos de Dados',
  'database-engineering': 'Engenharia de Bancos de Dados',
  'data-modeling': 'Modelagem de Dados',
  oop: 'Orientação a Objetos',
  backend: 'Backend',
  'api-design': 'Design de APIs',
  'distributed-systems': 'Sistemas Distribuídos',
  'software-architecture': 'Arquitetura de Software',
  'artificial-intelligence': 'Fundamentos de IA',
  'responsible-ai': 'IA Responsável',
  'machine-learning': 'Machine Learning',
  'deep-learning': 'Deep Learning',
  'neural-networks': 'Redes Neurais',
  'natural-language-processing': 'Processamento de Linguagem Natural',
  'computer-vision': 'Visão Computacional',
  'generative-ai': 'IA Generativa e LLMs',
  'data-science': 'Ciência de Dados',
  'statistics-probability': 'Estatística e Probabilidade',
  'data-visualization': 'Visualização de Dados',
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

export interface LearningDraw<T extends LearningItem> {
  item: T;
  seenIds: string[];
  cycleRestarted: boolean;
}

export function drawLearningItem<T extends LearningItem>(
  items: readonly T[],
  filters: LearningFilters,
  previousId: string | null,
  seenIds: readonly string[] = [],
  random: () => number = Math.random,
): LearningDraw<T> | null {
  const filtered = filterLearningItems(items, filters);

  if (filtered.length === 0) return null;

  const filteredIds = new Set(filtered.map(({ id }) => id));
  const seenInCycle = new Set(seenIds.filter((id) => filteredIds.has(id)));
  if (previousId && filteredIds.has(previousId)) seenInCycle.add(previousId);

  let pool = filtered.filter(({ id }) => !seenInCycle.has(id));
  const cycleRestarted = pool.length === 0;

  if (cycleRestarted) {
    seenInCycle.clear();
    pool = filtered.length > 1 ? filtered.filter(({ id }) => id !== previousId) : filtered;
  }

  const index = Math.min(Math.floor(random() * pool.length), pool.length - 1);
  const item = pool[index];

  if (!item) return null;
  seenInCycle.add(item.id);

  return { item, seenIds: [...seenInCycle], cycleRestarted };
}
