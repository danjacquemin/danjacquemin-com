import { useEffect } from "react";

const AboutPage = () => {
  useEffect(() => {
    document.title = "about | dan jacquemin . com";
  }, []);

  return (
    <>
      <section className="min-w-[700px] basis-1/2">
        <h1 className="mb-6 italic">Hello World!</h1>
        <h2>The story so far&hellip;</h2>
        <div className="px-4 pb-6">
          <p>
            Universe created. <br />
            Some time passes. <br />
            Dinosaurs. <em>Rawr!</em> <br />
            Romans invent concrete. <br />
            2001. v1 of this site. <br />
            2001-2023. Various updates. <br />
            2024: Again?! Yes. But, this time with React + Vite + Tailwind.
          </p>
        </div>

        <h2>Your timeline is vague&hellip;</h2>
        <div className="px-4 pb-6">
          <p>Well, yeah.</p>
        </div>
        <h2>Seriously though&hellip;</h2>
        <div className="px-4 pb-6">
          <p>
            I've been a web developer for a long time. Like, I got started on{" "}
            <a href="https://en.wikipedia.org/wiki/Gopher_(protocol)">Gopher</a>{" "}
            and the first web page I built was for{" "}
            <a href="https://en.wikipedia.org/wiki/Netscape_(web_browser)#Netscape-based_(versions_1.0%E2%80%934.8)_releases">
              Netscape Navigator
            </a>
            . It had an image. I was very proud. Then I spent a decade or two
            doing doing Web Development eventually working my way to to Lead
            Front-end Developer at <a href="http://www.ets.org">ETS</a> with
            strong focus on standards, #a11y, and usability. Sadly we got to
            2023 and my role got outsourced. It was fun while it lasted.
          </p>
        </div>
        <h2>Okay, so what exactly are you doing&hellip;</h2>
        <div className="px-4 pb-6">
          <p>We're going to work through building out a site using:</p>
          <ul>
            <li>React + Vite + Tailwind</li>
          </ul>
        </div>

        <h2>Sounds like fun&hellip;</h2>
        <div className="px-4 pb-6">
          <p>It does, doesn't it?!</p>
        </div>
        <h2>Obtw&hellip;</h2>

        <div className="px-4 pb-6">
          <p>
            If you need a senior type developer, hit me up.
            <br />
            Deets on LinkedIn &mdash;{" "}
            <a href="https://www.linkedin.com/in/dan-jacquemin/">
              linkedin.com/in/dan-jacquemin/
            </a>
          </p>
        </div>
      </section>
    </>
  );
};

export default AboutPage;
