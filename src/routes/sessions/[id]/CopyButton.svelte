<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import { Files } from "lucide-svelte";

	export let content: string;
	export let title: string;

	function copyContent() {
		navigator.clipboard.writeText(content);
	}
</script>

<span class="copy-button">
	<Button title={title} variant="icon" size="icon" on:click={copyContent}>
		<Files class="h-4 w-4" />
	</Button>
</span>

<style lang="scss">
	.copy-button {
		@apply opacity-0;

		@media (hover: hover) {
			@apply opacity-40;
			@apply hover:opacity-60;
			@apply active:opacity-100;
		}
	}
</style>
