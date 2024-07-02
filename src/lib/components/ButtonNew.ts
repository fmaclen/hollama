import { generateStorageId } from "$lib/utils";
import { type Sitemap } from "$lib/sitemap";

export function generateNewUrl(sitemap: Sitemap, id?: string): string {
	return `/${sitemap}/${id ? id : generateStorageId()}`;
}
