<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { slide } from 'svelte/transition';

	import Button from '$lib/components/Button.svelte';
	import Separator from '$lib/components/Separator.svelte';
	import { sessionsStore } from '$lib/store';
	import { Settings } from 'lucide-svelte';
	import { generateStorageId } from '$lib/utils';

	let newSessionId: string;

	function setSessionId() {
		newSessionId = generateStorageId();
	}

	onMount(setSessionId);
</script>

<aside class="flex h-screen flex-col">
	<div class="flex gap-x-2 p-6">
		<Button title="Settings" variant="outline" size="icon" href="/">
			<Settings class="h-4 w-4" />
		</Button>
		<Button
			data-testid="new-session"
			class="w-full"
			variant="outline"
			href={`/sessions/${newSessionId}`}
			on:click={setSessionId}
		>
			New session
		</Button>
	</div>

	<Separator />

	<div class="flex h-full flex-col overflow-y-auto py-3">
		{#if $sessionsStore && $sessionsStore.length > 0}
			<!-- Using slice() to reverse $sessionsStore without affecting the original array -->
			{#each $sessionsStore.slice().reverse() as session (session.id)}
				<a
					data-testid="session-item"
					href={`/sessions/${session.id}`}
					class="
						flex
						flex-col
						px-6
						py-3
						{$page.url.pathname.includes(session.id) ? 'bg-accent' : 'hover:bg-accent'}
					"
					aria-label={`Session ${session.id}`}
					transition:slide
				>
					<p class="max-w-full truncate whitespace-nowrap text-sm font-bold text-foreground">
						{session.messages[0].content}
					</p>
					<p
						class="flex max-w-full gap-x-2 truncate whitespace-nowrap text-sm text-muted-foreground"
					>
						{session.model}
					</p>
				</a>
			{/each}
		{:else}
			<p
				transition:slide
				class="flex h-full w-full items-center justify-center text-sm text-muted-foreground"
			>
				No sessions in history
			</p>
		{/if}
	</div>
</aside>

<Separator orientation="vertical" />

<slot />
