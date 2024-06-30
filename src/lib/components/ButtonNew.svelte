<script lang="ts">
	import { onMount } from "svelte";
	import { generateStorageId } from "$lib/utils";
	import Button from "./Button.svelte";

	export let section: "session" | "knowledge";
	let newId: string;

	function setId() {
		newId = generateStorageId();
	}

	onMount(setId);
</script>

<div class="flex gap-x-2 p-6">
	<Button
		data-testid="new-session"
		class="w-full"
		variant="outline"
		href={`/${section}/${newId}`}
		on:click={setId}
	>
		New {section}
	</Button>
</div>
