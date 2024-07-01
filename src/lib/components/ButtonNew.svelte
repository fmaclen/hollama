<script lang="ts">
	import { onMount } from "svelte";
	import { generateStorageId } from "$lib/utils";
	import Button from "./Button.svelte";
	import { Sections } from "$lib/section";
	import { generateNewUrl } from "./ButtonNew";

	export let section: Sections;
	let newId: string;

	function setId() {
		newId = generateStorageId();
	}

	onMount(setId);
</script>

<div class="flex gap-x-2 p-6">
	<Button
		data-testid={section === 'sessions' ? 'new-session' : 'new-knowledge'}
		class="w-full"
		variant="outline"
		href={generateNewUrl(section, newId)}
		on:click={setId}
	>
		<!-- TODO: use i18n -->
		{section === 'sessions' ? 'New session' : 'New knowledge'}
	</Button>
</div>
