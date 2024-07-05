<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import SectionListItem from '$lib/components/SectionListItem.svelte';
	import { knowledgeStore } from '$lib/store';
	import { Sitemap } from '$lib/sitemap';
	import RobotsNoIndex from '$lib/components/RobotsNoIndex.svelte';
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
					subtitle={knowledge.updatedAt}
				/>
			{/each}
		{:else}
			<EmptyMessage>No knowledge</EmptyMessage>
		{/if}
	</svelte:fragment>

	<slot />
</Section>
