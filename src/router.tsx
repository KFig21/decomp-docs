import { createBrowserRouter } from 'react-router-dom';

import UploadPage from './pages/uploadPage/UploadPage';
import LocationsPage from './pages/locationsPage/LocationsPage';
import LocationDetailPage from './pages/locationsPage/LocationDetailPage';

// import PokemonPage from './pages/pokemonPage/PokemonPage';
// import PokemonDetailPage from './pages/pokemonPage/PokemonDetailPage';
// import ItemsPage from './pages/itemsPage/ItemsPage';
// import ItemDetailPage from './pages/itemsPage/ItemDetailPage';
// import TrainersPage from './pages/trainersPage/TrainersPage';
// import TrainerDetailPage from './pages/trainersPage/TrainerDetailPage';

import type { LocationRoot } from './services/parsers/v2/locations/types';
import type { ParsedPokemon } from './services/parsers/v2/pokemon/types';
import type { ParsedItem } from './services/parsers/v2/items/types';
import type { ParsedTrainer } from './services/parsers/v2/trainers/types';

type RouterArgs = {
  projectName: string;
  setProjectName: (n: string) => void;

  locations: LocationRoot[];
  setLocations: (l: LocationRoot[]) => void;

  pokemon: ParsedPokemon[];
  setPokemon: (p: ParsedPokemon[]) => void;

  items: ParsedItem[];
  setItems: (i: ParsedItem[]) => void;

  trainers: ParsedTrainer[];
  setTrainers: (t: ParsedTrainer[]) => void;
};

export function createRouter({
  projectName,
  setProjectName,
  locations,
  setLocations,
  // pokemon,
  // items,
  // trainers,
}: RouterArgs) {
  return createBrowserRouter([
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

    // 📍 LOCATIONS
    {
      path: '/locations',
      element: <LocationsPage locations={locations} projectName={projectName} />,
    },
    {
      path: '/locations/:id',
      element: <LocationDetailPage locations={locations} />,
    },

    // 🐉 POKÉMON
    // {
    //   path: '/pokemon',
    //   element: <PokemonPage pokemon={pokemon} />,
    // },
    // {
    //   path: '/pokemon/:id',
    //   element: <PokemonDetailPage pokemon={pokemon} />,
    // },

    // // 🎒 ITEMS
    // {
    //   path: '/items',
    //   element: <ItemsPage items={items} />,
    // },
    // {
    //   path: '/items/:id',
    //   element: <ItemDetailPage items={items} />,
    // },

    // // 👤 TRAINERS
    // {
    //   path: '/trainers',
    //   element: <TrainersPage trainers={trainers} />,
    // },
    // {
    //   path: '/trainers/:id',
    //   element: <TrainerDetailPage trainers={trainers} />,
    // },
  ]);
}
