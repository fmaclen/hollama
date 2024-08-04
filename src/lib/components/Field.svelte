<script lang="ts">
	export let name: string;
	export let disabled: boolean | undefined = false;
	export let isTextEditor: boolean | undefined = false;
</script>

<div class="field" class:field--text-editor={isTextEditor} class:field--disabled={disabled}>
	{#if $$slots.label}
		<label for={name} class="field__label" class:field__label--text-editor={isTextEditor}>
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

	.field--disabled {
		@apply bg-shade-1;
	}

	.field--text-editor {
		@apply h-full overflow-y-auto p-0 gap-y-0;
	}

	.field__label {
		@apply flex items-center gap-x-2 text-xs font-medium leading-none;
	}

	.field__label--text-editor {
		@apply p-3 border-b border-shade-2;
	}
</style>
