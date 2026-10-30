<script lang="ts">
	import { onMount } from 'svelte';

	import { m } from '#lib/paraglide/messages.js';
	import { Sitemap } from '#lib/sitemap.js';
	import { generateRandomId } from '#lib/utils.js';

	import Button from './Button.svelte';
	import { generateNewUrl } from './ButtonNew';

	interface Props {
		sitemap: Sitemap;
	}

	let { sitemap }: Props = $props();
	let newId = $state('');
	let href = $state('');

	function setId() {
		newId = generateRandomId();
		href = generateNewUrl(sitemap, newId);
	}

	onMount(setId);
</script>

<div class="flex gap-x-2">
	<Button
		data-testid={sitemap === Sitemap.SESSIONS ? 'new-session' : 'new-knowledge'}
		class="w-full"
		variant="outline"
		{href}
		onclick={setId}
	>
		{sitemap === Sitemap.SESSIONS ? m.newSession() : m.newKnowledge()}
	</Button>
</div>
