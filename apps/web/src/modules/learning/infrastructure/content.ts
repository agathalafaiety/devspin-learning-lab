import { z } from 'zod';
import rawChallenges from '../../../../../../content/challenges/seed.json';
import rawConcepts from '../../../../../../content/concepts/seed.json';
import { categories, levels } from '../domain/types';
import type { ChallengeItem, ConceptItem } from '../domain/types';

const referenceSchema = z
  .object({
    title: z.string().min(1).max(160),
    url: z.string().url().max(500),
    kind: z.enum(['official-docs', 'paper', 'book', 'standard', 'other']),
  })
  .strict();

const quizSchema = z
  .object({
    id: z.string().min(1).max(100),
    prompt: z.string().min(1).max(400),
    options: z.array(z.string().min(1).max(240)).min(2).max(6),
    correctOptionIndex: z.number().int().min(0),
    explanation: z.string().min(1).max(500),
  })
  .strict();

const baseSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(120),
  category: z.enum(categories),
  level: z.enum(levels),
  references: z.array(referenceSchema).min(1).max(8),
  contentVersion: z.number().int().positive(),
  reviewStatus: z.enum(['draft', 'reviewed']),
  lastContentReviewAt: z.iso.date(),
});

const conceptSchema = baseSchema
  .extend({
    summary: z.string().min(1).max(300),
    whyItMatters: z.string().min(1).max(500),
    guidingQuestions: z.tuple([z.string(), z.string(), z.string()]),
    practicalExample: z.string().min(1).max(500),
    prerequisites: z.array(z.string().min(1).max(100)).max(12),
    commonMistakes: z.array(z.string().min(1).max(300)).max(12),
    relatedTerms: z.array(z.string().min(1).max(100)).max(16),
    quickQuiz: z.array(quizSchema).max(5),
  })
  .strict();

const challengeSchema = baseSchema
  .extend({
    realWorldContext: z.string().min(1).max(500),
    statement: z.string().min(1).max(1000),
    constraints: z.array(z.string().min(1).max(300)).min(1).max(10),
    hints: z.tuple([z.string(), z.string()]),
    expectedConcepts: z.array(z.string().min(1).max(100)).min(1).max(12),
  })
  .strict();

function assertUniqueIds(items: readonly { id: string }[], collectionName: string) {
  const ids = new Set(items.map(({ id }) => id));
  if (ids.size !== items.length) {
    throw new Error(`IDs duplicados na coleção ${collectionName}.`);
  }
}

export const concepts = z.array(conceptSchema).parse(rawConcepts) as ConceptItem[];
export const challenges = z.array(challengeSchema).parse(rawChallenges) as ChallengeItem[];

assertUniqueIds(concepts, 'conceitos');
assertUniqueIds(challenges, 'desafios');
