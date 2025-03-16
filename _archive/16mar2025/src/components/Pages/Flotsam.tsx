import { useEffect } from "react";

const FlotsamPage = () => {
  useEffect(() => {
    document.title = "flotsam | dan jacquemin . com";
  }, []);

  return (
    <>
      <section className="no-innards min-w-[700px] basis-1/2">
        <h1 className="mb-6 italic">Flotsam</h1>
      </section>
      <hr className="-mx-4 mb-4" />
      <section className="min-w-[700px] basis-1/2">
        <div>
          <span className="mr-4 font-semibold">flot · sam</span>
          <span className="font-mono">/ˈflätsəm/</span>
        </div>
        <div className="italic text-gray-500">noun</div>
        <ul>
          <li>
            debris in the water that was not deliberately thrown overboard,
            often as a result from a shipwreck or accident.
          </li>
          <li>
            aka, junk that I'm pondering that doesn't fall into other
            categories.
          </li>
        </ul>
        <hr className="-mx-4 mb-4 mt-4" />
      </section>
    </>
  );
};

export default FlotsamPage;
