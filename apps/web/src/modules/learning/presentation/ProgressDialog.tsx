import { useEffect, useRef, useState } from 'react';
import { Bookmark, Clock3, Download, ExternalLink, Trash2, Upload, X } from 'lucide-react';
import { assessmentLabels } from '../domain/progress';
import type { HistoryEntry } from '../domain/progress';
import type { LearningItem } from '../domain/types';

interface ProgressDialogProps {
  favoriteItems: LearningItem[];
  history: HistoryEntry[];
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
            <span>Isso remove favoritos, histórico e revisões deste dispositivo.</span>
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
