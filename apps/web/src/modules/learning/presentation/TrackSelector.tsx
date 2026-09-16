import { BrainCircuit, ChartNoAxesCombined, Code2, Cuboid, Database } from 'lucide-react';
import type { Category, Level } from '../domain/types';
import { levelLabels } from '../domain/catalog';
import { levels } from '../domain/types';

interface TrackSelectorProps {
  selectedCategories: Category[];
  selectedLevel: Level | null;
  onSelectCategories: (categories: Category[]) => void;
  onLevelChange: (level: Level | null) => void;
}

const tracks: Array<{
  label: string;
  icon: typeof Code2;
  categories: Category[];
}> = [
  {
    label: 'Python',
    icon: Code2,
    categories: [
      'logic',
      'algorithms-data-structures',
      'python',
      'software-testing',
      'python-internals-concurrency',
    ],
  },
  {
    label: 'SQL',
    icon: Database,
    categories: ['sql-databases', 'database-engineering', 'data-modeling'],
  },
  {
    label: 'Backend',
    icon: Cuboid,
    categories: ['oop', 'backend', 'api-design', 'distributed-systems', 'software-architecture'],
  },
  {
    label: 'IA & ML',
    icon: BrainCircuit,
    categories: [
      'artificial-intelligence',
      'responsible-ai',
      'machine-learning',
      'deep-learning',
      'neural-networks',
      'natural-language-processing',
      'computer-vision',
      'generative-ai',
    ],
  },
  {
    label: 'Ciência de Dados',
    icon: ChartNoAxesCombined,
    categories: [
      'data-science',
      'statistics-probability',
      'data-visualization',
      'data-engineering',
    ],
  },
];

function sameCategories(left: Category[], right: Category[]) {
  return left.length === right.length && left.every((category) => right.includes(category));
}

export function TrackSelector({
  selectedCategories,
  selectedLevel,
  onSelectCategories,
  onLevelChange,
}: TrackSelectorProps) {
  return (
    <section className="track-selector" aria-label="Trilha e nível de aprendizagem">
      <div className="track-list">
        {tracks.map(({ label, icon: Icon, categories }) => {
          const selected = sameCategories(selectedCategories, categories);
          return (
            <button
              type="button"
              className={`track-pill ${selected ? 'selected' : ''}`}
              aria-pressed={selected}
              key={label}
              onClick={() => onSelectCategories(selected ? [] : categories)}
            >
              <Icon size={22} strokeWidth={1.8} aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="compact-levels">
        <span>Nível</span>
        <button
          type="button"
          className={selectedLevel === null ? 'active' : ''}
          aria-pressed={selectedLevel === null}
          onClick={() => onLevelChange(null)}
        >
          Todos
        </button>
        {levels.map((level) => (
          <button
            type="button"
            className={selectedLevel === level ? 'active' : ''}
            aria-pressed={selectedLevel === level}
            key={level}
            onClick={() => onLevelChange(level)}
          >
            {levelLabels[level]}
          </button>
        ))}
      </div>
    </section>
  );
}
