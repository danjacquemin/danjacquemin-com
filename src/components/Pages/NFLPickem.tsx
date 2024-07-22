import { useEffect } from "react";
import NFLPickem2024 from "../NFLPickem2024";

const NFLPickem = () => {
  useEffect(() => {
    document.title = "home | dan jacquemin . com";
  }, []);

  return (
    <>
      <section className="no-innards min-w-[700px] basis-1/2">
        <h1 className="mb-6 italic">NFL Pickem 2024</h1>
      </section>
      <hr className="-mx-4 mb-4" />

      <NFLPickem2024 />
    </>
  );
};

export default NFLPickem;
