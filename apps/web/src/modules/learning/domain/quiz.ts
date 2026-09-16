import type { QuizQuestion } from './types';

export function shuffleQuizQuestion(question: QuizQuestion, random = Math.random): QuizQuestion {
  const options = question.options.map((option, index) => ({
    option,
    isCorrect: index === question.correctOptionIndex,
  }));

  for (let index = options.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [options[index], options[target]] = [options[target]!, options[index]!];
  }

  return {
    ...question,
    options: options.map(({ option }) => option),
    correctOptionIndex: options.findIndex(({ isCorrect }) => isCorrect),
  };
}
