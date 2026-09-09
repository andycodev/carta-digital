/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': 'var(--bg-main)',
        'brand-surface': 'var(--bg-surface)',
        'brand-surface-subtle': 'var(--bg-surface-subtle)',
        'brand-primary': 'var(--primary)',
        'brand-primary-hover': 'var(--primary-hover)',
        'brand-accent': 'var(--accent)',
        'brand-heading': 'var(--text-heading)',
        'brand-body': 'var(--text-body)',
        'brand-muted': 'var(--text-muted)',
        'brand-border': 'var(--border-subtle)',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
        'card-hover': '0 10px 25px -3px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.04)',
        'modal': '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
      }
    },
  },
  plugins: [
    require("daisyui")
  ],
  daisyui: {
    themes: [
      {
        delicias: {
          "primary": "#C2410C", // Warm Terracotta / Rich Amber
          "secondary": "#D97706", // Amber Gold
          "accent": "#0F766E", // Deep Pine / Teal
          "neutral": "#334155",
          "base-100": "#FFFFFF",
          "base-200": "#F8FAFC",
          "base-300": "#F1F5F9",
          "base-content": "#1E293B",
          "info": "#0284C7",
          "success": "#16A34A",
          "warning": "#D97706",
          "error": "#DC2626",
        },
      },
      "light"
    ],
    darkTheme: "delicias",
    base: true,
    styled: true,
    utils: true,
  },
}

