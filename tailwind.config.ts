import { type Config } from "tailwindcss";
import typography from "tailwindcss/typography";
import daisyui from "daisyui";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    typography(),
    daisyui,
  ],
} satisfies Config;
