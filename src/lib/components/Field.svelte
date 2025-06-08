<script lang="ts">
	import { Label } from 'bits-ui';

	export let name: string;
	export let disabled: boolean | undefined = false;
	export let isTextEditor: boolean | undefined = false;
	export let hasNav: boolean | undefined = false;

	// HACK: This is needed because Svelte named slots can't be conditionally rendered
	// We should be able to remove this once we upgrade to Svelte 5
	// REF https://svelte-5-preview.vercel.app/docs/snippets
	export let isLabelVisible: boolean | undefined = true;
</script>

<div class="field" class:field--text-editor={isTextEditor} class:field--with-nav={hasNav}>
	<div
		class="field-container"
		class:field-container--text-editor={isTextEditor}
		class:field-container--disabled={disabled}
	>
		{#if $$slots.label}
			<Label.Root
				for={name}
				id={`${name}-label`}
				class="field-label-root {isTextEditor
					? 'field-label-root--text-editor'
					: ''} {isLabelVisible ? '' : 'field-label-root--no-label'}"
			>
				<slot name="label" />
			</Label.Root>
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

		&--text-editor {
			@apply overflow-scrollbar flex-grow;
		}
	}

	.field-container {
		@apply flex w-full flex-col gap-y-1 rounded-md border bg-shade-0 text-sm;
		@apply focus-within:border-shade-6 focus-within:outline focus-within:outline-shade-2;

		&--text-editor {
			@apply flex-grow gap-y-0  p-0;
		}

		&--disabled {
			@apply bg-shade-1;
		}
	}

	/* Bits UI */

	:global(.field-label-root) {
		@apply flex items-center gap-x-2 px-3 pb-0.5 pt-3 text-xs font-medium leading-none;
	}

	:global(.field-label-root--no-label) {
		@apply hidden;
	}

	:global(.field-label-root--text-editor) {
		@apply border-b border-shade-2 p-3;
	}
</style>
