import { useEffect } from "react";

const SwagPage = () => {
  useEffect(() => {
    document.title = "swag | dan jacquemin . com";
  }, []);

  return <h1 className="mb-6 italic">Swag</h1>;
};

export default SwagPage;
