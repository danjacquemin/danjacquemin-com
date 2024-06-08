import { useEffect } from "react";
import SwagPin from "../SwagPin";

const SwagPage = () => {
  useEffect(() => {
    document.title = "swag | dan jacquemin . com";
  }, []);

  return (
    <>
      <h1 className="mb-6 italic">Swag 2025</h1>
      <SwagPin />
    </>
  );
};

export default SwagPage;
