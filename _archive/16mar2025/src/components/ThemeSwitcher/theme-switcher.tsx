import { useEffect, useState } from "react";

type Theme = "default" | "dark" | "neon";

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState<Theme>("default");

  const toggleTheme = () => {
    setTheme(theme === "default" ? "dark" : "default");
    return (localStorage.getItem("theme") as Theme) || "default";
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme); // Persist choice
  }, [theme]);

  return (
    <div className="px-2 text-right print:hidden">
      <button onClick={toggleTheme} className="text-sm">
        Toggle Theme
      </button>
    </div>
  );
};

export default ThemeSwitcher;
