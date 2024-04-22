<script lang="ts">
	let className: string | undefined | null = undefined;
	export let href: string | undefined = undefined;
	export let variant: Variant = 'default';
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
		@apply inline-flex select-none items-center rounded-lg border border-transparent px-2.5 py-0.5 text-xs font-semibold capitalize text-primary-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2;

		&--positive {
			@apply bg-emerald-600;
		}

		&--warning {
			@apply bg-yellow-600;
		}
	}
</style>
