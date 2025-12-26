import { useTheme } from '../../../../contexts/themeContext';
import './styles.scss';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ThemeDrawer({ open, onClose }: Props) {
  const { theme, setTheme, themes } = useTheme();

  return (
    <aside className={`theme-drawer ${open ? 'open' : ''}`}>
      <div className="theme-drawer-header">
        <span>Themes</span>
        <button onClick={onClose} className="close-button">
          ✕
        </button>
      </div>

      <div className="theme-list">
        {themes.map((t) => (
          <button
            key={t}
            className={`theme-item ${theme === t ? 'active' : ''}`}
            onClick={() => setTheme(t)}
          >
            {t}
          </button>
        ))}
      </div>
    </aside>
  );
}
