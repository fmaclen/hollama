import { generateStorageId } from "$lib/utils";
import { type Sections} from "$lib/section";

export function createNewUrl(section: Sections, id?: string): string {
	return `/${section}/${id ? id : generateStorageId()}`;
}
