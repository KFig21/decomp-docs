import { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { createRouter } from './router';
import type { Location } from './types/decomp';
import './styles/index.scss';

export default function App() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [name, setName] = useState<string>('');

  const router = createRouter(locations, setLocations, name, setName);

  return <RouterProvider router={router} />;
}
