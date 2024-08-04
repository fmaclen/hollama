<script lang="ts">
	export let name: string;
	export let disabled: boolean | undefined = false;
	export let isTextEditor: boolean | undefined = false;
</script>

<div class="field" class:field--text-editor={isTextEditor}>
	<div
		class="field__container"
		class:field__container--text-editor={isTextEditor}
		class:field__container--disabled={disabled}
	>
		{#if $$slots.label}
			<label for={name} class="field__label" class:field__label--text-editor={isTextEditor}>
				<slot name="label" />
			</label>
		{/if}

		<slot />
	</div>

	<slot name="help" />
</div>

<style lang="postcss">
	.field {
		@apply flex flex-col;
	}

	.field__container {
		@apply flex w-full flex-col gap-y-1 rounded-md border bg-shade-0 text-sm;
		@apply focus-within:border-shade-6 focus-within:outline focus-within:outline-shade-2;

		&--disabled {
			@apply bg-shade-1;
		}
	}

	.field__label {
		@apply flex items-center gap-x-2 px-3 pb-0.5 pt-3 text-xs font-medium leading-none;
	}

	/* Text editor */

	.field--text-editor {
		@apply h-full;
	}

	.field__container--text-editor {
		@apply h-full gap-y-0 overflow-y-auto p-0;
	}

	.field__label--text-editor {
		@apply border-b border-shade-2 p-3;
	}
</style>
