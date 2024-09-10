<script lang="ts">
	import { Brain, MessageSquareText, Moon, NotebookText, Settings2, Sun } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { Toaster } from 'svelte-sonner';
	import { detectLocale } from 'typesafe-i18n/detectors';

	import LL, { setLocale } from '$i18n/i18n-svelte';
	import { loadLocale } from '$i18n/i18n-util.sync';

	import '../app.pcss';

	import type { Locales } from '$i18n/i18n-types';
	import { env } from '$env/dynamic/public';
	import { browser } from '$app/environment';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { settingsStore } from '$lib/localStorage';
	import { checkForUpdates, updateStatusStore } from '$lib/updates';

	$: pathname = $page.url.pathname;
	const SITEMAP = ['/sessions', '/knowledge', '/settings', '/motd'];

	$: theme = $settingsStore.userTheme;

	onNavigate(async () => {
		// Check for updates whenever the user follows a link (if auto-check is enabled)
		if (!($settingsStore.autoCheckForUpdates === false)) await checkForUpdates();
	});

	onMount(() => {
		if (!$settingsStore.userLanguage)
			$settingsStore.userLanguage = detectLocale('en', ['en', 'es']) as Locales;

		loadLocale($settingsStore.userLanguage);
		setLocale($settingsStore.userLanguage);

		if (!browser || theme) return;
		$settingsStore.userTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light';
	});

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-color-theme', theme);
		$settingsStore.userTheme = theme;
	}
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

<Toaster richColors={true} position="top-center" />

<div class="layout">
	<aside class="layout__aside">
		<a href="/" class="layout__a layout__a--logo">
			<img class="layout__logo" src="/favicon.png" alt="Hollama logo" />
		</a>

		{#each SITEMAP as href}
			<a
				class="layout__a"
				class:layout__a--active={pathname.includes(href)}
				class:layout__a--notification={href === '/settings' &&
					$updateStatusStore.showSidebarNotification}
				{href}
			>
				{#if href === '/knowledge'}
					<Brain class="h-4 w-4" />
					<span class="layout__label">{$LL.knowledge()}</span>
				{:else if href === '/sessions'}
					<MessageSquareText class="h-4 w-4" />
					<span class="layout__label">{$LL.sessions()}</span>
				{:else if href === '/settings'}
					<Settings2 class="h-4 w-4" />
					<span class="layout__label">{$LL.settings()}</span>
				{:else if href === '/motd'}
					<NotebookText class="h-4 w-4" />
					<span class="layout__label">{$LL.motd()}</span>
				{/if}
			</a>
		{/each}

		<button class="layout__button" on:click={toggleTheme}>
			{#if theme === 'light'}
				<Moon class="h-4 w-4" />
				<span class="layout__label">{$LL.dark()}</span>
			{:else}
				<Sun class="h-4 w-4" />
				<span class="layout__label">{$LL.light()}</span>
			{/if}
		</button>
	</aside>

	<main class="layout__main">
		<slot />
	</main>
</div>

<style lang="postcss">
	:global(html) {
		@apply fixed bg-shade-0 text-base tracking-normal;
		@apply text-base lg:bg-shade-2;
	}

	.layout {
		@apply flex h-dvh max-h-dvh w-screen flex-col overflow-auto;
		@apply lg:flex-row lg:gap-4 lg:p-4;
	}

	.layout__aside {
		@apply flex w-full flex-row gap-x-2 px-4;
		@apply lg:flex lg:w-max lg:flex-col;
	}

	.layout__logo {
		@apply max-h-8 min-w-8;
		@apply lg:max-h-10 lg:min-w-10;
	}

	.layout__button,
	.layout__a {
		@apply flex w-auto min-w-0 flex-1 flex-grow flex-col items-center gap-x-2 gap-y-0.5 py-3 text-xs font-medium text-muted transition-colors duration-150;
		@apply sm:text-sm;
		@apply lg:flex-none lg:flex-grow-0 lg:flex-row lg:items-center lg:gap-4 lg:px-2;
		@apply hover:text-active;
	}

	.layout__a--active {
		@apply text-active;
	}

	.layout__a--logo {
		@apply col-start-3 row-start-1 max-w-max;
		@apply md:px-4;
		@apply lg:px-0 lg:py-6;
	}

	.layout__a--notification {
		@apply relative;
	}
	.layout__a--notification::before {
		content: '';
		@apply absolute left-1/2 top-2 h-2 w-2 translate-x-2 rounded-full bg-warning;
		@apply lg:left-0 lg:top-1/2 lg:-translate-x-3 lg:-translate-y-1/2;
	}

	.layout__label {
		@apply w-full truncate text-center;
		@apply lg:text-left;
	}

	.layout__button {
		@apply lg:mt-auto;
	}

	.layout__main {
		@apply flex h-full w-full overflow-auto;
	}
</style>
