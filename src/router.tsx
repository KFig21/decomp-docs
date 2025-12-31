import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './layouts/appLayout/AppLayout';

import UploadPage from './pages/uploadPage/UploadPage';
import LocationsPage from './pages/locationsPage/LocationsPage';
import LocationDetailPage from './pages/locationsPage/LocationDetailPage';
import PokemonDetailPage from './pages/pokemonPage/PokemonDetailPage';
import PokemonPage from './pages/pokemonPage/PokemonPage';

import type { LocationRoot } from './services/parsers/v2/locations/types';
import type { ParsedPokemon } from './services/parsers/v2/pokemon/types';
import type { ParsedItem } from './services/parsers/v2/items/types';
import type { ParsedTrainerVariant } from './services/parsers/v2/trainers/types';
import { useState } from 'react';

type RouterArgs = {
  projectName: string;
  setProjectName: (n: string) => void;

  locations: LocationRoot[];
  setLocations: (l: LocationRoot[]) => void;

  pokemon: ParsedPokemon[];
  setPokemon: (p: ParsedPokemon[]) => void;

  items: ParsedItem[];
  setItems: (i: ParsedItem[]) => void;

  trainers: ParsedTrainerVariant[];
  setTrainers: (t: ParsedTrainerVariant[]) => void;
};

export function CreateRouter({ projectName, setProjectName }: RouterArgs) {
  const [currentPage, SetCurrentPage] = useState('upload');

  return createBrowserRouter([
    {
      element: <AppLayout projectName={projectName} currentPage={currentPage} />,
      children: [
        {
          path: '/',
          element: <UploadPage projectName={projectName} setProjectName={setProjectName} />,
        },
        {
          path: '/locations',
          element: <LocationsPage setCurrentPage={SetCurrentPage} />,
        },
        {
          path: '/locations/:id',
          element: <LocationDetailPage />,
        },
        {
          path: '/pokemon',
          element: <PokemonPage />,
        },
        {
          path: '/pokemon/:id',
          element: <PokemonDetailPage />,
        },
      ],
    },
  ]);
}
