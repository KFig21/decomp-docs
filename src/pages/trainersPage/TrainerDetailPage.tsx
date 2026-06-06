/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import TrainerHeaderCard from './components/trainerHeaderCard/TrainerHeaderCard';
import TrainerBattleCard from './components/trainerBattleCard/TrainerBattleCard';
import JsonDebug from '../pokemonPage/components/jsonDebug/JsonDebug';

export default function TrainerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { trainers } = useData();

  const group = (trainers as any)[id ?? ''];
  const placedVariants: any[] = useMemo(
    () => (group?.variants ?? []).filter((v: any) => v.isPlaced),
    [group],
  );

  if (!group || placedVariants.length === 0) {
    return <div className="trainers-detail-pane">Trainer not found.</div>;
  }

  const representative = placedVariants[0];

  // Group placed variants by location (mapKey). Each group = one "battle".
  const battles: any[][] = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const v of placedVariants) {
      const locKey = v.location?.mapKey ?? v.location?.locationKey ?? v.key;
      if (!map.has(locKey)) map.set(locKey, []);
      map.get(locKey)!.push(v);
    }
    return Array.from(map.values());
  }, [placedVariants]);

  return (
    <div className="trainers-detail-pane">
      <TrainerHeaderCard trainer={representative} battleCount={battles.length} />
      {battles.map((battleVariants, i) => (
        <TrainerBattleCard key={i} battleIndex={i} variants={battleVariants} />
      ))}
      <JsonDebug data={group} />
    </div>
  );
}
