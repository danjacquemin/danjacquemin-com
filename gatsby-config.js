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
  plugins: [
    `gatsby-plugin-sass`,
    {
      resolve: `gatsby-plugin-styled-components`,
      options: {
        // Add any options here
      },
    },
    {
      resolve: "gatsby-omni-font-loader",
      options: {
        mode: "async",
        enableListener: true,
        preconnect: ["https://fonts.gstatic.com"],

        /* Self-hosted fonts config. Add font files and font CSS files to "static" folder */
        // custom: [
        //   {
        //     /* Exact name of the font as defied in @font-face CSS rule */
        //     name: ["Font Awesome 5 Brands", "Font Awesome 5 Free"],
        //     /* Path to the font CSS file inside the "static" folder with @font-face definition */
        //     file: "/fonts/fontAwesome/css/all.min.css",
        //   },
        // ],

        web: [
          {
            name: "Heebo",
            file: "https://fonts.googleapis.com/css2?family=Heebo",
          },
          {
            name: "Coustard",
            file: "https://fonts.googleapis.com/css2?family=Coustard",
          },
        ],
      },
    },
  ],
};
