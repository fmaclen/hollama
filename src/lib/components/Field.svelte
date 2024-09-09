<script lang="ts">
	import { Label } from 'bits-ui';

	export let name: string;
	export let disabled: boolean | undefined = false;
	export let isTextEditor: boolean | undefined = false;
	export let hasNav: boolean | undefined = false;
</script>

<div class="field" class:field--text-editor={isTextEditor} class:field--with-nav={hasNav}>
	<Label.Root
		for={name}
		class="
			field-label-root
			{isTextEditor && 'field-label-root--text-editor'}
			{disabled && 'field-label-root--disabled'}
		"
	>
		{#if $$slots.label}
			<span class="field-label" class:field-label--text-editor={isTextEditor}>
				<slot name="label" />
			</span>
		{/if}

		<slot />
	</Label.Root>

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

	/* Text editor */

	.field--text-editor {
		@apply h-full overflow-y-auto;
	}

	:global(.field-label-root--text-editor) {
		@apply h-full gap-y-0  p-0;
	}

	:global(.field-label--text-editor) {
		@apply border-b border-shade-2 p-3;
	}

	/* Bits UI */

	.field {
		:global(.field-label-root) {
			@apply flex w-full flex-col gap-y-1 rounded-md border bg-shade-0 text-sm;
			@apply focus-within:border-shade-6 focus-within:outline focus-within:outline-shade-2;
		}
		:global(.field-label-root--disabled) {
			@apply bg-shade-1;
		}

		:global(.field-label) {
			@apply flex items-center gap-x-2 px-3 pb-0.5 pt-3 text-xs font-medium leading-none;
		}
	}
</style>
