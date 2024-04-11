<script lang="ts">
	import '../app.pcss';
	import Settings from 'lucide-svelte/icons/settings';
	import Button from '$lib/components/ui/button/button.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { onMount } from 'svelte';
	import { sessionsStore } from '$lib/store';
	import { slide } from 'svelte/transition';

	let newSessionId: string;

	function createNewSession() {
		// Example: `zbvxte`
		newSessionId = Math.random().toString(36).substring(2, 8);
	}

	onMount(createNewSession);
</script>

<div
	class="grid h-screen w-screen grid-cols-[max-content,max-content,280px,max-content,1fr] text-current"
>
	<a href="/" class="flex flex-col items-center justify-between py-4">
		<img src="/favicon.png" alt="Hollama logo" width="56" height="56" />
		<h1 class="logo__wordmark text-2xl font-medium">Hollama</h1>
	</a>

	<Separator orientation="vertical" />

	<aside class="flex h-screen flex-col">
		<div class="flex gap-x-2 p-6">
			<Button variant="outline" size="icon" href="/">
				<Settings class="h-4 w-4" />
			</Button>
			<Button
				class="w-full"
				variant="outline"
				href={`/${newSessionId}`}
				on:click={() => createNewSession()}
			>
				New session
			</Button>
		</div>

		<Separator />

		<div class="flex h-full flex-col py-3 overflow-y-auto">
			{#if $sessionsStore}
				{#each $sessionsStore as session}
					<a
						href={`/${session.id}`}
						class="flex flex-col px-6 py-3"
						aria-label={`Session ${session.id}`}
						transition:slide
					>
						<p class="max-w-full truncate whitespace-nowrap text-sm font-bold">
							{session.messages[0].content}
						</p>
						<p class="flex max-w-full gap-x-2 whitespace-nowrap text-sm truncate text-muted-foreground">
							{session.model}
						</p>
					</a>
				{/each}
			{:else}
				<p class="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
					No sessions in history
				</p>
			{/if}
		</div>
	</aside>

	<Separator orientation="vertical" />

	<slot />
</div>

<style>
	.logo__wordmark {
		width: max-content;
		height: 7ch;
		line-height: 7ch;
		transform: rotate(270deg);
	}
</style>
