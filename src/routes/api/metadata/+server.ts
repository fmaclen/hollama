import { version } from '$app/env';
import { PUBLIC_ADAPTER } from '$app/env/public';

export interface HollamaMetadata {
	currentVersion: string;
	isDocker: boolean;
}

/** @type {import('./$types').RequestHandler} */
export async function GET() {
	return Response.json({
		currentVersion: version,
		isDocker: PUBLIC_ADAPTER === 'docker-node'
	} as HollamaMetadata);
}
