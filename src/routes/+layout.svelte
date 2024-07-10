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
		['/settings', 'Settings']
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
			<img class="layout__logo" src="/favicon.png" alt="Hollama logo" />
		</a>

		<nav class="layout__nav">
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
		</nav>
	</aside>

	<main class="layout__main">
		<slot />
	</main>
</div>

<style lang="scss">
	:global(body) {
		@apply bg-shade-2 text-base;
	}

	.layout {
		@apply flex h-screen max-h-screen w-screen flex-col overflow-auto;
		@apply lg:flex-row lg:p-4 lg:gap-4;
	}

	.layout__aside {
		@apply flex flex-row items-center gap-4 px-4;
		@apply lg:flex-col lg:items-start;
	}

	.layout__logo {
		height: max-content;
		max-height: 32px;
		min-width: 32px;
	}

	.layout__homepage {
		@apply lg:pt-4;
	}

	.layout__nav {
		@apply flex h-full max-h-full flex-row gap-x-2;
		@apply lg:flex-col;
	}

	.layout__button,
	.layout__a {
		@apply flex flex-col items-start gap-x-2 gap-y-0.5 px-2 py-3 text-sm font-medium text-muted transition-colors duration-150;
		@apply lg:flex-row lg:items-center lg:gap-4;
		@apply hover:text-active;
	}

	.layout__a--active {
		@apply text-active;	
	}

	.layout__button {
		@apply lg:mt-auto;
	}

	.layout__main {
		@apply flex h-full w-full overflow-auto;
	}
</style>
