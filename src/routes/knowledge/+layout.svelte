<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import SectionListItem from '$lib/components/SectionListItem.svelte';
	import { knowledgeStore } from '$lib/store';
	import { Sitemap } from '$lib/sitemap';
	import RobotsNoIndex from '$lib/components/RobotsNoIndex.svelte';
	import { formatDistanceToNow } from 'date-fns';
</script>

<RobotsNoIndex />

<Section sitemap={Sitemap.KNOWLEDGE}>
	<svelte:fragment slot="list-items">
		{#if $knowledgeStore && $knowledgeStore.length > 0}
			{#each $knowledgeStore as knowledge}
				{@const subtitles = [
					formatDistanceToNow(new Date(knowledge.updatedAt), { addSuffix: true })
				]}
				<SectionListItem
					sitemap={Sitemap.KNOWLEDGE}
					id={knowledge.id}
					title={knowledge.name}
					subtitle={subtitles.join(' • ')}
				/>
			{/each}
		{:else}
			<EmptyMessage>No knowledge</EmptyMessage>
		{/if}
	</svelte:fragment>

	<slot />
</Section>
