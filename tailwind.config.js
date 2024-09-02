import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
const config = {
	darkMode: ['selector', '[data-color-theme="dark"]'],
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', ...fontFamily.sans],
				mono: ['JetBrains Mono', ...fontFamily.mono]
			},
			backgroundColor: {
				DEFAULT: 'hsl(var(--color-shade-2))'
			},
			borderColor: {
				DEFAULT: 'hsl(var(--color-shade-5))'
			},
			textColor: {
				active: 'hsl(var(--color-text-shade-0))',
				base: 'hsl(var(--color-text-shade-1))',
				muted: 'hsl(var(--color-text-shade-2))'
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
					6: 'hsl(var(--color-shade-6))'
				},
				positive: {
					DEFAULT: 'hsl(var(--color-positive))',
					muted: 'hsl(var(--color-positive-muted))'
				},
				warning: {
					DEFAULT: 'hsl(var(--color-warning))',
					muted: 'hsl(var(--color-warning-muted))'
				},
				negative: {
					DEFAULT: 'hsl(var(--color-negative))',
					muted: 'hsl(var(--color-negative-muted-muted))'
				}
			}
		}
	},
	plugins: [
		function ({ addComponents }) {
			addComponents({
				'.base-input': {
					'@apply flex w-full outline-none disabled:cursor-not-allowed disabled:opacity-50 bg-transparent px-3 pb-3 placeholder:text-shade-6':
						{}
				},
				'.base-section': {
					'@apply h-full w-full overflow-y-auto border-t bg-shade-2 lg:rounded-xl lg:border': {}
				},
				'.confirm-deletion': {
					'@apply bg-gradient-to-r from-transparent to-red-50 dark:to-red-900': {}
				},
				'.text-link': {
					'@apply underline underline-offset-4 hover:text-accent': {}
				},
				'.badge': {
					'@apply inline-flex max-w-max items-center rounded-md px-2 py-0.5 font-mono text-xs border border-shade-3 text-muted':
						{}
				}
			});
		}
	]
};

export default config;
