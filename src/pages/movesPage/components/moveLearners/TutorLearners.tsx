// decomp-docs/src/pages/movesPage/components/moveLearners/TutorLearners.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PokemonSprite from '../../../../components/elements/sprites/PokemonSprite';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import './styles.scss';

type Props = { learners: any[] };

export default function TutorLearners({ learners }: Props) {
  const [open, setOpen] = useState(true);
  if (learners.length === 0) return null;

  return (
    <div className={`move-card-style move-learners ${open ? '' : 'collapsed'}`}>
      <div className="section-header move-learners__header" onClick={() => setOpen((v) => !v)}>
        <CollapseToggle isOpen={open} />
        <span>Tutor Learners</span>
        <span className="move-learners__count">{learners.length} Pokémon</span>
      </div>
      {open && (
        <div className="content">
          <div className="move-learners__grid">
            {learners.map((mon: any) => (
              <Link key={mon.key} to={`/pokemon/${mon.key}`} className="learner-card">
                <div className="learner-card__sprite">
                  <PokemonSprite name={mon.name} speciesKey={mon.key} size={52} />
                </div>
                <span className="learner-card__name">{mon.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
