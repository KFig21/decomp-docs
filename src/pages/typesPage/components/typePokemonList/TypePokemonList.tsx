/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import TypePokemonGrid from './TypePokemonGrid';
import TypePokemonTable from './TypePokemonTable';
import './styles.scss';

type Props = {
  pokemon: any[];
  unreleasedKeys?: Set<string>;
};

type ViewMode = 'grid' | 'table';

export default function TypePokemonList({ pokemon, unreleasedKeys }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  return (
    <section className={`type-card-style ${isOpen ? '' : 'collapsed'}`}>
      <div className="section-header" onClick={() => setIsOpen(!isOpen)}>
        <CollapseToggle isOpen={isOpen} />
        Pokémon
        <span className="type-section__count">{pokemon.length}</span>
        <div className="view-mode-toggle" onClick={(e) => e.stopPropagation()}>
          <button
            className={`view-mode-toggle__btn ${viewMode === 'table' ? 'view-mode-toggle__btn--active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Table view"
          >
            ≡
          </button>
          <button
            className={`view-mode-toggle__btn ${viewMode === 'grid' ? 'view-mode-toggle__btn--active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            ⊞
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="content">
          {viewMode === 'grid'
            ? <TypePokemonGrid pokemon={pokemon} unreleasedKeys={unreleasedKeys} />
            : <TypePokemonTable pokemon={pokemon} unreleasedKeys={unreleasedKeys} />
          }
        </div>
      )}
    </section>
  );
}
