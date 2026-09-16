import { describe, expect, it } from 'vitest';
import { categories, levels } from '../domain/types';
import type { Category } from '../domain/types';
import { challenges, concepts } from './content';

describe('biblioteca oficial de conteúdo', () => {
  it('carrega exatamente 100 conceitos e 50 desafios', () => {
    expect(concepts).toHaveLength(100);
    expect(challenges).toHaveLength(50);
  });

  it('mantém IDs únicos entre as coleções', () => {
    const ids = [...concepts, ...challenges].map(({ id }) => id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('mantém 4 conceitos e 2 desafios em cada uma das 25 categorias', () => {
    expect(categories).toHaveLength(25);
    for (const category of categories) {
      expect(concepts.filter((item) => item.category === category)).toHaveLength(4);
      expect(challenges.filter((item) => item.category === category)).toHaveLength(2);
    }
  });

  it('mantém 31/36/33 conceitos e 13/21/16 desafios por nível', () => {
    expect(levels.map((level) => concepts.filter((item) => item.level === level).length)).toEqual([
      31, 36, 33,
    ]);
    expect(levels.map((level) => challenges.filter((item) => item.level === level).length)).toEqual(
      [13, 21, 16],
    );
  });

  it('distribui todos os conceitos entre as cinco trilhas principais', () => {
    const tracks: Category[][] = [
      [
        'logic',
        'algorithms-data-structures',
        'python',
        'software-testing',
        'python-internals-concurrency',
      ],
      ['sql-databases', 'database-engineering', 'data-modeling'],
      ['oop', 'backend', 'api-design', 'distributed-systems', 'software-architecture'],
      [
        'artificial-intelligence',
        'responsible-ai',
        'machine-learning',
        'deep-learning',
        'neural-networks',
        'natural-language-processing',
        'computer-vision',
        'generative-ai',
      ],
      ['data-science', 'statistics-probability', 'data-visualization', 'data-engineering'],
    ];

    expect(
      tracks.map((track) => concepts.filter(({ category }) => track.includes(category)).length),
    ).toEqual([20, 12, 20, 32, 16]);
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
