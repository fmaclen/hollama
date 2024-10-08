<script lang="ts">
	import type { LocalizedString } from 'typesafe-i18n';

	import Field from './Field.svelte';

	export let name: string;
	export let label: LocalizedString;
	export let placeholder: LocalizedString | string | undefined = undefined;
	export let disabled: boolean | undefined = false;
	export let value: string | number | undefined = undefined;
	export let type: 'text' | 'number' = 'text';

	// Props for numeric inputs
	export let min: number | undefined = undefined;
	export let max: number | undefined = undefined;
	export let step: number | undefined = undefined;
</script>

<Field {name} hasNav={$$slots.nav} {disabled}>
	<svelte:fragment slot="label">
		{label}

		{#if $$slots.status}
			<div class="field-label-status">
				<slot name="status" />
			</div>
		{/if}
	</svelte:fragment>

	{#if type === 'number'}
		<input
			class="field-input"
			id={name}
			{disabled}
			{placeholder}
			type="number"
			{min}
			{max}
			{step}
			bind:value
			on:input
			on:keyup
		/>
	{:else}
		<input
			class="field-input"
			id={name}
			{disabled}
			{placeholder}
			type="text"
			bind:value
			on:input
			on:keyup
		/>
	{/if}

	<svelte:fragment slot="nav">
		<slot name="nav" />
	</svelte:fragment>

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
