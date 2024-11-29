import { type Sitemap } from '$lib/sitemap';
import { generateRandomId } from '$lib/utils';

export function generateNewUrl(sitemap: Sitemap, id?: string): string {
	return `/${sitemap}/${id ? id : generateRandomId()}`;
}
