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
			@apply bg-positive-muted text-positive border-transparent;
		}

		&--warning {
			@apply bg-warning-muted text-warning border-transparent;
		}

		&--negative {
			@apply bg-negative-muted text-negative border-transparent;
		}
	}
</style>
