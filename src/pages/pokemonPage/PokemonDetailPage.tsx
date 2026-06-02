/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams } from 'react-router-dom';
import { useData } from '../../contexts/dataContext';
import HeaderCard from './components/headerCard/HeaderCard';
import EvolutionFamily from './components/evolutionFamily/EvolutionFamily';
import BaseStats from './components/baseStats/BaseStats';
import Learnset from './components/learnset/Learnset';
import TmHmLearnset from './components/learnset/TmHmLearnset'; // <-- ADDED IMPORT
import WildLocations from './components/wildLocations/WildLocations';
import TrainersBlock from './components/trainersBlock/TrainersBlock';

export default function PokemonDetailPage() {
  const { pokemon } = useData();
  const { id } = useParams<{ id: string }>();

  const selectedArray = (Array.isArray(pokemon) ? pokemon : Object.values(pokemon)) as any[];
  const selected = selectedArray.find((p) => p.key === id);

  if (!selected) return <div className="pokemon-detail-pane">Pokémon not found!</div>;

  const bst = selected.baseStats
    ? Object.values(selected.baseStats).reduce((a: any, c: any) => Number(a) + Number(c), 0)
    : 0;

  return (
    <div className="pokemon-detail-pane">
      <HeaderCard selected={selected} />
      <EvolutionFamily selected={selected} />
      <BaseStats stats={selected.baseStats} bst={bst as number} />
      <Learnset learnset={selected.levelUpLearnset} />
      <TmHmLearnset learnset={selected.tmhmLearnset} />
      <WildLocations selectedKey={selected.key} />
      <TrainersBlock selectedKey={selected.key} />
    </div>
  );
}
