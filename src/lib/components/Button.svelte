<script lang="ts">
	let className: string | undefined = undefined;
	export { className as class };
	export let variant:
		| 'default'
		| 'outline'
		| 'link'
		| 'icon'
		| undefined = 'default';
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
		// @apply inline-flex items-center justify-cent¿er whitespace-nowrap rounded-md text-sm font-medium text-foreground ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-15;

		&--default,
		&--outline {
			@apply text-sm font-medium border border-transparent;
		}

		&--default {
			// @apply;
		}

		&--outline {
			@apply border-h-border-input;
		}

		&--link {
			@apply underline underline-offset-4 hover:text-h-body-muted border-b-h-body-muted rounded-none;
		}

		&--icon :global(svg) {
			@apply opacity-25 hover:opacity-50 active:opacity-100;
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
