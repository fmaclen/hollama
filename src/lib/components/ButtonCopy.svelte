<script lang="ts">
	import { Files } from "lucide-svelte";
	import Button from "./Button.svelte";

	export let content: string;

	function copyContent() {
		navigator.clipboard.writeText(content);
	}
</script>

<div class="copy-button">
	<Button title="Copy" variant="icon" on:click={copyContent}>
		<Files class="h-4 w-4" />
	</Button>
</div>

<style lang="scss">
	.copy-button {
		display: none;

		@media (hover: hover) {
			display: unset;
		}
	}
</style>
