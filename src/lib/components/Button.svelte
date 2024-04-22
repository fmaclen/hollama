<script lang="ts">
	let className: string | undefined = undefined;
	export { className as class };
	export let variant:
		| 'default'
		| 'destructive'
		| 'outline'
		| 'secondary'
		| 'ghost'
		| 'link'
		| 'icon'
		| undefined = 'default';
	export let size: 'default' | 'icon' | undefined = 'default';
	export let href: string | undefined = undefined;
</script>

{#if href}
	<a {...$$restProps} {href} class="button button--{variant} button--size-{size} {className}"><slot /></a>
{:else}
	<button {...$$restProps} class="button button--{variant} button--size-{size} {className}" type="button" on:click>
		<slot />
	</button>
{/if}

<style lang="scss">
	.button {
		@apply inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-foreground;

		&--default {
			@apply bg-primary text-primary-foreground hover:bg-primary/90;
		}

		&--destructive {
			@apply bg-destructive text-destructive-foreground hover:bg-destructive/90;
		}

		&--outline {
			@apply border border-input bg-background hover:bg-accent hover:text-accent-foreground;
		}

		&--secondary {
			@apply bg-secondary text-secondary-foreground hover:bg-secondary/80;
		}

		&--ghost {
			@apply hover:bg-accent hover:text-accent-foreground;
		}

		&--link {
			@apply text-primary underline-offset-4 hover:underline;
		}

		&--icon {
			@apply opacity-25 hover:opacity-100;
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
