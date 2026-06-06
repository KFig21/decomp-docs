/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import MoveHeaderCard from './components/moveHeaderCard/MoveHeaderCard';
import MoveTmInfo from './components/moveTmInfo/MoveTmInfo';
import LevelUpLearners from './components/moveLearners/LevelUpLearners';
import TmLearners from './components/moveLearners/TmLearners';

type Props = {
  tmByMove: Record<string, any>;
  pokemonArray: any[];
};

export default function MoveDetailPage({ tmByMove, pokemonArray }: Props) {
  const { moves } = useData();
  const { id } = useParams<{ id: string }>();

  const movesRecord = (moves || {}) as Record<string, any>;
  const selected = movesRecord[id ?? ''];

  if (!selected) return <div className="moves-detail-pane">Move not found!</div>;

  const tmItem = tmByMove[selected.key];
  const isHm = tmItem?.key?.startsWith('ITEM_HM');

  // ── Level-up learners ─────────────────────────────────────────────────────
  const levelUpLearners = pokemonArray
    .filter(
      (mon: any) =>
        mon.isSeen &&
        mon.levelUpLearnset?.some((e: any) => {
          const moveKey = typeof e.move === 'string' ? e.move : e.move?.key;
          return moveKey === selected.key;
        }),
    )
    .map((mon: any) => {
      const entry = mon.levelUpLearnset.find((e: any) => {
        const moveKey = typeof e.move === 'string' ? e.move : e.move?.key;
        return moveKey === selected.key;
      });
      return { mon, level: entry?.lvl ?? 0 };
    })
    .sort((a: any, b: any) => a.level - b.level);

  // ── TM/HM learners ────────────────────────────────────────────────────────
  // The expansion's all_learnables.json format produces { move } entries with
  // no .tm — we still show TM learners whenever a TM item exists for this move.
  const tmLearners = pokemonArray.filter(
    (mon: any) =>
      mon.isSeen &&
      mon.tmhmLearnset?.some((e: any) => {
        const moveKey = typeof e.move === 'string' ? e.move : e.move?.key;
        return moveKey === selected.key;
      }),
  );

  return (
    <div className="moves-detail-pane">
      <MoveHeaderCard move={selected} />
      {tmItem && <MoveTmInfo tmItem={tmItem} move={selected} />}
      <LevelUpLearners learners={levelUpLearners} />
      <TmLearners learners={tmLearners} isHm={isHm} />
    </div>
  );
}
