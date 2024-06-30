<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	import Separator from '$lib/components/Separator.svelte';
	import { sessionsStore } from '$lib/store';
	import { generateStorageId } from '$lib/utils';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import ButtonNew from '$lib/components/ButtonNew.svelte';

	let newSessionId: string;

	function setSessionId() {
		newSessionId = generateStorageId();
	}

	onMount(setSessionId);
</script>

<div class="grid grid-cols-[max-content,max-content,auto]">
	<aside class="flex h-screen min-w-80 flex-col">
		<ButtonNew section="session"></ButtonNew>

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
				<EmptyMessage>No sessions</EmptyMessage>
			{/if}
		</div>
	</aside>

	<Separator orientation="vertical" />

	<slot />
</div>
