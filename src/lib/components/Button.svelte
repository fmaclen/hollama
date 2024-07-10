<script lang="ts">
	let className: string | undefined = undefined;
	export { className as class };
	export let variant: 'default' | 'outline' | 'link' | 'icon' | undefined = 'default';
	export let size: 'default' | 'icon' | 'link' | undefined = 'default';
	export let href: string | undefined = undefined;
</script>

{#if href}
	<a
		{...$$restProps}
		{href}
		class="
			button button--{variant}
			button--size-{size}
			{className}
		"
		on:click
	>
		<slot />
	</a>
{:else}
	<button
		{...$$restProps}
		class="button button--{variant} button--size-{size} {className}"
		type="button"
		on:click
	>
		<slot />
	</button>
{/if}

<style lang="scss">
	.button {
		@apply inline-flex items-center justify-center whitespace-nowrap rounded-md;

		&--default,
		&--outline {
			@apply border text-sm font-medium;
			@apply disabled:text-muted disabled:bg-shade-2 disabled:border-shade-2 disabled:pointer-events-none;
		}

		&--default {
			@apply bg-accent border-accent text-shade-0;
		}

		&--outline {
			@apply border-shade-4 hover:border-shade-6;
		}

		&--link {
			@apply rounded-none underline underline-offset-4 hover:text-active;
		}

		&--icon :global(svg) {
			// @apply opacity-25 hover:opacity-50 active:opacity-100;
		}

		&--size {
			&-default {
				@apply h-10 px-4 py-2;
			}

			&-icon {
				@apply h-10 w-10;
			}
		}
	}
</style>
