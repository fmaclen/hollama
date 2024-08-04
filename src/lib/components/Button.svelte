<script lang="ts">
	let className: string | undefined = undefined;
	export { className as class };
	export let variant: 'default' | 'outline' | 'link' | 'icon' | undefined = 'default';
	export let href: string | undefined = undefined;
</script>

{#if href}
	<a
		{...$$restProps}
		{href}
		class="
			button button--{variant}
			{className}
		"
		on:click
	>
		<slot />
	</a>
{:else}
	<button {...$$restProps} class="button button--{variant} {className}" type="button" on:click>
		<slot />
	</button>
{/if}

<style lang="postcss">
	.button {
		@apply inline-flex items-center justify-center whitespace-nowrap rounded-md;

		&--default,
		&--outline {
			@apply border px-3 py-2 text-sm font-medium;
			@apply disabled:pointer-events-none disabled:border-shade-2 disabled:bg-shade-2 disabled:text-muted;
		}

		&--default {
			@apply border-accent bg-accent text-neutral-50;
		}

		&--outline {
			@apply border-shade-4 hover:border-shade-6 hover:text-active;
		}

		&--link {
			@apply rounded-none underline underline-offset-4;
			@apply hover:text-active;
		}

		&--icon {
			@apply px-2 py-2 text-muted;
			@apply hover:text-base;
			@apply active:text-active;
		}
	}
</style>
