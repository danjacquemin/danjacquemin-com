import { useEffect } from "react";

const JetsamPage = () => {
  useEffect(() => {
    document.title = "flotsam | dan jacquemin . com";
  }, []);

  return (
    <>
      <section className="no-innards min-w-[700px] basis-1/2">
        <h1 className="mb-6 italic">Jetsam</h1>
      </section>
      <hr className="-mx-4 mb-4" />
    </>
  );
};

export default JetsamPage;
