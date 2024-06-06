import React from "react";
import DefaultIcon from "./default-icon";
import LinkedInIcon from "./linkedin-icon";
import TumblrIcon from "./tumblr-icon";
import TwitterIcon from "./twitter-icon";
import GitHubIcon from "./github-icon";
import InstagramIcon from "./instagram-icon";

import { IconProps } from "../../types/icon-types";

const Icon: React.FC<IconProps> = ({ name, additionalClasses }) => {
  const defaultStyles = "h-4 w-4";

  const combinedClasses: string = `${defaultStyles} ${additionalClasses}`;

  switch (name) {
    case "LinkedIn":
      return LinkedInIcon({ combinedClasses });
      break;
    case "GitHub":
      return GitHubIcon({ combinedClasses });
      break;
    case "Instagram":
      return InstagramIcon({ combinedClasses });
      break;
    case "Twitter":
      return TwitterIcon({ combinedClasses });
      break;
    case "Tumblr":
      return TumblrIcon({ combinedClasses });
      break;
    default:
      return DefaultIcon({ combinedClasses });
  }
};

export default Icon;
