import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0A",
        foreground: "#F5F5F5",
        secondary: "#A0A0A0",
      },
      backgroundImage: {
        // Heat map progression: green → yellow → orange → red
        'gradient-green': 'linear-gradient(135deg, #10B981 0%, #22C55E 100%)', // Low ego (0-20)
        'gradient-lime': 'linear-gradient(135deg, #84CC16 0%, #A3E635 100%)', // Value contributor (21-40)
        'gradient-yellow': 'linear-gradient(135deg, #FBBF24 0%, #FCD34D 100%)', // Balanced (41-60)
        'gradient-orange': 'linear-gradient(135deg, #F97316 0%, #FB923C 100%)', // Self-promoter (61-80)
        'gradient-red': 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)', // Ego maximalist (81-100)

        // Legacy gradients (keeping for backwards compatibility)
        'gradient-fire': 'linear-gradient(135deg, #EF4444 0%, #F97316 100%)',
        'gradient-cool': 'linear-gradient(135deg, #10B981 0%, #22C55E 100%)',
        'gradient-balanced': 'linear-gradient(135deg, #FBBF24 0%, #FCD34D 100%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
