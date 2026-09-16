import { describe, expect, it } from 'vitest';
import {
  createDefaultProgress,
  loadProgress,
  parseProgressBackup,
  PROGRESS_STORAGE_KEY,
  saveProgress,
  serializeProgressBackup,
} from './local-progress';

function createMemoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => data.set(key, value),
  };
}

describe('armazenamento local versionado', () => {
  it('persiste e restaura o documento de progresso', () => {
    const storage = createMemoryStorage();
    const progress = {
      ...createDefaultProgress(storage),
      favoriteKeys: ['concept:python-list-comprehensions'],
    };
    saveProgress(progress, storage);
    expect(loadProgress(storage).favoriteKeys).toEqual(progress.favoriteKeys);
  });

  it('migra com segurança a versão zero', () => {
    const storage = createMemoryStorage({
      [PROGRESS_STORAGE_KEY]: JSON.stringify({
        schemaVersion: 0,
        savedItemKeys: ['challenge:logic-password-rules'],
      }),
    });
    const migrated = loadProgress(storage);
    expect(migrated.schemaVersion).toBe(2);
    expect(migrated.favoriteKeys).toEqual(['challenge:logic-password-rules']);
  });

  it('migra a versão anterior preservando o progresso existente', () => {
    const storage = createMemoryStorage({
      [PROGRESS_STORAGE_KEY]: JSON.stringify({
        schemaVersion: 1,
        favoriteKeys: ['concept:python-list-comprehensions'],
        history: [],
        reviews: [],
        preferences: { audio: { enabled: false, volume: 0.5 } },
      }),
    });

    expect(loadProgress(storage)).toMatchObject({
      schemaVersion: 2,
      favoriteKeys: ['concept:python-list-comprehensions'],
      quizAttempts: [],
      preferences: { audio: { enabled: false, volume: 0.5 } },
    });
  });

  it('descarta dados inválidos sem quebrar a aplicação', () => {
    const storage = createMemoryStorage({ [PROGRESS_STORAGE_KEY]: '{inválido' });
    expect(loadProgress(storage)).toEqual(createDefaultProgress(storage));
  });

  it('exporta e importa um backup validado', () => {
    const progress = {
      ...createDefaultProgress(createMemoryStorage()),
      favoriteKeys: ['concept:logic-variables-types'],
    };
    const backup = serializeProgressBackup(progress, new Date('2026-09-15T12:00:00.000Z'));

    expect(parseProgressBackup(backup)).toEqual(progress);
    expect(JSON.parse(backup)).toMatchObject({
      app: 'devspin',
      formatVersion: 2,
      exportedAt: '2026-09-15T12:00:00.000Z',
    });
  });

  it('importa backups da versão anterior', () => {
    const previousBackup = JSON.stringify({
      app: 'devspin',
      formatVersion: 1,
      exportedAt: '2026-09-15T12:00:00.000Z',
      progress: {
        schemaVersion: 1,
        favoriteKeys: ['concept:logic-variables-types'],
        history: [],
        reviews: [],
        preferences: { audio: { enabled: true, volume: 0.28 } },
      },
    });

    expect(parseProgressBackup(previousBackup)).toMatchObject({
      schemaVersion: 2,
      favoriteKeys: ['concept:logic-variables-types'],
      quizAttempts: [],
    });
  });

  it('rejeita arquivos que não são backups do DevSpin', () => {
    expect(() => parseProgressBackup('{"app":"outro"}')).toThrow(
      'Este arquivo não é um backup válido do DevSpin.',
    );
    expect(() => parseProgressBackup('{inválido')).toThrow('O arquivo não contém um JSON válido.');
  });
});
