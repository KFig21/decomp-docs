import { createBrowserRouter } from 'react-router-dom';
import UploadPage from './pages/uploadPage/UploadPage';
import LocationsPage from './pages/locationsPage/LocationsPage';
import LocationDetailPage from './pages/LocationDetailPage';
import type { Location } from './types/decomp';

export function createRouter(
  locations: Location[],
  setLocations: (l: Location[]) => void,
  projectName: string,
  setProjectName: (n: string) => void,
) {
  return createBrowserRouter([
    {
      path: '/',
      element: (
        <UploadPage
          setLocations={setLocations}
          projectName={projectName}
          setProjectName={setProjectName}
        />
      ),
    },
    {
      path: '/locations',
      element: <LocationsPage locations={locations} projectName={projectName} />,
    },
    {
      path: '/locations/:id',
      element: <LocationDetailPage locations={locations} />,
    },
  ]);
}
