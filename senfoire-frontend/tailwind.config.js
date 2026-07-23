/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        foire: {
          primary: '#1e3a8a',   // Bleu nuit pro
          secondary: '#f59e0b', // Or / Ambre dynamique
          success: '#10b981',   // Vert émeraude
          danger: '#ef4444',    // Rouge vif
        }
      }
    },
  },
  plugins: [],
}