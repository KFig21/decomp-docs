/* eslint-disable @typescript-eslint/no-explicit-any */
// decomp-docs/src/contexts/dataContext.tsx
import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { LocationRoot } from '../services/parsers/v2/locations/types';
import type { ParsedPokemon } from '../services/parsers/v2/pokemon/types';
import type { ParsedItem } from '../services/parsers/v2/items/types';
import type { ParsedTrainerVariant } from '../services/parsers/v2/trainers/types';
import type { ParsedAttack } from '../services/parsers/v2/moves/types';
import type { ParsedAbility } from '../services/parsers/v2/abilities';

interface DataContextProps {
  locations: Record<string, LocationRoot>;
  setLocations: (l: Record<string, LocationRoot>) => void;
  pokemon: Record<string, ParsedPokemon>;
  setPokemon: (p: Record<string, ParsedPokemon>) => void;
  items: Record<string, ParsedItem>;
  setItems: (i: Record<string, ParsedItem>) => void;
  trainers: Record<string, { variants: ParsedTrainerVariant[] }>;
  setTrainers: (t: Record<string, { variants: ParsedTrainerVariant[] }>) => void;
  moves: Record<string, ParsedAttack>;
  setMoves: (m: Record<string, ParsedAttack>) => void;
  abilities: Record<string, ParsedAbility>;
  setAbilities: (a: Record<string, ParsedAbility>) => void;
  // natures is a plain object — no strong type needed, keep it flexible
  natures: Record<string, any>;
  setNatures: (n: Record<string, any>) => void;
}

const DataContext = createContext<DataContextProps>({
  locations: {},
  setLocations: () => {},
  pokemon: {},
  setPokemon: () => {},
  items: {},
  setItems: () => {},
  trainers: {},
  setTrainers: () => {},
  moves: {},
  setMoves: () => {},
  abilities: {},
  setAbilities: () => {},
  natures: {},
  setNatures: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locations, setLocations] = useState<Record<string, LocationRoot>>({});
  const [pokemon, setPokemon] = useState<Record<string, ParsedPokemon>>({});
  const [items, setItems] = useState<Record<string, ParsedItem>>({});
  const [trainers, setTrainers] = useState<Record<string, any>>({});
  const [moves, setMoves] = useState<Record<string, ParsedAttack>>({});
  const [abilities, setAbilities] = useState<Record<string, ParsedAbility>>({});
  const [natures, setNatures] = useState<Record<string, any>>({});

  return (
    <DataContext.Provider
      value={{
        locations,
        setLocations,
        pokemon,
        setPokemon,
        items,
        setItems,
        trainers,
        setTrainers,
        moves,
        setMoves,
        abilities,
        setAbilities,
        natures,
        setNatures,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
