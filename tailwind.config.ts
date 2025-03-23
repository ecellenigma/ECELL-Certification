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
          DEFAULT: colors.indigo[700],
          dark: colors.indigo[700],
          hover: {
            DEFAULT: colors.indigo[800],
            dark: colors.indigo[600],
          }
        },
        "on-primary": {
          DEFAULT: colors.white,
          dark: colors.white,
        },
        "background": {
          DEFAULT: colors.neutral[50],
          dark: colors.neutral[950],
        },
        "text": {
          DEFAULT: colors.neutral[900],
          dark: colors.neutral[100],
          placeholder: {
            DEFAULT: colors.neutral[400],
            dark: colors.neutral[600],
          },
          secondary: {
            DEFAULT: colors.neutral[700],
            dark: colors.neutral[300],
          },
          heading: {
            DEFAULT: colors.neutral[800],
            dark: colors.neutral[200],
          },
        },
        "border": {
          DEFAULT: colors.neutral[300],
          dark: colors.neutral[800],
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
