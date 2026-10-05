import { type Sitemap } from '#lib/sitemap.js';
import { generateRandomId } from '#lib/utils.js';

export function generateNewUrl(sitemap: Sitemap, id?: string): string {
	return `/${sitemap}/${id ? id : generateRandomId()}`;
}
