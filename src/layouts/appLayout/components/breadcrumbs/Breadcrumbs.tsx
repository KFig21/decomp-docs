/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { formatReadableName } from '../../../../utils/functions';
import { useData } from '../../../../contexts/dataContext';
import PokemonSprite from '../../../../components/elements/sprites/pokemon/PokemonSprite';
import ItemSprite from '../../../../components/elements/sprites/ItemSprite';
import SvgIcon from '../../../../components/elements/svgIcon/SvgIcon';
import { locationsIcon } from '../../../../components/elements/svgIcon/icons/locationsIcon';
import { pokemonIcon } from '../../../../components/elements/svgIcon/icons/pokemonIcon';
import { itemsIcon } from '../../../../components/elements/svgIcon/icons/itemsIcon';
import './styles.scss';

type Props = {
  currentPage: string;
};

type HistoryItem = {
  path: string;
  label: string;
  category: 'locations' | 'pokemon' | 'items' | 'unknown';
  isRoot: boolean;
  id?: string;
};

export default function Breadcrumbs({ currentPage }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { pokemon, items } = useData();
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
        if (rootSegment === 'pokemon' || rootSegment === 'items' || rootSegment === 'locations') {
          category = rootSegment;
        }

        if (segments.length === 1) {
          label = formatReadableName(segments[0]);
        } else if (segments.length > 1) {
          isRoot = false;
          id = segments[1];
          if (category === 'pokemon') label = formatReadableName(id.replace('SPECIES_', ''));
          else if (category === 'items') label = formatReadableName(id.replace('ITEM_', ''));
          else label = formatReadableName(id);
        }
      }

      const newItem: HistoryItem = { path: location.pathname, label, category, isRoot, id };
      const newHistory = [...filtered, newItem];

      if (newHistory.length > 100) newHistory.shift();
      return newHistory;
    });
  }, [location.pathname]);

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
