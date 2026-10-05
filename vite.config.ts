import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import adapterNode from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import dotenv from 'dotenv';
import { defineConfig } from 'vite';

dotenv.config({ quiet: true });

const adapterConfig = {
	// See below for an explanation of these options
	routes: { include: ['/*'], exclude: ['<all>'] }
};

export default defineConfig({
	plugins: [
		sveltekit({
			// Consult https://kit.svelte.dev/docs/integrations#preprocessors
			// for more information about preprocessors
			preprocess: [vitePreprocess({})],

			// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
			// If your environment is not supported or you settled on a specific environment, switch out the adapter.
			// See https://kit.svelte.dev/docs/adapters for more information about adapters.
			adapter: ['docker-node', 'electron-node'].includes(process.env.PUBLIC_ADAPTER ?? '')
				? adapterNode()
				: adapterCloudflare(adapterConfig),
			version: { name: process.env.npm_package_version },
			alias: { $i18n: 'src/i18n' }
		})
	],
	preview: {
		// Allow all hosts in preview mode
		host: true,
		// Use environment variable for allowed hosts, falling back to localhost
		allowedHosts: process.env.VITE_ALLOWED_HOSTS
			? process.env.VITE_ALLOWED_HOSTS.split(',')
			: ['localhost']
	}
});
