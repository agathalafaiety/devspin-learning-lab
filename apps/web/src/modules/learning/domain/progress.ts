import type { AudioPreferences } from '../../../shared/audio/audio-service';
import type { Category, ItemType, LearningItem } from './types';

export const assessmentValues = ['needs-review', 'almost-there', 'can-explain'] as const;
export type SelfAssessment = (typeof assessmentValues)[number];

export const assessmentLabels: Record<SelfAssessment, string> = {
  'needs-review': 'Preciso revisar',
  'almost-there': 'Quase entendi',
  'can-explain': 'Consigo explicar',
};

export interface HistoryEntry {
  id: string;
  itemKey: string;
  itemTitle: string;
  itemType: ItemType;
  assessment: SelfAssessment;
  completedAt: string;
  source: 'session' | 'review';
}

export interface ReviewEntry {
  itemKey: string;
  assessment: SelfAssessment;
  dueAt: string;
  intervalDays: number;
  lastReviewedAt: string;
  reviewCount: number;
}

export interface QuizAttempt {
  id: string;
  itemKey: string;
  questionId: string;
  correct: boolean;
  answeredAt: string;
}

export interface LocalProgress {
  schemaVersion: 2;
  favoriteKeys: string[];
  history: HistoryEntry[];
  reviews: ReviewEntry[];
  quizAttempts: QuizAttempt[];
  preferences: {
    audio: AudioPreferences;
  };
}

export interface CategoryProgress {
  category: Category;
  completed: number;
  total: number;
  percentage: number;
}

export interface ProgressStats {
  completedItems: number;
  totalItems: number;
  overallPercentage: number;
  conceptsCompleted: number;
  challengesCompleted: number;
  reviewsCompleted: number;
  quizAttempts: number;
  correctQuizAttempts: number;
  quizAccuracy: number;
  streakDays: number;
  categories: CategoryProgress[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function getItemType(item: LearningItem): ItemType {
  return 'summary' in item ? 'concept' : 'challenge';
}

export function createItemKey(itemType: ItemType, itemId: string) {
  return `${itemType}:${itemId}`;
}

export function getItemKey(item: LearningItem) {
  return createItemKey(getItemType(item), item.id);
}

export function toggleFavorite(progress: LocalProgress, itemKey: string): LocalProgress {
  const favoriteKeys = progress.favoriteKeys.includes(itemKey)
    ? progress.favoriteKeys.filter((key) => key !== itemKey)
    : [...progress.favoriteKeys, itemKey];

  return { ...progress, favoriteKeys };
}

export function clearLearningProgress(progress: LocalProgress): LocalProgress {
  return {
    ...progress,
    favoriteKeys: [],
    history: [],
    reviews: [],
    quizAttempts: [],
  };
}

export function recordQuizAttempt(
  progress: LocalProgress,
  item: LearningItem,
  questionId: string,
  correct: boolean,
  now = new Date(),
): LocalProgress {
  const itemKey = getItemKey(item);
  const attempt: QuizAttempt = {
    id: `${now.getTime()}-${questionId}-${progress.quizAttempts.length}`,
    itemKey,
    questionId,
    correct,
    answeredAt: now.toISOString(),
  };

  return { ...progress, quizAttempts: [attempt, ...progress.quizAttempts].slice(0, 500) };
}

function nextIntervalDays(previous: ReviewEntry | undefined, assessment: SelfAssessment) {
  if (assessment === 'needs-review') return 1;
  if (assessment === 'almost-there') {
    return previous ? Math.max(3, Math.round(previous.intervalDays * 1.5)) : 3;
  }
  return previous ? Math.max(7, previous.intervalDays * 2) : 7;
}

export function recordAssessment(
  progress: LocalProgress,
  item: LearningItem,
  assessment: SelfAssessment,
  source: HistoryEntry['source'],
  now = new Date(),
): LocalProgress {
  const itemType = getItemType(item);
  const itemKey = createItemKey(itemType, item.id);
  const previousReview = progress.reviews.find((entry) => entry.itemKey === itemKey);
  const intervalDays = nextIntervalDays(previousReview, assessment);
  const nowIso = now.toISOString();
  const review: ReviewEntry = {
    itemKey,
    assessment,
    intervalDays,
    dueAt: new Date(now.getTime() + intervalDays * DAY_MS).toISOString(),
    lastReviewedAt: nowIso,
    reviewCount: (previousReview?.reviewCount ?? 0) + 1,
  };
  const historyEntry: HistoryEntry = {
    id: `${now.getTime()}-${itemKey}-${source}`,
    itemKey,
    itemTitle: item.title,
    itemType,
    assessment,
    completedAt: nowIso,
    source,
  };

  return {
    ...progress,
    history: [historyEntry, ...progress.history].slice(0, 100),
    reviews: [...progress.reviews.filter((entry) => entry.itemKey !== itemKey), review],
  };
}

export function countDueReviews(reviews: readonly ReviewEntry[], now = new Date()) {
  const timestamp = now.getTime();
  return reviews.filter((entry) => new Date(entry.dueAt).getTime() <= timestamp).length;
}

function localDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateStreak(progress: LocalProgress, now: Date) {
  const activeDays = new Set([
    ...progress.history.map(({ completedAt }) => localDateKey(new Date(completedAt))),
    ...progress.quizAttempts.map(({ answeredAt }) => localDateKey(new Date(answeredAt))),
  ]);
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!activeDays.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (activeDays.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function calculateProgressStats(
  progress: LocalProgress,
  items: readonly LearningItem[],
  now = new Date(),
): ProgressStats {
  const completedKeys = new Set(progress.history.map(({ itemKey }) => itemKey));
  const completedItems = items.filter((item) => completedKeys.has(getItemKey(item)));
  const correctQuizAttempts = progress.quizAttempts.filter(({ correct }) => correct).length;
  const categorySet = new Set(items.map(({ category }) => category));
  const categories = [...categorySet].map((category) => {
    const categoryItems = items.filter((item) => item.category === category);
    const completed = categoryItems.filter((item) => completedKeys.has(getItemKey(item))).length;
    return {
      category,
      completed,
      total: categoryItems.length,
      percentage: Math.round((completed / categoryItems.length) * 100),
    };
  });

  return {
    completedItems: completedItems.length,
    totalItems: items.length,
    overallPercentage: Math.round((completedItems.length / items.length) * 100),
    conceptsCompleted: completedItems.filter((item) => getItemType(item) === 'concept').length,
    challengesCompleted: completedItems.filter((item) => getItemType(item) === 'challenge').length,
    reviewsCompleted: progress.history.filter(({ source }) => source === 'review').length,
    quizAttempts: progress.quizAttempts.length,
    correctQuizAttempts,
    quizAccuracy:
      progress.quizAttempts.length === 0
        ? 0
        : Math.round((correctQuizAttempts / progress.quizAttempts.length) * 100),
    streakDays: calculateStreak(progress, now),
    categories,
  };
}
