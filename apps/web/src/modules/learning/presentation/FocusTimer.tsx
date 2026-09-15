import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, Pause, Play, X } from 'lucide-react';
import { createTimer, getRemainingMs, pauseTimer, resumeTimer } from '../domain/timer';
import type { TimerSnapshot } from '../domain/timer';
import type { SoundCue } from '../../../shared/audio/audio-service';

interface FocusTimerProps {
  itemTitle: string;
  stage: 'work' | 'explain';
  startedAtMs: number;
  durationMinutes: number;
  onCue: (cue: SoundCue) => void;
  onClose: () => void;
  onComplete: () => void;
}

function formatTime(milliseconds: number) {
  const totalSeconds = Math.ceil(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function FocusTimer({
  itemTitle,
  stage,
  startedAtMs,
  durationMinutes,
  onCue,
  onClose,
  onComplete,
}: FocusTimerProps) {
  const durationMs = durationMinutes * 60_000;
  const [timer, setTimer] = useState<TimerSnapshot>(() => createTimer(durationMs, startedAtMs));
  const [now, setNow] = useState(startedAtMs);
  const warned = useRef(false);
  const completed = useRef(false);
  const remaining = getRemainingMs(timer, now);
  const paused = timer.pausedRemainingMs !== null;
  const progress = Math.max(0, Math.min(1, 1 - remaining / durationMs));
  const label = stage === 'work' ? 'Tempo de foco' : 'Hora de explicar';
  const guidance = useMemo(
    () =>
      stage === 'work'
        ? 'Use o tempo como limite, não como meta. Conclua quando fizer sentido.'
        : 'Explique em voz alta com suas palavras. Nenhum áudio será gravado.',
    [stage],
  );

  useEffect(() => {
    if (paused) return;
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    if (remaining <= 10_000 && remaining > 0 && !warned.current) {
      warned.current = true;
      onCue('warning');
    }
    if (remaining === 0 && !completed.current) {
      completed.current = true;
      onComplete();
    }
  }, [remaining, onCue, onComplete]);

  return (
    <div className="focus-backdrop" role="dialog" aria-modal="true" aria-labelledby="focus-title">
      <section className="focus-modal">
        <button
          type="button"
          className="focus-close"
          onClick={onClose}
          aria-label="Fechar temporizador"
        >
          <X size={21} />
        </button>
        <span className="section-kicker">
          {stage === 'work' ? 'ETAPA 01' : 'ETAPA 02'} · {durationMinutes} MIN NO MÁXIMO
        </span>
        <h2 id="focus-title">{label}</h2>
        <p className="focus-item">{itemTitle}</p>
        <p className="focus-guidance">{guidance}</p>

        <div className="timer-ring">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle className="timer-ring-track" cx="60" cy="60" r="56" />
            <circle
              className="timer-ring-progress"
              cx="60"
              cy="60"
              r="56"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset={1 - progress}
            />
          </svg>
          <div>
            <span>{paused ? 'PAUSADO' : stage === 'work' ? 'EM FOCO' : 'EXPLICANDO'}</span>
            <strong aria-live="off">{formatTime(remaining)}</strong>
            <small aria-live="polite">{paused ? 'O tempo está parado' : 'Tempo restante'}</small>
          </div>
        </div>

        <div className="focus-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              if (paused) {
                setTimer((current) => resumeTimer(current, Date.now()));
                setNow(Date.now());
                onCue('resume');
              } else {
                setTimer((current) => pauseTimer(current, Date.now()));
                setNow(Date.now());
                onCue('pause');
              }
            }}
          >
            {paused ? <Play size={18} /> : <Pause size={18} />}
            {paused ? 'Continuar' : 'Pausar'}
          </button>
          <button type="button" className="primary-button" onClick={onComplete}>
            <Check size={18} /> Concluir agora
          </button>
        </div>
      </section>
    </div>
  );
}
