import React from 'react';
import { useTheme } from '../../../contexts/themeContext';
import './themeToggle.scss';

interface props {
  type: string;
}

const ThemeToggleButton: React.FC<props> = ({ type }) => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className={`theme-toggle-button ${type}`}>
      {theme === 'light' && 'a'}
      {theme === 'dark' && 'b'}
      {theme === 'night' && 'c'}
    </button>
  );
};

export default ThemeToggleButton;
