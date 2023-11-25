import fs from 'fs/promises';
import type { RequestHandler } from '@sveltejs/kit';
import type { Session } from '$lib/sessions';

// Load session
export const GET: RequestHandler = async ({ request }) => {
	const id = request.headers.get('x-session-id');

	try {
		if (!id) throw new Error('Session ID not provided');

		const path = `sessions/${id}.json`;
		const json = await fs.readFile(path, 'utf-8');
		const session = JSON.parse(json) as Session;

		return new Response(JSON.stringify(session), {
			status: 200,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	} catch (error) {
		return new Response('Session not found', {
			status: 404,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
};

// Save session
export const POST: RequestHandler = async ({ request }) => {
	const { session } = await request.json();

	try {
		if (!session) throw new Error();

		const path = `sessions/${session.id}.json`;
		const json = JSON.stringify(session);
		await fs.writeFile(path, json, 'utf-8');

		return new Response(JSON.stringify(session), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response('Session not found', {
			status: 404,
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
};
