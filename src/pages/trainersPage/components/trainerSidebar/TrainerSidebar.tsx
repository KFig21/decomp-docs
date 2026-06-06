/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TrainerSprite from '../../../../components/elements/sprites/TrainerSprite';
import './styles.scss';

type Props = {
  filteredTrainers: any[];
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
      {filteredTrainers.map((trainer: any) => {
        const isActive = trainer.key === activeId;
        const partyCount = trainer.party?.length ?? 0;
        const maxLevel = trainer.party?.reduce(
          (max: number, p: any) => Math.max(max, p.level ?? 0),
          0,
        ) ?? 0;

        return (
          <Link
            key={trainer.key}
            ref={isActive ? activeRef : null}
            to={`/trainers/${trainer.key}`}
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
              {trainer.doubleBattle && <span className="double-badge">2v2</span>}
              <span className="party-count">
                {partyCount} <span className="party-count__sub">Lv.{maxLevel}</span>
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
