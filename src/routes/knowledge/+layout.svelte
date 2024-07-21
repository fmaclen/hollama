<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import SectionListItem from '$lib/components/SectionListItem.svelte';
	import { knowledgeStore, updatePageTitle } from '$lib/store';
	import { Sitemap } from '$lib/sitemap';
	import RobotsNoIndex from '$lib/components/RobotsNoIndex.svelte';
	import { formatTimestampToNow } from '$lib/utils';
	import { page } from '$app/stores';

	// This is necessary for the case in which user is viewing a knowledge and then clicks the Knowledge link at the sidebar
	$: if ($page.url.pathname === '/knowledge') updatePageTitle('Knowledge');
</script>

<RobotsNoIndex />

<Section sitemap={Sitemap.KNOWLEDGE}>
	<svelte:fragment slot="list-items">
		{#if $knowledgeStore && $knowledgeStore.length > 0}
			{#each $knowledgeStore as knowledge}
				<SectionListItem
					sitemap={Sitemap.KNOWLEDGE}
					id={knowledge.id}
					title={knowledge.name}
					subtitle={formatTimestampToNow(knowledge.updatedAt)}
				/>
			{/each}
		{:else}
			<EmptyMessage>No knowledge</EmptyMessage>
		{/if}
	</svelte:fragment>

	<slot />
</Section>
