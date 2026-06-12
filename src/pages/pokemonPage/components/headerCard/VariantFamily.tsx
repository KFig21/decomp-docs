/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import PokemonSprite from '../../../../components/elements/sprites/pokemon/PokemonSprite';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import './styles.scss';

function formatVariantLabel(key: string, baseKey: string): string {
  if (key === baseKey) return 'Base Form';
  return key
    .replace(`${baseKey}_`, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

type Props = {
  baseSelected: any;
  activeVariant: any;
  onVariantChange: (variant: any) => void;
};

export default function VariantFamily({ baseSelected, activeVariant, onVariantChange }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  const allForms: any[] = [baseSelected, ...(baseSelected.variants ?? [])];

  return (
    <div className={`pokemon-card-style${isOpen ? '' : ' collapsed'}`}>
      <div className="section-header" onClick={() => setIsOpen((v) => !v)}>
        <CollapseToggle isOpen={isOpen} />
        <span>Forms</span>
        <span className="variant-family__count">{allForms.length}</span>
      </div>
      {isOpen && (
        <div className="content">
          <div className="variant-family">
            {allForms.map((form) => {
              const isActive = form.key === activeVariant.key;
              return (
                <button
                  key={form.key}
                  className={`variant-family__card${isActive ? ' variant-family__card--active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); onVariantChange(form); }}
                  title={form.name}
                >
                  <PokemonSprite name={form.name} speciesKey={form.key} size={48} />
                  <span className="variant-family__label">
                    {formatVariantLabel(form.key, baseSelected.key)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
