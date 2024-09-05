<script lang="ts">
	import { Files } from 'lucide-svelte';

	import i18n from '$lib/i18n';

	import Button from './Button.svelte';

	export let content: string;

	function copyContent() {
		navigator.clipboard.writeText(content);
	}
</script>

<div class="copy-button">
	<Button title={$i18n.t('copy')} variant="icon" on:click={copyContent}>
		<Files class="h-4 w-4" />
	</Button>
</div>

<style lang="postcss">
	.copy-button {
		/* Hiding the button by default because this functionality is not supported on mobile devices */
		display: none;

		@media (hover: hover) {
			/* Show the button in devices that support hover (i.e. desktop) */
			display: unset;
		}
	}
</style>
