<script lang="ts">
	import { Check, Trash2, X } from 'lucide-svelte';

	export let deleteRecord;

	let confirmDeletion: boolean = false;
</script>

<div class="delete {confirmDeletion ? 'delete--confirm-deletion' : ''}">
	{#if confirmDeletion}
		<button class="delete__confirm" on:click={deleteRecord}>
			<Check class="h-4 w-4" />
		</button>

		<button class="delete__cancel" on:click={() => (confirmDeletion = false)}>
			<X class="h-4 w-4" />
		</button>
	{:else}
		<button class="delete__trash" on:click={() => (confirmDeletion = true)}>
			<Trash2 class="h-4 w-4" />
		</button>
	{/if}
</div>

<style lang="scss">
	.delete {
		@apply flex h-full flex-row bg-gradient-to-r from-transparent to-shade-0 py-4 pl-8 pr-4 text-muted;
	}

	.delete--confirm-deletion {
		@apply pl-32 to-red-50;
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
