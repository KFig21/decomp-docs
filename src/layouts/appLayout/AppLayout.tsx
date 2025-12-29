import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './styles.scss';
import ThemeDrawer from './components/themeDrawer/ThemeDrawer';
import { useState } from 'react';
import SvgIcon from '../../components/elements/svgIcon/SvgIcon';
import { uploadIcon } from '../../components/elements/svgIcon/icons/uploadIcon';
import { locationsIcon } from '../../components/elements/svgIcon/icons/locationsIcon';
import { pokemonIcon } from '../../components/elements/svgIcon/icons/pokemonIcon';
import { itemsIcon } from '../../components/elements/svgIcon/icons/itemsIcon';

type Props = {
  projectName: string;
  currentPage: string;
};

export default function AppLayout({ projectName, currentPage }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [themeOpen, setThemeOpen] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="app-layout">
      {/* 🔝 Persistent Topbar */}
      <header className="topbar">
        {/* Left */}
        <div className="title-wrapper">
          <div
            className="title-container"
            onClick={() => navigate('/')}
            title="upload a new folder"
          >
            <span className="title">{projectName || 'Decomp Docs'}</span>
            <SvgIcon viewBox={uploadIcon.viewBox}>{uploadIcon.path}</SvgIcon>
          </div>
        </div>

        {/* Center Nav */}
        <nav className="nav">
          {currentPage !== 'upload' && (
            <>
              <div
                className={`nav-item ${isActive('/locations') ? 'active' : ''}`}
                onClick={() => navigate('/locations')}
              >
                <SvgIcon viewBox={locationsIcon.viewBox}>{locationsIcon.path}</SvgIcon>
                Locations
              </div>

              <div
                className={`nav-item ${isActive('/pokemon') ? 'active' : ''}`}
                onClick={() => navigate('/pokemon')}
              >
                <SvgIcon viewBox={pokemonIcon.viewBox} width={pokemonIcon.width}>
                  {pokemonIcon.path}
                </SvgIcon>
                Pokémon
              </div>

              <div
                className={`nav-item ${isActive('/items') ? 'active' : ''}`}
                onClick={() => navigate('/items')}
              >
                <SvgIcon viewBox={itemsIcon.viewBox}>{itemsIcon.path}</SvgIcon>
                Items
              </div>
            </>
          )}
        </nav>

        {/* Right */}
        <div className="themes-container">
          <button className="theme-button" onClick={() => setThemeOpen((o) => !o)}>
            Themes
          </button>
        </div>
      </header>

      {/* Page Content */}
      <main className="page-wrapper">
        <Outlet />
      </main>

      {/* Theme drawer */}
      <ThemeDrawer open={themeOpen} onClose={() => setThemeOpen(false)} />
    </div>
  );
}
