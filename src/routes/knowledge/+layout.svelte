<script lang="ts">
	import LL from '$i18n/i18n-svelte';
	import EmptyMessage from '$lib/components/EmptyMessage.svelte';
	import RobotsNoIndex from '$lib/components/RobotsNoIndex.svelte';
	import Section from '$lib/components/Section.svelte';
	import SectionListItem from '$lib/components/SectionListItem.svelte';
	import { knowledgeStore } from '$lib/localStorage';
	import { Sitemap } from '$lib/sitemap';
	import { formatTimestampToNow } from '$lib/utils';
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
			<EmptyMessage>{$LL.emptyKnowledge()}</EmptyMessage>
		{/if}
	</svelte:fragment>

	<slot />
</Section>
