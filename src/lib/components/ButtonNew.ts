import { type Sitemap } from '$lib/sitemap';
import { generateStorageId } from '$lib/utils';

export function generateNewUrl(sitemap: Sitemap, id?: string): string {
	return `/${sitemap}/${id ? id : generateStorageId()}`;
}
