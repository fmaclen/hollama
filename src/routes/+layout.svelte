<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { page } from '$app/stores';

	import '../app.pcss';

	import Separator from '$lib/components/Separator.svelte';
	import Button from '$lib/components/Button.svelte';

	$: pathname = $page.url.pathname;
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
		<a href="/" class="layout__aside-a">
			<img src="/favicon.png" alt="Hollama logo" width="48" height="48" />

			<h1 class="hollama-wordmark text-2xl font-medium">Hollama</h1>
		</a>
	</aside>

	<Separator orientation="vertical" />

	<main class="layout__main">
		<nav class="layout__nav">
			<Button variant={pathname.includes('/sessions') ? 'secondary' : 'outline'} href="/sessions">
				Sessions
			</Button>
			<Button variant={pathname.includes('/knowledge') ? 'secondary' : 'outline'} href="/knowledge">
				Knowledge
			</Button>
			<Button variant={pathname === '/' ? 'secondary' : 'outline'} href="/">Settings</Button>
		</nav>

		<Separator />

		<slot />
	</main>
</div>

<style lang="scss">
	.hollama-wordmark {
		width: max-content;
		height: 7ch;
		line-height: 7ch;
		transform: rotate(270deg);
	}

	.layout {
		@apply grid h-screen w-screen grid-cols-[max-content,max-content,auto] bg-body text-current;
	}

	.layout__aside {
		@apply flex flex-col justify-between;
	}

	.layout__aside-a {
		@apply flex h-screen flex-col items-center justify-between py-6 hover:bg-accent;
	}

	.layout__main {
		@apply grid grid-rows-[max-content,max-content,auto];
	}

	.layout__nav {
		@apply flex w-max gap-1 px-6 py-3 text-sm font-semibold;
	}
</style>
