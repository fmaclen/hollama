<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import { toast, Toaster } from 'svelte-sonner';
	import { detectLocale, navigatorDetector } from 'typesafe-i18n/detectors';

	import LL, { setLocale } from '$i18n/i18n-svelte';
	import { loadLocale } from '$i18n/i18n-util.sync';

	import '../app.pcss';

	import type { Locales } from '$i18n/i18n-types';
	import { env } from '$env/dynamic/public';
	import { browser } from '$app/environment';
	import { onNavigate } from '$app/navigation';
	import CollapsibleSidebar from '$lib/components/CollapsibleSidebar.svelte';
	import { ConnectionType, getDefaultServer } from '$lib/connections';
	import { serversStore, settingsStore, StorageKey } from '$lib/localStorage';
	import { checkForUpdates } from '$lib/updates';

	let { children }: { children: Snippet } = $props();

	onNavigate(async () => {
		// Check for updates whenever the user follows a link (if auto-check is enabled)
		if (!($settingsStore.autoCheckForUpdates === false)) await checkForUpdates();
	});

	$effect(() => {
		if (!$settingsStore.userLanguage) return;
		loadLocale($settingsStore.userLanguage);
		setLocale($settingsStore.userLanguage);
	});

	$effect(() =>
		document.documentElement.setAttribute('data-color-theme', $settingsStore.userTheme)
	);

	onMount(() => {
		// Language
		if (!$settingsStore.userLanguage)
			$settingsStore.userLanguage = detectLocale(
				'en',
				['en', 'de', 'zh-cn', 'es', 'fr', 'pt-br', 'ja', 'tr', 'vi'],
				navigatorDetector
			) as Locales;

		loadLocale($settingsStore.userLanguage);
		setLocale($settingsStore.userLanguage);

		// Migrate old server settings to new format
		const settingsLocalStorage = localStorage.getItem(StorageKey.HollamaPreferences);
		if (settingsLocalStorage) {
			const settings = JSON.parse(settingsLocalStorage);

			if (settings.ollamaServer || settings.openaiServer) {
				// Migrate Ollama server settings
				if (settings.ollamaServer) {
					console.warn('Migrating Ollama server settings');
					serversStore.update((servers) => [
						...servers,
						{
							...getDefaultServer(ConnectionType.Ollama),
							baseUrl: settings.ollamaServer
						}
					]);

					delete settings.ollamaServer;
					delete settings.ollamaModel;
					delete settings.ollamaServerStatus;
					delete settings.ollamaModels;
				}

				// Migrate OpenAI server settings
				if (settings.openaiServer) {
					console.warn('Migrating OpenAI server settings');
					serversStore.update((servers) => [
						...servers,
						{
							...getDefaultServer(ConnectionType.OpenAI),
							baseUrl: settings.openaiServer,
							apiKey: settings.openaiApiKey
						}
					]);

					delete settings.openaiServer;
					delete settings.openaiApiKey;
				}

				// Reset the settings store with the removed keys
				localStorage.removeItem(StorageKey.HollamaPreferences);
				settingsStore.set(settings);

				// Ask the user to re-verify the server connections
				toast.warning($LL.serverSettingsUpdated());
			}
		}

		// Color theme
		if (browser && !$settingsStore.userTheme) {
			$settingsStore.userTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light';
		}
	});
</script>

<svelte:head>
	{#if env.PUBLIC_PLAUSIBLE_DOMAIN}
		<script
			defer
			data-domain={env.PUBLIC_PLAUSIBLE_DOMAIN}
			data-api={env.PUBLIC_PLAUSIBLE_API}
			src={env.PUBLIC_PLAUSIBLE_SRC}
		></script>
	{/if}
</svelte:head>

<Toaster
	toastOptions={{
		unstyled: true,
		classes: {
			toast:
				'shadow-xl px-4 py-3 flex items-center gap-x-3 max-w-full w-full rounded mx-auto text-xs mx-0',
			loading: 'bg-shade-0',
			error: 'text-red-50 bg-red-700',
			success: 'text-emerald-50 bg-emerald-700',
			warning: 'text-yellow-50 bg-yellow-700',
			info: 'bg-shade-1 text-neutral-500'
		}
	}}
	position="top-center"
/>

<div class="flex h-dvh w-screen bg-shade-2 lg:p-4">
	<CollapsibleSidebar />
	{@render children()}
</div>

<style lang="postcss">
	:global(html) {
		@apply fixed bg-shade-0 text-base tracking-normal;
		@apply text-base lg:bg-shade-2;
	}
</style>
