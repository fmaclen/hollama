<script lang="ts">
	import { onMount } from 'svelte';

	import i18n from '$lib/i18n';
	import { Sitemap } from '$lib/sitemap';
	import { generateStorageId } from '$lib/utils';

	import Button from './Button.svelte';
	import { generateNewUrl } from './ButtonNew';

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
		{sitemap === Sitemap.SESSIONS ? $i18n.t('newSession') : $i18n.t('newKnowledge')}
	</Button>
</div>
