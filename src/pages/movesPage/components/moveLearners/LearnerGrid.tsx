/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import PokemonSprite from '../../../../components/elements/sprites/pokemon/PokemonSprite';

type Entry = { mon: any; level?: number };

export default function LearnerGrid({ learners }: { learners: Entry[] }) {
  return (
    <div className="move-learners__grid">
      {learners.map(({ mon, level }) => (
        <Link key={mon.key} to={`/pokemon/${mon.key}`} className="learner-card">
          <div className="learner-card__sprite">
            <PokemonSprite name={mon.name} speciesKey={mon.key} size={52} />
          </div>
          <span className="learner-card__name">{mon.name}</span>
          {level !== undefined && (
            <span className="learner-card__level">{level === 0 ? 'Evo' : `Lv. ${level}`}</span>
          )}
        </Link>
      ))}
    </div>
  );
}
