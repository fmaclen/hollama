<script lang="ts">
	import { onMount } from 'svelte';

	import LL from '$i18n/i18n-svelte';
	import { Sitemap } from '$lib/sitemap';
	import { generateRandomId } from '$lib/utils';

	import Button from './Button.svelte';
	import { generateNewUrl } from './ButtonNew';

	export let sitemap: Sitemap;
	let newId: string;
	let href: string;

	function setId() {
		newId = generateRandomId();
		href = generateNewUrl(sitemap, newId);
	}

	onMount(setId);
</script>

<div class="flex gap-x-2 border-b p-6">
	<Button
		data-testid={sitemap === Sitemap.SESSIONS ? 'new-session' : 'new-knowledge'}
		class="w-full"
		variant="outline"
		{href}
		on:click={setId}
	>
		{sitemap === Sitemap.SESSIONS ? $LL.newSession() : $LL.newKnowledge()}
	</Button>
</div>
