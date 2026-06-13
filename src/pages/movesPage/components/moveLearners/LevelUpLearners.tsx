/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import CollapseToggle from '../../../../components/elements/collapseToggle/CollapseToggle';
import LearnerGrid from './LearnerGrid';
import LearnerTable from './LearnerTable';
import './styles.scss';

type LevelUpEntry = { mon: any; level: number };
type Props = { learners: LevelUpEntry[] };

type ViewMode = 'grid' | 'table';

export default function LevelUpLearners({ learners }: Props) {
  const [open, setOpen] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  if (learners.length === 0) return null;

  return (
    <div className={`move-card-style move-learners ${open ? '' : 'collapsed'}`}>
      <div className="section-header move-learners__header" onClick={() => setOpen((v) => !v)}>
        <CollapseToggle isOpen={open} />
        <span>Level Up Learners</span>
        <span className="move-learners__count">{learners.length} Pokémon</span>
        <div className="learner-view-toggle" onClick={(e) => e.stopPropagation()}>
          <button
            className={`learner-view-toggle__btn ${viewMode === 'grid' ? 'learner-view-toggle__btn--active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid view"
          >
            ⊞
          </button>
          <button
            className={`learner-view-toggle__btn ${viewMode === 'table' ? 'learner-view-toggle__btn--active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Table view"
          >
            ≡
          </button>
        </div>
      </div>
      {open && (
        <div className="content">
          {viewMode === 'grid'
            ? <LearnerGrid learners={learners} />
            : <LearnerTable learners={learners} showLevel />
          }
        </div>
      )}
    </div>
  );
}
