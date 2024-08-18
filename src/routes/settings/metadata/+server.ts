import { json } from '@sveltejs/kit';
import { version } from '$app/environment';
import { env } from '$env/dynamic/public';

/** @type {import('./$types').RequestHandler} */
export async function GET({ request }) {
	return json({
		version,
		isDesktop: env.PUBLIC_ADAPTER === 'electron-node',
		isDocker: env.PUBLIC_ADAPTER === 'docker-node'
	});
}
