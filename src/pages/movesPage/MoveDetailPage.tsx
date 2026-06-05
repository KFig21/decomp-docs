/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import MoveHeaderCard from './components/moveHeaderCard/MoveHeaderCard';
import MoveTmInfo from './components/moveTmInfo/MoveTmInfo';
import MoveLearners from './components/moveLearners/MoveLearners';

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

  // Who learns this move by level-up?
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

  // Who learns this move via TM/HM?
  const tmLearners = tmItem
    ? pokemonArray.filter(
        (mon: any) =>
          mon.isSeen &&
          mon.tmhmLearnset?.some((e: any) => {
            const moveKey = typeof e.move === 'string' ? e.move : e.move?.key;
            return moveKey === selected.key;
          }),
      )
    : [];

  return (
    <div className="moves-detail-pane">
      <MoveHeaderCard move={selected} />
      {tmItem && <MoveTmInfo tmItem={tmItem} move={selected} />}
      <MoveLearners
        moveKey={selected.key}
        levelUpLearners={levelUpLearners}
        tmLearners={tmLearners}
        hasTm={!!tmItem}
      />
    </div>
  );
}
