import { generateStorageId } from "$lib/utils";
import { type Sections} from "$lib/section";

export function generateNewUrl(section: Sections, id?: string): string {
	return `/${section}/${id ? id : generateStorageId()}`;
}
