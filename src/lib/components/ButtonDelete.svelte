<script lang="ts">
	import { Sitemap } from '$lib/sitemap';
	import { Check, Trash2, X } from 'lucide-svelte';
	import type { Writable } from 'svelte/store';
	import { knowledgeStore, sessionsStore, deleteStoreItem } from '$lib/store';
	import { goto } from '$app/navigation';

	export let sitemap: Sitemap;
	export let id: string;
	export let shouldConfirmDeletion: Writable<boolean>;

	function deleteRecord() {
		$shouldConfirmDeletion = false;

		switch (sitemap) {
			case Sitemap.KNOWLEDGE:
				if ($knowledgeStore) $knowledgeStore = deleteStoreItem($knowledgeStore, id);
				return goto('/knowledge');

			case Sitemap.SESSIONS:
				if ($sessionsStore) $sessionsStore = deleteStoreItem($sessionsStore, id);
				return goto('/sessions');

			default:
				break;
		}
	}

	function updateConfirmDeletion(value: boolean) {
		$shouldConfirmDeletion = value;
	}
</script>

<div class="delete" class:delete--confirm-deletion={$shouldConfirmDeletion}>
	{#if $shouldConfirmDeletion}
		<button class="delete__confirm" on:click={deleteRecord}>
			<Check class="h-4 w-4" />
		</button>
		<button class="delete__cancel" on:click={() => updateConfirmDeletion(false)}>
			<X class="h-4 w-4" />
		</button>
	{:else}
		<button class="delete__trash" on:click={() => updateConfirmDeletion(true)}>
			<Trash2 class="h-4 w-4" />
		</button>
	{/if}
</div>

<style lang="scss">
	.delete {
		@apply flex h-full flex-row text-muted;
	}

	.delete__cancel,
	.delete__confirm,
	.delete__trash {
		@apply px-2 py-2;
	}

	.delete__confirm {
		@apply hover:text-negative;
	}

	.delete__trash,
	.delete__cancel {
		@apply hover:text-base;
	}
</style>
