/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import PokemonSprite from '../../../../components/elements/sprites/pokemon/PokemonSprite';
import TypeBadge from '../../../../components/elements/typeBadge/TypeBadge';
import './styles.scss';

type Props = {
  baseSelected: any;
  activeVariant: any;
  onVariantChange: (variant: any) => void;
};

export default function HeaderCard({ baseSelected, activeVariant, onVariantChange }: Props) {
  const uniqueTypes = Array.from(new Set(activeVariant.types ?? [])).filter(Boolean) as string[];
  const hasVariants = baseSelected.variants && baseSelected.variants.length > 0;

  // Helper to format raw constant names nicely (e.g., "SPECIES_PIKACHU_ALOLA" -> "Alola")
  const formatVariantName = (key: string, baseKey: string) => {
    if (key === baseKey) return 'Base Form';
    return key.replace(`${baseKey}_`, '').replace(/_/g, ' ');
  };

  const handleVariantSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedKey = e.target.value;
    if (selectedKey === baseSelected.key) {
      onVariantChange(baseSelected);
    } else {
      const found = baseSelected.variants.find((v: any) => v.key === selectedKey);
      if (found) onVariantChange(found);
    }
  };

  console.log('activeVariant', activeVariant);

  return (
    <div className="header-card pokemon-card-style">
      <div className="sprite-showcase">
        <PokemonSprite name={activeVariant.name} speciesKey={activeVariant.key} size={96} />
      </div>
      <div className="header-info">
        <div className="header-info-left">
          <div className="pokemon-name">
            {typeof activeVariant.natDexNum === 'number' && (
              <span className="dex-num">#{String(activeVariant.natDexNum).padStart(3, '0')}</span>
            )}{' '}
            {activeVariant.name}
          </div>

          <div className="pokemon-types">
            {uniqueTypes.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>
          <div className="abilities-list">
            <strong>Abilities:</strong>{' '}
            {activeVariant.abilities?.filter((a: any) => a.name).length > 0
              ? activeVariant.abilities.filter((a: any) => a.name).map((a: any, i: number, arr: any[]) => (
                  <span key={a.key}>
                    <Link to={`/abilities/${a.key}`} className="ability-link">{a.name}</Link>
                    {i < arr.length - 1 && ' / '}
                  </span>
                ))
              : 'None'}
          </div>

          {hasVariants && (
            <div className="variant-selector">
              <select value={activeVariant.key} onChange={handleVariantSelect}>
                <option value={baseSelected.key}>Base Form</option>
                {baseSelected.variants.map((v: any) => (
                  <option key={v.key} value={v.key}>
                    {formatVariantName(v.key, baseSelected.key)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {activeVariant.pokedexEntry && (
          <p className="pokedex-entry">"{activeVariant.pokedexEntry}"</p>
        )}
      </div>
    </div>
  );
}
