import { describe, expect, it } from 'vitest';
import { concepts } from '../infrastructure/content';
import {
  clearLearningProgress,
  countDueReviews,
  createItemKey,
  recordAssessment,
  toggleFavorite,
} from './progress';
import type { LocalProgress } from './progress';

const emptyProgress: LocalProgress = {
  schemaVersion: 1,
  favoriteKeys: [],
  history: [],
  reviews: [],
  preferences: { audio: { enabled: true, volume: 0.28 } },
};

describe('progresso local', () => {
  it('salva e remove um favorito', () => {
    const key = createItemKey('concept', concepts[0]!.id);
    const saved = toggleFavorite(emptyProgress, key);
    expect(saved.favoriteKeys).toEqual([key]);
    expect(toggleFavorite(saved, key).favoriteKeys).toEqual([]);
  });

  it('agenda antes o item que precisa de revisão', () => {
    const now = new Date('2026-09-15T12:00:00.000Z');
    const needsReview = recordAssessment(
      emptyProgress,
      concepts[0]!,
      'needs-review',
      'session',
      now,
    );
    const canExplain = recordAssessment(emptyProgress, concepts[0]!, 'can-explain', 'session', now);

    expect(needsReview.reviews[0]?.intervalDays).toBe(1);
    expect(canExplain.reviews[0]?.intervalDays).toBe(7);
    expect(needsReview.history[0]?.assessment).toBe('needs-review');
  });

  it('atualiza o intervalo depois de uma nova revisão', () => {
    const first = recordAssessment(
      emptyProgress,
      concepts[0]!,
      'can-explain',
      'session',
      new Date('2026-09-15T12:00:00.000Z'),
    );
    const second = recordAssessment(
      first,
      concepts[0]!,
      'can-explain',
      'review',
      new Date('2026-09-22T12:00:00.000Z'),
    );

    expect(second.reviews[0]?.intervalDays).toBe(14);
    expect(second.reviews[0]?.reviewCount).toBe(2);
    expect(countDueReviews(second.reviews, new Date('2026-10-06T12:00:00.000Z'))).toBe(1);
  });

  it('limpa o progresso sem apagar a preferência de áudio', () => {
    const populated = recordAssessment(
      toggleFavorite(emptyProgress, 'concept:logic-variables-types'),
      concepts[0]!,
      'almost-there',
      'session',
      new Date('2026-09-15T12:00:00.000Z'),
    );

    expect(clearLearningProgress(populated)).toEqual(emptyProgress);
  });
});
