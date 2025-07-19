import About from '../pages/About';
import Home from '../pages/Home';
import NFLPickem2025 from '../pages/NFLPickem2025';
import CreateNFLQR2025 from '../pages/NFLPickem2025/pages/CreateNFLQR';
import ReadNFLQR2025 from '../pages/NFLPickem2025/pages/ReadNFLQR';
import Results from '../pages/NFLPickem2025/pages/Results';

import type { RouteObject } from 'react-router-dom';

/**
 * Public routes for the app
 */
export const publicRoutes: RouteObject[] = [
  { element: <Home />, path: '/' },
  { element: <About />, path: '/about' },
  { element: <NFLPickem2025 />, path: '/nfl' },
  { element: <CreateNFLQR2025 />, path: '/nfl/create-qr' },
  { element: <ReadNFLQR2025 />, path: '/nfl/read-qr' },
  { element: <Results />, path: '/nfl/results' },
];
