import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
	return { id: params.id };
}) satisfies PageLoad;
