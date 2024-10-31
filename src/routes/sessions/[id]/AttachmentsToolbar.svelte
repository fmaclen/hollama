<script lang="ts">
	import { Brain } from 'lucide-svelte';

	import Button from '$lib/components/Button.svelte';

	export let onClick: () => void;
</script>

<div class="attachments-toolbar">
	<Button variant="icon" on:click={onClick}>
		<Brain class="base-icon" />
	</Button>
</div>

<style lang="postcss">
	.attachments-toolbar {
		@apply flex h-full w-fit items-center gap-x-2 rounded-md border border-shade-2;
		@apply border border-shade-2 bg-shade-0;
	}
</style>
