import { defineConfig } from '@inlang/paraglide-js';

export default defineConfig({
	outdir: './src/lib/paraglide',
	emitTsDeclarations: true,
	// The language lives in the settings store (see src/hooks.client.ts), never in the URL
	strategy: ['custom-settings', 'preferredLanguage', 'baseLocale']
});
