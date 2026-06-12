/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useEffect, useRef } from 'react';
import { getOffensive, getDefensive } from '../typeChart';
import { useData } from '../../../../contexts/dataContext';
import TypeHeaderCard from '../typeHeaderCard/TypeHeaderCard';
import TypeMatchups from '../typeMatchups/TypeMatchups';
import TypePokemonList from '../typePokemonList/TypePokemonList';
import TypeMovesList from '../typeMovesList/TypeMovesList';
import TypeTopBar, { TOPBAR_HEIGHT, SECTIONS, type SectionId } from '../typeTopBar/TypeTopBar';
import './styles.scss';

type Props = {
  typeId: string;
  pokemonArray: any[];
  movesArray: any[];
  primaryOnly: boolean;
  showUnreleased: boolean;
};

export default function TypeDetailPage({ typeId, pokemonArray, movesArray, primaryOnly, showUnreleased }: Props) {
  const { typeChart } = useData();
  const typeLower = typeId.toLowerCase();
  const paneRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<SectionId>('type-overview');

  // Reset scroll and active section when type changes
  useEffect(() => {
    setActiveSection('type-overview');
    const area = paneRef.current?.closest('.types-detail-area') as HTMLElement | null;
    if (area) area.scrollTop = 0;
  }, [typeId]);

  // Track which section is in view via scroll
  useEffect(() => {
    const area = paneRef.current?.closest('.types-detail-area') as HTMLElement | null;
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
  }, [typeId]);

  const scrollToSection = (sectionId: SectionId) => {
    setActiveSection(sectionId);
    const area = paneRef.current?.closest('.types-detail-area') as HTMLElement | null;
    const el = document.getElementById(sectionId);
    if (!area || !el) return;
    const offset = el.getBoundingClientRect().top - area.getBoundingClientRect().top - TOPBAR_HEIGHT;
    area.scrollBy({ top: offset, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    const area = paneRef.current?.closest('.types-detail-area') as HTMLElement | null;
    area?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const offensive = useMemo(
    () => typeChart ? getOffensive(typeLower, typeChart) : { superEffective: [], notVeryEffective: [], noEffect: [] },
    [typeLower, typeChart],
  );
  const defensive = useMemo(
    () => typeChart ? getDefensive(typeLower, typeChart) : { weakTo: [], resistantTo: [], immuneTo: [] },
    [typeLower, typeChart],
  );

  // Keys of moves learnable by at least one Pokemon in this dataset
  const learnableMoveKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const mon of pokemonArray as any[]) {
      for (const e of mon.levelUpLearnset ?? []) {
        const k = typeof e.move === 'string' ? e.move : e.move?.key;
        if (k) keys.add(k);
      }
      for (const e of mon.tmhmLearnset ?? []) {
        const k = typeof e.move === 'string' ? e.move : e.move?.key;
        if (k) keys.add(k);
      }
    }
    return keys;
  }, [pokemonArray]);

  const typePokemon = useMemo(
    () =>
      pokemonArray
        .filter((mon: any) => {
          if (mon.baseSpeciesKey) return false;
          if (!showUnreleased && !mon.isSeen && !mon.isObtainable) return false;
          const types = (mon.types ?? []) as string[];
          if (primaryOnly) {
            return (types[0] ?? '').replace(/^TYPE_/i, '').toLowerCase() === typeLower;
          }
          return types
            .filter(Boolean)
            .some((t: string) => t.replace(/^TYPE_/i, '').toLowerCase() === typeLower);
        })
        .sort((a: any, b: any) => {
          const aNum = typeof a.natDexNum === 'number' ? a.natDexNum : 99999;
          const bNum = typeof b.natDexNum === 'number' ? b.natDexNum : 99999;
          return aNum - bNum;
        }),
    [pokemonArray, typeLower, primaryOnly, showUnreleased],
  );

  const typeMoves = useMemo(
    () =>
      movesArray
        .filter((move: any) => (move.type ?? '').replace(/^TYPE_/i, '').toLowerCase() === typeLower)
        .sort((a: any, b: any) => (a.name ?? '').localeCompare(b.name ?? '')),
    [movesArray, typeLower],
  );

  const unreleasedPokemonKeys = useMemo(
    () => showUnreleased
      ? new Set(typePokemon.filter((m: any) => !m.isSeen && !m.isObtainable).map((m: any) => m.key))
      : new Set<string>(),
    [typePokemon, showUnreleased],
  );

  const unreleasedMoveKeys = useMemo(
    () => showUnreleased
      ? new Set(typeMoves.filter((m: any) => !learnableMoveKeys.has(m.key)).map((m: any) => m.key))
      : new Set<string>(),
    [typeMoves, learnableMoveKeys, showUnreleased],
  );

  return (
    <>
      <TypeTopBar
        type={typeLower}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        scrollToTop={scrollToTop}
      />

      <div className="type-detail-page" ref={paneRef}>
        <div id="type-overview">
          <TypeHeaderCard type={typeLower} pokemonCount={typePokemon.length} moveCount={typeMoves.length} />
        </div>
        <div id="type-matchups">
          <TypeMatchups offensive={offensive} defensive={defensive} />
        </div>
        <div id="type-pokemon">
          <TypePokemonList pokemon={typePokemon} unreleasedKeys={unreleasedPokemonKeys} />
        </div>
        <div id="type-moves">
          <TypeMovesList moves={typeMoves} unreleasedKeys={unreleasedMoveKeys} />
        </div>
      </div>
    </>
  );
}
