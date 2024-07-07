<script lang="ts">
	import { onMount } from 'svelte';
	import { env } from '$env/dynamic/public';
	import { page } from '$app/stores';
	import { Brain, MessageSquareText, Settings2, Sun, Moon } from 'lucide-svelte';

	import '../app.pcss';

	$: pathname = $page.url.pathname;
	const SITEMAP = [
		['/sessions', 'Sessions'],
		['/knowledge', 'Knowledge'],
		['/', 'Settings']
	];

	let theme = 'light';

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-color-theme', theme);
	}

	onMount(() => {
		// Set initial theme based on user's browser preference
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		theme = prefersDark ? 'dark' : 'light';
		document.documentElement.setAttribute('data-color-theme', theme);
	});
</script>

<svelte:head>
	{#if env.PUBLIC_PLAUSIBLE_DOMAIN}
		<script
			defer
			data-domain={env.PUBLIC_PLAUSIBLE_DOMAIN}
			src="https://plausible.io/js/script.js"
		></script>
	{/if}

	<title>Hollama</title>
</svelte:head>

<div class="layout">
	<aside class="layout__aside">
		<a href="/" class="layout__homepage">
			<img class="layout__logo" src="/favicon.png" alt="Hollama logo" width="32" height="32" />
		</a>

		<nav class="layout__nav">
			{#each SITEMAP as [href, text]}
				<a class={`layout__a ${pathname === href ? 'layout__a--active' : ''}`} {href}>
					{#if href === '/knowledge'}
						<Brain class="h-4 w-4" />
					{:else if href === '/sessions'}
						<MessageSquareText class="h-4 w-4" />
					{:else if href === '/'}
						<Settings2 class="h-4 w-4" />
					{/if}

					{text}
				</a>
			{/each}
		</nav>
		<nav class="layout__nav layout__nav--bottom">
			<button class="layout__button" on:click={toggleTheme}>
				{#if theme === 'light'}
					<Moon class="h-4 w-4" />
					Dark
				{:else}
					<Sun class="h-4 w-4" />
					Light
				{/if}
			</button>
		</nav>
	</aside>

	<main class="layout__main">
		<!-- <slot /> -->
	</main>
</div>

<style lang="scss">
	:global(body) {
		@apply bg-elevation-100 transition-colors duration-500 dark:bg-elevation-700;
		font-family: 'Inter', sans-serif;
	}

	.layout {
		@apply flex h-screen max-h-screen w-screen gap-4 text-current;
	}

	.layout__aside {
		@apply flex min-w-32 flex-col px-6 py-4;
	}

	.layout__homepage {
		@apply py-4;
	}

	.layout__nav {
		@apply flex h-full max-h-full flex-col overflow-y-auto;

		&--bottom {
			@apply mt-auto h-max;
		}
	}

	.layout__button,
	.layout__a {
		@apply flex items-center gap-4 px-2 py-3 text-sm font-medium text-neutral-800 opacity-50 transition-opacity duration-200 dark:text-neutral-200;

		&:hover,
		&--active {
			@apply opacity-100;
		}
	}

	.layout__main {
		@apply flex h-full border border-l-0 border-neutral-900/10 dark:border-neutral-50/10;
	}
</style>
