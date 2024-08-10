import { useEffect } from "react";
import SwagPin from "../SwagPin";

const SwagPage = () => {
  useEffect(() => {
    document.title = "swag | dan jacquemin . com";
  }, []);

  return (
    <>
      <section className="no-innards min-w-[700px] basis-1/2">
        <h1 className="mb-6 italic">Dave & Tim 2025 Swag</h1>
      </section>
      <hr className="-mx-4 mb-4" />
      <p>
        <a
          href="https://www.daveandtimrivieramaya.com/experience"
          target="_blank"
          rel="noopener noreferrer"
        >
          Dave and Tim in Mexico
        </a>
        ?!
      </p>
      <p>
        If you're going, you're gonna want to bring some{" "}
        <a
          href="https://www.facebook.com/groups/322782108497555/"
          target="_blank"
          rel="noopener noreferrer"
        >
          swag
        </a>
        .
      </p>
      <p>
        I'm thinking some 1.75" x 2.75"{" "}
        <a
          href="https://24hourwristbands.com/shop/products/1-75-x-2-75-inch-rectangle-custom-buttons"
          target="_blank"
          rel="noopener noreferrer"
        >
          pins
        </a>{" "}
        or{" "}
        <a
          href="https://24hourwristbands.com/shop/products/1-75-x-2-75-inch-rectangle-wearable-clothing-magnet-buttons"
          target="_blank"
          rel="noopener noreferrer"
        >
          magnets
        </a>
        .
      </p>
      <p>If I can find them on the cheap or rent a button maker.</p>
      <p>Otherwise, maybe stickers.</p>
      <SwagPin />
    </>
  );
};

export default SwagPage;
