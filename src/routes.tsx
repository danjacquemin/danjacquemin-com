import { Routes, Route } from "react-router-dom";
import HomePage from "./components/Pages/Home";
import SwagPage from "./components/Pages/Swag";
import AboutPage from "./components/Pages/About";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/swag" element={<SwagPage />} />
      <Route path="/about" element={<AboutPage />} />
    </Routes>
  );
};

export default AppRoutes;
