import DefaultIcon from "./default-icon";
import LinkedInIcon from "./linkedin-icon";
import TumblrIcon from "./tumblr-icon";
import TwitterIcon from "./twitter-icon";
import GitHubIcon from "./github-icon";
import InstagramIcon from "./instagram-icon";
import ThumbsUp from "./thumbs-up";

const Icon = ({
  name,
  additionalClasses,
}: {
  name: string;
  additionalClasses?: string;
}) => {
  const defaultStyles = "h-4 w-4";

  const combinedClasses: string = `${defaultStyles} ${additionalClasses || ""}`;

  switch (name) {
    case "LinkedIn":
      return LinkedInIcon({ combinedClasses });
    case "GitHub":
      return GitHubIcon({ combinedClasses });
    case "Instagram":
      return InstagramIcon({ combinedClasses });
    case "Twitter":
      return TwitterIcon({ combinedClasses });
    case "Tumblr":
      return TumblrIcon({ combinedClasses });
    case "ThumbsUp":
      return ThumbsUp({ combinedClasses });
    default:
      return DefaultIcon({ combinedClasses });
  }
};

export default Icon;
