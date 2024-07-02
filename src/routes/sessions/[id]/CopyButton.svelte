<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import { Files } from "lucide-svelte";

	export let content: string;

	function copyContent() {
		navigator.clipboard.writeText(content);
	}
</script>

<Button title="Copy" variant="icon" size="icon" on:click={copyContent}>
	<Files class="h-4 w-4" />
</Button>
