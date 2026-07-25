// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // 主题色变量，映射到 CSS Variables
        'mist-bg': 'var(--mist-bg)',
        'mist-surface': 'var(--mist-surface)',
        'mist-border': 'var(--mist-border)',
        'mist-text': 'var(--mist-text)',
        'mist-text-secondary': 'var(--mist-text-secondary)',
        'mist-accent': 'var(--mist-accent)',
      },
      backdropBlur: {
        'glass': '20px',
      },
      backgroundColor: {
        'glass': 'var(--mist-glass-bg)',
      },
    },
  },
  plugins: [],
}

export default config
