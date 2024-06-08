/** @type {import("prettier").Config} */
const config = {
  trailingComma: "es5",
  tabWidth: 2,
  semi: false,
  singleQuote: true,
  printWidth: 1000,
};

export default {
  config,
  plugins: ["prettier-plugin-tailwindcss"],
};
