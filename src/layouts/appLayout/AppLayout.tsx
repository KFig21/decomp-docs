import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import UploadIcon from '../../components/elements/uploadIcon/UploadIcon';
import './styles.scss';
import ThemeDrawer from './components/themeDrawer/ThemeDrawer';
import { useState } from 'react';

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
        <div className="title-container">
          <span className="title">{projectName || 'Decomp Docs'}</span>
        </div>

        {/* Center Nav */}
        <nav className="nav">
          {currentPage !== 'upload' && (
            <>
              <div
                className={`nav-item ${isActive('/locations') ? 'active' : ''}`}
                onClick={() => navigate('/locations')}
              >
                Locations
              </div>
              <div
                className={`nav-item ${isActive('/pokemon') ? 'active' : ''}`}
                onClick={() => navigate('/pokemon')}
              >
                Pokémon
              </div>
              <div
                className={`nav-item ${isActive('/items') ? 'active' : ''}`}
                onClick={() => navigate('/items')}
              >
                Items
              </div>
              <div className="nav-item back" onClick={() => navigate('/')}>
                <UploadIcon />
                Upload
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
