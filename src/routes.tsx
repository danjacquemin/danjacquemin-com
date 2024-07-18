import { Routes, Route } from "react-router-dom";
import HomePage from "./components/Pages/Home";
import SwagPage from "./components/Pages/Swag";
import AboutPage from "./components/Pages/About";
import JetsamPage from "./components/Pages/Jetsam";
import FlotsamPage from "./components/Pages/Flotsam";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/jetsam" element={<JetsamPage />} />
      <Route path="/flotsam" element={<FlotsamPage />} />
      <Route path="/swag" element={<SwagPage />} />
      <Route path="/about" element={<AboutPage />} />
    </Routes>
  );
};

export default AppRoutes;
