import { Brain, CheckCircle2, RefreshCcw } from 'lucide-react';
import { assessmentLabels } from '../domain/progress';
import type { SelfAssessment } from '../domain/progress';

interface AssessmentChoicesProps {
  onSelect: (assessment: SelfAssessment) => void;
}

const choices = [
  {
    value: 'needs-review',
    description: 'Quero reencontrar este item amanhã.',
    icon: RefreshCcw,
  },
  {
    value: 'almost-there',
    description: 'Entendi a ideia, mas ainda preciso praticar.',
    icon: Brain,
  },
  {
    value: 'can-explain',
    description: 'Consigo explicar com minhas próprias palavras.',
    icon: CheckCircle2,
  },
] satisfies Array<{
  value: SelfAssessment;
  description: string;
  icon: typeof Brain;
}>;

export function AssessmentChoices({ onSelect }: AssessmentChoicesProps) {
  return (
    <div className="assessment-choices">
      {choices.map(({ value, description, icon: Icon }) => (
        <button type="button" key={value} onClick={() => onSelect(value)}>
          <Icon size={21} aria-hidden="true" />
          <span>
            <strong>{assessmentLabels[value]}</strong>
            <small>{description}</small>
          </span>
        </button>
      ))}
    </div>
  );
}
