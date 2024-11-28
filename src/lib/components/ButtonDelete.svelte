<script lang="ts">
	import { Check, Trash2, X } from 'lucide-svelte';

	import LL from '$i18n/i18n-svelte';
	import { goto } from '$app/navigation';
	import { deleteStoreItem, knowledgeStore, sessionsStore } from '$lib/localStorage';
	import { Sitemap } from '$lib/sitemap';

	import Button from './Button.svelte';

	interface Props {
		sitemap: Sitemap;
		id: string;
		shouldConfirmDeletion: boolean;
	}

	let { sitemap, id, shouldConfirmDeletion = $bindable() }: Props = $props();

	function deleteRecord() {
		shouldConfirmDeletion = false;

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
		shouldConfirmDeletion = value;
	}
</script>

<div class="delete-button" class:delete--confirm-deletion={shouldConfirmDeletion}>
	{#if shouldConfirmDeletion}
		<Button
			variant="icon"
			class="delete-button__confirm"
			on:click={deleteRecord}
			title={$LL.confirmDeletion()}
		>
			<Check class="base-icon" />
		</Button>

		<Button
			variant="icon"
			class="delete__cancel"
			on:click={() => updateConfirmDeletion(false)}
			title={$LL.dismiss()}
		>
			<X class="base-icon" />
		</Button>
	{:else}
		<Button
			variant="icon"
			class="delete__trash"
			on:click={() => updateConfirmDeletion(true)}
			title={sitemap === Sitemap.KNOWLEDGE ? $LL.deleteKnowledge() : $LL.deleteSession()}
		>
			<Trash2 class="base-icon" />
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
