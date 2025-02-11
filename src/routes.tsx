import { Routes, Route } from "react-router-dom";
import HomePage from "./components/Pages/Home";
import SwagPage from "./components/Pages/Swag";
import AboutPage from "./components/Pages/About";
import JetsamPage from "./components/Pages/Jetsam";
import FlotsamPage from "./components/Pages/Flotsam";
import NFLPickem from "./components/Pages/NFLPickem";
import PickemPDFExtract from "./components/NFLPickem2024/score-from-pdf";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/jetsam" element={<JetsamPage />} />
      <Route path="/flotsam" element={<FlotsamPage />} />
      <Route path="/swag-2025" element={<SwagPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/nfl-pickem/2024" element={<NFLPickem />} />
      <Route path="/nfl-pickem/2024/score" element={<PickemPDFExtract />} />
    </Routes>
  );
};

export default AppRoutes;
