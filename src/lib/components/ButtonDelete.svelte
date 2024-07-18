<script lang="ts">
	import { Check, Trash2, X } from 'lucide-svelte';
	import { confirmDeletionStore } from '$lib/store';

	export let deleteRecord;

	function updateConfirmDeletion(value: boolean) {
		$confirmDeletionStore = value;
	}
</script>

<div class="delete" class:delete--confirm-deletion={$confirmDeletionStore}>
	{#if $confirmDeletionStore}
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

	.delete__trash,
	.delete__confirm {
		@apply hover:text-negative;
	}

	.delete__cancel {
		@apply hover:text-base;
	}
</style>
