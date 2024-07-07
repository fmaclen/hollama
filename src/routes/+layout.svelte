<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { page } from '$app/stores';
	import { Brain, MessageSquareText, Settings2 } from 'lucide-svelte';

	import '../app.pcss';

	import Separator from '$lib/components/Separator.svelte';

	$: pathname = $page.url.pathname;

	const SITEMAP = [
		['/sessions', 'Sessions'],
		['/knowledge', 'Knowledge'],
		['/', 'Settings']
	];
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
			<img src="/favicon.png" alt="Hollama logo" width="32" height="32" />
		</a>

		<nav class="layout__nav">
			{#each SITEMAP as [href, text]}
				<a class={`layout__a ${pathname === href ? 'layout__a--active' : ''}`} href={href}>
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
	</aside>

	<Separator orientation="vertical" />

	<main class="layout__main">
		<Separator />

		<!-- <slot /> -->
	</main>
</div>

<style lang="scss">
	// .hollama-wordmark {
	// 	width: max-content;
	// 	height: 7ch;
	// 	line-height: 7ch;
	// 	transform: rotate(270deg);
	// }

	:global(body) {
		@apply bg-elevation-100;
		font-family: 'Inter', sans-serif;
	}

	.layout {
		@apply flex h-screen max-h-screen w-screen gap-4 text-current;
	}

	// .layout {
	// 	@apply grid h-screen w-screen grid-cols-[max-content,max-content,auto] bg-body text-current;
	// }

	.layout__aside {
		@apply flex flex-col min-w-32 py-4 px-6;
	}

	.layout__homepage {
		@apply py-4;
	}

	.layout__nav {
		@apply overflow-y-auto max-h-full h-full flex flex-col;
		// height: 2500px;
	}

	.layout__a {
		@apply flex items-center py-3 px-2 gap-4 text-neutral-800/50 font-medium text-sm;

		&:hover,
		&--active {
			@apply text-neutral-800;
		}
	}

	// .layout__aside {
	// 	@apply flex flex-col justify-between;
	// }

	// .layout__aside-a {
	// 	@apply flex h-screen flex-col items-center justify-between py-6 hover:bg-accent;
	// }

	// .layout__main {
	// 	@apply grid grid-rows-[max-content,max-content,auto] h-screen;
	// }

	// .layout__nav {
	// 	@apply flex w-max gap-1 px-6 py-3 text-sm font-semibold;
	// }
</style>
