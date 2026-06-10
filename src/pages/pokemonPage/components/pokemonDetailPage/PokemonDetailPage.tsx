/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../../../contexts/dataContext';
import HeaderCard from '../headerCard/HeaderCard';
import EvolutionFamily from '../evolutionFamily/EvolutionFamily';
import BaseStats from '../baseStats/BaseStats';
import Learnset from '../learnset/Learnset';
import TmHmLearnset from '../learnset/TmHmLearnset';
import WildLocations from '../wildLocations/WildLocations';
import TrainersBlock from '../trainersBlock/TrainersBlock';
import PokemonHeldItems from '../pokemonHeldItems/PokemonHeldItems';
import JsonDebug from '../jsonDebug/JsonDebug';
import PokemonSprite from '../../../../components/elements/sprites/pokemon/PokemonSprite';
import TypeBadge from '../../../../components/elements/typeBadge/TypeBadge';
import './styles.scss';

const TOPBAR_HEIGHT = 52;

const SECTIONS = [
  { id: 'poke-overview',   label: 'Overview' },
  { id: 'poke-evolution',  label: 'Evolution' },
  { id: 'poke-stats',      label: 'Stats' },
  { id: 'poke-held-items', label: 'Held Items' },
  { id: 'poke-moves',      label: 'Moves' },
  { id: 'poke-tmhm',       label: 'TM / Tutor' },
  { id: 'poke-locations',  label: 'Locations' },
  { id: 'poke-trainers',   label: 'Trainers' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

export default function PokemonDetailPage() {
  const { pokemon } = useData();
  const { id } = useParams<{ id: string }>();
  const paneRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<SectionId>('poke-overview');

  const selectedArray = (Array.isArray(pokemon) ? pokemon : Object.values(pokemon)) as any[];
  const baseSelected = selectedArray.find((p) => p.key === id);
  const [activeVariant, setActiveVariant] = useState<any>(null);

  // Reset variant and scroll to top whenever selected pokemon changes
  useEffect(() => {
    if (baseSelected) {
      setActiveVariant(baseSelected);
      setActiveSection('poke-overview');
      const area = paneRef.current?.closest('.pokemon-detail-area') as HTMLElement | null;
      if (area) area.scrollTop = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseSelected?.key]);

  // Track which section is in view via scroll
  useEffect(() => {
    const area = paneRef.current?.closest('.pokemon-detail-area') as HTMLElement | null;
    if (!area) return;

    const handleScroll = () => {
      const areaRect = area.getBoundingClientRect();
      let current: SectionId = SECTIONS[0].id;
      for (const { id: sId } of SECTIONS) {
        const el = document.getElementById(sId);
        if (!el) continue;
        if (el.getBoundingClientRect().top - areaRect.top <= TOPBAR_HEIGHT + 16) {
          current = sId;
        }
      }
      setActiveSection(current);
    };

    area.addEventListener('scroll', handleScroll, { passive: true });
    return () => area.removeEventListener('scroll', handleScroll);
  }, [activeVariant]);

  const scrollToSection = (sectionId: string) => {
    const area = paneRef.current?.closest('.pokemon-detail-area') as HTMLElement | null;
    const el = document.getElementById(sectionId);
    if (!area || !el) return;
    const offset = el.getBoundingClientRect().top - area.getBoundingClientRect().top - TOPBAR_HEIGHT;
    area.scrollBy({ top: offset, behavior: 'smooth' });
  };

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
    <>
      {/* ── Sticky top bar ───────────────────────────────────────────────────── */}
      <div className="pokemon-detail-topbar">
        <div className="pokemon-detail-topbar__identity">
          <PokemonSprite name={activeVariant.name} size={38} />
          <span className="pokemon-detail-topbar__name">{activeVariant.name}</span>
          {activeVariant.types && (
            <div className="pokemon-detail-topbar__types">
              {(activeVariant.types as string[]).filter(Boolean).map((t: string) => (
                <TypeBadge key={t} type={t} />
              ))}
            </div>
          )}
        </div>

        <nav className="pokemon-detail-topbar__nav">
          {SECTIONS.map(({ id: sId, label }) => (
            <button
              key={sId}
              className={`poke-nav-link ${activeSection === sId ? 'poke-nav-link--active' : ''}`}
              onClick={() => scrollToSection(sId)}
            >
              {label}
            </button>
          ))}
        </nav>

        <button className="poke-back-to-top" onClick={scrollToTop} title="Back to top">
          ↑ Top
        </button>
      </div>

      {/* ── Detail pane ──────────────────────────────────────────────────────── */}
      <div className="pokemon-detail-pane" ref={paneRef}>
        <div id="poke-overview">
          <HeaderCard
            baseSelected={baseSelected}
            activeVariant={activeVariant}
            onVariantChange={setActiveVariant}
          />
        </div>
        <div id="poke-evolution">
          <EvolutionFamily selected={activeVariant} />
        </div>
        <div id="poke-stats">
          <BaseStats stats={activeVariant.baseStats} bst={bst as number} />
        </div>
        <div id="poke-held-items">
          <PokemonHeldItems heldItems={activeVariant.heldItems} />
        </div>
        <div id="poke-moves">
          <Learnset learnset={activeVariant.levelUpLearnset} />
        </div>
        <div id="poke-tmhm">
          <TmHmLearnset learnset={activeVariant.tmhmLearnset} />
        </div>
        <div id="poke-locations">
          <WildLocations selectedKey={activeVariant.key} />
        </div>
        <div id="poke-trainers">
          <TrainersBlock selectedKey={activeVariant.key} />
        </div>
        <JsonDebug data={activeVariant} />
      </div>
    </>
  );
}
