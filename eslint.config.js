import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import ts from 'typescript-eslint';

import svelteConfig from './svelte.config.js'; // Assuming this file exists, as per your example

export default ts.config(
	{
		// Global ignores translated from .eslintignore
		ignores: [
			'**/node_modules/**',
			'build/**',
			'.svelte-kit/**',
			'package/**',
			'**/.DS_Store',
			'**/.env',
			'**/.env.*', // Note: !.env.example from .eslintignore is not directly translated.
			'**/pnpm-lock.yaml',
			'**/package-lock.json',
			'**/yarn.lock',
			'src/i18n/**', // Ignore auto-generated i18n files
			'postcss.config.cjs', // Ignore postcss.config.cjs
			'tailwind.config.js' // Ignore tailwind.config.js
		]
	},
	js.configs.recommended, // General JS recommendations from @eslint/js
	...ts.configs.recommended, // TypeScript recommendations from typescript-eslint

	// Svelte configurations
	// Apply base Svelte recommendations. This typically sets up svelte-eslint-parser for .svelte files.
	...svelte.configs.recommended,

	{
		// Specific configuration for Svelte files to correctly parse <script lang="ts">
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'], // Files this config applies to
		languageOptions: {
			parserOptions: {
				parser: ts.parser, // Tell svelte-eslint-parser to use ts.parser for script content
				projectService: true, // Enable typed linting rules (ensure tsconfig.json is discoverable)
				extraFileExtensions: ['.svelte'], // Crucial for Svelte files
				svelteConfig // Pass svelte.config.js to the parser for richer context
			}
		}
	},

	{
		// Global language options for all relevant files (JS, TS, Svelte)
		languageOptions: {
			ecmaVersion: 'latest', // Use the latest ECMAScript version
			sourceType: 'module', // Standard for modern JavaScript
			globals: {
				// Define global variables available in your environments
				...globals.browser,
				...globals.node
			}
		}
	},

	// Prettier configuration (must be last to override other ESLint formatting rules)
	prettier, // Disables ESLint rules that would conflict with Prettier
	...svelte.configs.prettier // Applies Svelte-specific Prettier overrides from eslint-plugin-svelte
);
