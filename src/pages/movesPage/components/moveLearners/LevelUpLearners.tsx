/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import PokemonSprite from '../../../../components/elements/sprites/pokemon/PokemonSprite';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import { useState } from 'react';
import './styles.scss';

type LevelUpEntry = { mon: any; level: number };
type Props = { learners: LevelUpEntry[] };

export default function LevelUpLearners({ learners }: Props) {
  const [open, setOpen] = useState(true);
  if (learners.length === 0) return null;

  return (
    <div className={`move-card-style move-learners ${open ? '' : 'collapsed'}`}>
      <div className="section-header move-learners__header" onClick={() => setOpen((v) => !v)}>
        <CollapseToggle isOpen={open} />
        <span>Level Up Learners</span>
        <span className="move-learners__count">{learners.length} Pokémon</span>
      </div>
      {open && (
        <div className="content">
          <div className="move-learners__grid">
            {learners.map(({ mon, level }) => (
              <Link key={mon.key} to={`/pokemon/${mon.key}`} className="learner-card">
                <div className="learner-card__sprite">
                  <PokemonSprite name={mon.name} speciesKey={mon.key} size={52} />
                </div>
                <span className="learner-card__name">{mon.name}</span>
                <span className="learner-card__level">{level === 0 ? 'Evo' : `Lv. ${level}`}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
