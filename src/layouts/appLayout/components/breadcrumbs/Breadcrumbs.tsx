/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatReadableName } from '../../../../utils/functions';
import { useData } from '../../../../contexts/dataContext';
import PokemonSprite from '../../../../components/elements/sprites/pokemon/PokemonSprite';
import ItemSprite from '../../../../components/elements/sprites/ItemSprite';
import TrainerSprite from '../../../../components/elements/sprites/TrainerSprite';
import TmSprite from '../../../../components/elements/sprites/TmSprite';
import TypeIconBadge from '../../../../components/elements/typeBadge/TypeIconBadge';
import SvgIcon from '../../../../components/elements/svgIcon/SvgIcon';
import { locationsIcon } from '../../../../components/elements/svgIcon/icons/locationsIcon';
import { pokemonIcon } from '../../../../components/elements/svgIcon/icons/pokemonIcon';
import { itemsIcon } from '../../../../components/elements/svgIcon/icons/itemsIcon';
import { trainersIcon } from '../../../../components/elements/svgIcon/icons/trainersIcon';
import { movesIcon } from '../../../../components/elements/svgIcon/icons/movesIcon';
import { abilitiesIcon } from '../../../../components/elements/svgIcon/icons/abilitiesIcon';
import './styles.scss';

type Props = {
  currentPage: string;
};

type HistoryItem = {
  path: string;
  label: string;
  category: 'locations' | 'pokemon' | 'items' | 'trainers' | 'moves' | 'abilities' | 'types' | 'help' | 'unknown';
  isRoot: boolean;
  id?: string;
};

