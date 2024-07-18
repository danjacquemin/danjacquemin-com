/** @type {import('tailwindcss').Config} */

function withOpacity(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
}

export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      display: ["Playfair Display", "serif"],
      body: ["Raleway", "sans-serif"],
      mono: ["Inconsolata", "monospace"],
    },
    extend: {
      textColor: {
        skin: {
          bodytext: withOpacity("--color-bodytext"),
          "button-primary": withOpacity("--color-button-primary"),
          "button-primary-hover": withOpacity("--color-button-primary-hover"),
        },
      },
      backgroundColor: {
        skin: {
          primary: withOpacity("--color-bg-primary"),
          "button-primary": withOpacity("--color-button-primary-bg"),
          "button-primary-hover": withOpacity(
            "--color-button-primary-bg-hover",
          ),
          "button-primary-fill": withOpacity("--color-fill"),
          "button-primary-fill-hover": withOpacity("--color-fillhover"),
        },
      },
      borderColor: {
        skin: {
          primary: withOpacity("--color-button-primary-border"),
          "primary-hover": withOpacity("--color-button-primary-border-hover"),
        },
      },
      fill: {
        skin: {
          primary: withOpacity("--color-button-primary-fill"),
          "primary-hover": withOpacity("--color-button-primary-fill-hover"),
        },
      },
    },
  },
  plugins: [],
};
