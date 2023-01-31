import React from "react";

import IconDefault from "./default";
import IconGitHub from "./github";
import IconLinkedIn from "./linkedin";
import IconInstagram from "./instagram";
import IconTumblr from "./tumblr";
import IconTwitter from "./twitter";

import * as styles from "./icons.module.scss";

function Icons({ name, additionalClasses }) {
  switch (name) {
    case "GitHub":
      return <IconGitHub className={`${styles.icon} ${additionalClasses}`} />;
    case "Instagram":
      return (
        <IconInstagram className={`${styles.icon} ${additionalClasses}`} />
      );
    case "LinkedIn":
      return <IconLinkedIn className={`${styles.icon} ${additionalClasses}`} />;
    case "Twitter":
      return <IconTwitter className={`${styles.icon} ${additionalClasses}`} />;
    case "Tumblr":
      return <IconTumblr className={`${styles.icon} ${additionalClasses}`} />;
    default:
      return <IconDefault className={`${styles.icon} ${additionalClasses}`} />;
  }
}

export default Icons;
