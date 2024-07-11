<script lang="ts">
	let className: string | undefined | null = undefined;
	export let href: string | undefined = undefined;
	export let variant: 'default' | 'positive' | 'warning' | undefined = 'default';
	export { className as class };
	export let capitalize: boolean = true;
</script>

<svelte:element
	this={href ? 'a' : 'span'}
	class="badge badge--{variant} {className}"
	{href}
	style={capitalize ? 'text-transform: capitalize;' : ''}
>
	<slot />
</svelte:element>

<style lang="scss">
	.badge {
		@apply inline-flex select-none items-center rounded-md px-2.5 py-0.5 font-mono text-xs;

		&--default {
			@apply border-shade-3 text-muted;
		}

		&--positive {
			@apply bg-positive-muted text-positive;
		}

		&--warning {
			@apply bg-warning-muted text-warning;
		}

		&--negative {
			@apply bg-negative-muted text-negative;
		}
	}
</style>
