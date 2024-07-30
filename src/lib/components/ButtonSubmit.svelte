<script lang="ts">
	import Button from './Button.svelte';

	export let handleSubmit;
	export let disabled: boolean | undefined = false;
	export let hasMetaKey: boolean = false;
</script>

<Button class="w-full text-left" on:click={handleSubmit} {disabled}>
	<slot />

	{#if !disabled}
		<span class="tag">
			{hasMetaKey ? (navigator.userAgent.indexOf('Mac') !== -1 ? '⌘' : 'Ctrl') : ''} ↵
		</span>
	{/if}
</Button>

<style lang="postcss">
	.tag {
		@apply ml-2.5 inline-flex items-center rounded-md border border-neutral-50/50 px-2.5 py-0.5 text-xs font-semibold;
	}
</style>
