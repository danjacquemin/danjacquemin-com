import About from '../pages/About';
import NFLConfidencePicks2026 from '../pages/NFLConfidencePicks2026';

import type { RouteObject } from 'react-router-dom';

/**
 * Public routes for the app
 */
export const publicRoutes: RouteObject[] = [
  { path: '/', element: <About /> },
  { path: '/nfl/2026', element: <NFLConfidencePicks2026 /> },
];
