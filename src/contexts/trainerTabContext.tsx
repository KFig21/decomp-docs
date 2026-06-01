import React, { createContext, useContext, useState } from 'react';

interface TrainerTabContextProps {
  globalTab: string | null;
  setGlobalTab: (tab: string) => void;
}

const TrainerTabContext = createContext<TrainerTabContextProps>({
  globalTab: null,
  setGlobalTab: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useTrainerTab = () => useContext(TrainerTabContext);

export const TrainerTabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from localStorage so the choice persists across page reloads
  const [globalTab, setGlobalTabState] = useState<string | null>(() => {
    return localStorage.getItem('universalTrainerTab');
  });

  const setGlobalTab = (tab: string) => {
    setGlobalTabState(tab);
    localStorage.setItem('universalTrainerTab', tab);
  };

  return (
    <TrainerTabContext.Provider value={{ globalTab, setGlobalTab }}>
      {children}
    </TrainerTabContext.Provider>
  );
};
