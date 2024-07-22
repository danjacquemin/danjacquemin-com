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
      <section className="min-w-[700px] basis-1/2">
        <div>
          <span className="mr-4 font-semibold">jet · sam</span>
          <span className="font-mono">/ˈjetsəm/</span>
        </div>
        <div className="italic text-gray-500">noun</div>
        <ul>
          <li>
            debris that was deliberately thrown overboard by a crew of a ship in
            distress, most often to lighten the ship's load.
          </li>
          <li>
            aka, stuff I've have finished, probably won't finish, or have moved
            on from.
          </li>
        </ul>
        <hr className="-mx-4 mb-4 mt-4" />
      </section>
    </>
  );
};

export default JetsamPage;
