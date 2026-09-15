export const categories = [
  'logic',
  'python',
  'sql-databases',
  'oop',
  'backend',
  'artificial-intelligence',
  'machine-learning',
  'deep-learning',
  'neural-networks',
  'generative-ai',
  'data-science',
  'data-engineering',
] as const;

export type Category = (typeof categories)[number];

export const levels = ['beginner', 'intermediate', 'advanced'] as const;
export type Level = (typeof levels)[number];
export type LearningMode = 'explore' | 'execute' | 'review';
export type ItemType = 'concept' | 'challenge';

export interface ContentReference {
  title: string;
  url: string;
  kind: 'official-docs' | 'paper' | 'book' | 'standard' | 'other';
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

interface BaseLearningItem {
  id: string;
  title: string;
  category: Category;
  level: Level;
  references: ContentReference[];
  contentVersion: number;
  reviewStatus: 'draft' | 'reviewed';
  lastContentReviewAt: string;
}

export interface ConceptItem extends BaseLearningItem {
  summary: string;
  whyItMatters: string;
  guidingQuestions: [string, string, string];
  practicalExample: string;
  prerequisites: string[];
  commonMistakes: string[];
  relatedTerms: string[];
  quickQuiz: QuizQuestion[];
}

export interface ChallengeItem extends BaseLearningItem {
  realWorldContext: string;
  statement: string;
  constraints: string[];
  hints: [string, string];
  expectedConcepts: string[];
}

export type LearningItem = ConceptItem | ChallengeItem;

export interface LearningFilters {
  categories: Category[];
  level: Level | null;
}
