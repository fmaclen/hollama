import { getLocale } from '#lib/paraglide/runtime.js';

export function generateRandomId() {
	return Math.random().toString(36).substring(2, 8); // E.g. `z7avx9`
}

export function getUpdatedAtDate() {
	return new Date().toISOString();
}

// Largest unit first, so a timestamp is described in the biggest unit it spans
const RELATIVE_TIME_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
	['year', 60 * 60 * 24 * 365],
	['month', 60 * 60 * 24 * 30],
	['week', 60 * 60 * 24 * 7],
	['day', 60 * 60 * 24],
	['hour', 60 * 60],
	['minute', 60],
	['second', 1]
];

export function formatTimestampToNow(timestamp: string) {
	const seconds = (new Date(timestamp).getTime() - Date.now()) / 1000;
	const [unit, unitInSeconds] =
		RELATIVE_TIME_UNITS.find(([, unitInSeconds]) => Math.abs(seconds) >= unitInSeconds) ??
		RELATIVE_TIME_UNITS[RELATIVE_TIME_UNITS.length - 1];
	const format = new Intl.RelativeTimeFormat(getLocale(), { numeric: 'auto' });
	return format.format(Math.round(seconds / unitInSeconds), unit);
}
