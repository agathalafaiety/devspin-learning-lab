import { useState } from 'react';
import {
  Bookmark,
  BookmarkCheck,
  BookOpen,
  BrainCircuit,
  Play,
  RotateCw,
  Terminal,
} from 'lucide-react';
import { categoryLabels, levelLabels } from '../domain/catalog';
import type { ChallengeItem, ConceptItem, LearningMode } from '../domain/types';
import { QuickQuiz } from './QuickQuiz';

interface SpinCoreProps {
  mode: Exclude<LearningMode, 'review'>;
  item: ConceptItem | ChallengeItem;
  isSpinning: boolean;
  noResult: boolean;
  onDraw: () => void;
  onStart: () => void;
  onExplain: () => void;
  isFavorite: boolean;
  lastAssessmentLabel: string | null;
  onToggleFavorite: () => void;
  onQuizAnswered: (questionId: string, correct: boolean) => void;
}

function isConcept(item: ConceptItem | ChallengeItem): item is ConceptItem {
  return 'summary' in item;
}

export function SpinCore({
  mode,
  item,
  isSpinning,
  noResult,
  onDraw,
  onStart,
  onExplain,
  isFavorite,
  lastAssessmentLabel,
  onToggleFavorite,
  onQuizAnswered,
}: SpinCoreProps) {
  const concept = isConcept(item);
  const [revealedHints, setRevealedHints] = useState(0);
  const [showExpectedConcepts, setShowExpectedConcepts] = useState(false);

  return (
    <section className={`spin-stage ${isSpinning ? 'spinning' : ''}`} aria-labelledby="spin-title">
      <article className="spin-card" aria-live="polite" aria-busy={isSpinning}>
        {noResult ? (
          <div className="empty-result">
            <RotateCw size={34} />
            <h2 id="spin-title">Ainda não há item nessa órbita.</h2>
            <p>
              Essa combinação ainda não possui itens. Experimente outro nível ou remova um filtro.
            </p>
            <button type="button" className="secondary-button" onClick={onDraw}>
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            <div className="core-glyph" aria-hidden="true">
              {mode === 'explore' ? <BrainCircuit size={29} /> : <Terminal size={29} />}
              <i />
              <i />
              <i />
            </div>
            <p className="mode-caption">
              {categoryLabels[item.category]} · {levelLabels[item.level]}
            </p>
            <h2 id="spin-title">{isSpinning ? 'Mapeando conexões…' : item.title}</h2>
            <p className="spin-summary">{concept ? item.summary : item.statement}</p>
            <div className="item-status-row">
              <button
                type="button"
                className={`favorite-button ${isFavorite ? 'active' : ''}`}
                onClick={onToggleFavorite}
                aria-pressed={isFavorite}
              >
                {isFavorite ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
                {isFavorite ? 'Salvo' : 'Salvar'}
              </button>
              {lastAssessmentLabel && <span>Última avaliação: {lastAssessmentLabel}</span>}
            </div>

            {concept ? (
              <div className="concept-support">
                <details className="learning-details">
                  <summary>Ver roteiro de estudo</summary>
                  <div>
                    <strong>3 perguntas-chave</strong>
                    <ul>
                      {item.guidingQuestions.map((question) => (
                        <li key={question}>{question}</li>
                      ))}
                    </ul>
                    <strong>Exemplo prático</strong>
                    <p>{item.practicalExample}</p>
                    <div className="term-list">
                      {item.relatedTerms.map((term) => (
                        <span key={term}>{term}</span>
                      ))}
                    </div>
                  </div>
                </details>
                <QuickQuiz question={item.quickQuiz[0]!} onAnswered={onQuizAnswered} />
              </div>
            ) : (
              <div className="challenge-support">
                {item.hints.slice(0, revealedHints).map((hint, index) => (
                  <p key={hint}>
                    <strong>Dica {index + 1}:</strong> {hint}
                  </p>
                ))}
                {revealedHints < item.hints.length ? (
                  <button type="button" onClick={() => setRevealedHints((current) => current + 1)}>
                    Mostrar dica {revealedHints + 1}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowExpectedConcepts((current) => !current)}
                  >
                    {showExpectedConcepts
                      ? 'Ocultar conceitos esperados'
                      : 'Ver conceitos esperados'}
                  </button>
                )}
                {showExpectedConcepts && (
                  <div className="term-list expected-concepts">
                    {item.expectedConcepts.map((term) => (
                      <span key={term}>{term}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button type="button" className="spin-primary" onClick={onDraw} disabled={isSpinning}>
              <RotateCw size={22} />{' '}
              {isSpinning ? 'Girando…' : `Girar ${mode === 'explore' ? 'conceito' : 'desafio'}`}
            </button>
            <div className="spin-actions">
              <button type="button" className="session-button" onClick={onStart}>
                <BookOpen size={20} /> {mode === 'explore' ? 'Explorar' : 'Executar'} · 30 min
              </button>
              <button type="button" className="session-button" onClick={onExplain}>
                <Play size={20} /> Explicar · 15 min
              </button>
            </div>
          </>
        )}
      </article>
    </section>
  );
}
