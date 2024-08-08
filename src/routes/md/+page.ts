export async function load() {
	const motd = await import('$lib/motd/2024-7-19.md?raw');
	return { motd: motd.default };
}
