import { describe, expect, it } from 'vitest';
import type { ConceptItem } from './types';
import { drawLearningItem, filterLearningItems } from './catalog';

const item = (id: string, category: ConceptItem['category'], level: ConceptItem['level']) =>
  ({ id, category, level }) as ConceptItem;

const items = [
  item('python-1', 'python', 'beginner'),
  item('python-2', 'python', 'advanced'),
  item('sql-1', 'sql-databases', 'beginner'),
];

describe('catálogo de aprendizagem', () => {
  it('considera todos os itens quando não há filtros ativos', () => {
    expect(filterLearningItems(items, { categories: [], level: null })).toHaveLength(3);
  });

  it('combina categorias e nível', () => {
    expect(
      filterLearningItems(items, { categories: ['python'], level: 'beginner' }).map(({ id }) => id),
    ).toEqual(['python-1']);
  });

  it('evita repetição imediata quando existe outra opção', () => {
    const result = drawLearningItem(
      items,
      { categories: ['python'], level: null },
      'python-1',
      () => 0,
    );
    expect(result?.id).toBe('python-2');
  });

  it('retorna null para uma combinação vazia', () => {
    expect(drawLearningItem(items, { categories: ['backend'], level: null }, null)).toBeNull();
  });
});
