import { useState } from 'react';
import { CheckCircle2, CircleHelp, RotateCcw, XCircle } from 'lucide-react';
import type { QuizQuestion } from '../domain/types';

interface QuickQuizProps {
  question: QuizQuestion;
}

export function QuickQuiz({ question }: QuickQuizProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const isCorrect = selectedOption === question.correctOptionIndex;

  const reset = () => {
    setSelectedOption(null);
    setSubmitted(false);
  };

  return (
    <details className="quick-quiz">
      <summary>
        <CircleHelp size={17} aria-hidden="true" /> Testar conhecimento
      </summary>
      <div className="quick-quiz-content">
        <fieldset disabled={submitted}>
          <legend>{question.prompt}</legend>
          <div className="quiz-options">
            {question.options.map((option, index) => (
              <label key={option} className={selectedOption === index ? 'selected' : ''}>
                <input
                  type="radio"
                  name={question.id}
                  checked={selectedOption === index}
                  onChange={() => setSelectedOption(index)}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {submitted ? (
          <div className={`quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`} role="status">
            {isCorrect ? (
              <CheckCircle2 size={20} aria-hidden="true" />
            ) : (
              <XCircle size={20} aria-hidden="true" />
            )}
            <span>
              <strong>{isCorrect ? 'Resposta correta!' : 'Ainda não.'}</strong>
              {question.explanation}
            </span>
            <button type="button" onClick={reset}>
              <RotateCcw size={15} aria-hidden="true" /> Tentar novamente
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="quiz-submit"
            disabled={selectedOption === null}
            onClick={() => setSubmitted(true)}
          >
            Confirmar resposta
          </button>
        )}
      </div>
    </details>
  );
}
