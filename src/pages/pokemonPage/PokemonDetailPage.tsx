/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import HeaderCard from './components/headerCard/HeaderCard';
import EvolutionFamily from './components/evolutionFamily/EvolutionFamily';
import BaseStats from './components/baseStats/BaseStats';
import Learnset from './components/learnset/Learnset';
import TmHmLearnset from './components/learnset/TmHmLearnset';
import WildLocations from './components/wildLocations/WildLocations';
import TrainersBlock from './components/trainersBlock/TrainersBlock';
import PokemonHeldItems from './components/pokemonHeldItems/PokemonHeldItems';
import JsonDebug from './components/jsonDebug/JsonDebug';

export default function PokemonDetailPage() {
  const { pokemon } = useData();
  const { id } = useParams<{ id: string }>();

  const selectedArray = (Array.isArray(pokemon) ? pokemon : Object.values(pokemon)) as any[];
  const baseSelected = selectedArray.find((p) => p.key === id);
  const [activeVariant, setActiveVariant] = useState<any>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (baseSelected) setActiveVariant(baseSelected);
  }, [baseSelected]);

  if (!baseSelected || !activeVariant) {
    return <div className="pokemon-detail-pane">Pokémon not found!</div>;
  }

  const bst = activeVariant.baseStats
    ? Object.values(activeVariant.baseStats).reduce((a: any, c: any) => Number(a) + Number(c), 0)
    : 0;

  return (
    <div className="pokemon-detail-pane">
      <HeaderCard
        baseSelected={baseSelected}
        activeVariant={activeVariant}
        onVariantChange={setActiveVariant}
      />
      <EvolutionFamily selected={activeVariant} />
      <BaseStats stats={activeVariant.baseStats} bst={bst as number} />
      <PokemonHeldItems heldItems={activeVariant.heldItems} />
      <Learnset learnset={activeVariant.levelUpLearnset} />
      <TmHmLearnset learnset={activeVariant.tmhmLearnset} />
      <WildLocations selectedKey={activeVariant.key} />
      <TrainersBlock selectedKey={activeVariant.key} />
      <JsonDebug data={activeVariant} />
    </div>
  );
}
