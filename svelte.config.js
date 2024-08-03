import dotenv from 'dotenv';
dotenv.config();

import adapterNode from '@sveltejs/adapter-node';
import adapterCloudflare from '@sveltejs/adapter-cloudflare';
import adapterStatic from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

let adapter = adapterNode({
	routes: {
		include: ['/*'],
		exclude: ['<all>']
	}
});
// if (process.env.ADAPTER === 'electron-node') {
// adapter = adapterStatic({
// 	pages: 'build',
// 	assets: 'build',
// 	fallback: 'index.html'
// });
// } else {
// 	const adapterConfig = {
// 		// See below for an explanation of these options
// 		routes: {
// 			include: ['/*'],
// 			exclude: ['<all>']
// 		}
// 	};

// 	if (process.env.ADAPTER === 'docker-node') adapter = adapterNode(adapterConfig);
// 	else adapter = adapterCloudflare(adapterConfig);
// }

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [vitePreprocess({})],

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter,
		version: {
			name: process.env.npm_package_version
		}
	}
};

export default config;
