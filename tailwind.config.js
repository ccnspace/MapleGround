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
            opacity: "0.7",
            transform: "scale(0.5) rotate(0deg)",
            color: "rgb(255 255 255)",
            textShadow: "0 0 0px rgba(255, 255, 255, 0)",
          },
          "20%": {
            opacity: "1",
            transform: "scale(6) rotate(32deg)",
            filter: "blur(1px)",
            color: "rgb(255 255 255)",
            textShadow:
              "0 0 20px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.5), 0 0 25px rgba(255, 255, 255, 0.5), 0 0 25px rgba(255, 255, 255, 0.5), 0 0 30px rgba(253, 224, 71, 0.5), 0 0 30px rgba(253, 224, 71, 0.5)",
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
        starBlink: "starBlink 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
