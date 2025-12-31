import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type { LocationRoot } from '../services/parsers/v2/locations/types';
import type { ParsedPokemon } from '../services/parsers/v2/pokemon/types';
import type { ParsedItem } from '../services/parsers/v2/items/types';
import type { ParsedTrainerVariant } from '../services/parsers/v2/trainers/types';

interface DataContextProps {
  locations: LocationRoot[];
  setLocations: (l: LocationRoot[]) => void;
  pokemon: ParsedPokemon[];
  setPokemon: (p: ParsedPokemon[]) => void;
  items: ParsedItem[];
  setItems: (i: ParsedItem[]) => void;
  trainers: ParsedTrainerVariant[];
  setTrainers: (t: ParsedTrainerVariant[]) => void;
}

const DataContext = createContext<DataContextProps>({
  locations: [],
  setLocations: () => {},
  pokemon: [],
  setPokemon: () => {},
  items: [],
  setItems: () => {},
  trainers: [],
  setTrainers: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useData = () => useContext(DataContext);

interface Props {
  children: ReactNode;
}

export const DataProvider: React.FC<Props> = ({ children }) => {
  const [locations, setLocations] = useState<LocationRoot[]>([]);
  const [pokemon, setPokemon] = useState<ParsedPokemon[]>([]);
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [trainers, setTrainers] = useState<ParsedTrainerVariant[]>([]);

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
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
