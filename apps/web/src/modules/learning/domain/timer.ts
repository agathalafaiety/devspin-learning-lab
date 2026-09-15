export interface TimerSnapshot {
  durationMs: number;
  deadlineMs: number;
  pausedRemainingMs: number | null;
}

export function createTimer(durationMs: number, nowMs: number): TimerSnapshot {
  return { durationMs, deadlineMs: nowMs + durationMs, pausedRemainingMs: null };
}

export function getRemainingMs(timer: TimerSnapshot, nowMs: number): number {
  if (timer.pausedRemainingMs !== null) return timer.pausedRemainingMs;
  return Math.max(0, timer.deadlineMs - nowMs);
}

export function pauseTimer(timer: TimerSnapshot, nowMs: number): TimerSnapshot {
  return { ...timer, pausedRemainingMs: getRemainingMs(timer, nowMs) };
}

export function resumeTimer(timer: TimerSnapshot, nowMs: number): TimerSnapshot {
  const remaining = timer.pausedRemainingMs ?? getRemainingMs(timer, nowMs);
  return { ...timer, deadlineMs: nowMs + remaining, pausedRemainingMs: null };
}
