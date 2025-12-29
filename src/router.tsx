import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './layouts/appLayout/AppLayout';

import UploadPage from './pages/uploadPage/UploadPage';
import LocationsPage from './pages/locationsPage/LocationsPage';
import LocationDetailPage from './pages/locationsPage/LocationDetailPage';
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

export function CreateRouter({ projectName, setProjectName, locations, setLocations }: RouterArgs) {
  const [currentPage, SetCurrentPage] = useState('upload');

  return createBrowserRouter([
    // 🌍 Layout Route (Topbar persists here)
    {
      element: <AppLayout projectName={projectName} currentPage={currentPage} />,
      children: [
        {
          path: '/',
          element: (
            <UploadPage
              projectName={projectName}
              setProjectName={setProjectName}
              setLocations={setLocations}
              setPokemon={() => {}}
              setItems={() => {}}
              setTrainers={() => {}}
            />
          ),
        },
        {
          path: '/locations',
          element: <LocationsPage locations={locations} setCurrentPage={SetCurrentPage} />,
        },
        {
          path: '/locations/:id',
          element: <LocationDetailPage locations={locations} />,
        },

        // Future routes:
        // { path: '/pokemon', element: <PokemonPage pokemon={pokemon} /> },
        // { path: '/items', element: <ItemsPage items={items} /> },
      ],
    },
  ]);
}
