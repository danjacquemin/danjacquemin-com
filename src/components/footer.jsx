import * as React from "react";
import Icons from "./Icons";

import * as styles from "./footer.module.scss";

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

const Footer = ({ children }) => {
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
          standards. I enjoy problem solving for large and small projects that
          make beautiful sites.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
