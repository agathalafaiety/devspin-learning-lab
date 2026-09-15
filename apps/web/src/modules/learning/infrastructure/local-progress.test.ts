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
    expect(migrated.schemaVersion).toBe(1);
    expect(migrated.favoriteKeys).toEqual(['challenge:logic-password-rules']);
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
      formatVersion: 1,
      exportedAt: '2026-09-15T12:00:00.000Z',
    });
  });

  it('rejeita arquivos que não são backups do DevSpin', () => {
    expect(() => parseProgressBackup('{"app":"outro"}')).toThrow(
      'Este arquivo não é um backup válido do DevSpin.',
    );
    expect(() => parseProgressBackup('{inválido')).toThrow('O arquivo não contém um JSON válido.');
  });
});
