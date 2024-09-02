<script lang="ts">
	export let name: string;
	export let disabled: boolean | undefined = false;
	export let isTextEditor: boolean | undefined = false;
	export let hasNav: boolean | undefined = false;
</script>

<div class="field" class:field--text-editor={isTextEditor} class:field--with-nav={hasNav}>
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

	<slot name="nav" />
	<slot name="help" />
</div>

<style lang="postcss">
	.field {
		@apply flex flex-col;

		&--with-nav {
			@apply grid grid-cols-[auto,max-content] items-end gap-x-2;
		}
	}

	.field__container {
		@apply flex w-full flex-col gap-y-1 rounded-md border bg-shade-0 text-sm;
		@apply focus-within:focused-outline;

		&--disabled {
			@apply bg-shade-1;
		}
	}

	.field__label {
		@apply flex items-center gap-x-2 px-3 pb-0.5 pt-3 text-xs font-medium leading-none;
	}

	/* Text editor */

	.field--text-editor {
		@apply h-full overflow-y-auto;
	}

	.field__container--text-editor {
		@apply h-full gap-y-0  p-0;
	}

	.field__label--text-editor {
		@apply border-b border-shade-2 p-3;
	}
</style>
