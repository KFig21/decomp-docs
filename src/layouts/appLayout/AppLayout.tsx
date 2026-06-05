// decomp-docs/src/layouts/appLayout/AppLayout.tsx
import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import NavBar from './components/navBar/NavBar';
import ThemeDrawer from './components/themeDrawer/ThemeDrawer';
import Breadcrumbs from './components/breadcrumbs/Breadcrumbs';
import SvgIcon from '../../components/elements/svgIcon/SvgIcon';
import { uploadIcon } from '../../components/elements/svgIcon/icons/uploadIcon';
import './styles.scss';

type Props = {
  projectName: string;
  currentPage: string;
};

export default function AppLayout({ projectName, currentPage }: Props) {
  const navigate = useNavigate();
  const [themeOpen, setThemeOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* ── Topbar ── */}
      <header className="topbar">
        {/* Left: project name / home button */}
        <div className="title-wrapper">
          <div
            className="title-container"
            onClick={() => navigate('/')}
            title="Upload a new folder"
          >
            <span className="title">{projectName || 'Decomp Docs'}</span>
            <SvgIcon viewBox={uploadIcon.viewBox}>{uploadIcon.path}</SvgIcon>
          </div>
        </div>

        {/* Center: page navigation (hidden on upload page) */}
        {currentPage !== 'upload' && <NavBar />}

        {/* Right: theme picker */}
        <div className="themes-container">
          <button className="theme-button" onClick={() => setThemeOpen((o) => !o)}>
            Themes
          </button>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="page-wrapper">
        <Outlet />
      </main>

      {/* ── Footer breadcrumbs ── */}
      <Breadcrumbs currentPage={currentPage} />

      {/* ── Theme drawer ── */}
      <ThemeDrawer open={themeOpen} onClose={() => setThemeOpen(false)} />
    </div>
  );
}
