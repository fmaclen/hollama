<script lang="ts">
	let className: string | undefined | null = undefined;
	export let href: string | undefined = undefined;
	export let variant: 'positive' | 'warning' | undefined = undefined;
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

<style lang="postcss">
	.badge {
		&--positive {
			@apply border-transparent bg-positive-muted text-positive;
		}

		&--warning {
			@apply border-transparent bg-warning-muted text-warning;
		}

		&--negative {
			@apply border-transparent bg-negative-muted text-negative;
		}
	}
</style>
