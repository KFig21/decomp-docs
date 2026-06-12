/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useData } from '../../../../contexts/dataContext';
import AbilityHeaderCard from '../abilityHeaderCard/AbilityHeaderCard';
import AbilityPokemonList from '../abilityPokemonList/AbilityPokemonList';
import AbilityTrainersSection from '../abilityTrainersSection/AbilityTrainersSection';
import AbilityDetailTopBar, {
  ABILITY_SECTIONS,
  type AbilitySectionId,
} from './AbilityDetailTopBar';
import './styles.scss';

const TOPBAR_HEIGHT = 52;

type Props = {
  pokemonArray: any[];
  showUnreleased: boolean;
};

export default function AbilityDetailPage({ pokemonArray, showUnreleased }: Props) {
  const { id } = useParams<{ id: string }>();
  const { abilities } = useData();
  const paneRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<AbilitySectionId>('ability-overview');

  const selected = (abilities as Record<string, any>)[id ?? ''];

  // Reset scroll and active section when ability changes
  useEffect(() => {
    if (selected) {
      setActiveSection('ability-overview');
      const area = paneRef.current?.closest('.abilities-detail-area') as HTMLElement | null;
      if (area) area.scrollTop = 0;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.key]);

  // Track active section via scroll
  useEffect(() => {
    const area = paneRef.current?.closest('.abilities-detail-area') as HTMLElement | null;
    if (!area) return;

    const handleScroll = () => {
      const areaRect = area.getBoundingClientRect();
      let current: AbilitySectionId = ABILITY_SECTIONS[0].id;
      for (const { id: sId } of ABILITY_SECTIONS) {
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
  }, [selected?.key]);

  const scrollToSection = (sectionId: AbilitySectionId) => {
    setActiveSection(sectionId);
    const area = paneRef.current?.closest('.abilities-detail-area') as HTMLElement | null;
    const el = document.getElementById(sectionId);
    if (!area || !el) return;
    const offset = el.getBoundingClientRect().top - area.getBoundingClientRect().top - TOPBAR_HEIGHT;
    area.scrollBy({ top: offset, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    const area = paneRef.current?.closest('.abilities-detail-area') as HTMLElement | null;
    area?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!selected) return <div className="abilities-detail-pane">Ability not found.</div>;

  return (
    <>
      <AbilityDetailTopBar
        abilityName={selected.name || selected.key}
        activeSection={activeSection}
        onScrollTo={scrollToSection}
        onScrollToTop={scrollToTop}
      />
      <div className="abilities-detail-pane" ref={paneRef}>
        <div id="ability-overview">
          <AbilityHeaderCard ability={selected} />
        </div>
        <div id="ability-pokemon">
          <AbilityPokemonList
            abilityKey={selected.key}
            pokemonArray={pokemonArray}
            showUnreleased={showUnreleased}
          />
        </div>
        <div id="ability-trainers">
          <AbilityTrainersSection abilityKey={selected.key} />
        </div>
      </div>
    </>
  );
}
