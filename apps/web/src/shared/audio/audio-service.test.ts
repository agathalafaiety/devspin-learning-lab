import { describe, expect, it, vi } from 'vitest';
import { AudioFeedback, loadAudioPreferences, saveAudioPreferences } from './audio-service';

describe('preferências de áudio', () => {
  it('não inicializa áudio automaticamente', () => {
    const constructor = vi.fn();
    Object.defineProperty(window, 'AudioContext', { value: constructor, configurable: true });
    new AudioFeedback();
    expect(constructor).not.toHaveBeenCalled();
  });

  it('persiste e restaura volume e mute', () => {
    const data = new Map<string, string>();
    const storage = {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
    };
    saveAudioPreferences({ enabled: false, volume: 0.4 }, storage);
    expect(loadAudioPreferences(storage)).toEqual({ enabled: false, volume: 0.4 });
  });
});
