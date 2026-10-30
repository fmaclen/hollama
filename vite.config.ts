import { paraglideVitePlugin } from '@inlang/paraglide-js';
import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import adapterNode from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import dotenv from 'dotenv';
import { defineConfig } from 'vite';

dotenv.config({ quiet: true });

const isNodeAdapter = ['docker-node', 'electron-node'].includes(process.env.PUBLIC_ADAPTER ?? '');

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
			adapter: isNodeAdapter ? adapterNode() : adapterCloudflare(adapterConfig),
			version: { name: process.env.npm_package_version }
		}),
		// Compiler options live in project.inlang/paraglide.config.ts, shared with the CLI
		paraglideVitePlugin({ project: './project.inlang' })
	],
	environments: {
		ssr: {
			// SvelteKit writes server source maps by default. Node ignores them at runtime,
			// so the Docker image and the desktop app ship without them.
			build: { sourcemap: !isNodeAdapter },
			// Rolldown looks for a tsconfig.json that covers each module, walking up past this
			// project. Inside another checkout (as in .worktrees/) it reaches that checkout's
			// tsconfig and fails dev on its unresolved `extends`. Pre-bundled deps don't need one.
			optimizeDeps: { rolldownOptions: { tsconfig: false } }
		}
	},
	// Worktrees set PORT and PREVIEW_PORT in .env; strictPort fails on a taken port instead of moving
	server: {
		port: Number(process.env.PORT) || 5173,
		strictPort: true,
		allowedHosts: ['.ts.net']
	},
	preview: {
		port: Number(process.env.PREVIEW_PORT) || 4173,
		strictPort: true,
		// Allow all hosts in preview mode
		host: true,
		// Use environment variable for allowed hosts, falling back to localhost
		allowedHosts: process.env.VITE_ALLOWED_HOSTS
			? process.env.VITE_ALLOWED_HOSTS.split(',')
			: ['localhost']
	}
});
