import { z } from 'zod';
import { assessmentValues } from '../domain/progress';
import type { LocalProgress } from '../domain/progress';

export const PROGRESS_STORAGE_KEY = 'devspin.progress.v1';
const LEGACY_AUDIO_STORAGE_KEY = 'devspin.audio.v1';

const audioPreferencesSchema = z
  .object({
    enabled: z.boolean(),
    volume: z.number().min(0).max(1),
  })
  .strict();

const historyEntrySchema = z
  .object({
    id: z.string().min(1).max(220),
    itemKey: z.string().min(3).max(160),
    itemTitle: z.string().min(1).max(160),
    itemType: z.enum(['concept', 'challenge']),
    assessment: z.enum(assessmentValues),
    completedAt: z.iso.datetime(),
    source: z.enum(['session', 'review']),
  })
  .strict();

const reviewEntrySchema = z
  .object({
    itemKey: z.string().min(3).max(160),
    assessment: z.enum(assessmentValues),
    dueAt: z.iso.datetime(),
    intervalDays: z.number().int().min(1).max(3650),
    lastReviewedAt: z.iso.datetime(),
    reviewCount: z.number().int().min(1).max(100_000),
  })
  .strict();

const quizAttemptSchema = z
  .object({
    id: z.string().min(1).max(220),
    itemKey: z.string().min(3).max(160),
    questionId: z.string().min(1).max(100),
    correct: z.boolean(),
    answeredAt: z.iso.datetime(),
  })
  .strict();

const progressSchema = z
  .object({
    schemaVersion: z.literal(2),
    favoriteKeys: z.array(z.string().min(3).max(160)).max(5000),
    history: z.array(historyEntrySchema).max(100),
    reviews: z.array(reviewEntrySchema).max(5000),
    quizAttempts: z.array(quizAttemptSchema).max(500),
    preferences: z.object({ audio: audioPreferencesSchema }).strict(),
  })
  .strict();

const previousProgressSchema = z
  .object({
    schemaVersion: z.literal(1),
    favoriteKeys: z.array(z.string().min(3).max(160)).max(5000),
    history: z.array(historyEntrySchema).max(100),
    reviews: z.array(reviewEntrySchema).max(5000),
    preferences: z.object({ audio: audioPreferencesSchema }).strict(),
  })
  .strict();

const legacyProgressSchema = z
  .object({
    schemaVersion: z.literal(0),
    savedItemKeys: z.array(z.string().min(3).max(160)).max(5000).default([]),
  })
  .strict();

const progressBackupSchema = z
  .object({
    app: z.literal('devspin'),
    formatVersion: z.literal(2),
    exportedAt: z.iso.datetime(),
    progress: progressSchema,
  })
  .strict();

const previousProgressBackupSchema = z
  .object({
    app: z.literal('devspin'),
    formatVersion: z.literal(1),
    exportedAt: z.iso.datetime(),
    progress: previousProgressSchema,
  })
  .strict();

interface ReadStorage {
  getItem(key: string): string | null;
}

interface WriteStorage {
  setItem(key: string, value: string): void;
}

function readLegacyAudio(storage: ReadStorage) {
  try {
    const rawAudio = storage.getItem(LEGACY_AUDIO_STORAGE_KEY);
    if (!rawAudio) return { enabled: true, volume: 0.28 };
    return audioPreferencesSchema.parse(JSON.parse(rawAudio));
  } catch {
    return { enabled: true, volume: 0.28 };
  }
}

export function createDefaultProgress(storage: ReadStorage = localStorage): LocalProgress {
  return {
    schemaVersion: 2,
    favoriteKeys: [],
    history: [],
    reviews: [],
    quizAttempts: [],
    preferences: { audio: readLegacyAudio(storage) },
  };
}

function migrateProgress(value: unknown, storage: ReadStorage): LocalProgress | null {
  const previous = previousProgressSchema.safeParse(value);
  if (previous.success) {
    return { ...previous.data, schemaVersion: 2, quizAttempts: [] };
  }

  const legacy = legacyProgressSchema.safeParse(value);
  if (!legacy.success) return null;
  return {
    ...createDefaultProgress(storage),
    favoriteKeys: legacy.data.savedItemKeys,
  };
}

export function loadProgress(storage: ReadStorage = localStorage): LocalProgress {
  try {
    const raw = storage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return createDefaultProgress(storage);
    const parsed: unknown = JSON.parse(raw);
    const current = progressSchema.safeParse(parsed);
    if (current.success) return current.data;
    return migrateProgress(parsed, storage) ?? createDefaultProgress(storage);
  } catch {
    return createDefaultProgress(storage);
  }
}

export function saveProgress(progress: LocalProgress, storage: WriteStorage = localStorage) {
  try {
    const safeProgress = progressSchema.parse(progress);
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(safeProgress));
  } catch {
    // O app continua utilizável mesmo se o armazenamento estiver indisponível ou cheio.
  }
}

export function serializeProgressBackup(progress: LocalProgress, now = new Date()) {
  return JSON.stringify(
    progressBackupSchema.parse({
      app: 'devspin',
      formatVersion: 2,
      exportedAt: now.toISOString(),
      progress,
    }),
    null,
    2,
  );
}

export function parseProgressBackup(raw: string): LocalProgress {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('O arquivo não contém um JSON válido.');
  }

  const backup = progressBackupSchema.safeParse(parsed);
  if (backup.success) return backup.data.progress;

  const previousBackup = previousProgressBackupSchema.safeParse(parsed);
  if (previousBackup.success) {
    return { ...previousBackup.data.progress, schemaVersion: 2, quizAttempts: [] };
  }

  throw new Error('Este arquivo não é um backup válido do DevSpin.');
}
