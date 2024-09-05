<script lang="ts">
	let className: string | undefined | null = '';
	export let href: string | undefined = undefined;
	export let variant: 'positive' | 'warning' | undefined = undefined;
	export { className as class };
</script>

<svelte:element
	this={href ? 'a' : 'span'}
	class="badge {variant ? `badge--${variant}` : ''} {className}"
	{href}
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
