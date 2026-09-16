import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from './types';
import { shuffleQuizQuestion } from './quiz';

const question: QuizQuestion = {
  id: 'quiz-test',
  prompt: 'Qual é a resposta correta?',
  options: ['Correta', 'Incorreta A', 'Incorreta B'],
  correctOptionIndex: 0,
  explanation: 'Explicação do resultado.',
};

describe('embaralhamento do mini-quiz', () => {
  it('muda a posição sem perder a alternativa correta', () => {
    const shuffled = shuffleQuizQuestion(question, () => 0);

    expect(shuffled.options).toEqual(['Incorreta A', 'Incorreta B', 'Correta']);
    expect(shuffled.correctOptionIndex).toBe(2);
    expect(shuffled.options[shuffled.correctOptionIndex]).toBe('Correta');
    expect(question.correctOptionIndex).toBe(0);
  });
});
