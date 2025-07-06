import { Route } from 'react-router-dom';

import About from '../pages/About';
import Home from '../pages/Home';
import NFLPickem2025 from '../pages/NFLPickem2025';

export const publicRoutes = (
  <>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/nfl" element={<NFLPickem2025 />} />
  </>
);
