import { RotateCcw, SlidersHorizontal } from 'lucide-react';
import { categoryLabels, levelLabels } from '../domain/catalog';
import { categories, levels } from '../domain/types';
import type { Category, Level } from '../domain/types';

interface FiltersProps {
  selectedCategories: Category[];
  selectedLevel: Level | null;
  onToggleCategory: (category: Category) => void;
  onLevelChange: (level: Level | null) => void;
  onClear: () => void;
}

export function Filters({
  selectedCategories,
  selectedLevel,
  onToggleCategory,
  onLevelChange,
  onClear,
}: FiltersProps) {
  const activeCount = selectedCategories.length + (selectedLevel ? 1 : 0);

  return (
    <section className="filters-panel" aria-labelledby="filters-title">
      <div className="filters-heading">
        <div>
          <span className="section-kicker">
            <SlidersHorizontal size={13} /> AJUSTE A ROTA
          </span>
          <h2 id="filters-title">O que você quer explorar?</h2>
        </div>
        <button
          type="button"
          className="text-button"
          onClick={onClear}
          disabled={activeCount === 0}
        >
          <RotateCcw size={14} /> Limpar filtros
        </button>
      </div>

      <fieldset>
        <legend className="sr-only">Categorias</legend>
        <div className="chip-row">
          {categories.map((category) => (
            <button
              type="button"
              className={`filter-chip ${selectedCategories.includes(category) ? 'selected' : ''}`}
              aria-pressed={selectedCategories.includes(category)}
              key={category}
              onClick={() => onToggleCategory(category)}
            >
              <span className="chip-dot" aria-hidden="true" />
              {categoryLabels[category]}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="level-row">
        <span className="filter-label">NÍVEL</span>
        <div className="segmented" aria-label="Filtrar por nível">
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
        <p className="filter-summary" aria-live="polite">
          {activeCount === 0
            ? 'Todas as categorias e níveis'
            : `${selectedCategories.length || 'Todas as'} categoria${selectedCategories.length === 1 ? '' : 's'} · ${selectedLevel ? levelLabels[selectedLevel] : 'todos os níveis'}`}
        </p>
      </div>
    </section>
  );
}
