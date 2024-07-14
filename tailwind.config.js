import { fontFamily } from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ['selector', '[data-color-theme="dark"]'],
	content: ["./src/**/*.{html,js,svelte,ts}"],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', ...fontFamily.sans],
				mono: ["JetBrains Mono", ...fontFamily.mono],
			},
			backgroundColor: {
				DEFAULT: 'hsl(var(--color-shade-2))',
			},
			borderColor: {
				DEFAULT: 'hsl(var(--color-shade-5))',
			},
			textColor: {
				active: 'hsl(var(--color-text-shade-0))',
				base: 'hsl(var(--color-text-shade-1))',
				muted: 'hsl(var(--color-text-shade-2))',
			},
			colors: {
				accent: 'hsl(var(--color-primary))',
				shade: {
					0: 'hsl(var(--color-shade-0) / <alpha-value>)',
					1: 'hsl(var(--color-shade-1))',
					2: 'hsl(var(--color-shade-2))',
					3: 'hsl(var(--color-shade-3))',
					4: 'hsl(var(--color-shade-4))',
					5: 'hsl(var(--color-shade-5))',
					6: 'hsl(var(--color-shade-6))',
				},
				positive: {
					DEFAULT: 'hsl(var(--color-positive))',
					muted: 'hsl(var(--color-positive-muted))',
				},
				warning: {
					DEFAULT: 'hsl(var(--color-warning))',
					muted: 'hsl(var(--color-warning-muted))',
				},
				negative: {
					DEFAULT: 'hsl(var(--color-negative))',
					muted: 'hsl(var(--color-negative-muted-muted))',
				},
			},
		},
	},
};

export default config;
