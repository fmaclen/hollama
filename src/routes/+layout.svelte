<script lang="ts">
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { page } from '$app/stores';
	import { Brain, MessageSquareText, Settings2, Sun, Moon } from 'lucide-svelte';

	import '../app.pcss';
	import { settingsStore } from '$lib/store';

	$: pathname = $page.url.pathname;
	const SITEMAP = [
		['/sessions', 'Sessions'],
		['/knowledge', 'Knowledge'],
		['/settings', 'Settings']
	];

	$: theme = $settingsStore?.userTheme;

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-color-theme', theme);
		settingsStore.update((store) => {
			store!.userTheme = theme;
			return store;
		});
	}

	onMount(() => {
		if (!theme) {
			// Set initial theme based on user's browser preference
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
			theme = prefersDark ? 'dark' : 'light';
		}
		document.documentElement.setAttribute('data-color-theme', theme);
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

	<title>Hollama</title>
</svelte:head>

<div class="layout">
	<aside class="layout__aside">
		<a href="/" class="layout__a layout__a--logo">
			<img class="layout__logo" src="/favicon.png" alt="Hollama logo" />
		</a>

		{#each SITEMAP as [href, text]}
			<a class={`layout__a ${pathname.includes(href) ? 'layout__a--active' : ''}`} {href}>
				{#if href === '/knowledge'}
					<Brain class="h-4 w-4" />
				{:else if href === '/sessions'}
					<MessageSquareText class="h-4 w-4" />
				{:else if href === '/settings'}
					<Settings2 class="h-4 w-4" />
				{/if}
				{text}
			</a>
		{/each}

		<button class="layout__button" on:click={toggleTheme}>
			{#if theme === 'light'}
				<Moon class="h-4 w-4" />
				Dark
			{:else}
				<Sun class="h-4 w-4" />
				Light
			{/if}
		</button>
	</aside>

	<main class="layout__main">
		<slot />
	</main>
</div>

<style lang="scss">
	:global(html) {
		@apply fixed bg-shade-0 text-base tracking-normal;
		@apply text-base lg:bg-shade-2;
	}

	.layout {
		@apply flex h-dvh max-h-dvh w-screen flex-col overflow-auto;
		@apply lg:flex-row lg:gap-4 lg:p-4;
	}

	.layout__aside {
		@apply grid grid-cols-5 justify-between gap-x-2 px-2;
		@apply lg:flex lg:flex-col;
	}

	.layout__logo {
		@apply max-h-8 min-w-8;
		@apply lg:max-h-10 lg:min-w-10;
	}

	.layout__homepage {
		@apply col-start-3 row-start-1 flex items-center;
		@apply lg:py-4;
	}

	.layout__button,
	.layout__a {
		@apply flex flex-col items-center gap-x-2 gap-y-0.5 py-3 text-sm font-medium text-muted transition-colors duration-150;
		@apply lg:flex-row lg:items-center lg:gap-4 lg:px-2;
		@apply hover:text-active;
	}

	.layout__a--active {
		@apply text-active;
	}

	.layout__a--logo {
		@apply col-start-3 row-start-1;
		@apply lg:py-6;
	}

	.layout__button {
		@apply lg:mt-auto;
	}

	.layout__main {
		@apply flex h-full w-full overflow-auto;
	}
</style>
