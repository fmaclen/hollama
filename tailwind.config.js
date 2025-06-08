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
					'@apply flex w-full outline-none disabled:cursor-not-allowed disabled:opacity-50 bg-transparent px-3 pb-2.5 placeholder:text-shade-6':
						{}
				},
				'.base-section': {
					'@apply h-full w-full overflow-scrollbar bg-shade-2 lg:rounded-xl lg:border': {}
				},
				'.base-section-fullscreen': {
					'@apply base-section flex border-spacing-1 flex-col bg-shade-1 py-20 items-center': {}
				},
				'.base-fieldset-container': {
					'@apply p-4 lg:p-6 xl:p-8': {}
				},
				'.confirm-deletion': {
					'@apply bg-gradient-to-r from-transparent to-red-50': {},
					// HACK: This is needed because of a bug in Svelte 5 with `dark:` selectors
					// REF: https://github.com/sveltejs/svelte/issues/14330
					'&:global(:where([data-color-theme="dark"], [data-color-theme="dark"] *))': {
						'@apply bg-gradient-to-r from-transparent to-red-900': {}
					}
				},
				'.confirm-editing': {
					'@apply bg-gradient-to-r from-transparent to-amber-50': {},
					// HACK: This is needed because of a bug in Svelte 5 with `dark:` selectors
					// REF: https://github.com/sveltejs/svelte/issues/14330
					'&:global(:where([data-color-theme="dark"], [data-color-theme="dark"] *))': {
						'@apply bg-gradient-to-r from-transparent to-amber-900': {}
					}
				},
				'.text-link': {
					'@apply underline underline-offset-4 hover:text-accent': {}
				},
				'.overflow-scrollbar': {
					'@apply overflow-auto scrollbar scrollbar-track-transparent scrollbar-thumb-shade-6/80':
						{}
				},
				'.badge': {
					'@apply inline-flex max-w-max items-center rounded-md px-2 py-0.5 font-mono text-xs border border-shade-3 text-muted':
						{}
				},
				'.base-icon': {
					'@apply w-4 h-4': {}
				}
			});
		},
		require('tailwind-scrollbar')
	]
};

export default config;
