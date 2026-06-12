/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PokemonSprite from '../../../../components/elements/sprites/pokemon/PokemonSprite';
import TypeBadge from '../../../../components/elements/typeBadge/TypeBadge';
import { dexTypeLabel } from '../pokemonFilterBar/PokemonFilterBar';
import './styles.scss';

type Props = {
  activeVariant: any;
};

export default function HeaderCard({ activeVariant }: Props) {
  const [isShiny, setIsShiny] = useState(false);

  const uniqueTypes = Array.from(new Set(activeVariant.types ?? [])).filter(Boolean) as string[];
  const dexEntries =
    activeVariant.dexNums && Object.keys(activeVariant.dexNums).length > 0
      ? Object.entries(activeVariant.dexNums as Record<string, number>)
      : typeof activeVariant.natDexNum === 'number'
        ? [['NATIONAL_DEX', activeVariant.natDexNum] as [string, number]]
        : [];

  return (
    <div className="header-card pokemon-card-style">
      <div className="sprite-showcase">
        <PokemonSprite
          name={activeVariant.name}
          speciesKey={activeVariant.key}
          size={160}
          shiny={isShiny}
        />
        <button
          className={`shiny-toggle${isShiny ? ' shiny-toggle--active' : ''}`}
          onClick={() => setIsShiny((v) => !v)}
          title={isShiny ? 'Show normal sprite' : 'Show shiny sprite'}
        >
          ✦
        </button>
      </div>
      <div className="header-info">
        <div className="header-info-left">
          <div className="pokemon-name">{activeVariant.name}</div>
          <div className="pokemon-types">
            {uniqueTypes.map((type) => (
              <TypeBadge key={type} type={type} />
            ))}
          </div>
          <div className="abilities-list">
            <strong>Abilities:</strong>{' '}
            {activeVariant.abilities?.filter((a: any) => a.name).length > 0
              ? activeVariant.abilities
                  .filter((a: any) => a.name)
                  .map((a: any, i: number, arr: any[]) => (
                    <span key={a.key}>
                      <Link to={`/abilities/${a.key}`} className="ability-link">
                        {a.name}
                      </Link>
                      {i < arr.length - 1 && ' / '}
                    </span>
                  ))
              : 'None'}
          </div>
        </div>

        {dexEntries.length > 0 && (
          <div className="header-meta-row">
            <div className="dex-nums-row">
              {dexEntries.map(([dexType, num]) => (
                <span key={dexType} className="dex-nums-row__chip">
                  <span className="dex-nums-row__label">{dexTypeLabel(dexType)}</span>
                  <span className="dex-nums-row__num">#{String(num).padStart(3, '0')}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {activeVariant.pokedexEntry && (
          <p className="pokedex-entry">"{activeVariant.pokedexEntry}"</p>
        )}
      </div>
    </div>
  );
}
