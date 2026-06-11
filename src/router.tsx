import { useState } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './layouts/appLayout/AppLayout';
import UploadPage from './pages/uploadPage/UploadPage';
import LocationsPage from './pages/locationsPage/LocationsPage';
import PokemonPage from './pages/pokemonPage/PokemonPage';
import ItemsPage from './pages/itemsPage/ItemsPage';
import MovesPage from './pages/movesPage/MovesPage';
import TrainersPage from './pages/trainersPage/TrainersPage';
import AbilitiesPage from './pages/abilitiesPage/AbilitiesPage';
import TypesPage from './pages/typesPage/TypesPage';
import HelpPage from './pages/helpPage/HelpPage';
import ErrorPage from './pages/errorPage/ErrorPage';
import { useData } from './contexts/dataContext';
import LoadingScreen from './components/elements/loadingScreen/LoadingScreen';

export function CreateRouter() {
  const { isRestoring } = useData();

  // Initialize from localStorage
  const [projectName, setProjectNameState] = useState(() => {
    return localStorage.getItem('decomp-docs-project') || '';
  });

  const setProjectName = (name: string) => {
    setProjectNameState(name);
    localStorage.setItem('decomp-docs-project', name);
  };

  // Prevent routing until the database has finished loading our saved data
  if (isRestoring) {
    return createBrowserRouter([
      {
        path: '*',
        element: <LoadingScreen />,
      },
    ]);
  }

  return createBrowserRouter([
    {
      element: <AppLayout projectName={projectName} />,
      errorElement: <ErrorPage />,
      children: [
        {
          path: '/',
          element: <UploadPage projectName={projectName} setProjectName={setProjectName} />,
        },
        { path: '/locations', element: <LocationsPage /> },
        { path: '/locations/:id', element: <LocationsPage /> },
        { path: '/pokemon', element: <PokemonPage /> },
        { path: '/pokemon/:id', element: <PokemonPage /> },
        { path: '/items', element: <ItemsPage /> },
        { path: '/items/:id', element: <ItemsPage /> },
        { path: '/moves', element: <MovesPage /> },
        { path: '/moves/:id', element: <MovesPage /> },
        { path: '/trainers', element: <TrainersPage /> },
        { path: '/trainers/:id', element: <TrainersPage /> },
        { path: '/abilities', element: <AbilitiesPage /> },
        { path: '/abilities/:id', element: <AbilitiesPage /> },
        { path: '/types', element: <TypesPage /> },
        { path: '/types/:id', element: <TypesPage /> },
        { path: '/help', element: <HelpPage /> },
      ],
    },
  ]);
}
