import { useNavigate, useLocation } from 'react-router-dom';
import SvgIcon from '../../../../components/elements/svgIcon/SvgIcon';
import { locationsIcon } from '../../../../components/elements/svgIcon/icons/locationsIcon';
import { pokemonIcon } from '../../../../components/elements/svgIcon/icons/pokemonIcon';
import { itemsIcon } from '../../../../components/elements/svgIcon/icons/itemsIcon';
import './styles.scss';

// ── Inline SVG paths for moves (sword) and the upload/home icon ───────────────
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
