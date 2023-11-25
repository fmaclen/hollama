import { env } from '$env/dynamic/public';
import type { RequestHandler } from './$types';

interface OllamaCompletionRequest {
	model: string;
	prompt: string;
	context: number[];
}

export const POST: RequestHandler = async ({ request }) => {
	const { prompt, context } = await request.json();

	const payload: OllamaCompletionRequest = {
		model: env.PUBLIC_MODEL,
		context,
		prompt
	};

	return fetch(`${env.PUBLIC_OLLAMA_URL}/api/generate`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload)
	});
};
