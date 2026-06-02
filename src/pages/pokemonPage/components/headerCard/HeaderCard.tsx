/* eslint-disable @typescript-eslint/no-explicit-any */
import PokemonSprite from '../../../../components/elements/sprites/PokemonSprite';
import TypeBadge from '../../../../components/elements/typeBadge/TypeBadge';
import './styles.scss';

type Props = {
  selected: any;
};

export default function HeaderCard({ selected }: Props) {
  const uniqueTypes = Array.from(new Set(selected.types ?? [])).filter(Boolean) as string[];

  return (
    <div className="header-card pokemon-card-style">
      <div className="sprite-showcase">
        <PokemonSprite name={selected.name} size={96} />
      </div>
      <div className="header-info">
        <div className="header-info-left">
          <div className="pokemon-name">{selected.name}</div>
          <div className="pokemon-types">
            {uniqueTypes.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>
          <div className="abilities-list">
            <strong>Abilities:</strong>{' '}
            {selected.abilities?.map((a: any) => a.name).join(' / ') || 'None'}
          </div>
        </div>
        {selected.pokedexEntry && <p className="pokedex-entry">"{selected.pokedexEntry}"</p>}
      </div>
    </div>
  );
}
