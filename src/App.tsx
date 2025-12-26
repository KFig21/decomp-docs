import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { CreateRouter } from './router';
import type { LocationRoot } from './services/parsers/v2/locations/types';
import type { ParsedPokemon } from './services/parsers/v2/pokemon/types';
import type { ParsedItem } from './services/parsers/v2/items/types';
import type { ParsedTrainer } from './services/parsers/v2/trainers/types';
import './styles/index.scss';

export default function App() {
  const [projectName, setProjectName] = useState('');

  const [locations, setLocations] = useState<LocationRoot[]>([]);
  const [pokemon, setPokemon] = useState<ParsedPokemon[]>([]);
  const [items, setItems] = useState<ParsedItem[]>([]);
  const [trainers, setTrainers] = useState<ParsedTrainer[]>([]);

  const router = CreateRouter({
    projectName,
    setProjectName,
    locations,
    setLocations,
    pokemon,
    setPokemon,
    items,
    setItems,
    trainers,
    setTrainers,
  });

  return <RouterProvider router={router} />;
}
