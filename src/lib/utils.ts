import { formatDistanceToNow, type FormatDistanceToNowOptions } from 'date-fns';

export function generateStorageId() {
	return Math.random().toString(36).substring(2, 8); // E.g. `z7avx9`
}

export function getUpdatedAtDate() {
	return new Date().toISOString();
}

export function formatShortDistanceToNow(
	date: Date | number | string,
	options?: FormatDistanceToNowOptions
) {
	const longFormat = formatDistanceToNow(date, options);
	const shortFormat = longFormat
		.replace(' seconds ago', 's')
		.replace(' minute ago', 'm')
		.replace(' minutes ago', 'm')
		.replace(' hour ago', 'h')
		.replace(' hours ago', 'h')
		.replace(' day ago', 'd')
		.replace(' days ago', 'd')
		.replace(' month ago', 'mo')
		.replace(' months ago', 'mo')
		.replace(' year ago', 'y')
		.replace(' years ago', 'y');
	return shortFormat;
}
