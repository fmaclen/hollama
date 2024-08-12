export async function load() {
	const motd = await import('./motd.md?raw');
	return { motd: motd.default };
}
