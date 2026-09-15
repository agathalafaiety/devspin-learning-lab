import type { AudioPreferences } from '../../../shared/audio/audio-service';
import type { ItemType, LearningItem } from './types';

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

export interface LocalProgress {
  schemaVersion: 1;
  favoriteKeys: string[];
  history: HistoryEntry[];
  reviews: ReviewEntry[];
  preferences: {
    audio: AudioPreferences;
  };
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
  };
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