export default function Breadcrumbs({ currentPage }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { pokemon, items, trainers, moves } = useData();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Fixed type error by using ReturnType<typeof setInterval>
  const scrollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '') return;

    setHistory((prev) => {
      if (prev.length > 0 && prev[prev.length - 1].path === location.pathname) {
        return prev;
      }

      const filtered = prev.filter((p) => p.path !== location.pathname);
      const segments = location.pathname.split('/').filter(Boolean);

      let label = 'Unknown';
      let category: HistoryItem['category'] = 'unknown';
      let isRoot = true;
      let id: string | undefined;

      if (segments.length > 0) {
        const rootSegment = segments[0];
        if (
          rootSegment === 'pokemon' ||
          rootSegment === 'items' ||
          rootSegment === 'locations' ||
          rootSegment === 'trainers' ||
          rootSegment === 'moves' ||
          rootSegment === 'abilities' ||
          rootSegment === 'types' ||
          rootSegment === 'help'
        ) {
          category = rootSegment;
        }

        if (segments.length === 1) {
          label = formatReadableName(segments[0]);
        } else if (segments.length > 1) {
          isRoot = false;
          id = segments[1];
          if (category === 'pokemon') label = formatReadableName(id.replace('SPECIES_', ''));
          else if (category === 'items') label = formatReadableName(id.replace('ITEM_', ''));
          else if (category === 'abilities') label = formatReadableName(id.replace('ABILITY_', ''));
          else if (category === 'moves') label = formatReadableName(id.replace('MOVE_', ''));
          else if (category === 'types') label = id.charAt(0).toUpperCase() + id.slice(1);
          else if (category === 'trainers') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const trainerGroup = (trainers as any)[id];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rep = trainerGroup?.variants?.find((v: any) => v.isPlaced) ?? trainerGroup?.variants?.[0];
            label = rep?.name ? rep.name : formatReadableName(id);
          } else label = formatReadableName(id);
        }
      }

      const newItem: HistoryItem = { path: location.pathname, label, category, isRoot, id };
      const newHistory = [...filtered, newItem];

      if (newHistory.length > 100) newHistory.shift();
      return newHistory;
    });
  }, [location.pathname, trainers]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [history]);

  const startScrolling = (direction: 'left' | 'right') => {
    if (scrollIntervalRef.current) return;

    const scrollAmount = 30;
    scrollIntervalRef.current = setInterval(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
        });
      }
    }, 50);
  };

  const stopScrolling = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const renderIcon = (h: HistoryItem) => {
    if (h.isRoot || (h.category === 'locations' && !h.isRoot)) {
      if (h.category === 'locations')
        return <SvgIcon viewBox={locationsIcon.viewBox}>{locationsIcon.path}</SvgIcon>;
      if (h.category === 'pokemon')
        return <SvgIcon viewBox={pokemonIcon.viewBox}>{pokemonIcon.path}</SvgIcon>;
      if (h.category === 'items')
        return <SvgIcon viewBox={itemsIcon.viewBox}>{itemsIcon.path}</SvgIcon>;
      if (h.category === 'trainers')
        return <SvgIcon viewBox={trainersIcon.viewBox}>{trainersIcon.path}</SvgIcon>;
      if (h.category === 'moves')
        return <SvgIcon viewBox={movesIcon.viewBox}>{movesIcon.path}</SvgIcon>;
      if (h.category === 'abilities')
        return <SvgIcon viewBox={abilitiesIcon.viewBox}>{abilitiesIcon.path}</SvgIcon>;
      if (h.category === 'types')
        return <SvgIcon viewBox="0 0 24 24"><path d="M12 2L4 9l8 13 8-13L12 2zm0 3.5L17.5 9 12 19.5 6.5 9 12 5.5z" /></SvgIcon>;
      if (h.category === 'help')
        return <SvgIcon viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" /></SvgIcon>;
    } else {
      if (h.category === 'pokemon' && h.id && pokemon) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mon = (pokemon as any)[h.id];
        if (mon) return <PokemonSprite name={mon.name} size={24} />;
      }
      if (h.category === 'items' && h.id && items) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const item = (items as any)[h.id];
        if (item) return <ItemSprite item={item} size={24} />;
      }
      if (h.category === 'trainers' && h.id && trainers) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const trainerGroup = (trainers as any)[h.id];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rep = trainerGroup?.variants?.find((v: any) => v.isPlaced) ?? trainerGroup?.variants?.[0];
        if (rep)
          return (
            <TrainerSprite
              name={rep.name}
              trainerClass={rep.trainerClass}
              sprite={rep.trainerPic}
              size={24}
            />
          );
      }
      if (h.category === 'moves' && h.id && moves) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const move = (moves as any)[h.id];
        if (move?.type) return <TmSprite type={move.type} size={24} />;
      }
      if (h.category === 'moves')
        return <SvgIcon viewBox={movesIcon.viewBox}>{movesIcon.path}</SvgIcon>;
      if (h.category === 'abilities')
        return <SvgIcon viewBox={abilitiesIcon.viewBox}>{abilitiesIcon.path}</SvgIcon>;
      if (h.category === 'types' && h.id)
        return <TypeIconBadge type={h.id} size={20} />;
    }
    return null;
  };

  if (currentPage === 'upload' || history.length === 0) return null;

  return (
    <footer className="footer-bar">
      <button
        className="scroll-button left"
        onMouseDown={() => startScrolling('left')}
        onMouseUp={stopScrolling}
        onMouseLeave={stopScrolling}
        title="Scroll Left"
      >
        ◀
      </button>

      <div className="breadcrumbs-scroll-container" ref={scrollContainerRef}>
        {history.map((h, i) => (
          <span key={h.path} className="breadcrumb-item-wrapper">
            <div className="breadcrumb-item" onClick={() => navigate(h.path)} title={h.label}>
              <div className="breadcrumb-icon">{renderIcon(h)}</div>
              <span className="breadcrumb-link">{h.label}</span>
            </div>
            {i < history.length - 1 && <span className="separator">/</span>}
          </span>
        ))}
      </div>

      <button
        className="scroll-button right"
        onMouseDown={() => startScrolling('right')}
        onMouseUp={stopScrolling}
        onMouseLeave={stopScrolling}
        title="Scroll Right"
      >
        ▶
      </button>
    </footer>
  );
}
