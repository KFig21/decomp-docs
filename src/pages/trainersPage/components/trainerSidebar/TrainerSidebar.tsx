/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TrainerSprite from '../../../../components/elements/sprites/TrainerSprite';
import type { BaseTrainerEntry } from '../../TrainersPage';
import './styles.scss';

type Props = {
  filteredTrainers: BaseTrainerEntry[];
  activeId?: string;
};

export default function TrainerSidebar({ filteredTrainers, activeId }: Props) {
  const activeRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeId]);

  return (
    <div className="trainers-sidebar">
      {filteredTrainers.length === 0 && (
        <p className="trainers-sidebar__empty">No trainers match your filters.</p>
      )}
      {filteredTrainers.map((trainer) => {
        const isActive = trainer.baseKey === activeId;
        return (
          <Link
            key={trainer.baseKey}
            ref={isActive ? activeRef : null}
            to={`/trainers/${trainer.baseKey}`}
            className={`trainers-sidebar-item ${isActive ? 'active' : ''}`}
          >
            <div className="trainer-sprite-col">
              <TrainerSprite
                name={trainer.name}
                trainerClass={trainer.trainerPic ?? trainer.trainerClass}
                sprite={trainer.trainerPic}
                size={48}
              />
            </div>
            <div className="trainer-info-col">
              <span className="trainer-class-label">{trainer.trainerClass}</span>
              <span className="trainer-name-label">{trainer.name}</span>
            </div>
            <div className="trainer-meta-col">
              {trainer.isDouble && <span className="double-badge">2v2</span>}
              <span className="battle-count">
                {trainer.uniqueLocations}{' '}
                <span className="battle-count__sub">
                  {trainer.uniqueLocations === 1 ? 'battle' : 'battles'}
                </span>
              </span>
              <span className="max-level">Lv.{trainer.maxLevel}</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
