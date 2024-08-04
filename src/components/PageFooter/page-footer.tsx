import { useEffect, useState } from "react";
import Icon from "../Icon";

// -- -- -- -- --

const socialMedia = [
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/dan-jacquemin/",
  },
  {
    name: "GitHub",
    url: "https://github.com/danjacquemin",
  },
  {
    name: "Twitter",
    url: "https://twitter.com/danjacquemin/",
  },
  {
    name: "Tumblr",
    url: "https://www.tumblr.com/blog/jacquemin",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/djacquemin/",
  },
];

const reminders = [
  "Cape <i>does not</i> enable flight.",
  "Call your mom.",
  "2 oz white rum, ¾ oz lime juice, ¾ oz 1:1 simple syrup, <i>tiny</i> pinch of salt. Combine. Shake. Strain. Serve with a half slice of lime.",
  "Stand up straight with your shoulders back.",
  "Ég tala ekki íslensku.",
  "Remember compliments you receive, forget the insults / If you succeed in doing this, tell me how",
];

// -- -- -- -- --

const PageFooter = () => {
  const [reminder, setReminder] = useState<string>(""); // reminder state cannot be null or it upset dangerouslySetInnerHTML

  // useEffect to pick a random reminder on page load
  useEffect(() => {
    setReminder(reminders[Math.floor(Math.random() * reminders.length)]);
  }, []);

  return (
    <>
      <hr className="footer-hr" />

      <footer className="wrap-footer print:hidden">
        <div className="wrap-social">
          {socialMedia &&
            socialMedia.map(({ url, name }, i) => (
              <div key={i}>
                <a
                  href={url}
                  aria-label={name}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name={name} additionalClasses="h-8 w-8" />
                </a>
              </div>
            ))}
        </div>
        <div className="wrap-cruft">
          <div className="wrap-selflove">
            <p>
              <strong>Dan Jacquemin:</strong> Seasoned UI/UX developer with a
              passion for <code>#a11y</code> and standards. Slowly coming to
              terms to geospatial mapping and analysis. I enjoy problem solving
              for large and small projects. Let's make beautiful sites.
            </p>
          </div>
          <div className="wrap-quirk">
            <p>
              <strong>Important: </strong>{" "}
              <span dangerouslySetInnerHTML={{ __html: reminder }}></span>
            </p>
          </div>
          <div className="wrap-cya">
            <p>
              <strong>
                Copyright <span aria-hidden="true">&copy;</span>{" "}
                {new Date().getFullYear()}.{" "}
              </strong>
              Some of it mine, some of it their respective creators{" "}
              <span className="italic">(see source for more details)</span>.
              Cannot be held responsible for any typos, wrong dates, badly
              labeled figures, incorrect addresses, inclement weather, mange,
              poor nutrution on race day, your team being blacked-out on TV, or
              anything else that you do not like or disagree with.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default PageFooter;
