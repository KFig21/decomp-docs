// decomp-docs/src/App.tsx
import { RouterProvider } from 'react-router-dom';
import { CreateRouter } from './router';
import './styles/index.scss';

// App no longer holds any data state — it all lives in DataContext.
// CreateRouter just needs the project-name setter for the upload page.
export default function App() {
  const router = CreateRouter();
  return <RouterProvider router={router} />;
}
