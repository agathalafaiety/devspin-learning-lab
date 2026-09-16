import { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  Bookmark,
  BrainCircuit,
  Clock3,
  Download,
  ExternalLink,
  Flame,
  RotateCcw,
  Target,
  Terminal,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { categoryLabels } from '../domain/catalog';
import { assessmentLabels } from '../domain/progress';
import type { HistoryEntry, ProgressStats } from '../domain/progress';
import type { LearningItem } from '../domain/types';

interface ProgressDialogProps {
  favoriteItems: LearningItem[];
  history: HistoryEntry[];
  stats: ProgressStats;
  onOpenItem: (item: LearningItem) => void;
  onRemoveFavorite: (item: LearningItem) => void;
  onExport: () => void;
  onImport: (file: File) => Promise<{ ok: boolean; message: string }>;
  onClearProgress: () => void;
  onClose: () => void;
}

function formatActivityDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function ProgressDialog({
  favoriteItems,
  history,
  stats,
  onOpenItem,
  onRemoveFavorite,
  onExport,
  onImport,
  onClearProgress,
  onClose,
}: ProgressDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  useEffect(() => {
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  return (
    <div
      className="focus-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="progress-title"
    >
      <section className="progress-modal">
        <button
          ref={closeButtonRef}
          type="button"
          className="focus-close"
          onClick={onClose}
          aria-label="Fechar progresso local"
        >
          <X size={21} />
        </button>
        <span className="section-kicker">SALVO SOMENTE NESTE DISPOSITIVO</span>
        <h2 id="progress-title">Seu progresso local</h2>

        <section className="progress-overview" aria-labelledby="evolution-title">
          <div className="progress-overview-heading">
            <h3 id="evolution-title">
              <BarChart3 size={18} aria-hidden="true" /> Painel de evolução
            </h3>
            <strong>{stats.overallPercentage}% concluído</strong>
          </div>
          <div
            className="overall-progress"
            role="progressbar"
            aria-label="Progresso geral do laboratório"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={stats.overallPercentage}
          >
            <span style={{ width: `${stats.overallPercentage}%` }} />
          </div>

          <div className="progress-metrics">
            <article>
              <BrainCircuit size={18} aria-hidden="true" />
              <strong>{stats.conceptsCompleted}</strong>
              <span>conceitos concluídos</span>
            </article>
            <article>
              <Terminal size={18} aria-hidden="true" />
              <strong>{stats.challengesCompleted}</strong>
              <span>desafios concluídos</span>
            </article>
            <article>
              <Target size={18} aria-hidden="true" />
              <strong>{stats.quizAccuracy}%</strong>
              <span>
                {stats.quizAttempts} {stats.quizAttempts === 1 ? 'tentativa' : 'tentativas'} em
                quizzes
              </span>
            </article>
            <article>
              <RotateCcw size={18} aria-hidden="true" />
              <strong>{stats.reviewsCompleted}</strong>
              <span>revisões concluídas</span>
            </article>
            <article>
              <Flame size={18} aria-hidden="true" />
              <strong>{stats.streakDays}</strong>
              <span>{stats.streakDays === 1 ? 'dia em sequência' : 'dias em sequência'}</span>
            </article>
          </div>

          <div className="category-progress">
            <h4>Progresso por área</h4>
            <ul>
              {stats.categories.map((category) => (
                <li key={category.category}>
                  <span>
                    <strong>{categoryLabels[category.category]}</strong>
                    <small>
                      {category.completed}/{category.total}
                    </small>
                  </span>
                  <div aria-hidden="true">
                    <i style={{ width: `${category.percentage}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="progress-tools" aria-label="Ferramentas de progresso">
          <button type="button" onClick={onExport}>
            <Download size={17} aria-hidden="true" /> Exportar backup
          </button>
          <label>
            <Upload size={17} aria-hidden="true" /> Importar backup
            <input
              type="file"
              accept="application/json,.json"
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                setImportMessage('Validando backup…');
                const result = await onImport(file);
                setImportMessage(result.message);
                event.target.value = '';
              }}
            />
          </label>
          <button type="button" className="danger" onClick={() => setConfirmClear(true)}>
            <Trash2 size={17} aria-hidden="true" /> Limpar progresso
          </button>
        </div>

        {importMessage && (
          <p className="progress-message" role="status">
            {importMessage}
          </p>
        )}

        {confirmClear && (
          <div className="clear-confirmation" role="alert">
            <span>Isso remove favoritos, histórico, quizzes e revisões deste dispositivo.</span>
            <div>
              <button
                type="button"
                className="danger"
                onClick={() => {
                  onClearProgress();
                  setConfirmClear(false);
                  setImportMessage('Progresso local removido.');
                }}
              >
                Sim, apagar progresso
              </button>
              <button type="button" onClick={() => setConfirmClear(false)}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="progress-columns">
          <section aria-labelledby="favorites-title">
            <h3 id="favorites-title">
              <Bookmark size={18} /> Favoritos
            </h3>
            {favoriteItems.length === 0 ? (
              <p className="progress-empty">Você ainda não salvou nenhum item.</p>
            ) : (
              <ul className="progress-list">
                {favoriteItems.map((item) => (
                  <li key={item.id}>
                    <span>
                      <strong>{item.title}</strong>
                      <small>{'summary' in item ? 'Conceito' : 'Desafio'}</small>
                    </span>
                    <div>
                      <button
                        type="button"
                        onClick={() => onOpenItem(item)}
                        aria-label={`Abrir ${item.title}`}
                      >
                        <ExternalLink size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveFavorite(item)}
                        aria-label={`Remover ${item.title} dos favoritos`}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="history-title">
            <h3 id="history-title">
              <Clock3 size={18} /> Atividade recente
            </h3>
            {history.length === 0 ? (
              <p className="progress-empty">As sessões concluídas aparecerão aqui.</p>
            ) : (
              <ul className="history-list">
                {history.slice(0, 8).map((entry) => (
                  <li key={entry.id}>
                    <span>
                      <strong>{entry.itemTitle}</strong>
                      <small>{assessmentLabels[entry.assessment]}</small>
                    </span>
                    <time dateTime={entry.completedAt}>
                      {formatActivityDate(entry.completedAt)}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
