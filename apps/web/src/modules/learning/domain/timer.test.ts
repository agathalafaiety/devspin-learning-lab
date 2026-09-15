import { describe, expect, it } from 'vitest';
import { createTimer, getRemainingMs, pauseTimer, resumeTimer } from './timer';

describe('temporizador por horário final', () => {
  it('calcula corretamente após um salto de tempo da aba', () => {
    const timer = createTimer(30 * 60_000, 1_000);
    expect(getRemainingMs(timer, 1_000 + 7 * 60_000)).toBe(23 * 60_000);
  });

  it('congela pausado e recalcula o prazo ao continuar', () => {
    const timer = createTimer(60_000, 0);
    const paused = pauseTimer(timer, 15_000);
    expect(getRemainingMs(paused, 50_000)).toBe(45_000);
    const resumed = resumeTimer(paused, 50_000);
    expect(getRemainingMs(resumed, 60_000)).toBe(35_000);
  });
});
