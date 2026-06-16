import { useNavigate, useLocation } from 'react-router-dom';
import SvgIcon from '../../../../components/elements/svgIcon/SvgIcon';
import { locationsIcon } from '../../../../components/elements/svgIcon/icons/locationsIcon';
import { pokemonIcon } from '../../../../components/elements/svgIcon/icons/pokemonIcon';
import { itemsIcon } from '../../../../components/elements/svgIcon/icons/itemsIcon';
import { abilitiesIcon } from '../../../../components/elements/svgIcon/icons/abilitiesIcon';
import './styles.scss';

// ── Inline SVG paths for moves (sword), trainers (person), and the upload/home icon ──
const trainersIconPath = (
  <>
    <circle cx="12" cy="7" r="4" />
    <path d="M12 13c-5 0-8 2.5-8 4v1h16v-1c0-1.5-3-4-8-4z" />
  </>
);

const typesIconPath = (
  // Simple diamond / gem shape representing type icons
  <path d="M12 2L4 9l8 13 8-13L12 2zm0 3.5L17.5 9 12 19.5 6.5 9 12 5.5z" />
);

const helpIconPath = (
  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" />
);

const movesIconPath = (
  <polygon points="12,2 13.53,8.3 19.07,4.93 15.7,10.47 22,12 15.7,13.53 19.07,19.07 13.53,15.7 12,22 10.47,15.7 4.93,19.07 8.3,13.53 2,12 8.3,10.47 4.93,4.93 10.47,8.3" />
);

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

// Paths that are always visible, even before data is loaded
const UTILITY_PATHS = new Set(['/help']);

export default function NavBar({ hideDataPages = false }: { hideDataPages?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const NAV_ITEMS: NavItem[] = [
    {
      path: '/locations',
      label: 'Locations',
      icon: <SvgIcon viewBox={locationsIcon.viewBox}>{locationsIcon.path}</SvgIcon>,
    },
    {
      path: '/pokemon',
      label: 'Pokémon',
      icon: (
        <SvgIcon viewBox={pokemonIcon.viewBox} width={pokemonIcon.width}>
          {pokemonIcon.path}
        </SvgIcon>
      ),
    },
    {
      path: '/items',
      label: 'Items',
      icon: <SvgIcon viewBox={itemsIcon.viewBox}>{itemsIcon.path}</SvgIcon>,
    },
    {
      path: '/moves',
      label: 'Moves',
      icon: (
        <SvgIcon viewBox="0 0 24 24" width={18}>
          {movesIconPath}
        </SvgIcon>
      ),
    },
    {
      path: '/trainers',
      label: 'Trainers',
      icon: (
        <SvgIcon viewBox="0 0 24 24" width={18}>
          {trainersIconPath}
        </SvgIcon>
      ),
    },
    {
      path: '/abilities',
      label: 'Abilities',
      icon: <SvgIcon viewBox={abilitiesIcon.viewBox}>{abilitiesIcon.path}</SvgIcon>,
    },
    {
      path: '/types',
      label: 'Types',
      icon: (
        <SvgIcon viewBox="0 0 24 24" width={18}>
          {typesIconPath}
        </SvgIcon>
      ),
    },
    {
      path: '/help',
      label: 'Help',
      icon: (
        <SvgIcon viewBox="0 0 24 24" width={18}>
          {helpIconPath}
        </SvgIcon>
      ),
    },
  ];

  const visibleItems = hideDataPages
    ? NAV_ITEMS.filter(({ path }) => UTILITY_PATHS.has(path))
    : NAV_ITEMS;

  return (
    <nav className="app-nav">
      {visibleItems.map(({ path, label, icon }) => (
        <button
          key={path}
          className={`app-nav__item ${isActive(path) ? 'app-nav__item--active' : ''}`}
          onClick={() => navigate(path)}
        >
          <span className="app-nav__icon">{icon}</span>
          <span className="app-nav__label">{label}</span>
        </button>
      ))}
    </nav>
  );
}
