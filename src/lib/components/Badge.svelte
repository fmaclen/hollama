<script lang="ts">
	let className: string | undefined | null = undefined;
	export let href: string | undefined = undefined;
	export let variant: 'positive' | 'warning';
	export { className as class };
</script>

<svelte:element
	this={href ? 'a' : 'span'}
	class="badge badge--{variant} {className}"
	{href}
>
	<slot />
</svelte:element>

<style lang="scss">
	.badge {
		@apply inline-flex select-none items-center rounded-md border border-transparent px-2.5 py-0.5 text-xs capitalize bg-h-elevation-4 font-mono;

		&--positive {
			@apply bg-h-positive-bg text-h-positive-fg;
		}

		&--warning {
			@apply bg-h-warning-bg text-h-warning-fg;
		}

		&--negative {
			@apply bg-h-negative-bg text-h-negative-fg;
		}
	}
</style>
