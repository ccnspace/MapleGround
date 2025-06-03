/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  safelist: ["text-teal-300", "text-indigo-300"],
  theme: {
    extend: {
      fontFamily: {
        pretendard: ["var(--font-pretendard)"],
      },
      colors: {
        coreNavy: "#131625",
      },
      keyframes: {
        starBlink: {
          "0%": {
            opacity: "1",
            transform: "scale(1) rotate(0deg)",
            color: "rgb(255 255 255)",
            textShadow: "0 0 0px rgba(255, 255, 255, 0)",
          },
          "15%": {
            opacity: "1",
            transform: "scale(4) rotate(36deg)",
            color: "rgb(255 255 255)",
            textShadow:
              "0 0 8px rgba(255, 255, 255, 1), 0 0 15px rgba(255, 255, 255, 0.95), 0 0 20px rgba(255, 255, 255, 0.85), 0 0 25px rgba(255, 255, 255, 0.8), 0 0 35px rgba(253, 224, 71, 0.9), 0 0 40px rgba(253, 224, 71, 0.8)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1) rotate(0deg)",
            color: "rgb(253 224 71)",
            textShadow: "0 0 0px rgba(255, 255, 255, 0)",
          },
        },
      },
      animation: {
        starBlink: "starBlink 0.4s ease-out",
      },
    },
  },
  plugins: [],
};
