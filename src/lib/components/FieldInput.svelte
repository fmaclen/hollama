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

	{#if $$slots.help}
		<div class="field-help">
			<slot name="help" />
		</div>
	{/if}
</Field>

<style lang="postcss">
	@import '$lib/mixins.pcss';

	.field-input {
		@mixin base-input;
	}

	.field-label-status {
		@apply ml-auto;
	}

	.field-help {
		@apply flex flex-col gap-y-3 text-sm text-muted;
	}
</style>
