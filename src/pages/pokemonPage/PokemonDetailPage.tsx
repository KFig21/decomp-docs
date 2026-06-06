/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
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
import './styles.scss';

export default function PokemonDetailPage() {
  const { pokemon } = useData();
  const { id } = useParams<{ id: string }>();
  const paneRef = useRef<HTMLDivElement>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const selectedArray = (Array.isArray(pokemon) ? pokemon : Object.values(pokemon)) as any[];
  const baseSelected = selectedArray.find((p) => p.key === id);
  const [activeVariant, setActiveVariant] = useState<any>(null);

  // Scroll to top and reset variant whenever the selected pokemon changes
  useEffect(() => {
    if (baseSelected) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveVariant(baseSelected);
      // Scroll the detail area (parent scrollable container) to the top
      const area = paneRef.current?.closest('.pokemon-detail-area') as HTMLElement | null;
      if (area) area.scrollTop = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseSelected?.key]); // Only re-run when the key changes, not the whole object

  // Show/hide the back-to-top button based on scroll position
  useEffect(() => {
    const area = paneRef.current?.closest('.pokemon-detail-area') as HTMLElement | null;
    if (!area) return;
    const handler = () => setShowBackToTop(area.scrollTop > 400);
    area.addEventListener('scroll', handler);
    return () => area.removeEventListener('scroll', handler);
  }, [activeVariant]);

  const scrollToTop = () => {
    const area = paneRef.current?.closest('.pokemon-detail-area') as HTMLElement | null;
    area?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!baseSelected || !activeVariant) {
    return <div className="pokemon-detail-pane">Pokémon not found!</div>;
  }

  const bst = activeVariant.baseStats
    ? Object.values(activeVariant.baseStats).reduce((a: any, c: any) => Number(a) + Number(c), 0)
    : 0;

  return (
    <div className="pokemon-detail-pane" ref={paneRef}>
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

      {/* Back to top button */}
      {showBackToTop && (
        <button className="back-to-top" onClick={scrollToTop} aria-label="Back to top">
          ↑ Top
        </button>
      )}
    </div>
  );
}
