import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: [
    './app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}',
    '../../libs/commons/**/*.{js,jsx,ts,tsx}',
    '../../node_modules/tw-react-components/**/*.{js,jsx,ts,tsx}',
  ],
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
    require('tw-react-components/config'),
  ],
} satisfies Config;
