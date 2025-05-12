<script lang="ts">
	import { LoaderCircle } from 'lucide-svelte';

	let className: string | undefined = undefined;
	export { className as class };
	export let variant: 'default' | 'outline' | 'link' | 'icon' | undefined = 'default';
	export let href: string | undefined = undefined;
	export let isLoading: boolean | undefined = false;
	export let isActive: boolean | undefined = false;
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
	<button
		{...$$restProps}
		class="button button--{variant} {className}"
		class:button--is-loading={isLoading}
		class:button--is-active={isActive}
		type="button"
		on:click
	>
		<span class="button__icon">
			<LoaderCircle class="base-icon animate-spin" />
		</span>
		<slot />
	</button>
{/if}

<style lang="postcss">
	.button {
		@apply inline-flex items-center justify-center gap-2 rounded-md;

		&--default,
		&--outline {
			@apply border px-3 py-2 text-sm font-medium leading-tight;
			@apply disabled:pointer-events-none disabled:border-shade-2 disabled:bg-shade-2 disabled:text-muted;
		}

		&--default {
			@apply border-accent bg-accent text-neutral-50;
		}

		&--outline {
			@apply border-shade-4 hover:border-shade-6 hover:text-active;
		}

		&--link {
			@apply text-link inline rounded-none;
		}

		&--link[target='_blank']:after {
			content: ' ↗';
		}

		&--icon {
			@apply px-2.5 py-2 text-muted;
			@apply hover:text-active;
		}

		&--is-active {
			@apply text-active;
		}
	}

	/* Loading state */

	:not(.button--is-loading) .button__icon {
		@apply hidden;
	}

	.button--is-loading {
		@apply relative;

		.button__icon {
			@apply flex;
		}
	}

	.button__icon {
		@apply absolute inset-0 flex items-center justify-center bg-shade-2;
	}
</style>
