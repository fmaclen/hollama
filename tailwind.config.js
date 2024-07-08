import { fontFamily } from "tailwindcss/defaultTheme";
// const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ['selector', '[data-color-theme="dark"]'],
	content: ["./src/**/*.{html,js,svelte,ts}"],
	safelist: ["dark"],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px"
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', ...fontFamily.sans],
				mono: ['"Decima Mono Pro"', ...fontFamily.mono],
			},
			colors: {
				elevation: {
					// Light elevations
					0: 'hsl(0, 0%, 100%)',
					50: 'hsl(0, 0%, 96%)',
					100: 'hsl(0, 0%, 92%)',
					// Dark elevations
					700: "hsl(0, 0%, 10%)",
					800: "hsl(0, 0%, 5%)",
					900: "hsl(0, 0%, 0%)",
				},

				// elevation: {
				// 	0: 'hsl(0, 0, 100%)',
				// 	50: 'hsl(0, 0, 98%)',
				// 	100: 'hsl(0, 0, 96%)',
				// 	// 200: 'hsl(0, 0, 94%)',
				// 	// 300: 'hsl(0, 0, 92%)',
				// 	// 400: 'hsl(0, 0, 90%)',
				// },
				border: "hsl(var(--border) / <alpha-value>)",
				input: "hsl(var(--input) / <alpha-value>)",
				ring: "hsl(var(--ring) / <alpha-value>)",
				background: "hsl(var(--background) / <alpha-value>)",
				foreground: "hsl(var(--foreground) / <alpha-value>)",
				primary: {
					DEFAULT: "hsl(var(--primary) / <alpha-value>)",
					foreground: "hsl(var(--primary-foreground) / <alpha-value>)"
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
					foreground: "hsl(var(--secondary-foreground) / <alpha-value>)"
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
					foreground: "hsl(var(--destructive-foreground) / <alpha-value>)"
				},
				muted: {
					DEFAULT: "hsl(var(--muted) / <alpha-value>)",
					foreground: "hsl(var(--muted-foreground) / <alpha-value>)"
				},
				accent: {
					DEFAULT: "hsl(var(--accent) / <alpha-value>)",
					foreground: "hsl(var(--accent-foreground) / <alpha-value>)"
				},
				popover: {
					DEFAULT: "hsl(var(--popover) / <alpha-value>)",
					foreground: "hsl(var(--popover-foreground) / <alpha-value>)"
				},
				card: {
					DEFAULT: "hsl(var(--card) / <alpha-value>)",
					foreground: "hsl(var(--card-foreground) / <alpha-value>)"
				},
				body: {
					DEFAULT: "hsl(var(--background) / <alpha-value>)"
				},
				code: {
					DEFAULT: "hsl(var(--code) / <alpha-value>)"
				},
			}
		},
		borderRadius: {
			lg: "var(--radius)",
			md: "calc(var(--radius) - 2px)",
			sm: "calc(var(--radius) - 4px)"
		},
		fontFamily: {
			sans: [...fontFamily.sans]
		}
	}
};

export default config;
// module.exports = config;
