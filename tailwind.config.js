import { fontFamily } from "tailwindcss/defaultTheme";
// const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ['selector', '[data-color-theme="dark"]'],
	content: ["./src/**/*.{html,js,svelte,ts}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', ...fontFamily.sans],
				mono: ['"Decima Mono Pro"', ...fontFamily.mono],
			},
			colors: {
				h: { // is for "Hollama"
					primary: 'hsl(var(--color-primary))',
					elevation: {
						1: 'hsl(var(--color-bg-elevation-1))',
						2: 'hsl(var(--color-bg-elevation-2))',
						3: 'hsl(var(--color-bg-elevation-3))',
						4: 'hsl(var(--color-bg-elevation-4))',
						5: 'hsl(var(--color-bg-elevation-5))',
					},
					border: {
						DEFAULT: 'hsl(var(--color-border-default))',
						muted: 'hsl(var(--color-border-muted))',
						input: 'hsl(var(--color-border-input))',
					},
					body: {
						DEFAULT: 'hsl(var(--color-text-default))',
						muted: 'hsl(var(--color-text-muted))',
					},
					negative: {
						fg: 'hsl(var(--color-negative-fg))',
						bg: 'hsl(var(--color-negative-bg))',
					},
					warning: {
						fg: 'hsl(var(--color-warning-fg))',
						bg: 'hsl(var(--color-warning-bg))',
					},
					positive: {
						fg: 'hsl(var(--color-positive-fg))',
						bg: 'hsl(var(--color-positive-bg))',
					},
				},

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
	}
};

export default config;
// module.exports = config;
