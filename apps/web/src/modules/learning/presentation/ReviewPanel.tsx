import { useMemo, useState } from 'react';
import { BookOpen, CalendarClock, Check, Lightbulb, RotateCcw } from 'lucide-react';
import type { ReviewEntry, SelfAssessment } from '../domain/progress';
import type { ChallengeItem, ConceptItem, LearningItem } from '../domain/types';
import { AssessmentChoices } from './AssessmentChoices';

export interface ReviewCandidate {
  entry: ReviewEntry;
  item: LearningItem;
}

interface ReviewPanelProps {
  candidates: ReviewCandidate[];
  onAssess: (item: LearningItem, assessment: SelfAssessment) => void;
}

function formatReviewDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function ReviewPanel({ candidates, onAssess }: ReviewPanelProps) {
  const sortedCandidates = useMemo(
    () => [...candidates].sort((left, right) => left.entry.dueAt.localeCompare(right.entry.dueAt)),
    [candidates],
  );
  const [revealed, setRevealed] = useState(false);
  const [openedAt] = useState(() => Date.now());

  const active = sortedCandidates[0];

  if (!active) {
    return (
      <section className="review-panel review-empty" aria-labelledby="review-title">
        <div className="orbit-mark" aria-hidden="true">
          <span />
        </div>
        <span className="status-pill">Fila local vazia</span>
        <h2 id="review-title">Seu primeiro giro inicia a memória.</h2>
        <p>
          Conclua uma sessão em Explorar ou Executar e faça a autoavaliação. O DevSpin cuidará da
          data de retorno neste dispositivo.
        </p>
      </section>
    );
  }

  const due = new Date(active.entry.dueAt).getTime() <= openedAt;
  const conceptItem: ConceptItem | null = 'summary' in active.item ? active.item : null;
  const challengeItem: ChallengeItem | null = conceptItem ? null : (active.item as ChallengeItem);

  return (
    <section className="review-panel" aria-labelledby="review-title">
      <div className="review-heading">
        <div>
          <span className={`status-pill ${due ? 'due' : ''}`}>
            {due ? 'Revisão disponível' : `Próxima em ${formatReviewDate(active.entry.dueAt)}`}
          </span>
          <h2 id="review-title">{active.item.title}</h2>
          <p>
            Tente recordar antes de revelar. Uma resposta imperfeita também fortalece a memória.
          </p>
        </div>
        <div className="review-count" aria-label={`${sortedCandidates.length} itens agendados`}>
          <CalendarClock size={22} />
          <strong>{sortedCandidates.length}</strong>
          <span>agendados</span>
        </div>
      </div>

      <div className="recall-card">
        <span>
          <RotateCcw size={16} /> RECORDE SEM CONSULTAR
        </span>
        {conceptItem ? (
          <ul>
            {conceptItem.guidingQuestions.slice(0, 3).map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        ) : (
          <>
            <p>{challengeItem?.statement}</p>
            <ul>
              {challengeItem?.constraints.slice(0, 2).map((constraint) => (
                <li key={constraint}>{constraint}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      {!revealed ? (
        <button
          type="button"
          className="spin-primary reveal-button"
          onClick={() => setRevealed(true)}
        >
          <BookOpen size={20} /> Revelar conteúdo
        </button>
      ) : (
        <div className="review-reveal">
          <div className="review-answer">
            <span>
              <Lightbulb size={16} /> CONTEÚDO DE APOIO
            </span>
            <p>{conceptItem ? conceptItem.summary : challengeItem?.realWorldContext}</p>
            {conceptItem ? (
              <>
                <strong>Exemplo</strong>
                <p>{conceptItem.practicalExample}</p>
                <strong>Erros comuns</strong>
                <ul>
                  {conceptItem.commonMistakes.map((mistake) => (
                    <li key={mistake}>{mistake}</li>
                  ))}
                </ul>
              </>
            ) : (
              <>
                <strong>Conceitos esperados</strong>
                <ul>
                  {challengeItem?.expectedConcepts.map((expected) => (
                    <li key={expected}>{expected}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <div className="review-assessment">
            <span>
              <Check size={16} /> E AGORA, COMO VOCÊ SE SENTE?
            </span>
            <AssessmentChoices
              onSelect={(assessment) => {
                onAssess(active.item, assessment);
                setRevealed(false);
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
