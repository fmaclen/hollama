<script lang="ts">
	import Field from './Field.svelte';

	export let name: string;
	export let label: string;
	export let placeholder: string | undefined = undefined;
	export let disabled: boolean | undefined = false;
	export let value: string | undefined = undefined;
</script>

<Field {name}>
	<svelte:fragment slot="label">
		{label}

		{#if $$slots.status}
			<div class="field-label-status">
				<slot name="status" />
			</div>
		{/if}
	</svelte:fragment>

	<input class="field-input" id={name} {disabled} {placeholder} bind:value on:keyup />

	<svelte:fragment slot="help">
		<slot name="help" />
	</svelte:fragment>
</Field>

<style lang="postcss">
	.field-input {
		@apply base-input;
	}

	.field-label-status {
		@apply -mt-2 ml-auto max-h-1;
	}
</style>
