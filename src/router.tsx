// decomp-docs/src/router.tsx
import { useState } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './layouts/appLayout/AppLayout';
import UploadPage from './pages/uploadPage/UploadPage';
import LocationsPage from './pages/locationsPage/LocationsPage';
import LocationDetailPage from './pages/locationsPage/LocationDetailPage';
import PokemonPage from './pages/pokemonPage/PokemonPage';
import ItemsPage from './pages/itemsPage/ItemsPage';
import MovesPage from './pages/movesPage/MovesPage';

// UploadPage sets the project name + calls setXxx on the DataContext.
// We still thread projectName / setProjectName through the router so the
// topbar can display the rom hack name.

export function CreateRouter() {
  const [projectName, setProjectName] = useState('');
  const [currentPage, setCurrentPage] = useState('upload');

  return createBrowserRouter([
    {
      element: <AppLayout projectName={projectName} currentPage={currentPage} />,
      children: [
        {
          path: '/',
          element: (
            <UploadPage
              projectName={projectName}
              setProjectName={setProjectName}
              setCurrentPage={setCurrentPage} // error: Type '{ projectName: string; setProjectName: Dispatch<SetStateAction<string>>; setCurrentPage: Dispatch<SetStateAction<string>>; }' is not assignable to type 'IntrinsicAttributes & Props'.  Property 'setCurrentPage' does not exist on type 'IntrinsicAttributes & Props'.
            />
          ),
        },
        { path: '/locations', element: <LocationsPage setCurrentPage={setCurrentPage} /> },
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
