<script lang="ts">
	import i18n from '$lib/i18n';
	import { onMount } from 'svelte';
	import { generateStorageId } from '$lib/utils';
	import { Sitemap } from '$lib/sitemap';
	import { generateNewUrl } from './ButtonNew';
	import Button from './Button.svelte';

	export let sitemap: Sitemap;
	let newId: string;

	function setId() {
		newId = generateStorageId();
	}

	onMount(setId);
</script>

<div class="flex gap-x-2 p-6">
	<Button
		data-testid={sitemap === Sitemap.SESSIONS ? 'new-session' : 'new-knowledge'}
		class="w-full"
		variant="outline"
		href={generateNewUrl(sitemap, newId)}
		on:click={setId}
	>
		{sitemap === Sitemap.SESSIONS ? $i18n.t('sessionsPage.new') : $i18n.t('knowledgePage.new')}
	</Button>
</div>
