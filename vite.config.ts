import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	preview: {
		// Allow all hosts in preview mode
		host: true,
		// Use environment variable for allowed hosts, falling back to localhost
		allowedHosts: process.env.VITE_ALLOWED_HOSTS
			? process.env.VITE_ALLOWED_HOSTS.split(',')
			: ['localhost']
	}
});
