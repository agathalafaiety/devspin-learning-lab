import { describe, expect, it } from 'vitest';
import { categories, levels } from '../domain/types';
import type { Category, Level } from '../domain/types';
import { challenges, concepts } from './content';

const expectedMatrix: Record<
  Category,
  { concepts: Record<Level, number>; challenges: Record<Level, number> }
> = {
  logic: {
    concepts: { beginner: 2, intermediate: 1, advanced: 0 },
    challenges: { beginner: 1, intermediate: 1, advanced: 0 },
  },
  python: {
    concepts: { beginner: 2, intermediate: 2, advanced: 1 },
    challenges: { beginner: 1, intermediate: 1, advanced: 1 },
  },
  'sql-databases': {
    concepts: { beginner: 2, intermediate: 2, advanced: 1 },
    challenges: { beginner: 1, intermediate: 1, advanced: 0 },
  },
  oop: {
    concepts: { beginner: 2, intermediate: 1, advanced: 0 },
    challenges: { beginner: 1, intermediate: 1, advanced: 0 },
  },
  backend: {
    concepts: { beginner: 1, intermediate: 2, advanced: 2 },
    challenges: { beginner: 1, intermediate: 0, advanced: 1 },
  },
  'artificial-intelligence': {
    concepts: { beginner: 2, intermediate: 1, advanced: 0 },
    challenges: { beginner: 1, intermediate: 1, advanced: 0 },
  },
  'machine-learning': {
    concepts: { beginner: 2, intermediate: 2, advanced: 1 },
    challenges: { beginner: 1, intermediate: 1, advanced: 0 },
  },
  'deep-learning': {
    concepts: { beginner: 1, intermediate: 1, advanced: 2 },
    challenges: { beginner: 0, intermediate: 1, advanced: 1 },
  },
  'neural-networks': {
    concepts: { beginner: 1, intermediate: 1, advanced: 2 },
    challenges: { beginner: 0, intermediate: 1, advanced: 1 },
  },
  'generative-ai': {
    concepts: { beginner: 2, intermediate: 1, advanced: 1 },
    challenges: { beginner: 1, intermediate: 0, advanced: 1 },
  },
  'data-science': {
    concepts: { beginner: 2, intermediate: 2, advanced: 1 },
    challenges: { beginner: 1, intermediate: 1, advanced: 0 },
  },
  'data-engineering': {
    concepts: { beginner: 1, intermediate: 1, advanced: 2 },
    challenges: { beginner: 1, intermediate: 0, advanced: 1 },
  },
};

describe('biblioteca oficial de conteúdo', () => {
  it('carrega exatamente 50 conceitos e 25 desafios', () => {
    expect(concepts).toHaveLength(50);
    expect(challenges).toHaveLength(25);
  });

  it('mantém IDs únicos entre as coleções', () => {
    const ids = [...concepts, ...challenges].map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('respeita a matriz obrigatória por categoria e nível', () => {
    for (const category of categories) {
      for (const level of levels) {
        expect(
          concepts.filter((item) => item.category === category && item.level === level),
        ).toHaveLength(expectedMatrix[category].concepts[level]);
        expect(
          challenges.filter((item) => item.category === category && item.level === level),
        ).toHaveLength(expectedMatrix[category].challenges[level]);
      }
    }
  });

  it('mantém 20/17/13 conceitos e 10/9/6 desafios por nível', () => {
    expect(levels.map((level) => concepts.filter((item) => item.level === level).length)).toEqual([
      20, 17, 13,
    ]);
    expect(levels.map((level) => challenges.filter((item) => item.level === level).length)).toEqual(
      [10, 9, 6],
    );
  });

  it('mantém quizzes completos, com opções únicas e uma resposta existente', () => {
    for (const concept of concepts) {
      expect(concept.quickQuiz.length).toBeGreaterThan(0);
      expect(concept.guidingQuestions).toEqual([
        'Qual é a ideia principal?',
        'Quando usar esse conceito?',
        'Qual erro deve ser evitado?',
      ]);
      for (const question of concept.quickQuiz) {
        expect(question.prompt).toBe('Qual alternativa está correta?');
        expect(question.options[question.correctOptionIndex]).toBeDefined();
        expect(new Set(question.options).size).toBe(question.options.length);
      }
    }
  });

  it('mantém todo o conteúdo marcado como revisado e referenciado', () => {
    for (const item of [...concepts, ...challenges]) {
      expect(item.reviewStatus).toBe('reviewed');
      expect(item.references.length).toBeGreaterThan(0);
      expect(Number.isNaN(new Date(item.lastContentReviewAt).getTime())).toBe(false);
    }
  });
});
