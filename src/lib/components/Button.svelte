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

<style lang="scss">
	.button {
		@apply inline-flex items-center justify-center whitespace-nowrap rounded-md;

		&--default,
		&--outline {
			@apply h-10 border px-3 py-2 text-sm font-medium;
			@apply disabled:pointer-events-none disabled:border-shade-2 disabled:bg-shade-2 disabled:text-muted;
		}

		&--default {
			@apply border-accent bg-accent text-shade-0;
		}

		&--outline {
			@apply border-shade-4 hover:border-shade-6;
		}

		&--link {
			@apply rounded-none underline underline-offset-4;
			@apply hover:text-active;
		}

		&--icon {
			@apply px-2 py-2 text-active opacity-40;
			@apply hover:opacity-60;
			@apply active:opacity-100;
		}
	}
</style>
