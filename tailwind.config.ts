import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './frontend/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
export default config
