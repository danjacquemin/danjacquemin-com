import About from '../pages/About';

import type { RouteObject } from 'react-router-dom';

/**
 * Public routes for the app
 */
export const publicRoutes: RouteObject[] = [{ path: '/', element: <About /> }];
