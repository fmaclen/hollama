<script lang="ts">
	let className: string | undefined = undefined;
	export { className as class };
	export let name: string;
	export let hasLabel: boolean | undefined = true;
</script>

<div class="field {className ?? ''}">
	{#if hasLabel}
		<label class="field__label" for={name}>
			<slot name="label" />
		</label>
	{/if}

	<slot />
</div>

<style lang="postcss">
	.field {
		@apply flex w-full flex-col gap-y-1 rounded-md border bg-shade-0 p-3 text-sm;
		@apply focus-within:border-shade-6 focus-within:outline focus-within:outline-shade-2;
	}

	.field__label {
		@apply flex items-center gap-x-2 text-xs font-medium leading-none;
	}
</style>
