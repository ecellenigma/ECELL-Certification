import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: "'Inter Variable', Arial, Helvetica, sans-serif",
        "dm-serif-display": "'DM Serif Display', serif",
      },
      colors: {
        "primary": {
          DEFAULT: "#128EA0",
          dark: "#0F7483",
          hover: {
            DEFAULT: "#107A89",
            dark: "#118292",
          }
        },
        "on-primary": {
          DEFAULT: colors.white,
          dark: colors.white,
        },
        "background": {
          DEFAULT: "#F2F7FD",
          dark: "#030B15",
        },
        "text": {
          DEFAULT: "#030B15",
          dark: "#F2F7FD",
          placeholder: {
            DEFAULT: "#A1A9AA",
            dark: "#455254",
          },
          secondary: {
            DEFAULT: "#33494D",
            dark: "#B2C9CC",
          },
          heading: {
            DEFAULT: "#212B2C",
            dark: "#B0C6C9",
          },
        },
        "border": {
          DEFAULT: "#C4CBD4",
          dark: "#21262C",
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
