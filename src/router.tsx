import { useState } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './layouts/appLayout/AppLayout';
import UploadPage from './pages/uploadPage/UploadPage';
import LocationsPage from './pages/locationsPage/LocationsPage';
import LocationDetailPage from './pages/locationsPage/LocationDetailPage';
import PokemonPage from './pages/pokemonPage/PokemonPage';
import ItemsPage from './pages/itemsPage/ItemsPage';
import MovesPage from './pages/movesPage/MovesPage';
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

  // NOTE: We no longer need `setCurrentPage`. AppLayout can use `location.pathname === '/'`
  return createBrowserRouter([
    {
      element: <AppLayout projectName={projectName} />,
      children: [
        {
          path: '/',
          element: <UploadPage projectName={projectName} setProjectName={setProjectName} />,
        },
        { path: '/locations', element: <LocationsPage /> },
        { path: '/locations/:id', element: <LocationDetailPage /> },
        { path: '/pokemon', element: <PokemonPage /> },
        { path: '/pokemon/:id', element: <PokemonPage /> },
        { path: '/items', element: <ItemsPage /> },
        { path: '/items/:id', element: <ItemsPage /> },
        { path: '/moves', element: <MovesPage /> },
        { path: '/moves/:id', element: <MovesPage /> },
      ],
    },
  ]);
}
