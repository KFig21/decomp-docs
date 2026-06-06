import { useNavigate, useLocation } from 'react-router-dom';
import SvgIcon from '../../../../components/elements/svgIcon/SvgIcon';
import { locationsIcon } from '../../../../components/elements/svgIcon/icons/locationsIcon';
import { pokemonIcon } from '../../../../components/elements/svgIcon/icons/pokemonIcon';
import { itemsIcon } from '../../../../components/elements/svgIcon/icons/itemsIcon';
import './styles.scss';

// ── Inline SVG paths for moves (sword), trainers (person), and the upload/home icon ──
const trainersIconPath = (
  <>
    <circle cx="12" cy="7" r="4" />
    <path d="M12 13c-5 0-8 2.5-8 4v1h16v-1c0-1.5-3-4-8-4z" />
  </>
);

const movesIconPath = (
  <>
    {/* Simple crossed-swords icon composed of two path elements */}
    <path d="M14.5 2.5l-12 12 1.5 1.5 12-12z" />
    <path d="M2 2l3 3-1 3 3-1 3 3 1.5-1.5-3-3 1-3-3 1z" />
    <path d="M22 22l-3-3 1-3-3 1-3-3-1.5 1.5 3 3-1 3 3-1z" />
  </>
);

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export default function NavBar() {
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
  ];

  return (
    <nav className="app-nav">
      {NAV_ITEMS.map(({ path, label, icon }) => (
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
