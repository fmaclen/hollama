<script lang="ts">
	import { Check, Trash2, X } from 'lucide-svelte';
	import type { Writable } from 'svelte/store';

	import LL from '$i18n/i18n-svelte';
	import { goto } from '$app/navigation';
	import { Sitemap } from '$lib/sitemap';
	import { deleteStoreItem, knowledgeStore, sessionsStore } from '$lib/store';

	import Button from './Button.svelte';

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

<div class="delete-button" class:delete--confirm-deletion={$shouldConfirmDeletion}>
	{#if $shouldConfirmDeletion}
		<Button
			variant="icon"
			class="delete-button__confirm"
			on:click={deleteRecord}
			title={$LL.confirmDeletion()}
		>
			<Check class="h-4 w-4" />
		</Button>

		<Button
			variant="icon"
			class="delete__cancel"
			on:click={() => updateConfirmDeletion(false)}
			title={$LL.dismiss()}
		>
			<X class="h-4 w-4" />
		</Button>
	{:else}
		<Button
			variant="icon"
			class="delete__trash"
			on:click={() => updateConfirmDeletion(true)}
			title={sitemap === Sitemap.KNOWLEDGE ? $LL.deleteKnowledge() : $LL.deleteSession()}
		>
			<Trash2 class="h-4 w-4" />
		</Button>
	{/if}
</div>

<style lang="postcss">
	.delete-button {
		@apply flex h-full flex-row;
	}

	.delete-button :global(.delete-button__confirm) {
		@apply hover:text-negative;
	}
</style>
