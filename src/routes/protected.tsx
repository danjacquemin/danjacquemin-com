import { Route } from 'react-router-dom';

export const protectedRoutes = (
  <>
    <Route path="/hidden" element={<div>Hidden Page</div>} />
  </>
);
