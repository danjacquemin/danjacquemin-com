/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.com/docs/reference/config-files/gatsby-config/
 */

/**
 * @type {import('gatsby').GatsbyConfig}
 */
module.exports = {
  siteMetadata: {
    title: "Dan Jacquemin",
    description:
      "Dan is a Front-end Developer who grooves on acccessiblity and coding standards. This is his fine collection notes involving work and life (e.g. life, coding, drinks, and assorted interesting things).",
    siteUrl: "https://danjacquemin.com",
    image: "",
    twitterUsername: "@danjacquemin",
  },
  plugins: [`gatsby-plugin-sass`],
};
