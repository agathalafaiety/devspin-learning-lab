import { Bookmark, BookmarkCheck, X } from 'lucide-react';
import type { LearningItem } from '../domain/types';
import type { SelfAssessment } from '../domain/progress';
import { AssessmentChoices } from './AssessmentChoices';

interface AssessmentDialogProps {
  item: LearningItem;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSelect: (assessment: SelfAssessment) => void;
  onClose: () => void;
}

export function AssessmentDialog({
  item,
  isFavorite,
  onToggleFavorite,
  onSelect,
  onClose,
}: AssessmentDialogProps) {
  return (
    <div
      className="focus-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="assessment-title"
    >
      <section className="assessment-modal">
        <button
          type="button"
          className="focus-close"
          onClick={onClose}
          aria-label="Fechar autoavaliação"
        >
          <X size={21} />
        </button>
        <span className="section-kicker">ETAPA 03 · AUTOAVALIAÇÃO</span>
        <h2 id="assessment-title">Como você se sente sobre este assunto?</h2>
        <p className="assessment-item">{item.title}</p>
        <p className="assessment-guidance">
          Não é uma prova. Sua resposta apenas define quando este item deve reaparecer.
        </p>
        <AssessmentChoices onSelect={onSelect} />
        <button type="button" className="favorite-inline" onClick={onToggleFavorite}>
          {isFavorite ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          {isFavorite ? 'Salvo nos favoritos' : 'Salvar nos favoritos'}
        </button>
      </section>
    </div>
  );
}
