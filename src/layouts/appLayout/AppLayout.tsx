import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import NavBar from './components/navBar/NavBar';
import Breadcrumbs from './components/breadcrumbs/Breadcrumbs';
import SvgIcon from '../../components/elements/svgIcon/SvgIcon';
import { uploadIcon } from '../../components/elements/svgIcon/icons/uploadIcon';
import { useTheme } from '../../contexts/themeContext';
import './styles.scss';

type Props = {
  projectName: string;
};

// Palette icon for the Themes button
const paletteIconPath = (
  <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.55 0 1-.45 1-1 0-.26-.1-.5-.26-.68a.99.99 0 0 1-.24-.66c0-.55.45-1 1-1h1.18c1.59 0 2.32-.83 2.32-2C17 13.62 14.86 12 12 12c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6v1c0 .55.45 1 1 1s1-.45 1-1v-1C20 6.48 15.52 2 12 2zM7 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2-4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
  </svg>
);

// Pin icon for the lock toggle
const pinIconPath = (locked: boolean) => (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor">
    {locked ? (
      <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
    ) : (
      <>
        <path
          d="M14 4v5.55L16.55 12H18v1h-4.8v6H9v-6H4v-1h1.45L8 9.55V4H7V2h10v2h-3z"
          opacity="0.4"
        />
        <path d="M14 4v5.55L16.55 12H18v1h-4.8v6H9v-6H4v-1h1.45L8 9.55V4H7V2h10v2h-3zm-2 9.8V18h1.6v-4.2H18v-.38L15.29 11H8.71L6 13.42V14h2.4v4H10v-4.2H12z" />
      </>
    )}
  </svg>
);

export default function AppLayout({ projectName }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme, themes } = useTheme();
  const [themeOpen, setThemeOpen] = useState(false);
  const [sidebarLocked, setSidebarLocked] = useState(false);

  const isUploadPage = location.pathname === '/';

  return (
    <div className={`app-layout${sidebarLocked ? ' sidebar-locked' : ''}`}>
      {/* ── Sidebar ── */}
      <aside
        className={`sidebar${sidebarLocked ? ' sidebar--locked' : ''}`}
        onMouseLeave={() => setThemeOpen(false)}
      >
        <div className="sidebar-top">
          {/* Brand / home button */}
          <div className="sidebar-brand" onClick={() => navigate('/')} title="Upload a new folder">
            <span className="sidebar-brand__icon-area">
              <SvgIcon viewBox={uploadIcon.viewBox}>{uploadIcon.path}</SvgIcon>
            </span>
            <span className="sidebar-brand__label">{projectName || 'Decomp Docs'}</span>
          </div>

          {/* Page navigation (hidden on upload page) */}
          {!isUploadPage && <NavBar />}
        </div>

        <div className="sidebar-bottom">
          {/* ── Themes accordion panel ── */}
          <div className={`themes-panel${themeOpen ? ' themes-panel--open' : ''}`}>
            <div className="themes-panel__list">
              {themes.map((t) => (
                <button
                  key={t}
                  className={`themes-panel__item${theme === t ? ' themes-panel__item--active' : ''}`}
                  onClick={() => setTheme(t)}
                >
                  <span className="themes-panel__icon-area">
                    <span className={`themes-panel__dot themes-panel__dot--${t}`} />
                  </span>
                  <span className="themes-panel__label">{t}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Themes toggle button */}
          <button
            className={`sidebar-action-btn${themeOpen ? ' sidebar-action-btn--themes-open' : ''}`}
            onClick={() => setThemeOpen((o) => !o)}
            title="Themes"
          >
            <span className="sidebar-action-btn__icon">{paletteIconPath}</span>
            <span className="sidebar-action-btn__label">Themes</span>
          </button>

          {/* Pin / lock sidebar open */}
          <button
            className={`sidebar-action-btn sidebar-pin-btn${sidebarLocked ? ' sidebar-pin-btn--active' : ''}`}
            onClick={() => setSidebarLocked((l) => !l)}
            title={sidebarLocked ? 'Unpin sidebar' : 'Pin sidebar open'}
          >
            <span className="sidebar-action-btn__icon">{pinIconPath(sidebarLocked)}</span>
            <span className="sidebar-action-btn__label">{sidebarLocked ? 'Unpin' : 'Pin'}</span>
          </button>
        </div>
      </aside>

      {/* ── Page content ── */}
      <div className="page-content">
        <main className="page-wrapper">
          <Outlet />
        </main>

        {/* ── Footer breadcrumbs ── */}
        <Breadcrumbs currentPage={isUploadPage ? 'upload' : ''} />
      </div>
    </div>
  );
}
