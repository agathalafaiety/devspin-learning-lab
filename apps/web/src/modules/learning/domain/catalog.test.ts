import { describe, expect, it } from 'vitest';
import type { ConceptItem } from './types';
import type { LearningDraw } from './catalog';
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
    const result: LearningDraw<ConceptItem> | null = drawLearningItem(
      items,
      { categories: ['python'], level: null },
      'python-1',
      [],
      () => 0,
    );
    expect(result?.item.id).toBe('python-2');
  });

  it('mostra todos os itens antes de reiniciar o ciclo', () => {
    let seenIds: string[] = [];
    let previousId: string | null = null;
    const drawnIds: string[] = [];

    for (let draw = 0; draw < items.length; draw += 1) {
      const result: LearningDraw<ConceptItem> | null = drawLearningItem(
        items,
        { categories: [], level: null },
        previousId,
        seenIds,
        () => 0,
      );

      expect(result).not.toBeNull();
      drawnIds.push(result!.item.id);
      previousId = result!.item.id;
      seenIds = result!.seenIds;
    }

    expect(new Set(drawnIds)).toEqual(new Set(items.map(({ id }) => id)));

    const restarted = drawLearningItem(
      items,
      { categories: [], level: null },
      previousId,
      seenIds,
      () => 0,
    );

    expect(restarted?.cycleRestarted).toBe(true);
    expect(restarted?.item.id).not.toBe(previousId);
    expect(restarted?.seenIds).toEqual([restarted?.item.id]);
  });

  it('descarta do ciclo os IDs que não pertencem ao filtro atual', () => {
    const result = drawLearningItem(
      items,
      { categories: ['sql-databases'], level: null },
      null,
      ['python-1', 'python-2'],
      () => 0,
    );

    expect(result?.item.id).toBe('sql-1');
    expect(result?.seenIds).toEqual(['sql-1']);
  });

  it('retorna null para uma combinação vazia', () => {
    expect(drawLearningItem(items, { categories: ['backend'], level: null }, null)).toBeNull();
  });
});
