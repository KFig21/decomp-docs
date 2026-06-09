/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PokemonSprite from '../../../../components/elements/sprites/pokemon/PokemonSprite';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import './styles.scss';

type SlotLabel = 'primary' | 'secondary' | 'hidden';

type SectionProps = {
  learners: any[];
  slot: SlotLabel;
};

function PokemonSection({ learners, slot }: SectionProps) {
  const [open, setOpen] = useState(true);
  if (learners.length === 0) return null;

  const slotLabel = slot === 'primary' ? 'Ability 1' : slot === 'secondary' ? 'Ability 2' : 'Hidden';
  const title =
    slot === 'primary'
      ? 'Primary Ability'
      : slot === 'secondary'
        ? 'Secondary Ability'
        : 'Hidden Ability';

  return (
    <div className="ability-pokemon-section">
      <div className="ability-pokemon-section__header" onClick={() => setOpen((v) => !v)}>
        <CollapseToggle isOpen={open} />
        <span className="ability-pokemon-section__title">{title}</span>
        <span className={`ability-pokemon-section__slot-badge ability-pokemon-section__slot-badge--${slot}`}>
          {slotLabel}
        </span>
        <span className="ability-pokemon-section__count">{learners.length} Pokémon</span>
      </div>
      {open && (
        <div className="ability-pokemon-section__grid">
          {learners.map((mon: any) => (
            <Link key={mon.key} to={`/pokemon/${mon.key}`} className="ability-learner-card">
              <div className="ability-learner-card__sprite">
                <PokemonSprite name={mon.name} speciesKey={mon.key} size={52} />
              </div>
              <span className="ability-learner-card__name">{mon.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

type Props = {
  abilityKey: string;
  pokemonArray: any[];
};

export default function AbilityPokemonList({ abilityKey, pokemonArray }: Props) {
  const visible = pokemonArray.filter((mon) => mon.isSeen);

  const primary = visible.filter((mon) => mon.abilities?.[0]?.key === abilityKey);
  const secondary = visible.filter((mon) => mon.abilities?.[1]?.key === abilityKey);
  const hidden = visible.filter((mon) => mon.abilities?.[2]?.key === abilityKey);

  if (primary.length === 0 && secondary.length === 0 && hidden.length === 0) {
    return null;
  }

  return (
    <>
      <PokemonSection learners={primary} slot="primary" />
      <PokemonSection learners={secondary} slot="secondary" />
      <PokemonSection learners={hidden} slot="hidden" />
    </>
  );
}
