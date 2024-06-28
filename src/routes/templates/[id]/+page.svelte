<script lang="ts">
	import type { PageData } from '../$types';

	import { loadSystemTemplate, saveSystemTemplate } from '$lib/systemTemplates';
	import Button from '$lib/components/Button.svelte';
	import { getUpdatedAtDate } from '$lib/utils';

	export let data: PageData;

	let systemTemplate = loadSystemTemplate(data.id);
	let { name, content, updated_at } = systemTemplate;

	function handleSubmit() {
		saveSystemTemplate({ id: systemTemplate.id, name, content, updated_at: getUpdatedAtDate() });
	}
</script>

{#if systemTemplate}
	<div class="container">
		<ul>
			<li><a href="/templates">/templates</a></li>
			<li>id: {systemTemplate.id}</li>
			<li>created_at: {systemTemplate.updated_at}</li>
			<li>name: <input class="border border-neutral-500" bind:value={name} /></li>
			<li>
				content:
				<textarea class="border border-neutral-500" bind:value={content}></textarea>
			</li>
		</ul>

		<Button class="w-full" on:click={handleSubmit} disabled={!name && !content}>Save</Button>
	</div>
{/if}
