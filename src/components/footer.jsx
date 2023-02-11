import * as React from "react";
import Icons from "./Icons";
import { Link } from "gatsby";

import * as styles from "./footer.module.scss";

// -- -- --

const reminders = [
  "Cape <i>does not</i> enable flight.",
  "Call your mom.",
  "2 oz white rum, ¾ oz lime juice, ¾ oz 1:1 simple syrup, <i>tiny</i> pinch of salt. Combine. Shake. Strain. Serve with a half slice of lime.",
  "Stand up straight with your shoulders back.",
  "Ég tala ekki íslensku.",
  "Remember compliments you receive, forget the insults / If you succeed in doing this, tell me how",
];

// -- -- --

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

// -- -- --

const Footer = ({ children }) => {
  const randomReminder = () => {
    return reminders[Math.floor(Math.random() * reminders.length)];
  };

  return (
    <footer>
      <hr />

      {children}
      <div className={styles.wrapSocial}>
        {socialMedia &&
          socialMedia.map(({ url, name }, i) => (
            <div key={i} className={styles.socialLink}>
              <a href={url} aria-label={name} target="_blank" rel="noreferrer">
                <Icons name={name} />
              </a>
            </div>
          ))}
      </div>
      <div className={styles.wrapContents}>
        <p>
          Seasoned UI/UX developer with a passion for <tt>#a11y</tt> and
          standards. I enjoy problem solving for large and small projects. Let's
          make beautiful sites.
        </p>
        <p className={styles.wrapHireMe}>
          <Link to="/hire-me" className="btn">
            Hire Me
          </Link>
        </p>
        <div className={styles.wrapCya}>
          <p>
            Important reminder:{" "}
            <span dangerouslySetInnerHTML={{ __html: randomReminder() }}></span>
          </p>
          <p>
            Copyright <span aria-hidden="true">&copy;</span> Dan Jacquemin.
            Cannot be held responsible for any typos, wrong dates, badly labeled
            figures, incorrect addresses, inclement weather, mange, poor
            nutrution on race day, your team being blacked-out on TV, or
            anything else that you do not like or disagree with.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
