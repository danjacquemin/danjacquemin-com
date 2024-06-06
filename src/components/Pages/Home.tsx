import { useEffect } from "react";

const HomePage = () => {
  useEffect(() => {
    document.title = "home | dan jacquemin . com";
  }, []);

  return (
    <div className="home-page">
      <h1 className="mb-6 italic">
        Hello <span className="sr-only"> you sexy, beautiful </span> World!
      </h1>
    </div>
  );
};

export default HomePage;
