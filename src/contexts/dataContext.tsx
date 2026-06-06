/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { AppDB } from '../utils/storage';
import type { LocationRoot } from '../services/parsers/v2/locations/types';
import type { ParsedPokemon } from '../services/parsers/v2/pokemon/types';
import type { ParsedItem } from '../services/parsers/v2/items/types';
import type { ParsedTrainerVariant } from '../services/parsers/v2/trainers/types';
import type { ParsedAttack } from '../services/parsers/v2/moves/types';
import type { ParsedAbility } from '../services/parsers/v2/abilities';

interface DataContextProps {
  isRestoring: boolean;
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
  natures: Record<string, any>;
  setNatures: (n: Record<string, any>) => void;
}

const DataContext = createContext<DataContextProps>({
  isRestoring: true,
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
  const [isRestoring, setIsRestoring] = useState(true);
  const [locations, setLocations] = useState<Record<string, LocationRoot>>({});
  const [pokemon, setPokemon] = useState<Record<string, ParsedPokemon>>({});
  const [items, setItems] = useState<Record<string, ParsedItem>>({});
  const [trainers, setTrainers] = useState<Record<string, any>>({});
  const [moves, setMoves] = useState<Record<string, ParsedAttack>>({});
  const [abilities, setAbilities] = useState<Record<string, ParsedAbility>>({});
  const [natures, setNatures] = useState<Record<string, any>>({});

  // 1. Load data from IndexedDB on mount
  useEffect(() => {
    async function loadSavedData() {
      try {
        const savedLocations = await AppDB.get('locations');
        const savedPokemon = await AppDB.get('pokemon');
        const savedItems = await AppDB.get('items');
        const savedTrainers = await AppDB.get('trainers');
        const savedMoves = await AppDB.get('moves');
        const savedAbilities = await AppDB.get('abilities');
        const savedNatures = await AppDB.get('natures');

        if (savedLocations) setLocations(savedLocations);
        if (savedPokemon) setPokemon(savedPokemon);
        if (savedItems) setItems(savedItems);
        if (savedTrainers) setTrainers(savedTrainers);
        if (savedMoves) setMoves(savedMoves);
        if (savedAbilities) setAbilities(savedAbilities);
        if (savedNatures) setNatures(savedNatures);

        // DEV DEBUG: Artificial delay to test the loading screen
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error('Failed to restore parsed data:', error);
      } finally {
        setIsRestoring(false);
      }
    }
    loadSavedData();
  }, []);

  // 2. Save data to IndexedDB whenever it changes (skipping the initial restore phase)
  useEffect(() => {
    if (isRestoring) return;

    async function saveCurrentData() {
      try {
        if (Object.keys(locations).length) await AppDB.set('locations', locations);
        if (Object.keys(pokemon).length) await AppDB.set('pokemon', pokemon);
        if (Object.keys(items).length) await AppDB.set('items', items);
        if (Object.keys(trainers).length) await AppDB.set('trainers', trainers);
        if (Object.keys(moves).length) await AppDB.set('moves', moves);
        if (Object.keys(abilities).length) await AppDB.set('abilities', abilities);
        if (Object.keys(natures).length) await AppDB.set('natures', natures);
      } catch (error) {
        console.error('Failed to save parsed data:', error);
      }
    }
    saveCurrentData();
  }, [locations, pokemon, items, trainers, moves, abilities, natures, isRestoring]);

  return (
    <DataContext.Provider
      value={{
        isRestoring,
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
