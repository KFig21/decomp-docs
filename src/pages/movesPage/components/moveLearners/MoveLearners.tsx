/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import PokemonSprite from '../../../../components/elements/sprites/PokemonSprite';
import './styles.scss';

type Props = {
  moveKey: string;
  levelUpLearners: { mon: any; level: number }[];
  tmLearners: any[];
  hasTm: boolean;
};

type Tab = 'level-up' | 'tm';

export default function MoveLearners({ levelUpLearners, tmLearners, hasTm }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('level-up');

  const hasLevelUp = levelUpLearners.length > 0;
  const hasTmTab = hasTm && tmLearners.length > 0;

  if (!hasLevelUp && !hasTmTab) return null;

  // If only one tab exists, collapse the tab bar
  const showTabs = hasLevelUp && hasTmTab;
  const displayed =
    activeTab === 'level-up' ? levelUpLearners : tmLearners.map((mon) => ({ mon, level: null }));

  return (
    <div className="move-card-style move-learners">
      <div className="section-header move-learners__header">
        <span>Learners</span>
        {showTabs && (
          <div className="move-learners__tabs">
            <button
              className={`move-learners__tab ${activeTab === 'level-up' ? 'active' : ''}`}
              onClick={() => setActiveTab('level-up')}
            >
              Level Up ({levelUpLearners.length})
            </button>
            <button
              className={`move-learners__tab ${activeTab === 'tm' ? 'active' : ''}`}
              onClick={() => setActiveTab('tm')}
            >
              TM / HM ({tmLearners.length})
            </button>
          </div>
        )}
        {!showTabs && (
          <span className="move-learners__count">
            {hasLevelUp ? `Level Up · ${levelUpLearners.length}` : `TM/HM · ${tmLearners.length}`}{' '}
            Pokémon
          </span>
        )}
      </div>
      <div className="content">
        <div className="move-learners__grid">
          {displayed.map(({ mon, level }: { mon: any; level: number | null }) => (
            <Link key={mon.key} to={`/pokemon/${mon.key}`} className="learner-card">
              <div className="learner-card__sprite">
                <PokemonSprite name={mon.name} speciesKey={mon.key} size={52} />
              </div>
              <span className="learner-card__name">{mon.name}</span>
              {level != null && (
                <span className="learner-card__level">Lv. {level === 0 ? '—' : level}</span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
