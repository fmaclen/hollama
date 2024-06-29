<script lang="ts">
	import { env } from '$env/dynamic/public';

	import '../app.pcss';

	import Separator from '$lib/components/Separator.svelte';
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

<div
	class="grid h-screen w-screen grid-cols-[max-content,max-content,280px,max-content,1fr] bg-body text-current"
>
	<aside class="flex flex-col justify-between px-6">
		<a href="/" class="flex flex-col items-center justify-between py-6 hover:bg-accent">
			<img src="/favicon.png" alt="Hollama logo" width="48" height="48" />
		</a>

		<nav class="flex w-max flex-col gap-y-6 text-sm font-semibold">
			<a href="/sessions">Sessions</a>
			<a href="/knowledge">Knowdlege</a>
			<!-- <a href="/motd">MOTD</a> -->
		</nav>

		<a href="/" class="flex flex-col items-center justify-between py-6 hover:bg-accent">
			<h1 class="hollama-wordmark text-2xl font-medium">Hollama</h1>
		</a>
	</aside>

	<Separator orientation="vertical" />

	<slot />
</div>

<style lang="scss">
	.hollama-wordmark {
		width: max-content;
		height: 7ch;
		line-height: 7ch;
		transform: rotate(270deg);
	}
</style>
