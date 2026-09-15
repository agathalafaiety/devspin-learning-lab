import { ClipboardList, Github, House, Play, Volume2, VolumeX } from 'lucide-react';
import type { LearningMode } from '../../modules/learning/domain/types';
import type { AudioPreferences } from '../audio/audio-service';
import { GITHUB_REPOSITORY_URL } from '../../app/constants';

interface HeaderProps {
  mode: LearningMode;
  onModeChange: (mode: LearningMode) => void;
  audioPreferences: AudioPreferences;
  onAudioPreferencesChange: (preferences: AudioPreferences) => void;
}

const modes: Array<{
  id: LearningMode;
  label: string;
  icon: typeof House;
}> = [
  { id: 'explore', label: 'Explorar', icon: House },
  { id: 'execute', label: 'Executar', icon: Play },
  { id: 'review', label: 'Revisar', icon: ClipboardList },
];

export function Header({
  mode,
  onModeChange,
  audioPreferences,
  onAudioPreferencesChange,
}: HeaderProps) {
  return (
    <header className="site-header">
      <a className="brand" href={import.meta.env.BASE_URL} aria-label="DevSpin, página inicial">
        <span>DEV</span>
        <strong>SPIN</strong>
      </a>

      <nav className="mode-switcher" aria-label="Modos de aprendizagem">
        {modes.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={mode === id ? 'active' : ''}
            aria-pressed={mode === id}
            onClick={() => onModeChange(id)}
          >
            <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
            {label}
          </button>
        ))}
      </nav>

      <div className="header-actions">
        <div className="volume-control">
          <button
            type="button"
            className="icon-button"
            aria-label={audioPreferences.enabled ? 'Desativar sons' : 'Ativar sons'}
            aria-pressed={!audioPreferences.enabled}
            onClick={() =>
              onAudioPreferencesChange({
                ...audioPreferences,
                enabled: !audioPreferences.enabled,
              })
            }
          >
            {audioPreferences.enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <span>Som</span>
          <label className="sr-only" htmlFor="global-volume">
            Volume dos sons
          </label>
          <input
            id="global-volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={audioPreferences.volume}
            disabled={!audioPreferences.enabled}
            onChange={(event) =>
              onAudioPreferencesChange({
                ...audioPreferences,
                volume: Number(event.target.value),
              })
            }
          />
        </div>
        <a
          className="icon-button profile-link"
          href={GITHUB_REPOSITORY_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Repositório do DevSpin no GitHub"
        >
          <Github size={19} />
        </a>
      </div>
    </header>
  );
}
